"""
Task Adapter Service for the AI Chatbot feature.
This service adapts the existing UUID-based todo service to work with integer IDs
as specified in the MCP tool contracts, while maintaining compliance with the constitution
by using the existing service layer without modification.
"""

from typing import List, Optional
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from ..models.todo import Todo, TodoCreate, TodoPriority, TodoStatus, TodoUpdate
from ..services.todo_service import TodoService


class TaskAdapterService:
    """
    Adapter service that provides integer ID interface while using the existing UUID-based service.
    This allows MCP tools to use integer task_ids as specified in the constitution while
    maintaining compatibility with the existing UUID-based service layer.
    """

    @staticmethod
    async def _resolve_task_id(session: AsyncSession, task_id: str, user_id: str) -> Optional[UUID]:
        """
        Resolve a task_id which may be either a UUID string or a 1-based integer index
        to an actual UUID that can be used with the service layer.
        """
        try:
            # First check if it's a valid UUID
            return UUID(task_id)
        except ValueError:
            # If not a UUID, try to interpret as 1-based index
            try:
                task_index = int(task_id)
                if task_index <= 0:
                    return None  # Invalid index

                # Get all user's tasks
                all_tasks = await TaskAdapterService.get_tasks_by_user(
                    session=session,
                    user_id=user_id
                )

                # Check if the index is within range (1-based indexing)
                if 1 <= task_index <= len(all_tasks):
                    # Return the UUID of the task at the specified index (convert 1-based to 0-based)
                    return all_tasks[task_index - 1].id
                else:
                    # Index is out of range - return None to indicate invalid task
                    return None
            except ValueError:
                # Neither a valid UUID nor a valid integer
                return None

    @staticmethod
    async def create_task(
        session: AsyncSession, user_id: str, title: str, description: Optional[str] = None
    ) -> Todo:
        """
        Create a new task using the existing service layer.
        """
        todo_create = TodoCreate(
            title=title,
            description=description,
            status=TodoStatus.TODO  # Default to TODO status
        )

        return await TodoService.create_todo(
            session=session,
            todo_create=todo_create,
            user_id=UUID(user_id)
        )

    @staticmethod
    async def get_task_by_id(
        session: AsyncSession, task_id: str, user_id: str
    ) -> Optional[Todo]:
        """
        Get a task by its UUID string using the existing service layer.
        """
        # First try to see if it's an integer index by attempting conversion
        is_integer_index = False
        original_task_id = task_id
        try:
            int(task_id)  # Try to convert to int without handling errors yet
            is_integer_index = True
        except ValueError:
            is_integer_index = False

        # Handle both UUID and integer index
        actual_task_id = await TaskAdapterService._resolve_task_id(
            session=session,
            task_id=task_id,
            user_id=user_id
        )

        if actual_task_id is None and is_integer_index:
            # The task_id was an integer but couldn't be resolved, so it was out of range
            # This means the index was out of bounds, so we return None to indicate that
            return None
        elif actual_task_id is None:
            # This was supposed to be a UUID but is invalid
            return None

        return await TodoService.get_todo_by_id(
            session=session,
            todo_id=actual_task_id,
            user_id=UUID(user_id)
        )

    @staticmethod
    async def get_tasks_by_user(
        session: AsyncSession, user_id: str, status_filter: Optional[str] = None
    ) -> List[Todo]:
        """
        Get tasks for a user with optional status filter using the existing service layer.
        """
        all_todos = await TodoService.get_todos_by_user(
            session=session,
            user_id=UUID(user_id),
            skip=0,
            limit=100
        )

        if status_filter:
            status_lower = status_filter.lower()
            if status_lower == "pending":
                # Filter for non-completed tasks (todo or in-progress)
                filtered_todos = [
                    todo for todo in all_todos
                    if todo.status != TodoStatus.COMPLETED
                ]
            elif status_lower in ["todo", "todo"]:
                # Filter for todo tasks only
                filtered_todos = [
                    todo for todo in all_todos
                    if todo.status == TodoStatus.TODO
                ]
            elif status_lower in ["in-progress", "in_progress", "progress"]:
                # Filter for in-progress tasks
                filtered_todos = [
                    todo for todo in all_todos
                    if todo.status == TodoStatus.IN_PROGRESS
                ]
            elif status_lower == "completed":
                # Filter for completed tasks
                filtered_todos = [
                    todo for todo in all_todos
                    if todo.status == TodoStatus.COMPLETED
                ]
            else:
                # Invalid status filter, return all
                filtered_todos = all_todos
        else:
            filtered_todos = all_todos

        return filtered_todos

    @staticmethod
    async def update_task(
        session: AsyncSession, task_id: str, user_id: str,
        title: Optional[str] = None, description: Optional[str] = None,
        priority: Optional[str] = None, status: Optional[str] = None
    ) -> Optional[Todo]:
        """
        Update a task using the existing service layer.
        """
        # Handle both UUID and integer index
        actual_task_id = await TaskAdapterService._resolve_task_id(
            session=session,
            task_id=task_id,
            user_id=user_id
        )

        if actual_task_id is None:
            return None

        # Create update object
        todo_update = TodoUpdate()
        if title is not None:
            todo_update.title = title
        if description is not None:
            todo_update.description = description
        if priority is not None:
            # Convert string priority to enum
            try:
                todo_update.priority = TodoPriority(priority.lower())
            except ValueError:
                raise ValueError(f"Invalid priority: {priority}. Must be 'low', 'medium', or 'high'.")
        if status is not None:
            # Convert string status to enum
            try:
                # Handle the case where user might say "in-progress", "in_progress", or "todo"
                if status.lower() in ["in-progress", "in_progress", "in progress", "progress"]:
                    status_enum = TodoStatus.IN_PROGRESS
                elif status.lower() == "todo":
                    status_enum = TodoStatus.TODO
                elif status.lower() == "completed":
                    status_enum = TodoStatus.COMPLETED
                else:
                    # For any other value, it's invalid for status
                    raise ValueError(f"Invalid status: {status}. Must be 'todo', 'in-progress', or 'completed'.")
                todo_update.status = status_enum
            except ValueError:
                raise ValueError(f"Invalid status: {status}. Must be 'todo', 'in-progress', or 'completed'.")

        return await TodoService.update_todo(
            session=session,
            todo_id=actual_task_id,
            todo_update=todo_update,
            user_id=UUID(user_id)
        )

    @staticmethod
    async def complete_task(
        session: AsyncSession, task_id: str, user_id: str, completed: bool = True
    ) -> Optional[Todo]:
        """
        Mark a task as completed or uncompleted using the existing service layer.
        """
        # Handle both UUID and integer index
        actual_task_id = await TaskAdapterService._resolve_task_id(
            session=session,
            task_id=task_id,
            user_id=user_id
        )

        if actual_task_id is None:
            return None

        # Create update object to mark as completed or uncompleted
        if completed:
            todo_update = TodoUpdate(
                completed=True,
                status=TodoStatus.COMPLETED
            )
        else:
            todo_update = TodoUpdate(
                completed=False,
                status=TodoStatus.TODO
            )

        return await TodoService.update_todo(
            session=session,
            todo_id=actual_task_id,
            todo_update=todo_update,
            user_id=UUID(user_id)
        )

    @staticmethod
    async def delete_task(
        session: AsyncSession, task_id: str, user_id: str
    ) -> bool:
        """
        Delete a task using the existing service layer.
        """
        # Handle both UUID and integer index
        actual_task_id = await TaskAdapterService._resolve_task_id(
            session=session,
            task_id=task_id,
            user_id=user_id
        )

        if actual_task_id is None:
            return False

        return await TodoService.delete_todo(
            session=session,
            todo_id=actual_task_id,
            user_id=UUID(user_id)
        )