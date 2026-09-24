from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DeliveryResponse(BaseModel):
    id: int
    order_id: int
    status: str
    confirmation_date: Optional[datetime] = None
    processing_date: Optional[datetime] = None
    shipped_date: Optional[datetime] = None
    out_for_delivery_date: Optional[datetime] = None
    delivered_date: Optional[datetime] = None
    estimated_delivery_date: Optional[datetime] = None
    updated_at: datetime

    class Config:
        from_attributes = True
