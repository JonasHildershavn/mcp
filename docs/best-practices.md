# MCP Best Practices Guide

This guide covers best practices for implementing Model Context Protocol (MCP) servers and clients, based on the educational demo project.

## Table of Contents

1. [General Principles](#general-principles)
2. [Server Development](#server-development)
3. [Client Development](#client-development)
4. [Tools Best Practices](#tools-best-practices)
5. [Resources Best Practices](#resources-best-practices)
6. [Prompts Best Practices](#prompts-best-practices)
7. [Error Handling](#error-handling)
8. [Testing](#testing)
9. [Security](#security)

## General Principles

### Use TypeScript

TypeScript provides type safety and better developer experience:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
```

### Follow Semantic Versioning

Version your servers properly:

```json
{
  "name": "my-mcp-server",
  "version": "1.0.0"
}
```

### Clear Naming Conventions

- **Servers**: Use descriptive names (e.g., `calculator-server`, `notes-server`)
- **Tools**: Use verb-noun format (e.g., `get_weather`, `create_note`)
- **Resources**: Use clear URI schemes (e.g., `note:///1`, `weather:///tokyo`)
- **Prompts**: Use descriptive names (e.g., `code_review`, `bug_report`)

## Server Development

### Declare Capabilities Explicitly

Only declare capabilities your server actually implements:

```typescript
const server = new Server(
  {
    name: "my-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},        // Only if you have tools
      resources: {},    // Only if you have resources
      prompts: {},      // Only if you have prompts
    },
  }
);
```

### Use Proper Transport

For command-line servers, use `StdioServerTransport`:

```typescript
const transport = new StdioServerTransport();
await server.connect(transport);
```

### Implement All Handlers

Implement all required request handlers for your declared capabilities:

```typescript
// For tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  // Implementation
});
```

## Client Development

### Discover Before Using

Always discover server capabilities before attempting to use them:

1. List available tools/resources/prompts
2. Validate the server supports what you need
3. Then make requests

### Handle Server Unavailability

Implement graceful degradation when servers are unavailable:

```typescript
try {
  const result = await client.callTool(toolName, args);
  // Use result
} catch (error) {
  // Fallback or error message
  console.error("Server unavailable:", error);
}
```

## Tools Best Practices

### Clear Input Schemas

Define clear, well-documented input schemas:

```typescript
{
  name: "add",
  description: "Add two numbers together",
  inputSchema: {
    type: "object",
    properties: {
      a: {
        type: "number",
        description: "First number"
      },
      b: {
        type: "number",
        description: "Second number"
      },
    },
    required: ["a", "b"],
  },
}
```

### Validate Inputs

Always validate input parameters:

```typescript
function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero is not allowed");
  }
  return a / b;
}
```

### Return Structured Data

Return well-structured JSON responses:

```typescript
return {
  content: [
    {
      type: "text",
      text: JSON.stringify({ result }, null, 2),
    },
  ],
};
```

### Keep Tools Focused

Each tool should do one thing well:

- ✅ Good: `add`, `subtract`, `multiply`, `divide`
- ❌ Bad: `calculate` (too generic)

## Resources Best Practices

### Use Clear URI Schemes

Design intuitive URI schemes:

```typescript
// Good examples
"note:///1"
"note:///2"
"weather:///tokyo"
"weather:///london"

// Bad examples
"resource://n1"
"data://item"
```

### Include Metadata

Provide helpful metadata in resource listings:

```typescript
{
  uri: "note:///1",
  mimeType: "application/json",
  name: "Welcome to MCP",
  description: "Introduction note about MCP (Tags: mcp, introduction)"
}
```

### Support Standard MIME Types

Use standard MIME types when possible:

- `application/json` for JSON data
- `text/plain` for plain text
- `text/markdown` for Markdown
- `image/png`, `image/jpeg` for images

### Implement Efficient Resource Access

For large datasets, consider pagination or filtering:

```typescript
// Support query parameters in URIs
"notes:///all?tag=work&limit=10"
```

## Prompts Best Practices

### Make Prompts Parameterized

Design prompts to be flexible:

```typescript
{
  name: "code_review",
  arguments: [
    {
      name: "language",
      description: "Programming language",
      required: true,
    },
    {
      name: "focus_areas",
      description: "Specific areas to focus on",
      required: false,  // Optional parameter
    },
  ],
}
```

### Provide Clear Templates

Generate well-structured prompt templates:

```typescript
function generatePrompt(language: string, focus?: string): string {
  return `Please review the following ${language} code...

Consider:
1. Code Quality
2. ${focus || "Best Practices"}
...`;
}
```

### Include Context

Prompts should include relevant context:

```typescript
// Include current data in prompts
const weather = getWeatherData(city);
return `Analyze weather in ${city}:
Temperature: ${weather.temperature}°C
Conditions: ${weather.conditions}
...`;
```

## Error Handling

### Use Structured Errors

Return structured error responses:

```typescript
catch (error) {
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
```

### Validate Early

Validate inputs before processing:

```typescript
if (!args.city || typeof args.city !== 'string') {
  throw new Error("City parameter is required and must be a string");
}
```

### Provide Helpful Error Messages

Include context in error messages:

```typescript
throw new Error(
  `Weather data not available for ${city}. Available cities: ${availableCities.join(", ")}`
);
```

## Testing

### Test All Capabilities

- Test each tool with valid and invalid inputs
- Test resource URIs and edge cases
- Test prompt generation with various parameters

### Example Test Structure

```typescript
describe('Calculator Server', () => {
  it('should add two numbers correctly', async () => {
    const result = await callTool('add', { a: 5, b: 3 });
    expect(result).toEqual({ result: 8 });
  });

  it('should handle division by zero', async () => {
    await expect(
      callTool('divide', { a: 10, b: 0 })
    ).rejects.toThrow('Division by zero');
  });
});
```

## Security

### Validate All Inputs

Never trust client input:

```typescript
// Validate type
if (typeof args.n !== 'number') {
  throw new Error('Input must be a number');
}

// Validate range
if (args.n < 0 || args.n > 1000) {
  throw new Error('Input must be between 0 and 1000');
}
```

### Sanitize Resource URIs

Validate URIs to prevent directory traversal:

```typescript
const noteId = url.pathname.substring(1);
if (!/^[a-zA-Z0-9-_]+$/.test(noteId)) {
  throw new Error('Invalid note ID format');
}
```

### Rate Limiting

Consider implementing rate limiting for expensive operations:

```typescript
// Track request counts
const requestCounts = new Map<string, number>();

function checkRateLimit(clientId: string): void {
  const count = requestCounts.get(clientId) || 0;
  if (count > 100) {
    throw new Error('Rate limit exceeded');
  }
  requestCounts.set(clientId, count + 1);
}
```

### Avoid Exposing Sensitive Data

Don't include sensitive information in resources or tool responses:

```typescript
// Bad
return { user: userData, password: user.password };

// Good
return { user: { id: user.id, name: user.name } };
```

## Performance

### Cache Expensive Operations

```typescript
const cache = new Map<string, WeatherData>();

function getWeather(city: string): WeatherData {
  if (cache.has(city)) {
    return cache.get(city)!;
  }

  const data = fetchWeatherData(city);
  cache.set(city, data);
  return data;
}
```

### Use Async Operations

Use async/await for I/O operations:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const data = await fetchData();  // Non-blocking
  return processData(data);
});
```

## Documentation

### Document Each Capability

Provide clear descriptions for all tools, resources, and prompts:

```typescript
{
  name: "factorial",
  description: "Calculate factorial of a non-negative integer",  // Clear description
  inputSchema: {
    type: "object",
    properties: {
      n: {
        type: "number",
        description: "Non-negative integer"  // Parameter documentation
      },
    },
    required: ["n"],
  },
}
```

### Include Examples

Provide usage examples in your documentation:

````markdown
## Usage Example

```typescript
// Call the add tool
const result = await client.callTool('add', { a: 10, b: 5 });
console.log(result); // { result: 15 }
```
````

### Maintain a Changelog

Keep track of changes across versions:

```markdown
## Changelog

### v1.1.0
- Added support for square root calculation
- Fixed division by zero error handling

### v1.0.0
- Initial release with basic arithmetic operations
```

## Summary

Following these best practices will help you build:

- **Reliable** servers that handle errors gracefully
- **Maintainable** code that's easy to understand and modify
- **Secure** implementations that validate inputs and protect data
- **Performant** applications that use resources efficiently
- **User-friendly** tools with clear documentation

For more information, refer to the [official MCP specification](https://modelcontextprotocol.io).
