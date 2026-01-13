import { ChildProcess } from 'child_process';
import { Writable, Readable } from 'stream';

export interface ServerConfig {
  name: string;
  displayName: string;
  command: string;
  args: string[];
  cwd: string;
  capabilities: string[];
}

export interface ServerInstance {
  name: string;
  config: ServerConfig;
  process: ChildProcess;
  stdin: Writable;
  stdout: Readable;
  stderr: Readable;
  status: 'initializing' | 'ready' | 'error' | 'stopped';
  messageBuffer: MessageLog[];
  pendingRequests: Map<number, PendingRequest>;
  requestIdCounter: number;
  serverCapabilities?: any;  // Capabilities received from the server during initialize
}

export interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export interface MessageLog {
  timestamp: Date;
  direction: 'request' | 'response';
  message: any;
  messageType?: string;
}

export interface JSONRPCRequest {
  jsonrpc: string;
  id?: number;
  method: string;
  params?: any;
}

export interface JSONRPCResponse {
  jsonrpc: string;
  id?: number;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}
