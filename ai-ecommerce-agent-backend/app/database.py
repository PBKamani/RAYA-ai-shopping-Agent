from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from typing import Generator
import logging
from .config import settings

logger = logging.getLogger(__name__)

# Configure SQLAlchemy engine with connection pool
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency yielding a SQLAlchemy session.
    Automatically handles rollback on exceptions and cleanup on close.
    """
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def check_db_connection() -> bool:
    """
    Verifies that the database is reachable and accepts queries.
    Never exposes credentials in error logs.
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return True
    except Exception as exc:
        logger.error(f"Database connection error: {type(exc).__name__}")
        return False
