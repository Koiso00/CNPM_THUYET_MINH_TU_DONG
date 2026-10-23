"""Explicit administrator setup without public signup or password resets."""

from starlette.concurrency import run_in_threadpool

from app.core.security import passwords
from app.models.user import UserRecord, UserRole, clean_username
from app.repositories.users import DuplicateUsernameError, UserRepository
from app.schemas.auth import Registration


class AdminSetupError(Exception):
    """Setup cannot proceed without operator attention."""


class InitialPasswordRequired(AdminSetupError):
    """A new account requires a password supplied outside source code."""


class AdminSetupService:
    def __init__(self, users: UserRepository):
        self.users = users

    async def ensure(self, username: str, password: str | None = None) -> str:
        username = clean_username(username)
        user = await self.users.find_by_username(username)
        if user is not None:
            if not user.is_active:
                raise AdminSetupError("Account is inactive.")
            if user.role == UserRole.ADMIN:
                return "unchanged"
            if not await self.users.promote_active(user):
                raise AdminSetupError("Account changed during setup.")
            return "promoted"
        if password is None:
            raise InitialPasswordRequired()
        credentials = Registration(username=username, password=password)
        encoded = await run_in_threadpool(passwords().hash, credentials.password.get_secret_value())
        try:
            await self.users.insert(
                UserRecord(username=username, password_hash=encoded, role=UserRole.ADMIN)
            )
        except DuplicateUsernameError:
            # Do not grant privileges to an account created concurrently by somebody else.
            raise AdminSetupError(
                "Account appeared during setup; inspect before retrying."
            ) from None
        return "created"

    async def inspect(self, username: str) -> dict[str, object]:
        username = clean_username(username)
        user = await self.users.find_by_username(username)
        return {
            "target": username,
            "exists": user is not None,
            "role": None if user is None else user.role.value,
            "is_active": None if user is None else user.is_active,
            "role_counts": await self.users.role_counts(),
        }
