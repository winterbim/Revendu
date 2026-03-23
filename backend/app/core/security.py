from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt as _bcrypt
from jose import JWTError, jwt

from app.config import get_settings

settings = get_settings()

# Token type discriminator stored inside the JWT payload
_ACCESS_TYPE = "access"
_REFRESH_TYPE = "refresh"


# ---------------------------------------------------------------------------
# Password helpers
# ---------------------------------------------------------------------------


def hash_password(plain: str) -> str:
    """Hash a plain-text password using bcrypt (cost=12)."""
    return _bcrypt.hashpw(plain.encode("utf-8"), _bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Return True if *plain* matches *hashed*."""
    try:
        return _bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------


def _create_token(data: dict[str, Any], expires_delta: timedelta, token_type: str) -> str:
    payload = data.copy()
    now = datetime.now(timezone.utc)
    payload.update(
        {
            "iat": now,
            "exp": now + expires_delta,
            "type": token_type,
        }
    )
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(subject: str) -> tuple[str, int]:
    """
    Create a short-lived access JWT.

    Returns (token, expires_in_seconds).
    """
    delta = timedelta(minutes=settings.access_token_expire_minutes)
    token = _create_token({"sub": subject}, delta, _ACCESS_TYPE)
    return token, int(delta.total_seconds())


def create_refresh_token(subject: str) -> str:
    """Create a long-lived refresh JWT."""
    delta = timedelta(days=settings.refresh_token_expire_days)
    return _create_token({"sub": subject}, delta, _REFRESH_TYPE)


def decode_access_token(token: str) -> str:
    """
    Decode and validate an access token.

    Returns the subject (user id string).
    Raises JWTError on any failure.
    """
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    if payload.get("type") != _ACCESS_TYPE:
        raise JWTError("Token type invalide.")
    sub: str | None = payload.get("sub")
    if sub is None:
        raise JWTError("Sujet manquant dans le token.")
    return sub


def decode_refresh_token(token: str) -> str:
    """
    Decode and validate a refresh token.

    Returns the subject (user id string).
    Raises JWTError on any failure.
    """
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    if payload.get("type") != _REFRESH_TYPE:
        raise JWTError("Token type invalide.")
    sub: str | None = payload.get("sub")
    if sub is None:
        raise JWTError("Sujet manquant dans le token.")
    return sub
