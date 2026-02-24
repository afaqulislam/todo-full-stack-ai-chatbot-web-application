"""MCP tool for deleting tasks by description/title - follows constitution requirements."""
import logging
from typing import Any, Dict, List

from ...services.task_adapter_service import TaskAdapterService
from sqlalchemy.ext.asyncio import AsyncSession
from difflib import SequenceMatcher

try:
    from fuzzywuzzy import fuzz
    FUZZY_ENABLED = True
except ImportError:
    fuzz = None
    FUZZY_ENABLED = False


async def delete_task_by_description_tool(
    session: AsyncSession,
    user_id: str,
    task_description: str
) -> Dict[str, Any]:
    """
    MCP tool to delete a task by its description/title via the existing Task service layer.
    This allows deletion when user provides a task title/description instead of an ID.

    Following constitution rule: MCP tools must call existing Task service layer only,
    and must not access DB directly.
    """
    # Get all tasks for the user
    all_tasks = await TaskAdapterService.get_tasks_by_user(
        session=session,
        user_id=user_id
    )

    if not all_tasks:
        raise ValueError(f"No tasks found for user {user_id}")

    # Find the best matching task
    best_match = _find_best_task_match(task_description, all_tasks)

    if not best_match:
        raise ValueError(f"No task found matching description: '{task_description}'")

    # Get the task to capture its title before deletion
    task = await TaskAdapterService.get_task_by_id(
        session=session,
        task_id=best_match["task_id"],
        user_id=user_id
    )

    if not task:
        raise ValueError(f"Task with id {best_match['task_id']} not found or user not authorized")

    task_title = task.title

    # Use the adapter service to delete the task via the existing service layer
    success = await TaskAdapterService.delete_task(
        session=session,
        task_id=best_match["task_id"],
        user_id=user_id
    )

    if not success:
        raise ValueError(f"Task with id {best_match['task_id']} could not be deleted")

    # Log the successful match for debugging
    logging.info(f"Task matching '{task_description}' was found and deleted. Match score: {best_match['score']}")

    # Return structured JSON as required by constitution
    return {
        "task_id": str(task.id),  # Return the UUID for identification
        "status": "deleted",  # Status indicating the task was deleted
        "title": task_title,  # Return the title of the deleted task
        "matched_description": task_description,  # Include what was matched for debugging
        "match_score": best_match["score"]  # Include match score for debugging
    }


def _find_best_task_match(task_description: str, tasks: List[Any]) -> Dict[str, Any]:
    """
    Find the best matching task based on description/title using fuzzy matching.

    Returns: Dict with task_id, score, and match details
    """
    if not tasks:
        return None

    # Check if the search description might be title-specific (e.g., from "called", "named", "titled" usage)
    original_description = task_description.lower()
    is_title_specific = any(phrase in original_description for phrase in ["called", "named", "titled"])

    # Normalize the search description: trim spaces, lowercase, remove extra whitespace
    normalized_description = ' '.join(task_description.lower().strip().split())

    best_match = None
    best_score = 0

    for task in tasks:
        # Get normalized task title and description
        task_title = ' '.join((task.title or "").lower().strip().split())
        task_description_field = ' '.join((task.description or "").lower().strip().split())

        # Calculate similarity scores
        title_score = _calculate_similarity(normalized_description, task_title)
        description_score = _calculate_similarity(normalized_description, task_description_field)

        # If this is a title-specific query, give higher weight to title matches
        if is_title_specific:
            max_score = max(title_score * 1.5, description_score)  # Boost title score
        else:
            max_score = max(title_score, description_score)

        # Update best match if this is better
        if max_score > best_score:
            best_score = max_score
            # Determine which field had the better match
            matched_field = "title" if (title_score >= description_score) or is_title_specific else "description"
            best_match = {
                "task_id": str(task.id),
                "score": max_score,
                "matched_field": matched_field,
                "task_title": task.title,
                "task_description": task.description
            }

    # Adjust threshold based on whether it's a title-specific query
    threshold = 0.4 if is_title_specific else 0.5  # More reasonable threshold for matching
    # Only return match if score is above reasonable threshold
    if best_score > threshold:
        return best_match
    else:
        return None


def _calculate_similarity(text1: str, text2: str) -> float:
    """
    Calculate similarity between two texts using multiple methods.
    """
    if not text1 or not text2:
        return 0.0

    # First check for exact match (after normalization)
    if text1 == text2:
        return 1.0

    # Calculate sequence similarity
    seq_score = SequenceMatcher(None, text1, text2).ratio()

    # If fuzzywuzzy is available, use it for better partial matching
    if FUZZY_ENABLED:
        # Try different fuzzy matching strategies
        partial_score = fuzz.partial_ratio(text1, text2) / 100.0
        token_sort_score = fuzz.token_sort_ratio(text1, text2) / 100.0
        token_set_score = fuzz.token_set_ratio(text1, text2) / 100.0

        # Return the highest score among all methods
        return max(seq_score, partial_score, token_sort_score, token_set_score)
    else:
        # Just return sequence similarity if fuzzywuzzy is not available
        return seq_score


def validate_delete_task_by_description_params(params: Dict[str, Any]) -> Dict[str, Any]:
    """Validate parameters for the delete_task_by_description tool."""
    if "task_description" not in params or not params["task_description"]:
        raise ValueError("task_description is required")

    task_description = params["task_description"]

    if not isinstance(task_description, str):
        raise ValueError("task_description must be a string")

    if len(task_description.strip()) == 0:
        raise ValueError("task_description cannot be empty")

    return {
        "task_description": task_description.strip()
    }