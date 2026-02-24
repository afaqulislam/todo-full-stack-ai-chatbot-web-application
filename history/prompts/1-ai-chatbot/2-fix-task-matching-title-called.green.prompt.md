---
id: 2
title: "Fix Task Matching by Title for 'called' Commands"
stage: green
date_iso: 2026-02-23
surface: agent
model: Claude Opus 4.6
feature: "1-ai-chatbot"
branch: "1-ai-chatbot"
user: STAR GAMERZ
command: "/sp.implement delete task called imad"
labels: ["bug-fix", "ai-chatbot", "mcp", "task-matching", "title-search"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "backend/src/agents/chat_agent.py"
  - "backend/src/mcp/tools/delete_task_by_description.py"
tests_yaml:
  - "backend/tests/unit/test_mcp_tools.py"
---

# Fix Task Matching by Title for 'called' Commands

## User Command
```
/sp.implement the issue is that when i give the command to bot `user: delete task called imad
Assistant: I couldn't find a task matching that description to delete.` and this situation for all tools make that able to access task by title not using the description!
```

## Problem Analysis

The AI Chatbot was not properly matching tasks by title when users used phrases like "delete task called imad". The system was failing to:

1. Extract the title keyword ("imad") from phrases containing "called", "named", "titled", etc.
2. Prioritize title matches when users specifically used title-indicating phrases
3. Handle title-specific queries consistently across all mutation operations (delete, update, complete)

## Solution Implemented

### 1. Enhanced Task Description Extraction
- Updated `_extract_task_description_from_message()` function to handle phrases like "called", "named", "titled", "with title", etc.
- The function now properly extracts "imad" from "delete task called imad"

### 2. Title-Specific Fuzzy Matching
- Enhanced `_find_task_by_fuzzy_match()` function to detect title-specific queries and prioritize title matches
- Added `is_title_specific` logic that boosts title matching scores when phrases like "called" are detected
- Lowered matching threshold for title-specific queries to improve success rate

### 3. Dedicated Title Matching Function
- Added `_find_task_by_title_match()` function specifically for high-confidence title matching
- Prioritizes exact matches, then partial matches for title-specific queries
- Uses 60% similarity threshold for title-specific queries (vs general matching)

### 4. Updated Mutation Operation Handling
- Enhanced logic for delete_task, update_task, and complete_task operations
- All mutation operations now check for title-specific indicators and use appropriate matching
- Improved fallback logic between title-specific and general matching

### 5. Enhanced Delete Task Tool
- Updated `_find_best_task_match()` in delete_task_by_description.py to detect title-specific queries
- Adjusted matching thresholds for title-specific queries
- Maintained backward compatibility for general description matching

### 6. Enhanced System Prompt
- Added examples to system message showing proper handling of "called", "named", "titled" phrases
- Examples now include: "delete task called imad", "update task named meeting", "complete task titled weekly report"

## Technical Changes

### In `backend/src/agents/chat_agent.py`:
- Enhanced `_extract_task_description_from_message()` to handle context phrases
- Added `_find_task_by_title_match()` for dedicated title matching
- Enhanced `_find_task_by_fuzzy_match()` with title-specific logic
- Updated mutation operation handling to use title-specific matching
- Enhanced system prompt with title-specific examples

### In `backend/src/mcp/tools/delete_task_by_description.py`:
- Enhanced `_find_best_task_match()` to detect and prioritize title-specific queries

## Outcome

The AI Chatbot now properly handles commands like:
- "delete task called imad" → finds and deletes task with "imad" in the title
- "update task named meeting" → finds and updates task with "meeting" in the title
- "complete task titled weekly report" → finds and completes task with "weekly report" in the title
- All mutation operations (delete, update, complete) consistently handle title-specific queries

## Testing

The fix ensures that title-specific phrases are properly recognized and processed, improving the user experience when referencing tasks by their specific titles rather than relying on general fuzzy matching.

## Evaluation

The implementation successfully addresses the reported issue. Users can now use natural language phrases like "called", "named", and "titled" when referring to specific tasks, and the system will properly match tasks by their titles with increased accuracy.