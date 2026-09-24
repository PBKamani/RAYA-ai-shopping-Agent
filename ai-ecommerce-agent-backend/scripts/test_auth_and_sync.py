"""
Test script for Authentication, Cart Synchronization, and 20 Tools verification.
"""
import sys
import os
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.agent.tools import all_tools
from app.agent.tools.cart_tools import add_to_cart, get_cart, remove_from_cart, clear_cart
from app.agent.tools.product_tools import (
    search_products,
    find_sale_products,
    find_products_by_color,
    find_products_by_budget,
    find_alternatives,
    cross_category_recommendations,
    recommend_products,
)
from app.database import SessionLocal
from app.models.user import User
from app.models.cart import Cart, CartItem

client = TestClient(app)

def test_auth_and_sync():
    print("=" * 70)
    print("TESTING AUTHENTICATION, CART SYNCHRONIZATION & 20 AGENT TOOLS")
    print("=" * 70)

    # 1. Test 20 Tools Export
    print(f"\n[1] Checking Tool Count: {len(all_tools)} tools exported")
    tool_names = [t.name for t in all_tools]
    print(f"    Exported Tools: {', '.join(tool_names)}")
    assert len(all_tools) >= 20, f"Expected at least 20 tools, got {len(all_tools)}"
    print("    [PASS] All 20 AI tools registered successfully.")

    # 2. Test Auth - Demo User Login
    print("\n[2] Testing Demo User Login via /api/auth/login...")
    res = client.post("/api/auth/login", json={"email": "demo@rayaatelier.com", "password": "RayaDemo2026!"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    auth_data = res.json()
    assert "token" in auth_data
    assert auth_data["user"]["email"] == "demo@rayaatelier.com"
    demo_token = auth_data["token"]
    print(f"    [PASS] Demo user logged in. User: {auth_data['user']['name']}, Token: {demo_token[:20]}...")

    # 3. Test Auth - Wrong Password
    print("\n[3] Testing Invalid Credentials -> 401...")
    res = client.post("/api/auth/login", json={"email": "demo@rayaatelier.com", "password": "WrongPassword!"})
    assert res.status_code == 401, f"Expected 401, got {res.status_code}"
    print("    [PASS] Rejected invalid password with 401 Unauthorized.")

    # 4. Test Auth - Token verification via /api/auth/me
    print("\n[4] Testing GET /api/auth/me with Bearer token...")
    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {demo_token}"})
    assert res.status_code == 200, f"Auth me failed: {res.text}"
    user_me = res.json()
    assert user_me["email"] == "demo@rayaatelier.com"
    print(f"    [PASS] Profile retrieved: ID={user_me['id']}, Email={user_me['email']}")

    # 5. Test Auth - User Registration
    import time
    test_email = f"atelier_client_{int(time.time())}@rayaatelier.com"
    print(f"\n[5] Testing User Registration with {test_email}...")
    res = client.post("/api/auth/register", json={
        "name": "Astrid Lindgren",
        "email": test_email,
        "password": "SecurePassword2026!"
    })
    assert res.status_code == 201, f"Register failed: {res.text}"
    reg_data = res.json()
    new_user_id = reg_data["user"]["id"]
    new_token = reg_data["token"]
    print(f"    [PASS] Registered new client: ID={new_user_id}, Name={reg_data['user']['name']}")

    # 6. Test Cart Tools & Authoritative Database State
    print("\n[6] Testing Authoritative Cart Sync with AI Tools...")
    # Clear cart first
    clear_cart.invoke({"user_id": new_user_id})
    cart_check = get_cart.invoke({"user_id": new_user_id})
    assert "empty" in cart_check.lower()
    print("    Cart confirmed empty.")

    # Add product 1163
    add_res = add_to_cart.invoke({"user_id": new_user_id, "product_id": 1163, "quantity": 1})
    print(f"    Add result: {add_res}")
    assert "1163" in add_res or "Nike" in add_res

    # Query cart - MUST reflect product 1163 from PostgreSQL
    cart_check = get_cart.invoke({"user_id": new_user_id})
    assert "1163" in cart_check or "Nike" in cart_check
    print("    [PASS] Tool get_cart queried PostgreSQL and returned added product.")

    # Remove by keyword or product id
    rem_res = remove_from_cart.invoke({"user_id": new_user_id, "item_id": 1163})
    print(f"    Remove result: {rem_res}")

    # Query cart again - MUST BE EMPTY!
    cart_empty = get_cart.invoke({"user_id": new_user_id})
    assert "empty" in cart_empty.lower(), f"Expected empty cart, got: {cart_empty}"
    print("    [PASS] Tool get_cart queried PostgreSQL and verified removed item is gone (no hallucination).")

    # 7. Test Specialized Product Tools
    print("\n[7] Testing Specialized Product Tools...")
    sale_res = find_sale_products.invoke({"limit": 2})
    print(f"    find_sale_products: {sale_res[:80]}...")
    assert "ID:" in sale_res

    color_res = find_products_by_color.invoke({"color": "Black", "limit": 2})
    print(f"    find_products_by_color: {color_res[:80]}...")
    assert "ID:" in color_res

    budget_res = find_products_by_budget.invoke({"max_price": 50, "limit": 2})
    print(f"    find_products_by_budget: {budget_res[:80]}...")
    assert "ID:" in budget_res

    alt_res = find_alternatives.invoke({"product_id": 1163, "limit": 2})
    print(f"    find_alternatives: {alt_res[:80]}...")
    assert "ID:" in alt_res

    recom_res = cross_category_recommendations.invoke({"product_id": 1163, "limit": 2})
    print(f"    cross_category_recommendations: {recom_res[:80]}...")
    assert "ID:" in recom_res

    print("\n" + "=" * 70)
    print("ALL AUTH, CART SYNC, AND 20 AI TOOLS TESTS PASSED!")
    print("=" * 70)

if __name__ == "__main__":
    test_auth_and_sync()
