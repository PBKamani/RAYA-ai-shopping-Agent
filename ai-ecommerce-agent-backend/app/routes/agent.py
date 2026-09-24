"""
Agent chat API route for the RAYA ATELIER AI Shopping Concierge.

POST /api/agent/chat
"""
import uuid
import logging
from typing import Optional, List, Any

from fastapi import APIRouter, status, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from langchain_core.messages import HumanMessage, AIMessage

from ..agent.graph import get_agent_graph
from ..database import SessionLocal
from ..models.product import Product
from ..services.cart_service import CartService
from ..utils.auth import decode_access_token

logger = logging.getLogger("raya_atelier_agent")

router = APIRouter(prefix="/agent", tags=["AI Agent"])

# In-memory conversation store (keyed by conversation_id)
_conversations: dict[str, list] = {}


class ChatRequest(BaseModel):
    user_id: Optional[int] = Field(1, description="Authenticated user ID")
    conversation_id: Optional[str] = Field(None, description="Session ID for multi-turn conversations")
    message: str = Field(..., min_length=1, description="User message")
    history: Optional[List[Any]] = Field(default=None, description="Frontend chat history (optional)")
    context: Optional[dict] = Field(default=None, description="Frontend contextual metadata (optional)")


class ChatResponse(BaseModel):
    success: bool = True
    conversation_id: str
    message: str
    products: List[Any] = []
    cart_updated: bool = False
    cart: Optional[dict] = None
    requires_clarification: bool = False
    # Frontend aliases for seamless backward compatibility
    reply: Optional[str] = None
    recommendedProducts: Optional[List[Any]] = None
    suggestedQuestions: Optional[List[str]] = None


def extract_product_ids_from_response(text: str) -> list[int]:
    """
    Extract product IDs mentioned in the agent's response or tool outputs.
    Looks for patterns like 'ID: 1163' or 'product_id: 1163' in the conversation.
    """
    import re
    ids = []
    for match in re.finditer(r'(?:ID|id|Product|product_id)[:\s#]*(\d{3,5})', text):
        try:
            ids.append(int(match.group(1)))
        except ValueError:
            pass
    return list(dict.fromkeys(ids))  # deduplicate preserving order


def fetch_products_for_frontend(product_ids: list[int]) -> list[dict]:
    """Fetch product details from DB for the frontend product cards."""
    if not product_ids:
        return []
    db = SessionLocal()
    try:
        products = db.query(Product).filter(Product.id.in_(product_ids)).all()
        result = []
        for p in products:
            result.append({
                "id": p.id,
                "title": p.title,
                "name": p.title,
                "brand": p.brand,
                "gender": p.gender,
                "masterCategory": p.master_category,
                "subCategory": p.sub_category,
                "articleType": p.article_type,
                "colour": p.colour,
                "season": p.season,
                "year": p.year,
                "usage": p.usage,
                "price": p.price,
                "originalPrice": p.original_price,
                "rating": p.rating,
                "reviewsCount": p.reviews_count,
                "image": p.image,
                "description": p.description,
                "fabric": p.fabric,
                "stock": p.stock_count,
                "stockCount": p.stock_count,
                "inStock": p.in_stock,
                "sizes": p.sizes or [],
                "tags": [],
            })
        id_order = {pid: i for i, pid in enumerate(product_ids)}
        result.sort(key=lambda x: id_order.get(x["id"], 999))
        return result[:6]
    finally:
        db.close()


