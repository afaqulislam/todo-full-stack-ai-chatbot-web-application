from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from datetime import timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from ..models.user import UserCreate, UserRead
from ..services.user_service import UserService
from ..core.security import (
    authenticate_user,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_DAYS,  # ✅ updated from minutes to days
    get_current_user_from_cookie,
)
from ..core.database import get_async_session
from ..core.config import settings

router = APIRouter(prefix=f"{settings.api_v1_prefix}/auth", tags=["auth"])


# ------------------------------
# USER REGISTRATION
# ------------------------------
@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register_user(
    *, user_create: UserCreate, session: AsyncSession = Depends(get_async_session)
):
    """
    Register a new user account.
    """
    try:
        return await UserService.create_user(session=session, user_create=user_create)
    except HTTPException:
        raise  # Re-raise HTTP exceptions from service
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during user registration",
        )


# ------------------------------
# LOGIN
# ------------------------------
class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
async def login_user(
    response: Response,
    login_request: LoginRequest,
    session: AsyncSession = Depends(get_async_session),
):
    """
    Login with email and password. Sets JWT in HTTP-only cookie.
    """
    try:
        user = await authenticate_user(session, login_request.email, login_request.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token with user ID and email
        access_token_expires = timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
        access_token = create_access_token(
            data={"sub": user.email, "user_id": str(user.id)},
            expires_delta=access_token_expires,
        )

        # Set the token in an HTTP-only cookie with expiry matching the JWT
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,  # REQUIRED for HTTPS
            samesite="none",  # REQUIRED for cross-origin cookies
            max_age=ACCESS_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,  # convert days to seconds
            path="/",
            # domain=settings.cookie_domain, # Uncomment if cross-subdomain is needed
        )

        return {
            "message": "Login successful",
            "user_id": str(user.id)
        }
    except HTTPException:
        raise
    except Exception as e:
        # Provide more context for development/production debugging
        error_detail = f"Internal Server Error: {str(e)}"
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail
        )


# ------------------------------
# LOGOUT
# ------------------------------
@router.post("/logout")
async def logout_user(response: Response):
    """
    Logout user by clearing the access token cookie.
    """
    response.delete_cookie(
        key="access_token",
        path="/",  # ensure cookie is deleted for all paths
    )
    return {"message": "Logout successful"}


# ------------------------------
# GET CURRENT USER
# ------------------------------
@router.get("/me", response_model=UserRead)
async def read_users_me(current_user: UserRead = Depends(get_current_user_from_cookie)):
    """
    Get current authenticated user details from cookie.
    """
    return current_user
