import { useState, useEffect } from 'react';
import { ServerType, Tool, ServerCapabilities } from '../../types/mcp';
import { useMCPClient } from '../../hooks/useMCPClient';
import { useMessageLog } from '../../contexts/MessageLogContext';
import { ToolsList } from './ToolsList';

interface ServerPanelProps {
  serverName: ServerType;
}

export function ServerPanel({ serverName }: ServerPanelProps) {
  const client = useMCPClient(serverName);
  const { fetchAllMessages } = useMessageLog();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<string>('stopped');
  const [isConnected, setIsConnected] = useState(false);
  const [capabilities, setCapabilities] = useState<ServerCapabilities | null>(null);
  const [showCapabilities, setShowCapabilities] = useState(false);

  const serverInfo = {
    calculator: {
      title: 'Calculator Server',
      description: 'Perform mathematical operations using MCP tools',
      color: 'blue'
    },
    notes: {
      title: 'Notes Server',
      description: 'Manage notes with tools and access them as resources',
      color: 'green'
    },
    templates: {
      title: 'Templates Server',
      description: 'Generate code templates and documentation using prompts',
      color: 'orange'
    },
    weather: {
      title: 'Weather Server',
      description: 'Access weather data through tools, resources, and prompts',
      color: 'purple'
    }
  };

  const info = serverInfo[serverName];

  // Check server status
  const checkStatus = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/servers/${serverName}/status`);
      const data = await response.json();
      setServerStatus(data.status);
      setIsConnected(data.status === 'ready');
      setCapabilities(data.capabilities);
    } catch (err) {
      setServerStatus('error');
      setIsConnected(false);
      setCapabilities(null);
    }
  };

  // Connect to server
  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      // Start the server
      const response = await fetch(`http://localhost:4000/api/servers/${serverName}/start`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to start server');
      }

      // Refresh messages immediately
      fetchAllMessages();

      // Load tools
      const toolsList = await client.listTools();
      setTools(toolsList);
      setIsConnected(true);
      setServerStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  // Disconnect from server
  const handleDisconnect = async () => {
    try {
      await fetch(`http://localhost:4000/api/servers/${serverName}/stop`, {
        method: 'POST'
      });
      setIsConnected(false);
      setServerStatus('stopped');
      setTools([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect from server');
    }
  };

  // Check status on mount and when server changes
  useEffect(() => {
    checkStatus();
  }, [serverName]);

  return (
    <div className="h-full overflow-auto">
      {/* Server Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{info.title}</h2>
            <p className="text-gray-600 mt-1">{info.description}</p>
          </div>

          {/* Connection Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                serverStatus === 'ready' ? 'bg-green-500' :
                serverStatus === 'initializing' ? 'bg-yellow-500 animate-pulse' :
                serverStatus === 'error' ? 'bg-red-500' :
                'bg-gray-400'
              }`} />
              <span className="text-sm text-gray-600 capitalize">{serverStatus}</span>
            </div>

            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-white text-sm font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {loading ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Capabilities Section */}
      {isConnected && capabilities && (
        <div className="mb-6">
          <button
            onClick={() => setShowCapabilities(!showCapabilities)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-semibold text-gray-900">Server Capabilities</span>
            </div>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${showCapabilities ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showCapabilities && (
            <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg space-y-3">
              {capabilities.tools && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Tools</div>
                    {capabilities.tools.listChanged && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          listChanged: true
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {capabilities.resources && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Resources</div>
                    <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-2">
                      {capabilities.resources.listChanged && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          listChanged: true
                        </span>
                      )}
                      {capabilities.resources.subscribe && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                          subscribe: true
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {capabilities.prompts && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">Prompts</div>
                    {capabilities.prompts.listChanged && (
                      <div className="text-sm text-gray-600 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          listChanged: true
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!capabilities.tools && !capabilities.resources && !capabilities.prompts && (
                <div className="text-sm text-gray-500 text-center py-2">
                  No capabilities declared
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Not Connected State */}
      {!isConnected && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-blue-900 mb-3">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="font-semibold">Server Not Connected</p>
          </div>
          <p className="text-sm text-blue-700 mb-4">
            Click "Connect" to start the {info.title} and see the MCP handshake in action
          </p>
          <button
            onClick={handleConnect}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Connect to Server
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Connecting to server...</p>
            <p className="text-sm text-gray-500 mt-2">Watch the MCP initialize handshake in the messages panel →</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            <span className="font-semibold">Error:</span> {error}
          </p>
          <p className="text-sm text-red-600 mt-2">
            Make sure the bridge server is running on http://localhost:4000
          </p>
        </div>
      )}

      {/* Tools List */}
      {isConnected && !loading && !error && (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Tools</h3>
            <p className="text-sm text-gray-600 mt-1">
              {tools.length} tool{tools.length !== 1 ? 's' : ''} available
            </p>
          </div>
          <ToolsList tools={tools} serverName={serverName} />
        </div>
      )}
    </div>
  );
}
