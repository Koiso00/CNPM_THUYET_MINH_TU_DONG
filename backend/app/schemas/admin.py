"""Only explicit role and active-state fields can be changed by administration."""

from pydantic import StrictBool, field_validator

from app.models.user import UserRole
from app.schemas.content import StrictModel


class UpdateUser(StrictModel):
    role: UserRole
    is_active: StrictBool

    @field_validator("role")
    @classmethod
    def reject_retired_creator_role(cls, role):
        if role == UserRole.CREATOR:
            raise ValueError("Creator role has been retired. Use the Admin authoring workspace.")
        return role
