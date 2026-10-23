"""Signed, session-bound CSRF protection for unsafe API requests."""

import hmac

from fastapi import Request
from starlette.responses import JSONResponse, Response

from app.core.security import CSRF_COOKIE, REFRESH_COOKIE, refresh_session_id, valid_csrf_token
from app.models.common import utc_now


async def protect_api(request: Request, call_next) -> Response:
    if not request.url.path.startswith("/api/"):
        return await call_next(request)
    anonymous_event = request.url.path.startswith("/api/v1/events/guest")
    if request.method not in {"GET", "HEAD", "OPTIONS"}:
        settings = request.app.state.settings
        if settings.jwt_secret is None:
            return JSONResponse(
                {"detail": "Authentication is not configured."},
                503,
                headers={"Cache-Control": "no-store"},
            )
        origin = request.headers.get("origin")
        if (
            request.headers.get("sec-fetch-site") == "cross-site"
            or (origin is not None and origin not in settings.auth_allowed_origins)
            or (
                settings.environment == "production"
                and origin is not None
                and not origin.startswith("https://")
            )
        ):
            return JSONResponse(
                {"detail": "Request origin is not allowed."},
                403,
                headers={"Cache-Control": "no-store"},
            )
        if anonymous_event:
            response = await call_next(request)
            response.headers["Cache-Control"] = "no-store"
            return response
        cookie = request.cookies.get(CSRF_COOKIE, "")
        header = request.headers.get("x-csrf-token", "")
        sid = refresh_session_id(request.cookies.get(REFRESH_COOKIE)) or ""
        if (
            not cookie
            or not header
            or not cookie.isascii()
            or not header.isascii()
            or not hmac.compare_digest(cookie, header)
            or not valid_csrf_token(
                cookie, secret=settings.jwt_secret.get_secret_value(), session_id=sid, now=utc_now()
            )
        ):
            return JSONResponse(
                {"detail": "Invalid or missing CSRF token."},
                403,
                headers={"Cache-Control": "no-store"},
            )
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-store"
    return response
