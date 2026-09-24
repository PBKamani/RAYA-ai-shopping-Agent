from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    user_id: int
    rating: float = Field(..., ge=1.0, le=5.0)
    title: Optional[str] = Field(None, max_length=255)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: float
    title: Optional[str] = None
    comment: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user_name: Optional[str] = None

    class Config:
        from_attributes = True
