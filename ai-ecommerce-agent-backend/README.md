# RAYA ATELIER — Backend API & Database Foundation

FastAPI and PostgreSQL backend foundation for the RAYA ATELIER Luxury Fashion E-Commerce application.

---

## Tech Stack

- **Framework**: FastAPI
- **ASGI Server**: Uvicorn
- **ORM**: SQLAlchemy 2.0
- **Database**: PostgreSQL
- **Driver**: psycopg 3 (binary)
- **Validation**: Pydantic v2
- **Password Hashing**: PBKDF2-HMAC-SHA256 (with random salt & 100,000 rounds)

---

## Directory Structure

```
ai-ecommerce-agent-backend/
├── app/
│   ├── main.py               # FastAPI application & router mounting
│   ├── config.py             # App configuration with credential masking
│   ├── database.py           # SQLAlchemy engine, session maker, get_db
│   ├── models/               # SQLAlchemy ORM models
│   │   ├── __init__.py
│   │   ├── user.py           # User model
│   │   ├── product.py        # Product model (2,508 dataset items)
│   │   ├── cart.py           # Cart & CartItem models
│   │   ├── wishlist.py       # Wishlist & WishlistItem models
│   │   ├── order.py          # Order & OrderItem models (price snapshots)
│   │   ├── delivery.py       # Delivery tracking & simulation
│   │   └── review.py         # Customer reviews with ratings
│   ├── schemas/              # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── product.py
│   │   ├── cart.py
│   │   ├── wishlist.py
│   │   ├── order.py
│   │   ├── delivery.py
│   │   └── review.py
│   ├── routes/               # API route controllers
│   │   ├── __init__.py
│   │   ├── users.py
│   │   ├── products.py
│   │   ├── cart.py
│   │   ├── wishlist.py
│   │   ├── orders.py
│   │   └── reviews.py
│   ├── services/             # Core business logic
│   │   ├── product_service.py
│   │   ├── cart_service.py
│   │   ├── order_service.py
│   │   └── delivery_service.py
│   └── utils/
│       └── security.py       # Password hashing & verification
│
├── scripts/
│   ├── seed_products.py      # Bulk seeder for 2,508 products & demo user
│   └── verify_backend.py     # Comprehensive 12-stage API verification suite
│
├── .env                      # Local environment file (git-ignored)
├── .env.example              # Sanitized configuration template
├── requirements.txt          # Python dependencies
└── README.md
```

---

## Quick Start Guide

### 1. Create and Activate Virtual Environment

**Windows (PowerShell):**
```powershell
cd ai-ecommerce-agent-backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

**macOS / Linux:**
```bash
cd ai-ecommerce-agent-backend
python3 -m venv .venv
source .venv/bin/activate
```

---

### 2. Install Dependencies

Using `pip`:
```bash
pip install -r requirements.txt
```

Or using `uv` (fastest):
```bash
uv pip install -r requirements.txt
```

---

### 3. Configure Environment Variables

Create `.env` based on `.env.example`:

```bash
cp .env.example .env
```

Configure your local `.env` with your PostgreSQL credentials:

```ini
DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/raya_ecommerce
ENVIRONMENT=development
PORT=8000
HOST=0.0.0.0
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> [!CAUTION]
> Never commit `.env` or expose your real PostgreSQL password in git. The `.gitignore` file is configured to strictly ignore `.env`.

---

### 4. Seed Database (2,508 Verified Products)

Run the idempotent bulk seeder:

```bash
python scripts/seed_products.py
```

This script:
1. Automatically creates all PostgreSQL tables if they don't already exist.
2. Creates an isolated demo user (`demo@rayaatelier.com`) with a securely hashed demo password for portfolio evaluation.
3. Bulk inserts all 2,508 products from the dataset with original product IDs (e.g. `1163`), image paths (`/products/{id}.jpg`), and derived fabrics.
4. Uses `ON CONFLICT (id) DO NOTHING` so it is safe to run repeatedly.

---

### 5. Start the Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

- **API Base URL**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### 6. Verify Database Connection & APIs

#### Health Check
```bash
curl http://localhost:8000/health
```

Expected Response:
```json
{
  "status": "ok",
  "database": "connected"
}
```

#### Run Automated Verification Suite
```bash
python scripts/verify_backend.py
```

Runs 12 automated end-to-end checks testing health, product filtering, dynamic category counts, cart operations, wishlist, checkout flow, delivery timeline, reviews, and authentication.

---

## API Reference

### Health
- `GET /health` — Check server status & PostgreSQL connectivity.

### Products
- `GET /api/products` — Paginated catalog with search and filters (`search`, `category`, `gender`, `sub_category`, `article_type`, `colour`, `season`, `usage`, `min_price`, `max_price`, `in_stock`, `sort_by`, `page`, `limit`).
- `GET /api/products/{id}` — Full product details by product ID (e.g. `1163`).
- `GET /api/products/categories` — Dynamically computed counts per master category (no hardcoded counts).
- `GET /api/products/filters` — Dynamically computed distinct filter options and price range.

