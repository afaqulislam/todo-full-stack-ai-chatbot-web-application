---
id: 9
title: fix-delete-by-description-fuzzy-matching
stage: red
date: 2026-02-20
surface: agent
model: if/qwen3-coder-plus
feature: 1-ai-chatbot
branch: 1-ai-chatbot
user: Claude User
command: sp.implement
labels: ["ai-chatbot", "deletion", "fuzzy-matching", "bug-fix"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/mcp/tools/delete_task_by_description.py
  - backend/src/mcp/server.py
  - backend/src/agents/chat_agent.py
  - backend/requirements.txt
  - IMPLEMENTATION_SUMMARY.md
tests:
  - backend/tests/unit/test_mcp_tools.py
  - backend/tests/integration/test_chat_endpoint.py
---

## Prompt

You are an AI developer assistant.

I have a task management agent where mutation routing (add, update, delete, complete) is working correctly, but deletion is failing when tasks exist.

Problem:
- When the user types "delete Buy groceries" or "delete Imad priority hhigh", the agent returns:
  "I couldn't find a task matching that description to delete."
- Tasks exist in the internal list, but fuzzy matching or normalization is failing.

Requirements:
1. Ensure deletion works even if there are extra spaces, capitalization differences, or minor typos.
2. Normalize both user input and task list (trim spaces, lowercase).
3. Adjust fuzzy matching threshold to allow approximate matches.
4. Confirm deletion by returning a message like: "Your task 'Buy groceries' has been deleted."
5. Keep mutation routing intact (mutations have priority; no fallback to list responses).
6. Add debug logs to verify task matching and deletion.

Deliverable:
- Provide updated Python code snippet for the delete logic that integrates

## Response snapshot

I have successfully implemented the fix for the deletion functionality that improves fuzzy matching for task descriptions. Here's what was implemented:

### 1. New MCP Tool: delete_task_by_description
- Created a new MCP tool in `backend/src/mcp/tools/delete_task_by_description.py` with robust fuzzy matching
- Implements multiple matching strategies: sequence matching, fuzzywuzzy partial_ratio, token_sort_ratio, token_set_ratio
- Includes proper input normalization (trimming, lowercasing, removing extra whitespace)
- Uses configurable similarity threshold (30%)

### 2. Updated MCP Server
- Added the new tool to `backend/src/mcp/server.py` with proper registration and schema
- Added OpenAI-compatible schema for the new function

### 3. Enhanced Chat Agent
- Updated `backend/src/agents/chat_agent.py` to extract task descriptions from user messages
- Enhanced delete handling to use new fuzzy matching when traditional ID resolution fails
- Added debug logging to help verify task matching

### 4. Improved Fuzzy Matching
- Enhanced existing `_find_task_by_fuzzy_match` function with better algorithms
- Added comprehensive normalization of inputs
- Multiple matching strategies for better accuracy

### 5. Files Modified/Added:
- `backend/src/mcp/tools/delete_task_by_description.py` (new)
- `backend/src/mcp/server.py` (updated)
- `backend/src/agents/chat_agent.py` (updated)
- `backend/requirements.txt` (updated)
- `IMPLEMENTATION_SUMMARY.md` (updated)

The solution has been tested and all test cases pass:
- "delete Buy groceries" → correctly matches "Buy groceries"
- "delete Imad priority hhigh" → correctly matches "Imad priority high" with typo tolerance
- Various other fuzzy matching scenarios work properly

## Outcome

- ✅ Impact: Fixed deletion by description functionality with improved fuzzy matching
- 🧪 Tests: New fuzzy matching function tested and verified to work with typos and variations
- 📁 Files: Added delete_task_by_description tool and updated agent/chat server logic
- 🔁 Next prompts: Verify the deletion functionality works end-to-end in the UI
- 🧠 Reflection: The solution implemented a new MCP tool that handles fuzzy matching by description, enhancing the existing task resolution logic

## Evaluation notes (flywheel)

- Failure modes observed: Original delete_task tool only accepted IDs, not fuzzy descriptions
- Graders run and results (PASS/FAIL): All fuzzy matching tests pass
- Prompt variant (if applicable): Original implementation needed enhancement for description-based deletion
- Next experiment (smallest change to try): Test the functionality in real-world scenarios with various user inputs