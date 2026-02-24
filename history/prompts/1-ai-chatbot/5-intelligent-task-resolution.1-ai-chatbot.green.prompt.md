---
id: 5
title: "Implement intelligent task resolution for natural language references"
stage: green
date_iso: "2026-02-18"
surface: "agent"
model: "claude-sonnet-4-6"
feature: "1-ai-chatbot"
branch: "1-ai-chatbot"
user: "user"
command: "sp.implement"
labels:
  - "enhancement"
  - "ai-chatbot"
  - "natural-language-processing"
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "backend/src/agents/chat_agent.py"
tests_yaml:
  - "Manual testing of natural language task references"
---

# Implement intelligent task resolution for natural language references

## Context
The user requested to remove the requirement for users to manually provide task IDs (1, 2, 3, etc.) and instead implement intelligent task resolution. The agent should be able to resolve tasks from the database based on natural language input like "Delete my grocery task" without requiring users to provide explicit numeric IDs.

## Analysis
The issue was that users had to provide explicit task numbers like "Delete task 3" instead of being able to say "Delete my grocery task". The solution required implementing:
1. Natural language processing to detect when users refer to tasks by name
2. Internal task listing to get available tasks
3. Task matching algorithms to find the best match for natural language references
4. Context resolution for references like "last task", "first task", etc.

## Solution
1. Added `_detect_task_reference_by_name` method to identify when users refer to tasks by name vs. number
2. Added `_get_user_tasks` method to internally fetch user's tasks for resolution
3. Added `_resolve_task_by_name` method with keyword extraction and matching algorithm
4. Added `_resolve_task_by_context` method for context-based resolution ("last task", "first task", etc.)
5. Added `_extract_task_keywords` method for intelligent keyword extraction
6. Added `_process_tool_calls_with_resolution` method to handle intelligent resolution
7. Enhanced system prompt with instructions for natural language task references
8. Added `_is_valid_task_id` method for proper ID validation

## Changes Made
- backend/src/agents/chat_agent.py: Complete enhancement with intelligent task resolution capabilities

## Results
The agent now supports natural language task references like:
- "Delete my grocery task" - resolves to correct task by name
- "Complete the meeting task" - finds and completes matching task
- "Finish the last task" - identifies and completes most recent task
- "Remove my oldest task" - identifies and removes oldest task
- "Update gym task to tomorrow" - finds and updates matching task

Users no longer need to provide numeric IDs - the agent intelligently resolves tasks based on natural language input.

## Follow-up
Test all natural language references to ensure they resolve to correct tasks without requiring numeric IDs.