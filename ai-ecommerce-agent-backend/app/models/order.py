from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from ..database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    subtotal = Column(Float, nullable=False)
    discount = Column(Float, default=0.0, nullable=False)
    shipping_cost = Column(Float, default=0.0, nullable=False)
    total = Column(Float, nullable=False)
    status = Column(String(50), default="ORDER_PLACED", index=True, nullable=False)
    payment_method = Column(String(50), default="SIMULATED", nullable=False)
    
    # Shipping details
    shipping_name = Column(String(255), nullable=False)
    shipping_email = Column(String(255), nullable=False)
    shipping_phone = Column(String(50), nullable=True)
    shipping_address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False)
    state = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)

    order_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    estimated_delivery_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationships
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    delivery = relationship("Delivery", back_populates="order", uselist=False, cascade="all, delete-orphan")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    product_title = Column(String(255), nullable=False)
    product_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False)
    selected_size = Column(String(50), nullable=True)
    subtotal = Column(Float, nullable=False)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product")
