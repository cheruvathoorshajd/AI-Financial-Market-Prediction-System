"""
Database initialization script.
Creates all tables and optionally creates a demo user.
"""
from sqlalchemy.orm import Session

from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.user import User
from app.core.security import get_password_hash


def init_db() -> None:
    """Initialize database with tables and demo data."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created successfully!")
    
    # Create demo user
    db: Session = SessionLocal()
    try:
        # Check if demo user already exists
        existing_user = db.query(User).filter(User.email == "demo@fintrack.com").first()
        if existing_user:
            print("✓ Demo user already exists!")
            return
        
        # Create demo user
        password = "demo123"
        hashed_password = get_password_hash(password)
        
        demo_user = User(
            email="demo@fintrack.com",
            username="demo",
            hashed_password=hashed_password,
            full_name="Demo User",
            is_active=True,
        )
        db.add(demo_user)
        db.commit()
        print("✓ Demo user created successfully!")
        print("\nDemo credentials:")
        print("  Email: demo@fintrack.com")
        print("  Password: demo123")
        
    except Exception as e:
        print(f"✗ Error creating demo user: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("\n✓ Database initialization complete!")
