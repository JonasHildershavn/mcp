#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  Prompt,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Templates MCP Server
 *
 * This server demonstrates MCP PROMPTS by providing reusable prompt templates.
 * Prompts allow servers to offer pre-built, parameterized interactions that clients can use.
 */

// Define available prompts
const PROMPTS: Prompt[] = [
  {
    name: "code_review",
    description: "Get a comprehensive code review with suggestions for improvements",
    arguments: [
      {
        name: "code",
        description: "The code to review",
        required: true,
      },
      {
        name: "focus_areas",
        description: "Specific areas to focus on (e.g., security, performance, readability)",
        required: false,
      },
    ],
  },
  {
    name: "explain_code",
    description: "Get a clear explanation of what code does and how it works",
    arguments: [
      {
        name: "code",
        description: "The code to explain",
        required: true,
      },
    ],
  },
  {
    name: "find_bugs",
    description: "Analyze code for potential bugs, edge cases, and issues",
    arguments: [
      {
        name: "code",
        description: "The code to analyze",
        required: true,
      },
    ],
  },
  {
    name: "improve_code",
    description: "Get suggestions to improve code quality, performance, and maintainability",
    arguments: [
      {
        name: "code",
        description: "The code to improve",
        required: true,
      },
      {
        name: "goals",
        description: "What to optimize for (e.g., performance, readability, simplicity)",
        required: false,
      },
    ],
  },
  {
    name: "generate_tests",
    description: "Generate comprehensive test cases for code",
    arguments: [
      {
        name: "code",
        description: "The code to generate tests for",
        required: true,
      },
      {
        name: "test_framework",
        description: "Preferred testing framework (optional, will auto-detect if not specified)",
        required: false,
      },
    ],
  },
  {
    name: "document_code",
    description: "Generate documentation for code (JSDoc, docstrings, etc.)",
    arguments: [
      {
        name: "code",
        description: "The code to document",
        required: true,
      },
    ],
  },
];

// Prompt template generators
function generateCodeReviewPrompt(code: string, focusAreas?: string): string {
  const areas = focusAreas || "code quality, performance, security, best practices, and potential bugs";
  return `Please review the following code with focus on ${areas}.

Analyze the code and provide:
1. **Overall Assessment**: Brief summary of code quality
2. **Issues Found**: List specific issues with severity (critical/high/medium/low)
3. **Security Concerns**: Any security vulnerabilities or risks
4. **Performance**: Bottlenecks or inefficiencies
5. **Best Practices**: Violations of language/framework conventions
6. **Suggestions**: Specific improvements with code examples

Code to review:

\`\`\`
${code}
\`\`\`

Please be specific and actionable in your feedback.`;
}

function generateExplainCodePrompt(code: string): string {
  return `Please explain what the following code does and how it works.

Provide:
1. **Purpose**: What this code is designed to do
2. **How It Works**: Step-by-step explanation of the logic
3. **Key Concepts**: Important patterns, algorithms, or techniques used
4. **Inputs/Outputs**: What it takes in and what it returns
5. **Potential Issues**: Any edge cases or limitations to be aware of

Code to explain:

\`\`\`
${code}
\`\`\`

Please explain in clear, simple language as if teaching someone learning this programming language.`;
}

function generateFindBugsPrompt(code: string): string {
  return `Please analyze the following code for potential bugs, errors, and edge cases.

Look for:
1. **Logic Errors**: Incorrect logic that could produce wrong results
2. **Edge Cases**: Unhandled edge cases (null, undefined, empty arrays, etc.)
3. **Type Issues**: Type mismatches or unsafe type operations
4. **Runtime Errors**: Potential crashes or exceptions
5. **Off-by-One Errors**: Loop boundary issues
6. **Resource Leaks**: Memory leaks, unclosed connections, etc.
7. **Concurrency Issues**: Race conditions, deadlocks (if applicable)
8. **Security Vulnerabilities**: Injection risks, unsafe operations

Code to analyze:

\`\`\`
${code}
\`\`\`

For each issue found, provide:
- **Line/Location**: Where the issue occurs
- **Severity**: Critical/High/Medium/Low
- **Description**: What the bug is
- **How to Fix**: Specific solution with code example`;
}

function generateImproveCodePrompt(code: string, goals?: string): string {
  const optimization = goals || "overall code quality, readability, performance, and maintainability";
  return `Please suggest improvements to the following code, optimizing for ${optimization}.

Provide:
1. **Improved Code**: Complete rewrite with improvements
2. **Changes Made**: List of specific improvements
3. **Benefits**: How each change improves the code
4. **Performance Impact**: Any performance gains (if applicable)
5. **Tradeoffs**: Any tradeoffs or considerations

Original code:

\`\`\`
${code}
\`\`\`

Focus on practical, meaningful improvements while maintaining correctness.`;
}

function generateTestsPrompt(code: string, testFramework?: string): string {
  const framework = testFramework ? ` using ${testFramework}` : "";
  return `Please generate comprehensive test cases for the following code${framework}.

Include:
1. **Unit Tests**: Test each function/method in isolation
2. **Happy Path Tests**: Normal, expected usage
3. **Edge Cases**: Boundary conditions, empty inputs, null/undefined
4. **Error Cases**: Invalid inputs, error handling
5. **Test Setup/Teardown**: Any needed setup or cleanup
6. **Mock Data**: Sample test data if needed

Code to test:

\`\`\`
${code}
\`\`\`

Generate complete, runnable test code with good coverage. Include comments explaining what each test validates.`;
}

function generateDocumentCodePrompt(code: string): string {
  return `Please generate comprehensive documentation for the following code.

Include:
1. **Function/Class Documentation**: JSDoc, docstrings, or equivalent
2. **Parameter Descriptions**: What each parameter does, types, constraints
3. **Return Value**: What is returned, type, possible values
4. **Examples**: Usage examples showing how to use the code
5. **Notes**: Important caveats, side effects, or considerations
6. **Exceptions**: What errors can be thrown and when

Code to document:

\`\`\`
${code}
\`\`\`

Use the appropriate documentation format for the language (JSDoc for JavaScript/TypeScript, docstrings for Python, etc.). Make the documentation clear and helpful for other developers.`;
}

// Create and configure the MCP server
const server = new Server(
  {
    name: "templates-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      prompts: {
        listChanged: true,  // Server will notify when prompt list changes
      },
    },
  }
);

// Handle prompt listing
server.setRequestHandler(ListPromptsRequestSchema, async () => {
  return { prompts: PROMPTS };
});

// Handle prompt retrieval
server.setRequestHandler(GetPromptRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  let promptText: string;

  switch (name) {
    case "code_review":
      promptText = generateCodeReviewPrompt(
        args?.code as string,
        args?.focus_areas as string | undefined
      );
      break;

    case "explain_code":
      promptText = generateExplainCodePrompt(
        args?.code as string
      );
      break;

    case "find_bugs":
      promptText = generateFindBugsPrompt(
        args?.code as string
      );
      break;

    case "improve_code":
      promptText = generateImproveCodePrompt(
        args?.code as string,
        args?.goals as string | undefined
      );
      break;

    case "generate_tests":
      promptText = generateTestsPrompt(
        args?.code as string,
        args?.test_framework as string | undefined
      );
      break;

    case "document_code":
      promptText = generateDocumentCodePrompt(
        args?.code as string
      );
      break;

    default:
      throw new Error(`Unknown prompt: ${name}`);
  }

  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: promptText,
        },
      },
    ],
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Templates MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
