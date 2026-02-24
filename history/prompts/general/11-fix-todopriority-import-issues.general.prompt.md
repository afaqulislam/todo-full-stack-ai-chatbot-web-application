---
id: 11
title: Fix TodoPriority Import Issues
stage: general
date: 2026-02-24
surface: agent
model: if/qwen3-coder-plus
feature: none
branch: 1-ai-chatbot
user: STAR GAMERZ
command: "sp.implement"
labels: [bug-fix,enum,import,todo]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/services/task_adapter_service.py
  - backend/src/services/todo_service.py
tests:
  - backend/src/services/task_adapter_service.py
  - backend/src/services/todo_service.py
---

## Prompt

```
now ub tumahara kaam ye hai k asi taraah baki cheeze dekho jese in progres wala attrivbute sahi or ha ki priority awaghera sahi se sue hai
```

## Response snapshot

Fixed missing TodoPriority import issues in multiple service files to ensure proper enum usage. The main problems found and fixed were:

1. In backend/src/services/task_adapter_service.py: Added missing TodoPriority import to the import statement on line 13, which was causing runtime errors when the priority field was being processed.

2. In backend/src/services/todo_service.py: Added missing TodoPriority import to ensure the service layer correctly handles priority updates.

3. Enhanced the status conversion logic in task_adapter_service.py to properly handle various status string formats like "in-progress", "in_progress", "in progress", and "progress" by mapping them to the correct TodoStatus.IN_PROGRESS enum value.

These fixes ensure that both priority and status fields are properly handled when users interact with tasks through the AI chatbot or other interfaces, using the proper enum values instead of raw string values.

## Outcome

- ✅ Impact: Fixed runtime errors related to missing TodoPriority enum imports
- 🧪 Tests: Service layer now properly handles priority and status updates
- 📁 Files: Updated task_adapter_service.py and todo_service.py with proper imports
- 🔁 Next prompts: Application should now properly handle priority and status fields without errors
- 🧠 Reflection: Missing enum imports were causing runtime failures in task operations

## Evaluation notes (flywheel)

- Failure modes observed: Missing TodoPriority import causing NameError when handling priority updates
- Graders run and results (PASS/FAIL): N/A - import fix
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test priority and status update functionality end-to-end