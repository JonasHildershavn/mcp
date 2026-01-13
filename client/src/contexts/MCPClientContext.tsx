import React, { createContext, useContext, useMemo } from 'react';
import { BridgeMCPClient } from '../services/BridgeMCPClient';
import { ServerType } from '../types/mcp';

interface MCPClientContextValue {
  getClient: (serverName: ServerType) => BridgeMCPClient;
  bridgeUrl: string;
}

const MCPClientContext = createContext<MCPClientContextValue | undefined>(undefined);

interface MCPClientProviderProps {
  children: React.ReactNode;
  bridgeUrl?: string;
}

export function MCPClientProvider({ children, bridgeUrl = 'http://localhost:4000/api' }: MCPClientProviderProps) {
  const clients = useMemo(() => {
    const clientMap = new Map<ServerType, BridgeMCPClient>();

    const serverNames: ServerType[] = ['calculator', 'notes', 'templates', 'weather'];
    serverNames.forEach(name => {
      clientMap.set(name, new BridgeMCPClient(bridgeUrl, name));
    });

    return clientMap;
  }, [bridgeUrl]);

  const getClient = (serverName: ServerType): BridgeMCPClient => {
    const client = clients.get(serverName);
    if (!client) {
      throw new Error(`Client not found for server: ${serverName}`);
    }
    return client;
  };

  const value: MCPClientContextValue = {
    getClient,
    bridgeUrl
  };

  return (
    <MCPClientContext.Provider value={value}>
      {children}
    </MCPClientContext.Provider>
  );
}

export function useMCPClientContext(): MCPClientContextValue {
  const context = useContext(MCPClientContext);
  if (!context) {
    throw new Error('useMCPClientContext must be used within MCPClientProvider');
  }
  return context;
}
