"""MCP server implementation for the AI Chatbot feature."""

import json
import logging
from typing import Any, Dict
from uuid import UUID

from .tools.add_task import add_task_tool, validate_add_task_params
from .tools.complete_task import complete_task_tool, validate_complete_task_params
from .tools.complete_task_by_description import complete_task_by_description_tool, validate_complete_task_by_description_params
from .tools.delete_task import delete_task_tool, validate_delete_task_params
from .tools.delete_task_by_description import delete_task_by_description_tool, validate_delete_task_by_description_params
from .tools.list_tasks import list_tasks_tool, validate_list_tasks_params
from .tools.search_tasks_by_title import search_tasks_by_title_tool, validate_search_tasks_by_title_params
from .tools.update_task import update_task_tool, validate_update_task_params
from .tools.update_task_by_description import update_task_by_description_tool, validate_update_task_by_description_params
from sqlalchemy.ext.asyncio import AsyncSession


class MCPServer:
    """MCP server that exposes tools for the OpenAI agent."""

    def __init__(self, session: AsyncSession):
        self.session = session
        self.tools = {
            "add_task": {
                "function": add_task_tool,
                "validator": validate_add_task_params
            },
            "list_tasks": {
                "function": list_tasks_tool,
                "validator": validate_list_tasks_params
            },
            "complete_task": {
                "function": complete_task_tool,
                "validator": validate_complete_task_params
            },
            "complete_task_by_description": {
                "function": complete_task_by_description_tool,
                "validator": validate_complete_task_by_description_params
            },
            "delete_task": {
                "function": delete_task_tool,
                "validator": validate_delete_task_params
            },
            "delete_task_by_description": {
                "function": delete_task_by_description_tool,
                "validator": validate_delete_task_by_description_params
            },
            "update_task": {
                "function": update_task_tool,
                "validator": validate_update_task_params
            },
            "update_task_by_description": {
                "function": update_task_by_description_tool,
                "validator": validate_update_task_by_description_params
            },
            "search_tasks_by_title": {
                "function": search_tasks_by_title_tool,
                "validator": validate_search_tasks_by_title_params
            }
        }

    async def execute_tool(self, tool_name: str, parameters: Dict[str, Any], user_id: str) -> Dict[str, Any]:
        """
        Execute a tool with the provided parameters.

        Following constitution rule: MCP tools must be stateless with structured JSON responses.
        """
        if tool_name not in self.tools:
            raise ValueError(f"Unknown tool: {tool_name}")

        # Get the tool function and validator
        tool_info = self.tools[tool_name]
        validator = tool_info["validator"]
        tool_function = tool_info["function"]

        try:
            # Validate parameters
            validated_params = validator(parameters)

            # Validate that user_id is a valid UUID string
            try:
                UUID(user_id)  # Validate that user_id is a valid UUID
            except ValueError:
                raise ValueError(f"Invalid user_id format: {user_id}")

            # Prepare parameters for the tool function based on the specific tool
            if tool_name == "add_task":
                result = await tool_function(
                    session=self.session,
                    user_id=user_id,
                    title=validated_params["title"],
                    description=validated_params.get("description")
                )
            elif tool_name == "list_tasks":
                result = await tool_function(
                    session=self.session,
                    user_id=user_id,
                    status=validated_params.get("status", "all")
                )
            elif tool_name == "complete_task":
                result = await tool_function(
                    session=self.session,
                    user_id=user_id,
                    task_id=validated_params["task_id"]
                )
            elif tool_name == "delete_task":
                result = await tool_function(
                    session=self.session,
                    user_id=user_id,
                    task_id=validated_params["task_id"]
                )
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
            elif tool_name == "update_task_by_description":
                result = await tool_function(
                    session=self.session,
                    user_id=user_id,
                    task_description=validated_params["task_description"],
                    title=validated_params.get("title"),
                    description=validated_params.get("description")
                )
            elif tool_name == "complete_task_by_description":
                result = await tool_function(
                    session=self.session,
                    user_id=user_id,
                    task_description=validated_params["task_description"],
                    completed=validated_params.get("completed", True)
                )
            else:
                raise ValueError(f"Unknown tool after validation: {tool_name}")

            return result

        except Exception as e:
            # Return structured error response as required by constitution
            logging.error(f"Error executing tool {tool_name}: {str(e)}")
            return {
                "error": str(e)
            }

    def get_tool_schema(self, tool_name: str) -> Dict[str, Any]:
        """Get the schema for a specific tool."""
        # Function declaration format that works with OpenAI-compatible endpoints
        schemas = {
            "add_task": {
                "type": "function",
                "function": {
                    "name": "add_task",
                    "description": "Add a new task to the user's task list",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title": {"type": "string", "description": "The title of the task"},
                            "description": {"type": "string", "description": "Optional description of the task"}
                        },
                        "required": ["title"]
                    }
                }
            },
            "list_tasks": {
                "type": "function",
                "function": {
                    "name": "list_tasks",
                    "description": "List tasks for the user",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "status": {"type": "string", "description": "Filter by status: all, pending, completed"}
                        },
                        "required": []
                    }
                }
            },
            "complete_task": {
                "type": "function",
                "function": {
                    "name": "complete_task",
                    "description": "Mark a task as completed",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "The ID of the task to complete"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            "delete_task": {
                "type": "function",
                "function": {
                    "name": "delete_task",
                    "description": "Delete a task from the user's task list by ID",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "The ID of the task to delete"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            "delete_task_by_description": {
                "type": "function",
                "function": {
                    "name": "delete_task_by_description",
                    "description": "Delete a task from the user's task list by matching its description/title",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_description": {"type": "string", "description": "The description or title of the task to delete"}
                        },
                        "required": ["task_description"]
                    }
                }
            },
            "update_task": {
                "type": "function",
                "function": {
                    "name": "update_task",
                    "description": "Update an existing task",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "description": "The ID of the task to update"},
                            "title": {"type": "string", "description": "New title for the task (optional)"},
                            "description": {"type": "string", "description": "New description for the task (optional)"}
                        },
                        "required": ["task_id"]
                    }
                }
            },
            "update_task_by_description": {
                "type": "function",
                "function": {
                    "name": "update_task_by_description",
                    "description": "Update a task by matching its description/title",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_description": {"type": "string", "description": "The description or title of the task to update"},
                            "title": {"type": "string", "description": "New title for the task (optional)"},
                            "description": {"type": "string", "description": "New description for the task (optional)"}
                        },
                        "required": ["task_description"]
                    }
                }
            },
            "complete_task_by_description": {
                "type": "function",
                "function": {
                    "name": "complete_task_by_description",
                    "description": "Mark a task as completed by matching its description/title",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "task_description": {"type": "string", "description": "The description or title of the task to complete"},
                            "completed": {"type": "boolean", "description": "Whether to mark as completed (default: true)"}
                        },
                        "required": ["task_description"]
                    }
                }
            },
            "search_tasks_by_title": {
                "type": "function",
                "function": {
                    "name": "search_tasks_by_title",
                    "description": "Search for tasks by matching their titles using fuzzy matching",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "title_query": {"type": "string", "description": "The title or part of title to search for"}
                        },
                        "required": ["title_query"]
                    }
                }
            }
        }
        return schemas.get(tool_name, {})

    def get_all_tool_schemas(self) -> list:
        """Get schemas for all available tools."""
        return [self.get_tool_schema(tool_name) for tool_name in self.tools.keys()]