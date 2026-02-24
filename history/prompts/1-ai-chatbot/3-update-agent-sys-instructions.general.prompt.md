---
id: 3
title: "Update Agent System Instructions for Taskory"
stage: general
date_iso: 2026-02-23
surface: agent
model: Claude Opus 4.6
feature: "1-ai-chatbot"
branch: "1-ai-chatbot"
user: STAR GAMERZ
command: "/sp.implement agent sys instruction update"
labels: ["ai-chatbot", "system-instructions", "taskory", "user-experience"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "backend/src/agents/chat_agent.py"
tests_yaml:
  - "backend/tests/unit/test_mcp_tools.py"
---

# Update Agent System Instructions for Taskory

## User Command
```
/sp.implement you have to change the agent sys instruction in this you have to add that `your are helpful assistant of taskory you have to help user to fulfil there request you have many of tools like update, delete, etc and dont ask user for the taskid you have to use the id by default from backen and you have to search any thing realted to user querry first you have to find by title if you could'nt then try to find by dec if also not then raise exception and you dont ask about any id like task and conversation`
```

## Changes Made

Updated the AI agent's system instructions in `backend/src/agents/chat_agent.py` to reflect the following requirements:

### 1. Taskory Brand Identity
- Added that the agent is a "helpful assistant of Taskory"
- Emphasized the purpose to "help users fulfill their requests by using the tools available"

### 2. Tool Availability
- Explicitly mentioned available tools: "add_task, update_task, delete_task, complete_task, list_tasks, etc."

### 3. No ID Requests Policy
- Added clear instruction: "You should never ask users for any IDs (task or conversation)"
- Emphasized: "You must use the IDs automatically provided by the backend"
- Added: "NEVER ask the user for a task ID. Always search automatically using the available tools"

### 4. Search Priority Rules
- Added explicit search priority: "First try to find by TITLE - prioritize exact and close matches in the task title"
- Fallback to description: "If not found by title, then try to find by DESCRIPTION"
- Exception handling: "If still not found, raise an exception with message: 'I couldn't find a task matching that description to [operation].'"
- Updated TASK RESOLUTION RULES to prioritize title matching first

### 5. Error Handling
- Updated error message to be more specific: "I couldn't find a task matching that description to [operation]."
- Maintained the principle of not asking for IDs

## Impact

The AI Chatbot will now:
- Identify itself as a Taskory assistant
- Never ask users for task or conversation IDs
- Automatically search for tasks using backend-provided IDs
- Prioritize searching by title first, then description
- Provide more specific error messages when tasks can't be found
- Maintain all existing functionality while improving user experience

## Evaluation

The system instruction update successfully addresses all requirements specified by the user, enhancing the AI agent's behavior to be more helpful and less intrusive by eliminating ID requests from users while maintaining effective task resolution capabilities.