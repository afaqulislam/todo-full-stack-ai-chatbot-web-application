"""Chat endpoint implementation for the AI Chatbot feature."""

from datetime import datetime
from typing import Any, Dict, List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from ..agents.chat_agent import OpenRouterChatAgent
from ..middleware.auth import auth_middleware, UserIdentity
from ..models.conversation import Conversation
from ..models.message import Message, MessageRole
from ..services.conversation_service import ConversationService
from ..services.message_service import MessageService
from ..core.database import get_async_session


router = APIRouter()


class ChatRequest(BaseModel):
    """Request model for the chat endpoint."""
    conversation_id: UUID = None  # Optional existing conversation ID
    message: str  # The user's message


class ChatResponse(BaseModel):
    """Response model for the chat endpoint."""
    conversation_id: UUID
    response: str
    tool_calls: List[Dict[str, Any]]


@router.post("/api/v1/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    current_user: UserIdentity = Depends(auth_middleware.get_current_user),
    session: AsyncSession = Depends(get_async_session)
) -> ChatResponse:
    """
    Process a user message and return an AI response.

    Following constitution: Server remains stateless, conversation history
    is loaded from database, and multi-user isolation is enforced.
    """
    # Use authenticated user ID directly
    user_id = current_user.id

    # Initialize services
    conversation_service = ConversationService(session)
    message_service = MessageService(session)

    # Get or create conversation
    conversation = await conversation_service.get_or_create_conversation(
        conversation_id=request.conversation_id,
        user_id=user_id
    )

    # Store the user's message in the conversation
    user_message = await message_service.create_message(
        user_id=user_id,
        conversation_id=conversation.id,
        role=MessageRole.user,
        content=request.message
    )

    # Get the full conversation history for the agent
    conversation_history = await conversation_service.get_conversation_history(
        conversation_id=conversation.id,
        user_id=user_id
    )

    # Prepare the chat history for the agent in the right format
    chat_history = [
        {
            "role": msg.role.value,  # Convert enum to string
            "content": msg.content
        }
        for msg in conversation_history
    ]

    # Create and run the chat agent
    agent = OpenRouterChatAgent(session=session, user_id=user_id)
    result = await agent.process_message(
        message=request.message,
        conversation_history=chat_history
    )

    # Store the assistant's response in the conversation
    assistant_message = await message_service.create_message(
        user_id=user_id,
        conversation_id=conversation.id,
        role=MessageRole.assistant,
        content=result["response"]
    )

    # Update conversation timestamp
    await conversation_service.update_conversation_timestamp(conversation.id)

    # Return the response with the conversation ID
    return ChatResponse(
        conversation_id=conversation.id,
        response=result["response"],
        tool_calls=result.get("tool_calls", [])
    )