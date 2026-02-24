"""MCP tool for adding tasks - follows constitution requirements."""

from typing import Any, Dict

from ...services.task_adapter_service import TaskAdapterService
from sqlalchemy.ext.asyncio import AsyncSession


async def add_task_tool(session: AsyncSession, user_id: str, title: str, description: str = None) -> Dict[str, Any]:
    """
    MCP tool to add a new task via the existing Task service layer.

    Following constitution rule: MCP tools must call existing Task service layer only,
    and must not access DB directly.
    """
    # Use the adapter service to create the task using the existing service layer
    created_todo = await TaskAdapterService.create_task(
        session=session,
        user_id=user_id,
        title=title,
        description=description
    )

    # Return structured JSON as required by constitution
    return {
        "task_id": str(created_todo.id),  # Convert UUID to string for JSON serialization
        "status": created_todo.status.value,  # Use .value for enum serialization
        "title": created_todo.title
    }


def validate_add_task_params(params: Dict[str, Any]) -> Dict[str, Any]:
    """Validate parameters for the add_task tool."""
    if "title" not in params or not params["title"]:
        raise ValueError("title is required")

    # Ensure title is a string
    if not isinstance(params["title"], str):
        raise ValueError("title must be a string")

    # Description is optional but if provided, must be a string
    if "description" in params and params["description"] is not None:
        if not isinstance(params["description"], str):
            raise ValueError("description must be a string")

    return {
        "title": params["title"],
        "description": params.get("description")
    }