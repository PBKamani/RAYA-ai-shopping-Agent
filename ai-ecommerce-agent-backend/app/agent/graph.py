"""
LangGraph workflow definition for the RAYA ATELIER AI Shopping Concierge.

Architecture:
  START -> agent -> should_continue? -> tools -> agent -> ... -> END

The agent node invokes the LLM (Ollama llama3.1:8b) which can request tool calls.
The tool node executes the requested tool and returns results.
The loop continues until the LLM produces a final text response with no tool calls.
"""
import logging
from langgraph.graph import StateGraph, END

from .state import AgentState
from .nodes import create_agent_node, create_tool_node, should_continue

logger = logging.getLogger("raya_atelier_agent")


def build_agent_graph():
    """
    Builds and compiles the LangGraph agent workflow.

    Graph:
        START -> agent -> [should_continue]
                            ├─ "tools" -> tool_node -> agent (loop)
                            └─ "end"   -> END
    """
    # Import tools here to avoid circular imports at module level
    from .tools import all_tools

    if not all_tools:
        logger.warning("No agent tools registered — the agent will have no capabilities.")

    # Create node functions
    agent_node = create_agent_node(all_tools)
    tool_node = create_tool_node(all_tools)

    # Build the state graph
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("agent", agent_node)
    graph.add_node("tools", tool_node)

    # Set entry point
    graph.set_entry_point("agent")

    # Add conditional edge from agent: route to tools or end
    graph.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "end": END,
        },
    )

    # After tools execute, always go back to the agent for interpretation
    graph.add_edge("tools", "agent")

    # Compile the graph
    compiled = graph.compile()
    logger.info(f"Agent graph compiled with {len(all_tools)} tools: {[t.name for t in all_tools]}")
    return compiled


# Module-level compiled graph (lazy singleton)
_compiled_graph = None


def get_agent_graph():
    """Returns the compiled agent graph, building it on first call."""
    global _compiled_graph
    if _compiled_graph is None:
        _compiled_graph = build_agent_graph()
    return _compiled_graph
