import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.database import engine
from sqlalchemy import text

def sync_sequences():
    sequences = [
        ("users_id_seq", "users"),
        ("carts_id_seq", "carts"),
        ("wishlists_id_seq", "wishlists"),
        ("orders_id_seq", "orders"),
        ("cart_items_id_seq", "cart_items"),
        ("order_items_id_seq", "order_items"),
        ("reviews_id_seq", "reviews"),
    ]
    with engine.connect() as conn:
        for seq, table in sequences:
            try:
                sql = f"SELECT setval('{seq}', (SELECT COALESCE(MAX(id), 1) FROM {table}));"
                conn.execute(text(sql))
                print(f"Synchronized sequence {seq} for table {table}")
            except Exception as e:
                print(f"Skipping {seq}: {e}")
        conn.commit()
    print("All PostgreSQL sequences synchronized successfully.")

if __name__ == "__main__":
    sync_sequences()
