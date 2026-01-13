# MCP Educational Demo - Complete Guide

## Overview

This project is a comprehensive educational demonstration of the **Model Context Protocol (MCP)** with AI capabilities. It showcases how MCP enables seamless integration between AI models, applications, and data sources.

## What Makes This Educational?

### 1. Real-World Integration (Not Just Mock Data)

**Weather Server** demonstrates real API integration:
- Uses OpenWeather API for live weather data
- Graceful fallback to educational mock data
- Shows caching strategies and error handling
- Teaches API key management

**AI Service** shows production-ready patterns:
- Anthropic Claude API integration
- Token usage tracking
- Educational explanations generation
- Proper error handling

### 2. All Three MCP Primitives

#### Tools (Function Calling)
- **Calculator**: Mathematical operations
- **Weather**: Real-time weather data fetching
- **Notes**: CRUD operations with advanced search

#### Resources (Data Access)
- **Notes**: Exposes notes as browseable resources
- **Weather**: Weather data as accessible resources
- Shows how to structure and expose data

#### Prompts (AI Templates)
- **Templates**: Reusable documentation templates
- **Weather**: AI-powered weather analysis
- **AI Integration**: Process prompts with Claude AI
- Demonstrates template-based AI workflows

### 3. Bidirectional MCP

The client isn't just a consumer—it has its own capabilities:
- AI processing capability
- Can serve prompts from servers
- Demonstrates flexible MCP architecture

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm
- (Optional) Anthropic API key for AI features
- (Optional) OpenWeather API key for real weather data

### Installation

1. **Install dependencies:**
   ```bash
   # Root dependencies
   npm install

   # Server dependencies
   cd servers/calculator && npm install && cd ../..
   cd servers/notes && npm install && cd ../..
   cd servers/templates && npm install && cd ../..
   cd servers/weather && npm install && cd ../..

   # Bridge dependencies
   cd bridge && npm install && cd ..

   # Client dependencies
   cd client && npm install && cd ..
   ```

2. **Configure API Keys (Optional but Recommended):**
   ```bash
   # Client AI configuration
   cd client
   cp .env.example .env
   # Edit .env and add your Anthropic API key
   ```

3. **Build all servers:**
   ```bash
   npm run build
   ```

### Running the Demo

1. **Start all servers and the bridge:**
   ```bash
   # Terminal 1 - Start all MCP servers
   npm run servers

   # Terminal 2 - Start the bridge server
   cd bridge && npm run dev
   ```

2. **Start the client:**
   ```bash
   # Terminal 3 - Start the web UI
   npm run client
   ```

3. **Open your browser:**
   Navigate to `http://localhost:3000`

## Educational Features

### Weather Server: Real API Integration

**What it teaches:**
- External API integration patterns
- Graceful degradation (falls back to mock data)
- Caching strategies (10-minute cache)
- Error handling
- Environment variable configuration

**Try it:**
1. Connect to Weather Server
2. Use "get_current_weather" tool
3. Notice the `dataSource` field (shows "Real-time API data" or "Educational mock data")
4. Try the "weather_analysis" prompt with AI

### Notes Server: Practical Data Management

**What it teaches:**
- CRUD operations
- Search and filtering
- Tag-based organization
- Resource exposure
- Statistics and analytics

**Try it:**
1. Connect to Notes Server
2. Create a note with tags
3. Use "search_notes" to find it
4. View notes as resources
5. Get tag statistics with "get_note_stats"

### Templates Server with AI

**What it teaches:**
- Prompt templates
- AI integration
- Dynamic prompt generation
- Educational use of AI

**Try it:**
1. Configure Anthropic API key
2. Connect to Templates Server
3. Choose a prompt (e.g., "code_review")
4. Fill in arguments
5. Process with Claude AI
6. See token usage metrics

### AI-Powered Prompts Workflow

This is the **key educational feature** showing MCP + AI:

1. **Server provides template** - Weather server has "weather_analysis" prompt
2. **Client retrieves prompt** - With arguments (city name)
3. **AI processes it** - Claude generates analysis
4. **User sees result** - With usage metrics and educational notes

**This demonstrates:**
- How MCP prompts work
- Integration between MCP and AI
- Real-world AI application pattern
- Token usage and cost awareness

## Architecture

