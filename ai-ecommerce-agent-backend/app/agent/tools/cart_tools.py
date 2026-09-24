"""
Authoritative Cart Management Tools for RAYA ATELIER AI Shopping Concierge.
All operations interact directly with PostgreSQL through the CartService.
Database is the single source of truth.
"""
import json
import logging
from langchain_core.tools import tool
from ...database import SessionLocal
from ...services.cart_service import CartService
from ...models.cart import Cart, CartItem
from ...models.product import Product
from fastapi import HTTPException

logger = logging.getLogger("raya_atelier_cart_tools")


@tool
def get_cart(user_id: int = 1) -> str:
    """
    Get the current shopping cart contents for a user directly from PostgreSQL.
    ALWAYS call this tool whenever the user asks about their bag or cart contents.
    NEVER answer cart questions from previous conversation memory.
    """
    db = SessionLocal()
    try:
        cart = CartService.get_cart_details(db=db, user_id=user_id)
        items = cart.get("items", [])
        if not items:
            return json.dumps({
                "items": [],
                "item_count": 0,
                "subtotal": 0.0,
                "total": 0.0,
                "message": "Your shopping bag is currently empty."
            })

        formatted_items = []
        for item in items:
            product = item.get("product")
            formatted_items.append({
                "cart_item_id": item["id"],
                "product_id": item["product_id"],
                "title": product.title if product else f"Product #{item['product_id']}",
                "price": product.price if product else 0.0,
                "quantity": item["quantity"],
                "size": item.get("selected_size") or "Standard",
                "image": product.image if product else "",
                "item_subtotal": item["item_subtotal"],
            })

        result = {
            "items": formatted_items,
            "item_count": cart["total_quantity"],
            "subtotal": cart["subtotal"],
            "estimated_shipping": cart["estimated_shipping"],
            "total": cart["total"],
        }
        logger.info(f"[CART] get_cart(user_id={user_id}) returned {len(formatted_items)} items")
        return json.dumps(result)
    except Exception as e:
        logger.error(f"[CART] Error in get_cart: {e}")
        return json.dumps({"error": str(e), "items": [], "item_count": 0, "subtotal": 0.0})
    finally:
        db.close()


@tool
def add_to_cart(product_id: int, user_id: int = 1, quantity: int = 1, selected_size: str = "") -> str:
    """
    Add a product to the user's shopping cart in PostgreSQL.
    Validates product availability and stock before adding.
    Returns the real database transaction result.
    """
    db = SessionLocal()
    try:
        logger.info(f"[CART] add_to_cart: user={user_id}, product={product_id}, qty={quantity}, size={selected_size}")
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return json.dumps({
                "success": False,
                "message": f"Product with ID {product_id} was not found in catalog."
            })

        if not product.in_stock or product.stock_count < quantity:
            return json.dumps({
                "success": False,
                "message": f"Sorry, '{product.title}' has insufficient stock (available: {product.stock_count})."
            })

        size = selected_size if selected_size else (product.sizes[0] if product.sizes else "M")
        cart = CartService.add_item(
            db=db,
            user_id=user_id,
            product_id=product_id,
            quantity=quantity,
            selected_size=size,
        )

        result = {
            "success": True,
            "product_id": product.id,
            "product_title": product.title,
            "quantity": quantity,
            "size": size,
            "cart_total": cart["total"],
            "item_count": cart["total_quantity"],
            "message": f"Successfully added '{product.title}' (Size: {size}, Qty: {quantity}) to shopping bag. Bag now has {cart['total_quantity']} item(s)."
        }
        logger.info(f"[CART] add_to_cart success: {result['message']}")
        return json.dumps(result)
    except HTTPException as e:
        logger.warning(f"[CART] HTTPException in add_to_cart: {e.detail}")
        return json.dumps({"success": False, "message": str(e.detail)})
    except Exception as e:
        logger.error(f"[CART] Error in add_to_cart: {e}")
        return json.dumps({"success": False, "message": f"Unable to add product to bag: {str(e)}"})
    finally:
        db.close()


@tool
def remove_from_cart(item_id: int = 0, product_id: int = 0, keyword: str = "", user_id: int = 1) -> str:
    """
    Remove an item from the user's cart in PostgreSQL.
    Can identify the item by cart item_id, product_id, or by a search keyword (e.g. 'jersey', 'shoes', 'shirt').
    """
    db = SessionLocal()
    try:
        logger.info(f"[CART] remove_from_cart: user={user_id}, item_id={item_id}, product_id={product_id}, keyword='{keyword}'")
        cart_model = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart_model or not cart_model.items:
            return json.dumps({"success": False, "message": "Your shopping bag is already empty."})

        target_item = None
        if item_id > 0:
            target_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart_model.id).first()
            # If not found by cart_item_id, check if item_id was actually a product_id
            if not target_item:
                target_item = db.query(CartItem).filter(CartItem.product_id == item_id, CartItem.cart_id == cart_model.id).first()
        elif product_id > 0:
            target_item = db.query(CartItem).filter(CartItem.product_id == product_id, CartItem.cart_id == cart_model.id).first()
        elif keyword:
            kw = keyword.strip().lower()
            for ci in cart_model.items:
                p = ci.product
                if p and (kw in p.title.lower() or kw in p.sub_category.lower() or kw in p.article_type.lower() or kw in p.colour.lower()):
                    target_item = ci
                    break

        if not target_item:
            return json.dumps({
                "success": False,
                "message": "Could not find that matching item in your shopping bag. Please check your bag contents first."
            })

        removed_title = target_item.product.title if target_item.product else f"Item #{target_item.id}"
        cart = CartService.remove_item(db=db, user_id=user_id, item_id=target_item.id)

        result = {
            "success": True,
            "removed_item_id": target_item.id,
            "removed_product_title": removed_title,
            "cart_total": cart["total"],
            "item_count": cart["total_quantity"],
            "message": f"Removed '{removed_title}' from your shopping bag. Bag now has {cart['total_quantity']} item(s)."
        }
        logger.info(f"[CART] remove_from_cart success: {result['message']}")
        return json.dumps(result)
    except HTTPException as e:
        return json.dumps({"success": False, "message": str(e.detail)})
    except Exception as e:
        logger.error(f"[CART] Error in remove_from_cart: {e}")
        return json.dumps({"success": False, "message": f"Unable to remove item: {str(e)}"})
    finally:
        db.close()


