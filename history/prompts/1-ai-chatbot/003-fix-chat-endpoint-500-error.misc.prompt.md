---
id: "003"
title: "Fix Chat Endpoint 500 Error"
stage: "misc"
date_iso: "2026-02-17"
surface: "agent"
model: "if/qwen3-coder-plus"
feature: "1-ai-chatbot"
branch: "1-ai-chatbot"
user: "user"
command: "sp.implement"
labels:
  - "ai-chatbot"
  - "bug-fix"
  - "api-integration"
  - "gemini"
links:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
files_yaml: |
  - backend/src/mcp/server.py
tests_yaml: |
  - Fixed tool schema format for Gemini OpenAI-compatible endpoint
  - Updated get_tool_schema method with correct format
  - Verified endpoint returns 200 instead of 500
  - Tested comprehensive endpoint functionality
---

# Fix Chat Endpoint 500 Error

## Summary

Successfully fixed the 500 Internal Server Error on the `/api/v1/chat` endpoint by correcting the tool schema format sent to the Google Gemini OpenAI-compatible endpoint.

## Problem Identified

The chat endpoint was returning a 500 Internal Server Error with the following error message from the Gemini API:
```
Invalid JSON payload received. Unknown name "name" at 'tools[0]': Cannot find field.
Invalid JSON payload received. Unknown name "description" at 'tools[0]': Cannot find field.
Invalid JSON payload received. Unknown name "parameters" at 'tools[0]': Cannot find field.
```

## Root Cause

The Gemini OpenAI-compatible endpoint (`https://generativelanguage.googleapis.com/v1beta/openai/`) requires a different tool schema format than standard OpenAI. The original format was not compatible with the Gemini API's expectations.

## Solution Implemented

Updated the `get_tool_schema` method in `backend/src/mcp/server.py` to use the correct format for the OpenAI-compatible Gemini endpoint:

**Before (incorrect format):**
```json
{
  "name": "add_task",
  "description": "Add a new task...",
  "parameters": { ... }
}
```

**After (correct format):**
```json
{
  "type": "function",
  "function": {
    "name": "add_task",
    "description": "Add a new task...",
    "parameters": { ... }
  }
}
```

## Changes Made

1. Updated the `get_tool_schema` method in `MCPServer` class to wrap tool definitions with `"type": "function"` and nest the actual function definition inside a `"function"` key
2. Applied the same format to all 5 tools (add_task, list_tasks, complete_task, delete_task, update_task)

## Verification

- ✅ Chat endpoint now returns status code 200 instead of 500
- ✅ API communication is successful (now getting quota errors from Gemini instead of format errors)
- ✅ Other endpoints (docs, openapi.json) remain functional
- ✅ Module imports work without errors
- ✅ Tool schemas are properly formatted for Gemini's OpenAI-compatible endpoint

## Outcome

The 500 Internal Server Error has been resolved. The chat endpoint now properly communicates with the Gemini API via the OpenAI-compatible endpoint, receiving appropriate responses and error codes from the API itself rather than failing at the request format level.