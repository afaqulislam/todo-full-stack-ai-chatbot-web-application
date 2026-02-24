"""Message model for the AI Chatbot feature."""

from datetime import datetime
from enum import Enum
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Relationship


class MessageRole(str, Enum):
    """Enumeration of possible message roles."""

    user = "user"
    assistant = "assistant"


class Message(SQLModel, table=True):
    """Represents an individual message within a conversation."""

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(index=True)  # Foreign key to user, ensures multi-user isolation
    conversation_id: UUID = Field(
        foreign_key="conversation.id", index=True
    )  # Foreign key to Conversation
    role: MessageRole = Field(sa_column_kwargs={"name": "role"})
    content: str = Field()
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        arbitrary_types_allowed = True