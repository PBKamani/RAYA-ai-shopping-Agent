# RAYA — AI Shopping Agent

> An intelligent, conversational AI shopping assistant powered by LangGraph, Ollama, and PostgreSQL. RAYA understands natural-language requests, executes controlled tool calls, manages shopping carts, and interacts with real database states to deliver a seamless, agentic e-commerce experience.

[![Python](https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![LangChain](https://img.shields.io/badge/LangChain-1C3C3C?logo=langchain&logoColor=white)](https://www.langchain.com/)
[![LangGraph](https://img.shields.io/badge/LangGraph-1C3C3C?logo=langchain&logoColor=white)](https://www.langchain.com/langgraph)
[![Ollama](https://img.shields.io/badge/Ollama-Local%20LLM-black?logo=ollama)](https://ollama.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vite.dev/)

---

## 📌 Overview

**RAYA is more than an e-commerce UI; it is an exploration of Agentic AI.**

Traditional e-commerce forces users through rigid navigation, filters, and paginated categories. RAYA replaces this friction with an intelligent conversational interface. By bridging an advanced LLM with a strict relational database, RAYA listens to user intent, selects the right backend tools, and executes real transactions.

**Instead of clicking, users just ask:**
> *"Show me black shirts under ₹2000."*  
> *"Add the first one to my bag."*  
> *"Actually, remove it and show me alternatives on sale."*  

**Core Design Principle:** *The Database is the Source of Truth.*
Unlike standard chatbots that hallucinate cart states or pricing from conversation memory, RAYA relies entirely on PostgreSQL for transactional data. Every action reflects actual inventory, pricing, and user state.

---

## 🧠 Agent Architecture & Flow

RAYA utilizes a stateful agent workflow managed by **LangGraph**, preventing the LLM from inventing information and restricting it to controlled tool execution.

### The Request Lifecycle
```text
Natural Language ──► AI Reasoning ──► Tool Selection ──► Tool Execution ──► Real Database ──► Conversational Response
System Architecture
Plaintext
                         ┌─────────────────────┐
                         │       USER          │
                         └──────────┬──────────┘
                                    │ (React + Vite)
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         └──────────┬──────────┘
                                    │
          ┌─────────────────────────┴─────────────────────────┐
          │                                                   │
          ▼                                                   ▼
┌─────────────────────┐                             ┌─────────────────────┐
│   REST Services     │                             │   LangGraph Agent   │
│ • Auth, Products,   │                             │ • Intent, Reasoning,│
│   Cart, Orders      │                             │ • Tool Calling      │
└──────────┬──────────┘                             └──────────┬──────────┘
           │                                                   │
           │                                                   ▼
           │                                        ┌─────────────────────┐
           │                                        │   Ollama (Llama 3)  │
           │                                        └──────────┬──────────┘
           │                                                   │
           │                                                   ▼
           │                                        ┌─────────────────────┐
           │                                        │   LangChain Tools   │
           │                                        └──────────┬──────────┘
           └─────────────────────────┬─────────────────────────┘
                                     ▼
                         ┌─────────────────────┐
                         │     PostgreSQL      │
                         │ (Source of Truth)   │
                         └─────────────────────┘
✨ Key Features
🤖 Agentic E-Commerce
Natural Language Processing: Understands complex, multi-turn shopping commands.

Decision Support: Ask "Help me decide between these two shirts," and RAYA will break down trade-offs based on price, style, and use-case.

Smart Cart Management: Handles specific operations like "How much are the shirt and shoes together?" without hallucinating math.

Cross-Category Recommendations: Automatically suggests complementary items (e.g., matching trousers for a shirt).

🛍️ Product Discovery & Catalog
Dynamic Filtering: Search by budget, color, category, or sale status natively (e.g., "Find sale products under ₹3000").

Stock & Availability: Live stock checking against the database.

Alternative Suggestions: Requests like "Find something like this but cheaper" trigger real database comparisons.

Rich Catalog: Pre-loaded with a dataset of 2,500+ fashion products, complete with metadata and imagery.

⚙️ Robust Backend & Security
Controlled Tool Calling: The AI cannot execute arbitrary SQL; it interfaces securely via 20+ predefined Python tools.

JWT Authentication: Secure registration, login, and user-specific state (carts, wishlists, order history).

Minimalist UI: A luxury-fashion editorial design language built in React (Off-white #FAF9F6, Dark #1A1917).

🛠️ Technology Stack
Domain	Technology	Purpose
AI & Agent	LangGraph, LangChain	Stateful agent workflow, Tool integration
LLM Runtime	Ollama, Llama 3.1 8B	Local, private language model execution
Backend API	Python, FastAPI	High-performance REST APIs
Database	PostgreSQL, SQLAlchemy, Psycopg 3	Persistent transactional data, ORM
Frontend	React, Vite, Context API	Responsive, modern user interface
Security	JWT, Pydantic	Authentication, robust data validation
🚀 Getting Started
Prerequisites
Node.js & npm

Python 3.x

PostgreSQL

Ollama

1. Clone & Setup
Bash
git clone [https://github.com/PBKamani/RAYA-ai-shopping-Agent.git](https://github.com/PBKamani/RAYA-ai-shopping-Agent.git)
cd RAYA-ai-shopping-Agent
2. Database Preparation
Ensure PostgreSQL is running and create the database:

SQL
CREATE DATABASE raya_ecommerce;
3. Backend & AI Initialization
Bash
# Navigate to backend
cd ai-ecommerce-agent-backend

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
Configure your .env file with your PostgreSQL credentials and JWT secret. Never commit this file.

4. Start Local LLM
Bash
ollama pull llama3.1:8b
# Verify it's running:
ollama list
5. Run the Servers
Start Backend (Port 8000):

Bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
API Docs available at http://127.0.0.1:8000/docs

Start Frontend (Port 5173):

Bash
cd ../ai-ecommerce-agent
npm install
npm run dev
💬 Example AI Interactions
Here is how RAYA handles context and state seamlessly:

User: Show me black shirts under ₹2000.

RAYA: [Queries Postgres] Here are some black shirts available within your budget.

User: Add the first one to my shopping bag.

RAYA: [Executes add_to_cart tool] Added the product to your shopping bag.

User: What's currently in my shopping bag?

RAYA: [Executes get_cart tool] You currently have 1 item in your shopping bag.

User: Remove it.

RAYA: [Executes remove_from_cart] Removed the product. Your bag is now empty.

🗺️ Project Status & Roadmap
Plaintext
AI Agent Logic        ████████████████████  Stable
Product Search        ████████████████████  Stable
Cart & Wishlist       ████████████████████  Stable
User Authentication   ████████████████████  Stable
Order Tracking        ████████████████░░░░  In Progress
Product Reviews       ████████████████░░░░  In Progress
Vector/Hybrid Search  ████████░░░░░░░░░░░░  Planned
Cloud Deployment      ░░░░░░░░░░░░░░░░░░░░  Planned
Current Limitations
This is an AI engineering portfolio project. Certain commercial features (live payment gateways, real-world shipping logistics) are mocked or simulated. The LLM runs locally via Ollama, requiring adequate local compute, though the architecture allows for easy swapping to cloud models.

👨‍💻 Author
PBKamani

GitHub Profile

Repository

📄 License
Created for educational, portfolio, and AI engineering purposes. Please review and attach an appropriate open-source license before distributing or modifying for commercial use.
