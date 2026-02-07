import os
import uuid
import json
from typing import Any, AsyncIterator, Optional, Generator
from contextlib import contextmanager
from fastapi import APIRouter, Request, Depends, HTTPException
from fastapi.responses import StreamingResponse, Response
from sqlmodel import Session
import structlog

from src.api.dependencies import get_current_user_id
from src.services.conversation_service import ConversationService
from src.database.database import get_session
from src.models.conversation import Conversation

# OpenAI ChatKit imports
from chatkit.server import ChatKitServer, StreamingResult
from chatkit.store import Store
from chatkit.types import (
    ThreadMetadata,
    ThreadItem,
    Page,
    UserMessageItem,
    AssistantMessageItem,
    UserMessageTextContent,
    AssistantMessageContent,
    InferenceOptions,
)
from chatkit.agents import AgentContext, stream_agent_response, ThreadItemConverter

# OpenAI Agents SDK imports
from agents import Agent, Runner, set_default_openai_client
from agents.models.openai_chatcompletions import OpenAIChatCompletionsModel
from openai import AsyncOpenAI

logger = structlog.get_logger(__name__)
router = APIRouter(tags=["chatkit"])


def create_model():
    """
    Factory function to create the AI model for ChatKit.

    Uses OpenAI-compatible endpoint with chat completions API.
    Configure via environment variables:
    - OPENAI_API_KEY: Your OpenAI API key (for OpenAI)
    - GEMINI_API_KEY: Your Gemini API key (for Google Gemini)
    - LLM_PROVIDER: Model provider ('openai' or 'gemini', default: 'gemini')
    - MODEL_NAME: Model name (default: gpt-4o-mini for OpenAI, gemini-2.5-flash for Gemini)

    Returns:
        OpenAIChatCompletionsModel: Model instance configured for the selected provider
    """
    llm_provider = os.getenv("LLM_PROVIDER", "gemini").lower()
    model_name = os.getenv("MODEL_NAME")

    if llm_provider == "gemini":
        gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        model_name = model_name or os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

        if not gemini_api_key:
            raise ValueError(
                "GEMINI_API_KEY environment variable must be set. "
                "Get your API key from: https://aistudio.google.com/apikey"
            )

        # Create AsyncOpenAI client with Gemini endpoint
        client = AsyncOpenAI(
            api_key=gemini_api_key,
            base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
        )

    elif llm_provider == "openai":
        openai_api_key = os.getenv("OPENAI_API_KEY")
        model_name = model_name or os.getenv("OPENAI_MODEL", "gpt-4o-mini")

        if not openai_api_key:
            raise ValueError(
                "OPENAI_API_KEY environment variable must be set. "
                "Get your API key from: https://platform.openai.com/api-keys"
            )

        # Create AsyncOpenAI client with OpenAI endpoint
        client = AsyncOpenAI(api_key=openai_api_key)

    else:
        raise ValueError(
            f"Unsupported LLM provider: {llm_provider}. Use 'openai' or 'gemini'."
        )

    # Set as default client for all agents
    set_default_openai_client(client)

    # Create OpenAIChatCompletionsModel for compatibility
    model = OpenAIChatCompletionsModel(model=model_name, openai_client=client)

    logger.info(
        "Model factory initialized",
        provider=llm_provider,
        model=model_name,
        base_url=client.base_url,
    )

    return model


