FROM node:22-bookworm-slim AS frontend
WORKDIR /build/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    FRONTEND_DIST=/srv/frontend
WORKDIR /srv/backend
COPY backend/ ./
RUN pip install --no-cache-dir uv==0.12.13 && uv sync --frozen --no-dev --no-editable
COPY --from=frontend /build/frontend/dist /srv/frontend
RUN useradd --create-home appuser
USER appuser
EXPOSE 8000
CMD ["/srv/backend/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
