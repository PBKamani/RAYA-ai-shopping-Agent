import json
import os
import sys
from pathlib import Path
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

# Add parent directory to sys.path to allow imports from app
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, engine, Base
from app.models.product import Product
from app.models.user import User
from app.utils.security import hash_password


def derive_fabric(product: dict) -> str:
    """Derives realistic luxury fabric descriptions matching RAYA ATELIER frontend."""
    art = (product.get("articleType") or "").lower()
    master = (product.get("masterCategory") or "").lower()

    if master == "footwear":
        return "Artisan Calfskin Leather & Vulcanized Rubber"
    if any(k in art for k in ["jacket", "blazer", "coat"]):
        return "Recycled Italian Wool & Structured Twill"
    if any(k in art for k in ["sweater", "cardigan"]):
        return "Grade-A Fine Merino Wool & Cashmere"
    if any(k in art for k in ["shirt", "tshirt", "top"]):
        return "100% Organic Heavyweight Cotton (280 GSM)"
    if any(k in art for k in ["trouser", "pants", "shorts", "track pant"]):
        return "Structured Japanese Selvedge & Tailored Chino Twill"
    if master == "accessories":
        return "Full-Grain Tuscan Leather & Brushed Metal Hardware"
    return "Premium Long-Staple Natural Fiber"


def find_products_json() -> Path:
    """Locates products.json across standard workspace paths."""
    candidate_paths = [
        backend_dir.parent / "ai-ecommerce-agent" / "src" / "data" / "products.json",
        backend_dir / ".." / "ai-ecommerce-agent" / "src" / "data" / "products.json",
        Path("ai-ecommerce-agent/src/data/products.json"),
        Path("../ai-ecommerce-agent/src/data/products.json"),
    ]
    for p in candidate_paths:
        resolved = p.resolve()
        if resolved.exists():
            return resolved
    raise FileNotFoundError(f"Could not locate products.json in candidates: {candidate_paths}")


def seed_demo_user(db: Session):
    """
    Seeds a safe demo user strictly for portfolio evaluation and testing.
    Uses PBKDF2-HMAC-SHA256 password hashing. Never stores plain text.
    """
    demo_email = "demo@rayaatelier.com"
    existing = db.query(User).filter(User.email == demo_email).first()
    if not existing:
        demo_user = User(
            name="Portfolio Demo Guest",
            email=demo_email,
            # Documented demo-only password, securely hashed:
            password_hash=hash_password("RayaDemo2026!"),
            is_demo_user=True,
        )
        db.add(demo_user)
        db.commit()
        db.refresh(demo_user)
        print(f"Created isolated demo user: {demo_email} (ID: {demo_user.id})")
    else:
        print(f"Demo user already exists: {demo_email} (ID: {existing.id})")


def seed_products():
    print("=" * 60)
    print("RAYA ATELIER: PostgreSQL Product Database Seeder")
    print("=" * 60)

    # 1. Initialize schema tables
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)

    json_path = find_products_json()
    print(f"Reading product catalog from: {json_path}")

    with open(json_path, "r", encoding="utf-8") as f:
        raw_products = json.load(f)

    total_records = len(raw_products)
    print(f"Loaded {total_records} products from JSON.")

    db: Session = SessionLocal()
    try:
        # Seed demo user
        seed_demo_user(db)

        # Prepare records for bulk insert
        product_records = []
        for p in raw_products:
            p_id = int(p["id"])
            p_title = p.get("title") or f"RAYA Article #{p_id}"
            p_brand = p.get("brand") or "RAYA ATELIER"
            p_gender = p.get("gender") or "Unisex"
            p_master = p.get("masterCategory") or "Apparel"
            p_sub = p.get("subCategory") or "Topwear"
            p_article = p.get("articleType") or "Garment"
            p_colour = p.get("colour") or "Natural"
            p_season = p.get("season") or "All Season"
            p_year = str(p.get("year")) if p.get("year") else "2026"
            p_usage = p.get("usage") or "Casual"
            p_price = float(p.get("price", 85.0))
            p_orig = float(p["originalPrice"]) if p.get("originalPrice") is not None else None
            p_rating = float(p.get("rating", 4.5))
            p_revs = int(p.get("reviewsCount", 24))
            p_img = p.get("image") or f"/products/{p_id}.jpg"
            p_desc = p.get("description") or f"{p_title}. Designed for refined minimalist wardrobes."
            p_fabric = p.get("fabric") or derive_fabric(p)
            p_stock = int(p.get("stock", p.get("stockCount", 12)))
            p_instock = bool(p.get("inStock", True))
            p_sizes = p.get("sizes") if isinstance(p.get("sizes"), list) else ["S", "M", "L", "XL"]

            product_records.append({
                "id": p_id,
                "title": p_title,
                "brand": p_brand,
                "gender": p_gender,
                "master_category": p_master,
                "sub_category": p_sub,
                "article_type": p_article,
                "colour": p_colour,
                "season": p_season,
                "year": p_year,
                "usage": p_usage,
                "price": p_price,
                "original_price": p_orig,
                "rating": p_rating,
                "reviews_count": p_revs,
                "image": p_img,
                "description": p_desc,
                "fabric": p_fabric,
                "stock_count": p_stock,
                "in_stock": p_instock,
                "sizes": p_sizes,
            })

        # Efficient batch upsert using PostgreSQL ON CONFLICT (id) DO NOTHING
        BATCH_SIZE = 500
        total_inserted = 0

        for i in range(0, len(product_records), BATCH_SIZE):
            batch = product_records[i : i + BATCH_SIZE]
            stmt = pg_insert(Product).values(batch)
            stmt = stmt.on_conflict_do_nothing(index_elements=["id"])
            result = db.execute(stmt)
            db.commit()
            total_inserted += result.rowcount

        final_count = db.query(Product).count()
        print(f"Insertion complete. Rows newly inserted: {total_inserted}")
        print(f"Total verified products now in PostgreSQL database: {final_count}")

    except Exception as exc:
        db.rollback()
        print(f"Error during database seeding: {type(exc).__name__} - {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_products()
