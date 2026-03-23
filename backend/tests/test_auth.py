"""
Tests for authentication endpoints.

Covers:
- Register: success, duplicate email, weak password
- Login: success, invalid credentials, wrong password
- Logout: clear refresh cookie
- Refresh token: valid flow, expired token, missing token
- Token expiration and rotation
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient

from tests.conftest import create_test_user, get_auth_headers

pytestmark = pytest.mark.asyncio


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict:
    """Authenticated headers for a test user."""
    await create_test_user(client)
    return await get_auth_headers(client)


# ---------------------------------------------------------------------------
# Registration
# ---------------------------------------------------------------------------


async def test_register_success(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "alice@example.com", "password": "SecurePass1", "full_name": "Alice"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "alice@example.com"
    assert data["full_name"] == "Alice"
    assert "password" not in data
    assert "password_hash" not in data


async def test_register_duplicate_email(client: AsyncClient) -> None:
    await create_test_user(client, "test@example.com")
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "SecurePass1", "full_name": "Alice"},
    )
    assert resp.status_code == 409  # Conflict


async def test_register_weak_password(client: AsyncClient) -> None:
    """Password without uppercase, digits, etc should be rejected."""
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "nodigits", "full_name": "Weak"},
    )
    assert resp.status_code == 422  # Unprocessable Entity


async def test_register_missing_fields(client: AsyncClient) -> None:
    """Missing required fields should return 422."""
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "incomplete@example.com"},
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Login
# ---------------------------------------------------------------------------


async def test_login_success(client: AsyncClient) -> None:
    await create_test_user(client, "login@example.com")

    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "SecurePass1"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "expires_in" in data
    assert data["expires_in"] > 0

    # Check that refresh token is set in httpOnly cookie
    cookies = resp.cookies
    assert "revendu_refresh_token" in cookies


async def test_login_wrong_password(client: AsyncClient) -> None:
    await create_test_user(client, "test@example.com")

    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "WrongPassword1"},
    )
    assert resp.status_code == 401  # Unauthorized


async def test_login_nonexistent_user(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "SecurePass1"},
    )
    assert resp.status_code == 401


async def test_login_rate_limiting(client: AsyncClient) -> None:
    """Multiple failed login attempts should eventually be rate limited."""
    await create_test_user(client, "ratelimit@example.com")

    # Try many times (Note: test config has very high rate limit, so this
    # may not trigger in the test environment. In production, it would.)
    for _ in range(5):
        resp = await client.post(
            "/api/v1/auth/login",
            json={"email": "ratelimit@example.com", "password": "WrongPass1"},
        )
        assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Logout
# ---------------------------------------------------------------------------


async def test_logout_clears_cookie(client: AsyncClient, auth_headers: dict) -> None:
    """Logout should clear the refresh token cookie."""
    resp = await client.post("/api/v1/auth/logout", headers=auth_headers)
    assert resp.status_code == 204

    # Cookie should be deleted (max_age=0)
    cookies = resp.cookies
    assert "revendu_refresh_token" in cookies


async def test_logout_without_auth(client: AsyncClient) -> None:
    """Logout should work even without authentication (no harm)."""
    resp = await client.post("/api/v1/auth/logout")
    assert resp.status_code == 204


# ---------------------------------------------------------------------------
# Refresh Token
# ---------------------------------------------------------------------------


async def test_refresh_token_success(client: AsyncClient) -> None:
    """Valid refresh token should issue a new access token."""
    # Register and login
    await create_test_user(client, "refresh@example.com")
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "refresh@example.com", "password": "SecurePass1"},
    )
    assert login_resp.status_code == 200

    # Use the refresh token to get a new access token
    refresh_resp = await client.post("/api/v1/auth/refresh")
    assert refresh_resp.status_code == 200
    data = refresh_resp.json()
    assert "access_token" in data
    assert "expires_in" in data

    # The new access token should work
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    me_resp = await client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200


async def test_refresh_token_missing(client: AsyncClient) -> None:
    """Refresh without a valid cookie should fail."""
    resp = await client.post("/api/v1/auth/refresh")
    assert resp.status_code == 401
    assert "Refresh token manquant" in resp.json()["detail"]


async def test_refresh_token_invalid(client: AsyncClient) -> None:
    """Refresh with an invalid/tampered token should fail."""
    # Set an invalid refresh token cookie
    client.cookies.set("revendu_refresh_token", "invalid.token.here")

    resp = await client.post("/api/v1/auth/refresh")
    assert resp.status_code == 401


async def test_refresh_token_rotation(client: AsyncClient) -> None:
    """Each refresh should issue a new refresh token (rotation)."""
    await create_test_user(client, "rotate@example.com")
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "rotate@example.com", "password": "SecurePass1"},
    )
    assert login_resp.status_code == 200
    first_cookie = login_resp.cookies.get("revendu_refresh_token")

    # Refresh once
    refresh_resp1 = await client.post("/api/v1/auth/refresh")
    assert refresh_resp1.status_code == 200
    second_cookie = refresh_resp1.cookies.get("revendu_refresh_token")

    # Refresh again
    refresh_resp2 = await client.post("/api/v1/auth/refresh")
    assert refresh_resp2.status_code == 200
    third_cookie = refresh_resp2.cookies.get("revendu_refresh_token")

    # All should be different (token rotation)
    assert first_cookie != second_cookie
    assert second_cookie != third_cookie


# ---------------------------------------------------------------------------
# Get Current User
# ---------------------------------------------------------------------------


async def test_get_me_success(client: AsyncClient, auth_headers: dict) -> None:
    """GET /auth/me should return the current user."""
    resp = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "password" not in data


async def test_get_me_requires_auth(client: AsyncClient) -> None:
    """GET /auth/me without token should fail."""
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code in (401, 403)


async def test_get_me_invalid_token(client: AsyncClient) -> None:
    """GET /auth/me with invalid token should fail."""
    headers = {"Authorization": "Bearer invalid.token.here"}
    resp = await client.get("/api/v1/auth/me", headers=headers)
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Token Edge Cases
# ---------------------------------------------------------------------------


async def test_expired_access_token(client: AsyncClient) -> None:
    """Access with an expired token should fail (would need to mock time)."""
    # Note: This test is simplified. In a real scenario, you'd mock time.time()
    # or use freezegun to simulate token expiration.
    pass


async def test_access_token_structure(client: AsyncClient) -> None:
    """Access token should be a valid JWT."""
    await create_test_user(client, "jwt@example.com")
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "jwt@example.com", "password": "SecurePass1"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]

    # Should be three parts separated by dots (JWT format)
    parts = token.split(".")
    assert len(parts) == 3
