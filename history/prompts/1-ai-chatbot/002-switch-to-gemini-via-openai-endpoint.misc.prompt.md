---
id: "002"
title: "Switch to Gemini via OpenAI-compatible Endpoint"
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
  - "gemini"
  - "openai-compatible"
  - "api-switch"
links:
  SPEC: null
  TICKET: null
  ADR: null
  PR: null
files_yaml: |
  - backend/src/agents/chat_agent.py
  - backend/src/core/config.py
tests_yaml: |
  - Removed OpenAI API key usage
  - Configured Gemini via OpenAI-compatible endpoint
  - Updated model initialization
  - Verified application startup
---

# Switch to Gemini via OpenAI-compatible Endpoint

## Summary

Successfully implemented the switch from OpenAI to Google Gemini via the OpenAI-compatible endpoint as requested. The implementation removes all OpenAI API key usage and configures the OpenAI SDK to use Gemini's OpenAI-compatible endpoint.

## Work Completed

### 1. Updated Chat Agent Configuration
- Removed all OpenAI-specific code and fallback mechanisms
- Configured the AsyncOpenAI client to use Gemini's OpenAI-compatible endpoint: `https://generativelanguage.googleapis.com/v1beta/openai/`
- Set up the client to use the GEMINI_API_KEY for authentication
- Updated the agent to use the model specified in settings (default: "gemini-2.0-flash")

### 2. Removed OpenAI API Key Dependencies
- Removed all references to OPENAI_API_KEY from the codebase
- Removed the openai_api_key field from configuration
- Eliminated fallback logic to OpenAI when Gemini is unavailable

### 3. Updated Configuration Requirements
- Made GEMINI_API_KEY a required field in settings (using Field(...) instead of Field(None))
- Set the default model provider to "gemini" instead of "openai"
- Updated the default model name to "gemini-2.0-flash" for better compatibility

### 4. Maintained Agent Compatibility
- Preserved all existing tool functionality (add_task, list_tasks, complete_task, delete_task, update_task)
- Maintained the same conversation processing flow
- Kept the same system message and tool usage patterns
- Ensured that all MCP tools continue to work as expected

### 5. Error Handling
- Maintained proper error handling when GEMINI_API_KEY is missing
- The application now fails fast if the required GEMINI_API_KEY is not set

## Technical Details

The implementation now:
- Uses `openai.AsyncOpenAI(base_url="https://generativelanguage.googleapis.com/v1beta/openai/", api_key=api_key)` to connect to Gemini
- Requires GEMINI_API_KEY to be set in the environment
- Processes messages through the OpenAI SDK but sends requests to Google's Gemini endpoint
- Maintains all existing tool calling functionality
- Preserves conversation history and user isolation

## Verification

The changes were verified by:
- Successfully starting the application without errors
- Confirming that the application fails fast if GEMINI_API_KEY is missing
- Validating that the new configuration doesn't break existing functionality
- Ensuring all tools and conversation features remain operational

## Outcome

The AI Chatbot backend now uses Google Gemini via the OpenAI-compatible endpoint, removing all dependencies on OpenAI's platform while maintaining the same functionality and interface. The application requires GEMINI_API_KEY to be set and will fail fast if it's missing.