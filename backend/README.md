# Todo API Backend

A production-ready FastAPI backend for a multi-user todo application with JWT authentication and PostgreSQL database.

## 📋 Project Overview

This backend provides a complete API for managing todos with user authentication and authorization. It features:
- JWT-based authentication system with registration and login
- User-specific todo ownership with proper authorization
- PostgreSQL database integration (optimized for Neon)
- Comprehensive API endpoints for todo management
- Security best practices implementation

## 🛠️ Tech Stack

- **Framework**: FastAPI (0.104.1)
- **Database**: PostgreSQL (with SQLModel ORM)
- **Authentication**: JWT with bcrypt password hashing
- **Dependencies**: python-jose, passlib, python-dotenv
- **Runtime**: Python 3.9+

## 🚀 Setup Instructions

### Prerequisites
- Python 3.9+
- PostgreSQL database (Neon recommended for cloud deployment)

### Installation Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd todo-backend
```

2. **Create a virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

## ⚙️ Environment Variables

Create a `.env` file in the backend root directory with the following variables:

```env
# DATABASE (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require

# AUTHENTICATION (JWT)
BETTER_AUTH_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRY_DAYS=7

# AI MODEL PROVIDER
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_API_KEY=your-api-key
OPENROUTER_MODEL_NAME=your-model-name
```

### Environment Variable Details

- `DATABASE_URL`: PostgreSQL connection string (Neon DB recommended)
- `BETTER_AUTH_SECRET`: Secret key for JWT signing (use a strong random key in production)
- `JWT_ALGORITHM`: Algorithm used for JWT signing (HS256 recommended)
- `JWT_EXPIRY_DAYS`: Number of days until JWT tokens expire
- `OPENROUTER_BASE_URL`: Base URL for OpenRouter API
- `OPENROUTER_API_KEY`: API key for OpenRouter
- `OPENROUTER_MODEL_NAME`: Model name for OpenRouter

### Getting Credentials

- **Neon PostgreSQL**: Sign up at [neon.tech](https://neon.tech) and create a new project
- **JWT Secret**: Generate a strong secret using a password generator or `openssl rand -base64 32`

## ▶️ How to Run

Start the FastAPI server:

```bash
cd backend
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- `http://localhost:8000` - Main API
- `http://localhost:8000/docs` - Interactive API documentation (Swagger)
- `http://localhost:8000/redoc` - Alternative API documentation (ReDoc)

## 📖 API Documentation

### Available Endpoints

#### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/register` - Register a new user
- `POST /api/v1/auth/login` - Login with email and password
- `GET /api/v1/auth/me` - Get current user details

#### Todos (`/api/v1/todos`)
- `POST /api/v1/todos/` - Create a new todo
- `GET /api/v1/todos/{todo_id}` - Get a specific todo
- `GET /api/v1/todos/` - Get all todos for current user
- `PUT /api/v1/todos/{todo_id}` - Update a specific todo
- `PATCH /api/v1/todos/{todo_id}` - Partially update a todo
- `DELETE /api/v1/todos/{todo_id}` - Delete a specific todo
- `POST /api/v1/todos/{todo_id}/toggle` - Toggle todo completion status

### Auth Flow

1. **Register**: Create a new user account via `POST /api/v1/auth/register`
2. **Login**: Obtain JWT token via `POST /api/v1/auth/login`
3. **Access**: Use the token in Authorization header: `Bearer {token}` for protected endpoints

## 🧪 Testing Guide

### Using Swagger UI

1. Navigate to `http://localhost:8000/docs`
2. Register a new user via the `/api/v1/auth/register` endpoint
3. Login via `/api/v1/auth/login` to obtain a JWT token
4. Click "Authorize" button and enter: `Bearer {your_token}`
5. Test other endpoints with proper authentication

### Using Postman

1. **Register**: Send POST to `/api/v1/auth/register` with:
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

2. **Login**: Send POST to `/api/v1/auth/login` with form data:
- username: `user@example.com`
- password: `securepassword123`

3. **Access Protected Routes**: Use the returned token in Authorization header:
- Type: Bearer Token
- Token: `{access_token_from_login}`

## 🔐 Security Considerations

- Passwords are securely hashed using bcrypt
- JWT tokens are signed with HS256 algorithm
- All endpoints enforce user ownership (users can only access their own todos)
- CORS is configured (can be restricted further in production)
- Input validation is enforced via Pydantic models

## 🚀 Production Notes

### Before Deployment

1. **Environment Variables**:
   - Set `ENV=production`
   - Use a strong, unique `BETTER_AUTH_SECRET`
   - Use production PostgreSQL database URL

2. **Security**:
   - Restrict CORS origins in production
   - Use HTTPS in production
   - Implement rate limiting for auth endpoints

3. **JWT Expiry**:
   - Adjust `JWT_EXPIRY_DAYS` based on security requirements
   - Consider implementing refresh tokens for long-lived sessions

4. **Database**:
   - Ensure PostgreSQL connection pooling is optimized
   - Enable SSL for database connections
   - Set up proper backup procedures

### Recommended Production Command

```bash
uvicorn src.main:app --host 0.0.0.0 --port $API_PORT --workers 4
```

## 📝 Additional Notes

- The application automatically creates database tables on startup
- All timestamps are stored in UTC
- UUIDs are used for all primary keys
- Error responses follow standard HTTP status codes