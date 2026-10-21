"""Uvicorn entrypoint. Tests import the environment-independent application factory."""

from app.application import create_app

app = create_app()
