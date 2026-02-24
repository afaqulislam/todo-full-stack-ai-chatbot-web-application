# Data Model: AI Chatbot for Todo Management

## Entity: Conversation

**Description**: Represents a persistent conversation thread between user and AI, containing metadata needed to maintain context across sessions.

**Fields**:
- `id`: UUID, primary key (auto-generated)
- `user_id`: string, required (foreign key to user, ensures multi-user isolation)
- `created_at`: datetime, required (timestamp when conversation started)
- `updated_at`: datetime, required (timestamp of last activity)

**Validation Rules**:
- `user_id` must exist in the users table
- `created_at` must be less than or equal to `updated_at`
- Both timestamps must be in UTC

**Relationships**:
- One-to-many with Message entity (one conversation to many messages)

## Entity: Message

**Description**: Represents an individual message within a conversation, capturing the interaction history with role (user or assistant) and content.

**Fields**:
- `id`: UUID, primary key (auto-generated)
- `user_id`: string, required (foreign key to user, ensures multi-user isolation)
- `conversation_id`: UUID, required (foreign key to Conversation)
- `role`: string, required (enum: "user" or "assistant")
- `content`: text, required (message content)
- `created_at`: datetime, required (timestamp when message was created)

**Validation Rules**:
- `user_id` must match the conversation's user_id (multi-user isolation)
- `conversation_id` must exist in the conversations table
- `role` must be either "user" or "assistant"
- `content` must not be empty
- `created_at` must be in UTC

**Relationships**:
- Many-to-one with Conversation entity (many messages to one conversation)

## Entity: Task (Existing)

**Description**: Represents user's todo items managed through natural language commands, linked to existing task management system.

**Note**: This entity already exists in the system and will not be modified. The MCP tools will interface with the existing Task service layer without duplicating the data model.

**Fields** (from existing model):
- `id`: integer, primary key
- `user_id`: string, required (foreign key to user)
- `title`: string, required
- `description`: text, optional
- `status`: string, required (enum: "pending", "completed")
- `created_at`: datetime, required
- `updated_at`: datetime, required

**State Transitions**:
- `pending` → `completed` (when task is completed)
- `completed` → `pending` (when task is uncompleted)

**Relationships**:
- One-to-one with User entity via user_id

## Database Constraints

1. **Multi-user Isolation**: All tables must include user_id to ensure data separation
2. **Foreign Key Integrity**: All foreign keys must reference existing records
3. **UUID Format**: Conversation and Message IDs must follow standard UUID format
4. **Timestamp Consistency**: All timestamps stored in UTC timezone