"""Create or promote the initial admin through an explicit local command."""

import argparse
import asyncio
import getpass
import os
import sys
from pathlib import Path

from pydantic import ValidationError
from pymongo.errors import PyMongoError

from app.core.config import Settings
from app.db.indexes import ensure_user_indexes
from app.db.mongodb import MongoConnection
from app.repositories.users import UserRepository
from app.services.admin_setup import AdminSetupError, AdminSetupService, InitialPasswordRequired

ENV_FILE = Path(__file__).resolve().parents[2] / ".env"
COMMAND_FAILURE = "Cannot set up admin. Check configuration, account state and password policy."


def load_settings():
    if ENV_FILE.is_file():
        return Settings(_env_file=ENV_FILE)
    return Settings(_env_file=None)


async def _with_users(settings, operation, *, prepare_indexes=False):
    connection = MongoConnection(settings)
    try:
        connection.start()
    except RuntimeError as error:
        raise AdminSetupError(str(error)) from None
    try:
        database = connection.database
        if database is None:
            raise AdminSetupError("Database not configured. Set MONGODB_URI in backend/.env.")
        status = await connection.check()
        if status != "connected":
            raise AdminSetupError("MongoDB is unavailable. Check cluster access and network.")
        if prepare_indexes:
            await ensure_user_indexes(database["users"])
        return await operation(UserRepository(database["users"]))
    finally:
        await connection.close()


async def setup(settings, username, password=None):
    return await _with_users(
        settings,
        lambda users: AdminSetupService(users).ensure(username, password),
        prepare_indexes=True,
    )


async def inspect(settings, username):
    async def report(users):
        return {"database": "connected", **await AdminSetupService(users).inspect(username)}

    return await _with_users(settings, report)


def _print_status(report):
    print(f"database: {report['database']}")
    print(f"target: {report['target']}")
    print(f"exists: {report['exists']}")
    print(f"role: {report['role']}")
    print(f"is_active: {report['is_active']}")
    counts = report["role_counts"]
    print(
        "role_counts: "
        + " ".join(f"{role}={counts[role]}" for role in ("user", "creator", "admin"))
    )
    if not report["exists"]:
        print("Setup can create this Admin; a password must be supplied at that time.")
    elif report["role"] == "admin" and report["is_active"]:
        print("Target Admin is already active. Running setup again will not change the password.")
    elif not report["is_active"]:
        print("Target account is inactive. Setup will not unlock it.")
    else:
        print("Setup can promote this active account without changing the password.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("username", nargs="?", default="phong")
    parser.add_argument("--non-interactive", action="store_true")
    parser.add_argument(
        "--status",
        action="store_true",
        help="Report the target account and role counts without creating or changing accounts.",
    )
    args = parser.parse_args()
    try:
        settings = load_settings()
        if args.status:
            _print_status(asyncio.run(inspect(settings, args.username)))
            return 0
        password = os.environ.get("INITIAL_ADMIN_PASSWORD")
        try:
            result = asyncio.run(setup(settings, args.username, password))
        except InitialPasswordRequired:
            if args.non_interactive or not sys.stdin.isatty():
                print(
                    "New admin requires INITIAL_ADMIN_PASSWORD (15-128 characters).",
                    file=sys.stderr,
                )
                return 1
            password = getpass.getpass("Initial admin password (15-128 characters): ")
            confirmation = getpass.getpass("Confirm password: ")
            if password != confirmation:
                print("Passwords do not match. No account was created.", file=sys.stderr)
                return 1
            result = asyncio.run(setup(settings, args.username, password))
    except (ValidationError, PyMongoError, AdminSetupError, ValueError, EOFError, RuntimeError):
        print(COMMAND_FAILURE, file=sys.stderr)
        return 1
    print(f"Admin setup: {result}. Existing passwords are never reset.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
