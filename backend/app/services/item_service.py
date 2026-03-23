"""
Item service — all business logic for items, profit calculation, and DAC7 thresholds.

DAC7 rules (France):
  - Platforms must auto-report to DGFIP when a seller reaches either:
      * 30 transactions in a calendar year, OR
      * €2,000 in gross receipts (= sum of sale prices) in a calendar year
  - Once reported, ALL income (from the first euro) may be taxable.

Alert levels:
  - safe     : both thresholds below 70 %
  - warning  : either threshold between 70 % and 84.99 %
  - danger   : either threshold between 85 % and 99.99 %
  - exceeded : either threshold >= 100 %
"""

import csv
import io
import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import and_, extract, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.item import Item
from app.schemas.dashboard import (
    AlertLevel,
    PlatformBreakdown,
    StatsResponse,
    ThresholdAlert,
    ThresholdStatus,
)
from app.schemas.item import ItemCreate, ItemUpdate, MarkSoldRequest

# DAC7 hard thresholds
DAC7_TRANSACTIONS: int = 30
DAC7_RECEIPTS: Decimal = Decimal("2000.00")

# Alert trigger percentages
_WARN_PCT = 70.0
_DANGER_PCT = 85.0


# ---------------------------------------------------------------------------
# CRUD helpers
# ---------------------------------------------------------------------------


