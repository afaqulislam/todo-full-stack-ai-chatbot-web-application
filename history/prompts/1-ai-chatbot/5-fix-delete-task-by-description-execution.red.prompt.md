---
id: 5
title: "Fix MCP Server Delete Task by Description Execution"
stage: red
date_iso: 2026-02-23
surface: agent
model: Claude Opus 4.6
feature: "1-ai-chatbot"
branch: "1-ai-chatbot"
user: STAR GAMERZ
command: "/sp.implement fix delete_task_by_description execution"
labels: ["ai-chatbot", "mcp-server", "bug-fix", "tool-execution"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "backend/src/mcp/server.py"
tests_yaml:
  - "backend/tests/unit/test_mcp_tools.py"
---

# Fix MCP Server Delete Task by Description Execution

## User Problem
```
{
  "conversation_id": "67d24cae-3485-45f5-9cfb-2c70d368b07b",
  "response": "I couldn't find a task matching that description to delete.",
  "tool_calls": [
    {
      "name": "delete_task_by_description",
      "arguments": {
        "task_description": "imad"
      },
      "result": {
        "error": "Unknown tool after validation: delete_task_by_description"
      }
    }
  ]
}
```

## Root Cause
The MCP server had registered the `delete_task_by_description` tool in its tools dictionary but was missing the execution logic in the `execute_tool` method. When the AI agent tried to call the tool, it would fall through to the `else` clause and raise "Unknown tool after validation: delete_task_by_description" error.

## Fix Applied

Updated `backend/src/mcp/server.py` in the `execute_tool` method to add the missing execution branch for `delete_task_by_description`:

### In the execution logic (lines 104-113):
```python
        elif tool_name == "update_task":
            result = await tool_function(
                session=self.session,
                user_id=user_id,
                task_id=validated_params["task_id"],
                title=validated_params.get("title"),
                description=validated_params.get("description")
            )
        elif tool_name == "delete_task_by_description":
            result = await tool_function(
                session=self.session,
                user_id=user_id,
                task_description=validated_params["task_description"]
            )
        else:
            raise ValueError(f"Unknown tool after validation: {tool_name}")
```

## Impact

The `delete_task_by_description` tool can now be properly executed by the MCP server when called by the AI agent. This allows users to delete tasks by referencing their title or description, which is essential for the title-based matching functionality.

## Verification

- The tool is properly registered in the tools dictionary
- The tool schema is correctly defined for OpenAI function calling
- The execution logic now properly calls `delete_task_by_description_tool` with the correct parameters
- Error handling will now work properly for this tool

## Evaluation

This fix resolves the immediate error preventing the AI agent from using the delete_task_by_description functionality, enabling proper title-based task deletion.