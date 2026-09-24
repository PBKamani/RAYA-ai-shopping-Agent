from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(UserBase):
    id: int
    is_demo_user: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    user: UserResponse
    token: str
    token_type: str = "bearer"

