from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from .product import ProductResponse


class CartItemBase(BaseModel):
    product_id: int
    quantity: int = Field(1, ge=1)
    selected_size: Optional[str] = None


class CartItemCreate(CartItemBase):
    pass


class CartItemUpdate(BaseModel):
    quantity: int = Field(..., ge=1)


class CartItemResponse(BaseModel):
    id: int
    cart_id: int
    product_id: int
    quantity: int
    selected_size: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    product: Optional[ProductResponse] = None
    item_subtotal: float

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: int
    user_id: int
    items: List[CartItemResponse]
    total_quantity: int
    subtotal: float
    estimated_shipping: float
    total: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
