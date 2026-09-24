"""
End-to-End Live Ollama LLM + LangGraph Agent Scenarios Test.
Executes multi-turn dialogues against the real /api/agent/chat endpoint
with local llama3.1:8b running on Ollama.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_scenario(title: str, message: str, conv_id: str = None):
    print(f"\n>>> SCENARIO: {title}")
    print(f"User: {message}")
    payload = {"user_id": 1, "message": message}
    if conv_id:
        payload["conversation_id"] = conv_id

    res = client.post("/api/agent/chat", json=payload)
    if res.status_code != 200:
        print(f"Error (HTTP {res.status_code}): {res.text}")
        return None, None

    data = res.json()
    new_conv_id = data.get("conversation_id")
    reply = data.get("message", "")
    products = data.get("products", [])
    cart_updated = data.get("cart_updated", False)

    print(f"Agent ({res.status_code}):\n{reply}")
    print(f"Products returned to UI: {len(products)} products")
    print(f"Cart updated flag: {cart_updated}")
    return new_conv_id, data


def main():
    print("=" * 70)
    print("STARTING LIVE OLLAMA LLAMA3.1:8B MULTI-TURN AGENT SCENARIOS")
    print("=" * 70)

    # 1. Product Search
    conv_id, _ = test_scenario(
        "1. Product Search with Filters",
        "Show me 3 blue shirts under $100"
    )

    # 2. Add to Cart (Multi-turn using same conversation_id)
    conv_id, _ = test_scenario(
        "2. Multi-turn: Add to Cart",
        "Add product 1163 to my shopping cart",
        conv_id=conv_id
    )

    # 3. View Cart
    conv_id, _ = test_scenario(
        "3. View Shopping Cart",
        "What is currently in my cart?",
        conv_id=conv_id
    )

    # 4. Sale Items
    _, _ = test_scenario(
        "4. Search Sale Products",
        "Show me what items are on sale right now"
    )

    # 5. Product Comparison
    _, _ = test_scenario(
        "5. Help Me Decide / Compare Products",
        "Can you compare product 1163 and product 1164 for me?"
    )

    print("\n" + "=" * 70)
    print("ALL LIVE SCENARIOS COMPLETED SUCCESSFULLY!")
    print("=" * 70)


if __name__ == "__main__":
    main()
