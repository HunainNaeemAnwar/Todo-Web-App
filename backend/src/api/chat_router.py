from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import uuid
import structlog
import json

from src.api.dependencies import get_current_user_id
from src.services.conversation_service import ConversationService
from src.database.database import get_session
from sqlmodel import Session

logger = structlog.get_logger(__name__)

router = APIRouter(tags=["chat"])


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=10000)
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    conversation_id: str
    response: str
    messages: List[dict]
    tool_calls: Optional[List[str]] = None


class MessageResponse(BaseModel):
    id: str
    role: str
    content: str
    created_at: str


class ConversationListResponse(BaseModel):
    id: str
    created_at: str
    updated_at: str


class ToolCallResult(BaseModel):
    tool_name: str
    success: bool
    result: Dict[str, Any]


async def process_with_openai_agent(
    message: str,
    conversation_history: List[Dict[str, str]],
    user_id: str,
    token: Optional[str] = None
) -> tuple[str, List[ToolCallResult]]:
    """
    Process message with OpenAI Agents SDK and MCP tools using Gemini model.

    Sets user_id in context, connects to local MCP server, runs agent with Gemini model.
    """
    import os
    from agents import Agent, Runner, set_default_openai_client, set_default_openai_api
    from agents.run import RunConfig
    from agents.mcp import MCPServerStdio
    from openai import AsyncOpenAI
    from src.mcp.context import set_current_user_id

    # Set user_id in context for MCP tools
    set_current_user_id(user_id)

    tool_results: List[ToolCallResult] = []

    try:
        gemini_api_key = os.getenv("GEMINI_API_KEY")
        if not gemini_api_key:
            return "Error: GEMINI_API_KEY environment variable not set.", []

        # 1. Configure the custom client for Gemini
        # Google's Gemini API has OpenAI-compatible endpoint
        gemini_client = AsyncOpenAI(
            api_key=gemini_api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
        )

        # 2. Set the SDK to use this client
        set_default_openai_client(gemini_client)
        set_default_openai_api("chat_completions")

        # 3. Create MCP server instance
        mcp_server_env = {
            **os.environ,
            "USER_ID": user_id,
            "REQUEST_ID": str(uuid.uuid4()),
            "RUNNING_AS_MCP_SERVER": "true",  # Signal to MCP server to suppress logging that interferes with protocol
        }
        if token:
            mcp_server_env["AUTH_TOKEN"] = token

        mcp_server = MCPServerStdio({
            "command": "python",
            "args": ["-m", "src.mcp.server"],
            "env": mcp_server_env
        }, client_session_timeout_seconds=30)  # Increase timeout to 30 seconds for database operations

        agent = Agent(
            name="Task Assistant",
            instructions=(
                "You are a helpful task management assistant. Use the available MCP tools to help users manage their todo lists. "
                "Always respond in a friendly, conversational way. Confirm actions taken. "
                "If something is unclear, ask for clarification. If a user asks to mark a task as completed or delete a task, first use list_tasks to find the task ID."
            ),
            mcp_servers=[mcp_server],
            model="gemini-2.5-flash",
        )

        # Include conversation history for context
        # Runner.run accepts a string or proper message list
        # For simplicity with conversation history, just pass the current message
        # The agent will maintain context through the conversation service

        # Disable tracing before running the agent to prevent API key conflicts
        import os
        os.environ["TRACELOOP_TRACING_ENABLED"] = "false"
        os.environ["OPENAI_LOG"] = "none"

        async with mcp_server:
            result = await Runner.run(
                agent,
                message,  # Pass string directly - simpler and type-safe
                run_config=RunConfig(
                    tracing_disabled=True
                )
            )

            # Extract response
            response_text = str(result.final_output) if result.final_output else "I'm having trouble processing your request right now."

            return response_text, tool_results

    except Exception as e:
        logger.error(f"Gemini Agent processing failed: {e}")
        return f"I'm having trouble processing your request right now. (Error: {str(e)})", []


