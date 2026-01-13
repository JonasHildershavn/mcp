import { Tool, Resource, Prompt, ToolResult, ResourceContent, PromptMessage } from '../types/mcp';

export class BridgeMCPClient {
  private bridgeUrl: string;
  private serverName: string;

  constructor(bridgeUrl: string, serverName: string) {
    this.bridgeUrl = bridgeUrl;
    this.serverName = serverName;
  }

  async listTools(): Promise<Tool[]> {
    const response = await fetch(
      `${this.bridgeUrl}/servers/${this.serverName}/tools/list`,
      { method: 'POST' }
    );
    const data = await response.json();
    return data.result?.tools || [];
  }

  async callTool(name: string, args: any): Promise<ToolResult> {
    const response = await fetch(
      `${this.bridgeUrl}/servers/${this.serverName}/tools/call`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, arguments: args })
      }
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Tool execution failed');
    }

    return data.result;
  }

  async listResources(): Promise<Resource[]> {
    const response = await fetch(
      `${this.bridgeUrl}/servers/${this.serverName}/resources/list`,
      { method: 'POST' }
    );
    const data = await response.json();
    return data.result?.resources || [];
  }

  async readResource(uri: string): Promise<ResourceContent> {
    const response = await fetch(
      `${this.bridgeUrl}/servers/${this.serverName}/resources/read`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uri })
      }
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Resource read failed');
    }

    return data.result;
  }

  async listPrompts(): Promise<Prompt[]> {
    const response = await fetch(
      `${this.bridgeUrl}/servers/${this.serverName}/prompts/list`,
      { method: 'POST' }
    );
    const data = await response.json();
    return data.result?.prompts || [];
  }

  async getPrompt(name: string, args?: any): Promise<{ messages: PromptMessage[] }> {
    const response = await fetch(
      `${this.bridgeUrl}/servers/${this.serverName}/prompts/get`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, arguments: args })
      }
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || 'Prompt get failed');
    }

    return data.result;
  }
}
