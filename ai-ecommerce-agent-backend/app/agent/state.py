"""
LangGraph Agent State definition for RAYA ATELIER AI Shopping Concierge.
"""
from typing import TypedDict, Annotated, Optional, Any
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """
    Conversation state flowing through the LangGraph nodes.
    - messages: Full conversation history (LangChain HumanMessage/AIMessage/ToolMessage).
    - user_id: Authenticated user performing the request.
    - conversation_id: Session identifier for multi-turn continuity.
    """
    messages: Annotated[list[BaseMessage], add_messages]
    user_id: int
    conversation_id: str
