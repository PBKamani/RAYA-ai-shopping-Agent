from sqlalchemy.orm import Session
from sqlalchemy import func, or_, and_, desc, asc
from typing import Optional, List, Dict, Any
from math import ceil
from ..models.product import Product


class ProductService:

    @staticmethod
    def get_products(
        db: Session,
        page: int = 1,
        limit: int = 20,
        search: Optional[str] = None,
        category: Optional[str] = None,
        gender: Optional[str] = None,
        sub_category: Optional[str] = None,
        article_type: Optional[str] = None,
        colour: Optional[str] = None,
        season: Optional[str] = None,
        usage: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        in_stock: Optional[bool] = None,
        sort_by: Optional[str] = None,
    ) -> Dict[str, Any]:
        query = db.query(Product)

        # Full-text or multi-field search
        if search:
            search_clean = search.strip()
            search_terms = search_clean.split()
            term_conditions = []
            for term in search_terms:
                pattern = f"%{term}%"
                term_conditions.append(
                    or_(
                        Product.title.ilike(pattern),
                        Product.brand.ilike(pattern),
                        Product.description.ilike(pattern),
                        Product.article_type.ilike(pattern),
                        Product.sub_category.ilike(pattern),
                        Product.master_category.ilike(pattern),
                        Product.colour.ilike(pattern),
                    )
                )
            if term_conditions:
                query = query.filter(and_(*term_conditions))

        # Categorical filters
        if category:
            query = query.filter(Product.master_category.ilike(category))
        if gender:
            query = query.filter(Product.gender.ilike(gender))
        if sub_category:
            query = query.filter(Product.sub_category.ilike(sub_category))
        if article_type:
            query = query.filter(Product.article_type.ilike(article_type))
        if colour:
            query = query.filter(Product.colour.ilike(colour))
        if season:
            query = query.filter(Product.season.ilike(season))
        if usage:
            query = query.filter(Product.usage.ilike(usage))

        # Price range
        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)

        # In-stock filter
        if in_stock is not None:
            query = query.filter(Product.in_stock == in_stock)

        # Total count before pagination
        total = query.count()

        # Sorting
        if sort_by == "price_asc":
            query = query.order_by(asc(Product.price))
        elif sort_by == "price_desc":
            query = query.order_by(desc(Product.price))
        elif sort_by == "rating_desc":
            query = query.order_by(desc(Product.rating), desc(Product.reviews_count))
        elif sort_by == "popular":
            query = query.order_by(desc(Product.reviews_count), desc(Product.rating))
        elif sort_by == "newest":
            query = query.order_by(desc(Product.year), desc(Product.id))
        else:
            query = query.order_by(asc(Product.id))

        # Pagination
        page = max(1, page)
        limit = min(100, max(1, limit))
        offset = (page - 1) * limit
        products = query.offset(offset).limit(limit).all()
        total_pages = ceil(total / limit) if total > 0 else 1

        return {
            "products": products,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
        }

    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Optional[Product]:
        return db.query(Product).filter(Product.id == product_id).first()

    @staticmethod
    def get_category_counts(db: Session) -> Dict[str, Any]:
        """Dynamically calculates product counts for each master category directly from DB."""
        results = (
            db.query(Product.master_category, func.count(Product.id))
            .filter(Product.master_category.isnot(None))
            .group_by(Product.master_category)
            .order_by(func.count(Product.id).desc())
            .all()
        )
        total = db.query(func.count(Product.id)).scalar() or 0
        categories = [{"name": cat or "Other", "count": count} for cat, count in results]
        return {
            "total": total,
            "categories": categories,
        }

    @staticmethod
    def get_filter_options(db: Session) -> Dict[str, Any]:
        """Dynamically retrieves all distinct filter values from PostgreSQL."""
        def get_distinct(column):
            rows = (
                db.query(column)
                .filter(column.isnot(None), column != "")
                .distinct()
                .order_by(column.asc())
                .all()
            )
            return [row[0] for row in rows if row[0]]

        price_stats = db.query(
            func.min(Product.price),
            func.max(Product.price)
        ).first()

        min_p = float(price_stats[0]) if price_stats and price_stats[0] is not None else 0.0
        max_p = float(price_stats[1]) if price_stats and price_stats[1] is not None else 500.0

        return {
            "genders": get_distinct(Product.gender),
            "master_categories": get_distinct(Product.master_category),
            "sub_categories": get_distinct(Product.sub_category),
            "article_types": get_distinct(Product.article_type),
            "colours": get_distinct(Product.colour),
            "seasons": get_distinct(Product.season),
            "usages": get_distinct(Product.usage),
            "price_range": {
                "min_price": min_p,
                "max_price": max_p,
            },
        }
