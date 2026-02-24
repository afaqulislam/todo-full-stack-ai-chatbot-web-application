---
id: 6
title: "Fix Mutation Tool Detection for delete_task_by_description"
stage: red
date_iso: 2026-02-23
surface: agent
model: Claude Opus 4.6
feature: "1-ai-chatbot"
branch: "1-ai-chatbot"
user: STAR GAMERZ
command: "/sp.implement fix mutation tool detection"
labels: ["ai-chatbot", "agent-logic", "bug-fix", "tool-detection"]
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

# Fix Mutation Tool Detection for delete_task_by_description

## User Problem
```
{
  "conversation_id": "488dd77d-1a37-4f4f-877c-5f126e2045f6",
  "response": "I couldn't find a task matching that description to delete.",
  "tool_calls": [
    {
      "name": "delete_task_by_description",
      "arguments": {
        "task_description": "imad"
      },
      "result": {
        "task_id": "796a4ce2-44bd-4edd-9182-d03eda749efd",
        "status": "deleted",
        "title": "Imad",
        "matched_description": "imad",
        "match_score": 1
      }
    }
  ]
}
```

## Root Cause
The AI agent was not recognizing `delete_task_by_description` as a mutation tool. In the agent's processing logic:

1. The `has_mutation_tool` check only looked for `["add_task", "update_task", "delete_task", "complete_task"]`
2. It did NOT include `"delete_task_by_description"` in the list
3. When the tool executed successfully, `has_mutation_tool` was `False`
4. The agent then executed the fallback logic: `final_response = self._generate_error_response_for_mutation_failure(message)`
5. This generated "I couldn't find a task matching that description to delete" despite successful execution

## Fix Applied

Updated `backend/src/agents/chat_agent.py` in two locations:

### 1. Mutation tool detection (line ~409-412):
```python
# Before
has_mutation_tool = any(
    tr["name"] in ["add_task", "update_task", "delete_task", "complete_task"]
    for tr in tool_results
)

# After
has_mutation_tool = any(
    tr["name"] in ["add_task", "update_task", "delete_task", "complete_task", "delete_task_by_description"]
    for tr in tool_results
)
```

### 2. Mutation results filtering (line ~422):
```python
# Before
mutation_results = [tr for tr in tool_results if tr["name"] in ["add_task", "update_task", "delete_task", "complete_task"]]

# After
mutation_results = [tr for tr in tool_results if tr["name"] in ["add_task", "update_task", "delete_task", "complete_task", "delete_task_by_description"]]
```

## Impact

The `delete_task_by_description` tool will now be properly recognized as a mutation tool, allowing successful executions to generate appropriate success responses instead of error messages.

## Verification

- When `delete_task_by_description` succeeds, it will be counted as a mutation tool
- The success response will be generated via `_generate_natural_response`
- Error fallback logic will no longer be triggered for successful operations
- Users will receive proper confirmation messages like "Your task 'Imad' has been deleted."

## Evaluation

This fix resolves the disconnect between successful tool execution and incorrect error responses, providing users with accurate feedback when title-based task deletion succeeds.