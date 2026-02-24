"""Message service for the AI Chatbot feature."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.message import Message, MessageRole


class MessageService:
    """Service class for managing messages."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_message(
        self, user_id: str, conversation_id: UUID, role: MessageRole, content: str
    ) -> Message:
        """Create a new message in a conversation."""
        message = Message(
            user_id=user_id, conversation_id=conversation_id, role=role, content=content
        )
        self.session.add(message)
        await self.session.commit()
        await self.session.refresh(message)
        return message

    async def get_message_by_id(self, message_id: UUID, user_id: str) -> Optional[Message]:
        """Get a message by its ID for a specific user (enforces multi-user isolation)."""
        statement = select(Message).where(
            Message.id == message_id, Message.user_id == user_id
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_messages_by_conversation(
        self, conversation_id: UUID, user_id: str
    ) -> List[Message]:
        """Get all messages in a conversation for a specific user."""
        statement = select(Message).where(
            Message.conversation_id == conversation_id,
            Message.user_id == user_id  # Enforce multi-user isolation
        ).order_by(Message.created_at.asc())
        result = await self.session.execute(statement)
        return result.scalars().all()

    async def validate_user_owns_conversation(self, conversation_id: UUID, user_id: str) -> bool:
        """Validate that the user actually owns the conversation."""
        statement = select(Message).where(
            Message.conversation_id == conversation_id,
            Message.user_id == user_id
        ).limit(1)
        result = await self.session.execute(statement)
        return result.scalar_one_or_none() is not None