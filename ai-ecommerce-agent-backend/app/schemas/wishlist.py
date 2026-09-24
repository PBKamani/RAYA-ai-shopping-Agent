from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .product import ProductResponse


class WishlistItemCreate(BaseModel):
    product_id: int


class WishlistItemResponse(BaseModel):
    id: int
    wishlist_id: int
    product_id: int
    created_at: datetime
    product: Optional[ProductResponse] = None

    class Config:
        from_attributes = True


class WishlistResponse(BaseModel):
    id: int
    user_id: int
    items: List[WishlistItemResponse]
    total_items: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WishlistCheckResponse(BaseModel):
    is_wishlisted: bool
    product_id: int
