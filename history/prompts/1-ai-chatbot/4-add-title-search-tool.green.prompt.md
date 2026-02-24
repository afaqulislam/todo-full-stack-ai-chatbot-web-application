---
id: 4
title: "Add Title-Based Search Tool for Tasks"
stage: green
date_iso: 2026-02-23
surface: agent
model: Claude Opus 4.6
feature: "1-ai-chatbot"
branch: "1-ai-chatbot"
user: STAR GAMERZ
command: "/sp.implement add tools for title-based matching"
labels: ["ai-chatbot", "mcp-tools", "title-search", "enhancement"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "backend/src/mcp/tools/search_tasks_by_title.py"
  - "backend/src/mcp/server.py"
  - "backend/src/agents/chat_agent.py"
tests_yaml:
  - "backend/tests/unit/test_mcp_tools.py"
---

# Add Title-Based Search Tool for Tasks

## User Command
```
/sp.implement you haev to make the tools that not by description by title
```

## Changes Made

Enhanced the AI Chatbot with improved title-based matching capabilities by implementing a dedicated search tool and updating system configurations:

### 1. New MCP Tool: search_tasks_by_title
- Created `backend/src/mcp/tools/search_tasks_by_title.py` with fuzzy matching algorithm
- Implements fuzzy string matching to find tasks with similar titles
- Returns tasks with similarity scores for better ranking
- Follows constitution requirements (no direct DB access, uses service layer)

### 2. MCP Server Integration
- Added the new tool to the MCP server in `backend/src/mcp/server.py`
- Added tool schema for OpenAI-compatible function calling
- Integrated validation function for parameter checking

### 3. Agent System Instructions Update
- Updated system message to include the new tool: "search_tasks_by_title, etc."
- Added example usage: "find tasks about groceries" → use search_tasks_by_title
- Maintained all existing functionality while adding new capability

### 4. Enhanced Title Matching Algorithm
- The new tool uses multiple matching strategies:
  - Sequence matching via difflib
  - Fuzzy matching via fuzzywuzzy (if available)
  - Token sort matching for better word order flexibility
- Results are sorted by similarity score (highest first)
- Only returns matches with similarity above 30% threshold

## Impact

The AI Chatbot now has enhanced capabilities to:
- Search for tasks specifically by title using fuzzy matching
- Handle user queries that ask to find tasks by their titles
- Return ranked results based on title similarity
- Provide better matching accuracy when users reference tasks by title content
- Maintain backward compatibility with existing tools

## Technical Details

The `search_tasks_by_title` tool allows the AI agent to:
- Accept a title query string from the user
- Use fuzzy matching to find tasks with similar titles
- Return a list of matching tasks with similarity scores
- Enable better title-based task discovery for all operations

## Evaluation

The implementation successfully provides the requested title-based searching capability while maintaining all existing functionality. The new tool follows the same patterns as other MCP tools, ensuring consistency across the system.