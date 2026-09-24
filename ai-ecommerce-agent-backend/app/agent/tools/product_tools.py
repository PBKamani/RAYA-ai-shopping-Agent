"""Product search and lookup tools for the AI shopping agent."""
from langchain_core.tools import tool
from ...database import SessionLocal
from ...services.product_service import ProductService
from ...models.product import Product
from sqlalchemy import and_, or_


@tool
def search_products(
    keyword: str = "",
    category: str = "",
    sub_category: str = "",
    article_type: str = "",
    gender: str = "",
    colour: str = "",
    season: str = "",
    usage: str = "",
    min_price: float = 0,
    max_price: float = 0,
    on_sale: bool = False,
    in_stock: bool = True,
    limit: int = 5,
) -> str:
    """Search for fashion products in the RAYA ATELIER catalog. Use this tool to find products matching specific criteria like category, colour, price range, gender, or keywords. Set on_sale=True to show only discounted products. Returns a list of matching products with their details."""
    db = SessionLocal()
    try:
        # Normalize category: master categories are Apparel, Footwear, Accessories, Sporting Goods
        # If the LLM passes a specific clothing type like 'Shirts', 'Jackets', 'Shoes' as category, map to keyword
        valid_masters = {"apparel", "footwear", "accessories", "sporting goods"}
        clean_cat = category.strip() if category else ""
        clean_kw = keyword.strip() if keyword else ""

        if clean_cat and clean_cat.lower() not in valid_masters:
            if clean_kw:
                clean_kw = f"{clean_kw} {clean_cat}"
            else:
                clean_kw = clean_cat
            clean_cat = ""
        if on_sale:
            # Custom query for sale items (original_price > price)
            query = db.query(Product)
            if clean_kw:
                terms = clean_kw.strip().split()
                for t in terms:
                    pattern = f"%{t}%"
                    query = query.filter(
                        or_(
                            Product.title.ilike(pattern),
                            Product.brand.ilike(pattern),
                            Product.article_type.ilike(pattern),
                            Product.sub_category.ilike(pattern),
                            Product.colour.ilike(pattern),
                        )
                    )
            if clean_cat:
                query = query.filter(Product.master_category.ilike(clean_cat))
            if sub_category:
                query = query.filter(Product.sub_category.ilike(sub_category))
            if article_type:
                query = query.filter(Product.article_type.ilike(article_type))
            if gender:
                query = query.filter(Product.gender.ilike(gender))
            if colour:
                query = query.filter(Product.colour.ilike(colour))
            if season:
                query = query.filter(Product.season.ilike(season))
            if usage:
                query = query.filter(Product.usage.ilike(usage))
            if min_price > 0:
                query = query.filter(Product.price >= min_price)
            if max_price > 0:
                query = query.filter(Product.price <= max_price)
            if in_stock:
                query = query.filter(Product.in_stock == True)

            query = query.filter(
                and_(
                    Product.original_price.isnot(None),
                    Product.original_price > Product.price,
                )
            )
            products = query.limit(limit).all()
        else:
            result = ProductService.get_products(
                db=db,
                limit=limit,
                search=clean_kw or None,
                category=clean_cat or None,
                sub_category=sub_category or None,
                article_type=article_type or None,
                gender=gender or None,
                colour=colour or None,
                season=season or None,
                usage=usage or None,
                min_price=min_price if min_price > 0 else None,
                max_price=max_price if max_price > 0 else None,
                in_stock=in_stock if in_stock else None,
            )
            products = result.get("products", [])

        if not products:
            return "No products found matching your criteria."

        lines = []
        for p in products:
            sale_info = ""
            if p.original_price and p.original_price > p.price:
                discount = round((1 - p.price / p.original_price) * 100)
                sale_info = f" | Original Price: ${p.original_price:.2f} ({discount}% off)"
            lines.append(
                f"ID: {p.id} | {p.title} | Brand: {p.brand} | Colour: {p.colour} "
                f"| Price: ${p.price:.2f}{sale_info} | Rating: {p.rating}/5 "
                f"| Stock: {p.stock_count} | Image: {p.image}"
            )
        return "\n".join(lines)
    except Exception as e:
        return f"Error searching products: {e}"
    finally:
        db.close()


