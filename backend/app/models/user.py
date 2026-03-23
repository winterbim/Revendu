import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        nullable=False,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    fiscal_year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).year,
    )
    plan: Mapped[str] = mapped_column(String(20), nullable=False, default="free")
    stripe_customer_id: Mapped[str | None] = mapped_column(String(255), nullable=True, default=None)

    # Gmail sync
    gmail_refresh_token: Mapped[str | None] = mapped_column(String(1000), nullable=True, default=None)
    gmail_connected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    last_email_sync: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, default=None)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # Relationships
    items: Mapped[list["Item"]] = relationship(  # noqa: F821
        "Item",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="noload",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email!r}>"
