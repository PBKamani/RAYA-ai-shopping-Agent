from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import relationship
from ..database import Base


class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), index=True, nullable=False)
    rating = Column(Float, nullable=False)
    title = Column(String(255), nullable=True)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="reviews")
    product = relationship("Product", back_populates="reviews")

    __table_args__ = (
        CheckConstraint("rating >= 1.0 AND rating <= 5.0", name="chk_review_rating_range"),
    )
