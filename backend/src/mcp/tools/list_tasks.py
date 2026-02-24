"""MCP tool for listing tasks - follows constitution requirements."""

from typing import Any, Dict, List

from ...services.task_adapter_service import TaskAdapterService
from sqlalchemy.ext.asyncio import AsyncSession


async def list_tasks_tool(session: AsyncSession, user_id: str, status: str = "all") -> Dict[str, Any]:
    """
    MCP tool to list tasks via the existing Task service layer.

    Following constitution rule: MCP tools must call existing Task service layer only,
    and must not access DB directly.
    """
    # Use the adapter service to get tasks with optional status filter
    user_todos = await TaskAdapterService.get_tasks_by_user(
        session=session,
        user_id=user_id,
        status_filter=status if status != "all" else None
    )

    # Convert todos to the required format
    tasks = []
    for todo in user_todos:
        task = {
            "task_id": str(todo.id),  # Convert UUID to string for JSON serialization
            "title": todo.title,
            "description": todo.description,
            "status": todo.status.value  # Use .value for enum serialization
        }
        tasks.append(task)

    # Return structured JSON as required by constitution
    return {
        "tasks": tasks
    }


def validate_list_tasks_params(params: Dict[str, Any]) -> Dict[str, Any]:
    """Validate parameters for the list_tasks tool."""
    # Status is optional but if provided, must be valid
    if "status" in params and params["status"] is not None:
        if not isinstance(params["status"], str):
            raise ValueError("status must be a string")

        # Validate status value
        valid_statuses = ["all", "pending", "todo", "in-progress", "in_progress", "progress", "completed"]
        if params["status"].lower() not in valid_statuses:
            raise ValueError(f"status must be one of: {', '.join(valid_statuses)}")

    return {
        "status": params.get("status", "all")
    }