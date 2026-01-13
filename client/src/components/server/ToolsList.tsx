import { useState } from 'react';
import { Tool, ServerType } from '../../types/mcp';
import { ToolExecutor } from './ToolExecutor';

interface ToolsListProps {
  tools: Tool[];
  serverName: ServerType;
}

export function ToolsList({ tools, serverName }: ToolsListProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  if (tools.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No tools available for this server</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {tools.map((tool) => {
          const isSelected = selectedTool === tool.name;

          return (
            <div key={tool.name}>
              <button
                onClick={() => setSelectedTool(isSelected ? null : tool.name)}
                className={`
                  w-full text-left px-4 py-3 rounded-lg border-2 transition-all
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                    <p className="text-sm text-gray-600 mt-0.5">{tool.description}</p>
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${isSelected ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {isSelected && (
                <div className="mt-3 ml-4">
                  <ToolExecutor tool={tool} serverName={serverName} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
