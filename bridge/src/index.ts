import express, { Request, Response } from 'express';
import cors from 'cors';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { ServerManager } from './ServerManager.js';
import { ServerConfig } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 4000;

// Load server configurations
const configPath = join(__dirname, '../config/servers.json');
const serversConfig: Record<string, ServerConfig> = JSON.parse(readFileSync(configPath, 'utf-8'));

// Initialize ServerManager
const serverManager = new ServerManager(serversConfig);

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// List all available servers
app.get('/api/servers', (req, res) => {
  const servers = Object.entries(serversConfig).map(([key, config]) => ({
    id: key,
    name: config.displayName,
    capabilities: config.capabilities,
    status: serverManager.getServerStatus(key)
  }));
  res.json({ servers });
});

// Get server status
app.get('/api/servers/:name/status', (req, res) => {
  const { name } = req.params;
  const status = serverManager.getServerStatus(name);
  const capabilities = serverManager.getServerCapabilities(name);
  res.json({ server: name, status, capabilities });
});

// Start a server
app.post('/api/servers/:name/start', async (req, res) => {
  const { name } = req.params;
  try {
    await serverManager.startServer(name);
    res.json({ server: name, status: 'ready', message: 'Server started successfully' });
  } catch (error) {
    res.status(500).json({
      server: name,
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to start server'
    });
  }
});

// Stop a server
app.post('/api/servers/:name/stop', async (req, res) => {
  const { name } = req.params;
  try {
    await serverManager.stopServer(name);
    res.json({ server: name, status: 'stopped', message: 'Server stopped successfully' });
  } catch (error) {
    res.status(500).json({
      server: name,
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to stop server'
    });
  }
});

// Get recent messages
app.get('/api/servers/:name/messages', (req, res) => {
  const { name } = req.params;
  const limit = parseInt(req.query.limit as string) || 50;
  const messages = serverManager.getMessages(name, limit);
  res.json({ server: name, messages });
});

// Generic request handler
app.post('/api/servers/:name/request', async (req, res) => {
  const { name } = req.params;
  const request = req.body;

  try {
    const response = await serverManager.sendRequest(name, request);
    res.json(response);
  } catch (error) {
    console.error(`Error handling request for ${name}:`, error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
        data: { server: name }
      }
    });
  }
});

// Tools endpoints
app.post('/api/servers/:name/tools/list', async (req, res) => {
  const { name } = req.params;

  try {
    const response = await serverManager.sendRequest(name, {
      jsonrpc: '2.0',
      method: 'tools/list'
    });
    res.json(response);
  } catch (error) {
    console.error(`Error listing tools for ${name}:`, error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      }
    });
  }
});

app.post('/api/servers/:name/tools/call', async (req, res) => {
  const { name } = req.params;
  const { name: toolName, arguments: args } = req.body;

  try {
    const response = await serverManager.sendRequest(name, {
      jsonrpc: '2.0',
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    });
    res.json(response);
  } catch (error) {
    console.error(`Error calling tool ${toolName} on ${name}:`, error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      }
    });
  }
});

// Resources endpoints
app.post('/api/servers/:name/resources/list', async (req, res) => {
  const { name } = req.params;

  try {
    const response = await serverManager.sendRequest(name, {
      jsonrpc: '2.0',
      method: 'resources/list'
    });
    res.json(response);
  } catch (error) {
    console.error(`Error listing resources for ${name}:`, error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      }
    });
  }
});

app.post('/api/servers/:name/resources/read', async (req, res) => {
  const { name } = req.params;
  const { uri } = req.body;

  try {
    const response = await serverManager.sendRequest(name, {
      jsonrpc: '2.0',
      method: 'resources/read',
      params: { uri }
    });
    res.json(response);
  } catch (error) {
    console.error(`Error reading resource ${uri} on ${name}:`, error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      }
    });
  }
});

// Prompts endpoints
app.post('/api/servers/:name/prompts/list', async (req, res) => {
  const { name } = req.params;

  try {
    const response = await serverManager.sendRequest(name, {
      jsonrpc: '2.0',
      method: 'prompts/list'
    });
    res.json(response);
  } catch (error) {
    console.error(`Error listing prompts for ${name}:`, error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      }
    });
  }
});

app.post('/api/servers/:name/prompts/get', async (req, res) => {
  const { name } = req.params;
  const { name: promptName, arguments: args } = req.body;

  try {
    const response = await serverManager.sendRequest(name, {
      jsonrpc: '2.0',
      method: 'prompts/get',
      params: {
        name: promptName,
        arguments: args
      }
    });
    res.json(response);
  } catch (error) {
    console.error(`Error getting prompt ${promptName} on ${name}:`, error);
    res.status(500).json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error'
      }
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  await serverManager.stopAll();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nShutting down...');
  await serverManager.stopAll();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`MCP Bridge Server running on http://localhost:${PORT}`);
  console.log(`Available servers: ${Object.keys(serversConfig).join(', ')}`);
});
