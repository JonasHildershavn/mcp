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
    description: "Generate a comprehensive code review template",
    arguments: [
      {
        name: "language",
        description: "Programming language (e.g., TypeScript, Python, Java)",
        required: true,
      },
      {
        name: "focus_areas",
        description: "Specific areas to focus on (e.g., security, performance, style)",
        required: false,
      },
    ],
  },
  {
    name: "bug_report",
    description: "Create a structured bug report template",
    arguments: [
      {
        name: "severity",
        description: "Bug severity level (low, medium, high, critical)",
        required: true,
      },
      {
        name: "component",
        description: "Affected component or module",
        required: false,
      },
    ],
  },
  {
    name: "documentation",
    description: "Generate documentation template for code",
    arguments: [
      {
        name: "doc_type",
        description: "Type of documentation (API, tutorial, README, architecture)",
        required: true,
      },
      {
        name: "project_name",
        description: "Name of the project",
        required: false,
      },
    ],
  },
  {
    name: "test_case",
    description: "Create a test case template",
    arguments: [
      {
        name: "test_type",
        description: "Type of test (unit, integration, e2e)",
        required: true,
      },
      {
        name: "framework",
        description: "Testing framework (Jest, Mocha, PyTest, etc.)",
        required: false,
      },
    ],
  },
  {
    name: "refactoring_plan",
    description: "Generate a refactoring plan template",
    arguments: [
      {
        name: "refactoring_type",
        description: "Type of refactoring (extract method, rename, simplify, etc.)",
        required: true,
      },
      {
        name: "scope",
        description: "Scope of refactoring (function, class, module, system)",
        required: false,
      },
    ],
  },
];

// Prompt template generators
function generateCodeReviewPrompt(language: string, focusAreas?: string): string {
  const areas = focusAreas || "code quality, performance, security, and best practices";
  return `Please review the following ${language} code with focus on ${areas}.

Consider the following aspects:
1. **Code Quality**: Is the code clean, readable, and maintainable?
2. **Performance**: Are there any performance bottlenecks or inefficiencies?
3. **Security**: Are there any security vulnerabilities or concerns?
4. **Best Practices**: Does the code follow ${language} best practices and conventions?
5. **Testing**: Is the code testable? Are there adequate tests?
6. **Documentation**: Is the code well-documented?

Please provide:
- Summary of findings
- Specific issues with line numbers (if applicable)
- Suggestions for improvements
- Severity rating for each issue (low/medium/high)

Code to review:
[Paste your ${language} code here]`;
}

function generateBugReportPrompt(severity: string, component?: string): string {
  const componentText = component ? ` in ${component}` : "";
  return `# Bug Report${componentText}

**Severity**: ${severity.toUpperCase()}

## Description
[Provide a clear and concise description of the bug]

## Steps to Reproduce
1. [First step]
2. [Second step]
3. [And so on...]

## Expected Behavior
[Describe what you expected to happen]

## Actual Behavior
[Describe what actually happened]

## Environment
- OS: [e.g., Windows 10, macOS 13.0, Ubuntu 22.04]
- Browser/Runtime: [e.g., Chrome 120, Node.js 20.0]
- Version: [e.g., v1.2.3]

## Additional Context
[Add any other context about the problem here]

## Screenshots/Logs
[If applicable, add screenshots or error logs]

## Possible Solution
[Optional: suggest a fix or reason for the bug]`;
}