### Cart (Server-Side Price Calculation)
- `GET /api/cart/{user_id}` — Get active cart with authoritative pricing.
- `POST /api/cart/{user_id}/items` — Add product item to cart.
- `PUT /api/cart/{user_id}/items/{item_id}` — Update item quantity.
- `DELETE /api/cart/{user_id}/items/{item_id}` — Remove item from cart.
- `DELETE /api/cart/{user_id}` — Clear all cart items.

### Wishlist
- `GET /api/wishlist/{user_id}` — Get all saved wishlist items.
- `POST /api/wishlist/{user_id}/items` — Add product to wishlist.
- `DELETE /api/wishlist/{user_id}/items/{product_id}` — Remove product from wishlist.
- `GET /api/wishlist/{user_id}/check/{product_id}` — Check if product is in wishlist.

### Orders & Delivery
- `POST /api/orders` — Checkout cart, snapshot historical prices, decrement stock, and create delivery schedule.
- `GET /api/orders/{user_id}` — List orders for user.
- `GET /api/orders/order/{order_number}` — Order tracking details by order number (e.g. `RAYA1025`).
- `POST /api/orders/{order_number}/cancel` — Cancel order and restore product stock.

### Reviews
- `GET /api/products/{product_id}/reviews` — List reviews for a product.
- `POST /api/products/{product_id}/reviews` — Submit review (1.0 to 5.0 rating) and update product rating metrics.
- `DELETE /api/reviews/{review_id}` — Delete review and recalculate average rating.

### Users
- `POST /api/users/register` — Register a new customer account.
- `POST /api/users/login` — Authenticate customer and verify password hash.
- `GET /api/users/{user_id}` — Get user profile.

---

## AI Shopping Agent (LangGraph + Ollama llama3.1:8b)

The RAYA ATELIER AI Shopping Concierge is powered by a stateful multi-turn LangGraph agent using local Ollama (`llama3.1:8b`).

### Architecture

```
React Frontend (AIStylistWidget)
      ↓  POST /api/agent/chat
FastAPI Backend (/api/agent/chat)
      ↓
LangGraph Stateful Agent
      ↓  Tool Calling Loop
Local Ollama (llama3.1:8b @ http://localhost:11434)
      ↓  19 Authoritative Python Tools
PostgreSQL Database (raya_ecommerce — 2,508 products)
```

### 1. Prerequisites & Ollama Setup

1. Install [Ollama](https://ollama.com/) (runs completely local — no API keys, no paid services).
2. Pull the model:
   ```bash
   ollama pull llama3.1:8b
   ```
3. Verify Ollama is running:
   ```bash
   ollama list
   ```
4. Configuration in `.env`:
   ```env
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.1:8b
   ```

### 2. Available Agent Tools (19 Tools)

- **Products**: `search_products`, `get_product_details`, `check_stock`, `compare_products`, `get_product_categories`
- **Cart**: `get_cart`, `add_to_cart`, `remove_from_cart`, `update_cart_quantity`, `clear_cart`, `calculate_cart_total`
- **Wishlist**: `get_wishlist`, `add_to_wishlist`, `remove_from_wishlist`, `check_wishlist`
- **Orders**: `get_order_status`, `get_user_orders`
- **Reviews**: `get_product_reviews`, `summarize_product_reviews`

### 3. Agent Chat API

`POST /api/agent/chat`

**Request Payload:**
```json
{
  "user_id": 1,
  "conversation_id": "optional-uuid-for-session-continuity",
  "message": "Show me blue shirts under $100"
}
```

**Response Payload:**
```json
{
  "conversation_id": "a34b281f-...",
  "message": "I found these refined minimalist blue shirts...",
  "products": [...],
  "cart_updated": false,
  "requires_clarification": false,
  "reply": "...",
  "recommendedProducts": [...],
  "suggestedQuestions": [...]
}
```

### 4. Running Agent Verifications

- **Tool & Security Verification Suite (13 tests)**:
  ```bash
  python scripts/verify_agent.py
  ```
- **Live Ollama Scenarios Test**:
  ```bash
  python scripts/test_live_scenarios.py
  ```

---

## Security & Isolation

- **Zero Arbitrary SQL**: The LLM NEVER executes SQL directly. All operations route through typed, strictly-bounded Python tool functions.
- **Strict Tenant Boundaries**: The user ID is enforced in Python before executing user-scoped tool calls. Cross-tenant cart/order tampering is mathematically prevented.
- **Zero Plain-Text Passwords**: All passwords are encrypted with PBKDF2-HMAC-SHA256 with unique cryptographic salts.
- **Server-Side Price Calculation**: Totals, subtotals, and shipping costs are calculated strictly from database values; client-provided prices are ignored.
- **Credential Protection**: Database URLs in logs and health endpoints are masked (`postgresql+psycopg://postgres:***@localhost:5432/raya_ecommerce`).
- **Portfolio Demo User**: The demo user (`demo@rayaatelier.com`) is isolated with a flag `is_demo_user=True` for portfolio demonstration.
