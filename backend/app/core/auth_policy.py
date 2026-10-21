"""Authentication lifetimes explicitly selected by the user; behavior is implemented in P1.3."""

from datetime import timedelta

ACCESS_TOKEN_TTL = timedelta(minutes=15)
SESSION_MAX_AGE = timedelta(days=7)
