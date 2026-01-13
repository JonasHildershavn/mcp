/**
 * AI Service - Backend AI Integration
 *
 * This service communicates with the separate AI Processing Service backend.
 * Follows enterprise best practices:
 * - API calls made from backend (avoids CORS, secures API keys)
 * - Clean separation between client and AI processing
 * - Service can be scaled/deployed independently
 *
 * Educational Notes:
 * - Demonstrates proper microservices architecture
 * - Shows how to integrate AI without exposing secrets in browser
 * - Client delegates AI processing to specialized service
 */

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export class AIService {
  private aiServiceUrl = 'http://localhost:4001/api/ai';
  private configured: boolean | null = null;

  constructor() {
    // Check if AI service is available
    this.checkConfiguration();
  }

  private async checkConfiguration(): Promise<void> {
    try {
      const response = await fetch('http://localhost:4001/health');
      const data = await response.json();
      this.configured = data.configured;
    } catch (error) {
      this.configured = false;
      console.warn('⚠️ AI Processing Service not available or not configured.');
    }
  }

  /**
   * Check if AI service is configured and ready
   */
  isConfigured(): boolean {
    // Return true optimistically if we haven't checked yet
    // The actual API call will fail gracefully if not configured
    return this.configured !== false;
  }

  /**
   * Process an MCP prompt with AI via backend service
   *
   * This demonstrates how to use MCP prompts with an AI service:
   * 1. Server provides a prompt template
   * 2. Client fills in arguments
   * 3. Backend AI service processes the prompt
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
    try {
      const systemPrompt = context?.systemPrompt ||
        'You are a helpful AI assistant processing prompts from an MCP (Model Context Protocol) server. ' +
        'Provide clear, educational, and accurate responses.';

      const response = await fetch(`${this.aiServiceUrl}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: promptText,
          systemPrompt,
          maxTokens: context?.maxTokens || 4096
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'AI processing failed');
      }

      const data = await response.json();

      return {
        content: data.response,
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
   * Get AI client capabilities for MCP advertisement
   *
   * This returns the capabilities that the AI-powered client can advertise
   * to MCP servers, showing them what the client can do.
   */
  getClientCapabilities() {
    return {
      ai: {
        enabled: this.isConfigured(),
        models: this.isConfigured() ? ['claude-sonnet-4'] : [],
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
