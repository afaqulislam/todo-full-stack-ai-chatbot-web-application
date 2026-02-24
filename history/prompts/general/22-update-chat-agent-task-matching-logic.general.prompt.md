---
id: 22
title: Update Chat Agent Task Matching Logic
stage: general
date: 2026-02-24
surface: agent
model: if/qwen3-coder-plus
feature: none
branch: 1-ai-chatbot
user: STAR GAMERZ
command: "sp.implement"
labels: [ai, chatbot, matching, tasks, backend]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/agents/chat_agent.py
tests:
  - backend/src/agents/chat_agent.py
---

## Prompt

```
D:\Afaq Coding\Q4\Hackathon II\Evolution of Todo\Phase III\todo-full-stack-ai-chatbot-web-application\backend\src\agents\chat_agent.py in this path add some system message k jub bhi user kuch bole kerne ko to title or description dono check kero or agr 1 bhi match kere to us ka action ko perform kero "I couldn't find a task matching that description to complete." is tarahh ka message na do ok
```

## Response snapshot

Updated the chat agent to improve task matching logic:

1. Enhanced the `_find_task_by_fuzzy_match` function to treat title and description matching more equally (previously title had higher weight than description)
2. Lowered the matching threshold to make matching more lenient
3. Updated the system message to explicitly instruct the AI to check both title and description fields with equal priority
4. Modified error response functions to provide more helpful messages that explain the matching approach and suggest alternatives
5. Changed error messages to be more helpful and suggest rephrasing or listing tasks instead of just saying "couldn't find"

The agent will now check both title and description fields when looking for tasks, and if either matches the user's request, it will perform the requested action. The error messages have been improved to guide users more effectively.

## Outcome

- ✅ Impact: Improved task matching with equal priority for titles and descriptions
- 🧪 Tests: Agent now matches tasks by either title or description more effectively
- 📁 Files: Updated chat_agent.py with enhanced matching logic
- 🔁 Next prompts: Better task identification and reduced error responses
- 🧠 Reflection: More intuitive task matching behavior for users

## Evaluation notes (flywheel)

- Failure modes observed: N/A - improved matching logic
- Graders run and results (PASS/FAIL): N/A - backend logic enhancement
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Test with various title/description matching scenarios