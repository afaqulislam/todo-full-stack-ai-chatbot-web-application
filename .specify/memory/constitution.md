<!--
  Sync Impact Report:
  - Version change: 1.0.0 → 2.0.0 (Major - Complete rewrite for AI Chatbot Architecture)
  - List of modified principles:
      - Phase II Principles → Phase III AI-Powered Todo Chatbot Principles
      - I. Spec-Driven Development (SDD) Rule → I. Spec-Driven Development (SDD) Rule
      - II. Modern Tech Stack (FastAPI/Next.js) → II. FastAPI Backend with SQLModel ORM
      - III. JWT-Based Authentication & Security → III. Better Auth Authentication with Multi-User Isolation
      - IV. User-Scoped Data Isolation → IV. Stateless Architecture with Database Persistence
      - V. Production-Ready Modular Code → V. MCP SDK with Service Layer Integration
      - VI. Backend Test Commitment → VI. AI Chat Interface with OpenAI Agents SDK
  - Added sections:
      - AI Architecture Requirements
      - MCP Tool Design Rules
      - Database Schema Requirements
  - Templates requiring updates:
      - .specify/templates/plan-template.md (✅ updated)
      - .specify/templates/spec-template.md (✅ updated)
      - .specify/templates/tasks-template.md (✅ updated)
  - Follow-up TODOs:
      - TODO(RATIFICATION_DATE): Finalize launch date.
-->

# Phase III – AI-Powered Todo Chatbot Constitution

## Core Principles

### I. Spec-Driven Development (SDD) Rule
NO manual coding assumptions are permitted. Every implementation detail, API contract, and business rule MUST be derived from finalized specifications. If an requirement is missing, it must be clarified in the spec before code is written.

### II. FastAPI Backend with SQLModel ORM
The backend architecture is strictly bounded by:
- **Framework**: FastAPI with production-ready service layer patterns.
- **Database**: SQLModel ORM with Neon Serverless PostgreSQL.
- **Architecture**: Stateless server design with no in-memory persistence between requests.

### III. Better Auth Authentication with Multi-User Isolation
Authentication MUST use Better Auth on the frontend with JWT verification on the backend. Security is non-negotiable; all API routes (except public auth entries) MUST be protected via JWT validation. Multi-user isolation must be strictly enforced at all layers.

### IV. Stateless Architecture with Database Persistence
The server must be fully stateless with these requirements:
- Server MUST be fully stateless.
- No in-memory conversation storage is allowed.
- Every request must reload conversation history from database.
- Conversation state must persist in conversations and messages tables.
- Violations require refactor before proceeding.

### V. MCP SDK with Service Layer Integration
MCP tools and AI agents must follow these integration rules:
- Agent must NEVER access database directly.
- MCP tools must NEVER access database directly.
- MCP tools must call existing Task service layer only.
- No duplication of task business logic is permitted.
- MCP tools must be stateless with structured JSON responses.
- Existing Task CRUD endpoints must not be modified.

### VI. AI Chat Interface with OpenAI Agents SDK
The AI interface architecture must follow these patterns:
- Single AI endpoint only: POST /api/{user_id}/chat
- Frontend must ONLY call chat endpoint.
- OpenAI Agents SDK for conversation management.
- OpenAI ChatKit frontend for UI.
- All components must be independently testable.

## AI Architecture Requirements

- **Server State**: Server holds NO runtime memory between requests.
- **Data Flow**: ChatKit UI → POST /api/{user_id}/chat → Chat Endpoint → OpenAI Agent → MCP Server → Task Service Layer → Neon PostgreSQL
- **Error Handling**: Error handling must be explicit and consistent.
- **Production Code**: Code must be production-grade, typed, and clean.

## MCP Tool Design Rules

- MCP tools must be stateless.
- Tool responses must return structured JSON.
- MCP tools must call existing Task service layer only.
- No database access from MCP tools.
- Follow official MCP SDK patterns.

## Database Schema Requirements

- Conversation state must persist in conversations table.
- Message history must persist in messages table.
- Existing Task CRUD tables must remain unchanged.
- Multi-user isolation at database level required.

## Development Workflow

1. **Spec**: Define AI chatbot features and acceptance criteria.
2. **Plan**: Design MCP tools and agent architecture.
3. **Tasks**: Break into testable, prioritized increments.
4. **Implement**: Write code and mandatory backend tests.
5. **Review**: Ensure compliance with this constitution.

## Governance

This constitution supersedes all other informal practices. Amendments require a version bump and updates to all dependent templates. Compliance is checked during the planning phase of every feature.

**Version**: 2.0.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2026-02-17
