from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import AsyncAdaptedQueuePool
from sqlalchemy import text
import os
from typing import AsyncGenerator
from contextlib import asynccontextmanager


from .config import settings

import logging

# Get database URL from settings and convert to async format
original_url = settings.database_url

# Check if it's a PostgreSQL URL to convert to async format, otherwise keep as is for SQLite
if original_url.startswith("postgresql://"):
    # Remove sslmode and channel_binding parameters as they're not supported by asyncpg
    DATABASE_URL = original_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Parse and clean URL parameters
    if "?" in DATABASE_URL:
        base_url, query_string = DATABASE_URL.split("?", 1)
        original_params = query_string.split("&")

        # Filter out unsupported parameters for asyncpg
        filtered_params = [
            param for param in original_params
            if not param.startswith("sslmode=") and not param.startswith("channel_binding=")
        ]

        if filtered_params:
            DATABASE_URL = f"{base_url}?{'&'.join(filtered_params)}"
        else:
            DATABASE_URL = base_url
elif original_url.startswith("sqlite://"):
    # For SQLite, convert to async format
    DATABASE_URL = original_url.replace("sqlite://", "sqlite+aiosqlite://", 1)
else:
    # For other formats, use as is
    DATABASE_URL = original_url

logging.info(f"Using database URL: {DATABASE_URL}")

# Configure engine based on database type
if DATABASE_URL.startswith("sqlite+aiosqlite"):
    # SQLite configuration
    engine = create_async_engine(
        DATABASE_URL,
        echo=False  # Set to True for debugging SQL queries
    )
else:
    # PostgreSQL configuration with connection pooling
    engine = create_async_engine(
        DATABASE_URL,
        poolclass=AsyncAdaptedQueuePool,
        pool_size=5,
        max_overflow=10,
        pool_pre_ping=True,        # Verify connections before use
        pool_recycle=300,          # Recycle connections to avoid stale plans
        pool_reset_on_return='commit',  # Reset connections when returned to pool
        echo=False                 # Set to True for debugging SQL queries
    )

# Create async session maker
AsyncSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def create_db_and_tables():
    """
    Create database tables based on SQLModel models.
    This should be called on application startup.
    """
    async with engine.begin() as conn:
        # Create all tables - this will only create tables that don't exist
        await conn.run_sync(SQLModel.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Get an async database session for dependency injection.
    """
    async with AsyncSessionLocal() as session:
        yield session


def get_engine():
    """
    Get the database engine instance.
    """
    return engine