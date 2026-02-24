"""MCP tool for updating tasks - follows constitution requirements."""

from typing import Any, Dict, Optional

from ...services.task_adapter_service import TaskAdapterService
from sqlalchemy.ext.asyncio import AsyncSession


async def update_task_tool(
    session: AsyncSession,
    user_id: str,
    task_id: str,
    title: Optional[str] = None,
    description: Optional[str] = None
) -> Dict[str, Any]:
    """
    MCP tool to update a task via the existing Task service layer.

    Following constitution rule: MCP tools must call existing Task service layer only,
    and must not access DB directly.
    """
    # First get the task to check if it exists before attempting to update it
    task = await TaskAdapterService.get_task_by_id(
        session=session,
        task_id=task_id,
        user_id=user_id
    )

    if not task:
        # Check if the task_id is an integer index and provide a more specific error message
        try:
            task_index = int(task_id)
            all_tasks = await TaskAdapterService.get_tasks_by_user(
                session=session,
                user_id=user_id
            )
            if 1 <= task_index <= len(all_tasks):
                # The task by index exists but couldn't be updated for another reason
                raise ValueError(f"Task at position {task_index} could not be updated")
            else:
                raise ValueError(f"Task at position {task_index} does not exist. You only have {len(all_tasks)} tasks.")
        except ValueError:
            # Not an integer, so it's a UUID issue
            raise ValueError(f"Task with id {task_id} not found or user not authorized")

    # Use the adapter service to update the task via the existing service layer
    updated_todo = await TaskAdapterService.update_task(
        session=session,
        task_id=task_id,
        user_id=user_id,
        title=title,
        description=description
    )

    if updated_todo is None:
        raise ValueError(f"Task with id {task_id} not found or user not authorized")

    # Return structured JSON as required by constitution
    return {
        "task_id": str(updated_todo.id),  # Convert UUID to string for JSON serialization
        "status": updated_todo.status.value,  # Use .value for enum serialization
        "title": updated_todo.title
    }


def validate_update_task_params(params: Dict[str, Any]) -> Dict[str, Any]:
    """Validate parameters for the update_task tool."""
    if "task_id" not in params or not params["task_id"]:
        raise ValueError("task_id is required")

    # Check that at least one of title or description is provided for update
    if "title" not in params and "description" not in params:
        raise ValueError("At least one of title or description must be provided for update")

    task_id = params["task_id"]

    # If task_id is already a valid UUID, return it as is
    try:
        from uuid import UUID
        UUID(task_id)
        validated_task_id = task_id
    except ValueError:
        # If not a UUID, it might be an integer index
        try:
            # Try to convert to integer
            task_index = int(task_id)
            # Validate it's a positive integer
            if task_index <= 0:
                raise ValueError("task_id must be a valid UUID string or a positive integer")
            # Use the integer as is - the service layer will handle the mapping
            validated_task_id = task_id
        except ValueError:
            raise ValueError("task_id must be a valid UUID string or a positive integer")

    # Title and description, if provided, must be strings
    if "title" in params and params["title"] is not None:
        if not isinstance(params["title"], str):
            raise ValueError("title must be a string")

    if "description" in params and params["description"] is not None:
        if not isinstance(params["description"], str):
            raise ValueError("description must be a string")

    return {
        "task_id": validated_task_id,
        "title": params.get("title"),
        "description": params.get("description")
    }