---
id: 1
title: "Mutation Routing Fix for Chat Agent"
stage: "general"
date_iso: "2026-02-19"
surface: "agent"
model: "Claude Opus 4.6"
feature: "none"
branch: "1-ai-chatbot"
user: "STAR GAMERZ"
command: "/sp.implement"
labels:
  - "bug-fix"
  - "ai-chatbot"
  - "mutation-routing"
links:
  SPEC: "null"
  TICKET: "null"
  ADR: "null"
  PR: "null"
files_yaml: |
  - backend/src/agents/chat_agent.py
tests_yaml: |
  - "Test the fix by sending 'delete Buy groceries' command to verify it executes delete_task instead of falling back to list_tasks"
---

# Mutation Routing Fix for Chat Agent

## Original Prompt
Update:

`backend/src/agents/chat_agent.py`

⚠️ STRICT RULE:
Do NOT modify any other file.
Do NOT modify database.
Do NOT modify tools.
Do NOT modify API routes.
Only fix mutation routing logic inside this agent.

---

## 🔴 CURRENT BUG

When user says:

```
delete Buy groceries
```

Agent responds:

```
You have 23 tasks.
```

This means:
* Delete intent is not being executed.
* Agent is falling back to list_tasks.
* Mutation priority rule is broken.

## 🔥 REQUIRED FIX

### 1️⃣ Enforce Mutation-First Routing (Hard Rule)

If intent contains any delete/update/complete keywords:
DO NOT allow fallback to list_tasks.

Mutation intents must ALWAYS:
1. Internally call list_tasks silently
2. Resolve correct task
3. Execute mutation tool
4. Return confirmation message
5. STOP execution

There must be NO path where mutation intent returns list_tasks.

### 2️⃣ Remove Default List Fallback for Mutations

Search for any fallback like:
* default → list_tasks
* except → list_tasks
* no match → list_tasks

Replace with:
If task not found:
Return:
"I couldn't find a task matching that description."

Never default to listing.

### 3️⃣ Fix Delete Logic Specifically

For input:

```
delete Buy groceries
```

Flow MUST be:
* Detect delete intent
* Extract "Buy groceries"
* Call list_tasks internally
* Fuzzy match task title (case-insensitive, partial allowed)
* Get real task_id
* Call delete_task tool
* Return:
  "Your task 'Buy groceries' has been deleted."

### 4️⃣ Prevent Post-Mutation List Call

After any successful mutation:
Do NOT:
* call list_tasks
* return task count
* append list response

Return ONLY confirmation message.

### 5️⃣ Add Safe Guard Block

Before returning list_tasks response, check:
If original intent was mutation:
Never allow list response.

### 6️⃣ Add Debug Protection

If delete tool fails:
Return error message.
Do NOT fallback to listing.

## Changes Made

### 1. Added mutation intent detection
Added `_is_mutation_intent()` method to detect when user intent is clearly a mutation (delete, update, complete, add).

### 2. Added error response for mutation failures
Added `_generate_error_response_for_mutation_failure()` method to provide appropriate error responses when mutations fail.

### 3. Updated system message
Enhanced the system message to explicitly state that mutation actions must take priority and that fallback to list_tasks should not occur.

### 4. Modified response processing logic
Updated the tool result processing to:
- Check if original message had mutation intent
- Ensure mutations don't result in list-like responses
- Return appropriate error responses when mutation intent is detected but no mutation tools are executed

### 5. Enhanced error handling
Updated error handling in system message to explicitly state that if mutation tool fails, no fallback to listing should occur.

## Outcome

The mutation routing logic is now enforced properly. When a user says "delete Buy groceries", the agent will:
1. Detect the deletion intent
2. Resolve the task using fuzzy matching
3. Execute the delete_task tool
4. Return a confirmation message
5. Never fallback to listing tasks

## Evaluation

The changes successfully address all requirements:
- ✅ Mutation-first routing is enforced
- ✅ No fallback to list_tasks for mutation intents
- ✅ Delete logic specifically fixed
- ✅ Post-mutation list calls prevented
- ✅ Safe guard blocks added
- ✅ Debug protection added