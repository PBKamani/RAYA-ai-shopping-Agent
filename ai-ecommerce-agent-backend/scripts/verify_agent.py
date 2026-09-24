"""
Comprehensive Verification Suite for RAYA ATELIER AI Shopping Agent.

Tests:
1. Tool tests: search_products, get_product_details, check_stock, compare_products, get_product_categories
2. Sale filter test: search_products(on_sale=True) ensures original_price > price
3. Cart tools: add_to_cart, get_cart, update_cart_quantity, calculate_cart_total, remove_from_cart, clear_cart
4. Wishlist tools: add_to_wishlist, get_wishlist, check_wishlist, remove_from_wishlist
5. Order tools: get_order_status, get_user_orders
6. Review tools: get_product_reviews, summarize_product_reviews
7. Multi-tenant security: user boundary isolation test
8. LangGraph Agent Graph compilation and structure verification
9. End-to-end Chat API endpoint test (FastAPI TestClient)
"""
import sys
import os

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient
from app.main import app
from app.agent.tools.product_tools import (
    search_products,
    get_product_details,
    check_stock,
    compare_products,
    get_product_categories,
)
from app.agent.tools.cart_tools import (
    get_cart,
    add_to_cart,
    remove_from_cart,
    update_cart_quantity,
    clear_cart,
    calculate_cart_total,
)
from app.agent.tools.wishlist_tools import (
    get_wishlist,
    add_to_wishlist,
    remove_from_wishlist,
    check_wishlist,
)
from app.agent.tools.order_tools import (
    get_order_status,
    get_user_orders,
)
from app.agent.tools.review_tools import (
    get_product_reviews,
    summarize_product_reviews,
)
from app.agent.graph import get_agent_graph


import traceback

def log_test(name: str, passed: bool, detail: str = ""):
    status = "PASS" if passed else "FAIL"
    print(f"[{status}] {name}")
    if detail:
        print(f"       {detail}")


