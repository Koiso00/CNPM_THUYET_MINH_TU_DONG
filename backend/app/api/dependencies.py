"""Shared authentication and role dependencies."""

from fastapi import Depends, HTTPException, Request

from app.core.security import ACCESS_COOKIE
from app.models.user import UserRole
from app.repositories.sessions import SessionRepository
from app.repositories.users import UserRepository
from app.services.auth import AuthenticationError, AuthService, Principal


def auth_secret(request: Request) -> str:
    value = request.app.state.settings.jwt_secret
    if value is None:
        raise HTTPException(503, "Authentication is not configured.")
    return value.get_secret_value()


def get_auth_service(request: Request, secret: str = Depends(auth_secret)) -> AuthService:
    database = request.app.state.mongodb.database
    if database is None:
        raise HTTPException(503, "Database is unavailable.")
    return AuthService(
        UserRepository(database["users"]), SessionRepository(database["sessions"]), secret=secret
    )


async def current_principal(
    request: Request, service: AuthService = Depends(get_auth_service)
) -> Principal:
    try:
        return await service.authenticate(request.cookies.get(ACCESS_COOKIE))
    except AuthenticationError:
        raise HTTPException(401, "Authentication required.") from None


def require_roles(*roles: UserRole):
    async def allowed(principal: Principal = Depends(current_principal)) -> Principal:
        if principal.user.role not in roles:
            raise HTTPException(403, "Insufficient permissions.")
        return principal

    return allowed