@tool
def get_product_details(product_id: int) -> str:
    """Get full details of a specific product by its ID. Returns all product information including description, sizes, fabric, price, and stock. Use this when a customer asks about a specific product."""
    db = SessionLocal()
    try:
        product = ProductService.get_product_by_id(db=db, product_id=product_id)
        if not product:
            return f"Product with ID {product_id} not found."

        sale_info = ""
        if product.original_price and product.original_price > product.price:
            discount = round((1 - product.price / product.original_price) * 100)
            sale_info = f"\nOriginal Price: ${product.original_price:.2f} ({discount}% off SALE)"

        return (
            f"Product ID: {product.id}\n"
            f"Title: {product.title}\n"
            f"Brand: {product.brand}\n"
            f"Price: ${product.price:.2f}{sale_info}\n"
            f"Category: {product.master_category}\n"
            f"Sub Category: {product.sub_category}\n"
            f"Article Type: {product.article_type}\n"
            f"Gender: {product.gender}\n"
            f"Colour: {product.colour}\n"
            f"Season: {product.season}\n"
            f"Usage: {product.usage}\n"
            f"Sizes: {', '.join(product.sizes) if product.sizes else 'N/A'}\n"
            f"Description: {product.description}\n"
            f"Stock: {product.stock_count} {'(In Stock)' if product.in_stock else '(Out of Stock)'}\n"
            f"Rating: {product.rating}/5 ({product.reviews_count} reviews)\n"
            f"Image: {product.image}"
        )
    except Exception as e:
        return f"Error retrieving product details: {e}"
    finally:
        db.close()


@tool
def check_stock(product_id: int) -> str:
    """Check stock availability for a specific product by product ID. Returns stock count, in-stock status, and available sizes."""
    db = SessionLocal()
    try:
        product = ProductService.get_product_by_id(db=db, product_id=product_id)
        if not product:
            return f"Product with ID {product_id} not found."

        sizes_str = ", ".join(product.sizes) if product.sizes else "N/A"
        status = "In Stock" if product.in_stock else "Out of Stock"
        return (
            f"{product.title}\n"
            f"Status: {status}\n"
            f"Stock Count: {product.stock_count}\n"
            f"Available Sizes: {sizes_str}"
        )
    except Exception as e:
        return f"Error checking product stock: {e}"
    finally:
        db.close()


check_product_stock = check_stock


@tool
def compare_products(product_id_1: int, product_id_2: int) -> str:
    """Compare two products side by side. Useful when a customer is deciding between two items. Shows price, rating, category, colour, and stock for both products."""
    db = SessionLocal()
    try:
        p1 = ProductService.get_product_by_id(db=db, product_id=product_id_1)
        p2 = ProductService.get_product_by_id(db=db, product_id=product_id_2)

        if not p1 and not p2:
            return "Neither product was found."
        if not p1:
            return f"Product {product_id_1} not found."
        if not p2:
            return f"Product {product_id_2} not found."

        def fmt(p):
            sale = ""
            if p.original_price and p.original_price > p.price:
                sale = f" (was ${p.original_price:.2f})"
            return (
                f"  Title: {p.title}\n"
                f"  Brand: {p.brand}\n"
                f"  Price: ${p.price:.2f}{sale}\n"
                f"  Rating: {p.rating}/5 ({p.reviews_count} reviews)\n"
                f"  Category: {p.master_category} > {p.sub_category} > {p.article_type}\n"
                f"  Colour: {p.colour}\n"
                f"  Sizes: {', '.join(p.sizes) if p.sizes else 'N/A'}\n"
                f"  Stock: {p.stock_count}"
            )

        return (
            f"--- Product 1 (ID: {p1.id}) ---\n{fmt(p1)}\n\n"
            f"--- Product 2 (ID: {p2.id}) ---\n{fmt(p2)}"
        )
    except Exception as e:
        return f"Error comparing products: {e}"
    finally:
        db.close()


