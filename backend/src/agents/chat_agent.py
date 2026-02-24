"""OpenRouter AI agent implementation for the AI Chatbot feature."""

import asyncio
import json
import os
import re
from typing import Any, Dict, List
from difflib import SequenceMatcher

# Import fuzzy matching - make it optional to avoid startup issues
try:
    from fuzzywuzzy import fuzz

    FUZZY_ENABLED = True
except ImportError:
    fuzz = None
    FUZZY_ENABLED = False

from ..core.config import settings
from ..mcp.server import MCPServer
from sqlalchemy.ext.asyncio import AsyncSession
import openai
from openai import APIError


class OpenRouterChatAgent:
    """AI agent that uses MCP tools to manage todo tasks via OpenRouter API."""

    def __init__(self, session: AsyncSession, user_id: str):
        self.session = session
        self.user_id = user_id
        self.mcp_server = MCPServer(session)

        # Use settings from config which properly loads .env file
        base_url = settings.openrouter_base_url
        api_key = settings.openrouter_api_key
        model_name = settings.openrouter_model_name

        # Configure client to use OpenRouter
        self.client = openai.AsyncOpenAI(base_url=base_url, api_key=api_key)

        # Use the model specified from settings
        self.model_name = model_name

    async def process_message(
        self, message: str, conversation_history: List[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Process a user message and return an AI response.

        Following constitution: Agent must never store memory in process,
        and server must be stateless.
        """
        if conversation_history is None:
            conversation_history = []

        return await self._process_with_openrouter(message, conversation_history)

    async def _process_with_openrouter(
        self, message: str, conversation_history: List[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Process message using OpenRouter API."""
        import json

        if conversation_history is None:
            conversation_history = []

        # Prepare the conversation context with system instructions
        system_message = {
            "role": "system",
            "content": (
                """You are Taskory Assistant, an advanced AI-powered productivity assistant integrated with the Taskory web application. Your primary function is to help users efficiently manage their tasks through intelligent automation and natural language processing.

CORE RESPONSIBILITIES:
- Facilitate all task management operations including creating, updating, deleting, completing, and listing tasks
- Interpret user intent accurately and execute appropriate actions autonomously
- Maintain professional, helpful, and concise communication at all times
- Provide exceptional user experience through intelligent task resolution

TASK MANAGEMENT OPERATIONS:
- CREATE: When users want to add new tasks, use the create_task tool with appropriate parameters
- READ: When users request to see their tasks, use the list_tasks tool to provide current task list
- UPDATE: When users want to modify existing tasks, use update_task with proper task identification
- DELETE: When users want to remove tasks, use delete_task with proper task resolution
- COMPLETE: When users want to mark tasks as completed, use complete_task with proper identification
- BULK OPERATIONS: Support deleting or completing all tasks when clearly requested

INTELLIGENT TASK RESOLUTION:
- Check both task titles AND descriptions when identifying tasks for modification - if either matches, perform the requested action
- Use fuzzy matching and semantic analysis for similar task titles and descriptions equally
- Support positional references (first, second, last, oldest, newest, most recent)
- Handle title-specific queries using phrases like "called", "named", "titled", "with title/name"
- Extract task titles/descriptions from user messages when needed for matching
- Retrieve user’s current tasks to make informed matching decisions
- Check both title and description fields with equal priority - if either matches the user's request, perform the action
- When user mentions a task, search in both title and description fields and execute the action if any field matches

MULTILINGUAL CAPABILITIES:
- Understand and process English, Urdu, Roman Urdu, and mixed informal expressions
- Interpret user intent despite spelling mistakes, typos, or casual phrasing
- Maintain professional responses regardless of input language style

PROFESSIONAL BEHAVIOR STANDARDS:
- Execute all required tool operations before providing responses
- Confirm all completed actions with clear, natural language confirmations
- Provide helpful clarifications when multiple potential matches exist
- Maintain consistent professional tone throughout interactions
- Be concise yet informative in all responses
- Focus on task management functionality without straying to unrelated topics

ERROR HANDLING & CLARITY:
- If uncertain about task identification, ask for specific clarification
- When task operations complete successfully, clearly state what was accomplished
- Handle bulk operations gracefully when explicitly requested
- Ensure all mutations are processed before responding to the user

REQUIREMENT FULFILLMENT & ANALYSIS:
- Analyze user requests thoroughly to understand complete requirements before taking action
- Identify all components of multi-part user requests and address each systematically
- Clarify ambiguous requirements with the user when necessary to ensure accurate fulfillment
- Confirm understanding of complex requirements before executing operations
- Handle all aspects of user requirements in a comprehensive manner
- When users provide multiple instructions in one message, process each requirement completely
- Always ensure that all user requirements are fully implemented, not just partially addressed

INTEGRATION & AUTONOMY:
- Work independently to resolve user requests using available tools
- Maintain stateless operation for each interaction
- Focus solely on task management functionality within the Taskory ecosystem
- Never store memory in process; each interaction should be self-contained
- Execute all required operations automatically without user prompting for tool use
                """
            ),
        }

        # Build the full conversation with history and the new user message
        full_conversation = [system_message]

        # Add conversation history while converting roles appropriately
        for msg in conversation_history:
            # Map 'assistant' and 'user' roles, and handle any other role names
            role = msg.get("role", "user")
            if role == "assistant":
                full_conversation.append(
                    {"role": "assistant", "content": msg.get("content", "")}
                )
            else:
                # For user messages or any other role, use 'user'
                full_conversation.append(
                    {"role": "user", "content": msg.get("content", "")}
                )

        # Add the current user message
        full_conversation.append({"role": "user", "content": message})

        # Call the OpenAI-compatible OpenRouter endpoint with the tools available
        try:
            response = await self.client.chat.completions.create(
                model=self.model_name,  # Use the OpenRouter model specified in settings
                messages=full_conversation,
                tools=self.mcp_server.get_all_tool_schemas(),  # Use standard format for OpenAI
                tool_choice="auto",  # Let the model decide when to use tools
            )

            # Check if the original message indicates a mutation intent
            is_mutation_intent = self._is_mutation_intent(message)

            # Process the response
            response_message = response.choices[0].message
            tool_calls = response_message.tool_calls

            tool_results = []
            final_response = ""

            if tool_calls:
                # Get user's tasks for potential resolution
                user_tasks = await self._get_user_tasks()

                for tool_call in tool_calls:
                    function_name = tool_call.function.name
                    function_args = json.loads(tool_call.function.arguments)

                    # Check if this is a mutation operation that needs task resolution
                    if function_name in [
                        "delete_task",
                        "delete_task_by_description",
                        "update_task",
                        "update_task_by_description",
                        "complete_task",
                        "complete_task_by_description",
                        "add_task",
                    ]:
                        # Log for debugging
                        print(
                            f"DEBUG: Processing mutation operation {function_name} for message: {message}"
                        )

                        # Check if the message contains title-specific indicators like "called", "named", "titled"
                        is_title_specific = any(
                            phrase in message.lower()
                            for phrase in [
                                "called",
                                "named",
                                "titled",
                                "with title",
                                "with name",
                            ]
                        )

                        # For mutation operations, resolve task if needed
                        if (
                            function_name != "add_task"
                        ):  # add_task doesn't require existing task resolution
                            # First try to resolve by position, direct ID, or fuzzy match
                            resolved_task_id = await self._resolve_task_id(
                                message, user_tasks
                            )
                            print(f"DEBUG: Resolved task ID: {resolved_task_id}")

                            # If no task was resolved by position/ID and this is a title-specific query,
                            # try to extract the title and match specifically
                            if (
                                not resolved_task_id
                                and is_title_specific
                                and user_tasks
                            ):
                                # Extract the title/description from the message
                                extracted_title = (
                                    self._extract_task_description_from_message(message)
                                )
                                if extracted_title and extracted_title.strip():
                                    # Try to find exact or close match for the extracted title
                                    title_match_id = (
                                        await self._find_task_by_title_match(
                                            extracted_title, user_tasks
                                        )
                                    )
                                    if title_match_id:
                                        resolved_task_id = title_match_id
                                        print(
                                            f"DEBUG: Found title-specific match: {extracted_title}"
                                        )

                            if resolved_task_id and function_name != "delete_task":
                                function_args["task_id"] = resolved_task_id
                                print(
                                    f"DEBUG: Using resolved task ID for {function_name}"
                                )
                            elif function_name == "delete_task":
                                # For delete operations, also check if we can use the description-based approach
                                # If we couldn't resolve the ID, try to use description
                                if not resolved_task_id:
                                    # Check if we should use delete_task_by_description instead
                                    if self._is_bulk_operation(message):
                                        print(
                                            f"DEBUG: Handling bulk operation for delete"
                                        )
                                        # Handle bulk operations
                                        bulk_results = (
                                            await self._handle_bulk_operation(
                                                function_name, user_tasks
                                            )
                                        )
                                        tool_results.extend(bulk_results)
                                        continue
                                    else:
                                        # For delete_task, if we couldn't resolve the ID, try using description-based deletion
                                        # First, we need to extract the task description from the user message
                                        task_description = (
                                            self._extract_task_description_from_message(
                                                message
                                            )
                                        )
                                        print(
                                            f"DEBUG: Extracted task description: '{task_description}' from message: '{message}'"
                                        )

                                        if (
                                            task_description
                                            and len(task_description) > 1
                                        ):
                                            # Use the new delete_task_by_description tool instead
                                            try:
                                                result = await self.mcp_server.execute_tool(
                                                    "delete_task_by_description",
                                                    {
                                                        "task_description": task_description
                                                    },
                                                    self.user_id,
                                                )
                                                tool_results.append(
                                                    {
                                                        "name": "delete_task_by_description",
                                                        "arguments": {
                                                            "task_description": task_description
                                                        },
                                                        "result": result,
                                                    }
                                                )
                                                print(
                                                    f"DEBUG: Successfully used delete_task_by_description with description: '{task_description}'"
                                                )
                                                continue
                                            except Exception as e:
                                                print(
                                                    f"DEBUG: delete_task_by_description failed: {str(e)}, falling back to traditional method"
                                                )
                                                # If delete_task_by_description fails, fall back to original logic
                                                fuzzy_task_id = (
                                                    self._find_task_by_fuzzy_match(
                                                        message, user_tasks
                                                    )
                                                )
                                                print(
                                                    f"DEBUG: Fuzzy match result: {fuzzy_task_id}"
                                                )
                                                if fuzzy_task_id:
                                                    function_args["task_id"] = (
                                                        fuzzy_task_id
                                                    )
                                                else:
                                                    # If still no match found, return appropriate error response
                                                    tool_results.append(
                                                        {
                                                            "name": function_name,
                                                            "arguments": function_args,
                                                            "result": {
                                                                "error": "I couldn't find a task matching that description."
                                                            },
                                                        }
                                                    )
                                                    continue
                                        else:
                                            # Try traditional fuzzy matching as fallback
                                            print(
                                                f"DEBUG: Using traditional fuzzy matching for delete"
                                            )
                                            fuzzy_task_id = (
                                                self._find_task_by_fuzzy_match(
                                                    message, user_tasks
                                                )
                                            )
                                            print(
                                                f"DEBUG: Traditional fuzzy match result: {fuzzy_task_id}"
                                            )
                                            if fuzzy_task_id:
                                                function_args["task_id"] = fuzzy_task_id
                                            else:
                                                # If still no match found, return appropriate error response
                                                tool_results.append(
                                                    {
                                                        "name": function_name,
                                                        "arguments": function_args,
                                                        "result": {
                                                            "error": "I couldn't find a task matching that description."
                                                        },
                                                    }
                                                )
                                                continue
                            elif function_name == "update_task":
                                # For update operations, also check if we can use the description-based approach
                                # If we couldn't resolve the ID, try to use description
                                if not resolved_task_id:
                                    # Check if we should use update_task_by_description instead
                                    if self._is_bulk_operation(message):
                                        print(
                                            f"DEBUG: Handling bulk operation for update"
                                        )
                                        # Handle bulk operations (though update doesn't typically support bulk)
                                        bulk_results = (
                                            await self._handle_bulk_operation(
                                                function_name, user_tasks
                                            )
                                        )
                                        tool_results.extend(bulk_results)
                                        continue
                                    else:
                                        # For update_task, if we couldn't resolve the ID, try using description-based update
                                        # First, we need to extract the task description from the user message
                                        task_description = (
                                            self._extract_task_description_from_message(
                                                message
                                            )
                                        )
                                        print(
                                            f"DEBUG: Extracted task description: '{task_description}' from message: '{message}' for update"
                                        )

                                        if (
                                            task_description
                                            and len(task_description) > 1
                                        ):
                                            # Use the new update_task_by_description tool instead
                                            # Extract the update parameters from the original function_args
                                            update_params = {
                                                "task_description": task_description
                                            }
                                            if "title" in function_args:
                                                update_params["title"] = function_args["title"]
                                            if "description" in function_args:
                                                update_params["description"] = function_args["description"]

                                            try:
                                                result = await self.mcp_server.execute_tool(
                                                    "update_task_by_description",
                                                    update_params,
                                                    self.user_id,
                                                )
                                                tool_results.append(
                                                    {
                                                        "name": "update_task_by_description",
                                                        "arguments": update_params,
                                                        "result": result,
                                                    }
                                                )
                                                print(
                                                    f"DEBUG: Successfully used update_task_by_description with description: '{task_description}'"
                                                )
                                                continue
                                            except Exception as e:
                                                print(
                                                    f"DEBUG: update_task_by_description failed: {str(e)}, falling back to traditional method"
                                                )
                                                # If update_task_by_description fails, fall back to original logic
                                                fuzzy_task_id = (
                                                    self._find_task_by_fuzzy_match(
                                                        message, user_tasks
                                                    )
                                                )
                                                print(
                                                    f"DEBUG: Fuzzy match result for update: {fuzzy_task_id}"
                                                )
                                                if fuzzy_task_id:
                                                    function_args["task_id"] = (
                                                        fuzzy_task_id
                                                    )
                                                else:
                                                    # If still no match found, return appropriate error response
                                                    tool_results.append(
                                                        {
                                                            "name": function_name,
                                                            "arguments": function_args,
                                                            "result": {
                                                                "error": "I couldn't find a task matching that description."
                                                            },
                                                        }
                                                    )
                                                    continue
                                        else:
                                            # Try traditional fuzzy matching as fallback
                                            print(
                                                f"DEBUG: Using traditional fuzzy matching for update"
                                            )
                                            fuzzy_task_id = (
                                                self._find_task_by_fuzzy_match(
                                                    message, user_tasks
                                                )
                                            )
                                            print(
                                                f"DEBUG: Traditional fuzzy match result for update: {fuzzy_task_id}"
                                            )
                                            if fuzzy_task_id:
                                                function_args["task_id"] = fuzzy_task_id
                                            else:
                                                # If still no match found, return appropriate error response
                                                tool_results.append(
                                                    {
                                                        "name": function_name,
                                                        "arguments": function_args,
                                                        "result": {
                                                            "error": "I couldn't find a task matching that description."
                                                        },
                                                    }
                                                )
                                                continue
                            elif function_name == "complete_task":
                                # For complete operations, also check if we can use the description-based approach
                                # If we couldn't resolve the ID, try to use description
                                if not resolved_task_id:
                                    # Check if we should use complete_task_by_description instead
                                    if self._is_bulk_operation(message):
                                        print(
                                            f"DEBUG: Handling bulk operation for complete"
                                        )
                                        # Handle bulk operations
                                        bulk_results = (
                                            await self._handle_bulk_operation(
                                                function_name, user_tasks
                                            )
                                        )
                                        tool_results.extend(bulk_results)
                                        continue
                                    else:
                                        # For complete_task, if we couldn't resolve the ID, try using description-based completion
                                        # First, we need to extract the task description from the user message
                                        task_description = (
                                            self._extract_task_description_from_message(
                                                message
                                            )
                                        )
                                        print(
                                            f"DEBUG: Extracted task description: '{task_description}' from message: '{message}' for completion"
                                        )

                                        if (
                                            task_description
                                            and len(task_description) > 1
                                        ):
                                            # Use the new complete_task_by_description tool instead
                                            # Extract the completion parameters from the original function_args
                                            complete_params = {
                                                "task_description": task_description
                                            }
                                            # Extract whether the task should be marked as completed or not
                                            # For now, assuming complete_task means marking as completed (default True)
                                            # If there's a specific completed parameter, we'd use it here
                                            try:
                                                result = await self.mcp_server.execute_tool(
                                                    "complete_task_by_description",
                                                    complete_params,
                                                    self.user_id,
                                                )
                                                tool_results.append(
                                                    {
                                                        "name": "complete_task_by_description",
                                                        "arguments": complete_params,
                                                        "result": result,
                                                    }
                                                )
                                                print(
                                                    f"DEBUG: Successfully used complete_task_by_description with description: '{task_description}'"
                                                )
                                                continue
                                            except Exception as e:
                                                print(
                                                    f"DEBUG: complete_task_by_description failed: {str(e)}, falling back to traditional method"
                                                )
                                                # If complete_task_by_description fails, fall back to original logic
                                                fuzzy_task_id = (
                                                    self._find_task_by_fuzzy_match(
                                                        message, user_tasks
                                                    )
                                                )
                                                print(
                                                    f"DEBUG: Fuzzy match result for complete: {fuzzy_task_id}"
                                                )
                                                if fuzzy_task_id:
                                                    function_args["task_id"] = (
                                                        fuzzy_task_id
                                                    )
                                                else:
                                                    # If still no match found, return appropriate error response
                                                    tool_results.append(
                                                        {
                                                            "name": function_name,
                                                            "arguments": function_args,
                                                            "result": {
                                                                "error": "I couldn't find a task matching that description."
                                                            },
                                                        }
                                                    )
                                                    continue
                                        else:
                                            # Try traditional fuzzy matching as fallback
                                            print(
                                                f"DEBUG: Using traditional fuzzy matching for complete"
                                            )
                                            fuzzy_task_id = (
                                                self._find_task_by_fuzzy_match(
                                                    message, user_tasks
                                                )
                                            )
                                            print(
                                                f"DEBUG: Traditional fuzzy match result for complete: {fuzzy_task_id}"
                                            )
                                            if fuzzy_task_id:
                                                function_args["task_id"] = fuzzy_task_id
                                            else:
                                                # If still no match found, return appropriate error response
                                                tool_results.append(
                                                    {
                                                        "name": function_name,
                                                        "arguments": function_args,
                                                        "result": {
                                                            "error": "I couldn't find a task matching that description."
                                                        },
                                                    }
                                                )
                                                continue
                            elif function_name == "update_task_by_description":
                                # For update_task_by_description - check if this appears to be a bulk operation
                                # Check both the original message and the task description for bulk indicators
                                is_bulk = self._is_bulk_operation(message)
                                if not is_bulk and "task_description" in function_args:
                                    task_desc = str(function_args["task_description"]).lower()
                                    # Check if the task description itself indicates bulk operation
                                    bulk_task_descs = ["all", "all tasks", "everything", "each task", "every task"]
                                    is_bulk = any(bulk_desc in task_desc for bulk_desc in bulk_task_descs)

                                if is_bulk:
                                    print(
                                        f"DEBUG: Detected bulk operation request but got update_task_by_description tool; handling as bulk update"
                                    )
                                    # For bulk update operations, we can't really update all tasks with same description
                                    # So we'll skip or provide an appropriate response
                                    tool_results.append(
                                        {
                                            "name": function_name,
                                            "arguments": function_args,
                                            "result": {
                                                "error": "Bulk update operations require specific task identification."
                                            },
                                        }
                                    )
                                    continue
                                else:
                                    # Execute the update_task_by_description tool directly
                                    # It already handles task matching by description internally
                                    try:
                                        result = await self.mcp_server.execute_tool(
                                            function_name, function_args, self.user_id
                                        )
                                        tool_results.append(
                                            {
                                                "name": function_name,
                                                "arguments": function_args,
                                                "result": result,
                                            }
                                        )
                                    except Exception as e:
                                        tool_results.append(
                                            {
                                                "name": function_name,
                                                "arguments": function_args,
                                                "result": {"error": str(e)},
                                            }
                                        )
                                    continue
                            elif function_name == "complete_task_by_description":
                                # For complete_task_by_description - check if this appears to be a bulk operation
                                # Check both the original message and the task description for bulk indicators
                                is_bulk = self._is_bulk_operation(message)
                                if not is_bulk and "task_description" in function_args:
                                    task_desc = str(function_args["task_description"]).lower()
                                    # Check if the task description itself indicates bulk operation
                                    bulk_task_descs = ["all", "all tasks", "everything", "each task", "every task"]
                                    is_bulk = any(bulk_desc in task_desc for bulk_desc in bulk_task_descs)

                                if is_bulk:
                                    print(
                                        f"DEBUG: Detected bulk operation request but got complete_task_by_description tool; handling as bulk complete"
                                    )
                                    # Handle bulk complete operations by completing all tasks
                                    # We'll use the standard complete_task for each task instead
                                    bulk_results = []
                                    for task in user_tasks:
                                        task_id = task.get("task_id") or task.get("id")
                                        try:
                                            result = await self.mcp_server.execute_tool(
                                                "complete_task", {"task_id": task_id, "completed": True}, self.user_id
                                            )
                                            bulk_results.append(
                                                {
                                                    "name": "complete_task",
                                                    "arguments": {"task_id": task_id},
                                                    "result": result,
                                                }
                                            )
                                        except Exception as e:
                                            bulk_results.append(
                                                {
                                                    "name": "complete_task",
                                                    "arguments": {"task_id": task_id},
                                                    "result": {"error": str(e)},
                                                }
                                            )
                                    tool_results.extend(bulk_results)
                                    continue
                                else:
                                    # Execute the complete_task_by_description tool directly
                                    # It already handles task matching by description internally
                                    try:
                                        result = await self.mcp_server.execute_tool(
                                            function_name, function_args, self.user_id
                                        )
                                        tool_results.append(
                                            {
                                                "name": function_name,
                                                "arguments": function_args,
                                                "result": result,
                                            }
                                        )
                                    except Exception as e:
                                        tool_results.append(
                                            {
                                                "name": function_name,
                                                "arguments": function_args,
                                                "result": {"error": str(e)},
                                            }
                                        )
                                    continue
                            elif function_name == "delete_task_by_description":
                                # For delete_task_by_description - check if this appears to be a bulk operation
                                # Check both the original message and the task description for bulk indicators
                                is_bulk = self._is_bulk_operation(message)
                                if not is_bulk and "task_description" in function_args:
                                    task_desc = str(function_args["task_description"]).lower()
                                    # Check if the task description itself indicates bulk operation
                                    bulk_task_descs = ["all", "all tasks", "everything", "each task", "every task"]
                                    is_bulk = any(bulk_desc in task_desc for bulk_desc in bulk_task_descs)

                                if is_bulk:
                                    print(
                                        f"DEBUG: Detected bulk operation request but got delete_task_by_description tool; handling as bulk delete"
                                    )
                                    # Handle bulk delete operations by deleting all tasks
                                    # We'll use the standard delete_task for each task instead
                                    bulk_results = []
                                    for task in user_tasks:
                                        task_id = task.get("task_id") or task.get("id")
                                        try:
                                            result = await self.mcp_server.execute_tool(
                                                "delete_task", {"task_id": task_id}, self.user_id
                                            )
                                            bulk_results.append(
                                                {
                                                    "name": "delete_task",
                                                    "arguments": {"task_id": task_id},
                                                    "result": result,
                                                }
                                            )
                                        except Exception as e:
                                            bulk_results.append(
                                                {
                                                    "name": "delete_task",
                                                    "arguments": {"task_id": task_id},
                                                    "result": {"error": str(e)},
                                                }
                                            )
                                    tool_results.extend(bulk_results)
                                    continue
                                else:
                                    # Execute the delete_task_by_description tool directly
                                    # It already handles task matching by description internally
                                    try:
                                        result = await self.mcp_server.execute_tool(
                                            function_name, function_args, self.user_id
                                        )
                                        tool_results.append(
                                            {
                                                "name": function_name,
                                                "arguments": function_args,
                                                "result": result,
                                            }
                                        )
                                    except Exception as e:
                                        tool_results.append(
                                            {
                                                "name": function_name,
                                                "arguments": function_args,
                                                "result": {"error": str(e)},
                                            }
                                        )
                                    continue
                            else:  # For update_task and complete_task
                                if resolved_task_id:
                                    function_args["task_id"] = resolved_task_id
                                    print(
                                        f"DEBUG: Using resolved task ID for {function_name}"
                                    )
                                elif self._is_bulk_operation(message):
                                    # Handle bulk operations
                                    bulk_results = await self._handle_bulk_operation(
                                        function_name, user_tasks
                                    )
                                    tool_results.extend(bulk_results)
                                    continue
                                else:
                                    # Check if this is a title-specific query (has "called", "named", "titled", etc.)
                                    is_title_specific = any(
                                        phrase in message.lower()
                                        for phrase in [
                                            "called",
                                            "named",
                                            "titled",
                                            "with title",
                                            "with name",
                                        ]
                                    )

                                    # If no task was resolved and this is a title-specific query, try title-specific matching
                                    if is_title_specific and user_tasks:
                                        # Extract the title/description from the message
                                        extracted_title = (
                                            self._extract_task_description_from_message(
                                                message
                                            )
                                        )
                                        if extracted_title and extracted_title.strip():
                                            # Try to find exact or close match for the extracted title
                                            title_match_id = (
                                                await self._find_task_by_title_match(
                                                    extracted_title, user_tasks
                                                )
                                            )
                                            if title_match_id:
                                                function_args["task_id"] = (
                                                    title_match_id
                                                )
                                                print(
                                                    f"DEBUG: Found title-specific match for {function_name}: {extracted_title}"
                                                )
                                            else:
                                                # If title-specific match fails, try general fuzzy matching
                                                fuzzy_task_id = (
                                                    self._find_task_by_fuzzy_match(
                                                        message, user_tasks
                                                    )
                                                )
                                                print(
                                                    f"DEBUG: Fuzzy match for {function_name} result: {fuzzy_task_id}"
                                                )
                                                if fuzzy_task_id:
                                                    function_args["task_id"] = (
                                                        fuzzy_task_id
                                                    )
                                                else:
                                                    # If still no match found, return appropriate error response
                                                    # Do NOT fallback to list_tasks for mutation intents
                                                    tool_results.append(
                                                        {
                                                            "name": function_name,
                                                            "arguments": function_args,
                                                            "result": {
                                                                "error": "I couldn't find a task matching that description."
                                                            },
                                                        }
                                                    )
                                                    continue
                                        else:
                                            # If title extraction fails, try general fuzzy matching
                                            fuzzy_task_id = (
                                                self._find_task_by_fuzzy_match(
                                                    message, user_tasks
                                                )
                                            )
                                            print(
                                                f"DEBUG: Fuzzy match for {function_name} result: {fuzzy_task_id}"
                                            )
                                            if fuzzy_task_id:
                                                function_args["task_id"] = fuzzy_task_id
                                            else:
                                                # If still no match found, return appropriate error response
                                                # Do NOT fallback to list_tasks for mutation intents
                                                tool_results.append(
                                                    {
                                                        "name": function_name,
                                                        "arguments": function_args,
                                                        "result": {
                                                            "error": "I couldn't find a task matching that description."
                                                        },
                                                    }
                                                )
                                                continue
                                    else:
                                        # For non-title-specific queries, use general fuzzy matching
                                        fuzzy_task_id = self._find_task_by_fuzzy_match(
                                            message, user_tasks
                                        )
                                        print(
                                            f"DEBUG: Fuzzy match for {function_name} result: {fuzzy_task_id}"
                                        )
                                        if fuzzy_task_id:
                                            function_args["task_id"] = fuzzy_task_id
                                        else:
                                            # If still no match found, return appropriate error response
                                            # Do NOT fallback to list_tasks for mutation intents
                                            tool_results.append(
                                                {
                                                    "name": function_name,
                                                    "arguments": function_args,
                                                    "result": {
                                                        "error": "I couldn't find a task matching that description."
                                                    },
                                                }
                                            )
                                            continue

                    try:
                        # Execute the tool with user_id as a separate parameter
                        result = await self.mcp_server.execute_tool(
                            function_name, function_args, self.user_id
                        )
                        tool_results.append(
                            {
                                "name": function_name,
                                "arguments": function_args,
                                "result": result,
                            }
                        )
                    except Exception as e:
                        # Log the error but continue with other tool calls
                        tool_results.append(
                            {
                                "name": function_name,
                                "arguments": function_args,
                                "result": {"error": str(e)},
                            }
                        )

                # Generate natural response based on results
                final_response = self._generate_natural_response(tool_results, message)

                # Ensure proper handling of mutation vs list operations
                has_mutation_tool = any(
                    tr["name"]
                    in [
                        "add_task",
                        "update_task",
                        "update_task_by_description",
                        "delete_task",
                        "delete_task_by_description",
                        "complete_task",
                        "complete_task_by_description",
                    ]
                    for tr in tool_results
                )

                # Check if original intent was mutation but we got list-like response (fallback occurred)
                if is_mutation_intent and has_mutation_tool:
                    # Prevent list-like responses after mutations
                    if any(
                        phrase in final_response.lower()
                        for phrase in [
                            "you have",
                            "tasks in your list",
                            "here are your tasks",
                            "here are your",
                            "task list",
                            "showing",
                            "tasks:",
                            "total tasks",
                        ]
                    ):
                        # This indicates a fallback to list occurred, we need to regenerate mutation response
                        mutation_results = [
                            tr
                            for tr in tool_results
                            if tr["name"]
                            in [
                                "add_task",
                                "update_task",
                                "update_task_by_description",
                                "delete_task",
                                "delete_task_by_description",
                                "complete_task",
                                "complete_task_by_description",
                            ]
                        ]
                        if mutation_results:
                            final_response = self._generate_natural_response(
                                mutation_results, message
                            )
                elif is_mutation_intent and not has_mutation_tool:
                    # Original message indicated mutation intent but no mutation tools were called
                    # This is the bug we need to prevent - AI fell back to list_tasks
                    # Instead, we should generate an error response
                    final_response = self._generate_error_response_for_mutation_failure(
                        message
                    )
            else:
                # No tool calls were made, this means the AI did not understand the intent properly
                # If it was a mutation intent, generate an appropriate error response
                if is_mutation_intent:
                    final_response = self._generate_error_response_for_mutation_failure(
                        message
                    )
                else:
                    # No tool calls were made, just return the model's response
                    final_response = (
                        response_message.content
                        or "I'm here to help you manage your tasks. What would you like to do?"
                    )

            return {"response": final_response, "tool_calls": tool_results}

        except openai.APIError as e:
            # Handle OpenAI API errors specifically
            print(f"DEBUG: OpenRouter API Error - {str(e)}")
            print(f"DEBUG: Error Type - {type(e).__name__}")
            print(f"DEBUG: Model Name - {self.model_name}")
            # Return user-friendly error message
            return {
                "response": f"Sorry, I'm having trouble connecting to the AI service right now. Please try again in a moment.",
                "tool_calls": [],
                "error": str(e),
            }
        except Exception as e:
            # Handle any other errors gracefully
            return {
                "response": f"Sorry, I encountered an issue while processing your request. Could you try rephrasing that?",
                "tool_calls": [],
                "error": str(e),
            }

    async def _get_user_tasks(self):
        """Internally get the user's tasks for resolution purposes."""
        try:
            # Call the list_tasks tool internally to get user's tasks
            list_result = await self.mcp_server.execute_tool(
                "list_tasks", {}, self.user_id
            )
            if isinstance(list_result, dict) and "tasks" in list_result:
                return list_result["tasks"]
        except Exception:
            # If internal listing fails, return empty list
            return []
        return []

    async def _find_task_by_title_match(
        self, title_to_match: str, tasks: List[Dict[str, Any]]
    ) -> str:
        """Find task by exact or close title match, specifically for title-specific queries."""
        if not tasks or not title_to_match:
            return None

        title_to_match = title_to_match.strip().lower()

        best_match = None
        best_score = 0

        for task in tasks:
            task_title = (task.get("title", "") or "").lower().strip()

            if not task_title:
                continue

            # Calculate exact match first (highest priority for title-specific queries)
            if title_to_match == task_title:
                return task.get("task_id") or task.get("id")

            # Calculate partial match
            from difflib import SequenceMatcher

            similarity = SequenceMatcher(None, title_to_match, task_title).ratio()

            # Use fuzzy matching if available
            if FUZZY_ENABLED:
                fuzzy_score = fuzz.partial_ratio(title_to_match, task_title) / 100.0
                similarity = max(similarity, fuzzy_score)

            # If similarity is high enough, consider it a match
            if similarity > 0.6:  # 60% similarity threshold for title-specific queries
                if similarity > best_score:
                    best_score = similarity
                    best_match = task.get("task_id") or task.get("id")

        return best_match

    async def _resolve_task_id(self, message: str, tasks: List[Dict[str, Any]]) -> str:
        """Resolve task ID based on message and available tasks using intelligent matching."""
        if not tasks:
            return None

        message_lower = message.lower().strip()

        # Check for bulk operation indicators first
        if self._is_bulk_operation(message_lower):
            return None  # Bulk operations are handled separately

        # Check for position-based references
        position_task_id = self._resolve_by_position(message_lower, tasks)
        if position_task_id:
            return position_task_id

        # Check for direct ID references (numbers in the message)
        direct_id = self._extract_direct_id(message_lower, tasks)
        if direct_id:
            return direct_id

        # Use fuzzy matching for title/description
        fuzzy_match_id = self._find_task_by_fuzzy_match(message_lower, tasks)
        if fuzzy_match_id:
            return fuzzy_match_id

        # If no match found, return None
        return None

    def _resolve_by_position(self, message: str, tasks: List[Dict[str, Any]]) -> str:
        """Resolve task by position references like 'first', 'last', 'second', etc."""
        if not tasks:
            return None

        # Handle position references
        if any(
            word in message
            for word in [
                "last",
                "most recent",
                "latest",
                "recent",
                "end",
                "final",
                "last wala",
            ]
        ):
            return tasks[-1].get("task_id") or tasks[-1].get("id") if tasks else None
        elif any(
            word in message
            for word in ["first", "oldest", "beginning", "start", "pehla", "shuru"]
        ):
            return tasks[0].get("task_id") or tasks[0].get("id") if tasks else None
        elif any(word in message for word in ["second", "next", "dosra"]):
            return (
                tasks[1].get("task_id") or tasks[1].get("id")
                if len(tasks) > 1
                else None
            )
        elif any(word in message for word in ["third", "teesra"]):
            return (
                tasks[2].get("task_id") or tasks[2].get("id")
                if len(tasks) > 2
                else None
            )

        return None

    def _extract_direct_id(self, message: str, tasks: List[Dict[str, Any]]) -> str:
        """Extract direct ID from message if user mentions a number."""
        # Look for number patterns that might indicate a task number
        number_matches = re.findall(r"\b(\d+)\b", message)

        for num_str in number_matches:
            try:
                num = int(num_str)
                # If the number is within the range of existing tasks
                if 1 <= num <= len(tasks):
                    return tasks[num - 1].get("task_id") or tasks[num - 1].get("id")
            except ValueError:
                continue

        return None

    def _find_task_by_fuzzy_match(
        self, message: str, tasks: List[Dict[str, Any]]
    ) -> str:
        """Find best matching task using improved fuzzy logic."""
        if not tasks:
            return None

        best_match = None
        best_score = 0

        # Normalize the input message: trim, lowercase, remove extra spaces
        normalized_message = " ".join(message.lower().strip().split())

        # Check if the message contains phrases like "called", "named", "titled" which indicate title matching
        is_title_specific = any(
            phrase in normalized_message
            for phrase in ["called", "named", "titled", "with title"]
        )

        for task in tasks:
            task_title = " ".join((task.get("title", "") or "").lower().strip().split())
            task_description = " ".join(
                (task.get("description", "") or "").lower().strip().split()
            )

            # Calculate multiple similarity scores
            score = 0

            # Calculate sequence similarity for the full message vs title
            if task_title:
                from difflib import SequenceMatcher

                title_similarity = SequenceMatcher(
                    None, normalized_message, task_title
                ).ratio()
                # When not title-specific, treat title and description equally
                if is_title_specific:
                    score += (
                        title_similarity * 150
                    )  # Higher weight for title-specific queries
                else:
                    score += title_similarity * 75  # Equal weight for both title and description

            # Calculate sequence similarity for the full message vs description
            if task_description:
                desc_similarity = SequenceMatcher(
                    None, normalized_message, task_description
                ).ratio()
                # When not title-specific, treat title and description equally
                if not is_title_specific:
                    score += desc_similarity * 75  # Equal weight for both title and description
                else:
                    score += (
                        desc_similarity * 25
                    )  # Less weight when looking for title specifically

            # Use fuzzy matching if available
            if FUZZY_ENABLED:
                if task_title:
                    # Multiple fuzzy matching strategies for title
                    title_partial = fuzz.partial_ratio(normalized_message, task_title)
                    title_token_sort = fuzz.token_sort_ratio(
                        normalized_message, task_title
                    )
                    title_token_set = fuzz.token_set_ratio(
                        normalized_message, task_title
                    )
                    # Use the highest score among all strategies
                    title_fuzzy = max(title_partial, title_token_sort, title_token_set)
                    # If title-specific query, boost title fuzzy scores
                    if is_title_specific:
                        score += title_fuzzy * 1.5
                    else:
                        score += title_fuzzy * 0.75  # Equal weight when not title-specific

                if task_description:
                    # Multiple fuzzy matching strategies for description
                    desc_partial = fuzz.partial_ratio(
                        normalized_message, task_description
                    )
                    desc_token_sort = fuzz.token_sort_ratio(
                        normalized_message, task_description
                    )
                    desc_token_set = fuzz.token_set_ratio(
                        normalized_message, task_description
                    )
                    # Use the highest score among all strategies
                    desc_fuzzy = max(desc_partial, desc_token_sort, desc_token_set)
                    # If NOT title-specific, give equal weight to description
                    if not is_title_specific:
                        score += desc_fuzzy * 0.75  # Equal weight when not title-specific
                    else:
                        score += (
                            desc_fuzzy / 4
                        )  # Less weight when looking for title specifically

            if score > best_score:
                best_score = score
                best_match = task.get("task_id") or task.get("id")

        # Only return if we have a reasonably good match
        # Lower the threshold to make matching more lenient
        threshold = 15  # Lower threshold to accept more matches
        return best_match if best_score > threshold else None

    def _is_bulk_operation(self, message: str) -> bool:
        """Check if the message indicates a bulk operation."""
        message_lower = message.lower()
        bulk_indicators = [
            "delete all",
            "sab delete",
            "clear all",
            "clear my list",
            "remove all",
            "all delete",
            "sab khatam",
            "sab clear",
            "complete all",
            "mark all done",
            "mark everything done",
            "finish all",
            "all tasks delete",
            "all tasks clear",
        ]
        return any(indicator in message_lower for indicator in bulk_indicators)

    def _extract_task_description_from_message(self, message: str) -> str:
        """
        Extract task description from a user's message by removing operation keywords and context phrases.
        For example:
        - "delete task called imad" -> "imad"
        - "update Buy groceries" -> "Buy groceries"
        - "complete task named meeting" -> "meeting"
        """
        message_lower = message.lower().strip()

        # Normalize the message by removing common operation-related phrases
        operation_indicators = [
            "add",
            "create",
            "new",
            "make",
            "add task",
            "ban",
            "bn",
            "create task",
            "delete",
            "hata",
            "remove",
            "clear",
            "cancel",
            "terminate",
            "erase",
            "kill",
            "drop",
            "delete task",
            "hata do",
            "hata den",
            "remove karo",
            "khatam karo",
            "clear karo",
            "sab delete",
            "delete saray",
            "sab khatam",
            "update",
            "edit",
            "change",
            "modify",
            "adjust",
            "correct",
            "fix",
            "redesign",
            "improve",
            "rename",
            "update task",
            "edit task",
            "complete",
            "done",
            "finish",
            "completed",
            "mark done",
            "mark complete",
            "finish",
            "complete task",
            "done hai",
            "hogaya",
            "pura",
            "kar diya",
        ]

        # Sort by length, longest first, to handle multi-word phrases first
        operation_indicators.sort(key=len, reverse=True)

        normalized_message = message_lower

        for indicator in operation_indicators:
            # Remove the indicator and any surrounding whitespace
            if indicator in normalized_message:
                normalized_message = normalized_message.replace(indicator, "").strip()

        # Handle common phrases that separate the operation from the task title
        # e.g., "called", "named", "titled", "called task", etc.
        context_phrases = [
            "called task",
            "named task",
            "titled task",
            "called",
            "named",
            "titled",
            "with title",
            "with name",
            "with description",
            "the task",
            "task",
            "with name called",
            "named as",
            "called as",
            "with title named",
        ]

        # Sort by length, longest first
        context_phrases.sort(key=len, reverse=True)

        for phrase in context_phrases:
            if phrase in normalized_message:
                # Extract the part after the context phrase
                parts = normalized_message.split(phrase)
                if len(parts) > 1:
                    # Take the last part (the actual task title/description)
                    normalized_message = parts[-1].strip()
                else:
                    normalized_message = normalized_message.replace(phrase, "").strip()

        # Remove common stop words that might remain
        normalized_message = re.sub(
            r"\b(the|ye|wali|kaam|kar|karo|do|ko|se|ka|ke|ki)\b", "", normalized_message
        ).strip()

        # Remove extra whitespace and return
        normalized_message = " ".join(normalized_message.split())

        return normalized_message if normalized_message else None

    async def _handle_bulk_operation(
        self, operation: str, tasks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Handle bulk operations like delete all or complete all."""
        if not tasks:
            return []

        results = []
        for task in tasks:
            task_id = task.get("task_id") or task.get("id")
            try:
                if operation in ["delete_task", "delete_task_by_description"]:
                    if operation in ["delete_task_by_description"]:
                        # For the description-based tool, we'd need to know what to match
                        # In bulk operations, it's better to use the ID-based delete
                        result = await self.mcp_server.execute_tool(
                            "delete_task", {"task_id": task_id}, self.user_id
                        )
                    else:
                        result = await self.mcp_server.execute_tool(
                            "delete_task", {"task_id": task_id}, self.user_id
                        )
                elif operation in ["complete_task", "complete_task_by_description"]:
                    if operation in ["complete_task_by_description"]:
                        # For the description-based tool, use the ID-based complete
                        result = await self.mcp_server.execute_tool(
                            "complete_task", {"task_id": task_id, "completed": True}, self.user_id
                        )
                    else:
                        result = await self.mcp_server.execute_tool(
                            "complete_task", {"task_id": task_id}, self.user_id
                        )
                elif operation in ["update_task", "update_task_by_description"]:
                    # For update operations, a bulk operation may not make sense without specific updates
                    # We can skip these in bulk operations for now unless specific update fields are provided
                    continue
                else:
                    # For other operations, skip (as they may not make sense in bulk)
                    continue

                results.append(
                    {
                        "name": operation,
                        "arguments": {"task_id": task_id},
                        "result": result,
                    }
                )
            except Exception as e:
                results.append(
                    {
                        "name": operation,
                        "arguments": {"task_id": task_id},
                        "result": {"error": str(e)},
                    }
                )

        return results

    def _extract_task_keywords(self, message: str) -> List[str]:
        """Extract potential keywords from message that might match task titles."""
        # Remove common stop words and extract meaningful keywords
        stop_words = {
            "the",
            "a",
            "an",
            "and",
            "or",
            "but",
            "in",
            "on",
            "at",
            "to",
            "for",
            "of",
            "with",
            "by",
            "my",
            "that",
            "this",
            "is",
            "are",
            "was",
            "were",
            "be",
            "been",
            "ye",
            "wali",
            "ka",
            "ke",
            "ki",
            "ko",
            "se",
            "kaam",
            "kar",
            "karo",
            "do",
            "done",
            "me",
            "mai",
            "main",
            "mein",
            "maine",
            "ne",
            "h",
            "he",
            "hi",
            "haan",
            "hai",
            "ho",
        }

        # Extract words and handle common Urdu/English mixing
        words = re.findall(r"\b\w+\b", message.lower())

        # Also extract multi-word phrases that might be task-related
        phrases = []
        for i, word in enumerate(words):
            if i < len(words) - 1:
                two_word_phrase = f"{word} {words[i+1]}"
                phrases.append(two_word_phrase)

        all_terms = words + phrases

        # Filter and return significant terms
        keywords = []
        for term in all_terms:
            clean_term = term.strip()
            if len(clean_term) > 1 and clean_term not in stop_words:
                if not clean_term.isdigit():  # Don't include pure numbers
                    keywords.append(clean_term)

        return keywords

    def _is_mutation_intent(self, message: str) -> bool:
        """Check if the user message indicates a mutation intent (add, delete, update, complete)."""
        message_lower = message.lower()
        # Check for mutation keywords in English and common Urdu/Roman Urdu
        mutation_indicators = [
            # Delete indicators
            "delete",
            "hata",
            "remove",
            "clear",
            "cancel",
            "terminate",
            "erase",
            "kill",
            "drop",
            "delete task",
            # Update/modify indicators
            "update",
            "edit",
            "change",
            "modify",
            "adjust",
            "correct",
            "fix",
            "redesign",
            "improve",
            "rename",
            "updat",
            # Complete/done indicators
            "complete",
            "done",
            "finish",
            "completed",
            "mark done",
            "mark complete",
            "finish",
            "done hai",
            "hogaya",
            "pura",
            "kar diya",
            # Add indicators
            "add",
            "create",
            "new",
            "make",
            "add task",
            "add karo",
            "ban",
            "bn",
            "do",
        ]

        return any(indicator in message_lower for indicator in mutation_indicators)

    def _generate_error_response_for_mutation_failure(self, message: str) -> str:
        """Generate appropriate error response when mutation intent fails."""
        message_lower = message.lower()

        if (
            "delete" in message_lower
            or "hata" in message_lower
            or "remove" in message_lower
        ):
            return "I couldn't find a matching task to delete. I check both task titles and descriptions - please try rephrasing or list your tasks to see available options."
        elif (
            "complete" in message_lower
            or "done" in message_lower
            or "finish" in message_lower
        ):
            return "I couldn't find a matching task to complete. I check both task titles and descriptions - please try rephrasing or list your tasks to see available options."
        elif (
            "update" in message_lower
            or "edit" in message_lower
            or "change" in message_lower
        ):
            return "I couldn't find a matching task to update. I check both task titles and descriptions - please try rephrasing or list your tasks to see available options."
        elif "add" in message_lower or "create" in message_lower:
            return "I couldn't add your task. Please try rephrasing."
        else:
            return "I couldn't find a matching task. I check both task titles and descriptions - please try rephrasing or list your tasks to see available options."

    def _generate_natural_response(
        self, tool_results: List[Dict[str, Any]], original_message: str = ""
    ) -> str:
        """Generate natural, context-aware responses based on tool results."""
        # Check if this is a bulk operation by looking at original message
        is_bulk_operation = (
            self._is_bulk_operation(original_message.lower())
            if original_message
            else False
        )

        # Also check if any of the tool calls themselves are bulk operations
        for result in tool_results:
            if result["name"] in ["delete_task", "delete_task_by_description", "complete_task", "complete_task_by_description"]:
                # Check if the operation affects all tasks by looking at the arguments or context
                if any(indicator in original_message.lower() for indicator in [
                    "all", "sab", "everything", "each", "every", "complete list", "my list"
                ]):
                    is_bulk_operation = True
                    break

        responses = []

        # Group results by operation type
        add_results = [r for r in tool_results if r["name"] == "add_task"]
        delete_results = [r for r in tool_results if r["name"] == "delete_task"]
        delete_by_desc_results = [
            r for r in tool_results if r["name"] == "delete_task_by_description"
        ]
        update_results = [r for r in tool_results if r["name"] == "update_task"]
        update_by_desc_results = [
            r for r in tool_results if r["name"] == "update_task_by_description"
        ]
        complete_results = [r for r in tool_results if r["name"] == "complete_task"]
        complete_by_desc_results = [
            r for r in tool_results if r["name"] == "complete_task_by_description"
        ]
        list_results = [r for r in tool_results if r["name"] == "list_tasks"]

        # Handle bulk operation responses
        if is_bulk_operation and (delete_results or delete_by_desc_results or complete_results or complete_by_desc_results):
            if any(
                "delete" in original_message.lower()
                or "sab delete" in original_message.lower()
                or "clear" in original_message.lower()
                for _ in (delete_results + delete_by_desc_results)
            ):
                return "All your tasks have been cleared."
            elif any(
                "complete" in original_message.lower()
                or "mark all done" in original_message.lower()
                for _ in (complete_results + complete_by_desc_results)
            ):
                return "All your tasks have been marked as completed."

        # Process individual results
        for result in tool_results:
            tool_name = result["name"]
            tool_result = result["result"]

            if tool_name == "add_task":
                if isinstance(tool_result, dict) and "error" in tool_result:
                    responses.append(
                        f"Sorry, I couldn't add your task: {tool_result['error']}"
                    )
                elif isinstance(tool_result, dict) and "title" in tool_result:
                    responses.append(
                        f"Your task '{tool_result['title']}' has been added successfully."
                    )
                else:
                    responses.append("I've added your task.")

            elif tool_name == "delete_task":
                if isinstance(tool_result, dict) and "error" in tool_result:
                    responses.append(
                        f"Sorry, I couldn't delete the task: {tool_result['error']}"
                    )
                elif isinstance(tool_result, dict) and "title" in tool_result:
                    responses.append(
                        f"Your task '{tool_result['title']}' has been deleted."
                    )
                else:
                    responses.append("I've deleted that task for you.")
            elif tool_name == "delete_task_by_description":
                if isinstance(tool_result, dict) and "error" in tool_result:
                    responses.append(
                        f"Sorry, I couldn't delete the task: {tool_result['error']}"
                    )
                elif isinstance(tool_result, dict) and "title" in tool_result:
                    responses.append(
                        f"Your task '{tool_result['title']}' has been deleted."
                    )
                else:
                    responses.append("I've deleted that task for you.")

            elif tool_name == "update_task_by_description":
                if isinstance(tool_result, dict) and "error" in tool_result:
                    responses.append(
                        f"Sorry, I couldn't update the task: {tool_result['error']}"
                    )
                elif isinstance(tool_result, dict) and "title" in tool_result:
                    responses.append(
                        f"I've updated your task '{tool_result['title']}'."
                    )
                else:
                    responses.append("I've updated your task.")

            elif tool_name == "complete_task_by_description":
                if isinstance(tool_result, dict) and "error" in tool_result:
                    responses.append(
                        f"Sorry, I couldn't complete the task: {tool_result['error']}"
                    )
                elif isinstance(tool_result, dict) and "title" in tool_result:
                    if tool_result.get("completed", False):
                        responses.append(
                            f"I've marked '{tool_result['title']}' as completed."
                        )
                    else:
                        responses.append(
                            f"I've marked '{tool_result['title']}' as incomplete."
                        )
                else:
                    responses.append("I've updated the task's completion status.")

            elif tool_name == "complete_task":
                if isinstance(tool_result, dict) and "error" in tool_result:
                    responses.append(
                        f"Sorry, I couldn't complete the task: {tool_result['error']}"
                    )
                elif isinstance(tool_result, dict) and "title" in tool_result:
                    if tool_result.get("completed", False):
                        responses.append(
                            f"I've marked '{tool_result['title']}' as completed."
                        )
                    else:
                        responses.append(
                            f"I've marked '{tool_result['title']}' as incomplete."
                        )
                else:
                    responses.append("I've updated the task's completion status.")

            elif tool_name == "update_task":
                if isinstance(tool_result, dict) and "error" in tool_result:
                    responses.append(
                        f"Sorry, I couldn't update the task: {tool_result['error']}"
                    )
                elif isinstance(tool_result, dict) and "title" in tool_result:
                    responses.append(
                        f"I've updated your task '{tool_result['title']}'."
                    )
                else:
                    responses.append("I've updated your task.")

            elif tool_name == "list_tasks":
                if isinstance(tool_result, dict) and "tasks" in tool_result:
                    task_count = len(tool_result["tasks"])
                    if task_count == 0:
                        responses.append("You don't have any tasks right now.")
                    elif task_count == 1:
                        task_title = tool_result["tasks"][0].get("title", "Untitled")
                        responses.append(f"Your task is: '{task_title}'")
                    else:
                        responses.append(f"You have {task_count} tasks.")
                else:
                    responses.append("Here are your tasks.")
            else:
                if isinstance(tool_result, dict) and "error" in tool_result:
                    responses.append(f"Sorry, I had an issue: {tool_result['error']}")
                else:
                    responses.append("I've processed your request.")

        # Consolidate similar responses
        if len(responses) > 1:
            # If it's a bulk operation with multiple deletes/completes, consolidate
            all_delete_results = delete_results + delete_by_desc_results
            all_complete_results = complete_results + complete_by_desc_results

            if len(all_delete_results) > 1 and all(
                "error" not in r["result"] for r in all_delete_results
            ):
                return "All matching tasks have been deleted."
            elif len(all_complete_results) > 1 and all(
                "error" not in r["result"] for r in all_complete_results
            ):
                return "All matching tasks have been marked as completed."
            elif len(add_results) > 1 and all(
                "error" not in r["result"] for r in add_results
            ):
                return "All your tasks have been added."

            # For mixed results, combine them
            return " ".join(responses)
        elif len(responses) == 1:
            return responses[0]
        else:
            # No results processed
            if (
                "delete" in original_message.lower()
                or "hata" in original_message.lower()
                or "remove" in original_message.lower()
            ):
                return "I couldn't find a matching task to delete. I check both task titles and descriptions - please try rephrasing or list your tasks to see available options."
            elif (
                "complete" in original_message.lower()
                or "done" in original_message.lower()
                or "finish" in original_message.lower()
            ):
                return "I couldn't find a matching task to complete. I check both task titles and descriptions - please try rephrasing or list your tasks to see available options."
            elif (
                "update" in original_message.lower()
                or "edit" in original_message.lower()
                or "change" in original_message.lower()
            ):
                return "I couldn't find a matching task to update. I check both task titles and descriptions - please try rephrasing or list your tasks to see available options."
            else:
                return "I couldn't find a matching task. I check both task titles and descriptions - please try rephrasing or list your tasks to see available options."
