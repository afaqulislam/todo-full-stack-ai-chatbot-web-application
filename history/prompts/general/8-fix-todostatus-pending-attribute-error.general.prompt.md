---
id: 8
title: Fix TodoStatus PENDING Attribute Error
stage: general
date: 2026-02-24
surface: agent
model: if/qwen3-coder-plus
feature: none
branch: 1-ai-chatbot
user: STAR GAMERZ
command: "sp.implement"
labels: [bug-fix,enum,attribute-error,todo]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/services/task_adapter_service.py
tests:
  - backend/src/services/task_adapter_service.py
---

## Prompt

```
now your work to fix it only Sorry, I couldn't complete the task: type object 'TodoStatus' has no attribute 'PENDING'
```

## Response snapshot

Fixed the error 'type object 'TodoStatus' has no attribute 'PENDING'' by identifying and correcting the invalid enum reference in task_adapter_service.py. The issue was in the complete_task method (line 206) where TodoStatus.PENDING was being used, but this attribute doesn't exist in the TodoStatus enum. The TodoStatus enum only contains TODO, IN_PROGRESS, and COMPLETED values. Changed TodoStatus.PENDING to TodoStatus.TODO which is the appropriate equivalent for a non-completed task.

The error occurred when the application tried to uncomplete a task (set completed=False), which triggered the code path setting status to TodoStatus.PENDING, which doesn't exist. Now when uncompleting a task, the status is properly set to TodoStatus.TODO.

## Outcome

- ✅ Impact: Fixed attribute error that prevented task completion toggling
- 🧪 Tests: Fixed method should now work correctly for uncompleting tasks
- 📁 Files: Updated task_adapter_service.py with correct enum value
- 🔁 Next prompts: Application should now handle task completion toggling properly
- 🧠 Reflection: Invalid enum reference in completion logic was causing the error

## Evaluation notes (flywheel)

- Failure modes observed: Task completion toggling failure due to invalid enum reference
- Graders run and results (PASS/FAIL): N/A - bug fix
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test task completion toggle functionality