"""Authentication middleware for the AI Chatbot feature using cookie-based auth."""

from typing import Optional
from uuid import UUID

from fastapi import HTTPException, Request
from pydantic import BaseModel


class UserIdentity(BaseModel):
    """User identity model extracted from authentication."""

    id: str
    email: Optional[str] = None
    name: Optional[str] = None


class BetterAuthMiddleware:
    """Middleware to validate user authentication via cookie-based JWT."""

    async def verify_token(self, token: str) -> UserIdentity:
        """
        Verify JWT token from cookie using the same validation as core/security.py.
        """
        if not token:
            raise HTTPException(status_code=401, detail="No token provided")

        # Use the same JWT verification as in core/security.py
        try:
            from ..core.security import SECRET_KEY, ALGORITHM
            from jose import jwt, JWTError
            from uuid import UUID

            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

            user_id = payload.get("user_id")
            email = payload.get("sub")

            if not user_id:
                raise HTTPException(status_code=401, detail="Invalid token: missing user_id")

            # Validate that user_id is a proper UUID string
            UUID(user_id)  # This will raise ValueError if invalid

            return UserIdentity(id=str(user_id), email=email)

        except ValueError:
            # Invalid UUID format
            raise HTTPException(status_code=401, detail="Invalid token: malformed user_id")
        except JWTError:
            # Invalid JWT token
            raise HTTPException(status_code=401, detail="Invalid token")
        except Exception as e:
            # Any other error during verification
            raise HTTPException(status_code=401, detail=f"Token verification failed: {str(e)}")


    async def get_current_user(self, request: Request) -> UserIdentity:
        """Extract and verify user from secure cookie."""
        # Extract token from secure cookie
        token = request.cookies.get("access_token")
        if not token:
            raise HTTPException(status_code=401, detail="Missing or invalid access token cookie")

        return await self.verify_token(token)


# Create a singleton instance of the middleware
auth_middleware = BetterAuthMiddleware()