class ConversationStore(Store[dict]):
    """Bridge between ChatKit Store and our DB-backed ConversationService"""

    def __init__(self, user_id: str):
        self.user_id = user_id

    @contextmanager
    def _get_session(self) -> Generator[Session, None, None]:
        from src.database.database import get_session_context
        with get_session_context() as session:
            yield session

    def generate_thread_id(self, context: dict) -> str:
        return str(uuid.uuid4())

    def generate_item_id(
        self, item_type: str, thread: ThreadMetadata, context: dict
    ) -> str:
        return str(uuid.uuid4())

    async def load_thread(self, thread_id: str, context: dict) -> ThreadMetadata:
        user_id = context.get("user_id") or self.user_id
        logger.info(
            "=== LOAD_THREAD CALLED ===",
            thread_id=thread_id,
            user_id=user_id[:8] + "...",
            context_keys=list(context.keys()) if context else [],
        )
        with self._get_session() as session:
            service = ConversationService(session)
            conv = service.get_conversation(thread_id, user_id)
            if not conv:
                logger.info(
                    "Creating new conversation for thread",
                    thread_id=thread_id,
                    user_id=user_id[:8] + "...",
                )
                # Create new conversation with the exact thread_id that ChatKit expects
                conv = Conversation(
                    id=thread_id,
                    user_id=user_id,
                )
                session.add(conv)
                session.commit()
                session.refresh(conv)
                logger.info(
                    "Conversation created",
                    conversation_id=conv.id,
                    thread_id=thread_id,
                )

            return ThreadMetadata(
                id=conv.id,
                created_at=conv.created_at,
                title=conv.title or "New Conversation",
                metadata={
                    "title": conv.title or "New Conversation",
                    "updated_at": conv.updated_at.isoformat() if conv.updated_at else None
                }
            )

    async def save_thread(self, thread: ThreadMetadata, context: dict) -> None:
        # Update the conversation timestamp
        with self._get_session() as session:
            service = ConversationService(session)
            service.update_conversation_timestamp(thread.id, self.user_id)

    async def load_thread_items(
        self,
        thread_id: str,
        after: Optional[str],
        limit: int,
        order: str,
        context: dict,
    ) -> Page[ThreadItem]:
        with self._get_session() as session:
            service = ConversationService(session)
            db_messages = service.get_conversation_messages(thread_id, self.user_id)

            logger.info(
                "=== LOAD_THREAD_ITEMS ===",
                thread_id=thread_id,
                message_count=len(db_messages),
                user_id=self.user_id[:8] + "...",
                after=after,
                limit=limit,
            )

            # Convert DB models to ChatKit ThreadItems
            items: list[ThreadItem] = []
            for msg in db_messages:
                if msg.role == "user":
                    user_item = UserMessageItem(
                        id=msg.id,
                        thread_id=thread_id,
                        type="user_message",
                        content=[
                            UserMessageTextContent(type="input_text", text=msg.content)
                        ],
                        created_at=msg.created_at,
                        inference_options=InferenceOptions(),  # Required field
                    )
                    items.append(user_item)
                elif msg.role == "assistant":
                    assistant_item = AssistantMessageItem(
                        id=msg.id,
                        thread_id=thread_id,
                        type="assistant_message",
                        content=[
                            AssistantMessageContent(type="output_text", text=msg.content)
                        ],
                        created_at=msg.created_at,
                    )
                    items.append(assistant_item)

            # Basic pagination
            return Page(data=items, has_more=False)  # type: ignore[arg-type]

    async def add_thread_item(
        self, thread_id: str, item: ThreadItem, context: dict
    ) -> None:
        user_id = context.get("user_id") or self.user_id
        try:
            item_type = getattr(item, "type", None)

            # Log ALL item types for debugging
            logger.info(
                "=== ADD_THREAD_ITEM CALLED ===",
                thread_id=thread_id,
                item_type=item_type,
                user_id=user_id[:8] + "...",
                has_content=hasattr(item, "content"),
                item_id=getattr(item, "id", "no-id"),
            )

            with self._get_session() as session:
                service = ConversationService(session)
                if item_type == "user_message":
                    content_list = getattr(item, "content", [])
                    if isinstance(content_list, list) and len(content_list) > 0:
                        content_obj = content_list[0]
                        content_text = getattr(content_obj, "text", str(content_obj))
                        if content_text:
                            logger.info(
                                "Saving user message to database",
                                thread_id=thread_id,
                                user_id=user_id[:8] + "...",
                                content_preview=content_text[:50],
                            )
                            message = service.add_message(
                                thread_id, user_id, "user", content_text
                            )
                            # Force commit to save before session closes
                            if message:
                                session.commit()
                                logger.info(
                                    "User message committed to database",
                                    message_id=message.id,
                                )

                                # Update conversation title if it's the first message
                                messages = service.get_conversation_messages(thread_id, user_id)
                                if len(messages) == 1:
                                    title = content_text[:50] + ("..." if len(content_text) > 50 else "")
                                    logger.info("Setting conversation title", thread_id=thread_id, title=title)
                                    conv = service.get_conversation(thread_id, user_id)
                                    if conv:
                                        conv.title = title
                                        session.add(conv)
                                        session.commit()
                                        logger.info("Conversation title updated in database")

                elif item_type == "assistant_message":
                    content_list = getattr(item, "content", [])
                    if isinstance(content_list, list) and len(content_list) > 0:
                        content_obj = content_list[0]
                        content_text = getattr(content_obj, "text", str(content_obj))
                        if content_text:
                            logger.info(
                                "Saving assistant message to database",
                                thread_id=thread_id,
                                user_id=user_id[:8] + "...",
                                content_preview=content_text[:50],
                            )
                            message = service.add_message(
                                thread_id, user_id, "assistant", content_text
                            )
                            # Force commit to save before session closes
                            if message:
                                session.commit()
                                logger.info(
                                    "Assistant message committed to database",
                                    message_id=message.id,
                                )
        except Exception as e:
            logger.error(
                "Failed to save thread item",
                error=str(e),
                item_type=getattr(item, "type", "unknown"),
                thread_id=thread_id,
                traceback=True,
            )

    async def save_item(self, thread_id: str, item: ThreadItem, context: dict) -> None:
        logger.info(
            "=== CHATKIT SAVE_ITEM CALLED ===",
            thread_id=thread_id,
            item_type=getattr(item, "type", "unknown"),
            user_id=self.user_id[:8] + "...",
        )
        await self.add_thread_item(thread_id, item, context)
        logger.info(
            "=== CHATKIT SAVE_ITEM COMPLETED ===",
            thread_id=thread_id,
            user_id=self.user_id[:8] + "...",
        )

    async def load_item(
        self, thread_id: str, item_id: str, context: dict
    ) -> ThreadItem:
        user_id = context.get("user_id") or self.user_id
        with self._get_session() as session:
            from sqlalchemy import select
            from src.models.message import Message
            statement = select(Message).where(
                Message.id == item_id,
                Message.conversation_id == thread_id,
                Message.user_id == user_id
            )
            msg = session.execute(statement).scalar_one_or_none()

            if not msg:
                logger.warning("Message not found", item_id=item_id, thread_id=thread_id)
                raise KeyError(f"Message {item_id} not found")

            if msg.role == "user":
                return UserMessageItem(
                    id=msg.id,
                    thread_id=thread_id,
                    type="user_message",
                    content=[
                        UserMessageTextContent(type="input_text", text=msg.content)
                    ],
                    created_at=msg.created_at,
                    inference_options=InferenceOptions(),
                )
            else:
                return AssistantMessageItem(
                    id=msg.id,
                    thread_id=thread_id,
                    type="assistant_message",
                    content=[
                        AssistantMessageContent(type="output_text", text=msg.content)
                    ],
                    created_at=msg.created_at,
                )

    async def delete_thread_item(
        self, thread_id: str, item_id: str, context: dict
    ) -> None:
        user_id = context.get("user_id") or self.user_id
        with self._get_session() as session:
            from sqlalchemy import select
            from src.models.message import Message
            statement = select(Message).where(
                Message.id == item_id,
                Message.conversation_id == thread_id,
                Message.user_id == user_id
            )
            msg = session.execute(statement).scalar_one_or_none()
            if msg:
                session.delete(msg)
                session.commit()
                logger.info("Deleted message", item_id=item_id, thread_id=thread_id)

    async def load_threads(
        self,
        limit: int,
        after: Optional[str],
        order: str,
        context: dict,
    ) -> Page[ThreadMetadata]:
        """Load multiple threads for a user"""
        try:
            user_id = context.get("user_id") or self.user_id
            logger.info(
                "=== LOAD_THREADS CALLED ===",
                user_id=user_id[:8] + "..." if user_id else "NO_USER_ID",
                limit=limit,
                after=after,
                order=order,
                context_keys=list(context.keys()) if context else [],
            )

            with self._get_session() as session:
                service = ConversationService(session)
                conversations = service.get_user_conversations(user_id)

                logger.info(
                    "LOAD_THREADS: Found conversations",
                    user_id=user_id[:8] + "...",
                    conversation_count=len(conversations),
                )

                # Convert to ThreadMetadata
                threads = [
                    ThreadMetadata(
                        id=conv.id,
                        created_at=conv.created_at,
                        title=conv.title or "New Conversation",
                        metadata={
                            "title": conv.title or "New Conversation",
                            "updated_at": conv.updated_at.isoformat() if conv.updated_at else None
                        }
                    )
                    for conv in conversations
                ]

                logger.info(
                    "LOAD_THREADS: Returning threads",
                    thread_count=len(threads),
                    thread_ids=[t.id[:8] + "..." for t in threads],
                )

                # Apply pagination if needed
                if after:
                    # Find index of 'after' thread and slice from there
                    after_idx = next(
                        (i for i, t in enumerate(threads) if t.id == after), -1
                    )
                    if after_idx != -1:
                        threads = threads[after_idx + 1 :]

                if limit and len(threads) > limit:
                    threads = threads[:limit]

                return Page(data=threads, has_more=False)

        except Exception as e:
            logger.error(
                "LOAD_THREADS: Failed",
                error=str(e),
                user_id=user_id[:8] + "..." if user_id else "NO_USER_ID",
                traceback=True,
            )
            # Return empty page on error to prevent complete failure
            return Page(data=[], has_more=False)


    async def delete_thread(self, thread_id: str, context: dict) -> None:
        """Delete a thread (conversation)"""
        user_id = context.get("user_id") or self.user_id
        logger.info("Delete thread requested", thread_id=thread_id, user_id=user_id)
        with self._get_session() as session:
            service = ConversationService(session)
            success = service.delete_conversation(thread_id, user_id)
            if success:
                logger.info("Thread deleted successfully", thread_id=thread_id)
            else:
                logger.warning("Thread not found or delete failed", thread_id=thread_id)

    async def load_attachment(self, attachment_id: str, context: dict):
        """Load an attachment by ID"""
        raise NotImplementedError("Attachments not supported in this implementation")

    async def save_attachment(self, attachment, context: dict) -> None:
        """Save an attachment"""
        raise NotImplementedError("Attachments not supported in this implementation")

    async def delete_attachment(self, attachment_id: str, context: dict) -> None:
        """Delete an attachment"""
        raise NotImplementedError("Attachments not supported in this implementation")


