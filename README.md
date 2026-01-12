# MCP Educational Demo

An interactive educational project demonstrating the **Model Context Protocol (MCP)** with working implementations of multiple MCP servers and a client with a frontend UI.

## Overview

This project showcases MCP's core capabilities:
- **Tools**: Function calling and execution
- **Resources**: Data access and retrieval
- **Prompts**: Templated interactions

## Project Structure

```
mcp-demo/
├── servers/              # MCP Server implementations
│   ├── calculator/       # Demonstrates Tools
│   ├── notes/           # Demonstrates Resources
│   ├── templates/       # Demonstrates Prompts
│   └── weather/         # Demonstrates all three capabilities
├── client/              # MCP Client with web UI
│   ├── src/
│   ├── public/
│   └── package.json
└── docs/                # Documentation
```

## Features

### MCP Servers

1. **Calculator Server** - Tool demonstrations
   - Basic arithmetic operations (add, subtract, multiply, divide)
   - Advanced operations (power, sqrt, factorial)
   - Shows how to implement and expose MCP tools

2. **Notes Server** - Resource demonstrations
   - Create, read, update, delete notes
   - List all notes as resources
   - Shows how to expose data as MCP resources

3. **Templates Server** - Prompt demonstrations
   - Pre-built prompt templates
   - Dynamic prompt generation
   - Shows how to create reusable prompt templates

4. **Weather Server** - Combined demonstrations
   - Tools: Get current weather, forecast
   - Resources: Weather data for different cities
   - Prompts: Weather analysis templates

### MCP Client with Web UI

- Interactive dashboard showing all available servers
- Live execution of tools with results
- Resource browser and viewer
- Prompt template selector and executor
- Visual representation of MCP protocol communication

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Basic understanding of TypeScript

### Installation

```bash
# Install all dependencies
npm install

# Install server dependencies
cd servers/calculator && npm install && cd ../..
cd servers/notes && npm install && cd ../..
cd servers/templates && npm install && cd ../..
cd servers/weather && npm install && cd ../..

# Install client dependencies
cd client && npm install && cd ..
```

### Running the Demo

1. **Start all MCP servers:**
   ```bash
   npm run servers
   ```

2. **Start the client UI:**
   ```bash
   npm run client
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## MCP Concepts Demonstrated

### Tools
Tools are functions that MCP servers expose for clients to call. In this demo:
- Calculator operations (mathematical functions)
- Weather data fetching
- Note management operations

### Resources
Resources are data that MCP servers make available. In this demo:
- Note collections and individual notes
- Weather data for different locations
- Historical weather records

### Prompts
Prompts are reusable templates for interactions. In this demo:
- Code review templates
- Weather analysis prompts
- Note summarization templates

## Architecture

The project follows MCP best practices:
- **Server-side**: Each server is a standalone Node.js process implementing the MCP protocol
- **Client-side**: React-based UI that connects to servers via MCP protocol
- **Transport**: Uses stdio transport for local development
- **Type Safety**: Full TypeScript implementation with MCP SDK types

## Learn More

- [MCP Specification](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Best Practices Guide](./docs/best-practices.md)

## License

MIT License - see [LICENSE](LICENSE) file for details
