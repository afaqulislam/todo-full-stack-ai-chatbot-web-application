"""MCP tool for searching tasks by title - follows constitution requirements."""

from typing import Any, Dict, List
import re

from ...services.task_adapter_service import TaskAdapterService
from sqlalchemy.ext.asyncio import AsyncSession

try:
    from fuzzywuzzy import fuzz
    FUZZY_ENABLED = True
except ImportError:
    fuzz = None
    FUZZY_ENABLED = False


async def search_tasks_by_title_tool(session: AsyncSession, user_id: str, title_query: str) -> Dict[str, Any]:
    """
    MCP tool to search for tasks by title using fuzzy matching.

    Following constitution rule: MCP tools must call existing Task service layer only,
    and must not access DB directly.
    """
    # Get all tasks for the user
    all_tasks = await TaskAdapterService.get_tasks_by_user(
        session=session,
        user_id=user_id
    )

    if not all_tasks:
        return {"tasks": []}

    # Normalize the search query
    normalized_query = ' '.join(title_query.lower().strip().split())

    # Filter tasks by title using fuzzy matching
    matching_tasks = []
    for task in all_tasks:
        task_title = ' '.join((task.title or "").lower().strip().split())

        if not task_title:
            continue

        # Calculate similarity scores
        similarity_score = 0

        # Sequence matching
        from difflib import SequenceMatcher
        sequence_score = SequenceMatcher(None, normalized_query, task_title).ratio()
        similarity_score = sequence_score * 100

        # Use fuzzy matching if available
        if FUZZY_ENABLED:
            fuzzy_score = fuzz.partial_ratio(normalized_query, task_title)
            similarity_score = max(similarity_score, fuzzy_score)

            # Also check token sort ratio for better matching
            token_score = fuzz.token_sort_ratio(normalized_query, task_title)
            similarity_score = max(similarity_score, token_score)

        # Only include tasks with reasonable similarity (above 40%)
        if similarity_score > 40:
            task_info = {
                "task_id": str(task.id),
                "title": task.title,
                "description": task.description,
                "status": task.status.value,
                "similarity_score": round(similarity_score, 2)
            }
            matching_tasks.append(task_info)

    # Sort by similarity score (highest first)
    matching_tasks.sort(key=lambda x: x["similarity_score"], reverse=True)

    # Return structured JSON as required by constitution
    return {
        "tasks": matching_tasks,
        "total_matches": len(matching_tasks)
    }


def validate_search_tasks_by_title_params(params: Dict[str, Any]) -> Dict[str, Any]:
    """Validate parameters for the search_tasks_by_title tool."""
    if "title_query" not in params or not params["title_query"]:
        raise ValueError("title_query is required")

    title_query = params["title_query"]

    if not isinstance(title_query, str):
        raise ValueError("title_query must be a string")

    if len(title_query.strip()) == 0:
        raise ValueError("title_query cannot be empty")

    return {
        "title_query": title_query.strip()
    }