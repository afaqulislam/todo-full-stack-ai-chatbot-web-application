# Implementation Plan: AI Chatbot for Todo Management

**Branch**: `1-ai-chatbot` | **Date**: 2026-02-17 | **Spec**: [link](./spec.md)
**Input**: Feature specification from `/specs/[1-ai-chatbot]/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement an AI-powered chatbot interface that allows users to manage their todo tasks using natural language commands. The system uses OpenAI Agents SDK with MCP tools to interface with the existing task service layer, while maintaining a stateless server architecture with persistent conversation history in the database.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: Python 3.11, TypeScript 5.0
**Primary Dependencies**: FastAPI, SQLModel, OpenAI Agents SDK, MCP SDK, Better Auth, Neon PostgreSQL
**Storage**: Neon Serverless PostgreSQL with SQLModel ORM
**Testing**: pytest for backend, Jest for frontend
**Target Platform**: Linux server (backend), Web browser (frontend)
**Project Type**: web
**Performance Goals**: 95% of chat responses delivered within 5 seconds
**Constraints**: Server must remain stateless with no in-memory conversation storage, MCP tools must not access DB directly
**Scale/Scope**: Multi-user support with complete data isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] SDD Rule: Derived from spec?
- [x] Tech Stack: FastAPI/Next.js/Neon?
- [x] Security: JWT Auth/Better Auth/No secrets?
- [x] Data Isolation: All operations user-scoped?
- [x] Code Quality: Modular/Production-ready?
- [x] Testing: Backend test plan included?

## Project Structure

### Documentation (this feature)

```text
specs/1-ai-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── conversation.py      # Conversation data model
│   │   ├── message.py           # Message data model
│   │   └── __init__.py
│   ├── services/
│   │   ├── conversation_service.py    # Conversation management
│   │   ├── message_service.py         # Message management
│   │   └── __init__.py
│   ├── api/
│   │   ├── chat_endpoints.py          # Main chat endpoint
│   │   └── __init__.py
│   ├── mcp/
│   │   ├── server.py                  # MCP server implementation
│   │   ├── tools/
│   │   │   ├── add_task.py
│   │   │   ├── list_tasks.py
│   │   │   ├── complete_task.py
│   │   │   ├── delete_task.py
│   │   │   ├── update_task.py
│   │   │   └── __init__.py
│   │   └── __init__.py
│   ├── agents/
│   │   ├── chat_agent.py              # OpenAI Agent implementation
│   │   └── __init__.py
│   └── main.py
└── tests/
    ├── unit/
    │   ├── test_conversation_service.py
    │   ├── test_message_service.py
    │   └── test_mcp_tools.py
    ├── integration/
    │   └── test_chat_endpoint.py
    └── contract/
        └── mcp_tool_contracts.py

frontend/
├── src/
│   ├── components/
│   │   └── ChatInterface.tsx          # OpenAI ChatKit integration
│   ├── services/
│   │   └── chatService.ts
│   └── pages/
│       └── chat/
│           └── ChatPage.tsx
└── tests/
    ├── unit/
    └── integration/
```

**Structure Decision**: Web application structure chosen with separate backend and frontend. Backend contains models, services, API endpoints, MCP tools, and agents. Frontend contains chat interface components and services.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| MCP Tools Complexity | Required for OpenAI Agent integration with existing service layer | Direct API calls would require duplicating business logic |