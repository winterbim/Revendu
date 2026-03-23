"""
Test configuration and shared fixtures.

Uses an in-memory SQLite database (via aiosqlite) so tests require no external
Postgres instance. The async engine is scoped per-test to guarantee isolation.
"""

import os

# Override settings before any app module is imported so get_settings()
# picks up the values (it is @lru_cache — first call wins).
os.environ["RATE_LIMIT_LOGIN"] = "10000/minute"
os.environ["ENVIRONMENT"] = "test"

# Clear cached settings so test values are picked up
from app.config import get_settings
get_settings.cache_clear()

import asyncio
from decimal import Decimal
from typing import AsyncGenerator

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.database import get_db
from app.main import app
from app.models import Base
from app.models.item import Item  # noqa: F401 — needed for metadata
from app.models.user import User  # noqa: F401 — needed for metadata

# ---------------------------------------------------------------------------
# Use SQLite for tests (no Postgres required)
# ---------------------------------------------------------------------------

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def db_engine():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def db_session(db_engine) -> AsyncGenerator[AsyncSession, None]:
    session_factory = async_sessionmaker(
        bind=db_engine,
        class_=AsyncSession,
        expire_on_commit=False,
        autocommit=False,
        autoflush=False,
    )
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """HTTP test client with DB dependency overridden to use the test session."""

    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# Helper factories
# ---------------------------------------------------------------------------


async def create_test_user(client: AsyncClient, email: str = "test@example.com") -> dict:
    """Register a user and return the JSON response body."""
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePass1", "full_name": "Test User"},
    )
    assert resp.status_code == 201, resp.text
    return resp.json()


async def get_auth_headers(client: AsyncClient, email: str = "test@example.com") -> dict:
    """Login and return Authorization headers."""
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "SecurePass1"},
    )
    assert resp.status_code == 200, resp.text
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
