"""Only explicit role and active-state fields can be changed by administration."""

from pydantic import StrictBool

from app.models.user import UserRole
from app.schemas.content import StrictModel


class UpdateUser(StrictModel):
    role: UserRole
    is_active: StrictBool
