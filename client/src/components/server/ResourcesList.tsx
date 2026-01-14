/**
 * Resources List Component
 *
 * Displays available MCP resources from a server and allows users to:
 * - Browse available resources
 * - Read resource content
 * - View educational information about resources
 */

import { useState } from 'react';
import { Resource, ServerType } from '../../types/mcp';
import { BridgeMCPClient } from '../../services/BridgeMCPClient';

interface ResourcesListProps {
  resources: Resource[];
  serverName: ServerType;
}

export function ResourcesList({ resources, serverName }: ResourcesListProps) {
  const [expandedResource, setExpandedResource] = useState<string | null>(null);
  const [resourceContent, setResourceContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const client = new BridgeMCPClient('http://localhost:4000/api', serverName);

  const handleReadResource = async (resource: Resource) => {
    setLoading(resource.uri);
    setError(null);

    try {
      const result = await client.readResource(resource.uri);

      // Parse content
      let content = result.contents[0]?.text;
      if (content) {
        try {
          content = JSON.parse(content);
        } catch {
          // Keep as string if not JSON
        }
      }

      setResourceContent(prev => ({
        ...prev,
        [resource.uri]: content
      }));
      setExpandedResource(resource.uri);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read resource');
    } finally {
      setLoading(null);
    }
  };

  if (resources.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No resources available on this server</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Educational Info */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex gap-3">
          <span className="text-2xl">💡</span>
          <div className="flex-1">
            <h4 className="font-semibold text-green-900 mb-1">About MCP Resources</h4>
            <p className="text-sm text-green-800">
              Resources are data that servers expose to clients. They can be files, database records,
              API responses, or any structured data. Click a resource to view its content.
            </p>
          </div>
        </div>
      </div>

      {resources.map((resource) => {
        const isExpanded = expandedResource === resource.uri;
        const isLoading = loading === resource.uri;
        const content = resourceContent[resource.uri];

        return (
          <div
            key={resource.uri}
            className="border border-gray-200 rounded-lg overflow-hidden hover:border-green-300 transition-colors bg-white"
          >
            {/* Resource Header */}
            <button
              onClick={() => {
                if (isExpanded) {
                  setExpandedResource(null);
                } else if (content) {
                  setExpandedResource(resource.uri);
                } else {
                  handleReadResource(resource);
                }
              }}
              disabled={isLoading}
              className="w-full p-4 flex items-start justify-between hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
            >
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📦</span>
                  <h4 className="font-semibold text-gray-900">{resource.name}</h4>
                </div>
                {resource.description && (
                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <code className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded font-mono">
                    {resource.uri}
                  </code>
                  {resource.mimeType && (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {resource.mimeType}
                    </span>
                  )}
                </div>
              </div>
              {isLoading ? (
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </button>

            {/* Expanded Content */}
            {isExpanded && content && (
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="bg-white rounded-lg border border-gray-200 p-4 max-h-96 overflow-auto">
                  {typeof content === 'object' ? (
                    <pre className="text-sm text-gray-900 font-mono whitespace-pre-wrap">
                      {JSON.stringify(content, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-sm text-gray-900 whitespace-pre-wrap">
                      {content}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  );
}
