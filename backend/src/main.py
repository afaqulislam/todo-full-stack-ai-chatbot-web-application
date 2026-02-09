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
    openapi_url=(
        f"{settings.api_v1_prefix}/openapi.json" if settings.api_docs_enabled else None
    ),
    docs_url=f"{settings.api_v1_prefix}/docs" if settings.api_docs_enabled else None,
    redoc_url=f"{settings.api_v1_prefix}/redoc" if settings.api_docs_enabled else None,
    lifespan=lifespan,
)

# Configure CORS based on environment using settings
# Add CORS middleware to allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
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
