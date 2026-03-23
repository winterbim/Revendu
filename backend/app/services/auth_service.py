import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password, verify_password
from app.models.user import User
from app.schemas.auth import RegisterRequest


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    """Fetch a user by email address (case-insensitive)."""
    result = await db.execute(
        select(User).where(User.email == email.lower().strip())
    )
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    """Fetch a user by primary key."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def create_user(db: AsyncSession, payload: RegisterRequest) -> User:
    """
    Create a new user.

    The caller is responsible for checking that the email is not already taken.
    """
    user = User(
        email=payload.email.lower().strip(),
        password_hash=hash_password(payload.password),
        full_name=payload.full_name.strip(),
        fiscal_year=datetime.now(timezone.utc).year,
    )
    db.add(user)
    await db.flush()  # get the generated id without committing
    await db.refresh(user)
    return user


async def authenticate_user(
    db: AsyncSession, email: str, password: str
) -> User | None:
    """
    Verify credentials and return the User, or None if invalid.
    Always runs bcrypt verify to prevent user-enumeration timing attacks.
    """
    user = await get_user_by_email(db, email)
    if user is None:
        # Run a dummy verify to keep timing consistent
        verify_password("dummy", "$2b$12$KIXtheconstanthashtopreventtimingx")
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user
