from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer
from pydantic import BaseModel
from sqlmodel import select
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession

from .database import get_async_session
from ..models.user import User, UserRead
from .config import settings

# ------------------------------------------------------------------
# PASSWORD + AUTH CONFIG
# ------------------------------------------------------------------

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = settings.better_auth_secret
ALGORITHM = settings.jwt_algorithm
# Use days from settings instead of minutes
ACCESS_TOKEN_EXPIRE_DAYS = settings.jwt_expiry_days


# ------------------------------------------------------------------
# MODELS
# ------------------------------------------------------------------


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None
    user_id: Optional[UUID] = None


# ------------------------------------------------------------------
# INTERNAL SAFETY HELPERS
# ------------------------------------------------------------------


def _safe_password(password: str) -> str:
    """
    bcrypt HARD LIMIT = 72 BYTES
    This prevents passlib/bcrypt crashes (500 errors).
    """
    if not password:
        return password
    return password.encode("utf-8")[:72].decode("utf-8", errors="ignore")


# ------------------------------------------------------------------
# PASSWORD FUNCTIONS (CRASH-PROOF)
# ------------------------------------------------------------------


def verify_password(plain_password: str, hashed_password: str) -> bool:
    plain_password = _safe_password(plain_password)
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    password = _safe_password(password)
    return pwd_context.hash(password)


# ------------------------------------------------------------------
# AUTH LOGIC
# ------------------------------------------------------------------


async def authenticate_user(
    session: AsyncSession, email: str, password: str
) -> Optional[User]:
    statement = select(User).where(User.email == email)
    result = await session.execute(statement)
    user = result.scalars().first()

    if not user:
        return None

    if not verify_password(password, user.hashed_password):
        return None

    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create JWT token. Expiry is in days based on settings if not provided.
    """
    to_encode = data.copy()

    # Default expiry in days
    expire = (
        datetime.utcnow() + expires_delta
        if expires_delta
        else datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    )

    to_encode.update({"exp": expire})

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str) -> Optional[TokenData]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        username = payload.get("sub")
        user_id = payload.get("user_id")

        if not username or not user_id:
            return None

        return TokenData(username=username, user_id=UUID(user_id))

    except JWTError:
        return None


# ------------------------------------------------------------------
# COOKIE-BASED AUTH DEPENDENCIES
# ------------------------------------------------------------------


async def get_current_user_from_cookie(
    request: Request,
    session: AsyncSession = Depends(get_async_session),
) -> UserRead:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = request.cookies.get("access_token")
    if not token:
        raise credentials_exception

    token_data = verify_token(token)
    if not token_data:
        raise credentials_exception

    statement = select(User).where(User.id == token_data.user_id)
    result = await session.execute(statement)
    user = result.scalars().first()

    if not user:
        raise credentials_exception

    return UserRead.model_validate(user)


def get_current_active_user(
    current_user: UserRead = Depends(get_current_user_from_cookie),
) -> UserRead:
    return current_user


async def get_user_id_from_cookie(request: Request) -> UUID:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = request.cookies.get("access_token")
    if not token:
        raise credentials_exception

    token_data = verify_token(token)
    if not token_data:
        raise credentials_exception

    return token_data.user_id
