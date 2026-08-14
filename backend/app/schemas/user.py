from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=2, max_length=32)
    full_name: Optional[str] = Field(None, max_length=80)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=2, max_length=32)
    full_name: Optional[str] = Field(None, max_length=80)
    risk_tolerance: Optional[Literal["low", "medium", "high"]] = None


class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class UserInDBBase(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    risk_tolerance: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class User(UserInDBBase):
    pass
