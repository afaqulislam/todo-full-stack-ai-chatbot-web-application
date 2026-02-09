from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.todos import router as todos_router
from .api.auth import router as auth_router
from .core.config import settings
from .core.database import create_db_and_tables
from contextlib import asynccontextmanager
import os


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for application startup and shutdown.
    """
    # Startup
    print("Initializing database...")
    await create_db_and_tables()
    print("Database initialized.")

    yield

    # Shutdown
    # Add any cleanup code here if needed


# Create FastAPI app with lifespan
app = FastAPI(
    title=settings.project_name,
    version=settings.version,
    openapi_url=f"{settings.api_v1_prefix}/openapi.json" if settings.api_docs_enabled else None,
    docs_url=f"{settings.api_v1_prefix}/docs" if settings.api_docs_enabled else None,
    redoc_url=f"{settings.api_v1_prefix}/redoc" if settings.api_docs_enabled else None,
    lifespan=lifespan
)


# Configure CORS middleware for cookie-based authentication
if settings.backend_cors_origins == "*":
    allowed_origins = [
        "http://localhost:3000",    # Next.js default dev server
        "http://127.0.0.1:3000",   # Alternative localhost address
        "http://localhost:8000",    # For direct API access/testing
        "http://127.0.0.1:8000",   # Alternative localhost address
        "http://0.0.0.0:3000",     # Docker or other network configurations
        "*"  # Allow all origins if wildcard is set
    ]
else:
    # Parse comma-separated origins from settings
    configured_origins = [origin.strip() for origin in settings.backend_cors_origins.split(",")]
    allowed_origins = [
        "http://localhost:3000",    # Next.js default dev server
        "http://127.0.0.1:3000",   # Alternative localhost address
        "http://localhost:8000",    # For direct API access/testing
        "http://127.0.0.1:8000",   # Alternative localhost address
        "http://0.0.0.0:3000",     # Docker or other network configurations
    ] + configured_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,  # Critical for cookie-based authentication
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Specific methods
    allow_headers=["*"],  # Allow all headers
    # Expose Set-Cookie header so the browser can see it in the response
    # This is important for debugging but cookies are automatically sent with credentials: 'include'
    expose_headers=["Access-Control-Allow-Origin", "Set-Cookie"],
)


# Include API routers
app.include_router(auth_router)
app.include_router(todos_router)


@app.get("/")
def read_root():
    """
    Root endpoint for health check.
    """
    return {"message": "Todo API is running!"}


@app.get("/health")
def health_check():
    """
    Health check endpoint.
    """
    return {"status": "healthy", "version": settings.version}


# This would be the entry point for uvicorn
# To run: uvicorn src.main:app --reload --port 8000