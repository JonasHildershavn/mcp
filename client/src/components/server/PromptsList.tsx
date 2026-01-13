/**
 * Prompts List Component
 *
 * Displays available MCP prompts from a server and allows users to:
 * 1. View prompt templates and their arguments
 * 2. Fill in arguments to customize the prompt
 * 3. Generate and VIEW the actual prompt text (key MCP primitive!)
 * 4. Copy the prompt or process it with AI
 */

import { useState } from 'react';
import { Prompt, PromptMessage, ServerType } from '../../types/mcp';
import { BridgeMCPClient } from '../../services/BridgeMCPClient';
import { AIPromptProcessor } from '../ai/AIPromptProcessor';
import { getAIService } from '../../services/AIService';

interface PromptsListProps {
  prompts: Prompt[];
  serverName: ServerType;
}

export function PromptsList({ prompts, serverName }: PromptsListProps) {
  const [expandedPrompt, setExpandedPrompt] = useState<string | null>(null);
  const [promptArgs, setPromptArgs] = useState<Record<string, any>>({});
  const [generatedPrompts, setGeneratedPrompts] = useState<Record<string, PromptMessage[]>>({});
  const [editedPrompts, setEditedPrompts] = useState<Record<string, string>>({});
  const [originalPrompts, setOriginalPrompts] = useState<Record<string, string>>({});
  const [showAIProcessor, setShowAIProcessor] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);

  const aiService = getAIService();
  const client = new BridgeMCPClient('http://localhost:4000/api', serverName);

  const handleGeneratePrompt = async (prompt: Prompt) => {
    setLoading(prompt.name);
    setError(null);

    try {
      const args = promptArgs[prompt.name] || {};
      const result = await client.getPrompt(prompt.name, args);

      // Store the generated prompt messages
      setGeneratedPrompts(prev => ({
        ...prev,
        [prompt.name]: result.messages
      }));

      // Extract and store the text for editing
      const promptText = result.messages
        .map(msg => typeof msg.content === 'string' ? msg.content : msg.content.text)
        .join('\n\n');

      setOriginalPrompts(prev => ({
        ...prev,
        [prompt.name]: promptText
      }));

      setEditedPrompts(prev => ({
        ...prev,
        [prompt.name]: promptText
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate prompt');
    } finally {
      setLoading(null);
    }
  };

  const handleCopyPrompt = async (prompt: Prompt) => {
    const promptText = editedPrompts[prompt.name];
    if (!promptText) return;

    try {
      await navigator.clipboard.writeText(promptText);
      setCopiedPrompt(prompt.name);
      setTimeout(() => setCopiedPrompt(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleProcessWithAI = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setShowAIProcessor(true);
  };

  const handlePromptEdit = (promptName: string, newText: string) => {
    setEditedPrompts(prev => ({
      ...prev,
      [promptName]: newText
    }));
  };

  const handleResetPrompt = (promptName: string) => {
    const original = originalPrompts[promptName];
    if (original) {
      setEditedPrompts(prev => ({
        ...prev,
        [promptName]: original
      }));
    }
  };

  const isPromptEdited = (promptName: string): boolean => {
    return editedPrompts[promptName] !== originalPrompts[promptName];
  };

  const handleArgsChange = (promptName: string, args: any) => {
    setPromptArgs(prev => ({
      ...prev,
      [promptName]: args
    }));
    // Clear generated prompt when args change
    setGeneratedPrompts(prev => {
      const updated = { ...prev };
      delete updated[promptName];
      return updated;
    });
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
              <h4 className="font-semibold text-blue-900 mb-1">How MCP Prompts Work</h4>
              <p className="text-sm text-blue-800">
                <strong>1.</strong> Fill in arguments → <strong>2.</strong> Generate prompt text → <strong>3.</strong> Copy or send to AI.
                This demonstrates how servers provide reusable, parameterized prompts.
              </p>
            </div>
          </div>
        </div>

        {prompts.map((prompt) => {
          const isExpanded = expandedPrompt === prompt.name;
          const isLoading = loading === prompt.name;
          const hasGeneratedPrompt = generatedPrompts[prompt.name];
          const isCopied = copiedPrompt === prompt.name;

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
                  {/* Step 1: Arguments Form */}
                  {prompt.arguments && prompt.arguments.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-blue-600 font-bold">1</span>
                        <h5 className="text-sm font-semibold text-gray-700">Fill in Arguments</h5>
                      </div>
                      <div className="space-y-3">
                        {prompt.arguments.map((arg) => (
                          <div key={arg.name}>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {arg.name}
                              {arg.required && <span className="text-red-600 ml-1">*</span>}
                            </label>
                            {arg.name === 'code' ? (
                              <textarea
                                value={promptArgs[prompt.name]?.[arg.name] || ''}
                                onChange={(e) => {
                                  const newArgs = { ...promptArgs[prompt.name], [arg.name]: e.target.value };
                                  handleArgsChange(prompt.name, newArgs);
                                }}
                                placeholder={arg.description}
                                rows={6}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-mono"
                              />
                            ) : (
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
                            )}
                            <p className="text-xs text-gray-500 mt-1">{arg.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Generate Button */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-blue-600 font-bold">2</span>
                      <h5 className="text-sm font-semibold text-gray-700">Generate Prompt</h5>
                    </div>
                    <button
                      onClick={() => handleGeneratePrompt(prompt)}
                      disabled={isLoading}
                      className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Generating...
                        </>
                      ) : (
                        <>
                          <span>🔄</span>
                          Generate Prompt
                        </>
                      )}
                    </button>
                  </div>

                  {/* Error Display */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Step 3: Generated Prompt Display */}
                  {hasGeneratedPrompt && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-600 font-bold">3</span>
                          <h5 className="text-sm font-semibold text-gray-700">Generated Prompt</h5>
                          {isPromptEdited(prompt.name) && (
                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                              Edited
                            </span>
                          )}
                        </div>
                        {isPromptEdited(prompt.name) && (
                          <button
                            onClick={() => handleResetPrompt(prompt.name)}
                            className="text-xs text-gray-600 hover:text-gray-800 underline"
                          >
                            Reset to Original
                          </button>
                        )}
                      </div>

                      {/* Editable Prompt Text */}
                      <textarea
                        value={editedPrompts[prompt.name] || ''}
                        onChange={(e) => handlePromptEdit(prompt.name, e.target.value)}
                        className={`w-full px-3 py-3 rounded-md text-sm font-mono text-gray-800 whitespace-pre-wrap resize-y transition-colors ${
                          isPromptEdited(prompt.name)
                            ? 'border-2 border-orange-400 bg-orange-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-200'
                            : 'border border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
                        }`}
                        rows={12}
                        placeholder="Generated prompt will appear here..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        You can edit the prompt above before copying or processing with AI
                      </p>

                      {/* Action Buttons */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleCopyPrompt(prompt)}
                          className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          {isCopied ? (
                            <>
                              <span>✓</span>
                              Copied!
                            </>
                          ) : (
                            <>
                              <span>📋</span>
                              Copy Prompt
                            </>
                          )}
                        </button>

                        {aiService.isConfigured() && (
                          <button
                            onClick={() => handleProcessWithAI(prompt)}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <span>🤖</span>
                            Process with AI
                          </button>
                        )}
                      </div>

                      {!aiService.isConfigured() && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-2">
                          <p className="text-xs text-yellow-800">
                            <strong>💡 Tip:</strong> Configure your Anthropic API key in .env to process prompts with AI
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Processor Modal */}
      {showAIProcessor && selectedPrompt && editedPrompts[selectedPrompt.name] && (
        <AIPromptProcessor
          serverName={serverName}
          prompt={selectedPrompt}
          promptText={editedPrompts[selectedPrompt.name]}
          onClose={() => {
            setShowAIProcessor(false);
            setSelectedPrompt(null);
          }}
        />
      )}
    </>
  );
}
