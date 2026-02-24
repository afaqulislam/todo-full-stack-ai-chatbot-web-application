from sqlmodel import select
from typing import List, Optional
from uuid import UUID
from ..models.todo import Todo, TodoCreate, TodoUpdate, TodoRead, TodoPatch, TodoPriority, TodoStatus
from ..models.user import User
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession


class TodoService:
    """
    Service layer for Todo operations with user ownership validation.
    """

    @staticmethod
    async def create_todo(*, session: AsyncSession, todo_create: TodoCreate, user_id: UUID) -> TodoRead:
        """
        Create a new todo item for a specific user.
        Enforces user ownership by setting the user_id from the authenticated user.
        """
        # Verify the user exists
        user_exists_stmt = select(User).where(User.id == user_id)
        user_result = await session.execute(user_exists_stmt)
        user = user_result.scalars().first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Create the todo with the authenticated user's ID
        db_todo = Todo.model_validate(todo_create.model_dump(), update={"user_id": user_id})

        # Ensure status is consistent with completed state
        if db_todo.completed:
            db_todo.status = TodoStatus.COMPLETED
        elif db_todo.status == TodoStatus.COMPLETED and not db_todo.completed:
            # If somehow completed is False but status is COMPLETED, set to TODO
            db_todo.status = TodoStatus.TODO
        session.add(db_todo)
        await session.commit()
        await session.refresh(db_todo)

        return TodoRead.model_validate(db_todo)

    @staticmethod
    async def get_todo_by_id(*, session: AsyncSession, todo_id: UUID, user_id: UUID) -> TodoRead:
        """
        Retrieve a specific todo by ID for the authenticated user.
        Enforces user ownership by filtering by user_id.
        """
        statement = select(Todo).where(Todo.id == todo_id).where(Todo.user_id == user_id)
        result = await session.execute(statement)
        todo = result.scalars().first()

        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found or does not belong to the authenticated user"
            )

        return TodoRead.model_validate(todo)

    @staticmethod
    async def get_todos_by_user(*, session: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100) -> List[TodoRead]:
        """
        Retrieve all todos for the authenticated user.
        Enforces user ownership by filtering by user_id.
        """
        statement = select(Todo).where(Todo.user_id == user_id).offset(skip).limit(limit)
        result = await session.execute(statement)
        todos = result.scalars().all()

        return [TodoRead.model_validate(todo) for todo in todos]

    @staticmethod
    async def update_todo(*, session: AsyncSession, todo_id: UUID, todo_update: TodoUpdate, user_id: UUID) -> TodoRead:
        """
        Update a specific todo for the authenticated user.
        Enforces user ownership by ensuring the todo belongs to the user.
        """
        # First, verify the todo exists and belongs to the user
        statement = select(Todo).where(Todo.id == todo_id).where(Todo.user_id == user_id)
        result = await session.execute(statement)
        todo = result.scalars().first()

        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found or does not belong to the authenticated user"
            )

        # Apply updates
        update_data = todo_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(todo, field, value)

        # Ensure status and completed fields are consistent
        if hasattr(todo_update, 'completed') and todo_update.completed is not None:
            if todo.completed:
                todo.status = TodoStatus.COMPLETED
            else:
                # If completed is False, but status was COMPLETED, update to appropriate status
                if todo.status == TodoStatus.COMPLETED:
                    # If user is marking as incomplete, set to 'todo' unless it was 'in-progress'
                    if hasattr(todo_update, 'status') and todo_update.status and todo_update.status != TodoStatus.COMPLETED:
                        # Status is being explicitly set, respect that
                        pass
                    else:
                        # Default to 'todo' when marking as incomplete
                        todo.status = TodoStatus.TODO

        # If status is being set to COMPLETED, also set completed to True
        if hasattr(todo_update, 'status') and todo_update.status == TodoStatus.COMPLETED:
            todo.completed = True
        elif hasattr(todo_update, 'status') and todo_update.status != TodoStatus.COMPLETED:
            # If status is being set to non-COMPLETED, mark as not completed (unless it's explicitly completed)
            if not (hasattr(todo_update, 'completed') and todo_update.completed is True):
                todo.completed = False

        session.add(todo)
        await session.commit()
        await session.refresh(todo)

        return TodoRead.model_validate(todo)

    @staticmethod
    async def patch_todo(*, session: AsyncSession, todo_id: UUID, todo_patch: TodoPatch, user_id: UUID) -> TodoRead:
        """
        Partially update a specific todo for the authenticated user.
        Enforces user ownership by ensuring the todo belongs to the user.
        """
        # First, verify the todo exists and belongs to the user
        statement = select(Todo).where(Todo.id == todo_id).where(Todo.user_id == user_id)
        result = await session.execute(statement)
        todo = result.scalars().first()

        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found or does not belong to the authenticated user"
            )

        # Apply patches
        patch_data = todo_patch.model_dump(exclude_unset=True)
        for field, value in patch_data.items():
            setattr(todo, field, value)

        # Ensure status and completed fields are consistent
        if 'completed' in patch_data:
            if todo.completed:
                todo.status = TodoStatus.COMPLETED
            else:
                # If completed is False, but status was COMPLETED, update to appropriate status
                if todo.status == TodoStatus.COMPLETED:
                    # If user is marking as incomplete, set to 'todo' unless it was 'in-progress'
                    if 'status' in patch_data and patch_data['status'] != TodoStatus.COMPLETED:
                        # Status is being explicitly set, respect that
                        pass
                    else:
                        # Default to 'todo' when marking as incomplete
                        todo.status = TodoStatus.TODO

        # If status is being set to COMPLETED, also set completed to True
        if 'status' in patch_data and patch_data['status'] == TodoStatus.COMPLETED:
            todo.completed = True
        elif 'status' in patch_data and patch_data['status'] != TodoStatus.COMPLETED:
            # If status is being set to non-COMPLETED, mark as not completed (unless it's explicitly completed)
            if 'completed' not in patch_data:
                todo.completed = False

        session.add(todo)
        await session.commit()
        await session.refresh(todo)

        return TodoRead.model_validate(todo)

    @staticmethod
    async def delete_todo(*, session: AsyncSession, todo_id: UUID, user_id: UUID) -> bool:
        """
        Delete a specific todo for the authenticated user.
        Enforces user ownership by ensuring the todo belongs to the user.
        """
        # First, verify the todo exists and belongs to the user
        statement = select(Todo).where(Todo.id == todo_id).where(Todo.user_id == user_id)
        result = await session.execute(statement)
        todo = result.scalars().first()

        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found or does not belong to the authenticated user"
            )

        await session.delete(todo)
        await session.commit()

        return True

    @staticmethod
    async def toggle_todo_completion(*, session: AsyncSession, todo_id: UUID, user_id: UUID) -> TodoRead:
        """
        Toggle the completion status of a specific todo for the authenticated user.
        Enforces user ownership by ensuring the todo belongs to the user.
        """
        # First, verify the todo exists and belongs to the user
        statement = select(Todo).where(Todo.id == todo_id).where(Todo.user_id == user_id)
        result = await session.execute(statement)
        todo = result.scalars().first()

        if not todo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Todo not found or does not belong to the authenticated user"
            )

        # Toggle completion status
        todo.completed = not todo.completed

        # Update status based on completion state
        if todo.completed:
            todo.status = TodoStatus.COMPLETED
        else:
            # If it was completed before and now it's not, set to 'todo' or keep 'in-progress'
            # Let's preserve the status if it was 'in-progress' to avoid resetting it
            if todo.status == TodoStatus.COMPLETED:
                todo.status = TodoStatus.TODO

        session.add(todo)
        await session.commit()
        await session.refresh(todo)

        return TodoRead.model_validate(todo)