from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging

from .config import settings
from .database import engine, Base, check_db_connection
from .models import *  # Ensure all models are registered
from .routes import (
    users_router,
    products_router,
    cart_router,
    wishlist_router,
    orders_router,
    reviews_router,
    agent_router,
    auth_router,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("raya_atelier_api")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    logger.info("Initializing database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        from sqlalchemy import text
        with engine.connect() as conn:
            for seq, table in [
                ("users_id_seq", "users"),
                ("carts_id_seq", "carts"),
                ("wishlists_id_seq", "wishlists"),
                ("orders_id_seq", "orders"),
                ("cart_items_id_seq", "cart_items"),
            ]:
                try:
                    conn.execute(text(f"SELECT setval('{seq}', (SELECT COALESCE(MAX(id), 1) FROM {table}));"))
                except Exception:
                    pass
            conn.commit()
        logger.info("Database schema and sequences initialized successfully.")
    except Exception as exc:
        logger.error(f"Failed to initialize database tables: {type(exc).__name__}")
    yield


app = FastAPI(
    title="RAYA ATELIER E-Commerce API",
    description="Backend API and PostgreSQL database foundation for the RAYA ATELIER AI E-commerce Shopping Agent.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
def health_check():
    """
    Service health check verifying application status and PostgreSQL database connection.
    Expected response:
    {
      "status": "ok",
      "database": "connected"
    }
    """
    db_ok = check_db_connection()
    if db_ok:
        return {"status": "ok", "database": "connected"}
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={"status": "degraded", "database": "disconnected"},
    )


# Mount API routers
app.include_router(users_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
app.include_router(wishlist_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(agent_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
# Also mount agent_router at root so /agent/chat works if VITE_AI_BACKEND_URL lacks /api
app.include_router(agent_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