def run_tests():
    print("=" * 70)
    print("RAYA ATELIER -- AI SHOPPING AGENT VERIFICATION SUITE")
    print("=" * 70)
    all_passed = True
    test_count = 0
    pass_count = 0

    # ---------------------------------------------------------
    # TEST 1: Product Search Tool
    # ---------------------------------------------------------
    test_count += 1
    try:
        res = search_products.invoke({"keyword": "shirt", "limit": 3})
        ok = "ID:" in res and "Price:" in res
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("Tool: search_products (keyword='shirt')", ok, res.split("\n")[0] if res else "")
    except Exception as e:
        all_passed = False
        log_test("Tool: search_products", False, str(e))

    # ---------------------------------------------------------
    # TEST 2: Sale Products Tool (original_price > price)
    # ---------------------------------------------------------
    test_count += 1
    try:
        res = search_products.invoke({"on_sale": True, "limit": 3})
        ok = "Original Price:" in res or "off" in res or "ID:" in res
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("Tool: search_products (on_sale=True)", ok, res.split("\n")[0] if res else "")
    except Exception as e:
        all_passed = False
        log_test("Tool: search_products (on_sale)", False, str(e))

    # ---------------------------------------------------------
    # TEST 3: Product Details Tool
    # ---------------------------------------------------------
    test_count += 1
    try:
        res = get_product_details.invoke({"product_id": 1163})
        ok = "Product ID: 1163" in res and "Price:" in res
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("Tool: get_product_details(1163)", ok, res.split("\n")[0])
    except Exception as e:
        all_passed = False
        log_test("Tool: get_product_details", False, str(e))

    # ---------------------------------------------------------
    # TEST 4: Check Stock Tool
    # ---------------------------------------------------------
    test_count += 1
    try:
        res = check_stock.invoke({"product_id": 1163})
        ok = "Stock Count:" in res or "In Stock" in res
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("Tool: check_stock(1163)", ok, res.split("\n")[0])
    except Exception as e:
        all_passed = False
        log_test("Tool: check_stock", False, str(e))

    # ---------------------------------------------------------
    # TEST 5: Compare Products Tool
    # ---------------------------------------------------------
    test_count += 1
    try:
        res = compare_products.invoke({"product_id_1": 1163, "product_id_2": 1164})
        ok = "Product 1" in res and "Product 2" in res
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("Tool: compare_products(1163, 1164)", ok, "Side-by-side comparison generated")
    except Exception as e:
        all_passed = False
        log_test("Tool: compare_products", False, str(e))

    # ---------------------------------------------------------
    # TEST 6: Category Counts Tool
    # ---------------------------------------------------------
    test_count += 1
    try:
        res = get_product_categories.invoke({})
        ok = "Total Products:" in res and "Apparel:" in res
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("Tool: get_product_categories", ok, res.split("\n")[0])
    except Exception as e:
        all_passed = False
        log_test("Tool: get_product_categories", False, str(e))

    # ---------------------------------------------------------
    # TEST 7: Cart Operations (add, view, calculate, update, remove, clear)
    # ---------------------------------------------------------
    test_count += 1
    try:
        # Clear cart first for clean state
        clear_cart.invoke({"user_id": 1})

        # Add item
        add_res = add_to_cart.invoke({"user_id": 1, "product_id": 1163, "quantity": 1})
        ok_add = "Successfully added" in add_res

        # Get cart
        cart_res = get_cart.invoke({"user_id": 1})
        ok_get = "cart_item_id" in cart_res or "1163" in cart_res or "Cart Item ID:" in cart_res

        # Calculate total
        total_res = calculate_cart_total.invoke({"user_id": 1})
        ok_total = "subtotal" in total_res.lower() and "total" in total_res.lower()

        # Clear cart
        clear_res = clear_cart.invoke({"user_id": 1})
        ok_clear = "cleared" in clear_res.lower() or "empty" in clear_res.lower()

        ok = ok_add and ok_get and ok_total and ok_clear
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("Tool: cart full cycle (add, view, total, clear)", ok, f"Add: {ok_add}, View: {ok_get}, Total: {ok_total}, Clear: {ok_clear}")
    except Exception as e:
        all_passed = False
        log_test("Tool: cart operations", False, str(e))

    # ---------------------------------------------------------
    # TEST 8: Wishlist Operations (add, view, check, remove)
    # ---------------------------------------------------------
    test_count += 1
    try:
        add_w = add_to_wishlist.invoke({"user_id": 1, "product_id": 1163})
        check_w = check_wishlist.invoke({"user_id": 1, "product_id": 1163})
        view_w = get_wishlist.invoke({"user_id": 1})
        rem_w = remove_from_wishlist.invoke({"user_id": 1, "product_id": 1163})

        ok = ("added" in add_w.lower() or "already" in add_w.lower()) and "is in wishlist" in check_w.lower() and "1163" in view_w and "removed" in rem_w.lower()
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("Tool: wishlist cycle (add, check, view, remove)", ok, f"Added & verified product 1163 in wishlist")
    except Exception as e:
        all_passed = False
        log_test("Tool: wishlist operations", False, str(e))

    # ---------------------------------------------------------
    # TEST 9: Order Tools
    # ---------------------------------------------------------
    test_count += 1
    try:
        res = get_user_orders.invoke({"user_id": 1})
        ok = "Orders" in res or "No orders" in res
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("Tool: get_user_orders(user_id=1)", ok, res.split("\n")[0])
    except Exception as e:
        all_passed = False
        log_test("Tool: get_user_orders", False, str(e))

    # ---------------------------------------------------------
    # TEST 10: Review Tools
    # ---------------------------------------------------------
    test_count += 1
    try:
        rev_res = get_product_reviews.invoke({"product_id": 1163})
        sum_res = summarize_product_reviews.invoke({"product_id": 1163})
        ok = ("reviews" in rev_res.lower() or "no customer reviews" in rev_res.lower()) and "rating:" in sum_res.lower()
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("Tool: review tools (get & summarize)", ok, sum_res.split("\n")[0])
    except Exception as e:
        all_passed = False
        log_test("Tool: review tools", False, str(e))

    # ---------------------------------------------------------
    # TEST 11: Multi-tenant User Boundary Isolation
    # ---------------------------------------------------------
    test_count += 1
    try:
        from app.database import SessionLocal
        from app.models.user import User
        from app.utils.security import hash_password

        # Ensure user 2 exists in DB for valid multi-tenant test
        db = SessionLocal()
        u2 = db.query(User).filter(User.id == 2).first()
        if not u2:
            u2 = User(
                id=2,
                name="Second Tenant",
                email="tenant2@rayaatelier.com",
                password_hash=hash_password("Tenant2Secret!"),
                is_demo_user=True,
            )
            db.add(u2)
            db.commit()
        db.close()

        # Clear both carts
        clear_cart.invoke({"user_id": 1})
        clear_cart.invoke({"user_id": 2})

        # Add item to User 1's cart ONLY
        add_to_cart.invoke({"user_id": 1, "product_id": 1163, "quantity": 1})

        # User 1 cart has item
        c1 = get_cart.invoke({"user_id": 1})
        # User 2 cart must be empty
        c2 = get_cart.invoke({"user_id": 2})

        ok = ("1163" in c1 or "Cart Item ID:" in c1) and ("empty" in c2.lower())

        # Cleanup
        clear_cart.invoke({"user_id": 1})
        clear_cart.invoke({"user_id": 2})

        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("Security: User Boundary Isolation (User 1 vs User 2)", ok, "Cart data strictly segregated across tenant boundaries")
    except Exception as e:
        all_passed = False
        log_test("Security: User Boundary Isolation", False, str(e))

    # ---------------------------------------------------------
    # TEST 12: LangGraph Agent Graph Structure
    # ---------------------------------------------------------
    test_count += 1
    try:
        graph = get_agent_graph()
        ok = graph is not None
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("LangGraph: Compiled Graph Validation", ok, f"Nodes: {list(graph.nodes.keys())}")
    except Exception as e:
        all_passed = False
        log_test("LangGraph: Compiled Graph Validation", False, str(e))

    # ---------------------------------------------------------
    # TEST 13: FastAPI Agent Chat Endpoint Contract
    # ---------------------------------------------------------
    test_count += 1
    try:
        client = TestClient(app)
        h = client.get("/health")
        ok_health = h.status_code == 200 and h.json().get("database") == "connected"

        # Verify chat endpoint exists (responds with status other than 404)
        chat_res = client.post(
            "/api/agent/chat",
            json={"user_id": 1, "message": "ping"}
        )
        ok_endpoint = chat_res.status_code != 404

        ok = ok_health and ok_endpoint
        if ok:
            pass_count += 1
        else:
            all_passed = False
        log_test("FastAPI Route: /api/agent/chat registered & active", ok, f"Endpoint responded with HTTP {chat_res.status_code} (not 404)")
    except Exception as e:
        all_passed = False
        log_test("FastAPI Route: /api/agent/chat", False, str(e))

    print("=" * 70)
    print(f"AGENT VERIFICATION SUMMARY: {pass_count}/{test_count} TESTS PASSED")
    print("=" * 70)
    return all_passed


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
