from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime, timezone
import secrets
from typing import Optional, List
from ..models.order import Order, OrderItem
from ..models.product import Product
from ..models.cart import Cart, CartItem
from ..schemas.order import OrderCreate
from .delivery_service import DeliveryService


class OrderService:

    @staticmethod
    def generate_order_number() -> str:
        """Generates a unique luxury order reference e.g., RAYA1025 or RAYA-8942."""
        num = secrets.randbelow(9000) + 1000
        return f"RAYA{num}"

    @staticmethod
    def create_order(db: Session, order_data: OrderCreate) -> Order:
        # 1. Read cart
        cart = db.query(Cart).filter(Cart.user_id == order_data.user_id).first()
        if not cart or not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot create order from an empty cart"
            )

        # 2 & 3. Validate products & stock
        cart_items_with_products = []
        for item in cart.items:
            product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
            if not product:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Product ID {item.product_id} no longer exists"
                )
            if product.stock_count < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{product.title}' has insufficient stock (available: {product.stock_count}, requested: {item.quantity})"
                )
            cart_items_with_products.append((item, product))

        # 4. Calculate subtotal server-side
        subtotal = 0.0
        for item, product in cart_items_with_products:
            subtotal += product.price * item.quantity
        subtotal = round(subtotal, 2)

        # 5. Apply discount if applicable
        discount = 0.0
        if order_data.discount_code:
            code = order_data.discount_code.strip().upper()
            if code in ("RAYA10", "WELCOME10"):
                discount = round(subtotal * 0.10, 2)
            elif code in ("RAYA20", "VIP20"):
                discount = round(subtotal * 0.20, 2)

        # 6. Calculate shipping
        shipping_cost = 0.0 if subtotal >= 100.0 else 15.0

        # 7. Calculate total
        total = round(max(0.0, subtotal - discount + shipping_cost), 2)

        # Generate unique order number
        while True:
            order_number = OrderService.generate_order_number()
            if not db.query(Order).filter(Order.order_number == order_number).first():
                break

        now = datetime.now(timezone.utc)
        delivery_sched = DeliveryService.generate_delivery_schedule(now)

        # 8. Create order
        new_order = Order(
            user_id=order_data.user_id,
            order_number=order_number,
            subtotal=subtotal,
            discount=discount,
            shipping_cost=shipping_cost,
            total=total,
            status="ORDER_PLACED",
            payment_method=order_data.payment_method or "SIMULATED",
            shipping_name=order_data.shipping_name,
            shipping_email=order_data.shipping_email,
            shipping_phone=order_data.shipping_phone,
            shipping_address=order_data.shipping_address,
            city=order_data.city,
            state=order_data.state,
            postal_code=order_data.postal_code,
            order_date=now,
            estimated_delivery_date=delivery_sched["estimated_delivery_date"],
        )
        db.add(new_order)
        db.flush()  # populate new_order.id

        # 9 & 10. Create order items (snapshot title & price) and reduce stock
        for item, product in cart_items_with_products:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=product.id,
                product_title=product.title,
                product_price=product.price,
                quantity=item.quantity,
                selected_size=item.selected_size,
                subtotal=round(product.price * item.quantity, 2),
            )
            db.add(order_item)

            # Reduce stock
            product.stock_count -= item.quantity
            product.in_stock = product.stock_count > 0

        # 11. Create delivery record
        delivery = DeliveryService.create_order_delivery(new_order.id, now)
        db.add(delivery)

        # 12. Clear cart
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()

        # Commit entire transaction atomically
        db.commit()
        db.refresh(new_order)
        return new_order

    @staticmethod
    def get_user_orders(db: Session, user_id: int) -> List[Order]:
        return (
            db.query(Order)
            .filter(Order.user_id == user_id)
            .order_by(Order.order_date.desc())
            .all()
        )

    @staticmethod
    def get_order_by_number(db: Session, order_number: str) -> Optional[Order]:
        return db.query(Order).filter(Order.order_number == order_number).first()

    @staticmethod
    def cancel_order(db: Session, order_number: str) -> Order:
        order = db.query(Order).filter(Order.order_number == order_number).first()
        if not order:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

        if order.status in ("SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Order cannot be cancelled in status '{order.status}'"
            )

        # Restore product stock
        for item in order.items:
            if item.product_id:
                product = db.query(Product).filter(Product.id == item.product_id).first()
                if product:
                    product.stock_count += item.quantity
                    product.in_stock = True

        order.status = "CANCELLED"
        if order.delivery:
            order.delivery.status = "CANCELLED"

        db.commit()
        db.refresh(order)
        return order
