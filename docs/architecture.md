# MCP Educational Demo - Architecture Overview

This document provides a comprehensive overview of the architecture of the MCP Educational Demo project.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Browser                           │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              React Client (Port 3000)                   │ │
│  │  - Interactive UI                                       │ │
│  │  - Server selection                                     │ │
│  │  - Example demonstrations                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ (Educational Demo - UI Only)
                            │
         ┌──────────────────┴──────────────────┐
         │                                      │
         ▼                                      ▼
┌─────────────────┐                   ┌─────────────────┐
│  MCP Protocol   │                   │   Future MCP    │
│  (stdio based)  │                   │   Client Impl   │
└─────────────────┘                   └─────────────────┘
         │
         │
    ┌────┴────┬────────┬────────┬────────┐
    │         │        │        │        │
    ▼         ▼        ▼        ▼        ▼
┌────────┐ ┌──────┐ ┌───────┐ ┌────────┐
│Calculator Notes │Templates Weather │
│ Server │ │Server│ │Server │ │Server  │
└────────┘ └──────┘ └───────┘ └────────┘
   Tools    Resources Prompts  All Three
```

## Components

### 1. MCP Servers

Each server is an independent Node.js process that implements the MCP protocol.

#### Calculator Server (Tools)

**Purpose:** Demonstrate MCP Tools capability

**Technology Stack:**
- TypeScript
- @modelcontextprotocol/sdk
- Node.js stdio transport

**Capabilities:**
- Tools: ✅
- Resources: ❌
- Prompts: ❌

**Design Pattern:**
```
Request Handler → Input Validation → Operation Execution → Response
```

**Key Features:**
- 7 mathematical operations
- Input validation
- Error handling for edge cases (division by zero, negative square roots)
- Structured JSON responses

#### Notes Server (Resources)

**Purpose:** Demonstrate MCP Resources capability

**Technology Stack:**
- TypeScript
- @modelcontextprotocol/sdk
- In-memory data storage

**Capabilities:**
- Tools: ✅ (CRUD operations)
- Resources: ✅ (Note data)
- Prompts: ❌

**Design Pattern:**
```
Resource URI → Resource Resolution → Data Retrieval → Response
Tool Call → Data Mutation → Update Resources → Response
```

**Key Features:**
- Resource-based data access (note:///id)
- CRUD tools for resource management
- Search functionality
- Tag-based organization

#### Templates Server (Prompts)

**Purpose:** Demonstrate MCP Prompts capability

**Technology Stack:**
- TypeScript
- @modelcontextprotocol/sdk
- Template generation functions

**Capabilities:**
- Tools: ❌
- Resources: ❌
- Prompts: ✅

**Design Pattern:**
```
Prompt Request → Parameter Extraction → Template Generation → Prompt Response
```

**Key Features:**
- 5 different prompt templates
- Parameterized prompt generation
- Domain-specific templates (code review, bug reports, documentation)

#### Weather Server (Combined)

**Purpose:** Demonstrate all three MCP capabilities working together

**Technology Stack:**
- TypeScript
- @modelcontextprotocol/sdk
- In-memory weather data cache

**Capabilities:**
- Tools: ✅ (Weather operations)
- Resources: ✅ (Weather data)
- Prompts: ✅ (Weather analysis)

**Design Pattern:**
```
Single Server → Multiple Capability Handlers → Unified Data Model
```

**Key Features:**
- Weather tools (get current, forecast, compare)
- Weather resources (city-based URIs)
- Weather prompts (analysis, recommendations)
- Demonstrates capability composition

### 2. Web Client

**Purpose:** Interactive educational UI to visualize MCP concepts

**Technology Stack:**
- React 18
- TypeScript
- Vite (build tool)
- CSS3 (custom styling)

**Architecture:**
```
App Component
├── Header (Project title)
├── Content
│   ├── Sidebar (Server navigation)
│   │   ├── Server List
│   │   └── MCP Concepts
│   └── Main Content
│       ├── Server Info
│       ├── Examples (interactive)
│       └── Protocol Explanation
└── Footer (Links)
```

**Key Features:**
- Server selection and switching
- Code examples for each capability
- Visual protocol explanation
- Responsive design
- Dark/light mode support

## Data Flow

### Tool Execution Flow

```
1. Client → List Tools Request → Server
2. Server → Available Tools List → Client
3. Client → Call Tool Request (with args) → Server
4. Server → Validate Input
5. Server → Execute Operation
6. Server → Format Response
7. Server → Tool Response → Client
```

### Resource Access Flow

```
1. Client → List Resources Request → Server
2. Server → Available Resources (URIs) → Client
3. Client → Read Resource Request (URI) → Server
4. Server → Parse URI
5. Server → Retrieve Data
6. Server → Format Response
7. Server → Resource Content → Client
```

### Prompt Generation Flow

```
1. Client → List Prompts Request → Server
2. Server → Available Prompts → Client
3. Client → Get Prompt Request (with args) → Server
4. Server → Extract Parameters
5. Server → Generate Prompt Template
6. Server → Prompt Messages → Client
```

## Communication Protocol

### Transport Layer

All servers use **stdio transport**:
- Input: JSON-RPC messages via stdin
- Output: JSON-RPC responses via stdout
- Errors: Logged to stderr

### Message Format

**Request:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "add",
    "arguments": {
      "a": 10,
      "b": 5
    }
  }
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\"result\": 15}"
      }
    ]
  }
}
```

