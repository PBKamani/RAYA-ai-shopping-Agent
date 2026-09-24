from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class ProductResponse(BaseModel):
    id: int
    title: str
    brand: Optional[str] = "RAYA ATELIER"
    gender: Optional[str] = None
    master_category: Optional[str] = None
    sub_category: Optional[str] = None
    article_type: Optional[str] = None
    colour: Optional[str] = None
    season: Optional[str] = None
    year: Optional[str] = None
    usage: Optional[str] = None
    price: float
    original_price: Optional[float] = None
    rating: float
    reviews_count: int
    image: str
    description: Optional[str] = None
    fabric: Optional[str] = None
    stock_count: int
    in_stock: bool
    sizes: List[str] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    products: List[ProductResponse]
    total: int
    page: int
    limit: int
    total_pages: int


class CategoryItem(BaseModel):
    name: str
    count: int


class CategoryCountResponse(BaseModel):
    total: int
    categories: List[CategoryItem]


class FilterOptionsResponse(BaseModel):
    genders: List[str]
    master_categories: List[str]
    sub_categories: List[str]
    article_types: List[str]
    colours: List[str]
    seasons: List[str]
    usages: List[str]
    price_range: Dict[str, float]
