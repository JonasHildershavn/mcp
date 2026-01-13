/**
 * Server Panel with Support for Tools, Resources, and Prompts
 *
 * This component demonstrates all three MCP primitives:
 * - TOOLS: Function calls
 * - RESOURCES: Data access
 * - PROMPTS: Templated interactions (with AI integration)
 */

import { useState, useEffect } from 'react';
import { ServerType, Tool, Resource, Prompt, ServerCapabilities } from '../../types/mcp';
import { useMCPClient } from '../../hooks/useMCPClient';
import { useMessageLog } from '../../contexts/MessageLogContext';
import { ToolsList } from './ToolsList';
import { ResourcesList } from './ResourcesList';
import { PromptsList } from './PromptsList';

interface ServerPanelProps {
  serverName: ServerType;
}

type TabType = 'tools' | 'resources' | 'prompts';

export function ServerPanel({ serverName }: ServerPanelProps) {
  const client = useMCPClient(serverName);
  const { fetchAllMessages } = useMessageLog();
  const [tools, setTools] = useState<Tool[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('tools');
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
      description: 'Generate code templates and documentation using prompts with AI',
      color: 'orange'
    },
    weather: {
      title: 'Weather Server',
      description: 'Access weather data through tools, resources, and AI-powered prompts',
      color: 'purple'
    }
  };

  const info = serverInfo[serverName];

  // Load primitives based on server's advertised capabilities
  const loadServerPrimitives = async (serverCapabilities: ServerCapabilities | null) => {
    try {
      // Only fetch primitives that the server advertises support for
      const promises: Promise<any>[] = [];
      const primitiveTypes: ('tools' | 'resources' | 'prompts')[] = [];

      if (serverCapabilities?.tools) {
        promises.push(client.listTools().catch(() => []));
        primitiveTypes.push('tools');
      } else {
        setTools([]);
      }

      if (serverCapabilities?.resources) {
        promises.push(client.listResources().catch(() => []));
        primitiveTypes.push('resources');
      } else {
        setResources([]);
      }

      if (serverCapabilities?.prompts) {
        promises.push(client.listPrompts().catch(() => []));
        primitiveTypes.push('prompts');
      } else {
        setPrompts([]);
      }

      const results = await Promise.all(promises);

      // Assign results to the correct state based on what we fetched
      let resultIndex = 0;
      primitiveTypes.forEach((type) => {
        const data = results[resultIndex++];
        if (type === 'tools') setTools(data);
        else if (type === 'resources') setResources(data);
        else if (type === 'prompts') setPrompts(data);
      });

      // Set default tab based on what's available
      if (serverCapabilities?.tools) setActiveTab('tools');
      else if (serverCapabilities?.resources) setActiveTab('resources');
      else if (serverCapabilities?.prompts) setActiveTab('prompts');
    } catch (err) {
      console.error('Failed to load server primitives:', err);
    }
  };

  const checkStatus = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/servers/${serverName}/status`);
      const data = await response.json();
      setServerStatus(data.status);
      setCapabilities(data.capabilities);

      // If server is already ready, load its primitives
      if (data.status === 'ready') {
        setIsConnected(true);
        await loadServerPrimitives(data.capabilities);
      } else {
        setIsConnected(false);
        // Clear primitives if server is not ready
        setTools([]);
        setResources([]);
        setPrompts([]);
      }
    } catch (err) {
      setServerStatus('error');
      setIsConnected(false);
      setCapabilities(null);
      setTools([]);
      setResources([]);
      setPrompts([]);
    }
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:4000/api/servers/${serverName}/start`, {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to start server');
      }

      fetchAllMessages();

      // Fetch capabilities first, then load primitives based on them
      const statusResponse = await fetch(`http://localhost:4000/api/servers/${serverName}/status`);
      const statusData = await statusResponse.json();
      setCapabilities(statusData.capabilities);

      // Load primitives based on server's capabilities
      await loadServerPrimitives(statusData.capabilities);

      setIsConnected(true);
      setServerStatus('ready');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to server');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await fetch(`http://localhost:4000/api/servers/${serverName}/stop`, {
        method: 'POST'
      });
      setIsConnected(false);
      setServerStatus('stopped');
      setTools([]);
      setResources([]);
      setPrompts([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect from server');
    }
  };

  useEffect(() => {
    checkStatus();
  }, [serverName]);

  const tabs = [
    { id: 'tools' as TabType, label: 'Tools', count: tools.length, icon: '🔧', available: tools.length > 0 },
    { id: 'resources' as TabType, label: 'Resources', count: resources.length, icon: '📦', available: resources.length > 0 },
    { id: 'prompts' as TabType, label: 'Prompts', count: prompts.length, icon: '📝', available: prompts.length > 0 }
  ];

  return (
    <div className="h-full overflow-auto">
      {/* Server Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{info.title}</h2>
            <p className="text-gray-600 mt-1">{info.description}</p>
          </div>

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

      {/* Capabilities */}
      {isConnected && capabilities && (
        <div className="mb-6">
          <button
            onClick={() => setShowCapabilities(!showCapabilities)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
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
            <div className="mt-2 p-4 bg-white border border-gray-200 rounded-lg">
              <pre className="text-xs text-gray-700 font-mono">
                {JSON.stringify(capabilities, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Not Connected */}
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

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Connecting to server...</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}

      {/* Content Tabs */}
      {isConnected && !loading && !error && (
        <div>
          {/* Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  disabled={!tab.available}
                  className={`px-4 py-2 border-b-2 transition-colors font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : tab.available
                      ? 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                      : 'border-transparent text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                  {tab.count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'tools' && <ToolsList tools={tools} serverName={serverName} />}
            {activeTab === 'resources' && <ResourcesList resources={resources} serverName={serverName} />}
            {activeTab === 'prompts' && <PromptsList prompts={prompts} serverName={serverName} />}
          </div>
        </div>
      )}
    </div>
  );
}
