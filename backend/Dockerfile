FROM python:3.11-slim

WORKDIR /app

# System deps for asyncpg / reportlab
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install build backend
RUN pip install --no-cache-dir hatchling

# Dependency layer (cache-friendly)
COPY pyproject.toml ./
RUN pip install --no-cache-dir .

# Application code
COPY . .

# Run migrations then start server
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