## Design Decisions

### 1. Separate Servers for Each Capability

**Why:** Educational clarity
- Each server focuses on demonstrating one primary capability
- Easier to understand each concept in isolation
- Weather server shows how to combine all three

**Trade-off:** More processes to manage, but better learning experience

### 2. In-Memory Storage

**Why:** Simplicity for demo purposes
- No database setup required
- Fast and easy to understand
- Data resets on restart (acceptable for demo)

**Trade-off:** Not persistent, but that's intentional for a demo

### 3. TypeScript Throughout

**Why:** Type safety and developer experience
- Catches errors at compile time
- Better IDE support
- Self-documenting code with types

### 4. Stdio Transport

**Why:** Standard MCP transport
- Works everywhere
- Simple to implement
- Easy to test manually

**Alternative:** Could use HTTP transport, but stdio is the MCP standard

### 5. React for Client

**Why:** Modern, well-supported framework
- Component-based architecture
- Good developer experience
- Easy to understand for learners

**Alternative:** Could use vanilla JS, but React provides better structure

## Scalability Considerations

This is an educational demo, not a production system. For production:

### Server Scalability

**Current:** In-memory, single process
**Production:**
- Database-backed storage
- Horizontal scaling
- Load balancing
- Caching layers

### Client Scalability

**Current:** Direct connection to servers
**Production:**
- API gateway
- Connection pooling
- Rate limiting
- Authentication/authorization

## Security Model

### Current Implementation

**Educational Focus:**
- Minimal authentication (none)
- Input validation (basic)
- No rate limiting
- No encryption

### Production Requirements

Would need:
- Authentication (API keys, OAuth)
- Authorization (role-based access)
- Input sanitization (prevent injection)
- Rate limiting (prevent abuse)
- TLS/SSL encryption
- Audit logging

## Testing Strategy

### Unit Testing

Each server should have:
- Tool execution tests
- Resource access tests
- Prompt generation tests
- Error handling tests

### Integration Testing

- Client-server communication
- Multi-server scenarios
- Error propagation

### Example Test:

```typescript
describe('Calculator Server', () => {
  it('should add numbers correctly', async () => {
    const result = await callTool('add', { a: 5, b: 3 });
    expect(result.result).toBe(8);
  });

  it('should reject invalid inputs', async () => {
    await expect(
      callTool('add', { a: 'not a number', b: 5 })
    ).rejects.toThrow();
  });
});
```

## Deployment

### Local Development

```bash
npm run dev  # Starts all servers and client
```

### Production Deployment

Would require:
1. Container orchestration (Docker/Kubernetes)
2. Process management (PM2, systemd)
3. Monitoring and logging
4. Health checks
5. Graceful shutdown handling

## Extension Points

### Adding New Servers

1. Create new directory in `servers/`
2. Implement MCP protocol handlers
3. Add to root `package.json` scripts
4. Update client UI to include new server

### Adding New Tools/Resources/Prompts

1. Define in server's capability arrays
2. Implement handlers
3. Add validation
4. Update documentation

### Custom Transports

Could implement:
- HTTP transport (REST API)
- WebSocket transport (real-time)
- IPC transport (inter-process)

## Future Enhancements

Potential additions:
- Real MCP client implementation (not just UI demo)
- Persistent storage (database integration)
- Authentication system
- Real-time updates (WebSockets)
- Server discovery mechanism
- Capability negotiation
- Streaming responses
- Binary data support

## References

- [MCP Specification](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [JSON-RPC 2.0](https://www.jsonrpc.org/specification)

## Summary

This architecture demonstrates:
- ✅ Clean separation of concerns
- ✅ Educational clarity
- ✅ All three MCP capabilities
- ✅ Best practices for MCP development
- ✅ Extensible design
- ✅ Modern TypeScript development

The project successfully balances educational value with practical implementation, making it an excellent resource for learning the Model Context Protocol.
