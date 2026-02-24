"""Conversation service for the AI Chatbot feature."""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.conversation import Conversation
from ..models.message import Message


class ConversationService:
    """Service class for managing conversations."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_conversation(self, user_id: str) -> Conversation:
        """Create a new conversation for the user."""
        conversation = Conversation(user_id=user_id)
        self.session.add(conversation)
        await self.session.commit()
        await self.session.refresh(conversation)
        return conversation

    async def get_conversation_by_id(self, conversation_id: UUID, user_id: str) -> Optional[Conversation]:
        """Get a conversation by its ID for a specific user (enforces multi-user isolation)."""
        statement = select(Conversation).where(
            Conversation.id == conversation_id, Conversation.user_id == user_id
        )
        result = await self.session.execute(statement)
        return result.scalar_one_or_none()

    async def get_or_create_conversation(
        self, conversation_id: Optional[UUID], user_id: str
    ) -> Conversation:
        """Get an existing conversation or create a new one."""
        if conversation_id:
            # Try to get existing conversation
            conversation = await self.get_conversation_by_id(conversation_id, user_id)
            if conversation:
                return conversation
            # If conversation doesn't exist or doesn't belong to user, create new one
        return await self.create_conversation(user_id)

    async def get_conversation_history(self, conversation_id: UUID, user_id: str) -> List[Message]:
        """Get the full conversation history for a specific conversation and user."""
        statement = select(Message).where(
            Message.conversation_id == conversation_id,
            Message.user_id == user_id  # Enforce multi-user isolation
        ).order_by(Message.created_at.asc())
        result = await self.session.execute(statement)
        return result.scalars().all()

    async def update_conversation_timestamp(self, conversation_id: UUID) -> None:
        """Update the updated_at timestamp for a conversation."""
        statement = select(Conversation).where(Conversation.id == conversation_id)
        result = await self.session.execute(statement)
        conversation = result.scalar_one_or_none()
        if conversation:
            conversation.updated_at = datetime.utcnow()
            self.session.add(conversation)
            await self.session.commit()