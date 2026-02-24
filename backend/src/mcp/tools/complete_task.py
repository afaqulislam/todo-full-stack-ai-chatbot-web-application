"""MCP tool for completing tasks - follows constitution requirements."""

from typing import Any, Dict

from ...services.task_adapter_service import TaskAdapterService
from sqlalchemy.ext.asyncio import AsyncSession


async def complete_task_tool(session: AsyncSession, user_id: str, task_id: str, completed: bool = True) -> Dict[str, Any]:
    """
    MCP tool to complete a task via the existing Task service layer.

    Following constitution rule: MCP tools must call existing Task service layer only,
    and must not access DB directly.
    """
    # First get the task to check if it exists before attempting to complete it
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
                # The task by index exists but couldn't be completed for another reason
                raise ValueError(f"Task at position {task_index} could not be completed")
            else:
                raise ValueError(f"Task at position {task_index} does not exist. You only have {len(all_tasks)} tasks.")
        except ValueError:
            # Not an integer, so it's a UUID issue
            raise ValueError(f"Task with id {task_id} not found or user not authorized")

    # Use the adapter service to complete the task via the existing service layer
    updated_todo = await TaskAdapterService.complete_task(
        session=session,
        task_id=task_id,
        user_id=user_id,
        completed=completed
    )

    if updated_todo is None:
        raise ValueError(f"Task with id {task_id} not found or user not authorized")

    # Return structured JSON as required by constitution
    return {
        "task_id": str(updated_todo.id),  # Convert UUID to string for JSON serialization
        "status": updated_todo.status.value,  # Use .value for enum serialization
        "title": updated_todo.title
    }


def validate_complete_task_params(params: Dict[str, Any]) -> Dict[str, Any]:
    """Validate parameters for the complete_task tool."""
    if "task_id" not in params or not params["task_id"]:
        raise ValueError("task_id is required")

    task_id = params["task_id"]
    completed = params.get("completed", True)  # Default to True for backward compatibility

    # Validate completed parameter
    if not isinstance(completed, bool):
        raise ValueError("completed must be a boolean")

    # If task_id is already a valid UUID, return it as is
    try:
        from uuid import UUID
        UUID(task_id)
        return {
            "task_id": task_id,
            "completed": completed
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
                "task_id": task_id,
                "completed": completed
            }
        except ValueError:
            raise ValueError("task_id must be a valid UUID string or a positive integer")