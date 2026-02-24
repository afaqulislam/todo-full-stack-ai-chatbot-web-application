"""MCP tool for deleting tasks - follows constitution requirements."""

from typing import Any, Dict

from ...services.task_adapter_service import TaskAdapterService
from sqlalchemy.ext.asyncio import AsyncSession


async def delete_task_tool(session: AsyncSession, user_id: str, task_id: str) -> Dict[str, Any]:
    """
    MCP tool to delete a task via the existing Task service layer.

    Following constitution rule: MCP tools must call existing Task service layer only,
    and must not access DB directly.
    """
    # First get the task to capture its title before deletion
    task = await TaskAdapterService.get_task_by_id(
        session=session,
        task_id=task_id,
        user_id=user_id
    )

    if not task:
        raise ValueError(f"Task with id {task_id} not found or user not authorized")

    task_title = task.title

    # Use the adapter service to delete the task via the existing service layer
    success = await TaskAdapterService.delete_task(
        session=session,
        task_id=task_id,
        user_id=user_id
    )

    if not success:
        raise ValueError(f"Task with id {task_id} not found or user not authorized")

    # Return structured JSON as required by constitution
    return {
        "task_id": str(task.id),  # Return the UUID for identification
        "status": "deleted",  # Status indicating the task was deleted
        "title": task_title  # Return the title of the deleted task
    }


def validate_delete_task_params(params: Dict[str, Any]) -> Dict[str, Any]:
    """Validate parameters for the delete_task tool."""
    if "task_id" not in params or not params["task_id"]:
        raise ValueError("task_id is required")

    task_id = params["task_id"]

    # If task_id is already a valid UUID, return it as is
    try:
        from uuid import UUID
        UUID(task_id)
        return {
            "task_id": task_id
        }
    except ValueError:
        # If not a UUID, it might be an integer index
        try:
            # Try to convert to integer
            task_index = int(task_id)
            # Validate it's a positive integer
            if task_index <= 0:
                raise ValueError("task_id must be a valid UUID string or a positive integer")
            # Return it as is - the service layer will handle the mapping
            return {
                "task_id": task_id
            }
        except ValueError:
            raise ValueError("task_id must be a valid UUID string or a positive integer")