@router.post("/")
async def send_chat_message(
    request: ChatRequest,
    raw_request: Request,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> ChatResponse:
    """
    Send a chat message and receive AI response with task management actions.

    This endpoint processes natural language messages and:
    1. Creates or resumes a conversation
    2. Processes the message with AI to extract intent
    3. Executes appropriate task management operations
    4. Persists all messages to conversation history
    5. Returns friendly response confirming actions taken
    """
    import asyncio

    request_id = str(uuid.uuid4())

    logger.info(
        "Chat request received",
        user_id=current_user_id[:8] + "...",
        request_id=request_id,
        message_length=len(request.message),
        conversation_id=request.conversation_id
    )

    # Get token for MCP authentication
    auth_header = raw_request.headers.get("Authorization")
    token = auth_header.split(" ")[1] if auth_header and auth_header.startswith("Bearer ") else None

    conversation_service = ConversationService(session)

    conversation_id = request.conversation_id

    if conversation_id:
        existing = conversation_service.get_conversation(conversation_id, current_user_id)
        if not existing:
            logger.warning(
                "Conversation not found",
                user_id=current_user_id[:8] + "...",
                request_id=request_id,
                conversation_id=conversation_id
            )
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = conversation_service.create_conversation(current_user_id)
        conversation_id = conversation.id
        logger.info(
            "New conversation created",
            user_id=current_user_id[:8] + "...",
            request_id=request_id,
            conversation_id=conversation_id
        )

    user_message = conversation_service.add_message(
        conversation_id,
        current_user_id,
        "user",
        request.message
    )

    if user_message is None:
        logger.error(
            "Failed to persist user message",
            user_id=current_user_id[:8] + "...",
            request_id=request_id,
            conversation_id=conversation_id
        )
        raise HTTPException(status_code=500, detail="Failed to save message")

    conversation_history = conversation_service.get_conversation_messages(conversation_id, current_user_id)
    history_for_ai = [
        {"role": msg.role, "content": msg.content}
        for msg in conversation_history[:-1]
    ]

    try:
        ai_response_text, tool_results = await process_with_openai_agent(
            request.message,
            history_for_ai,
            current_user_id,
            token
        )
    except Exception as e:
        logger.error(
            "AI processing failed",
            user_id=current_user_id[:8] + "...",
            request_id=request_id,
            error=str(e)
        )
        ai_response_text = "I'm having trouble processing your request. Please try again."
        tool_results = []

    assistant_message = conversation_service.add_message(
        conversation_id,
        current_user_id,
        "assistant",
        ai_response_text
    )
    
    if assistant_message is None:
        logger.error(
            "Failed to persist assistant message",
            user_id=current_user_id[:8] + "...",
            request_id=request_id,
            conversation_id=conversation_id
        )
    
    messages = conversation_service.get_conversation_messages(conversation_id, current_user_id)
    message_dicts = [
        {
            "id": msg.id,
            "role": msg.role,
            "content": msg.content,
            "created_at": msg.created_at.isoformat()
        }
        for msg in messages
    ]
    
    tool_call_names = [r.tool_name for r in tool_results] if tool_results else []
    
    logger.info(
        "Chat response generated",
        user_id=current_user_id[:8] + "...",
        request_id=request_id,
        conversation_id=conversation_id,
        tool_calls_count=len(tool_call_names)
    )
    
    return ChatResponse(
        conversation_id=conversation_id,
        response=ai_response_text,
        messages=message_dicts,
        tool_calls=tool_call_names if tool_call_names else None
    )


@router.get("/conversations")
async def get_conversations(
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
) -> List[ConversationListResponse]:
    conversation_service = ConversationService(session)
    conversations = conversation_service.get_user_conversations(current_user_id)

    return [
        ConversationListResponse(
            id=conv.id,
            created_at=conv.created_at.isoformat(),
            updated_at=conv.updated_at.isoformat()
        )
        for conv in conversations
    ]


@router.get("/conversations/{conversation_id}")
async def get_conversation_messages(
    conversation_id: str,
    current_user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    conversation_service = ConversationService(session)

    conversation = conversation_service.get_conversation(conversation_id, current_user_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = conversation_service.get_conversation_messages(conversation_id, current_user_id)

    return {
        "messages": [
            {
                "id": msg.id,
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
            }
            for msg in messages
        ]
    }