async def list_items(
    db: AsyncSession,
    user_id: uuid.UUID,
    *,
    status: str | None = None,
    platform: str | None = None,
    year: int | None = None,
    search: str | None = None,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[Item]:
    """Return all items belonging to *user_id*, with optional filters."""
    filters = [Item.user_id == user_id]

    if status is not None:
        filters.append(Item.status == status)

    if platform is not None:
        filters.append(Item.platform == platform)

    if year is not None:
        # For sold items: fiscal year = sale year.
        # For unsold items: use purchase year.
        # When no status filter: match either.
        if status == "sold":
            filters.append(extract("year", Item.sale_date) == year)
        elif status == "unsold":
            filters.append(extract("year", Item.purchase_date) == year)
        else:
            filters.append(
                or_(
                    extract("year", Item.purchase_date) == year,
                    and_(Item.sale_date.isnot(None), extract("year", Item.sale_date) == year),
                )
            )

    if search is not None and search.strip():
        filters.append(Item.name.ilike(f"%{search.strip()}%"))

    if date_from is not None:
        # Filter against the most relevant date: sale_date for sold items, purchase_date otherwise
        filters.append(
            or_(
                and_(Item.status == "sold", Item.sale_date >= date_from),
                and_(Item.status == "unsold", Item.purchase_date >= date_from),
            )
        )

    if date_to is not None:
        filters.append(
            or_(
                and_(Item.status == "sold", Item.sale_date <= date_to),
                and_(Item.status == "unsold", Item.purchase_date <= date_to),
            )
        )

    result = await db.execute(
        select(Item).where(and_(*filters)).order_by(Item.created_at.desc())
    )
    return list(result.scalars().all())


async def get_item(
    db: AsyncSession, item_id: uuid.UUID, user_id: uuid.UUID
) -> Item | None:
    """Fetch a single item, scoped to the owning user."""
    result = await db.execute(
        select(Item).where(and_(Item.id == item_id, Item.user_id == user_id))
    )
    return result.scalar_one_or_none()


async def create_item(
    db: AsyncSession, user_id: uuid.UUID, payload: ItemCreate
) -> Item:
    """Create a new item for *user_id*."""
    status = "sold" if payload.sale_price is not None else "unsold"
    item = Item(
        user_id=user_id,
        name=payload.name,
        description=payload.description,
        platform=payload.platform,
        status=status,
        purchase_price=payload.purchase_price,
        purchase_date=payload.purchase_date,
        sale_price=payload.sale_price,
        sale_date=payload.sale_date,
        platform_fees=payload.platform_fees,
        shipping_cost=payload.shipping_cost,
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return item


async def update_item(
    db: AsyncSession,
    item: Item,
    payload: ItemUpdate,
) -> Item:
    """Apply a partial update to an existing item."""
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(item, field, value)
    # Re-evaluate status: an item with a sale_price is sold, without is unsold
    if item.sale_price is not None:
        item.status = "sold"
    else:
        item.status = "unsold"
    await db.flush()
    await db.refresh(item)
    return item


async def mark_item_sold(
    db: AsyncSession,
    item: Item,
    payload: MarkSoldRequest,
) -> Item:
    """Mark an unsold item as sold and record sale details."""
    item.status = "sold"
    item.sale_price = payload.sale_price
    item.sale_date = payload.sale_date
    item.platform_fees = payload.platform_fees
    item.shipping_cost = payload.shipping_cost
    await db.flush()
    await db.refresh(item)
    return item


async def delete_item(db: AsyncSession, item: Item) -> None:
    """Hard-delete an item."""
    await db.delete(item)
    await db.flush()


async def count_items(db: AsyncSession, user_id: uuid.UUID) -> int:
    """Count total items belonging to user_id."""
    result = await db.execute(
        select(func.count(Item.id)).where(Item.user_id == user_id)
    )
    return result.scalar() or 0


# ---------------------------------------------------------------------------
# Dashboard / threshold logic
# ---------------------------------------------------------------------------


def _compute_alert_level(tx_pct: float, rx_pct: float) -> AlertLevel:
    """Determine alert level from the two threshold percentages."""
    max_pct = max(tx_pct, rx_pct)
    if max_pct >= 100.0:
        return "exceeded"
    if max_pct >= _DANGER_PCT:
        return "danger"
    if max_pct >= _WARN_PCT:
        return "warning"
    return "safe"


async def get_sold_items_for_year(
    db: AsyncSession, user_id: uuid.UUID, year: int
) -> list[Item]:
    """Return all sold items whose sale_date falls in *year*."""
    result = await db.execute(
        select(Item).where(
            and_(
                Item.user_id == user_id,
                Item.status == "sold",
                extract("year", Item.sale_date) == year,
            )
        )
    )
    return list(result.scalars().all())


async def compute_stats(
    db: AsyncSession,
    user_id: uuid.UUID,
    year: int,
    user: "User | None" = None,  # type: ignore[name-defined]
) -> StatsResponse:
    """Compute full dashboard statistics for a given fiscal year."""
    sold_items = await get_sold_items_for_year(db, user_id, year)

    total_sold = len(sold_items)
    gross_receipts = sum(
        (item.sale_price or Decimal("0")) for item in sold_items
    )
    total_profit = sum(
        (item.net_profit or Decimal("0")) for item in sold_items
    )
    avg_profit = (total_profit / total_sold) if total_sold > 0 else Decimal("0")

    # Per-platform aggregation
    platform_map: dict[str, dict] = {}
    for item in sold_items:
        p = item.platform
        if p not in platform_map:
            platform_map[p] = {"count": 0, "gross": Decimal("0"), "profit": Decimal("0")}
        platform_map[p]["count"] += 1
        platform_map[p]["gross"] += item.sale_price or Decimal("0")
        platform_map[p]["profit"] += item.net_profit or Decimal("0")

    breakdown = [
        PlatformBreakdown(
            platform=p,
            count=v["count"],
            gross=v["gross"],
            profit=v["profit"],
        )
        for p, v in sorted(platform_map.items(), key=lambda x: x[1]["gross"], reverse=True)
    ]

    best_platform = breakdown[0].platform if breakdown else None

    # DAC7 thresholds
    tx_pct = min((total_sold / DAC7_TRANSACTIONS) * 100.0, 200.0)
    rx_pct = min(
        (float(gross_receipts) / float(DAC7_RECEIPTS)) * 100.0,
        200.0,
    )
    alert_level = _compute_alert_level(tx_pct, rx_pct)

    is_pro = user.plan == "pro" if user else False

    return StatsResponse(
        year=year,
        total_sold_items=total_sold,
        gross_receipts=gross_receipts,
        total_profit=total_profit,
        avg_profit_per_item=avg_profit,
        best_platform=best_platform,
        platform_breakdown=breakdown if is_pro else [],  # Hide breakdown for free users
        threshold_transactions=ThresholdStatus(
            current=total_sold,
            max=DAC7_TRANSACTIONS,
            pct=round(tx_pct, 2),
        ),
        threshold_receipts=ThresholdStatus(
            current=gross_receipts,
            max=DAC7_RECEIPTS,
            pct=round(rx_pct, 2),
        ),
        alert_level=alert_level,
        is_pro=is_pro,
    )


def _alert_message(threshold_type: str, pct: float, alert_level: AlertLevel) -> str:
    """Generate a human-readable French alert message."""
    if alert_level == "exceeded":
        return (
            f"Seuil DAC7 dépassé ({threshold_type}) : vous avez atteint {pct:.1f}% "
            "du seuil de signalement automatique. Vos revenus sont potentiellement déclarés."
        )
    if alert_level == "danger":
        return (
            f"Attention ({threshold_type}) : vous êtes à {pct:.1f}% du seuil DAC7. "
            "Envisagez de consulter un conseiller fiscal."
        )
    if alert_level == "warning":
        return (
            f"Avertissement ({threshold_type}) : vous approchez du seuil DAC7 "
            f"({pct:.1f}%). Surveillez vos ventes."
        )
    return f"Situation normale ({threshold_type}) : {pct:.1f}% du seuil DAC7."


async def get_alerts(
    db: AsyncSession, user_id: uuid.UUID, year: int
) -> list[ThresholdAlert]:
    """Return the list of active threshold alerts for the user."""
    stats = await compute_stats(db, user_id, year)
    alerts: list[ThresholdAlert] = []

    for threshold_type, current, max_val, pct in [
        (
            "transactions",
            stats.threshold_transactions.current,
            stats.threshold_transactions.max,
            stats.threshold_transactions.pct,
        ),
        (
            "receipts",
            stats.threshold_receipts.current,
            stats.threshold_receipts.max,
            stats.threshold_receipts.pct,
        ),
    ]:
        # Individual threshold alert level
        individual_level = _compute_alert_level(
            pct if threshold_type == "transactions" else 0.0,
            pct if threshold_type == "receipts" else 0.0,
        )
        if individual_level != "safe":
            alerts.append(
                ThresholdAlert(
                    alert_level=individual_level,
                    threshold_type=threshold_type,  # type: ignore[arg-type]
                    current_value=current,
                    max_value=max_val,
                    pct=pct,
                    message=_alert_message(threshold_type, pct, individual_level),
                )
            )

    return alerts


async def get_recent_sold_items(
    db: AsyncSession,
    user_id: uuid.UUID,
    *,
    year: int,
    limit: int = 5,
) -> list[Item]:
    """Return the most recently sold items for the current year."""
    result = await db.execute(
        select(Item)
        .where(
            and_(
                Item.user_id == user_id,
                Item.status == "sold",
                extract("year", Item.sale_date) == year,
            )
        )
        .order_by(Item.sale_date.desc(), Item.updated_at.desc())
        .limit(limit)
    )
    return list(result.scalars().all())


async def export_items_csv(
    db: AsyncSession, user_id: uuid.UUID, year: int
) -> io.StringIO:
    """
    Build a CSV export of all sold items for the given year.
    Returns a StringIO object ready for StreamingResponse.
    """
    sold_items = await get_sold_items_for_year(db, user_id, year)

    output = io.StringIO()
    output.write("\ufeff")  # UTF-8 BOM — required for Excel on Windows to detect encoding
    writer = csv.writer(output, delimiter=";", quoting=csv.QUOTE_MINIMAL)

    # Header row (French labels for the end user)
    writer.writerow(
        [
            "ID",
            "Nom",
            "Plateforme",
            "Date d'achat",
            "Prix d'achat (€)",
            "Date de vente",
            "Prix de vente (€)",
            "Frais plateforme (€)",
            "Frais d'envoi (€)",
            "Recette brute (€)",
            "Bénéfice net (€)",
        ]
    )

    for item in sold_items:
        writer.writerow(
            [
                str(item.id),
                item.name,
                item.platform,
                item.purchase_date.isoformat() if item.purchase_date else "",
                str(item.purchase_price),
                item.sale_date.isoformat() if item.sale_date else "",
                str(item.sale_price) if item.sale_price is not None else "",
                str(item.platform_fees),
                str(item.shipping_cost),
                str(item.gross_receipt) if item.gross_receipt is not None else "",
                str(item.net_profit) if item.net_profit is not None else "",
            ]
        )

    output.seek(0)
    return output
