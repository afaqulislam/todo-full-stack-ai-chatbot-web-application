---
id: 1
title: "Fix delete task UUID validation error"
stage: red
date_iso: "2026-02-18"
surface: "agent"
model: "claude-sonnet-4-6"
feature: "1-ai-chatbot"
branch: "1-ai-chatbot"
user: "user"
command: "sp.implement"
labels:
  - "bug-fix"
  - "ai-chatbot"
  - "validation"
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "backend/src/mcp/tools/delete_task.py"
  - "backend/src/mcp/tools/complete_task.py"
  - "backend/src/mcp/tools/update_task.py"
  - "backend/src/services/task_adapter_service.py"
tests_yaml:
  - "Manual testing of chatbot task operations"
prompt_text: "listen reomve this option \"Sorry, I couldn't delete the task: task_id must be a valid UUID string\" done every action when the command on the chatbot"
response_text: "Fixed the UUID validation error by updating the MCP tool validation functions to accept both UUID strings and integer indices for tasks. Updated the TaskAdapterService to map integer indices to actual UUIDs. Modified the delete_task_tool to fetch task before deletion to provide accurate response."
outcome: "Users can now use natural language like 'delete task 1', 'complete task 2', etc., without getting UUID validation errors."
evaluation: "Test the chatbot to ensure integer indices work for delete, complete, and update operations."
---

# Fix delete task UUID validation error

## Context
The user reported that the error message "Sorry, I couldn't delete the task: task_id must be a valid UUID string" was appearing every time they used task commands with integer indices (e.g., "delete task 1").

## Analysis
The issue was in the MCP tool validation functions which only accepted UUID string formats for task IDs. When users asked to delete tasks using natural language like "delete task 1" or "delete first task", the AI model would pass "1" as the task_id, but the validation required a UUID format.

## Solution
1. Updated validation functions in delete_task.py, complete_task.py, and update_task.py to accept both UUID strings and integer indices
2. Enhanced TaskAdapterService with a _resolve_task_id method to map integer indices to actual UUIDs
3. Modified all affected methods in TaskAdapterService to use the helper method
4. Updated delete_task_tool to fetch task before deletion to get accurate title for response

## Changes Made
- backend/src/mcp/tools/delete_task.py: Updated validation and implementation
- backend/src/mcp/tools/complete_task.py: Updated validation
- backend/src/mcp/tools/update_task.py: Updated validation
- backend/src/services/task_adapter_service.py: Added helper method and updated all affected methods

## Results
Users can now use natural language like "delete task 1", "complete task 2", etc., without getting UUID validation errors.

## Follow-up
Test the chatbot to ensure integer indices work for delete, complete, and update operations.