@router.post("/chat", response_model=ChatResponse)
async def agent_chat(request: ChatRequest, raw_request: Request):
    """
    Main AI Shopping Concierge endpoint.
    Executes the user query through the LangGraph agent with real database tools.
    """
    try:
        # Check for Authorization header to resolve user ID accurately
        user_id = request.user_id or 1
        auth_header = raw_request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            payload = decode_access_token(token)
            if payload and "sub" in payload:
                user_id = int(payload["sub"])
                logger.info(f"[AUTH] Resolved authenticated user_id={user_id} from Bearer token")

        logger.info(f"[AGENT] User {user_id} message: '{request.message}'")

        # Resolve conversation ID
        conv_id = request.conversation_id or str(uuid.uuid4())

        # Retrieve or initialize conversation history
        if conv_id not in _conversations:
            _conversations[conv_id] = []

        history = _conversations[conv_id]

        # Add user message
        user_msg = HumanMessage(content=request.message)
        history.append(user_msg)

        # Build initial state for LangGraph
        initial_state = {
            "messages": list(history),
            "user_id": user_id,
            "conversation_id": conv_id,
        }

        # Invoke the compiled LangGraph agent
        graph = get_agent_graph()
        result = await _invoke_graph(graph, initial_state)

        # Extract the final AI message and detect executed tools
        final_messages = result.get("messages", [])
        ai_response_text = ""
        all_messages_text = ""
        executed_tool_names = set()

        for msg in final_messages:
            if hasattr(msg, "content") and msg.content:
                all_messages_text += " " + str(msg.content)
            if hasattr(msg, "tool_calls") and msg.tool_calls:
                for tc in msg.tool_calls:
                    tool_name = tc.get("name")
                    executed_tool_names.add(tool_name)
                    logger.info(f"[TOOL] Selected tool: {tool_name}, args: {tc.get('args')}")
            elif getattr(msg, "name", None):
                executed_tool_names.add(msg.name)

        # Get the last AIMessage as the response
        for msg in reversed(final_messages):
            if isinstance(msg, AIMessage) and msg.content and not getattr(msg, "tool_calls", None):
                ai_response_text = msg.content
                break

        if not ai_response_text:
            for msg in reversed(final_messages):
                if hasattr(msg, "content") and msg.content:
                    ai_response_text = str(msg.content)
                    break

        if not ai_response_text:
            ai_response_text = "I have checked our atelier archives for you. How may I assist your style search further?"

        # Update conversation history with the final AI message
        history.append(AIMessage(content=ai_response_text))

        # Keep conversation history manageable (last 20 messages)
        if len(history) > 20:
            _conversations[conv_id] = history[-20:]

        # Extract product IDs from conversation for UI cards
        product_ids = extract_product_ids_from_response(all_messages_text)
        products = fetch_products_for_frontend(product_ids)

        # Authoritative Cart State Detection
        cart_mutation_tools = {"add_to_cart", "remove_from_cart", "update_cart_quantity", "clear_cart"}
        cart_updated = bool(executed_tool_names & cart_mutation_tools)
        cart_payload = None

        # Fetch authoritative database cart if mutated or if get_cart was called
        if cart_updated or "get_cart" in executed_tool_names:
            db = SessionLocal()
            try:
                cart_details = CartService.get_cart_details(db=db, user_id=user_id)
                cart_payload = {
                    "items": [
                        {
                            "cart_item_id": str(item["id"]),
                            "id": item["id"],
                            "product_id": item["product_id"],
                            "title": item["product"].title if item.get("product") else "",
                            "name": item["product"].title if item.get("product") else "",
                            "brand": item["product"].brand if item.get("product") else "",
                            "price": item["product"].price if item.get("product") else 0.0,
                            "quantity": item["quantity"],
                            "size": item.get("selected_size") or "M",
                            "color": item["product"].colour if item.get("product") else "Natural",
                            "image": item["product"].image if item.get("product") else "",
                            "item_subtotal": item["item_subtotal"],
                            "product": {
                                "id": item["product"].id,
                                "title": item["product"].title,
                                "name": item["product"].title,
                                "brand": item["product"].brand,
                                "price": item["product"].price,
                                "image": item["product"].image,
                                "colour": item["product"].colour,
                                "sizes": item["product"].sizes or [],
                            } if item.get("product") else None,
                        }
                        for item in cart_details.get("items", [])
                    ],
                    "item_count": cart_details.get("total_quantity", 0),
                    "subtotal": cart_details.get("subtotal", 0.0),
                    "estimated_shipping": cart_details.get("estimated_shipping", 0.0),
                    "total": cart_details.get("total", 0.0),
                }
                logger.info(f"[CART] Authoritative cart synchronized: {cart_payload['item_count']} items, total: ${cart_payload['total']}")
            finally:
                db.close()

        # Clarification detection
        clarification_patterns = ["what type", "which one", "could you clarify", "would you prefer",
                                  "are you looking for men", "are you looking for women"]
        requires_clarification = any(p in ai_response_text.lower() for p in clarification_patterns)

        suggested_questions = [
            "Show pieces on sale",
            "What's in my shopping bag?",
            "Recommend an outfit",
            "Help me decide between styles",
        ]

        return ChatResponse(
            success=True,
            conversation_id=conv_id,
            message=ai_response_text,
            products=products,
            cart_updated=cart_updated,
            cart=cart_payload,
            requires_clarification=requires_clarification,
            reply=ai_response_text,
            recommendedProducts=products,
            suggestedQuestions=suggested_questions,
        )

    except Exception as exc:
        logger.error(f"[AGENT] Error: {type(exc).__name__}: {exc}")
        error_msg = str(exc).lower()
        if "connection" in error_msg or "refused" in error_msg or "timeout" in error_msg:
            return JSONResponse(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content={
                    "success": False,
                    "conversation_id": request.conversation_id or "",
                    "message": "The AI Concierge service is currently connecting. Please ensure Ollama is running with llama3.1:8b.",
                    "products": [],
                    "cart_updated": False,
                    "cart": None,
                    "requires_clarification": False,
                },
            )

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "conversation_id": request.conversation_id or "",
                "message": "I encountered an issue accessing the atelier archive. Please try again.",
                "products": [],
                "cart_updated": False,
                "cart": None,
                "requires_clarification": False,
            },
        )


async def _invoke_graph(graph, state: dict) -> dict:
    """Invoke the LangGraph compiled graph synchronously."""
    try:
        result = graph.invoke(state)
        return result
    except Exception as exc:
        logger.error(f"[AGENT] Graph invocation error: {type(exc).__name__}: {exc}")
        raise
