from fastapi import APIRouter, Depends, HTTPException, status, Body, Request
from uuid import UUID
from typing import List
from ..models.todo import Todo, TodoCreate, TodoUpdate, TodoRead, TodoPatch
from ..services.todo_service import TodoService
from ..core.database import get_async_session
from ..core.security import verify_token, get_user_id_from_cookie
from ..core.config import settings
from sqlalchemy.ext.asyncio import AsyncSession


router = APIRouter(prefix=f"{settings.api_v1_prefix}/todos", tags=["todos"])


# Using centralized dependency from security.py


@router.post("", response_model=TodoRead, status_code=status.HTTP_201_CREATED)
async def create_todo(
    *,
    request: Request,
    session: AsyncSession = Depends(get_async_session),
    todo_create: TodoCreate
) -> TodoRead:
    """
    Create a new todo item for the authenticated user.
    """
    user_id = await get_user_id_from_cookie(request)
    # Enforce user ownership by using the authenticated user's ID
    # The user_id from token is used instead of any user_id in the request body
    return await TodoService.create_todo(session=session, todo_create=todo_create, user_id=user_id)


@router.get("/{todo_id}", response_model=TodoRead)
async def get_todo(
    *,
    todo_id: UUID,
    request: Request,
    session: AsyncSession = Depends(get_async_session)
) -> TodoRead:
    """
    Get a specific todo item by ID.
    Only returns todos that belong to the authenticated user.
    """
    user_id = await get_user_id_from_cookie(request)
    return await TodoService.get_todo_by_id(session=session, todo_id=todo_id, user_id=user_id)


@router.get("", response_model=List[TodoRead])
async def get_todos(
    *,
    request: Request,
    session: AsyncSession = Depends(get_async_session),
    skip: int = 0,
    limit: int = 100
) -> List[TodoRead]:
    """
    Get all todo items for the authenticated user.
    """
    user_id = await get_user_id_from_cookie(request)
    return await TodoService.get_todos_by_user(session=session, user_id=user_id, skip=skip, limit=limit)


@router.put("/{todo_id}", response_model=TodoRead)
async def update_todo(
    *,
    todo_id: UUID,
    todo_update: TodoUpdate,
    request: Request,
    session: AsyncSession = Depends(get_async_session)
) -> TodoRead:
    """
    Update a specific todo item.
    Only allows updating todos that belong to the authenticated user.
    """
    user_id = await get_user_id_from_cookie(request)
    return await TodoService.update_todo(
        session=session,
        todo_id=todo_id,
        todo_update=todo_update,
        user_id=user_id
    )


@router.patch("/{todo_id}", response_model=TodoRead)
async def patch_todo(
    *,
    todo_id: UUID,
    todo_patch: TodoPatch = Body(...),
    request: Request,
    session: AsyncSession = Depends(get_async_session)
) -> TodoRead:
    """
    Partially update a specific todo item.
    Only allows updating todos that belong to the authenticated user.
    """
    user_id = await get_user_id_from_cookie(request)
    return await TodoService.patch_todo(
        session=session,
        todo_id=todo_id,
        todo_patch=todo_patch,
        user_id=user_id
    )


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    *,
    todo_id: UUID,
    request: Request,
    session: AsyncSession = Depends(get_async_session)
) -> None:
    """
    Delete a specific todo item.
    Only allows deleting todos that belong to the authenticated user.
    """
    user_id = await get_user_id_from_cookie(request)
    await TodoService.delete_todo(session=session, todo_id=todo_id, user_id=user_id)


@router.post("/{todo_id}/toggle", response_model=TodoRead)
async def toggle_todo_completion(
    *,
    todo_id: UUID,
    request: Request,
    session: AsyncSession = Depends(get_async_session)
) -> TodoRead:
    """
    Toggle the completion status of a specific todo item.
    Only allows toggling todos that belong to the authenticated user.
    """
    user_id = await get_user_id_from_cookie(request)
    return await TodoService.toggle_todo_completion(session=session, todo_id=todo_id, user_id=user_id)