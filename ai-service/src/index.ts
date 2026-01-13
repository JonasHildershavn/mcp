/**
 * AI Processing Service
 *
 * Separate microservice for AI-related functionality.
 * Follows enterprise best practices:
 * - Single Responsibility: Only handles AI processing
 * - Independent Scaling: Can scale separately from MCP bridge
 * - Security Isolation: API keys isolated to this service
 * - Optional Component: Can be disabled without affecting MCP
 */

import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
const PORT = 4001;

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Middleware
app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  const isConfigured = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    status: 'ok',
    configured: isConfigured,
    timestamp: new Date().toISOString()
  });
});

// Process prompt with AI
app.post('/api/ai/process', async (req: Request, res: Response) => {
  const { prompt, systemPrompt, maxTokens = 4096 } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(503).json({
      error: 'AI service not configured',
      message: 'ANTHROPIC_API_KEY environment variable not set'
    });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    // Extract text from response
    const responseText = message.content
      .filter(block => block.type === 'text')
      .map(block => 'text' in block ? block.text : '')
      .join('\n');

    res.json({
      response: responseText,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
        totalTokens: message.usage.input_tokens + message.usage.output_tokens
      },
      model: message.model,
      stopReason: message.stop_reason
    });
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({
      error: 'AI processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`AI Processing Service running on http://localhost:${PORT}`);
  console.log(`API Key configured: ${!!process.env.ANTHROPIC_API_KEY}`);
});
