from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, Any
from ..models.cart import Cart, CartItem
from ..models.product import Product


class CartService:

    @staticmethod
    def get_or_create_cart(db: Session, user_id: int) -> Cart:
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            db.add(cart)
            db.commit()
            db.refresh(cart)
        return cart

    @staticmethod
    def get_cart_details(db: Session, user_id: int) -> Dict[str, Any]:
        cart = CartService.get_or_create_cart(db, user_id)
        
        items_payload = []
        subtotal = 0.0
        total_quantity = 0

        for item in cart.items:
            product = item.product
            # Calculate price directly from authoritative database record
            unit_price = product.price if product else 0.0
            item_subtotal = round(unit_price * item.quantity, 2)
            subtotal += item_subtotal
            total_quantity += item.quantity

            items_payload.append({
                "id": item.id,
                "cart_id": item.cart_id,
                "product_id": item.product_id,
                "quantity": item.quantity,
                "selected_size": item.selected_size,
                "created_at": item.created_at,
                "updated_at": item.updated_at,
                "product": product,
                "item_subtotal": item_subtotal,
            })

        subtotal = round(subtotal, 2)
        # Complimentary shipping for orders over $100
        shipping = 0.0 if (subtotal >= 100.0 or subtotal == 0.0) else 15.0
        total = round(subtotal + shipping, 2)

        return {
            "id": cart.id,
            "user_id": cart.user_id,
            "items": items_payload,
            "total_quantity": total_quantity,
            "subtotal": subtotal,
            "estimated_shipping": shipping,
            "total": total,
            "created_at": cart.created_at,
            "updated_at": cart.updated_at,
        }

    @staticmethod
    def add_item(db: Session, user_id: int, product_id: int, quantity: int, selected_size: str = None) -> Dict[str, Any]:
        if quantity <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be at least 1")

        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
        if not product.in_stock or product.stock_count < quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Requested quantity exceeds available stock")

        cart = CartService.get_or_create_cart(db, user_id)

        # Check if item with same product and size already exists in cart
        existing_item = (
            db.query(CartItem)
            .filter(
                CartItem.cart_id == cart.id,
                CartItem.product_id == product_id,
                CartItem.selected_size == selected_size,
            )
            .first()
        )

        if existing_item:
            new_qty = existing_item.quantity + quantity
            if new_qty > product.stock_count:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Total cart quantity exceeds stock")
            existing_item.quantity = new_qty
        else:
            new_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity,
                selected_size=selected_size,
            )
            db.add(new_item)

        db.commit()
        return CartService.get_cart_details(db, user_id)

    @staticmethod
    def update_item_quantity(db: Session, user_id: int, item_id: int, quantity: int) -> Dict[str, Any]:
        if quantity <= 0:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity must be at least 1")

        cart = CartService.get_or_create_cart(db, user_id)
        item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

        if item.product and item.product.stock_count < quantity:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Quantity exceeds available stock")

        item.quantity = quantity
        db.commit()
        return CartService.get_cart_details(db, user_id)

    @staticmethod
    def remove_item(db: Session, user_id: int, item_id: int) -> Dict[str, Any]:
        cart = CartService.get_or_create_cart(db, user_id)
        item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart.id).first()
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found")

        db.delete(item)
        db.commit()
        return CartService.get_cart_details(db, user_id)

    @staticmethod
    def clear_cart(db: Session, user_id: int) -> Dict[str, Any]:
        cart = CartService.get_or_create_cart(db, user_id)
        db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        db.commit()
        return CartService.get_cart_details(db, user_id)
