/**
 * AI Prompt Processor Component
 *
 * This component demonstrates the integration of MCP prompts with AI:
 * 1. Gets a prompt template from an MCP server
 * 2. Allows user to fill in arguments
 * 3. Sends to AI for processing
 * 4. Displays the AI-generated result
 *
 * Educational Value:
 * - Shows how MCP prompts and AI work together
 * - Demonstrates practical use of the prompts primitive
 * - Illustrates bidirectional MCP communication
 */

import { useState } from 'react';
import { getAIService, AIResponse } from '../../services/AIService';
import { Prompt, PromptMessage } from '../../types/mcp';

interface AIPromptProcessorProps {
  serverName: string;
  prompt: Prompt;
  promptMessages: PromptMessage[];
  onClose: () => void;
}

export function AIPromptProcessor({
  serverName,
  prompt,
  promptMessages,
  onClose
}: AIPromptProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResponse, setAiResponse] = useState<AIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const aiService = getAIService();

  const handleProcess = async () => {
    setIsProcessing(true);
    setError(null);
    setAiResponse(null);

    try {
      if (!aiService.isConfigured()) {
        setError('AI service not configured. Please set your Anthropic API key in the .env file.');
        return;
      }

      // Combine all prompt messages into a single text
      const promptText = promptMessages
        .map(msg => msg.content.text)
        .join('\n\n');

      const response = await aiService.processMCPPrompt(promptText, {
        systemPrompt: `You are processing a prompt from the "${serverName}" MCP server. ` +
          `The prompt is: "${prompt.description}". ` +
          `Provide a helpful, educational, and accurate response.`
      });

      setAiResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process prompt');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              AI Prompt Processor
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Processing prompt "{prompt.name}" from {serverName} server with Claude AI
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Prompt Preview */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
              <span>📝</span> Prompt from Server
            </h3>
            <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
              <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono">
                {promptMessages.map(msg => msg.content.text).join('\n\n')}
              </pre>
            </div>
          </div>

          {/* Educational Info */}
          <div className="bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <div className="flex gap-3">
              <span className="text-2xl">💡</span>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-300 mb-1">How This Works</h4>
                <p className="text-sm text-blue-200/80">
                  This demonstrates MCP's <strong>prompts primitive</strong> working with AI:
                </p>
                <ol className="text-sm text-blue-200/80 mt-2 space-y-1 list-decimal list-inside">
                  <li>MCP server provides a prompt template</li>
                  <li>Client retrieves the prompt with your arguments</li>
                  <li>AI (Claude) processes the prompt</li>
                  <li>Result is displayed with usage metrics</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Process Button */}
          {!aiResponse && !error && (
            <button
              onClick={handleProcess}
              disabled={isProcessing || !aiService.isConfigured()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Processing with AI...
                </>
              ) : !aiService.isConfigured() ? (
                <>
                  <span>⚠️</span>
                  AI Not Configured
                </>
              ) : (
                <>
                  <span>🚀</span>
                  Process with Claude AI
                </>
              )}
            </button>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-700/30 rounded-lg p-4">
              <div className="flex gap-3">
                <span className="text-2xl">❌</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-300 mb-1">Error</h4>
                  <p className="text-sm text-red-200">{error}</p>
                  {error.includes('not configured') && (
                    <div className="mt-3 text-sm text-red-200/80">
                      <p className="font-semibold mb-1">To enable AI features:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Get an API key from <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-100">console.anthropic.com</a></li>
                        <li>Copy <code className="bg-red-950/50 px-1 rounded">.env.example</code> to <code className="bg-red-950/50 px-1 rounded">.env</code></li>
                        <li>Add your key as <code className="bg-red-950/50 px-1 rounded">VITE_ANTHROPIC_API_KEY</code></li>
                        <li>Restart the client</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* AI Response */}
          {aiResponse && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                  <span>✨</span> AI Response
                </h3>
                <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 border border-blue-700/30 rounded-lg p-6">
                  <div className="prose prose-invert max-w-none">
                    <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {aiResponse.content}
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Metrics */}
              {aiResponse.usage && (
                <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                    Usage Metrics
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-400">
                        {aiResponse.usage.input_tokens.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Input Tokens</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-400">
                        {aiResponse.usage.output_tokens.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Output Tokens</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-400">
                        {(aiResponse.usage.input_tokens + aiResponse.usage.output_tokens).toLocaleString()}
                      </div>
                      <div className="text-xs text-slate-400 mt-1">Total Tokens</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-400">
                    Model: <span className="text-slate-300 font-mono">{aiResponse.model}</span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setAiResponse(null);
                    setError(null);
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Process Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