```
┌─────────────────────────────────────────────────┐
│                  Client (React)                 │
│  - AI Service (Anthropic)                       │
│  - MCP Client                                   │
│  - Tools, Resources, Prompts UI                 │
└────────────────┬────────────────────────────────┘
                 │ HTTP
┌────────────────▼────────────────────────────────┐
│              Bridge Server                      │
│  - HTTP to stdio translation                    │
│  - Server lifecycle management                  │
│  - Message logging                              │
└────────────────┬────────────────────────────────┘
                 │ stdio
        ┌────────┴────────┐
        │                 │
┌───────▼────┐    ┌───────▼────────┐
│ Calculator │    │   Notes        │
│ Server     │    │   Server       │
│ (Tools)    │    │   (Tools+Res)  │
└────────────┘    └────────────────┘
        │                 │
┌───────▼────────┐ ┌──────▼──────────┐
│   Templates    │ │   Weather       │
│   Server       │ │   Server        │
│   (Prompts)    │ │   (All Three)   │
└────────────────┘ └─────────────────┘
```

## Learning Paths

### Beginner: Understanding MCP Basics
1. Start with Calculator Server (simplest - just tools)
2. Connect and see the MCP initialize handshake
3. Execute a simple tool (add two numbers)
4. Watch the messages panel to see JSON-RPC

### Intermediate: Resources and Data
1. Connect to Notes Server
2. Create and manage notes
3. View them as Resources
4. Understand how MCP exposes data

### Advanced: AI Integration
1. Set up Anthropic API key
2. Connect to Templates or Weather server
3. Use a prompt
4. Process with AI
5. Understand the full workflow

## API Keys and Configuration

### Anthropic API Key (for AI features)
1. Get key from: https://console.anthropic.com/
2. Add to `client/.env`:
   ```
   VITE_ANTHROPIC_API_KEY=your_key_here
   ```
3. Restart client

### OpenWeather API Key (for real weather)
1. Get free key from: https://openweathermap.org/api
2. Set environment variable:
   ```bash
   export OPENWEATHER_API_KEY=your_key_here
   ```
3. Restart servers

**Note:** Both are optional. The demo works without them but with limited functionality.

## Code Structure

```
mcp/
├── client/                 # React client with AI
│   ├── src/
│   │   ├── services/
│   │   │   ├── AIService.ts           # Anthropic integration
│   │   │   └── BridgeMCPClient.ts     # MCP client
│   │   ├── components/
│   │   │   ├── ai/
│   │   │   │   └── AIPromptProcessor.tsx  # AI prompt UI
│   │   │   └── server/
│   │   │       ├── ToolsList.tsx
│   │   │       ├── ResourcesList.tsx
│   │   │       └── PromptsList.tsx
│   │   └── ...
│   └── .env.example       # API key configuration
├── bridge/                # HTTP bridge server
│   ├── src/
│   │   ├── ServerManager.ts  # MCP server lifecycle
│   │   └── index.ts          # HTTP API
│   └── config/
│       └── servers.json      # Server configurations
├── servers/               # MCP servers
│   ├── calculator/       # Tools demo
│   ├── notes/            # Tools + Resources demo
│   ├── templates/        # Prompts demo
│   └── weather/          # All three primitives + real API
└── EDUCATIONAL_GUIDE.md  # This file
```

## Key Concepts Demonstrated

### 1. MCP Protocol
- JSON-RPC 2.0 message format
- Initialize handshake
- Capability negotiation
- Method calls (tools/list, tools/call, etc.)

### 2. Tools (Functions)
- Input schema definition
- Argument validation
- Error handling
- Result formatting

### 3. Resources (Data)
- URI-based addressing (e.g., `note:///123`)
- MIME types
- Dynamic resource lists
- Content delivery

### 4. Prompts (Templates)
- Argument-based templates
- Dynamic prompt generation
- AI integration
- Educational workflows

### 5. Real-World Patterns
- API integration
- Caching strategies
- Error handling
- Graceful degradation
- Configuration management

## Troubleshooting

### "AI features not available"
- Check `.env` file in client directory
- Ensure `VITE_ANTHROPIC_API_KEY` is set
- Restart the client

### "Weather showing mock data"
- Normal! Set `OPENWEATHER_API_KEY` environment variable for real data
- Restart servers after setting it

### "Server won't connect"
- Ensure bridge is running on port 4000
- Check that servers are built (`npm run build`)
- Look at terminal logs for errors

### "No tools/resources/prompts showing"
- Check the server capabilities in UI
- Some servers only have specific primitives
- Make sure you're connected to the server

## Next Steps

After exploring this demo:

1. **Modify a server** - Add your own tool or resource
2. **Create your own prompt** - Add to templates server
3. **Build a new server** - Follow the patterns shown
4. **Integrate other APIs** - Like weather server does
5. **Add AI features** - Use AIService as example

## Resources

- [MCP Specification](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Anthropic API Docs](https://docs.anthropic.com/)
- [OpenWeather API](https://openweathermap.org/api)

## License

MIT - See LICENSE file for details
