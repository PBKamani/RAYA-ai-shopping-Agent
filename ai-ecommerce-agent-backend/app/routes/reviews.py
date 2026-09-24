from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models.review import Review
from ..models.product import Product
from ..models.user import User
from ..schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(tags=["Reviews"])


def update_product_rating_metrics(db: Session, product_id: int):
    """Recalculates average rating and count on the product model."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return

    stats = (
        db.query(
            func.avg(Review.rating).label("avg_rating"),
            func.count(Review.id).label("count")
        )
        .filter(Review.product_id == product_id)
        .first()
    )

    if stats and stats.count > 0:
        product.rating = round(float(stats.avg_rating), 1)
        product.reviews_count = stats.count
    db.commit()


@router.get("/products/{product_id}/reviews", response_model=List[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    """Retrieve all customer reviews for a given product."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    reviews = (
        db.query(Review)
        .filter(Review.product_id == product_id)
        .order_by(Review.created_at.desc())
        .all()
    )

    # Attach user name if available
    response_items = []
    for r in reviews:
        user = db.query(User).filter(User.id == r.user_id).first()
        response_items.append({
            "id": r.id,
            "user_id": r.user_id,
            "product_id": r.product_id,
            "rating": r.rating,
            "title": r.title,
            "comment": r.comment,
            "created_at": r.created_at,
            "updated_at": r.updated_at,
            "user_name": user.name if user else "Customer",
        })
    return response_items


@router.post("/products/{product_id}/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def add_product_review(product_id: int, payload: ReviewCreate, db: Session = Depends(get_db)):
    """Submit a review for a product and update average rating."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")

    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    new_review = Review(
        user_id=payload.user_id,
        product_id=product_id,
        rating=payload.rating,
        title=payload.title,
        comment=payload.comment,
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    # Recalculate average rating & count
    update_product_rating_metrics(db, product_id)

    return {
        "id": new_review.id,
        "user_id": new_review.user_id,
        "product_id": new_review.product_id,
        "rating": new_review.rating,
        "title": new_review.title,
        "comment": new_review.comment,
        "created_at": new_review.created_at,
        "updated_at": new_review.updated_at,
        "user_name": user.name,
    }


@router.delete("/reviews/{review_id}", status_code=status.HTTP_200_OK)
def delete_review(review_id: int, db: Session = Depends(get_db)):
    """Delete a review and update product average rating."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")

    product_id = review.product_id
    db.delete(review)
    db.commit()

    update_product_rating_metrics(db, product_id)
    return {"message": "Review successfully deleted"}
