"""Cookie authentication; bearer credentials are never returned as JSON."""

from fastapi import APIRouter, Depends, HTTPException, Request, Response

from app.api.dependencies import auth_secret, current_principal, get_auth_service
from app.core.security import (
    ACCESS_COOKIE,
    COOKIE_PATH,
    CSRF_COOKIE,
    REFRESH_COOKIE,
    new_csrf_token,
    refresh_session_id,
)
from app.models.common import utc_now
from app.repositories.users import DuplicateUsernameError
from app.schemas.auth import AuthResponse, Credentials, CsrfResponse, PublicUser, Registration
from app.services.auth import AuthenticationError, AuthGrant, AuthService, Principal

router = APIRouter()


def set_cookie(response: Response, request: Request, name: str, value: str, *, max_age: int):
    response.set_cookie(
        name,
        value,
        max_age=max_age,
        path=COOKIE_PATH,
        httponly=True,
        secure=request.app.state.settings.environment == "production",
        samesite="lax",
    )


def grant_response(
    grant: AuthGrant, response: Response, request: Request, secret: str, *, keep_csrf: bool = False
) -> AuthResponse:
    now = utc_now()
    csrf = request.cookies.get(CSRF_COOKIE) if keep_csrf else None
    csrf = csrf or new_csrf_token(secret, str(grant.session.id), now)
    remaining = max(0, int((grant.session.expires_at - now).total_seconds()))
    set_cookie(
        response,
        request,
        ACCESS_COOKIE,
        grant.access_token,
        max_age=max(0, int((grant.access_expires_at - now).total_seconds())),
    )
    set_cookie(response, request, REFRESH_COOKIE, grant.refresh_token, max_age=remaining)
    set_cookie(response, request, CSRF_COOKIE, csrf, max_age=remaining)
    return AuthResponse(
        user=PublicUser.from_record(grant.user),
        access_expires_at=grant.access_expires_at,
        session_expires_at=grant.session.expires_at,
        csrf_token=csrf,
    )


@router.get("/csrf", response_model=CsrfResponse)
async def csrf(request: Request, response: Response, secret: str = Depends(auth_secret)):
    sid = refresh_session_id(request.cookies.get(REFRESH_COOKIE)) or ""
    token = new_csrf_token(secret, sid, utc_now())
    set_cookie(response, request, CSRF_COOKIE, token, max_age=7 * 24 * 3600)
    return CsrfResponse(csrf_token=token)


@router.post("/register", response_model=PublicUser, status_code=201)
async def register(payload: Registration, service: AuthService = Depends(get_auth_service)):
    try:
        user = await service.register(payload.username, payload.password.get_secret_value())
    except DuplicateUsernameError:
        raise HTTPException(409, "Username is already registered.") from None
    return PublicUser.from_record(user)


@router.post("/login", response_model=AuthResponse)
async def login(
    payload: Credentials,
    request: Request,
    response: Response,
    service: AuthService = Depends(get_auth_service),
    secret: str = Depends(auth_secret),
):
    try:
        grant = await service.login(payload.username, payload.password.get_secret_value())
    except AuthenticationError:
        raise HTTPException(401, "Invalid username or password.") from None
    return grant_response(grant, response, request, secret)


@router.post("/refresh", response_model=AuthResponse)
async def refresh(
    request: Request,
    response: Response,
    service: AuthService = Depends(get_auth_service),
    secret: str = Depends(auth_secret),
):
    try:
        grant = await service.refresh(request.cookies.get(REFRESH_COOKIE))
    except AuthenticationError:
        # Losing concurrent refresh must not clear the winner's cookies.
        raise HTTPException(401, "Session cannot be refreshed.") from None
    return grant_response(grant, response, request, secret, keep_csrf=True)


@router.get("/me", response_model=PublicUser)
async def me(principal: Principal = Depends(current_principal)):
    return PublicUser.from_record(principal.user)


def cleared_response(request: Request) -> Response:
    response = Response(status_code=204)
    for name in (ACCESS_COOKIE, REFRESH_COOKIE, CSRF_COOKIE):
        response.delete_cookie(
            name,
            path=COOKIE_PATH,
            httponly=True,
            secure=request.app.state.settings.environment == "production",
            samesite="lax",
        )
    return response


@router.post("/logout", status_code=204)
async def logout(request: Request, service: AuthService = Depends(get_auth_service)):
    await service.logout(request.cookies.get(REFRESH_COOKIE))
    return cleared_response(request)


@router.post("/logout-all", status_code=204)
async def logout_all(
    request: Request,
    principal: Principal = Depends(current_principal),
    service: AuthService = Depends(get_auth_service),
):
    await service.sessions.revoke_all(principal.user.id, now=service.clock())
    return cleared_response(request)