@tool
def get_product_categories() -> str:
    """Get all available product categories with their product counts. Useful for showing the customer what types of products are available."""
    db = SessionLocal()
    try:
        data = ProductService.get_category_counts(db=db)
        if not data or not data.get("categories"):
            return "No categories found."

        lines = [f"Total Products: {data['total']}"]
        for cat in data["categories"]:
            lines.append(f"  {cat['name']}: {cat['count']} products")
        return "\n".join(lines)
    except Exception as e:
        return f"Error retrieving categories: {e}"
    finally:
        db.close()


@tool
def find_sale_products(limit: int = 5, category: str = "") -> str:
    """Find products currently on sale where original_price is greater than current price. NEVER hardcode sale items - this queries actual discounted items in PostgreSQL."""
    return search_products.invoke({"on_sale": True, "category": category, "limit": limit})


@tool
def find_products_by_color(color: str, category: str = "", limit: int = 5) -> str:
    """Search for products by specific color (e.g. 'Black', 'Blue', 'White', 'Navy') using authoritative catalog colour metadata."""
    return search_products.invoke({"colour": color, "category": category, "limit": limit})


@tool
def find_products_by_budget(max_price: float, category: str = "", limit: int = 5) -> str:
    """Find fashion products strictly within or under a specific budget limit (max_price) using actual database prices."""
    return search_products.invoke({"max_price": max_price, "category": category, "limit": limit})


@tool
def find_alternatives(product_id: int, limit: int = 3) -> str:
    """Find similar alternative products for a given product ID based on matching category, article type, and price range."""
    db = SessionLocal()
    try:
        product = ProductService.get_product_by_id(db=db, product_id=product_id)
        if not product:
            return f"Product with ID {product_id} not found."

        # Search for items in same article type or sub category, excluding current product
        query = (
            db.query(Product)
            .filter(
                Product.id != product_id,
                or_(
                    Product.article_type == product.article_type,
                    Product.sub_category == product.sub_category,
                ),
                Product.in_stock == True,
            )
            .order_by(Product.rating.desc())
            .limit(limit)
        )
        alternatives = query.all()
        if not alternatives:
            return f"No direct alternatives found for '{product.title}'."

        lines = [f"Curated alternatives for '{product.title}' (same category & silhouette):"]
        for p in alternatives:
            lines.append(
                f"ID: {p.id} | {p.title} | Brand: {p.brand} | Colour: {p.colour} | Price: ${p.price:.2f} | Rating: {p.rating}/5"
            )
        return "\n".join(lines)
    except Exception as e:
        return f"Error finding alternatives: {e}"
    finally:
        db.close()


@tool
def cross_category_recommendations(product_id: int, limit: int = 3) -> str:
    """Suggest complementary cross-category outfit pieces for a given product ID (e.g. recommend footwear or bags to pair with apparel)."""
    db = SessionLocal()
    try:
        product = ProductService.get_product_by_id(db=db, product_id=product_id)
        if not product:
            return f"Product with ID {product_id} not found."

        # Determine complementary master category
        complementary_categories = []
        if product.master_category == "Apparel":
            complementary_categories = ["Footwear", "Accessories"]
        elif product.master_category == "Footwear":
            complementary_categories = ["Apparel", "Accessories"]
        else:
            complementary_categories = ["Apparel", "Footwear"]

        lines = [f"Complementary outfit pairings for '{product.title}' ({product.colour} {product.article_type}):"]
        for cat in complementary_categories:
            items = (
                db.query(Product)
                .filter(Product.master_category == cat, Product.in_stock == True)
                .order_by(Product.rating.desc(), Product.reviews_count.desc())
                .limit(2)
                .all()
            )
            for p in items:
                lines.append(
                    f"[{p.master_category}] ID: {p.id} | {p.title} | Colour: {p.colour} | Price: ${p.price:.2f} | Rating: {p.rating}/5"
                )
        return "\n".join(lines)
    except Exception as e:
        return f"Error creating cross-category recommendations: {e}"
    finally:
        db.close()


@tool
def recommend_products(category: str = "", limit: int = 4) -> str:
    """Get top curated fashion recommendations from the RAYA ATELIER archive based on rating and popularity."""
    return search_products.invoke({"category": category, "limit": limit})

