from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.wishlist import Wishlist, WishlistItem
from ..models.product import Product
from ..schemas.wishlist import (
    WishlistResponse,
    WishlistItemCreate,
    WishlistCheckResponse,
)

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


def get_or_create_wishlist(db: Session, user_id: int) -> Wishlist:
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
    if not wishlist:
        wishlist = Wishlist(user_id=user_id)
        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)
    return wishlist


def format_wishlist_response(wishlist: Wishlist) -> dict:
    items_payload = []
    for item in wishlist.items:
        items_payload.append({
            "id": item.id,
            "wishlist_id": item.wishlist_id,
            "product_id": item.product_id,
            "created_at": item.created_at,
            "product": item.product,
        })
    return {
        "id": wishlist.id,
        "user_id": wishlist.user_id,
        "items": items_payload,
        "total_items": len(items_payload),
        "created_at": wishlist.created_at,
        "updated_at": wishlist.updated_at,
    }


@router.get("/{user_id}", response_model=WishlistResponse)
def get_wishlist(user_id: int, db: Session = Depends(get_db)):
    wishlist = get_or_create_wishlist(db, user_id)
    return format_wishlist_response(wishlist)


@router.post("/{user_id}/items", response_model=WishlistResponse, status_code=status.HTTP_201_CREATED)
def add_to_wishlist(user_id: int, payload: WishlistItemCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == payload.product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    wishlist = get_or_create_wishlist(db, user_id)

    # Prevent duplicate wishlist products for the same user
    existing = (
        db.query(WishlistItem)
        .filter(WishlistItem.wishlist_id == wishlist.id, WishlistItem.product_id == payload.product_id)
        .first()
    )
    if not existing:
        item = WishlistItem(wishlist_id=wishlist.id, product_id=payload.product_id)
        db.add(item)
        db.commit()
        db.refresh(wishlist)

    return format_wishlist_response(wishlist)


@router.delete("/{user_id}/items/{product_id}", response_model=WishlistResponse)
def remove_from_wishlist(user_id: int, product_id: int, db: Session = Depends(get_db)):
    wishlist = get_or_create_wishlist(db, user_id)
    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.wishlist_id == wishlist.id, WishlistItem.product_id == product_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not in wishlist")

    db.delete(item)
    db.commit()
    db.refresh(wishlist)
    return format_wishlist_response(wishlist)


@router.get("/{user_id}/check/{product_id}", response_model=WishlistCheckResponse)
def check_product_in_wishlist(user_id: int, product_id: int, db: Session = Depends(get_db)):
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
    if not wishlist:
        return {"is_wishlisted": False, "product_id": product_id}

    item = (
        db.query(WishlistItem)
        .filter(WishlistItem.wishlist_id == wishlist.id, WishlistItem.product_id == product_id)
        .first()
    )
    return {"is_wishlisted": bool(item), "product_id": product_id}
