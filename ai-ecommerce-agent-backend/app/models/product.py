from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, JSON, Index, func
from sqlalchemy.orm import relationship
from ..database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    brand = Column(String(100), default="RAYA ATELIER", index=True)
    gender = Column(String(50), index=True)
    master_category = Column(String(100), index=True)
    sub_category = Column(String(100), index=True)
    article_type = Column(String(100), index=True)
    colour = Column(String(50), index=True)
    season = Column(String(50), index=True)
    year = Column(String(20), nullable=True)
    usage = Column(String(50), index=True)
    price = Column(Float, nullable=False, index=True)
    original_price = Column(Float, nullable=True)
    rating = Column(Float, default=4.5)
    reviews_count = Column(Integer, default=0)
    image = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    fabric = Column(String(255), nullable=True)
    stock_count = Column(Integer, default=12)
    in_stock = Column(Boolean, default=True, index=True)
    sizes = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")


# Explicit composite / additional indexes
Index("ix_products_category_gender", Product.master_category, Product.gender)
Index("ix_products_price_in_stock", Product.price, Product.in_stock)
