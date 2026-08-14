from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api import deps
from app.core.security import get_password_hash, verify_password
from app.models.user import User as UserModel
from app.schemas.user import PasswordUpdate, User, UserCreate, UserUpdate
from app.services import user_service

router = APIRouter()

# The shared demo account is read-only for profile/credentials so a visitor
# can't lock everyone else out (e.g. by changing its password). Holdings and
# watchlist stay editable — it's meant to be explored.
DEMO_EMAIL = "demo@fluxusfisci.app"


@router.post("/", response_model=User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
):
    """Create new user (registration)."""
    if user_service.get_user_by_email(db, email=user_in.email):
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    return user_service.create_user(db, user=user_in)


@router.get("/me", response_model=User)
def read_user_me(current_user: UserModel = Depends(deps.get_current_active_user)):
    """Get the current user's profile."""
    return current_user


@router.put("/me", response_model=User)
def update_user_me(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserUpdate,
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    """Update the current user's profile, guarding email/username uniqueness."""
    if current_user.email == DEMO_EMAIL:
        raise HTTPException(
            status_code=403,
            detail="The demo account is read-only. Create your own account to edit your profile.",
        )

    update_data = user_in.model_dump(exclude_unset=True)
    if update_data.get("email"):
        update_data["email"] = update_data["email"].strip().lower()

    new_email = update_data.get("email")
    if new_email and new_email != current_user.email:
        if user_service.get_user_by_email(db, email=new_email):
            raise HTTPException(status_code=400, detail="That email is already in use.")

    new_username = update_data.get("username")
    if new_username and new_username != current_user.username:
        exists = (
            db.query(UserModel).filter(UserModel.username == new_username).first()
        )
        if exists:
            raise HTTPException(status_code=400, detail="That username is already taken.")

    for field, value in update_data.items():
        setattr(current_user, field, value)
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/password")
def change_password(
    *,
    db: Session = Depends(deps.get_db),
    body: PasswordUpdate,
    current_user: UserModel = Depends(deps.get_current_active_user),
):
    """Change the current user's password after verifying the current one."""
    if current_user.email == DEMO_EMAIL:
        raise HTTPException(
            status_code=403,
            detail="The demo account is read-only. Create your own account to set a password.",
        )
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Your current password is incorrect.")
    if body.new_password == body.current_password:
        raise HTTPException(status_code=400, detail="Choose a password you haven't used here before.")
    current_user.hashed_password = get_password_hash(body.new_password)
    db.add(current_user)
    db.commit()
    return {"detail": "Password updated."}
