import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { MessageLog, ServerType } from '../types/mcp';

interface MessageLogContextValue {
  messages: MessageLog[];
  fetchAllMessages: () => Promise<void>;
  clearMessages: () => void;
}

const MessageLogContext = createContext<MessageLogContextValue | undefined>(undefined);

interface MessageLogProviderProps {
  children: React.ReactNode;
  bridgeUrl?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function MessageLogProvider({
  children,
  bridgeUrl = 'http://localhost:4000/api',
  autoRefresh = true,
  refreshInterval = 2000
}: MessageLogProviderProps) {
  const [messages, setMessages] = useState<MessageLog[]>([]);

  const fetchAllMessages = useCallback(async () => {
    try {
      const serverNames: ServerType[] = ['calculator', 'notes', 'templates', 'weather'];

      // Fetch messages from all servers in parallel
      const responses = await Promise.all(
        serverNames.map(async (serverName) => {
          try {
            const response = await fetch(`${bridgeUrl}/servers/${serverName}/messages`);
            const data = await response.json();

            // Convert timestamp strings to Date objects and add server name
            return (data.messages || []).map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
              serverName
            }));
          } catch (error) {
            console.error(`Failed to fetch messages for ${serverName}:`, error);
            return [];
          }
        })
      );

      // Flatten and sort all messages by timestamp
      const allMessages = responses.flat().sort((a, b) =>
        a.timestamp.getTime() - b.timestamp.getTime()
      );

      setMessages(allMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  }, [bridgeUrl]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Auto-refresh messages from all servers
  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    // Initial fetch
    fetchAllMessages();

    const interval = setInterval(() => {
      fetchAllMessages();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAllMessages]);

  const value: MessageLogContextValue = {
    messages,
    fetchAllMessages,
    clearMessages
  };

  return (
    <MessageLogContext.Provider value={value}>
      {children}
    </MessageLogContext.Provider>
  );
}

export function useMessageLog(): MessageLogContextValue {
  const context = useContext(MessageLogContext);
  if (!context) {
    throw new Error('useMessageLog must be used within MessageLogProvider');
  }
  return context;
}
