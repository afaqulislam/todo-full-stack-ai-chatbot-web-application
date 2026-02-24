# Tasks: AI Chatbot for Todo Management

## Feature Overview

This document contains the implementation tasks for the AI Chatbot for Todo Management feature. The implementation follows a stateless architecture with MCP tools that integrate with the existing task service layer, while maintaining persistent conversation history in the database.

## Dependencies

- User Story 1 (Basic Todo Chat Interface) must be completed before User Story 2 (Conversation Persistence)
- User Story 1 must be completed before User Story 3 (Multi-user Isolation)
- User Story 1 must be completed before User Story 4 (Advanced Task Operations)
- Foundational phase must be completed before any user story phases

## Parallel Execution Examples

- Tasks T011 [P], T012 [P], T013 [P] can run in parallel (MCP tools implementation)
- Tasks T025 [P], T026 [P], T027 [P] can run in parallel (Frontend components)

## Implementation Strategy

- MVP scope: User Story 1 (Basic Todo Chat Interface) with minimal viable functionality
- Incremental delivery: Each user story builds upon the previous to deliver continuous value
- Test-driven approach: Tests are included for critical functionality

---

## Phase 1: Setup

- [X] T001 Create project structure in backend/src/{models,services,api,mcp,agents}
- [X] T002 Create frontend/src/{components,services,pages,chat} directory structure
- [X] T003 Install required dependencies in backend (fastapi, sqlmodel, openai, mcp-sdk)
- [X] T004 Install required dependencies in frontend (openai-chatkit, next.js)
- [X] T005 Set up environment variables for OpenAI and database configuration

## Phase 2: Foundational Components

- [X] T006 Create Conversation data model in backend/src/models/conversation.py
- [X] T007 Create Message data model in backend/src/models/message.py
- [X] T008 Implement Conversation service in backend/src/services/conversation_service.py
- [X] T009 Implement Message service in backend/src/services/message_service.py
- [X] T010 Implement authentication middleware using Better Auth in backend/src/middleware/auth.py

## Phase 3: [US1] Basic Todo Chat Interface (Priority: P1)

Goal: Enable users to interact with an AI chatbot to manage todos using natural language.

Independent Test Criteria: Can be fully tested by sending natural language messages to the chat endpoint and verifying correct todo operations are performed, delivering immediate value for users who prefer conversation-based task management.

- [X] T011 [P] Implement add_task MCP tool in backend/src/mcp/tools/add_task.py
- [X] T012 [P] Implement list_tasks MCP tool in backend/src/mcp/tools/list_tasks.py
- [X] T013 [P] Implement complete_task MCP tool in backend/src/mcp/tools/complete_task.py
- [X] T014 [P] Implement delete_task MCP tool in backend/src/mcp/tools/delete_task.py
- [X] T015 [P] Implement update_task MCP tool in backend/src/mcp/tools/update_task.py
- [X] T016 Create MCP server implementation in backend/src/mcp/server.py
- [X] T017 Create OpenAI agent implementation in backend/src/agents/chat_agent.py
- [X] T018 Implement chat endpoint POST /api/{user_id}/chat in backend/src/api/chat_endpoints.py
- [X] T019 Create unit tests for MCP tools in backend/tests/unit/test_mcp_tools.py
- [X] T020 Create integration test for chat endpoint in backend/tests/integration/test_chat_endpoint.py

## Phase 4: [US2] Conversation Persistence (Priority: P2)

Goal: Ensure chat conversation history persists between interactions so the AI can maintain context.

Independent Test Criteria: Can be tested by sending multiple messages in sequence and verifying the AI remembers previous exchanges and maintains conversation context.

- [X] T021 Enhance Conversation service with history loading in backend/src/services/conversation_service.py
- [X] T022 Implement conversation creation/loading logic in backend/src/services/conversation_service.py
- [X] T023 Update chat endpoint to load conversation history from DB in backend/src/api/chat_endpoints.py
- [X] T024 Store user and assistant messages in database after each interaction
- [X] T025 [P] [US2] Create ChatInterface component in frontend/src/components/ChatInterface.tsx
- [X] T026 [P] [US2] Implement chat service in frontend/src/services/chatService.ts
- [X] T027 [P] [US2] Create ChatPage in frontend/src/pages/chat/ChatPage.tsx

## Phase 5: [US3] Multi-user Isolation (Priority: P3)

Goal: Ensure conversations and tasks are completely isolated from other users.

Independent Test Criteria: Can be tested by simulating multiple users simultaneously and verifying no cross-contamination of data or conversations occurs.

- [X] T028 Add user_id validation to all MCP tools to ensure data isolation
- [X] T029 Enhance authentication checks in chat endpoint for user session validation
- [X] T030 Add user_id validation in Conversation and Message services
- [X] T031 Create integration test for multi-user isolation in backend/tests/integration/test_multi_user_isolation.py

## Phase 6: [US4] Advanced Task Operations (Priority: P4)

Goal: Enable advanced todo operations like filtering by status, marking as complete, and updating tasks via natural language.

Independent Test Criteria: Can be tested by sending specific commands like "mark task 1 as complete" or "show completed tasks" and verifying correct operations.

- [X] T032 Enhance agent behavior with advanced intent mapping for complex operations
- [X] T033 Implement tool chaining capability in the agent for complex operations
- [X] T034 Create contract tests for MCP tools in backend/tests/contract/mcp_tool_contracts.py

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T035 Implement error handling and response formatting throughout the system
- [X] T036 Add logging and monitoring to chat endpoint for debugging
- [X] T037 Implement proper input validation and sanitization
- [X] T038 Document API endpoints with examples
- [X] T039 Add comprehensive test coverage for edge cases
- [X] T040 Set up environment configuration for domain allowlist as per requirements