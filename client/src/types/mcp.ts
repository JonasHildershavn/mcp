export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export interface Resource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface Prompt {
  name: string;
  description: string;
  arguments?: {
    name: string;
    description: string;
    required: boolean;
  }[];
}

export interface ToolResult {
  content: {
    type: string;
    text: string;
  }[];
}

export interface ResourceContent {
  contents: {
    uri: string;
    mimeType?: string;
    text?: string;
  }[];
}

export interface PromptMessage {
  role: string;
  content: {
    type: string;
    text: string;
  };
}

export interface MessageLog {
  timestamp: Date;
  direction: 'request' | 'response';
  message: any;
  messageType?: string;
  serverName: string;
}

export type ServerType = 'calculator' | 'notes' | 'templates' | 'weather';

export interface ServerMetadata {
  id: string;
  name: string;
  capabilities: string[];
  status: string;
  color: string;
}

export interface ServerCapabilities {
  tools?: {
    listChanged?: boolean;
  };
  resources?: {
    listChanged?: boolean;
    subscribe?: boolean;
  };
  prompts?: {
    listChanged?: boolean;
  };
  logging?: {};
  experimental?: Record<string, any>;
}
