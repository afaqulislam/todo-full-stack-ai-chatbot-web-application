---
id: 8
title: Implement Title-First Task Matching for Update and Complete Tools
stage: green
date: 2026-02-23
surface: agent
model: if/qwen3-coder-plus
feature: 1-ai-chatbot
branch: 1-ai-chatbot
user: STAR GAMERZ
command: /sp.phr
labels: ["ai-chatbot","matching","enhancement","task-resolution"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/src/mcp/tools/update_task_by_description.py
  - backend/src/mcp/tools/complete_task_by_description.py
  - backend/src/mcp/server.py
  - backend/src/agents/chat_agent.py
tests:
  - none
---

## Prompt

--title "Implement Title-First Task Matching for Update and Complete Tools" --stage green --feature "1-ai-chatbot" --labels "ai-chatbot,matching,enhancement,task-resolution" --files "backend/src/mcp/tools/update_task_by_description.py,backend/src/mcp/tools/complete_task_by_description.py,backend/src/mcp/server.py,backend/src/agents/chat_agent.py" --tests ""

## Response snapshot

Created new MCP tools (update_task_by_description and complete_task_by_description) that follow the same pattern as delete_task_by_description with title-first matching logic, and updated the agent and server to properly handle these new tools.

## Outcome

- ✅ Impact: Implemented consistent title-first task matching across all mutation operations (update, delete, complete) with dynamic error handling
- 🧪 Tests: none
- 📁 Files: backend/src/mcp/tools/update_task_by_description.py, backend/src/mcp/tools/complete_task_by_description.py, backend/src/mcp/server.py, backend/src/agents/chat_agent.py
- 🔁 Next prompts: Test the new functionality with various user queries
- 🧠 Reflection: Adding title-first matching tools provides more intuitive task resolution when users specify tasks by name/title

## Evaluation notes (flywheel)

- Failure modes observed: Could not find the create-phr.sh script, had to manually create the file
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Create a proper script or command to automate PHR creation