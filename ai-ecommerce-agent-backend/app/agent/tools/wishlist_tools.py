from langchain_core.tools import tool
from ...database import SessionLocal
from ...models.wishlist import Wishlist, WishlistItem
from ...models.product import Product

@tool
def get_wishlist(user_id: int = 1) -> str:
    """Get all products in the user's wishlist. Shows product names, prices, and IDs. Use this to check what the user has saved for later."""
    db = SessionLocal()
    try:
        wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
        if not wishlist or not wishlist.items:
            return "Wishlist is empty."
            
        lines = ["--- Wishlist ---"]
        for item in wishlist.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if product:
                sale = ""
                if product.original_price and product.original_price > product.price:
                    sale = f" (was ${product.original_price:.2f})"
                lines.append(f"ID: {product.id} | {product.title} | ${product.price:.2f}{sale}")
                
        return "\n".join(lines) if len(lines) > 1 else "Wishlist is empty."
    except Exception as e:
        return f"Error retrieving wishlist: {e}"
    finally:
        db.close()

@tool
def add_to_wishlist(product_id: int, user_id: int = 1) -> str:
    """Add a product to the user's wishlist (save for later). Prevents duplicates. Use the product_id from search results."""
    db = SessionLocal()
    try:
        wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
        if not wishlist:
            wishlist = Wishlist(user_id=user_id)
            db.add(wishlist)
            db.commit()
            db.refresh(wishlist)
            
        existing = db.query(WishlistItem).filter(WishlistItem.wishlist_id == wishlist.id, WishlistItem.product_id == product_id).first()
        if existing:
            return "Product is already in wishlist."
            
        new_item = WishlistItem(wishlist_id=wishlist.id, product_id=product_id)
        db.add(new_item)
        db.commit()
        return "Product added to wishlist successfully."
    except Exception as e:
        db.rollback()
        return f"Error adding to wishlist: {str(e)}"
    finally:
        db.close()

@tool
def remove_from_wishlist(product_id: int, user_id: int = 1) -> str:
    """Remove a product from the user's wishlist. Use the product_id to identify which product to remove."""
    db = SessionLocal()
    try:
        wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
        if not wishlist:
            return "Wishlist not found."
            
        item = db.query(WishlistItem).filter(WishlistItem.wishlist_id == wishlist.id, WishlistItem.product_id == product_id).first()
        if not item:
            return "Product not in wishlist."
            
        db.delete(item)
        db.commit()
        return "Product removed from wishlist."
    except Exception as e:
        db.rollback()
        return f"Error removing from wishlist: {str(e)}"
    finally:
        db.close()

@tool
def check_wishlist(product_id: int, user_id: int = 1) -> str:
    """Check if a specific product is in the user's wishlist. Returns whether the product is saved or not."""
    db = SessionLocal()
    try:
        wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).first()
        if not wishlist:
            return "Product is NOT in wishlist."
            
        item = db.query(WishlistItem).filter(WishlistItem.wishlist_id == wishlist.id, WishlistItem.product_id == product_id).first()
        return "Product is in wishlist." if item else "Product is NOT in wishlist."
    except Exception as e:
        return f"Error checking wishlist: {str(e)}"
    finally:
        db.close()

