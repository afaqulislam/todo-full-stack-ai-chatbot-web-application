# Todo Web App - Frontend

A modern, full-featured todo application frontend built with Next.js and integrated with a FastAPI backend.

## Features

- **Modern UI/UX**: Clean, responsive design with dark mode support
- **Authentication**: Secure login and signup with JWT token management
- **Todo Management**: Full CRUD operations for todos
- **Real-time Updates**: Instant updates when creating, updating, or deleting todos
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **Frontend**: Next.js 16.1.3 with App Router
- **Styling**: Tailwind CSS with custom dark mode
- **State Management**: React Context API
- **Backend Integration**: REST API calls to FastAPI backend

## Pages

1. **Landing Page** (`/`)
   - Modern, attractive landing page showcasing app features
   - Responsive design with navigation and call-to-action buttons
   - Features overview and benefits section

2. **Authentication Pages** (`/auth/*`)
   - Login page with form validation
   - Signup page with form validation
   - Secure token management

3. **Dashboard Page** (`/dashboard`)
   - Todo list with create, read, update, delete functionality
   - Mark todos as complete/incomplete
   - Stats dashboard showing total, completed, and pending tasks
   - User profile and logout functionality

## API Endpoints Used

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user
- `GET /api/v1/todos/` - Get all user's todos
- `POST /api/v1/todos/` - Create a new todo
- `PUT /api/v1/todos/{id}` - Update a todo
- `PATCH /api/v1/todos/{id}` - Partially update a todo
- `DELETE /api/v1/todos/{id}` - Delete a todo
- `POST /api/v1/todos/{id}/toggle` - Toggle todo completion status

## Setup Instructions

1. Make sure the FastAPI backend is running on `http://localhost:8000`
2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Currently hardcoded to connect to the backend at `http://localhost:8000`. This can be changed in the API call files if needed.

## Folder Structure

```
frontend/                    # Frontend React application
    ├── src/                 # Source code
    │   ├── app/             # Next.js app directory structure
    │   ├── components/      # Reusable React components
    │   ├── services/        # API service utilities
    │   └── config/          # Configuration files
    │       └── apiConfig.ts # API endpoint configuration
    └── public/              # Static assets and images
```

## Security Features

- JWT token-based authentication
- Protected routes (dashboard requires authentication)
- Secure token storage in localStorage
- Automatic logout on token expiration
