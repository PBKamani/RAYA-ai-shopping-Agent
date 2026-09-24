from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from ..database import Base


class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    status = Column(String(50), default="ORDER_PLACED", nullable=False)
    
    # Milestone dates
    confirmation_date = Column(DateTime(timezone=True), nullable=True)
    processing_date = Column(DateTime(timezone=True), nullable=True)
    shipped_date = Column(DateTime(timezone=True), nullable=True)
    out_for_delivery_date = Column(DateTime(timezone=True), nullable=True)
    delivered_date = Column(DateTime(timezone=True), nullable=True)
    estimated_delivery_date = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    order = relationship("Order", back_populates="delivery")
