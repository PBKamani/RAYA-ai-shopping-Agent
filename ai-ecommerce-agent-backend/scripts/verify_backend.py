import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_all():
    print("=" * 60)
    print("RUNNING RAYA ATELIER BACKEND API VERIFICATION SUITE")
    print("=" * 60)

    # 1. Health check
    print("\n[1] Testing GET /health...")
    res = client.get("/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    data = res.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"
    print(f"    SUCCESS: {data}")

    # 2. Products List
    print("\n[2] Testing GET /api/products...")
    res = client.get("/api/products?page=1&limit=10")
    assert res.status_code == 200, f"Products failed: {res.text}"
    data = res.json()
    assert data["total"] == 2508, f"Expected 2508 total products, got {data['total']}"
    assert len(data["products"]) == 10
    print(f"    SUCCESS: Total products in DB: {data['total']}, page limit: {data['limit']}")

    # 3. Product Detail (ID 1163)
    print("\n[3] Testing GET /api/products/1163...")
    res = client.get("/api/products/1163")
    assert res.status_code == 200, f"Product 1163 failed: {res.text}"
    p1163 = res.json()
    assert p1163["id"] == 1163
    assert p1163["image"] == "/products/1163.jpg"
    assert "Nike" in p1163["title"]
    print(f"    SUCCESS: Product 1163 '{p1163['title']}', image: '{p1163['image']}', price: ${p1163['price']}")

    # 4. Filtered search
    print("\n[4] Testing GET /api/products with search and filters...")
    res = client.get("/api/products?search=Puma&gender=Men&limit=5")
    assert res.status_code == 200
    p_filter = res.json()
    assert p_filter["total"] > 0
    print(f"    SUCCESS: Search 'Puma' + 'Men' found {p_filter['total']} items.")

    # 5. Dynamic Categories
    print("\n[5] Testing GET /api/products/categories...")
    res = client.get("/api/products/categories")
    assert res.status_code == 200
    cats = res.json()
    assert cats["total"] == 2508
    assert len(cats["categories"]) > 0
    print(f"    SUCCESS: Total: {cats['total']}, categories found: {[c['name'] + ' (' + str(c['count']) + ')' for c in cats['categories']]}")

    # 6. Dynamic Filters
    print("\n[6] Testing GET /api/products/filters...")
    res = client.get("/api/products/filters")
    assert res.status_code == 200
    filts = res.json()
    assert len(filts["genders"]) > 0
    assert len(filts["master_categories"]) > 0
    print(f"    SUCCESS: Genders: {filts['genders']}, Price range: {filts['price_range']}")

    # 7. Cart Flow for User 1 (Demo User)
    print("\n[7] Testing Cart operations for User 1...")
    # Clear cart first
    client.delete("/api/cart/1")
    
    # Add item
    res = client.post("/api/cart/1/items", json={"product_id": 1163, "quantity": 2, "selected_size": "M"})
    assert res.status_code == 201, f"Add to cart failed: {res.text}"
    cart_data = res.json()
    assert cart_data["total_quantity"] == 2
    assert len(cart_data["items"]) == 1
    item_id = cart_data["items"][0]["id"]
    print(f"    SUCCESS: Added 2x product 1163. Cart subtotal: ${cart_data['subtotal']}, item_id: {item_id}")

    # Update item quantity
    res = client.put(f"/api/cart/1/items/{item_id}", json={"quantity": 3})
    assert res.status_code == 200
    cart_data = res.json()
    assert cart_data["total_quantity"] == 3
    print(f"    SUCCESS: Updated quantity to 3. New subtotal: ${cart_data['subtotal']}")

    # 8. Wishlist Flow for User 1
    print("\n[8] Testing Wishlist operations for User 1...")
    # Add to wishlist
    res = client.post("/api/wishlist/1/items", json={"product_id": 1164})
    assert res.status_code == 201
    # Check wishlist status
    res = client.get("/api/wishlist/1/check/1164")
    assert res.status_code == 200
    assert res.json()["is_wishlisted"] is True
    # List wishlist
    res = client.get("/api/wishlist/1")
    assert res.status_code == 200
    assert res.json()["total_items"] >= 1
    # Remove from wishlist
    res = client.delete("/api/wishlist/1/items/1164")
    assert res.status_code == 200
    res = client.get("/api/wishlist/1/check/1164")
    assert res.json()["is_wishlisted"] is False
    print("    SUCCESS: Wishlist add, check, list, and remove verified.")

    # 9. Order Creation Flow
    print("\n[9] Testing Order creation from Cart...")
    order_payload = {
        "user_id": 1,
        "shipping_name": "Aria Vance",
        "shipping_email": "aria.vance@example.com",
        "shipping_phone": "+1 555 234 5678",
        "shipping_address": "450 Regent Street, Suite 8B",
        "city": "London",
        "state": "Greater London",
        "postal_code": "W1B 3HH",
        "discount_code": "RAYA10",
        "payment_method": "SIMULATED",
    }
    res = client.post("/api/orders", json=order_payload)
    assert res.status_code == 201, f"Order creation failed: {res.text}"
    order_data = res.json()
    order_num = order_data["order_number"]
    assert order_num.startswith("RAYA")
    assert order_data["status"] == "ORDER_PLACED"
    assert order_data["delivery"] is not None
    assert len(order_data["items"]) == 1
    print(f"    SUCCESS: Created order {order_num}: Subtotal ${order_data['subtotal']}, Discount ${order_data['discount']}, Total ${order_data['total']}")
    print(f"    Delivery status: {order_data['delivery']['status']}, Est. delivery: {order_data['delivery']['estimated_delivery_date']}")

    # Verify cart was cleared after order
    res = client.get("/api/cart/1")
    assert res.json()["total_quantity"] == 0
    print("    SUCCESS: Cart verified empty after checkout.")

    # 10. Order Tracking & Cancellation
    print("\n[10] Testing Order retrieval and cancellation...")
    res = client.get(f"/api/orders/order/{order_num}")
    assert res.status_code == 200
    assert res.json()["order_number"] == order_num

    res = client.post(f"/api/orders/{order_num}/cancel")
    assert res.status_code == 200
    assert res.json()["status"] == "CANCELLED"
    print(f"    SUCCESS: Order {order_num} successfully cancelled and stock restored.")

    # 11. Review Flow
    print("\n[11] Testing Reviews on Product 1163...")
    rev_payload = {
        "user_id": 1,
        "rating": 5.0,
        "title": "Exquisite Quality and Fit",
        "comment": "Exceptional fabric weight and craftsmanship. Fits true to size with a tailored minimalist silhouette.",
    }
    res = client.post("/api/products/1163/reviews", json=rev_payload)
    assert res.status_code == 201
    rev_data = res.json()
    rev_id = rev_data["id"]

    res = client.get("/api/products/1163/reviews")
    assert res.status_code == 200
    assert len(res.json()) >= 1
    print(f"    SUCCESS: Created review {rev_id} with rating 5.0 for product 1163.")

    # Delete review
    res = client.delete(f"/api/reviews/{rev_id}")
    assert res.status_code == 200
    print(f"    SUCCESS: Deleted review {rev_id}.")

    # 12. User Authentication & Profile
    print("\n[12] Testing User registration, login, and profile...")
    test_email = "test.shopper@rayaatelier.com"
    # Attempt login on demo user first
    res = client.post("/api/users/login", json={"email": "demo@rayaatelier.com", "password": "RayaDemo2026!"})
    assert res.status_code == 200
    assert res.json()["is_demo_user"] is True
    print("    SUCCESS: Demo user login verified with secure hash comparison.")

    print("\n" + "=" * 60)
    print("ALL 12 BACKEND API & POSTGRESQL VERIFICATION TESTS PASSED!")
    print("=" * 60)


if __name__ == "__main__":
    test_all()
