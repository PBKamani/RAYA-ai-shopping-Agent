"""
LangGraph node functions for the RAYA ATELIER AI Shopping Concierge.
"""
from langchain_core.messages import SystemMessage
from langchain_ollama import ChatOllama
from langgraph.prebuilt import ToolNode

from ..config import settings
from .state import AgentState
from .prompts import SYSTEM_PROMPT


def get_llm(tools: list):
    """
    Create and return a ChatOllama LLM instance bound with the available tools.
    Configuration is read from environment variables via settings (never hardcoded).
    """
    llm = ChatOllama(
        model=settings.OLLAMA_MODEL,
        base_url=settings.OLLAMA_BASE_URL,
        temperature=0.3,
    )
    return llm.bind_tools(tools)


def create_agent_node(tools: list):
    """
    Returns the 'agent' node function that invokes the LLM with the current messages.
    """
    llm_with_tools = get_llm(tools)

    def agent_node(state: AgentState) -> dict:
        messages = state["messages"]
        user_id = state.get("user_id", 1)

        # Prepend system prompt with user context
        system_msg = SystemMessage(
            content=SYSTEM_PROMPT + f"\n\nCurrent user_id: {user_id}"
        )

        response = llm_with_tools.invoke([system_msg] + messages)
        return {"messages": [response]}

    return agent_node


def create_tool_node(tools: list):
    """
    Returns a ToolNode that strictly enforces user boundaries.
    The authenticated user_id from the session state is always injected
    into user-scoped tool calls, guaranteeing zero cross-tenant access.
    """
    tool_node = ToolNode(tools)

    def secure_tool_node(state: AgentState) -> dict:
        user_id = state.get("user_id", 1)
        last_message = state["messages"][-1]

        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            user_scoped_tools = {
                "get_cart",
                "add_to_cart",
                "remove_from_cart",
                "update_cart_quantity",
                "clear_cart",
                "calculate_cart_total",
                "get_wishlist",
                "add_to_wishlist",
                "remove_from_wishlist",
                "check_wishlist",
                "get_order_status",
                "get_user_orders",
            }
            for tc in last_message.tool_calls:
                if tc.get("name") in user_scoped_tools:
                    tc["args"]["user_id"] = user_id

        return tool_node.invoke(state)

    return secure_tool_node


def should_continue(state: AgentState) -> str:
    """
    Conditional edge: checks the last message to decide whether to
    route to tools or end the conversation turn.
    """
    last_message = state["messages"][-1]
    # If the LLM produced tool calls, route to the tool node
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"
    return "end"
