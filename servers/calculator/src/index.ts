#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Calculator MCP Server
 *
 * This server demonstrates MCP TOOLS by implementing various calculator operations.
 * Tools allow clients to execute functions and receive computed results.
 */

// Define available calculator tools
const TOOLS: Tool[] = [
  {
    name: "add",
    description: "Add two numbers together",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "number", description: "First number" },
        b: { type: "number", description: "Second number" },
      },
      required: ["a", "b"],
    },
  },
  {
    name: "subtract",
    description: "Subtract second number from first number",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "number", description: "First number" },
        b: { type: "number", description: "Second number" },
      },
      required: ["a", "b"],
    },
  },
  {
    name: "multiply",
    description: "Multiply two numbers",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "number", description: "First number" },
        b: { type: "number", description: "Second number" },
      },
      required: ["a", "b"],
    },
  },
  {
    name: "divide",
    description: "Divide first number by second number",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "number", description: "Numerator" },
        b: { type: "number", description: "Denominator (cannot be zero)" },
      },
      required: ["a", "b"],
    },
  },
  {
    name: "power",
    description: "Raise first number to the power of second number",
    inputSchema: {
      type: "object",
      properties: {
        base: { type: "number", description: "Base number" },
        exponent: { type: "number", description: "Exponent" },
      },
      required: ["base", "exponent"],
    },
  },
  {
    name: "sqrt",
    description: "Calculate square root of a number",
    inputSchema: {
      type: "object",
      properties: {
        value: { type: "number", description: "Number to calculate square root of (must be non-negative)" },
      },
      required: ["value"],
    },
  },
  {
    name: "factorial",
    description: "Calculate factorial of a non-negative integer",
    inputSchema: {
      type: "object",
      properties: {
        n: { type: "number", description: "Non-negative integer" },
      },
      required: ["n"],
    },
  },
];

// Calculator operation implementations
function add(a: number, b: number): number {
  return a + b;
}

function subtract(a: number, b: number): number {
  return a - b;
}

function multiply(a: number, b: number): number {
  return a * b;
}

function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero is not allowed");
  }
  return a / b;
}

function power(base: number, exponent: number): number {
  return Math.pow(base, exponent);
}

function sqrt(value: number): number {
  if (value < 0) {
    throw new Error("Cannot calculate square root of negative number");
  }
  return Math.sqrt(value);
}

function factorial(n: number): number {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error("Factorial is only defined for non-negative integers");
  }
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

// Create and configure the MCP server
const server = new Server(
  {
    name: "calculator-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {
        listChanged: true,  // Server will notify when tool list changes
      },
    },
  }
);

// Handle tool listing requests
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: TOOLS,
  };
});

// Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error("Missing arguments");
  }

  try {
    let result: number;

    switch (name) {
      case "add":
        result = add(args.a as number, args.b as number);
        break;
      case "subtract":
        result = subtract(args.a as number, args.b as number);
        break;
      case "multiply":
        result = multiply(args.a as number, args.b as number);
        break;
      case "divide":
        result = divide(args.a as number, args.b as number);
        break;
      case "power":
        result = power(args.base as number, args.exponent as number);
        break;
      case "sqrt":
        result = sqrt(args.value as number);
        break;
      case "factorial":
        result = factorial(args.n as number);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ result }, null, 2),
        },
      ],
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Calculator MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
