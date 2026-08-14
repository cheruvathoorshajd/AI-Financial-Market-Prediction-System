"""
Database initialization script.
Creates all tables and optionally creates a demo user.
"""
from sqlalchemy.orm import Session

from app.data import seed
from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.models.holding import Holding
from app.models.user import User
from app.core.security import get_password_hash


def init_db() -> None:
    """Initialize database with tables and demo data."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("[ok] Tables created successfully!")
    
    # Create the demo user + seed their portfolio (both idempotent).
    db: Session = SessionLocal()
    try:
        demo_user = db.query(User).filter(User.email == "demo@fluxusfisci.app").first()
        if demo_user:
            print("[ok] Demo user already exists!")
        else:
            demo_user = User(
                email="demo@fluxusfisci.app",
                username="demo",
                hashed_password=get_password_hash("demo1234"),
                full_name="Ada Lovelace",
                is_active=True,
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
            print("[ok] Demo user created successfully!")
            print("\nDemo credentials:")
            print("  Email: demo@fluxusfisci.app")
            print("  Password: demo1234")

        # Seed the demo portfolio holdings if the user has none yet.
        if db.query(Holding).filter(Holding.user_id == demo_user.id).count() == 0:
            for lot in seed.DEMO_HOLDINGS:
                db.add(
                    Holding(
                        user_id=demo_user.id,
                        symbol=lot["symbol"],
                        shares=lot["shares"],
                        avg_cost=lot["avgCost"],
                    )
                )
            db.commit()
            print("[ok] Demo holdings seeded!")

    except Exception as e:
        print(f"[error] Error seeding demo data: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("\n[ok] Database initialization complete!")
