import { useState } from 'react';
import { MCPClientProvider } from './contexts/MCPClientContext';
import { MessageLogProvider } from './contexts/MessageLogContext';
import { ServerTabs } from './components/layout/ServerTabs';
import { SplitView } from './components/layout/SplitView';
import { MessagesPanel } from './components/messages/MessagesPanel';
import { ServerPanel } from './components/server/ServerPanel';
import { ServerType } from './types/mcp';

function App() {
  const [activeServer, setActiveServer] = useState<ServerType>('calculator');

  return (
    <MCPClientProvider>
      <MessageLogProvider>
        <div className="h-screen flex flex-col bg-white">
          {/* Header */}
          <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 shadow-lg">
            <h1 className="text-2xl font-bold">MCP Interactive Demo</h1>
            <p className="text-sm text-blue-100 mt-1">
              Real-time Model Context Protocol demonstration
            </p>
          </header>

          {/* Server Tabs */}
          <ServerTabs
            activeServer={activeServer}
            onServerChange={setActiveServer}
          />

          {/* Main Content - Split View */}
          <div className="flex-1 overflow-hidden">
            <SplitView
              left={
                <div className="h-full p-6">
                  <ServerPanel serverName={activeServer} />
                </div>
              }
              right={<MessagesPanel />}
            />
          </div>
        </div>
      </MessageLogProvider>
    </MCPClientProvider>
  );
}

export default App;
