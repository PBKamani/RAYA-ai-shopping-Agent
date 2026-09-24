from .users import router as users_router
from .products import router as products_router
from .cart import router as cart_router
from .wishlist import router as wishlist_router
from .orders import router as orders_router
from .reviews import router as reviews_router
from .agent import router as agent_router
from .auth import router as auth_router

__all__ = [
    "users_router",
    "products_router",
    "cart_router",
    "wishlist_router",
    "orders_router",
    "reviews_router",
    "agent_router",
    "auth_router",
]

