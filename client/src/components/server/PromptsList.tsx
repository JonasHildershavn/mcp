/**
 * Prompts List Component
 *
 * Displays available MCP prompts from a server and allows users to:
 * - View prompt templates
 * - Fill in arguments
 * - Process with AI (if configured)
 * - See educational information about prompts
 */

import { useState } from 'react';
import { Prompt, PromptMessage, ServerType } from '../../types/mcp';
import { BridgeMCPClient } from '../../services/BridgeMCPClient';
import { AIPromptProcessor } from '../ai/AIPromptProcessor';
import { getAIService } from '../../services/AIService';
import { DynamicForm } from './DynamicForm';

interface PromptsListProps {
  prompts: Prompt[];
  serverName: ServerType;
}

export function PromptsList({ prompts, serverName }: PromptsListProps) {
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [promptArgs, setPromptArgs] = useState<Record<string, any>>({});
  const [promptMessages, setPromptMessages] = useState<PromptMessage[] | null>(null);
  const [showAIProcessor, setShowAIProcessor] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const aiService = getAIService();
  const client = new BridgeMCPClient('http://localhost:4000/api', serverName);

  const handleGetPrompt = async (prompt: Prompt) => {
    setLoading(prompt.name);
    setError(null);

    try {
      const args = promptArgs[prompt.name] || {};
      const result = await client.getPrompt(prompt.name, args);
      setPromptMessages(result.messages);
      setSelectedPrompt(prompt);

      // If AI is configured, offer to process with AI
      if (aiService.isConfigured()) {
        setShowAIProcessor(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get prompt');
    } finally {
      setLoading(null);
    }
  };

  const handleArgsChange = (promptName: string, args: any) => {
    setPromptArgs(prev => ({
      ...prev,
      [promptName]: args
    }));
  };

  if (prompts.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
        <p className="text-gray-600">No prompts available on this server</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Educational Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex gap-3">
            <span className="text-2xl">💡</span>
            <div className="flex-1">
              <h4 className="font-semibold text-blue-900 mb-1">About MCP Prompts</h4>
              <p className="text-sm text-blue-800">
                Prompts are reusable templates that servers provide. When processed with an AI,
                they enable powerful workflows. This demo shows how prompts integrate with Claude AI.
              </p>
            </div>
          </div>
        </div>

        {prompts.map((prompt) => {
          const isExpanded = expandedPrompt === prompt.name;
          const isLoading = loading === prompt.name;

          return (
            <div
              key={prompt.name}
              className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors bg-white"
            >
              {/* Prompt Header */}
              <button
                onClick={() => setExpandedPrompt(isExpanded ? null : prompt.name)}
                className="w-full p-4 flex items-start justify-between hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📝</span>
                    <h4 className="font-semibold text-gray-900">{prompt.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{prompt.description}</p>
                  {prompt.arguments && prompt.arguments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {prompt.arguments.map((arg) => (
                        <span
                          key={arg.name}
                          className={`text-xs px-2 py-1 rounded ${
                            arg.required
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {arg.name}
                          {arg.required && ' *'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
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
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                  {/* Arguments Form */}
                  {prompt.arguments && prompt.arguments.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Arguments</h5>
                      <div className="space-y-3">
                        {prompt.arguments.map((arg) => (
                          <div key={arg.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {arg.name}
                              {arg.required && <span className="text-red-600 ml-1">*</span>}
                            </label>
                            <input
                              type="text"
                              value={promptArgs[prompt.name]?.[arg.name] || ''}
                              onChange={(e) => {
                                const newArgs = { ...promptArgs[prompt.name], [arg.name]: e.target.value };
                                handleArgsChange(prompt.name, newArgs);
                              }}
                              placeholder={arg.description}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">{arg.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleGetPrompt(prompt)}
                      disabled={isLoading}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Getting Prompt...
                        </>
                      ) : aiService.isConfigured() ? (
                        <>
                          <span>🤖</span>
                          Get Prompt & Process with AI
                        </>
                      ) : (
                        <>
                          <span>📄</span>
                          Get Prompt
                        </>
                      )}
                    </button>
                  </div>

                  {!aiService.isConfigured() && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-xs text-yellow-800">
                        <strong>💡 Tip:</strong> Configure your Anthropic API key to process prompts with AI.
                        See the .env.example file for instructions.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Processor Modal */}
      {showAIProcessor && selectedPrompt && promptMessages && (
        <AIPromptProcessor
          serverName={serverName}
          prompt={selectedPrompt}
          promptMessages={promptMessages}
          onClose={() => {
            setShowAIProcessor(false);
            setPromptMessages(null);
            setSelectedPrompt(null);
          }}
        />
      )}
    </>
  );
}
