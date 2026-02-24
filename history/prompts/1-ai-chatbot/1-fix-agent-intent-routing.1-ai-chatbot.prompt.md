---
id: 1
title: "Fix Agent Intent Routing"
stage: "green"
date_iso: "2026-02-18"
surface: "agent"
model: "claude-opus-4-6"
feature: "1-ai-chatbot"
branch: "1-ai-chatbot"
user: "claude"
command: "sp.implement"
labels:
  - "agent"
  - "routing"
  - "tool-choice"
  - "intent-classification"
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml: |
  - backend/src/agents/chat_agent.py
tests_yaml: |
  - Test delete task via chatbot
  - Test update task via chatbot
  - Test toggle completion via chatbot
  - Test change priority/status via chatbot
  - Test explicit list tasks still works
prompt_text: |
  OBJECTIVE:
  Fix the agent logic so that Update, Delete, Toggle, and any other action-based intents correctly execute their respective tools.

  Currently:
  - Add task works correctly.
  - Update/Delete do NOT execute.
  - Instead, the agent replies: "I've retrieved your tasks."
  - It incorrectly defaults to the list/get tasks tool.

  STRICT RULE:
  Only modify files inside the agents folder.
  Do NOT modify:
  - API routes
  - Database
  - MCP layer
  - Auth
  - Frontend
  - Tool definitions
  - Any other folder

  ─────────────────────────
  PROBLEM TO FIX
  ─────────────────────────

  The agent is incorrectly routing action intents (update/delete/etc.) to the "list tasks" tool.

  This must be corrected.

  ─────────────────────────
  REQUIREMENTS
  ─────────────────────────

  1. FIX INTENT CLASSIFICATION

  The agent must correctly distinguish between:

  - Create task
  - Update task
  - Delete task
  - Toggle task completion
  - List tasks (only when explicitly requested)

  If the user says:
  "Delete task 3"
  → MUST call delete tool.

  If user says:
  "Mark task 5 complete"
  → MUST call toggle/update tool.

  It must NOT default to list tool unless explicitly asked.

  ─────────────────────────
  2. REMOVE INCORRECT FALLBACK LOGIC

  If current logic says:

  "If uncertain → list tasks"

  Remove or restrict that behavior.

  Fallback must NOT override clear action intent.

  ─────────────────────────
  3. VALIDATE TOOL ARGUMENT EXTRACTION

  Ensure:

  - Task ID is properly parsed
  - Update fields are extracted correctly
  - Tool schema validation is correct
  - Tool call is not rejected silently

  If tool call fails validation:
  - Return meaningful error
  - Do NOT fallback to list tool

  ─────────────────────────
  4. ENSURE TOOL EXECUTION OCCURS

  After tool selection:

  - Tool must be executed
  - Result must be awaited
  - Result must be passed back to LLM
  - LLM must generate contextual confirmation

  No silent tool failures allowed.

  ─────────────────────────
  5. FIX ALL ACTION TYPES

  Audit ALL action tools:

  - update
  - delete
  - toggle
  - priority change
  - status change
  - any other mutation

  If similar misrouting exists → fix it.

  ─────────────────────────
  6. RESPONSE REQUIREMENTS

  After successful action:

  - Return natural confirmation
  - Mention affected task
  - Do not say "I've retrieved your tasks"
  - Do not fallback to listing

  ─────────────────────────
  7. VALIDATION

  After implementation:

  Test:

  - Delete task via chatbot
  - Update title via chatbot
  - Toggle completion
  - Change priority/status
  - Explicitly ask to list tasks

  Confirm:
  - Correct tool is selected
  - Correct tool executes
  - No fallback misrouting
  - No regression in create task
response_text: |
  Fixed the agent logic by making the following changes to backend/src/agents/chat_agent.py:

  1. REVAMPED SYSTEM MESSAGE:
     - Added explicit rules for tool selection based on intent
     - Strongly emphasized "NEVER default to list_tasks unless explicitly asked"
     - Added specific examples for all action types
     - Included examples for priority/status changes

  2. IMPROVED ERROR HANDLING:
     - Added try-catch blocks around tool execution
     - Proper error responses for all tool types
     - Clear error messages to users instead of silent failures

  3. ENHANCED RESPONSE PRIORITIZATION:
     - Action responses take priority over list responses
     - Fixed "I've retrieved your tasks" fallback issue
     - Proper handling of list_tasks response format

  4. STRENGTHENED TOOL EXECUTION:
     - Better error handling prevents silent failures
     - Action-based operations are prioritized correctly
     - Clear, contextual responses after successful actions

  All changes were made within the agents folder only, as required.
outcome: |
  The agent now correctly routes action intents (Update, Delete, Toggle) to their respective tools instead of defaulting to list_tasks. Intent classification is improved with clear system instructions, error handling is robust, and response prioritization ensures action responses take precedence over list responses.
evaluation: |
  After implementation:
  - Delete task via chatbot: ✅ Uses delete_task tool
  - Update title via chatbot: ✅ Uses update_task tool
  - Toggle completion: ✅ Uses complete_task tool
  - Change priority/status: ✅ Uses update_task tool
  - Explicitly ask to list tasks: ✅ Uses list_tasks tool
  - No fallback misrouting: ✅ Fixed
  - No regression in create task: ✅ Confirmed
---