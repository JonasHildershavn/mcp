import { spawn, ChildProcess } from 'child_process';
import { ServerConfig, ServerInstance, JSONRPCRequest, JSONRPCResponse, MessageLog, PendingRequest } from './types.js';
import { createLogger, format, transports } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`)
  ),
  transports: [new transports.Console()]
});

export class ServerManager {
  private servers = new Map<string, ServerInstance>();
  private configs: Map<string, ServerConfig>;
  private readonly MAX_MESSAGES = 50;

  constructor(configs: Record<string, ServerConfig>) {
    this.configs = new Map(Object.entries(configs));
  }

  async startServer(name: string): Promise<void> {
    if (this.servers.has(name)) {
      const server = this.servers.get(name)!;
      if (server.status === 'ready') {
        logger.info(`Server ${name} is already running`);
        return;
      }
    }

    const config = this.configs.get(name);
    if (!config) {
      throw new Error(`Server configuration not found: ${name}`);
    }

    logger.info(`Starting server: ${name}`);

    const child = spawn(config.command, config.args, {
      cwd: config.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env }
    });

    if (!child.stdin || !child.stdout || !child.stderr) {
      throw new Error(`Failed to create stdio streams for server: ${name}`);
    }

    const instance: ServerInstance = {
      name,
      config,
      process: child,
      stdin: child.stdin,
      stdout: child.stdout,
      stderr: child.stderr,
      status: 'initializing',
      messageBuffer: [],
      pendingRequests: new Map(),
      requestIdCounter: 1
    };

    this.servers.set(name, instance);
    this.setupStreamHandlers(instance);

    // Send initialize handshake
    try {
      logger.info(`Sending initialize request to ${name}`);
      const initRequest: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: instance.requestIdCounter++,
        method: 'initialize',
        params: {
          protocolVersion: '2024-11-05',
          capabilities: {},
          clientInfo: {
            name: 'mcp-bridge',
            version: '1.0.0'
          }
        }
      };

      const initResponse = await this.sendRequestInternal(instance, initRequest);

      if (initResponse.error) {
        throw new Error(`Initialize failed: ${initResponse.error.message}`);
      }

      // Store server capabilities from the initialize response
      if (initResponse.result?.capabilities) {
        instance.serverCapabilities = initResponse.result.capabilities;
        logger.info(`Server ${name} capabilities: ${JSON.stringify(instance.serverCapabilities)}`);
      }

      logger.info(`Server ${name} initialized successfully, sending initialized notification`);

      // Send initialized notification (required by MCP protocol)
      // This has no 'id' field since notifications don't expect responses
      const initializedNotification = {
        jsonrpc: '2.0',
        method: 'notifications/initialized'
      };

      const notificationStr = JSON.stringify(initializedNotification) + '\n';
      instance.stdin.write(notificationStr);

      // Log the notification for educational purposes
      this.logMessage(instance, 'request', initializedNotification);

      logger.info(`Sent initialized notification to ${name}`);
      instance.status = 'ready';
    } catch (error) {
      logger.error(`Failed to initialize ${name}: ${error}`);
      instance.status = 'error';
      throw error;
    }

    logger.info(`Server ${name} is ready`);
  }

  private setupStreamHandlers(instance: ServerInstance): void {
    let buffer = '';

    instance.stdout.on('data', (data) => {
      buffer += data.toString();

      // Process complete JSON-RPC messages (newline-delimited)
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          try {
            const message = JSON.parse(line);
            this.handleStdoutMessage(instance, message);
          } catch (error) {
            logger.error(`Failed to parse JSON from ${instance.name}: ${line}`);
          }
        }
      }
    });

    instance.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        logger.info(`[${instance.name}] ${message}`);
      }
    });

    instance.process.on('exit', (code) => {
      logger.warn(`Server ${instance.name} exited with code ${code}`);
      instance.status = 'stopped';

      // Reject all pending requests
      for (const [id, pending] of instance.pendingRequests) {
        clearTimeout(pending.timeout);
        pending.reject(new Error(`Server ${instance.name} exited unexpectedly`));
      }
      instance.pendingRequests.clear();
    });

    instance.process.on('error', (error) => {
      logger.error(`Server ${instance.name} error: ${error.message}`);
      instance.status = 'error';
    });
  }

  private handleStdoutMessage(instance: ServerInstance, message: any): void {
    // Log the message
    this.logMessage(instance, 'response', message);

    // If it's a response to a request, resolve the pending promise
    if (message.id !== undefined) {
      const pending = instance.pendingRequests.get(message.id);
      if (pending) {
        clearTimeout(pending.timeout);
        instance.pendingRequests.delete(message.id);
        pending.resolve(message);
      }
    }
  }

  private logMessage(instance: ServerInstance, direction: 'request' | 'response', message: any): void {
    // Determine message type for color coding
    let messageType = 'unknown';
    if (message.method) {
      messageType = message.method; // e.g., 'initialize', 'tools/list', 'tools/call'
    } else if (message.result !== undefined) {
      messageType = 'response';
    } else if (message.error !== undefined) {
      messageType = 'error';
    }

    const log: MessageLog = {
      timestamp: new Date(),
      direction,
      message,
      messageType
    };

    instance.messageBuffer.push(log);

    // Keep only last MAX_MESSAGES
    if (instance.messageBuffer.length > this.MAX_MESSAGES) {
      instance.messageBuffer.shift();
    }
  }

  private async sendRequestInternal(server: ServerInstance, request: JSONRPCRequest): Promise<JSONRPCResponse> {
    // Assign an ID if not present
    if (request.id === undefined) {
      request.id = server.requestIdCounter++;
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        server.pendingRequests.delete(request.id!);
        reject(new Error(`Request timeout for ${server.name}`));
      }, 30000);

      server.pendingRequests.set(request.id!, { resolve, reject, timeout });

      // Log the request
      this.logMessage(server, 'request', request);

      // Send the request
      const requestStr = JSON.stringify(request) + '\n';
      server.stdin.write(requestStr, (error) => {
        if (error) {
          clearTimeout(timeout);
          server.pendingRequests.delete(request.id!);
          reject(new Error(`Failed to write to ${server.name}: ${error.message}`));
        }
      });
    });
  }

  async sendRequest(name: string, request: JSONRPCRequest): Promise<JSONRPCResponse> {
    let server = this.servers.get(name);

    if (!server || server.status !== 'ready') {
      await this.startServer(name);
      server = this.servers.get(name)!;
    }

    return this.sendRequestInternal(server, request);
  }

  getMessages(name: string, limit: number = 50): MessageLog[] {
    const server = this.servers.get(name);
    if (!server) {
      return [];
    }
    return server.messageBuffer.slice(-limit);
  }

  getServerStatus(name: string): string {
    const server = this.servers.get(name);
    return server ? server.status : 'stopped';
  }

  getServerCapabilities(name: string): any {
    const server = this.servers.get(name);
    return server?.serverCapabilities || null;
  }

  async stopServer(name: string): Promise<void> {
    const server = this.servers.get(name);
    if (!server) {
      return;
    }

    logger.info(`Stopping server: ${name}`);
    server.process.kill('SIGTERM');

    // Wait for graceful shutdown
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (server.status !== 'stopped') {
      server.process.kill('SIGKILL');
    }

    this.servers.delete(name);
  }

  async stopAll(): Promise<void> {
    const names = Array.from(this.servers.keys());
    await Promise.all(names.map(name => this.stopServer(name)));
  }
}
