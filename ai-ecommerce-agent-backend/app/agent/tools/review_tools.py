"""Review lookup and summarization tools for the AI shopping agent."""
from langchain_core.tools import tool
from ...database import SessionLocal
from ...models.review import Review
from ...models.product import Product


@tool
def get_product_reviews(product_id: int) -> str:
    """Get customer reviews for a specific product by product ID. Shows ratings, titles, and review comments."""
    db = SessionLocal()
    try:
        reviews = db.query(Review).filter(Review.product_id == product_id).all()
        if not reviews:
            return f"No customer reviews found for product ID {product_id} yet."

        lines = [f"--- Customer Reviews for Product {product_id} ({len(reviews)} reviews) ---"]
        for r in reviews:
            lines.append(f"Rating: {r.rating}/5 | {r.title}\nComment: {r.comment}\n")
        return "\n".join(lines)
    except Exception as e:
        return f"Error getting product reviews: {e}"
    finally:
        db.close()


@tool
def summarize_product_reviews(product_id: int) -> str:
    """Get a summary of reviews for a product by product ID, including average rating, total review count, and recent feedback themes."""
    db = SessionLocal()
    try:
        product = db.query(Product).filter(Product.id == product_id).first()
        if not product:
            return f"Product with ID {product_id} not found."

        reviews = db.query(Review).filter(Review.product_id == product_id).all()
        if not reviews:
            return f"Product '{product.title}' has no written reviews yet. Current catalog rating: {product.rating}/5."

        sample_titles = [f'"{r.title}"' for r in reviews[:5] if r.title]
        return (
            f"Review Summary for '{product.title}':\n"
            f"Average Rating: {product.rating}/5 across {product.reviews_count} reviews.\n"
            f"Recent Review Highlights: {', '.join(sample_titles) if sample_titles else 'Generally positive customer feedback.'}"
        )
    except Exception as e:
        return f"Error summarizing reviews: {e}"
    finally:
        db.close()
