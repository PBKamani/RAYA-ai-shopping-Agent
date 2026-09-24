"""
Authentication routes for RAYA ATELIER.
Handles user registration, login, and current authenticated user retrieval with JWT.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import logging

from ..database import get_db
from ..models.user import User
from ..models.cart import Cart
from ..models.wishlist import Wishlist
from ..schemas.user import UserCreate, UserLogin, UserResponse, AuthResponse
from ..utils.security import hash_password, verify_password
from ..utils.auth import create_access_token, get_current_user

logger = logging.getLogger("raya_atelier_auth")

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new customer account.
    Creates user, hashes password securely, initializes an empty cart and wishlist,
    and returns a JWT access token.
    """
    email_clean = payload.email.lower().strip()
    logger.info(f"[AUTH] Register attempt for email: {email_clean}")

    existing = db.query(User).filter(User.email == email_clean).first()
    if existing:
        logger.warning(f"[AUTH] Registration failed - email already exists: {email_clean}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists",
        )

    new_user = User(
        name=payload.name.strip(),
        email=email_clean,
        password_hash=hash_password(payload.password),
        is_demo_user=False,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize user cart and wishlist
    cart = Cart(user_id=new_user.id)
    wishlist = Wishlist(user_id=new_user.id)
    db.add(cart)
    db.add(wishlist)
    db.commit()

    token = create_access_token(new_user.id, new_user.email)
    logger.info(f"[AUTH] User registered successfully: ID {new_user.id}")

    return AuthResponse(
        user=new_user,
        token=token,
        token_type="bearer",
    )


@router.post("/login", response_model=AuthResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate a customer with email and password.
    Returns the user profile and a JWT access token.
    """
    email_clean = payload.email.lower().strip()
    logger.info(f"[AUTH] Login attempt for email: {email_clean}")

    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(payload.password, user.password_hash):
        logger.warning(f"[AUTH] Login failed - invalid credentials for: {email_clean}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    token = create_access_token(user.id, user.email)
    logger.info(f"[AUTH] Login successful for user ID: {user.id}")

    return AuthResponse(
        user=user,
        token=token,
        token_type="bearer",
    )


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get profile of the currently authenticated user."""
    return current_user