class TaskChatKitServer(ChatKitServer[dict]):
    def __init__(self, data_store: Store, user_id: str):
        super().__init__(data_store)
        self.user_id = user_id

        # Use factory to create model
        self.model = create_model()

        # Setup MCP Server configuration for the agent
        from agents.mcp import MCPServerStdio
        from pathlib import Path

        # Dynamically determine the backend root directory
        current_file = Path(__file__).resolve()
        backend_root = str(current_file.parent.parent.parent)

        # Configure MCP server instance with per-user environment
        self.mcp_server = MCPServerStdio(
            {
                "command": "python3",
                "args": ["-m", "src.mcp.server"],
                "env": {
                    **os.environ,
                    "PYTHONPATH": backend_root,
                    "USER_ID": user_id,
                    "RUNNING_AS_MCP_SERVER": "true",  # Suppress stdout logging that breaks JSON-RPC
                },
            },
            client_session_timeout_seconds=60,  # Increased timeout for database operations
        )

        # Setup Agent with MCP tools - using OpenAIChatCompletionsModel
        self.agent = Agent(
            name="Task Assistant",
            instructions=(
                "You are a helpful task management assistant. Use the available tools to help users manage their todo lists. "
                "Always respond in a friendly, conversational way. Confirm actions taken.\n\n"
                "## Task Creation Guidelines:\n"
                "When creating a task, ALWAYS provide a detailed, descriptive description even if the user only gives you a title. "
                "Your description should:\n"
                "- Expand on the task title with specific, actionable details\n"
                "- Provide context about what needs to be done and why\n"
                "- Include any relevant steps, considerations, or requirements\n"
                "- Be clear and comprehensive so anyone reading it understands the full scope\n"
                "- Use 2-4 sentences that add meaningful information beyond the title\n\n"
                "When creating tasks, also intelligently assign:\n"
                "- **Priority**: 'high' (urgent/important), 'medium' (normal), 'low' (optional/non-urgent)\n"
                "- **Category**: 'work', 'personal', 'study', 'health', or 'finance'\n"
                "- **Due Date**: If the user mentions a deadline or timeframe\n\n"
                "Examples:\n"
                "- 'Buy groceries' → Priority: medium, Category: personal, Description: 'Purchase weekly groceries including fresh vegetables, fruits, dairy products, and pantry staples. Check the refrigerator before shopping to avoid duplicates. Remember to bring reusable bags and check for any sales or coupons.'\n"
                "- 'Fix login bug' → Priority: high, Category: work, Description: 'Investigate and resolve the authentication issue where users are unable to log in with valid credentials. Review the JWT token validation logic, check database connection for user verification, and test with multiple user accounts to ensure the fix works consistently.'\n"
                "- 'Call dentist' → Priority: medium, Category: health, Description: 'Schedule a dental appointment for routine cleaning and checkup. Request an appointment in the next 2-3 weeks, preferably in the morning. Confirm insurance coverage and bring insurance card to the appointment.'\n\n"
                "## Task Filtering:\n"
                "Users can filter tasks using list_tasks with these filters:\n"
                "- **Status**: 'all', 'active', 'pending', 'completed'\n"
                "- **Priority**: 'high', 'medium', 'low'\n"
                "- **Date**: 'today', 'tomorrow', 'this week', 'overdue', 'no due date'\n"
                "- **Category**: 'work', 'personal', 'study', 'health', 'finance'\n\n"
                "When users ask to see specific types of tasks, use the appropriate filter:\n"
                "- 'Show my work tasks' → list_tasks(status='work')\n"
                "- 'What's due today?' → list_tasks(status='today')\n"
                "- 'Show high priority tasks' → list_tasks(status='high')\n"
                "- 'What's overdue?' → list_tasks(status='overdue')\n\n\n\n"
                "## Task Management:\n"
                "- If a user asks to mark a task as completed or delete a task, first use list_tasks to find the task ID (use the 1-based index if provided)\n"
                "- When listing tasks, present them in a clear, organized format\n"
                "- Confirm all actions taken and provide helpful feedback"
            ),
            model=self.model,
            mcp_servers=[self.mcp_server],
        )
        self.converter = ThreadItemConverter()

    async def respond(
        self, thread: ThreadMetadata, input: Any, context: dict
    ) -> AsyncIterator:
        # NOTE: User messages are saved by the SDK in _process_new_thread_item_respond
        # Assistant messages are saved by the SDK in _process_events when ThreadItemDoneEvent is received
        # We do NOT need to manually save messages here

        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )

        try:
            # Load all thread items for context
            page = await self.store.load_thread_items(
                thread.id, None, 100, "asc", context
            )
            all_items = list(page.data)
            if input:
                all_items.append(input)

            agent_input = await self.converter.to_agent_input(all_items)

            # Build history string for context-aware agent
            history_content = []
            for item in all_items[:-1]:  # Exclude current input
                item_role = getattr(item, "role", None)
                item_content = getattr(item, "content", None)

                if item_role and item_content:
                    if isinstance(item_content, list) and len(item_content) > 0:
                        content_obj = item_content[0]
                        if hasattr(content_obj, "text"):
                            content_text = getattr(
                                content_obj, "text", str(content_obj)
                            )
                        else:
                            content_text = str(content_obj)
                    elif isinstance(item_content, str):
                        content_text = item_content
                    else:
                        continue

                    role = getattr(item, "role", "user")
                    history_content.append(f"{role}: {content_text}")

            history_str = "\n".join(history_content)

            # Create contextual agent with updated instructions that include conversation history
            updated_instructions = (
                (f"Previous conversation:\n{history_str}\n\n" if history_str else "")
                + f"You are a helpful task management assistant for user with ID {self.user_id}.\n"
                + "Use the available tools to help users manage their todo lists. "
                + "Always respond in a friendly, conversational way. Confirm actions taken.\n\n"
                + "## Task Creation Guidelines:\n"
                + "When creating a task, ALWAYS provide a detailed, descriptive description even if the user only gives you a title. "
                + "Your description should:\n"
                + "- Expand on the task title with specific, actionable details\n"
                + "- Provide context about what needs to be done and why\n"
                + "- Include any relevant steps, considerations, or requirements\n"
                + "- Be clear and comprehensive so anyone reading it understands the full scope\n"
                + "- Use 2-4 sentences that add meaningful information beyond the title\n\n"
                + "When creating tasks, also intelligently assign:\n"
                + "- **Priority**: 'high' (urgent/important), 'medium' (normal), 'low' (optional/non-urgent)\n"
                + "- **Category**: 'work', 'personal', 'study', 'health', or 'finance'\n"
                + "- **Due Date**: If the user mentions a deadline or timeframe (use ISO format YYYY-MM-DD)\n\n"
                + "Examples:\n"
                + "- 'Buy groceries' → Priority: medium, Category: personal, Description: 'Purchase weekly groceries including fresh vegetables, fruits, dairy products, and pantry staples. Check the refrigerator before shopping to avoid duplicates. Remember to bring reusable bags and check for any sales or coupons.'\n"
                + "- 'Fix login bug' → Priority: high, Category: work, Description: 'Investigate and resolve the authentication issue where users are unable to log in with valid credentials. Review the JWT token validation logic, check database connection for user verification, and test with multiple user accounts to ensure the fix works consistently.'\n"
                + "- 'Call dentist' → Priority: medium, Category: health, Description: 'Schedule a dental appointment for routine cleaning and checkup. Request an appointment in the next 2-3 weeks, preferably in the morning. Confirm insurance coverage and bring insurance card to the appointment.'\n\n"
                + "## Task Filtering:\n"
                + "Users can filter tasks using list_tasks with these filters:\n"
                + "- **Status**: 'all', 'active', 'pending', 'completed'\n"
                + "- **Priority**: 'high', 'medium', 'low'\n"
                + "- **Date**: 'today', 'tomorrow', 'this week', 'overdue', 'no due date'\n"
                + "- **Category**: 'work', 'personal', 'study', 'health', 'finance'\n\n"
                + "When users ask to see specific types of tasks, use the appropriate filter:\n"
                + "- 'Show my work tasks' → list_tasks(status='work')\n"
                + "- 'What's due today?' → list_tasks(status='today')\n"
                + "- 'Show high priority tasks' → list_tasks(status='high')\n"
                + "- 'What's overdue?' → list_tasks(status='overdue')\n\n\n\n"
                + "## Task Management:\n"
                + "- If a user asks to mark a task as completed or delete a task, first use list_tasks to find the task ID (use the 1-based index if provided)\n"
                + "- When listing tasks, present them in a clear, organized format\n"
                + "- Confirm all actions taken and provide helpful feedback"
            )

            # Create contextual agent with updated instructions
            contextual_agent = Agent(
                name="Task Assistant",
                instructions=updated_instructions,
                model=self.model,  # Use model instance from factory
                mcp_servers=[self.mcp_server],
            )

            from agents.run import RunConfig

            assistant_content = ""

            # Run agent with MCP server active
            async with self.mcp_server:
                result = Runner.run_streamed(
                    contextual_agent,
                    agent_input,
                    run_config=RunConfig(
                        tracing_disabled=True  # Disable OpenAI tracing to avoid API key conflicts
                    ),
                )

                async for event in stream_agent_response(agent_context, result):
                    # Accumulate assistant content from streaming events
                    event_str = str(event) if not isinstance(event, str) else event
                    if (
                        "content" in event_str.lower()
                        or "output_text" in event_str.lower()
                    ):
                        # Try to extract text content
                        if hasattr(event, "content") and event.content:
                            if (
                                isinstance(event.content, list)
                                and len(event.content) > 0
                            ):
                                content_obj = event.content[0]
                                if hasattr(content_obj, "text"):
                                    assistant_content += getattr(
                                        content_obj, "text", ""
                                    )
                                elif hasattr(content_obj, "text_value"):
                                    assistant_content += getattr(
                                        content_obj, "text_value", ""
                                    )
                    yield event

            # Save assistant message to database after stream completes
            # NOTE: Assistant messages are saved by the SDK in _process_events
            # when ThreadItemDoneEvent is received with the assistant's response
            # We do NOT need to manually save messages here

        except Exception as e:
            # Log the error and let ChatKit handle it
            error_message = str(e)
            logger.error(
                "Error in agent response", error=error_message, user_id=self.user_id
            )

            # Raise the exception to let ChatKit's error handling deal with it
            raise


