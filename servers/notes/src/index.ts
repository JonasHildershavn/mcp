#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Notes MCP Server - Educational Demo with Practical Features
 *
 * This server demonstrates MCP RESOURCES by exposing notes as accessible data.
 * Resources allow clients to discover and read structured data from the server.
 *
 * Educational Features:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Search and filtering capabilities
 * - Tag-based organization
 * - Resource exposure via MCP
 * - Practical data management patterns
 *
 * This server shows how MCP can be used for real applications like:
 * - Note-taking apps
 * - Document management systems
 * - Knowledge bases
 * - Personal information managers
 */

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// In-memory note storage
const notes = new Map<string, Note>();

// Initialize with sample notes
function initializeSampleNotes() {
  const sampleNotes: Note[] = [
    {
      id: "1",
      title: "Welcome to MCP",
      content: "The Model Context Protocol enables seamless integration between AI models and applications.",
      tags: ["mcp", "introduction"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Understanding Resources",
      content: "Resources in MCP are data that servers expose to clients. They can be files, database records, API responses, or any structured data.",
      tags: ["mcp", "resources", "tutorial"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Shopping List",
      content: "- Milk\n- Bread\n- Eggs\n- Coffee\n- Fruits",
      tags: ["personal", "shopping"],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  sampleNotes.forEach((note) => notes.set(note.id, note));
}

initializeSampleNotes();

// Define tools for note operations
const TOOLS: Tool[] = [
  {
    name: "create_note",
    description: "Create a new note",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string", description: "Note title" },
        content: { type: "string", description: "Note content" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for categorization (optional)",
        },
      },
      required: ["title", "content"],
    },
  },
  {
    name: "update_note",
    description: "Update an existing note",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Note ID" },
        title: { type: "string", description: "New title (optional)" },
        content: { type: "string", description: "New content (optional)" },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "New tags (optional)",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "delete_note",
    description: "Delete a note",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Note ID to delete" },
      },
      required: ["id"],
    },
  },
  {
    name: "search_notes",
    description: "Search notes by tag or content",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Search query" },
        searchIn: {
          type: "string",
          enum: ["title", "content", "tags", "all"],
          description: "Where to search",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "list_all_tags",
    description: "List all unique tags used across all notes",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "get_notes_by_tag",
    description: "Get all notes that have a specific tag",
    inputSchema: {
      type: "object",
      properties: {
        tag: { type: "string", description: "Tag to filter by" },
      },
      required: ["tag"],
    },
  },
  {
    name: "get_note_stats",
    description: "Get statistics about your notes collection",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
];

// Create and configure the MCP server
const server = new Server(
  {
    name: "notes-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {
        listChanged: true,  // Server will notify when tool list changes
      },
      resources: {
        listChanged: true,  // Server will notify when resource list changes
        subscribe: true,    // Server supports resource subscriptions
      },
    },
  }
);

// Handle resource listing
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const resources = Array.from(notes.values()).map((note) => ({
    uri: `note:///${note.id}`,
    mimeType: "application/json",
    name: note.title,
    description: `Note: ${note.title} (Tags: ${note.tags.join(", ")})`,
  }));

  return { resources };
});

// Handle resource reading
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const url = new URL(request.params.uri);
  const noteId = url.pathname.substring(1); // Remove leading slash

  const note = notes.get(noteId);
  if (!note) {
    throw new Error(`Note not found: ${noteId}`);
  }

  return {
    contents: [
      {
        uri: request.params.uri,
        mimeType: "application/json",
        text: JSON.stringify(note, null, 2),
      },
    ],
  };
});

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: TOOLS };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (!args) {
    throw new Error("Missing arguments");
  }

  try {
    switch (name) {
      case "create_note": {
        const id = String(notes.size + 1);
        const newNote: Note = {
          id,
          title: args.title as string,
          content: args.content as string,
          tags: (args.tags as string[]) || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        notes.set(id, newNote);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, note: newNote }, null, 2),
            },
          ],
        };
      }

      case "update_note": {
        const note = notes.get(args.id as string);
        if (!note) {
          throw new Error(`Note not found: ${args.id}`);
        }

        if (args.title) note.title = args.title as string;
        if (args.content) note.content = args.content as string;
        if (args.tags) note.tags = args.tags as string[];
        note.updatedAt = new Date().toISOString();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, note }, null, 2),
            },
          ],
        };
      }

      case "delete_note": {
        const deleted = notes.delete(args.id as string);
        if (!deleted) {
          throw new Error(`Note not found: ${args.id}`);
        }

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ success: true, id: args.id }, null, 2),
            },
          ],
        };
      }

      case "search_notes": {
        const query = (args.query as string).toLowerCase();
        const searchIn = (args.searchIn as string) || "all";
        const results = Array.from(notes.values()).filter((note) => {
          if (searchIn === "title" || searchIn === "all") {
            if (note.title.toLowerCase().includes(query)) return true;
          }
          if (searchIn === "content" || searchIn === "all") {
            if (note.content.toLowerCase().includes(query)) return true;
          }
          if (searchIn === "tags" || searchIn === "all") {
            if (note.tags.some((tag) => tag.toLowerCase().includes(query)))
              return true;
          }
          return false;
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({ results, count: results.length }, null, 2),
            },
          ],
        };
      }

      case "list_all_tags": {
        const allTags = new Set<string>();
        notes.forEach((note) => {
          note.tags.forEach((tag) => allTags.add(tag));
        });

        const tagStats = Array.from(allTags).map((tag) => {
          const count = Array.from(notes.values()).filter((note) =>
            note.tags.includes(tag)
          ).length;
          return { tag, count };
        });

        tagStats.sort((a, b) => b.count - a.count);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                tags: tagStats,
                totalUniqueTags: tagStats.length,
              }, null, 2),
            },
          ],
        };
      }

      case "get_notes_by_tag": {
        const tag = args.tag as string;
        const matchingNotes = Array.from(notes.values()).filter((note) =>
          note.tags.includes(tag)
        );

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                tag,
                notes: matchingNotes,
                count: matchingNotes.length,
              }, null, 2),
            },
          ],
        };
      }

      case "get_note_stats": {
        const allNotes = Array.from(notes.values());
        const totalTags = new Set<string>();
        let totalWords = 0;

        allNotes.forEach((note) => {
          note.tags.forEach((tag) => totalTags.add(tag));
          totalWords += note.content.split(/\s+/).length;
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                statistics: {
                  totalNotes: allNotes.length,
                  totalUniqueTags: totalTags.size,
                  totalWords,
                  averageWordsPerNote: allNotes.length > 0
                    ? Math.round(totalWords / allNotes.length)
                    : 0,
                  mostCommonTags: Array.from(totalTags).slice(0, 5),
                },
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
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
  console.error("Notes MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
