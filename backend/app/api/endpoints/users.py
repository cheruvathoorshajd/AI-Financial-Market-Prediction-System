from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models import user as models
from app.schemas.user import User, UserCreate
from app.api import deps
from app.services import user_service

router = APIRouter()

@router.post("/", response_model=User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
):
    """
    Create new user.
    """
    user = user_service.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = user_service.create_user(db, user=user_in)
    return user
