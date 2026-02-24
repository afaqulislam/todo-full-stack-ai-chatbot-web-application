# Quickstart Guide: AI Chatbot for Todo Management

## Prerequisites

- Python 3.11+
- Node.js 18+
- Poetry (for Python dependency management)
- pnpm (for Node.js dependency management)
- PostgreSQL database (Neon Serverless recommended)
- OpenAI API key
- Better Auth configured

## Setup

### 1. Environment Variables

Create a `.env` file in the backend directory:

```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration
DATABASE_URL=postgresql://username:password@host:port/database_name
NEON_DATABASE_URL=your_neon_serverless_connection_string

# Better Auth Configuration
BETTER_AUTH_SECRET=your_auth_secret
BETTER_AUTH_URL=http://localhost:3000
```

Create a `.env.local` file in the frontend directory:

```bash
# Frontend Configuration
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your_openai_domain_key
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install Python dependencies
poetry install

# Activate virtual environment
poetry shell

# Run database migrations
python -m src.main migrate

# Start the backend server
python -m src.main serve
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
pnpm install

# Start the development server
pnpm dev
```

### 4. MCP Server Setup

The MCP server will be automatically started when the main backend server starts. It will be available at `/mcp` endpoint.

## API Usage

### Chat Endpoint

```bash
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a task to buy groceries"
  }'
```

### Example Response

```json
{
  "conversation_id": "123e4567-e89b-12d3-a456-426614174000",
  "response": "I've added the task 'buy groceries' to your list.",
  "tool_calls": [
    {
      "name": "add_task",
      "arguments": {
        "user_id": "user123",
        "title": "buy groceries"
      },
      "result": {
        "task_id": 1,
        "status": "pending",
        "title": "buy groceries"
      }
    }
  ]
}
```

## Development

### Running Tests

```bash
# Backend tests
cd backend
poetry run pytest

# Frontend tests
cd frontend
pnpm test
```

### Database Migrations

```bash
# Create a new migration
python -m src.main create-migration "add conversation table"

# Apply migrations
python -m src.main migrate
```

## Architecture Flow

1. User sends message to `POST /api/{user_id}/chat`
2. Request is authenticated via Better Auth
3. Conversation history is loaded from database
4. OpenAI Agent is created with MCP tools
5. Agent processes the request using appropriate MCP tool
6. MCP tool calls existing Task service layer
7. Task operation is performed and result returned
8. Assistant response is generated and stored in database
9. Response is returned to the client