import { useMCPClientContext } from '../contexts/MCPClientContext';
import { ServerType } from '../types/mcp';

export function useMCPClient(serverName: ServerType) {
  const { getClient } = useMCPClientContext();
  return getClient(serverName);
}
