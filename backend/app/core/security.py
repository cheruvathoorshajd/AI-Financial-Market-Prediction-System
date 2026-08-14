from datetime import datetime, timedelta, timezone
from typing import Any, Union

import bcrypt
from jose import jwt

from app.core.config import settings

ALGORITHM = "HS256"

# bcrypt only considers the first 72 bytes of a password and raises on longer
# inputs, so we truncate defensively to keep hashing/verification consistent.
_BCRYPT_MAX_BYTES = 72


def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(
        plain_password.encode("utf-8")[:_BCRYPT_MAX_BYTES],
        hashed_password.encode("utf-8"),
    )


def get_password_hash(password: str) -> str:
    hashed = bcrypt.hashpw(
        password.encode("utf-8")[:_BCRYPT_MAX_BYTES], bcrypt.gensalt()
    )
    return hashed.decode("utf-8")
