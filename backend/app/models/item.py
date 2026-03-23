import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models import Base

# Platforms supported for DAC7 reporting
PLATFORM_VALUES = ("vinted", "leboncoin", "ebay", "vestiaire", "autres")
STATUS_VALUES = ("unsold", "sold")


class Item(Base):
    __tablename__ = "items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Item details
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Platform & status
    platform: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="autres",
    )
    status: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
        default="unsold",
    )

    # Purchase side
    purchase_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )
    purchase_date: Mapped[date] = mapped_column(Date, nullable=False)

    # Sale side (filled when sold)
    sale_price: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )
    sale_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    # Cost deductions
    platform_fees: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )
    shipping_cost: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    # Timestamps
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

    # Relationship
    user: Mapped["User"] = relationship(  # noqa: F821
        "User",
        back_populates="items",
        lazy="noload",
    )

    # ------------------------------------------------------------------
    # Computed properties (not persisted — calculated in Python)
    # ------------------------------------------------------------------

    @property
    def gross_receipt(self) -> Decimal | None:
        """What DAC7 measures: the raw sale price."""
        return self.sale_price

    @property
    def net_profit(self) -> Decimal | None:
        """Net profit after all costs. None if item not sold."""
        if self.sale_price is None:
            return None
        return self.sale_price - self.purchase_price - self.platform_fees - self.shipping_cost

    def __repr__(self) -> str:
        return f"<Item id={self.id} name={self.name!r} status={self.status!r}>"
