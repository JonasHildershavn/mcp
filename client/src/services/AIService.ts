/**
 * AI Service - Anthropic Claude Integration
 *
 * This service provides AI capabilities to the MCP client, demonstrating:
 * - How clients can have their own capabilities
 * - Integration with LLM APIs
 * - Processing MCP prompts with AI
 *
 * Educational Notes:
 * - The client acts as both an MCP client (consuming server capabilities)
 *   and as a capable system (providing AI processing)
 * - This demonstrates the flexibility of MCP architecture
 */

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export class AIService {
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1';
  private model = 'claude-3-5-sonnet-20241022';
  private maxTokens = 4096;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || import.meta.env.VITE_ANTHROPIC_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️ No Anthropic API key configured. AI features will be unavailable.');
      console.warn('   Set VITE_ANTHROPIC_API_KEY in your .env file to enable AI capabilities.');
    }
  }

  /**
   * Check if AI service is configured and ready
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your_api_key_here';
  }

  /**
   * Process a prompt with Claude AI
   *
   * @param messages - Conversation messages
   * @param systemPrompt - Optional system prompt
   * @returns AI response
   */
  async processPrompt(
    messages: AIMessage[],
    systemPrompt?: string
  ): Promise<AIResponse> {
    if (!this.isConfigured()) {
      throw new Error('AI Service not configured. Please set your Anthropic API key.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: this.maxTokens,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          ...(systemPrompt && { system: systemPrompt })
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'AI request failed');
      }

      const data = await response.json();

      return {
        content: data.content[0].text,
        model: data.model,
        usage: data.usage
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to process AI request');
    }
  }

  /**
   * Process an MCP prompt with AI
   *
   * This demonstrates how to use MCP prompts with an AI service:
   * 1. Server provides a prompt template
   * 2. Client fills in arguments
   * 3. AI processes the prompt
   * 4. Result is returned to user
   *
   * @param promptText - The prompt text from MCP server
   * @param context - Additional context
   * @returns AI-generated response
   */
  async processMCPPrompt(
    promptText: string,
    context?: Record<string, any>
  ): Promise<AIResponse> {
    const messages: AIMessage[] = [
      {
        role: 'user',
        content: promptText
      }
    ];

    const systemPrompt = context?.systemPrompt ||
      'You are a helpful AI assistant processing prompts from an MCP (Model Context Protocol) server. ' +
      'Provide clear, educational, and accurate responses.';

    return this.processPrompt(messages, systemPrompt);
  }

  /**
   * Explain a tool result in educational terms
   *
   * @param toolName - Name of the tool
   * @param toolArgs - Arguments passed to tool
   * @param toolResult - Result from tool execution
   * @returns Educational explanation
   */
  async explainToolResult(
    toolName: string,
    toolArgs: any,
    toolResult: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      return 'AI explanations unavailable. Configure your Anthropic API key to enable this feature.';
    }

    try {
      const response = await this.processPrompt([
        {
          role: 'user',
          content: `Explain this MCP tool execution in simple, educational terms:

Tool: ${toolName}
Arguments: ${JSON.stringify(toolArgs, null, 2)}
Result: ${toolResult}

Provide a brief (2-3 sentences) explanation of what happened and why it's useful.`
        }
      ], 'You are an educational AI assistant helping users understand MCP (Model Context Protocol) concepts.');

      return response.content;
    } catch (error) {
      console.error('Error generating explanation:', error);
      return 'Unable to generate explanation at this time.';
    }
  }

  /**
   * Analyze resource content
   *
   * @param resourceUri - URI of the resource
   * @param resourceContent - Content of the resource
   * @returns AI analysis
   */
  async analyzeResource(
    resourceUri: string,
    resourceContent: string
  ): Promise<string> {
    if (!this.isConfigured()) {
      return 'AI analysis unavailable. Configure your Anthropic API key to enable this feature.';
    }

    try {
      const response = await this.processPrompt([
        {
          role: 'user',
          content: `Analyze this resource from an MCP server:

URI: ${resourceUri}
Content:
${resourceContent}

Provide a helpful summary and any insights about this resource.`
        }
      ]);

      return response.content;
    } catch (error) {
      console.error('Error analyzing resource:', error);
      return 'Unable to analyze resource at this time.';
    }
  }

  /**
   * Get AI client capabilities for MCP advertisement
   *
   * This returns the capabilities that the AI-powered client can advertise
   * to MCP servers, showing them what the client can do.
   */
  getClientCapabilities() {
    return {
      ai: {
        enabled: this.isConfigured(),
        models: this.isConfigured() ? ['claude-3-5-sonnet-20241022'] : [],
        capabilities: this.isConfigured() ? [
          'prompt_processing',
          'content_analysis',
          'educational_explanations'
        ] : []
      },
      experimental: {
        ai_enhanced_prompts: this.isConfigured()
      }
    };
  }
}

// Singleton instance
let aiService: AIService | null = null;

export function getAIService(): AIService {
  if (!aiService) {
    aiService = new AIService();
  }
  return aiService;
}