@router.post("/")
@router.post("")
async def chatkit_endpoint(
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    """
    ChatKit endpoint with proper session management for both streaming and non-streaming responses.

    For streaming responses, we need to ensure the session stays open until the stream is fully consumed.
    The key insight is that FastAPI's Depends() closes the session when the endpoint returns,
    but for StreamingResponse, we need the session to remain open during streaming.

    Solution: Use asynccontextmanager to properly handle session lifecycle for streaming.
    """
    from contextlib import asynccontextmanager
    from src.database.database import get_engine
    from sqlalchemy import text

    logger.info("=== CHATKIT ENDPOINT START ===", user_id=user_id[:8] + "...")

    @asynccontextmanager
    async def session_lifecycle():
        """Ensure session stays open during streaming"""
        engine = get_engine()
        if engine is None:
            raise Exception("Database engine not available")

        db_session = Session(engine)
        try:
            db_session.execute(text("SELECT 1"))
            yield db_session
        except Exception:
            db_session.rollback()
            raise
        finally:
            try:
                db_session.close()
            except Exception:
                pass

    async with session_lifecycle() as session:
        store = ConversationStore(user_id)
        logger.info("Created ConversationStore", user_id=user_id[:8] + "...")

        # Create server instance per request to ensure proper user context in MCP
        server = TaskChatKitServer(store, user_id)
        logger.info("Created TaskChatKitServer", user_id=user_id[:8] + "...")

        body = await request.body()
        body_str = body.decode("utf-8", errors="replace")

        # Log request details for debugging
        try:
            body_json = json.loads(body)
            request_type = body_json.get("type", "unknown")
            action = body_json.get("action", "unknown")
            thread_id = body_json.get("params", {}).get("thread", {}).get("id", None)

            logger.info(
                "CHATKIT REQUEST",
                user_id=user_id[:8] + "...",
                request_type=request_type,
                action=action,
                thread_id=thread_id,
                body_size=len(body),
            )
        except Exception:
            logger.info(
                "CHATKIT REQUEST (parse failed)",
                user_id=user_id[:8] + "...",
                body_preview=body_str[:200],
            )

        # Parse the body to extract metadata if available
        try:
            body_json = json.loads(body)
            thread_id = (
                body_json.get("params", {}).get("thread", {}).get("id", "unknown")
            )
            action = body_json.get("action", "unknown")
            logger.info(
                "Parsed request",
                action=action,
                thread_id=thread_id,
                user_id=user_id[:8] + "...",
            )

            metadata = body_json.get("params", {}).get("input", {}).get("metadata", {})
            user_info = metadata.get("userInfo", {})
            page_context = metadata.get("pageContext", {})

            # Add user info and page context to the context
            context = {
                "user_id": user_id,
                "user_info": user_info,
                "page_context": page_context,
            }
        except Exception as e:
            logger.error(
                "Failed to parse body", error=str(e), user_id=user_id[:8] + "..."
            )
            context = {"user_id": user_id}

        logger.info("Calling server.process()", user_id=user_id[:8] + "...")

        try:
            result = await server.process(body, context)
            logger.info(
                "=== CHATKIT ENDPOINT COMPLETED ===", user_id=user_id[:8] + "..."
            )
        except Exception as e:
            logger.error(
                "ChatKit processing error",
                error=str(e),
                user_id=user_id,
                traceback=True,
            )
            # Return a proper error response in ChatKit format
            error_response = {
                "error": {
                    "message": str(e)
                    or "An error occurred while processing your request",
                    "code": "INTERNAL_ERROR",
                }
            }
            return Response(
                content=json.dumps(error_response),
                media_type="application/json",
                status_code=500,
            )

        if isinstance(result, StreamingResult):
            return StreamingResponse(result, media_type="text/event-stream")
        return Response(content=result.json, media_type="application/json")


@router.post("/session")
async def chatkit_session(user_id: str = Depends(get_current_user_id)):
    """
    Create a ChatKit session for the authenticated user.
    Returns session credentials including domain key and client secret.
    """
    import secrets

    # Generate a secure session token
    client_secret = secrets.token_urlsafe(32)

    # Get domain key from environment
    domain_key = os.getenv("CHATKIT_DOMAIN_KEY", "local-dev")

    logger.info(
        "ChatKit session created",
        user_id=user_id,
        domain_key=domain_key,
    )

    return {
        "client_secret": client_secret,
        "domain_key": domain_key,
        "expires_in": 3600,
        "user_id": user_id,  # Include user_id for frontend reference
        "status": "active",
    }


@router.post("/upload")
async def chatkit_upload(
    request: Request,
    user_id: str = Depends(get_current_user_id),
):
    """
    Handle file uploads for ChatKit.
    Currently not implemented - returns 501 Not Implemented.
    """
    logger.warning("File upload attempted but not implemented", user_id=user_id)
    raise HTTPException(
        status_code=501,
        detail="File uploads are not currently supported. Please contact support if you need this feature.",
    )


@router.post("/debug/conversation")
async def debug_create_conversation(
    request: Request,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """
    Debug endpoint to create a test conversation and message.
    """
    try:
        service = ConversationService(session)

        # Create a test conversation
        conversation = service.create_conversation(user_id)

        # Add a test message
        test_message = service.add_message(
            conversation.id, user_id, "user", "Test message from debug endpoint"
        )

        return {
            "status": "success",
            "conversation_id": conversation.id,
            "message_id": test_message.id if test_message else None,
        }
    except Exception as e:
        logger.error("Debug endpoint error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/debug/threads")
async def debug_load_threads(
    request: Request,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """
    Debug endpoint to load threads - mimics what ChatKit SDK does.
    """
    try:
        logger.info(
            "DEBUG: Loading threads",
            user_id=user_id[:8] + "...",
            headers=dict(request.headers),
        )

        service = ConversationService(session)
        store = ConversationStore(user_id)

        # Call load_threads
        result = await store.load_threads(
            limit=50,
            after=None,
            order="desc",
            context={"user_id": user_id},
        )

        threads_data = []
        for thread in result.data:
            # Also load messages for each thread
            messages_result = await store.load_thread_items(
                thread_id=thread.id,
                after=None,
                limit=100,
                order="asc",
                context={"user_id": user_id},
            )

            messages = []
            for item in messages_result.data:
                item_type = getattr(item, "type", "unknown")
                content_list = getattr(item, "content", [])
                content_text = ""
                if content_list and len(content_list) > 0:
                    content_obj = content_list[0]
                    content_text = getattr(content_obj, "text", str(content_obj))

                messages.append(
                    {
                        "id": item.id,
                        "type": item_type,
                        "content": content_text,
                        "created_at": str(item.created_at) if item.created_at else None,
                    }
                )

            threads_data.append(
                {
                    "id": thread.id,
                    "created_at": str(thread.created_at) if thread.created_at else None,
                    "message_count": len(messages),
                    "messages": messages,
                }
            )

        return {
            "status": "success",
            "user_id": user_id,
            "thread_count": len(threads_data),
            "threads": threads_data,
        }
    except Exception as e:
        logger.error("Debug threads endpoint error", error=str(e), traceback=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def chatkit_health():
    return {"status": "ok", "service": "chatkit"}
