---
id: 1
title: AI Chatbot Constitution
stage: constitution
date: 2026-02-17
surface: agent
model: claude-opus-4-6
feature: none
branch: main
user: Claude
command: /sp.constitution
labels: [constitution, architecture, ai]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

PROJECT: Phase III – AI-Powered Todo Chatbot

EXISTING SYSTEM:

- FastAPI backend

- SQLModel ORM

- Neon Serverless PostgreSQL

- Better Auth authentication

- Fully working Task CRUD

- Production service-layer architecture

OBJECTIVE:

Implement AI chatbot interface using:

- OpenAI Agents SDK

- Official MCP SDK

- OpenAI ChatKit frontend

- Stateless backend architecture

- Database-persisted conversations

NON-NEGOTIABLE ARCHITECTURAL RULES:

1. Server must be fully stateless.
2. No in-memory conversation storage.
3. Every request must reload conversation history from database.
4. Agent must NEVER access database directly.
5. MCP tools must NEVER access database directly.
6. MCP tools must call existing Task service layer only.
7. No duplication of task business logic.
8. Existing Task CRUD endpoints must not be modified.
9. Single AI endpoint only:
      POST /api/{user_id}/chat
10. Multi-user isolation must be strictly enforced.
11. Conversation state must persist in:
      - conversations table
      - messages table
12. Frontend must ONLY call chat endpoint.
13. MCP tools must be stateless.
14. Tool responses must return structured JSON.
15. All components must be independently testable.
16. Code must be production-grade, typed, and clean.
17. Error handling must be explicit and consistent.
18. Violations require refactor before proceeding.

ARCHITECTURE FLOW:

ChatKit UI
    ↓
POST /api/{user_id}/chat
    ↓
Chat Endpoint
    ↓
OpenAI Agent (Agents SDK)
    ↓
MCP Server (Official MCP SDK Tools)
    ↓
Task Service Layer
    ↓
Neon PostgreSQL

Server holds NO runtime memory between requests.

## Response snapshot

Updated the project constitution to version 2.0.0 to reflect the new AI-Powered Todo Chatbot architecture. The constitution now includes specific principles for:

- Statelessness requirements
- MCP SDK integration rules
- Database persistence requirements
- AI interface architecture
- Service layer integration patterns

The new constitution enforces the architectural rules specified, including no direct database access from agents/MCP tools, single endpoint requirement, and multi-user isolation.

## Outcome

- ✅ Impact: Major constitution update from v1.0.0 to v2.0.0 with AI-specific architecture rules
- 🧪 Tests: none
- 📁 Files: .specify/memory/constitution.md updated
- 🔁 Next prompts: Implementation of AI chatbot according to new constitution
- 🧠 Reflection: Constitution now properly guides AI chatbot development with MCP SDK and stateless architecture requirements

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin implementing AI chatbot according to new constitution