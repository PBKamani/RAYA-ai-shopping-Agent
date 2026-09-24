from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional
from ..database import get_db
from ..services.product_service import ProductService
from ..schemas.product import (
    ProductResponse,
    ProductListResponse,
    CategoryCountResponse,
    FilterOptionsResponse,
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=ProductListResponse)
def list_products(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query across title, category, colour, description"),
    category: Optional[str] = Query(None, description="Master category filter (e.g. Apparel, Footwear, Accessories)"),
    gender: Optional[str] = Query(None, description="Gender filter (e.g. Men, Women, Unisex)"),
    sub_category: Optional[str] = Query(None, description="Sub category filter (e.g. Topwear, Shoes, Bags)"),
    article_type: Optional[str] = Query(None, description="Article type filter (e.g. Tshirts, Jackets, Sneakers)"),
    colour: Optional[str] = Query(None, description="Colour filter"),
    season: Optional[str] = Query(None, description="Season filter"),
    usage: Optional[str] = Query(None, description="Usage filter (e.g. Casual, Sports, Formal)"),
    min_price: Optional[float] = Query(None, ge=0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0, description="Maximum price filter"),
    in_stock: Optional[bool] = Query(None, description="In-stock filter"),
    sort_by: Optional[str] = Query(None, description="Sort order: price_asc, price_desc, rating_desc, popular, newest"),
    db: Session = Depends(get_db),
):
    return ProductService.get_products(
        db=db,
        page=page,
        limit=limit,
        search=search,
        category=category,
        gender=gender,
        sub_category=sub_category,
        article_type=article_type,
        colour=colour,
        season=season,
        usage=usage,
        min_price=min_price,
        max_price=max_price,
        in_stock=in_stock,
        sort_by=sort_by,
    )


@router.get("/categories", response_model=CategoryCountResponse)
def get_categories(db: Session = Depends(get_db)):
    """Dynamically calculated categories and counts from PostgreSQL database (no hardcoding)."""
    return ProductService.get_category_counts(db)


@router.get("/filters", response_model=FilterOptionsResponse)
def get_filters(db: Session = Depends(get_db)):
    """Dynamically available filter options from the products database."""
    return ProductService.get_filter_options(db)


@router.get("/{id}", response_model=ProductResponse)
def get_product(id: int, db: Session = Depends(get_db)):
    product = ProductService.get_product_by_id(db, id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID {id} not found"
        )
    return product
