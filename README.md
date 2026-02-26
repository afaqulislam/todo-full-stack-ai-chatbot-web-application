# Taskory - AI-Powered Task Management Platform

<div align="center">

[![Next.js](https://img.shields.io/badge/next%20js-20232A?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/typescript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)](https://www.python.org/) [![FastAPI](https://img.shields.io/badge/fastapi-109989?style=for-the-badge&logo=FASTAPI&logoColor=white)](https://fastapi.tiangolo.com/) [![Tailwind CSS](https://img.shields.io/badge/tailwind%20css-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![PostgreSQL](https://img.shields.io/badge/postgresql-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![OpenAI](https://img.shields.io/badge/openai-74aa9c?style=for-the-badge&logo=openai&logoColor=white)](https://openai.com/)

</div>

## Project Overview

Taskory is a full-stack, AI-powered task management web application that combines natural language processing with intelligent task management capabilities. The platform enables users to manage their tasks using conversational AI, providing an intuitive and efficient workflow for productivity. The application features user authentication, real-time task management, and an AI chatbot assistant that understands natural language commands for task manipulation.

This is a full-stack, multi-user web application with persistent storage that implements a modern architecture with separate frontend and backend services. The system provides enterprise-grade security with JWT-based authentication and supports multiple AI model providers for intelligent task management.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL with SQLAlchemy/SQLModel ORM
- **Authentication**: JWT-based with HTTP-only cookies
- **AI Integration**: OpenRouter API, OpenAI, Google Generative AI
- **Database Migration**: Alembic
- **Security**: Python-Jose, Passlib
- **Async Support**: AsyncIO with asyncpg for PostgreSQL

### Frontend
- **Framework**: Next.js 16.1.3 (React 19.2.3)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Routing**: Next.js App Router
- **State Management**: React Context API

### Infrastructure & Tools
- **API Gateway**: Built-in Next.js proxy rewrites
- **Environment Management**: Dotenv for both frontend and backend
- **Package Management**: Poetry (backend), npm (frontend)
- **Deployment Ready**: Production-optimized build configuration

## Architecture Overview

### System Design
Taskory follows a three-tier architecture consisting of:
- **Presentation Layer**: React-based Next.js frontend application
- **API Layer**: FastAPI backend providing RESTful services
- **Data Layer**: PostgreSQL database with SQLAlchemy ORM

### Component Interaction
1. **Frontend-Backend Communication**: Next.js rewrites proxy API calls to the backend service
2. **Authentication Flow**: JWT tokens stored in HTTP-only cookies for security
3. **AI Integration**: Backend AI agents process natural language queries through OpenRouter
4. **Data Isolation**: Multi-user data isolation through user ID verification in all API routes

### Responsibility Boundaries
- **Frontend**: UI rendering, user interaction, state management, API request handling
- **Backend**: Business logic, data validation, authentication, database operations, AI processing
- **Database**: Persistent data storage with user isolation
- **AI Services**: Natural language processing and task management intelligence

## Project Structure

```
todo-full-stack-ai-chatbot-web-application/
├── backend/                    # Python FastAPI backend
│   ├── .env                    # Backend environment variables
│   ├── pyproject.toml          # Poetry project configuration
│   ├── requirements.txt        # Python dependencies
│   └── src/
│       ├── agents/             # AI agent implementations
│       ├── api/                # API route definitions
│       │   ├── auth.py         # Authentication endpoints
│       │   ├── todos.py        # Todo management endpoints
│       │   └── chat_endpoints.py # AI chat endpoints
│       ├── core/               # Core application logic
│       ├── middleware/         # Request middleware
│       ├── models/             # Database models
│       ├── services/           # Business logic services
│       └── main.py             # Application entry point
├── frontend/                   # Next.js frontend application
│   ├── .env                    # Frontend environment variables
│   ├── package.json            # Node.js dependencies
│   ├── next.config.ts          # Next.js configuration
│   └── src/
│       ├── app/                # Next.js App Router pages
│       │   ├── auth/           # Authentication pages
│       │   ├── chat/           # AI chat interface
│       │   ├── dashboard/      # Task management dashboard
│       │   └── contexts/       # React context providers
│       ├── components/         # Reusable UI components
│       ├── config/             # Configuration files
│       ├── services/           # API service calls
│       └── utils/              # Utility functions
├── specs/                      # Project specifications
├── history/                    # Development history and documentation
├── .specify/                   # SDD framework configuration
├── .git/                       # Git repository configuration
└── CLAUDE.md                   # Claude Code project instructions
```

## Environment Configuration

### Backend Environment Variables
```bash
# Database Configuration
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/taskory

# Authentication
BETTER_AUTH_SECRET=your_secure_jwt_secret_key
JWT_ALGORITHM=HS256
JWT_EXPIRY_DAYS=7

# API Configuration
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://localhost:8000"]

# AI Model Provider (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL_NAME=your_preferred_model
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### Frontend Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Mandatory Variables
- **DATABASE_URL**: Required PostgreSQL connection string
- **BETTER_AUTH_SECRET**: Required for JWT token generation
- **OPENROUTER_API_KEY**: Required for AI functionality

### Optional Variables
- **JWT_EXPIRY_DAYS**: Token expiration in days (default: 7)
- **NEXT_PUBLIC_API_BASE_URL**: Backend API base URL (default: http://localhost:8000)

## Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ (or Bun/other JavaScript runtimes)
- PostgreSQL database
- OpenRouter API key for AI functionality

### Backend Setup
```bash
# Navigate to backend directory
cd backend/

# Install Python dependencies (using Poetry or pip)
poetry install
# OR
pip install -r requirements.txt

# Create .env file with required environment variables
cp .env.example .env  # if available

# Start the backend server
uvicorn src.main:app --reload --port 8000
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend/

# Install Node.js dependencies
npm install
# OR
bun install

# Create .env file with required environment variables
cp .env.example .env  # if available

# Start the frontend development server
npm run dev
# OR
bun run dev

# Build for production
npm run build
```

### Database Initialization
The application automatically initializes the database on startup, ensuring all required tables and schema are created. The backend will create necessary tables when the application starts for the first time.

## Runtime Behavior

### Application Startup
1. **Database Initialization**: The application connects to PostgreSQL and creates required tables
2. **Service Registration**: API routes for authentication, todos, and chat are registered
3. **CORS Configuration**: Cross-origin resource sharing is configured based on environment variables
4. **Health Check**: The API root endpoint reports system health status

### Data Flow
1. **User Authentication**: JWT tokens are stored in HTTP-only cookies for security
2. **API Requests**: All authenticated requests include user context from cookies
3. **AI Processing**: Chat requests are processed by AI agents with conversation context
4. **Database Operations**: All operations include user ID filtering for data isolation

### Authentication Flow
- User registers/login via `/api/v1/auth/register` and `/api/v1/auth/login`
- JWT token is stored in HTTP-only cookie with secure flags
- All protected routes verify user identity through cookie
- User ID is extracted from token for database operations
- Session management through cookie lifecycle

### State Management
- Frontend: React Context API manages authentication state
- Backend: User sessions through JWT cookies
- Database: Transactional operations with proper error handling
- AI Conversations: Persistent session storage with context awareness

## Error Handling & Common Failures

### Authentication Errors
- **401 Unauthorized**: Invalid credentials or expired tokens
- **403 Forbidden**: Insufficient permissions for requested resource
- **500 Internal Server Error**: Authentication service failures

### Database Errors
- **Connection Failures**: Check DATABASE_URL configuration
- **Constraint Violations**: Handle unique constraint errors appropriately
- **Transaction Rollbacks**: Database operations use proper transaction management

### AI Service Errors
- **API Key Issues**: Verify OpenRouter API key and quota
- **Model Availability**: Check model availability and rate limits
- **Network Issues**: API gateway timeout handling

### Recovery Procedures
1. **Restart Services**: Restart backend services to reload configuration
2. **Database Connection**: Verify PostgreSQL connectivity and credentials
3. **API Keys**: Refresh API keys and validate permissions
4. **Environment**: Ensure all required environment variables are set

## Build & Deployment Notes

### Backend Production Build
```bash
# Using uvicorn for production
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

### Frontend Production Build
```bash
# Build static assets
npm run build

# Serve production build
npm start
```

### Containerization
The application can be containerized with separate services for frontend and backend, with PostgreSQL as a dependency.

### Environment Considerations
- **Production**: Secure cookie flags, HTTPS enforcement, production database
- **Staging**: Isolated test environment with realistic data
- **Development**: Local database, relaxed security settings for development

## Security & Constraints

### Authentication Security
- **JWT Tokens**: Secure token generation with configurable expiration
- **HTTP-Only Cookies**: Protection against XSS attacks
- **CSRF Protection**: Cookie same-site settings
- **Password Hashing**: bcrypt-based password security

### Data Protection
- **User Isolation**: Multi-user data separation through user ID verification
- **Database Encryption**: Connection encryption with PostgreSQL
- **API Security**: Input validation and sanitization on all endpoints
- **Rate Limiting**: Built-in protection against API abuse

### Explicit Limitations
- **Single AI Provider**: Currently configured for OpenRouter with fallback options
- **Database Dependency**: Requires PostgreSQL (no SQLite/other DB support)
- **Session Management**: Cookie-based sessions (no persistent session storage)
- **AI Model Constraints**: Dependent on external AI service availability

## API Endpoints

### Authentication API (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Create new user account
- `POST /api/v1/auth/login` - User login with credentials
- `POST /api/v1/auth/logout` - Clear user session
- `GET /api/v1/auth/me` - Get current user profile

### Todo Management API (`/api/v1/todos`)
- `POST /api/v1/todos` - Create new todo item
- `GET /api/v1/todos` - Get user's todo list
- `GET /api/v1/todos/{todo_id}` - Get specific todo item
- `PUT /api/v1/todos/{todo_id}` - Update todo item completely
- `PATCH /api/v1/todos/{todo_id}` - Partially update todo item
- `DELETE /api/v1/todos/{todo_id}` - Delete todo item
- `POST /api/v1/todos/{todo_id}/toggle` - Toggle completion status

### AI Chat API (`/api/v1/chat`)
- `POST /api/v1/chat` - Process natural language commands for task management

## Health Check

### Health Endpoint
```
GET /
Response: {"message": "Todo API is running!"}

GET /health
Response: {"status": "healthy", "version": "1.0.0"}
```

The health check endpoint provides basic service availability information and version details.

## API Documentation

### Built-in Documentation
The backend provides interactive API documentation through:
- **Swagger UI**: Available at `/api/v1/docs` when `api_docs_enabled` is true
- **ReDoc**: Available at `/api/v1/redoc` when `api_docs_enabled` is true

### Authentication Required
All endpoints (except health check) require valid authentication through JWT cookies.

## Testing

### Backend Testing
```bash
# Run backend tests
pytest
# OR
poetry run pytest
```

Backend tests use pytest with asyncio support for testing asynchronous operations.

### Frontend Testing
```bash
# Run frontend tests
npm test
```

### Example Test Commands
```bash
# Run all tests with coverage
pytest --cov=src

# Run specific test file
pytest tests/test_todos.py

# Run tests in verbose mode
pytest -v
```

## Contributing Guidelines

### Development Workflow
We welcome contributions to Taskory. Please follow these guidelines:

1. **Fork the Repository**: Create your own fork for development
2. **Create Feature Branch**: Use descriptive branch names
3. **Write Tests**: Include tests for all new functionality
4. **Follow Code Style**: Maintain existing code formatting and conventions
5. **Document Changes**: Update documentation for new features
6. **Submit Pull Request**: Include clear description of changes

### Code Standards
- Maintain type safety with TypeScript and Python type hints
- Write comprehensive unit and integration tests
- Follow existing architectural patterns and conventions
- Include proper error handling and validation
- Document new API endpoints and functionality

### Technical Requirements
- Follow security best practices
- Maintain multi-user data isolation
- Preserve existing authentication patterns
- Ensure proper error propagation and handling

## Maintainer / Author Information

**Afaq Ul Islam**  
COO at Neofyx | Full-Stack & AI Engineer | Architecting AI-Driven SaaS with Next.js, React, TypeScript & FastAPI  (GIAIC)

This project is designed, developed, and maintained by **Afaq Ul Islam**.  
All architectural decisions, implementation details, and maintenance responsibilities belong to the author unless explicitly stated otherwise.

### Project Governance
- **Development**: Open source with active community maintenance
- **Issue Management**: GitHub issue tracker with prioritized roadmap
- **Feature Requests**: Community-driven through GitHub issues and discussions

## Support & Maintenance

### Getting Help
- **Documentation**: Check the documentation in the `/docs` directory
- **Issues**: File GitHub issues for bugs and feature requests
- **Community**: Engage with the community through GitHub discussions
- **Support**: Contact maintainers through GitHub or provided social links

### Maintenance Status
- **Active Development**: Regular updates and improvements
- **Security Updates**: Prompt patching of security vulnerabilities
- **Bug Fixes**: Regular maintenance releases
- **Feature Development**: Ongoing enhancement of AI capabilities

### Version Support
- **Current**: Latest version receives full support
- **Previous**: Previous versions receive security patches
- **Legacy**: Older versions may require upgrade for support

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License provides broad permissions for usage, modification, distribution, and commercial use while maintaining a liability disclaimer.

## Social / Contact

Connect with the project maintainers and community:

- **GitHub**: [Afaq Ul Islam](https://github.com/afaqulislam)
- **LinkedIn**: [Afaq Ul Islam](https://linkedin.com/in/afaqulislam)
- **Twitter(X)**: [Afaq Ul Islam](https://twitter.com/afaqulislam708)
  

---

<div align="center">

**Taskory** - Transform Your Productivity with AI
*Built with Next.js, FastAPI, PostgreSQL, and AI*

</div>