@tool
def update_cart_quantity(quantity: int, item_id: int = 0, product_id: int = 0, user_id: int = 1) -> str:
    """
    Update the quantity of an item in the user's cart in PostgreSQL.
    Specify item_id or product_id along with the new quantity.
    """
    db = SessionLocal()
    try:
        cart_model = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart_model:
            return json.dumps({"success": False, "message": "Shopping bag not found."})

        target_item = None
        if item_id > 0:
            target_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.cart_id == cart_model.id).first()
            if not target_item:
                target_item = db.query(CartItem).filter(CartItem.product_id == item_id, CartItem.cart_id == cart_model.id).first()
        elif product_id > 0:
            target_item = db.query(CartItem).filter(CartItem.product_id == product_id, CartItem.cart_id == cart_model.id).first()

        if not target_item:
            return json.dumps({"success": False, "message": "Item not found in your shopping bag."})

        cart = CartService.update_item_quantity(db=db, user_id=user_id, item_id=target_item.id, quantity=quantity)
        return json.dumps({
            "success": True,
            "item_id": target_item.id,
            "quantity": quantity,
            "cart_total": cart["total"],
            "item_count": cart["total_quantity"],
            "message": f"Updated quantity of '{target_item.product.title}' to {quantity}. New bag total: ${cart['total']:.2f}"
        })
    except HTTPException as e:
        return json.dumps({"success": False, "message": str(e.detail)})
    except Exception as e:
        return json.dumps({"success": False, "message": f"Unable to update quantity: {str(e)}"})
    finally:
        db.close()


@tool
def clear_cart(user_id: int = 1) -> str:
    """
    Empty all items from the user's shopping cart in PostgreSQL.
    """
    db = SessionLocal()
    try:
        CartService.clear_cart(db=db, user_id=user_id)
        logger.info(f"[CART] clear_cart executed for user_id={user_id}")
        return json.dumps({
            "success": True,
            "item_count": 0,
            "cart_total": 0.0,
            "message": "All items have been removed and your shopping bag has been cleared. Your bag is now completely empty."
        })
    except Exception as e:
        logger.error(f"[CART] Error clearing cart: {e}")
        return json.dumps({"success": False, "message": f"Error clearing shopping bag: {str(e)}"})
    finally:
        db.close()


@tool
def calculate_cart_total(items_filter: str = "", user_id: int = 1) -> str:
    """
    Calculate the total cost of items in the shopping cart using authoritative database prices.
    If items_filter is provided (e.g. 'shirt', 'shoes', or product names), calculates the subtotal for ONLY those matching items (selective cart calculation).
    """
    db = SessionLocal()
    try:
        cart = CartService.get_cart_details(db=db, user_id=user_id)
        items = cart.get("items", [])
        if not items:
            return json.dumps({
                "subtotal": 0.0,
                "total": 0.0,
                "message": "Your bag is empty, so total is $0.00."
            })

        filter_terms = [t.strip().lower() for t in items_filter.split(",") if t.strip()] if items_filter else []

        selected_items = []
        if filter_terms:
            for item in items:
                product = item.get("product")
                title = product.title.lower() if product else ""
                category = product.master_category.lower() if product else ""
                article = product.article_type.lower() if product else ""
                subcat = product.sub_category.lower() if product else ""

                for term in filter_terms:
                    if term in title or term in category or term in article or term in subcat:
                        selected_items.append(item)
                        break
        else:
            selected_items = items

        if not selected_items:
            return json.dumps({
                "matched_count": 0,
                "message": f"None of the items in your bag matched '{items_filter}'."
            })

        subtotal = round(sum(i["item_subtotal"] for i in selected_items), 2)
        shipping = 0.0 if subtotal >= 100.0 else 15.0
        total = round(subtotal + shipping, 2)

        breakdown = [
            f"{i['product'].title if i.get('product') else 'Item'} x{i['quantity']} (${i['item_subtotal']:.2f})"
            for i in selected_items
        ]

        return json.dumps({
            "selected_items": breakdown,
            "subtotal": subtotal,
            "shipping": shipping,
            "total": total,
            "message": f"Subtotal for {len(selected_items)} item(s): ${subtotal:.2f}. Shipping: ${shipping:.2f}. Total: ${total:.2f}."
        })
    except Exception as e:
        return json.dumps({"error": str(e)})
    finally:
        db.close()
