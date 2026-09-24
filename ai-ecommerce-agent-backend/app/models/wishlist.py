from sqlalchemy import Column, Integer, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.orm import relationship
from ..database import Base


class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="wishlist")
    items = relationship("WishlistItem", back_populates="wishlist", cascade="all, delete-orphan")


class WishlistItem(Base):
    __tablename__ = "wishlist_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    wishlist_id = Column(Integer, ForeignKey("wishlists.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    wishlist = relationship("Wishlist", back_populates="items")
    product = relationship("Product")

    # Prevent duplicate wishlist items for the same product in a user's wishlist
    __table_args__ = (
        UniqueConstraint("wishlist_id", "product_id", name="uq_wishlist_product"),
    )
