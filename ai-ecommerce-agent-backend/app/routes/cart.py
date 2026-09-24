from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..services.cart_service import CartService
from ..schemas.cart import CartResponse, CartItemCreate, CartItemUpdate

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("/{user_id}", response_model=CartResponse)
def get_cart(user_id: int, db: Session = Depends(get_db)):
    """Retrieve user cart with server-side calculated prices and totals."""
    return CartService.get_cart_details(db, user_id)


@router.post("/{user_id}/items", response_model=CartResponse, status_code=status.HTTP_201_CREATED)
def add_to_cart(user_id: int, payload: CartItemCreate, db: Session = Depends(get_db)):
    """Add a product item to the user's cart."""
    return CartService.add_item(
        db=db,
        user_id=user_id,
        product_id=payload.product_id,
        quantity=payload.quantity,
        selected_size=payload.selected_size,
    )


@router.put("/{user_id}/items/{item_id}", response_model=CartResponse)
def update_cart_item(user_id: int, item_id: int, payload: CartItemUpdate, db: Session = Depends(get_db)):
    """Update item quantity in user's cart."""
    return CartService.update_item_quantity(
        db=db,
        user_id=user_id,
        item_id=item_id,
        quantity=payload.quantity,
    )


@router.delete("/{user_id}/items/{item_id}", response_model=CartResponse)
def remove_from_cart(user_id: int, item_id: int, db: Session = Depends(get_db)):
    """Remove a single item from the cart."""
    return CartService.remove_item(
        db=db,
        user_id=user_id,
        item_id=item_id,
    )


@router.delete("/{user_id}", response_model=CartResponse)
def clear_cart(user_id: int, db: Session = Depends(get_db)):
    """Empty all items from the cart."""
    return CartService.clear_cart(db, user_id)
