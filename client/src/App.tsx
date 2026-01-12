import { useState } from 'react'
import './App.css'

type ServerType = 'calculator' | 'notes' | 'templates' | 'weather'

interface DemoExample {
  title: string
  description: string
  action: string
  code: string
}

function App() {
  const [activeServer, setActiveServer] = useState<ServerType>('calculator')

  const serverExamples: Record<ServerType, DemoExample[]> = {
    calculator: [
      {
        title: 'Basic Addition',
        description: 'Demonstrates calling the "add" tool',
        action: 'add(10, 5)',
        code: `// MCP Tool Call
{
  "name": "add",
  "arguments": {
    "a": 10,
    "b": 5
  }
}

// Response
{
  "result": 15
}`
      },
      {
        title: 'Calculate Factorial',
        description: 'Advanced mathematical operation',
        action: 'factorial(5)',
        code: `// MCP Tool Call
{
  "name": "factorial",
  "arguments": {
    "n": 5
  }
}

// Response
{
  "result": 120
}`
      }
    ],
    notes: [
      {
        title: 'List All Notes',
        description: 'Demonstrates listing resources',
        action: 'ListResources',
        code: `// MCP Resource List Request
ListResourcesRequest

// Response
{
  "resources": [
    {
      "uri": "note:///1",
      "name": "Welcome to MCP",
      "mimeType": "application/json"
    },
    {
      "uri": "note:///2",
      "name": "Understanding Resources",
      "mimeType": "application/json"
    }
  ]
}`
      },
      {
        title: 'Read a Note',
        description: 'Access a resource by URI',
        action: 'ReadResource("note:///1")',
        code: `// MCP Resource Read Request
{
  "uri": "note:///1"
}

// Response
{
  "id": "1",
  "title": "Welcome to MCP",
  "content": "The Model Context Protocol...",
  "tags": ["mcp", "introduction"]
}`
      },
      {
        title: 'Create New Note',
        description: 'Use tool to create resource',
        action: 'create_note',
        code: `// MCP Tool Call
{
  "name": "create_note",
  "arguments": {
    "title": "My New Note",
    "content": "This is a new note",
    "tags": ["example"]
  }
}

// Response
{
  "success": true,
  "note": {
    "id": "4",
    "title": "My New Note",
    ...
  }
}`
      }
    ],
    templates: [
      {
        title: 'Code Review Prompt',
        description: 'Get a code review template',
        action: 'GetPrompt("code_review")',
        code: `// MCP Prompt Request
{
  "name": "code_review",
  "arguments": {
    "language": "TypeScript",
    "focus_areas": "security, performance"
  }
}

// Response (Prompt Template)
Please review the following TypeScript code
with focus on security, performance.

Consider:
1. Code Quality
2. Performance
3. Security
...`
      },
      {
        title: 'Bug Report Template',
        description: 'Generate bug report structure',
        action: 'GetPrompt("bug_report")',
        code: `// MCP Prompt Request
{
  "name": "bug_report",
  "arguments": {
    "severity": "high",
    "component": "auth"
  }
}

// Response (Prompt Template)
# Bug Report in auth

**Severity**: HIGH

## Description
[Clear description]

## Steps to Reproduce
...`
      }
    ],
    weather: [
      {
        title: 'Get Current Weather (Tool)',
        description: 'Call weather tool',
        action: 'get_current_weather("Tokyo")',
        code: `// MCP Tool Call
{
  "name": "get_current_weather",
  "arguments": {
    "city": "Tokyo"
  }
}

// Response
{
  "city": "Tokyo",
  "temperature": "22°C",
  "conditions": "Clear",
  "humidity": "65%"
}`
      },
      {
        title: 'Weather Resource',
        description: 'Access weather as resource',
        action: 'ReadResource("weather:///tokyo")',
        code: `// MCP Resource Read
{
  "uri": "weather:///tokyo"
}

// Response
{
  "city": "Tokyo",
  "temperature": 22,
  "forecast": ["Clear", "Sunny", ...],
  "lastUpdated": "2026-01-12T..."
}`
      },
      {
        title: 'Weather Analysis Prompt',
        description: 'Get analysis template',
        action: 'GetPrompt("weather_analysis")',
        code: `// MCP Prompt Request
{
  "name": "weather_analysis",
  "arguments": {
    "city": "Tokyo"
  }
}

// Response (Prompt Template)
Analyze weather in Tokyo, Japan:

Current: 22°C, Clear
Forecast: Clear, Sunny...

Provide:
1. Overall assessment
2. Activity recommendations
...`
      }
    ]
  }

  const serverInfo = {
    calculator: {
      name: 'Calculator Server',
      capability: 'Tools',
      description: 'Demonstrates MCP Tools - functions that can be called to perform operations',
      color: '#3b82f6'
    },
    notes: {
      name: 'Notes Server',
      capability: 'Resources',
      description: 'Demonstrates MCP Resources - structured data that can be accessed via URIs',
      color: '#10b981'
    },
    templates: {
      name: 'Templates Server',
      capability: 'Prompts',
      description: 'Demonstrates MCP Prompts - reusable prompt templates with parameters',
      color: '#f59e0b'
    },
    weather: {
      name: 'Weather Server',
      capability: 'All Three',
      description: 'Demonstrates Tools, Resources, AND Prompts working together',
      color: '#8b5cf6'
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🚀 MCP Educational Demo</h1>
        <p className="subtitle">Interactive Model Context Protocol Demonstration</p>
      </header>

      <div className="content">
        <aside className="sidebar">
          <h2>MCP Servers</h2>
          <div className="server-list">
            {(Object.keys(serverInfo) as ServerType[]).map((server) => (
              <button
                key={server}
                className={`server-button ${activeServer === server ? 'active' : ''}`}
                onClick={() => setActiveServer(server)}
                style={{
                  borderLeft: activeServer === server
                    ? `4px solid ${serverInfo[server].color}`
                    : '4px solid transparent'
                }}
              >
                <div className="server-button-content">
                  <div className="server-name">{serverInfo[server].name}</div>
                  <div className="server-capability">{serverInfo[server].capability}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mcp-concepts">
            <h3>MCP Concepts</h3>
            <div className="concept">
              <strong>Tools:</strong> Callable functions
            </div>
            <div className="concept">
              <strong>Resources:</strong> Accessible data
            </div>
            <div className="concept">
              <strong>Prompts:</strong> Reusable templates
            </div>
          </div>
        </aside>

        <main className="main-content">
          <div className="server-header" style={{ borderTopColor: serverInfo[activeServer].color }}>
            <h2>{serverInfo[activeServer].name}</h2>
            <div className="capability-badge" style={{ backgroundColor: serverInfo[activeServer].color }}>
              {serverInfo[activeServer].capability}
            </div>
          </div>
          <p className="server-description">{serverInfo[activeServer].description}</p>

          <div className="examples">
            <h3>Interactive Examples</h3>
            <div className="examples-grid">
              {serverExamples[activeServer].map((example, index) => (
                <div key={index} className="example-card">
                  <div className="example-header">
                    <h4>{example.title}</h4>
                    <span className="example-action">{example.action}</span>
                  </div>
                  <p className="example-description">{example.description}</p>
                  <pre className="example-code"><code>{example.code}</code></pre>
                </div>
              ))}
            </div>
          </div>

          <div className="protocol-info">
            <h3>How It Works</h3>
            <div className="protocol-steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>Client Discovery</strong>
                  <p>Client queries server for available capabilities (tools/resources/prompts)</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Client Request</strong>
                  <p>Client sends structured request with parameters to server</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>Server Processing</strong>
                  <p>Server processes request and executes the requested operation</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <strong>Server Response</strong>
                  <p>Server returns structured response with results or data</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <footer className="footer">
        <p>
          Learn more: <a href="https://modelcontextprotocol.io" target="_blank" rel="noopener noreferrer">
            MCP Specification
          </a> | <a href="https://github.com/modelcontextprotocol/typescript-sdk" target="_blank" rel="noopener noreferrer">
            TypeScript SDK
          </a>
        </p>
      </footer>
    </div>
  )
}

export default App