function generateDocumentationPrompt(docType: string, projectName?: string): string {
  const project = projectName || "Your Project";

  switch (docType.toLowerCase()) {
    case "api":
      return `# ${project} API Documentation

## Overview
[Brief description of the API]

## Authentication
[How to authenticate with the API]

## Base URL
\`\`\`
https://api.example.com/v1
\`\`\`

## Endpoints

### [Endpoint Name]
\`\`\`
[METHOD] /endpoint/path
\`\`\`

**Description**: [What this endpoint does]

**Parameters**:
- \`param1\` (type, required/optional): Description
- \`param2\` (type, required/optional): Description

**Request Example**:
\`\`\`json
{
  "param1": "value",
  "param2": "value"
}
\`\`\`

**Response Example**:
\`\`\`json
{
  "result": "value",
  "status": "success"
}
\`\`\`

**Error Responses**:
- \`400\`: Bad Request
- \`401\`: Unauthorized
- \`404\`: Not Found
- \`500\`: Internal Server Error`;

    case "readme":
      return `# ${project}

[Brief project description in one paragraph]

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install ${project.toLowerCase().replace(/\s+/g, "-")}
\`\`\`

## Quick Start

\`\`\`javascript
// Example usage code
\`\`\`

## Documentation

[Link to full documentation]

## Examples

### Example 1: [Description]
\`\`\`javascript
// Example code
\`\`\`

## API Reference

[Link to API documentation or include brief reference]

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

[License type] - see [LICENSE](LICENSE) file for details

## Support

- Documentation: [Link]
- Issues: [Link to issue tracker]
- Discussions: [Link to discussions]`;

    case "tutorial":
      return `# ${project} Tutorial

## Introduction
[What this tutorial will teach and who it's for]

## Prerequisites
- Prerequisite 1
- Prerequisite 2

## Step 1: [First Step Title]
[Explanation of the first step]

\`\`\`code
// Example code
\`\`\`

**Expected Output**:
\`\`\`
[What you should see]
\`\`\`

## Step 2: [Second Step Title]
[Explanation of the second step]

## Common Issues
- **Issue**: Description
  **Solution**: How to fix

## Next Steps
- What to learn next
- Related tutorials

## Conclusion
[Summary of what was learned]`;

    case "architecture":
      return `# ${project} Architecture

## Overview
[High-level description of the system architecture]

## System Components

### Component 1
**Purpose**: [What this component does]
**Technologies**: [List of technologies used]
**Responsibilities**:
- Responsibility 1
- Responsibility 2

### Component 2
[Similar structure as above]

## Data Flow
1. [Step 1 in data flow]
2. [Step 2 in data flow]
3. [And so on...]

## Technology Stack
- **Frontend**: [Technologies]
- **Backend**: [Technologies]
- **Database**: [Technologies]
- **Infrastructure**: [Technologies]

## Design Patterns
- [Pattern 1]: [Why and where it's used]
- [Pattern 2]: [Why and where it's used]

## Security Considerations
- [Security measure 1]
- [Security measure 2]

## Scalability
[How the system scales]

## Deployment
[How the system is deployed]

## Monitoring and Logging
[Monitoring and logging strategy]`;

    default:
      return `# ${project} Documentation

[Start your ${docType} documentation here]`;
  }
}

function generateTestCasePrompt(testType: string, framework?: string): string {
  const frameworkText = framework ? ` using ${framework}` : "";
  return `# ${testType.toUpperCase()} Test Case${frameworkText}

## Test Description
[Describe what this test validates]

## Test Setup
\`\`\`javascript
// Setup code (e.g., creating test data, mocking dependencies)
\`\`\`

## Test Execution
\`\`\`javascript
describe('[Component/Feature Name]', () => {
  beforeEach(() => {
    // Setup before each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  it('should [expected behavior]', async () => {
    // Arrange: Set up test conditions
    const input = {};

    // Act: Execute the code being tested
    const result = await functionUnderTest(input);

    // Assert: Verify the results
    expect(result).toEqual(expectedOutput);
  });

  it('should handle [edge case or error condition]', async () => {
    // Test edge cases
  });
});
\`\`\`

## Expected Results
- [Expected result 1]
- [Expected result 2]

## Edge Cases to Test
- [Edge case 1]
- [Edge case 2]

## Test Data
\`\`\`javascript
// Sample test data
\`\`\`

## Notes
[Any additional information about this test]`;
}

function generateRefactoringPlanPrompt(refactoringType: string, scope?: string): string {
  const scopeText = scope ? ` (Scope: ${scope})` : "";
  return `# Refactoring Plan: ${refactoringType}${scopeText}

## Objective
[Clearly state the goal of this refactoring]

## Current State
[Describe the current implementation and what problems it has]

\`\`\`javascript
// Current code example
\`\`\`

**Issues**:
- Issue 1
- Issue 2
- Issue 3

## Proposed Changes
[Describe the refactoring changes in detail]

\`\`\`javascript
// Proposed code example
\`\`\`

**Benefits**:
- Benefit 1
- Benefit 2
- Benefit 3

## Impact Analysis
- **Performance**: [Impact on performance]
- **Breaking Changes**: [Any breaking changes]
- **Dependencies**: [Affected dependencies]
- **Tests**: [Tests that need updating]

## Implementation Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. Run tests to verify no regressions
5. Update documentation

## Rollback Plan
[How to revert if issues arise]

## Testing Strategy
- [ ] Unit tests updated
- [ ] Integration tests updated
- [ ] Manual testing completed
- [ ] Performance testing (if applicable)

## Timeline
- **Estimated Effort**: [Time estimate]
- **Dependencies**: [Prerequisites or blockers]

## Risks and Mitigation
- **Risk 1**: [Description] → **Mitigation**: [How to address]
- **Risk 2**: [Description] → **Mitigation**: [How to address]`;
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
        args?.language as string,
        args?.focus_areas as string | undefined
      );
      break;

    case "bug_report":
      promptText = generateBugReportPrompt(
        args?.severity as string,
        args?.component as string | undefined
      );
      break;

    case "documentation":
      promptText = generateDocumentationPrompt(
        args?.doc_type as string,
        args?.project_name as string | undefined
      );
      break;

    case "test_case":
      promptText = generateTestCasePrompt(
        args?.test_type as string,
        args?.framework as string | undefined
      );
      break;

    case "refactoring_plan":
      promptText = generateRefactoringPlanPrompt(
        args?.refactoring_type as string,
        args?.scope as string | undefined
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
