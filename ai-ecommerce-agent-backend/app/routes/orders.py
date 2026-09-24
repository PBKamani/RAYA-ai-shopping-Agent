from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..services.order_service import OrderService
from ..schemas.order import (
    OrderCreate,
    OrderResponse,
    OrderCancelResponse,
)

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    """
    Creates an order from the user's active cart.
    Validates inventory, snapshots product pricing, decrements stock, creates delivery, and clears cart.
    """
    return OrderService.create_order(db, payload)


@router.get("/order/{order_number}", response_model=OrderResponse)
def get_order_by_number(order_number: str, db: Session = Depends(get_db)):
    """Retrieve full order details and tracking status by order number."""
    order = OrderService.get_order_by_number(db, order_number)
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Order '{order_number}' not found"
        )
    return order


@router.post("/{order_number}/cancel", response_model=OrderCancelResponse)
def cancel_order(order_number: str, db: Session = Depends(get_db)):
    """Cancel an active order and restore product stock count."""
    order = OrderService.cancel_order(db, order_number)
    return {
        "success": True,
        "message": f"Order {order_number} has been cancelled and stock restored",
        "order_number": order.order_number,
        "status": order.status,
    }


@router.get("/{user_id}", response_model=List[OrderResponse])
def get_user_orders(user_id: int, db: Session = Depends(get_db)):
    """List all orders for a specific user."""
    return OrderService.get_user_orders(db, user_id)
