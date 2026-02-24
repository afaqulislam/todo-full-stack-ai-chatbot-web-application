---
id: 7
title: "Fix Task Matching Thresholds to Prevent Unwanted Deletions"
stage: red
date_iso: 2026-02-23
surface: agent
model: Claude Opus 4.6
feature: "1-ai-chatbot"
branch: "1-ai-chatbot"
user: STAR GAMERZ
command: "/sp.implement fix matching thresholds"
labels: ["ai-chatbot", "matching", "bug-fix", "thresholds"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - "backend/src/mcp/tools/delete_task_by_description.py"
  - "backend/src/mcp/tools/search_tasks_by_title.py"
tests_yaml:
  - "backend/tests/unit/test_mcp_tools.py"
---

# Fix Task Matching Thresholds to Prevent Unwanted Deletions

## User Problem
"the issue is that this time they deletinng all task one by one on every call of delete task what ever the user match that condition or not"

## Analysis
The issue was that the similarity matching thresholds in the task matching algorithms were too low, causing tasks to be deleted even when they didn't closely match the user's query.

In `delete_task_by_description.py`:
- Title-specific queries had a threshold of 0.2 (20%)
- General queries had a threshold of 0.3 (30%)
- This meant that even weak matches would result in task deletion

In `search_tasks_by_title.py`:
- The threshold was 30% for all matches
- This could return poorly matching results

## Fix Applied

### 1. Increased matching thresholds in `delete_task_by_description.py`:
```python
# Before
threshold = 0.2 if is_title_specific else 0.3  # Lower threshold for title-specific queries

# After
threshold = 0.4 if is_title_specific else 0.5  # More reasonable threshold for matching
```

### 2. Increased matching threshold in `search_tasks_by_title.py`:
```python
# Before
if similarity_score > 30:  # Only include tasks with reasonable similarity (above 30%)

# After
if similarity_score > 40:  # Only include tasks with reasonable similarity (above 40%)
```

## Impact

The AI Chatbot will now:
- Only delete tasks that have at least 40% similarity for title-specific queries (like "delete task called xyz")
- Only delete tasks that have at least 50% similarity for general queries
- Only search for/return tasks with at least 40% similarity in title searches
- Prevent unwanted deletions of tasks that don't closely match user's query
- Maintain proper task matching while preventing false positives

## Verification

- When users request "delete task called imad", only tasks with titles closely matching "imad" will be deleted
- Tasks with low similarity scores (below 40-50%) will not be matched/deleted
- Search results will be more accurate and relevant
- Better user experience with more precise task matching

## Evaluation

This fix addresses the core issue of overly loose matching that was causing inappropriate task deletions while maintaining the ability to handle minor typos and variations in task names.