# Taskory - AI-Powered Todo Management System

[![Python](https://img.shields.io/badge/Python-3.12+-blue?logo=python&logoColor=white)](https://python.org) [![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-005571?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/) [![React](https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white)](https://reactjs.org/) [![Next.js](https://img.shields.io/badge/Next.js-14+-000000?logo=next.js&logoColor=white)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org/) [![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0+-F24E4E?logoColor=white)](https://www.sqlalchemy.org/) [![JWT](https://img.shields.io/badge/JWT-Auth-000000?logo=json-web-tokens&logoColor=white)](https://jwt.io/)

---

## Project Overview

Taskory is a full-stack, multi-user web application that combines traditional todo management with an AI-powered chatbot interface. The system provides users with both a structured task management interface and an intelligent conversational agent that can assist with task creation, management, and organization through natural language processing.

This is a production-grade, authenticated application with persistent storage, designed as a complete solution for personal and team task management with AI assistance capabilities.

### System Type
Full-stack web application with AI integration, featuring:
- Backend REST API with authentication
- Frontend React/Next.js interface
- AI chatbot with conversational capabilities
- Database persistence layer
- User authentication and authorization

## Tech Stack

### Backend
- **Python 3.12+** - Core programming language
- **FastAPI** - Web framework for API endpoints
- **SQLAlchemy** - Database ORM for data persistence
- **Passlib** - Password hashing and security
- **PyJWT** - JSON Web Token authentication
- **Python-Multipart** - Form data handling
- **Uvicorn** - ASGI server for deployment

### Frontend
- **React 18+** - Component-based UI library
- **Next.js 14+** - React framework with SSR/SSG capabilities
- **TypeScript 5+** - Type-safe JavaScript superset
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management and validation

### Infrastructure & Tooling
- **SQLite** - Default database for development
- **Poetry** - Python dependency management
- **Git** - Version control system
- **Docker** (implied) - Containerization support

## Architecture Overview

Taskory follows a traditional three-tier architecture pattern:

### Frontend Layer (Next.js/React)
- **Presentation Logic**: Handles UI rendering, user interactions, and state management
- **API Communication**: Manages HTTP requests to backend services
- **User Experience**: Provides responsive, accessible interface across devices
- **Authentication Context**: Manages user session state and protected routes

### Backend Layer (FastAPI)
- **API Gateway**: Exposes REST endpoints for frontend communication
- **Business Logic**: Implements todo operations, user management, and chat processing
- **Authentication Layer**: Secure token-based user authentication
- **Service Layer**: Encapsulates business operations and data validation
- **Model Layer**: Defines database schema and entity relationships

### Data Layer (SQLAlchemy/SQLite)
- **Persistence**: Reliable data storage with ACID compliance
- **Schema Management**: Defined entity relationships and data integrity
- **Connection Pooling**: Efficient database connection management
- **Transaction Handling**: Consistent data operations

### AI Integration Layer
- **Chat Processing**: Natural language processing for todo management
- **Task Matching**: Intelligent routing of user requests to appropriate operations
- **Response Generation**: Context-aware AI responses for task management

## Project Structure

```
todo-full-stack-ai-chatbot-web-application/
├── backend/                    # Backend API server
│   ├── src/                   # Source code
│   │   ├── main.py           # FastAPI application entry point
│   │   ├── api/              # API route definitions
│   │   │   ├── auth.py       # Authentication endpoints
│   │   │   ├── todos.py      # Todo management endpoints
│   │   │   └── chat_endpoints.py # AI chat endpoints
│   │   ├── models/           # Database models
│   │   │   ├── user.py       # User entity definition
│   │   │   ├── todo.py       # Todo entity definition
│   │   │   ├── conversation.py # AI conversation model
│   │   │   └── message.py    # Message entity definition
│   │   ├── services/         # Business logic layer
│   │   │   ├── user_service.py # User operations
│   │   │   ├── todo_service.py # Todo operations
│   │   │   ├── conversation_service.py # Conversation handling
│   │   │   ├── message_service.py # Message operations
│   │   │   └── task_adapter_service.py # AI task matching
│   │   ├── core/             # Core application configuration
│   │   │   ├── config.py     # Configuration settings
│   │   │   ├── database.py   # Database connection and session management
│   │   │   └── security.py   # Security utilities and authentication
│   │   └── agents/           # AI agent implementations
│   ├── requirements.txt      # Python dependencies
│   ├── pyproject.toml       # Poetry configuration
│   └── .gitignore           # Git ignore rules
├── frontend/                 # Frontend React application
│   ├── src/                 # Source code
│   │   ├── app/            # Next.js app directory structure
│   │   ├── components/     # Reusable React components
│   │   ├── services/       # API service utilities
│   │   └── config/         # Configuration files
│   │       └── apiConfig.ts # API endpoint configuration
│   └── public/             # Static assets and images
├── specs/                   # Project specifications
│   └── 1-ai-chatbot/       # AI chatbot feature specifications
├── history/                 # Development history and artifacts
│   ├── prompts/            # Prompt history records
│   └── adr/               # Architecture decision records
├── .specify/               # Specification kit configuration
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

### Key Files and Directories
- `backend/src/main.py` - Primary FastAPI application with CORS and route configuration
- `backend/src/models/todo.py` - Todo entity with priority, status, and user relationships
- `backend/src/api/auth.py` - JWT-based authentication endpoints (login, register, token refresh)
- `backend/src/api/todos.py` - Complete CRUD operations for todo items with filtering
- `backend/src/api/chat_endpoints.py` - AI-powered chat interface with task matching system
- `backend/src/services/task_adapter_service.py` - Intelligent task matching engine for AI requests
- `frontend/src/config/apiConfig.ts` - API endpoint configuration with base URL management
- `frontend/src/app/` - Next.js 14 app router with page-based routing and layout components

## Environment Configuration

### Backend Environment Variables
The application uses a configuration system defined in `backend/src/core/config.py`:

```env
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
REFRESH_TOKEN_EXPIRE_DAYS=7
DB_PATH=sqlite:///./todo_app.db
```

#### Detailed Description:
- `SECRET_KEY`: Cryptographic key for JWT token signing (must be 32+ characters)
- `ALGORITHM`: Hash algorithm used for token encryption (default: HS256)
- `REFRESH_TOKEN_EXPIRE_DAYS`: Expiration time for refresh tokens (default: 7 days)
- `DB_PATH`: Database connection string (default: SQLite local file)

### Frontend Environment Variables
The frontend uses API configuration from `frontend/src/config/apiConfig.ts`:

```ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
```

- `NEXT_PUBLIC_API_URL`: Base URL for backend API endpoints (default: http://localhost:8000/api)

## Installation & Setup

### Prerequisites
- Python 3.12+
- Node.js 18+ with npm/yarn/bun
- Git

### Backend Setup
1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
# Or if using Poetry: poetry install
```

3. Set up environment variables (copy from example if provided):
```bash
# Create .env file with required variables
echo "SECRET_KEY=your-very-secure-key-here" > .env
echo "ALGORITHM=HS256" >> .env
echo "REFRESH_TOKEN_EXPIRE_DAYS=7" >> .env
echo "DB_PATH=sqlite:///./todo_app.db" >> .env
```

4. Start the backend server:
```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
# Or if using yarn: yarn install
# Or if using bun: bun install
```

3. Configure API endpoint (if different from default):
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000/api" > .env.local
```

4. Start the development server:
```bash
npm run dev
# Or if using yarn: yarn dev
# Or if using bun: bun dev
```

### Complete Setup
1. Start backend first (port 8000)
2. Start frontend second (port 3000)
3. Access the application at `http://localhost:3000`

## Runtime Behavior

### Application Startup
1. **Backend Initialization**: FastAPI application starts with CORS middleware, dependency injection, and route registration
2. **Database Connection**: SQLAlchemy establishes connection pool and performs initial schema validation
3. **Service Registration**: All business logic services are initialized and registered
4. **API Endpoint Activation**: All REST endpoints become available with Swagger UI documentation

### Data Flow
1. **User Request**: Frontend sends HTTP requests to backend API endpoints
2. **Authentication**: JWT tokens are validated for protected endpoints
3. **Business Logic**: Services process requests and interact with database models
4. **Response Generation**: JSON responses are formatted and returned to frontend
5. **UI Update**: Frontend updates state and re-renders components based on responses

### Authentication Flow
1. **Registration**: User provides credentials, password is hashed using bcrypt
2. **Login**: Credentials validated against stored hash, JWT tokens issued
3. **Token Validation**: Protected endpoints verify access tokens, refresh tokens when needed
4. **Session Management**: Frontend stores tokens securely and includes them in requests

### AI Chat Processing
1. **Message Input**: User sends natural language request through chat interface
2. **Task Matching**: AI analyzes request and matches to appropriate todo operations
3. **Operation Execution**: Relevant backend service processes the matched operation
4. **Response Generation**: AI generates contextual response with operation results

### State Management
- **Client-Side**: React state management with local component state and context
- **Server-Side**: Database persistence with transactional integrity
- **Authentication**: JWT token-based session state with refresh mechanisms

## Error Handling & Common Failures

### Common Backend Failures
- **Database Connection Issues**: Verify SQLite file permissions and path validity
- **Authentication Failures**: Check JWT secret key and token expiration times
- **Dependency Injection Errors**: Ensure all service dependencies are properly registered
- **Validation Errors**: Verify request payloads match expected schema definitions

### Common Frontend Failures
- **API Connection Issues**: Confirm backend server is running and CORS is configured
- **Token Expiration**: Implement token refresh logic and proper error handling
- **Component State Issues**: Ensure proper state management and cleanup
- **Network Errors**: Implement retry mechanisms and offline handling

### Recovery Procedures
1. **Database Recovery**: Verify database file integrity and connection string format
2. **Authentication Recovery**: Clear tokens and restart authentication flow
3. **Service Recovery**: Restart FastAPI application and verify all dependencies
4. **Frontend Recovery**: Clear browser cache and restart development server

### Error Monitoring
- **Backend**: FastAPI automatic request logging and exception handling
- **Frontend**: Console logging and error boundaries for graceful degradation
- **API**: HTTP status code validation and error response handling

## Build & Deployment Notes

### Backend Deployment
- Use Uvicorn with production-ready settings (workers, logging, security)
- Implement proper secret management for production environments
- Configure database connection pooling and monitoring
- Set up health check endpoints and monitoring

### Frontend Deployment
- Build production bundle using `npm run build` or equivalent
- Configure static asset optimization and caching
- Implement environment-specific API endpoint configuration
- Set up CDN for static asset delivery

### Production Considerations
- **Database**: Use PostgreSQL or other production-grade database for scaling
- **Security**: Implement HTTPS, rate limiting, and advanced authentication
- **Monitoring**: Add application performance monitoring and logging
- **Scaling**: Configure load balancing and horizontal scaling capabilities

## Security & Constraints

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication with refresh mechanisms
- **Password Hashing**: bcrypt implementation for secure password storage
- **Session Management**: Time-limited access tokens with automatic refresh
- **Route Protection**: Middleware-enforced authentication for sensitive endpoints

### Security Measures
- **Input Validation**: FastAPI automatic request validation and sanitization
- **SQL Injection Prevention**: SQLAlchemy ORM prevents direct SQL injection
- **XSS Protection**: React automatic HTML escaping and sanitization
- **CSRF Protection**: JWT token validation prevents cross-site request forgery

### System Constraints
- **Single User Sessions**: JWT token-based session management
- **Database Isolation**: Individual user data separation through foreign key relationships
- **Rate Limiting**: No built-in rate limiting (requires additional implementation)
- **Data Retention**: No automatic data cleanup (requires manual management)

### Explicit Limitations
- **Concurrency**: No built-in distributed session management
- **Real-time Features**: No WebSocket or real-time synchronization
- **External Integrations**: No third-party service connections implemented
- **Advanced Analytics**: No reporting or analytics features included

## API Endpoints

### Authentication Endpoints
```
POST /api/auth/register    - User registration with password hashing
POST /api/auth/login       - User login with JWT token generation
POST /api/auth/refresh     - Token refresh using refresh tokens
POST /api/auth/logout      - Token invalidation and session cleanup
```

### Todo Management Endpoints
```
GET    /api/todos          - List user's todos with filtering options
POST   /api/todos          - Create new todo item
GET    /api/todos/{id}     - Get specific todo by ID
PUT    /api/todos/{id}     - Update specific todo by ID
DELETE /api/todos/{id}     - Delete specific todo by ID
PUT    /api/todos/{id}/complete - Mark todo as completed
PUT    /api/todos/{id}/priority - Update priority level
```

### Chat AI Endpoints
```
POST /api/chat/send        - Process natural language todo commands
GET  /api/chat/conversations - List user's AI conversations
POST /api/chat/conversations - Create new conversation thread
```

### User Management Endpoints
```
GET  /api/users/me         - Get current user profile
PUT  /api/users/me         - Update user profile information
DELETE /api/users/me       - Delete user account
```

## Health Check

The application provides a basic health check endpoint:
```
GET /api/health
```

**Response Format**:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-24T10:30:00Z",
  "version": "1.0.0"
}
```

This endpoint verifies basic application connectivity and can be used for load balancer health checks.

## API Documentation

The application includes automatic API documentation through FastAPI's integrated tools:

- **Swagger UI**: Available at `http://localhost:8000/docs`
- **ReDoc**: Available at `http://localhost:8000/redoc`
- **OpenAPI Schema**: Available at `http://localhost:8000/openapi.json`

All endpoints are automatically documented with request/response schemas, authentication requirements, and example payloads.


## Testing

### Backend Testing
```bash
# Run backend tests (if pytest is configured)
cd backend
python -m pytest

# Or with coverage
python -m pytest --cov=src
```

### Frontend Testing
```bash
# Run frontend tests (if testing framework is configured)
cd frontend
npm run test
```

### End-to-End Testing
The system supports full-stack testing through the API endpoints and frontend integration tests.

---

## 🤝 Contributing Guidelines

We welcome contributions to this project! To contribute:

1. Fork the repository and create your branch from `main`
2. Follow the established code style and patterns
3. Write tests for new functionality
4. Ensure all tests pass before submitting a pull request
5. Document any changes to the API or functionality
6. Submit a pull request with a clear description of your changes

Please ensure your code adheres to the project's coding standards and includes appropriate unit tests.

## 👨‍💻 Maintainer / Author Information

**Afaq Ul Islam**  
COO at Neofyx | Full-Stack & AI Engineer | Architecting AI-Driven SaaS with Next.js, React, TypeScript & FastAPI  (GIAIC)

This project is designed, developed, and maintained by **Afaq Ul Islam**.  
All architectural decisions, implementation details, and maintenance responsibilities belong to the author unless explicitly stated otherwise.

---

## 🛟 Support & Maintenance

This project is currently **self-maintained**.

Support is handled as follows:
- Bugs and issues should be reported via the GitHub Issues section
- Improvements and enhancements can be proposed through Pull Requests
- Code reviews are performed by the maintainer
- Dependency updates and fixes are applied as needed

There is **no guaranteed SLA**, enterprise support contract, or dedicated support team.

---

## 📄 License

This project is released under the **MIT License**.

You are free to use, modify, and distribute this project in accordance with the terms of the license.  
See the `LICENSE` file in the repository root for full details.

---

## 🌐 Social / Contact

**Afaq Ul Islam**

- **GitHub**: https://github.com/afaqulislam  
- **LinkedIn**: https://linkedin.com/in/afaqulislam
- **Twitter(X)**: https://x.com/afaqulislam708 
- **Email**: afaqulislam707@gmail.com  

For professional collaboration, technical discussions, or project-related communication, email is the preferred contact method.