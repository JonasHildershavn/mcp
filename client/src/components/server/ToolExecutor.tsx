import { useState } from 'react';
import { Tool } from '../../types/mcp';
import { useMCPClient } from '../../hooks/useMCPClient';
import { ServerType } from '../../types/mcp';
import { DynamicForm } from './DynamicForm';

interface ToolExecutorProps {
  tool: Tool;
  serverName: ServerType;
}

export function ToolExecutor({ tool, serverName }: ToolExecutorProps) {
  const client = useMCPClient(serverName);
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExecute = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await client.callTool(tool.name, inputs);
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tool execution failed');
    } finally {
      setLoading(false);
    }
  };

  const isValid = () => {
    const required = tool.inputSchema.required || [];
    return required.every(field => inputs[field] !== undefined && inputs[field] !== '');
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="mb-4">
        <h3 className="font-semibold text-lg text-gray-900">{tool.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{tool.description}</p>
      </div>

      <div className="mb-4">
        <DynamicForm schema={tool.inputSchema} onChange={setInputs} />
      </div>

      <button
        onClick={handleExecute}
        disabled={loading || !isValid()}
        className={`
          w-full px-4 py-2 rounded-md font-medium transition-colors
          ${loading || !isValid()
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {loading ? 'Executing...' : 'Execute'}
      </button>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">
            <span className="font-semibold">Error:</span> {error}
          </p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm font-semibold text-green-900 mb-2">Result:</p>
          <ResultDisplay result={result} />
        </div>
      )}
    </div>
  );
}

function ResultDisplay({ result }: { result: any }) {
  if (!result.content || !result.content[0]) {
    return <pre className="text-sm text-gray-700">{JSON.stringify(result, null, 2)}</pre>;
  }

  const content = result.content[0];

  if (content.type === 'text') {
    try {
      const parsed = JSON.parse(content.text);

      // Special handling for calculator results (single numeric result)
      if (parsed.result !== undefined && Object.keys(parsed).length === 1) {
        const value = parsed.result;
        const valueType = typeof value;
        return (
          <div className="space-y-2">
            <div className="text-3xl font-bold text-green-900">{value}</div>
            <div className="text-xs text-gray-500">
              Type: <span className="font-mono">{valueType}</span>
            </div>
          </div>
        );
      }

      // General object display
      return (
        <div className="space-y-2">
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} className="flex items-start">
              <span className="font-medium text-gray-700 min-w-[80px]">{key}:</span>
              <span className="text-gray-900 font-semibold">{String(value)}</span>
            </div>
          ))}
        </div>
      );
    } catch {
      return <pre className="text-sm text-gray-700 whitespace-pre-wrap">{content.text}</pre>;
    }
  }

  return <pre className="text-sm text-gray-700">{JSON.stringify(content, null, 2)}</pre>;
}
