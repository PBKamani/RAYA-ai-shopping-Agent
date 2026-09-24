# RAYA — AI Shopping Agent

> An intelligent conversational AI shopping agent that understands natural-language shopping requests, searches a real product catalog, manages shopping carts and wishlists, checks product availability, provides recommendations, tracks orders, and assists users throughout the shopping journey.

[![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?logo=langchain&logoColor=white)](https://www.langchain.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?logo=langchain&logoColor=white)](https://www.langchain.com/langgraph)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-black?logo=ollama)](https://ollama.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

---

## 📌 Overview

**RAYA** is an AI-powered conversational shopping agent designed to make e-commerce more interactive and intelligent.

Instead of forcing users to navigate through multiple filters, categories, and pages, users can communicate with RAYA using natural language.

For example:

```text
"Show me black shirts under ₹2000."

"Do you have this in size M?"

"Add this to my shopping bag."

"What is currently in my bag?"

"Remove the shoes from my bag."

"Show me products on sale."

"Help me decide between these two products."

"Show me something that goes well with this shirt."

"Where is my order?"

RAYA understands the user's intent, selects the appropriate tool, retrieves real data from the database, performs the requested operation, and responds conversationally.

The project focuses primarily on Agentic AI + Tool Calling + Database Integration, with a complete e-commerce interface used as the interaction layer.

🎯 Project Goals

The main goals of RAYA are:

Build a real conversational AI shopping agent
Understand natural-language shopping commands
Use LLM-based reasoning for tool selection
Integrate LangChain and LangGraph
Run the LLM locally using Ollama
Connect AI tools with PostgreSQL
Maintain real-time cart and wishlist state
Provide personalized product recommendations
Support multi-turn conversations
Add authentication and user-specific data
Avoid hallucinating product and cart information
Create a realistic agentic e-commerce architecture
🧠 Core Concept

RAYA follows an agentic architecture rather than using the LLM only as a chatbot.

                        USER
                         │
                         ▼
                 React Frontend
                         │
                         ▼
                    FastAPI API
                         │
                         ▼
                LangGraph Agent
                         │
                         ▼
                 Ollama LLM
                llama3.1:8b
                         │
                         ▼
                LangChain Tools
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
        Product Services       Cart Services
              │                     │
              └──────────┬──────────┘
                         ▼
                    PostgreSQL

The important principle is:

PostgreSQL is the source of truth for transactional data.

The AI Agent does not assume the current cart, wishlist, stock, price, or order status from conversation memory.

✨ Features
🤖 AI Shopping Agent

RAYA understands natural-language requests instead of requiring users to use rigid commands.

Examples:

"Find me a black shirt."

"Show me something under ₹3000."

"Find products on sale."

"Add this to my bag."

"Remove the black shirt."

"What's in my bag?"

"Help me decide."

"Show me something similar."
🛍️ Product Discovery

The agent can search and filter products using real catalog metadata.

Supported capabilities include:

Product search
Category filtering
Color filtering
Gender-based filtering where applicable
Price filtering
Budget-based recommendations
Sale product discovery
Product alternatives
Product comparisons
Product details
Product specifications

Example:

User:
Show me black shirts under ₹2500.

Agent:
Here are some black shirts available under ₹2500...
💰 Budget-Based Recommendations

Users can specify their budget naturally.

Examples:

"Show me shirts under ₹2000."

"Find something below ₹3000."

"I want shoes around ₹5000."

"Give me some options within my budget."

The agent uses actual product prices from the database.

🏷️ Sale Product Discovery

Users can ask:

"What's on sale?"

"Show me discounted shirts."

"Find sale products under ₹3000."

Sale products are determined from actual product pricing data.

Conceptually:

original_price > current_price

No hardcoded sale products are used.

🎨 Color-Based Shopping

Users can search using natural language:

"I want something black."

"Show me blue shirts."

"Find red dresses."

"Do you have white shoes?"

The agent uses actual product color metadata.

If the request is ambiguous, the agent can ask a clarification question.

Example:

User:
Show me something black.

Agent:
What type of product are you looking for?
🛒 AI Shopping Bag Management

One of the main features of RAYA is AI-powered cart management.

Users can manage their cart using natural language.

Add Product
"Add this to my shopping bag."

"Add this shirt to my cart."

"Add two of these."
Remove Product
"Remove this from my bag."

"Remove the black shirt."

"Take the shoes out of my cart."
View Cart
"What's currently in my bag?"

"Show me my cart."

"What products have I added?"
Cart Total
"How much is my cart?"

"What's my total?"

"How much are these three items together?"

All important cart calculations are performed using backend/database data rather than relying on LLM arithmetic.

🧮 Selective Cart Calculation

RAYA can handle requests involving only selected cart items.

Example:

User:
I have five items in my cart.
How much are the shirt, shoes, and trousers together?

The agent:

Retrieves the current cart
Identifies the requested products
Calculates the selected subtotal
Returns the result

This prevents the LLM from incorrectly calculating important financial values.

❤️ Wishlist Management

Users can manage their wishlist through the AI Agent.

Examples:

"Add this to my wishlist."

"Remove this from my wishlist."

"Show my wishlist."

"Is this product already in my wishlist?"

Wishlist data is stored per authenticated user.

📦 Stock Availability

Users can ask about product availability.

Examples:

"Is this available?"

"Do you have this in size M?"

"Is this shoe in stock?"

"How many are available?"

The agent checks the actual product stock information.

📋 Product Specification Assistant

Users can ask questions about products.

Examples:

"What is the material?"

"What color is this?"

"What category is this?"

"What sizes are available?"

"How much does this cost?"

The agent retrieves information from the product catalog.

If information is not available, RAYA does not invent it.

🤔 Help Me Decide

RAYA includes a conversational decision-support mode.

Example:

User:
Help me decide between these two shirts.

Agent:
What matters most to you?

1. Price
2. Style
3. Color
4. Everyday use
5. Occasion

The agent can explain differences and trade-offs based on the user's requirements.

It does not blindly select a product without understanding the user's priorities.

🔄 Alternative Product Suggestions

Users can ask:

"Show me something similar."

"Do you have another option?"

"Find something like this but cheaper."

"Show me another color."

The agent searches the actual catalog for relevant alternatives.

👕 Cross-Category Recommendations

RAYA can recommend complementary products.

Example:

User:
I like this shirt.

Agent:
You may also want to explore:

- Trousers
- Shoes
- Accessories

Recommendations are generated using available catalog data.

📦 Order Tracking Assistant

Authenticated users can ask:

"Where is my order?"

"What's the status of my order?"

"Show my recent orders."

"Has my order been delivered?"

Supported order states include:

ORDER_PLACED
CONFIRMED
PROCESSING
SHIPPED
OUT_FOR_DELIVERY
DELIVERED

The agent retrieves order information belonging to the authenticated user.

⭐ Product Review Q&A

Users can ask questions about product reviews.

Examples:

"What do customers think about this?"

"Are there reviews for this product?"

"What are people saying about the quality?"

The agent retrieves actual stored reviews.

If no reviews exist, it clearly informs the user instead of generating fake reviews.

🔐 Authentication

RAYA includes user authentication with:

User registration
User login
Password hashing
JWT authentication
Authenticated user sessions
User profile
Logout
User-specific cart
User-specific wishlist
User-specific orders

Authentication endpoints:

POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
🧠 Agent Architecture

The AI Agent is built using:

LangChain

Used for:

LLM integration
Tool definitions
Tool execution
Prompt management
Structured agent interactions
LangGraph

Used for:

Agent workflow
State management
Tool execution loops
Multi-step reasoning
Conversation flow

Conceptual graph:

START
  │
  ▼
Agent
  │
  ├──── Tool required ────► Tool
  │                          │
  │                          ▼
  │                        Result
  │                          │
  │                          ▼
  │                        Agent
  │
  └──── No tool ──────────► END
🛠️ AI Agent Tools

RAYA uses controlled tools instead of allowing the LLM to directly manipulate the database.

Core tools include:

search_products
get_product_details
check_stock
compare_products
get_product_categories

find_sale_products
find_products_by_color
find_products_by_budget

find_alternatives
cross_category_recommendations
recommend_products

get_cart
add_to_cart
remove_from_cart
update_cart_quantity
clear_cart
calculate_cart_total

get_wishlist
add_to_wishlist
remove_from_wishlist

check_order_status
get_product_reviews

Tools interact with the backend service layer and database.

The LLM does not execute arbitrary SQL.

🗄️ Database

PostgreSQL is used as the primary database.

Main entities include:

users
products
carts
cart_items
wishlists
wishlist_items
orders
order_items
deliveries
reviews

Relationship example:

User
 │
 ├── Cart
 │    └── Cart Items
 │          └── Products
 │
 ├── Wishlist
 │    └── Wishlist Items
 │          └── Products
 │
 └── Orders
      └── Order Items
            └── Products
📊 Product Dataset

The project uses a fashion product catalog containing:

2,508 products
2,508 unique product IDs
Product images
Product titles
Categories
Colors
Pricing information
Product metadata

Product images are stored in:

ai-ecommerce-agent/public/products/

Processed product metadata is available through:

ai-ecommerce-agent/src/data/products.json

The original dataset metadata is based on styles.csv.

🖥️ Frontend

The frontend is built with:

React
Vite
JavaScript
Context-based state management
Responsive UI
AI shopping interface

The frontend provides:

Product discovery
Search
Filtering
Product details
Shopping Bag
Wishlist
Checkout flow
AI Shopping Concierge
Login/Register
User account
Order interface
🎨 Design

RAYA uses a minimal luxury-fashion visual language.

Main design direction
Minimal
Editorial
Luxury
Clean
Modern
Primary colors
Off-white: #FAF9F6
Secondary: #F4F3EE
Dark text: #1A1917
White: #FFFFFF

The interface is designed to keep the AI interaction and shopping experience visually simple while maintaining a premium fashion aesthetic.

⚙️ Backend

The backend is built using:

Python
FastAPI
SQLAlchemy 2.0
Pydantic
PostgreSQL
Psycopg 3
JWT Authentication
Uvicorn

The backend provides APIs for:

Authentication
Products
Cart
Wishlist
Orders
Reviews
AI Agent
📁 Project Structure
RAYA-ai-shopping-Agent/
│
├── ai-ecommerce-agent/
│   │
│   ├── public/
│   │   ├── products/
│   │   └── ...
│   │
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── services/
│   │   ├── pages/
│   │   └── ...
│   │
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── ai-ecommerce-agent-backend/
│   │
│   ├── app/
│   │   ├── agent/
│   │   │   ├── tools/
│   │   │   ├── prompts.py
│   │   │   └── ...
│   │   │
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── database.py
│   │   └── main.py
│   │
│   ├── scripts/
│   ├── requirements.txt
│   ├── .env.example
│   └── ...
│
├── .gitignore
└── README.md
🔄 Request Flow

A typical AI shopping request follows this flow:

User
 │
 │ "Add this shirt to my shopping bag"
 ▼
React AI Chat
 │
 ▼
FastAPI
 │
 ▼
LangGraph Agent
 │
 ▼
Ollama
 │
 │ decides:
 │ add_to_cart
 ▼
LangChain Tool
 │
 ▼
Cart Service
 │
 ▼
PostgreSQL
 │
 │ transaction committed
 ▼
Updated Cart
 │
 ▼
FastAPI Response
 │
 ▼
React Cart Context
 │
 ▼
Shopping Bag UI
🔒 Data Integrity Principle

A major design principle of RAYA is:

The database is the source of truth.

For example, if a user previously added a product and later removed it:

Conversation Memory:
"I previously added product X."

PostgreSQL:
Product X is no longer in the cart.

RAYA must trust:

PostgreSQL

and not:

Conversation Memory

This prevents stale cart information and agent hallucination.

🌐 API

Main API groups:

/api/auth
/api/products
/api/cart
/api/wishlist
/api/orders
/api/reviews
/api/agent
AI Agent
POST /api/agent/chat

Example request:

{
  "user_id": 1,
  "conversation_id": "conversation-001",
  "message": "Show me black shirts under ₹2000"
}

Example response:

{
  "success": true,
  "conversation_id": "conversation-001",
  "message": "Here are some black shirts under ₹2000.",
  "products": [],
  "cart_updated": false,
  "cart": null,
  "requires_clarification": false
}
🚀 Getting Started
Prerequisites

Install the following:

Git
Node.js
npm
Python
PostgreSQL
Ollama
GitHub account
1. Clone Repository
git clone https://github.com/PBKamani/RAYA-ai-shopping-Agent.git
cd RAYA-ai-shopping-Agent
2. Backend Setup

Navigate to the backend:

cd ai-ecommerce-agent-backend

Create a virtual environment:

python -m venv .venv

Activate it on Windows:

.venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt
3. PostgreSQL Setup

Create a PostgreSQL database:

raya_ecommerce

Example:

CREATE DATABASE raya_ecommerce;

Make sure PostgreSQL is running.

4. Backend Environment Variables

Create:

.env

based on:

.env.example

Example:

DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASSWORD@localhost:5432/raya_ecommerce

ENVIRONMENT=development

PORT=8000
HOST=0.0.0.0

CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

JWT_SECRET=YOUR_SECRET_KEY
JWT_ALGORITHM=HS256
Important

Never commit your real .env file.

Never publish:

PostgreSQL passwords
JWT secrets
API keys
private credentials
5. Ollama Setup

Install Ollama and download the model:

ollama pull llama3.1:8b

Start Ollama if it is not already running.

Verify:

ollama list

You should see:

llama3.1:8b
6. Start Backend

From:

ai-ecommerce-agent-backend/

run:

uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

Backend:

http://127.0.0.1:8000

FastAPI documentation:

http://127.0.0.1:8000/docs
7. Frontend Setup

Open another terminal:

cd ai-ecommerce-agent

Install dependencies:

npm install

Start development server:

npm run dev

Frontend:

http://localhost:5173
🧪 Testing

The project should be tested at multiple levels.

Authentication

Test:

Register
Login
Wrong password
Logout
Authenticated user
Cart

Test:

Add product
Remove product
Update quantity
Clear cart
Get cart
Calculate total
Selective cart total
AI Agent

Test natural-language commands:

"Show me black shirts."

"Show me products under ₹2000."

"What's on sale?"

"Add this to my shopping bag."

"What's currently in my shopping bag?"

"Remove the black shirt."

"Help me decide."

"Show me something similar."

"Is this available in size M?"

"Add this to my wishlist."

"Where is my order?"
🧪 Example Agent Interaction
Product Search
User:
Show me black shirts under ₹2000.

RAYA:
Here are some black shirts available within your budget.
Cart
User:
Add the first one to my shopping bag.

RAYA:
Added the product to your shopping bag.
Cart Verification
User:
What's currently in my shopping bag?

RAYA:
You currently have 1 item in your shopping bag.
Remove
User:
Remove it.

RAYA:
Removed the product from your shopping bag.
Verify Again
User:
What's in my shopping bag?

RAYA:
Your shopping bag is currently empty.

The final response is based on the actual database state.

🧰 Technologies Used
Technology	Purpose
React	Frontend UI
Vite	Frontend tooling
JavaScript	Frontend development
Python	Backend & AI
FastAPI	REST API
PostgreSQL	Persistent database
SQLAlchemy	ORM
Psycopg	PostgreSQL driver
Pydantic	Data validation
LangChain	LLM & tool integration
LangGraph	Agent workflow
Ollama	Local LLM runtime
Llama 3.1 8B	Local language model
JWT	Authentication
Git	Version control
GitHub	Source code hosting
🧠 Why LangGraph?

A simple chatbot generally follows:

User → LLM → Response

RAYA requires more complex behavior:

User
 ↓
Understand Intent
 ↓
Choose Tool
 ↓
Execute Tool
 ↓
Read Result
 ↓
Continue Reasoning
 ↓
Respond

LangGraph provides a structured way to build this stateful agent workflow.

🔧 Why Tool Calling?

Instead of asking the LLM to invent information, RAYA gives it controlled tools.

For example:

User:
What's in my bag?

The LLM selects:

get_cart()

The tool queries PostgreSQL.

Then:

PostgreSQL
 ↓
Cart Data
 ↓
Agent
 ↓
Natural Language Response

This architecture significantly reduces stale or fabricated transactional information.

🗃️ Why PostgreSQL?

PostgreSQL is used for persistent transactional data such as:

Users
Products
Cart
Wishlist
Orders
Reviews
Delivery information

The database allows RAYA to maintain consistent state even after:

Page refresh
Browser restart
Login/logout
Multiple conversations
🔮 Future Improvements

Possible future improvements include:

Persistent LangGraph conversation history
Vector-based product retrieval
Semantic product search
Hybrid search
User preference learning
Voice shopping assistant
Product image search
Multimodal product understanding
Advanced recommendation engine
Real payment gateway integration
Real delivery/tracking API
Production cloud deployment
Agent evaluation framework
LLM observability and tracing
Guardrails
Agent performance monitoring
Redis caching
Background jobs
Rate limiting
Production-grade authentication
⚠️ Current Limitations

This project is primarily an AI engineering and portfolio project.

Some e-commerce operations are simulated rather than connected to real commercial services.

For example:

Payment processing is not connected to a real payment provider.
Delivery tracking is simulated.
Product catalog is based on a dataset.
Ollama runs locally during development.
Production deployment requires additional infrastructure.
Real inventory synchronization is not connected to an external business system.
🔐 Security Considerations

For development:

Passwords are hashed.
JWT authentication is used.
.env is excluded from Git.
Database access is handled through backend services.
AI tools do not directly execute arbitrary SQL.

For production, additional security should be implemented:

HTTPS
Secure token storage
Token expiration/refresh
Rate limiting
CSRF protection where applicable
Input validation
API authorization
Database connection security
Secret management
Monitoring and logging
Production-grade infrastructure
📌 Project Status
AI Agent              ████████████████████  In Development
Product Search        ████████████████████  Implemented
Cart Management       ████████████████████  Implemented
Wishlist              ████████████████████  Implemented
Authentication        ████████████████████  Implemented
Product Recommendations ██████████████████  Implemented
Order Tracking        ████████████████░░░░  Development
Reviews               ████████████████░░░░  Development
Production Deployment ████████░░░░░░░░░░░░  Planned
👨‍💻 Author

PBKamani

GitHub:

https://github.com/PBKamani

Project:

https://github.com/PBKamani/RAYA-ai-shopping-Agent

📄 License

This project is created for educational, portfolio, and AI engineering purposes.

Add an appropriate open-source license before distributing or modifying the project for commercial use.

⭐ Acknowledgements

This project uses and is inspired by the following technologies:

React
FastAPI
PostgreSQL
LangChain
LangGraph
Ollama
Llama
Vite
💡 Final Architecture
                         ┌─────────────────────┐
                         │       USER          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React Frontend    │
                         │                     │
                         │ • Product Search    │
                         │ • Shopping Bag      │
                         │ • Wishlist          │
                         │ • AI Concierge      │
                         │ • Authentication    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │       Backend       │
                         └──────────┬──────────┘
                                    │
                     ┌──────────────┴──────────────┐
                     │                             │
                     ▼                             ▼
          ┌─────────────────────┐       ┌─────────────────────┐
          │   REST Services     │       │   LangGraph Agent   │
          │                     │       │                     │
          │ • Auth              │       │ • Intent            │
          │ • Products          │       │ • Reasoning         │
          │ • Cart              │       │ • Tool Calling      │
          │ • Wishlist          │       │ • Conversation      │
          │ • Orders            │       │                     │
          │ • Reviews           │       └──────────┬──────────┘
          └──────────┬──────────┘                  │
                     │                             ▼
                     │                  ┌─────────────────────┐
                     │                  │       Ollama        │
                     │                  │    llama3.1:8b      │
                     │                  └──────────┬──────────┘
                     │                             │
                     │                             ▼
                     │                  ┌─────────────────────┐
                     │                  │   LangChain Tools   │
                     │                  └──────────┬──────────┘
                     │                             │
                     └──────────────┬──────────────┘
                                    ▼
                         ┌─────────────────────┐
                         │     PostgreSQL      │
                         │                     │
                         │ • Users             │
                         │ • Products          │
                         │ • Carts             │
                         │ • Wishlists         │
                         │ • Orders            │
                         │ • Reviews           │
                         └─────────────────────┘
🚀 RAYA is more than an e-commerce UI.

The core objective of this project is to demonstrate how an AI Agent can interact with real application data and perform real actions through controlled tools.

Natural Language
       ↓
AI Reasoning
       ↓
Tool Selection
       ↓
Tool Execution
       ↓
Real Database
       ↓
Updated Application State
       ↓
Conversational Response

RAYA — AI-powered conversational shopping, built with Agentic AI.


### One small recommendation

For GitHub, I'd **not put fake/test credentials, your PostgreSQL password, JWT secret, or personal email in this README**. Your `.env.example` is enough for setup instructions.

Also, because your repository is primarily about the **AI Agent**, this README now makes **LangGraph + LangChain + Ollama + tool calling + PostgreSQL** the center of the project rather than treating RAYA as just another React e-commerce website.
make everything in single click to copy 
