from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from .delivery import DeliveryResponse


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    product_id: Optional[int] = None
    product_title: str
    product_price: float
    quantity: int
    selected_size: Optional[str] = None
    subtotal: float

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    user_id: int
    shipping_name: str = Field(..., min_length=1, max_length=255)
    shipping_email: EmailStr
    shipping_phone: Optional[str] = None
    shipping_address: str = Field(..., min_length=5)
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=1)
    postal_code: str = Field(..., min_length=2)
    discount_code: Optional[str] = None
    payment_method: Optional[str] = "SIMULATED"


class OrderResponse(BaseModel):
    id: int
    user_id: int
    order_number: str
    subtotal: float
    discount: float
    shipping_cost: float
    total: float
    status: str
    payment_method: str
    shipping_name: str
    shipping_email: str
    shipping_phone: Optional[str] = None
    shipping_address: str
    city: str
    state: str
    postal_code: str
    order_date: datetime
    estimated_delivery_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []
    delivery: Optional[DeliveryResponse] = None

    class Config:
        from_attributes = True


class OrderCancelResponse(BaseModel):
    success: bool
    message: str
    order_number: str
    status: str
