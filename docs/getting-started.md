# Getting Started with the MCP Educational Demo

This guide will help you get up and running with the MCP Educational Demo project.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- A terminal/command line interface
- A code editor (VS Code, Sublime, etc.)

## Quick Start

### 1. Install Dependencies

First, install the root project dependencies:

```bash
npm install
```

Then install dependencies for each server and the client:

```bash
# Calculator Server
cd servers/calculator
npm install
cd ../..

# Notes Server
cd servers/notes
npm install
cd ../..

# Templates Server
cd servers/templates
npm install
cd ../..

# Weather Server
cd servers/weather
npm install
cd ../..

# Client
cd client
npm install
cd ..
```

### 2. Build the Servers

Build all TypeScript servers:

```bash
# Build calculator server
cd servers/calculator
npm run build
cd ../..

# Build notes server
cd servers/notes
npm run build
cd ../..

# Build templates server
cd servers/templates
npm run build
cd ../..

# Build weather server
cd servers/weather
npm run build
cd ../..
```

### 3. Run the Demo

You have two options:

#### Option A: Run Everything Together

From the root directory:

```bash
# This will start all servers and the client
npm run dev
```

Then open your browser to `http://localhost:3000`

#### Option B: Run Components Separately

In separate terminal windows:

**Terminal 1 - Calculator Server:**
```bash
cd servers/calculator
npm start
```

**Terminal 2 - Notes Server:**
```bash
cd servers/notes
npm start
```

**Terminal 3 - Templates Server:**
```bash
cd servers/templates
npm start
```

**Terminal 4 - Weather Server:**
```bash
cd servers/weather
npm start
```

**Terminal 5 - Client:**
```bash
cd client
npm start
```

Then open your browser to `http://localhost:3000`

## Understanding the Project Structure

```
mcp-demo/
├── servers/              # MCP Server implementations
│   ├── calculator/       # Tools demonstration
│   │   ├── src/
│   │   │   └── index.ts  # Server implementation
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── notes/           # Resources demonstration
│   ├── templates/       # Prompts demonstration
│   └── weather/         # All three capabilities
├── client/              # Web UI client
│   ├── src/
│   │   ├── App.tsx      # Main application
│   │   ├── App.css      # Styles
│   │   └── main.tsx     # Entry point
│   ├── index.html
│   └── package.json
├── docs/                # Documentation
├── package.json         # Root package
└── README.md
```

## Exploring the Servers

### Calculator Server (Tools)

The calculator server demonstrates **MCP Tools** - callable functions that perform operations.

**Available Tools:**
- `add` - Add two numbers
- `subtract` - Subtract two numbers
- `multiply` - Multiply two numbers
- `divide` - Divide two numbers
- `power` - Raise to a power
- `sqrt` - Calculate square root
- `factorial` - Calculate factorial

**Example Tool Call:**
```typescript
{
  "name": "add",
  "arguments": {
    "a": 10,
    "b": 5
  }
}
// Response: { "result": 15 }
```

### Notes Server (Resources)

The notes server demonstrates **MCP Resources** - structured data accessible via URIs.

**Available Resources:**
- `note:///1` - Welcome to MCP note
- `note:///2` - Understanding Resources note
- `note:///3` - Shopping List note

**Available Tools:**
- `create_note` - Create a new note
- `update_note` - Update an existing note
- `delete_note` - Delete a note
- `search_notes` - Search through notes

**Example Resource Access:**
```typescript
// List resources
ListResourcesRequest

// Read specific resource
{
  "uri": "note:///1"
}
```

### Templates Server (Prompts)

The templates server demonstrates **MCP Prompts** - reusable prompt templates.

**Available Prompts:**
- `code_review` - Code review template
- `bug_report` - Bug report template
- `documentation` - Documentation templates
- `test_case` - Test case template
- `refactoring_plan` - Refactoring plan template

**Example Prompt Request:**
```typescript
{
  "name": "code_review",
  "arguments": {
    "language": "TypeScript",
    "focus_areas": "security, performance"
  }
}
```

### Weather Server (All Three)

The weather server demonstrates **all three MCP capabilities** working together.

**Tools:**
- `get_current_weather` - Get current weather for a city
- `get_forecast` - Get 5-day forecast
- `compare_weather` - Compare weather between cities

**Resources:**
- `weather:///san-francisco` - San Francisco weather data
- `weather:///london` - London weather data
- `weather:///tokyo` - Tokyo weather data
- `weather:///sydney` - Sydney weather data

**Prompts:**
- `weather_analysis` - Weather analysis template
- `travel_recommendation` - Travel recommendation template

## Using the Web UI

The web UI provides an interactive way to explore MCP concepts:

1. **Select a Server** - Click on any server in the sidebar
2. **View Examples** - See practical examples of that server's capabilities
3. **Understand the Protocol** - Learn how MCP requests and responses work
4. **Explore Different Capabilities** - Switch between servers to see Tools, Resources, and Prompts in action

### UI Features

- **Server Navigation** - Easy switching between different servers
- **Interactive Examples** - Real code examples showing MCP protocol
- **Visual Design** - Color-coded servers for easy identification
- **Responsive Layout** - Works on desktop and mobile devices
- **Protocol Explanation** - Step-by-step breakdown of how MCP works

## Testing Individual Servers

You can test servers individually using the MCP SDK or any MCP client.

### Example: Testing with stdio

Each server runs on stdio transport. You can test them by:

1. Starting the server
2. Sending JSON-RPC messages via stdin
3. Receiving responses via stdout

**Example interaction:**

```bash
cd servers/calculator
npm start
# Server is now waiting for input on stdin

# Send a tool list request (via stdin):
{"jsonrpc":"2.0","method":"tools/list","params":{},"id":1}

# Server responds with available tools
```

## Next Steps

After getting familiar with the demo:

1. **Read the Code** - Explore the server implementations to understand how they work
2. **Modify Examples** - Try changing the tools, resources, or prompts
3. **Build Your Own** - Create your own MCP server based on these examples
4. **Read Best Practices** - Check out `docs/best-practices.md` for development guidelines

## Troubleshooting

### Port Already in Use

If port 3000 is already in use:

```bash
# Change the port in client/vite.config.ts
server: {
  port: 3001,  // Use a different port
}
```

### TypeScript Build Errors

Make sure all dependencies are installed:

```bash
cd servers/calculator && npm install
cd ../notes && npm install
cd ../templates && npm install
cd ../weather && npm install
cd ../../client && npm install
```

### Servers Not Starting

Check that you've built the TypeScript code:

```bash
cd servers/calculator && npm run build
cd ../notes && npm run build
cd ../templates && npm run build
cd ../weather && npm run build
```

### Module Not Found Errors

Ensure you're using Node.js v18 or higher:

```bash
node --version
# Should show v18.x.x or higher
```

## Learn More

- [MCP Specification](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Best Practices Guide](./best-practices.md)
- [Architecture Overview](./architecture.md)

## Getting Help

If you run into issues:

1. Check the troubleshooting section above
2. Review the server logs for error messages
3. Ensure all dependencies are installed correctly
4. Verify Node.js version compatibility

Happy learning with MCP!
