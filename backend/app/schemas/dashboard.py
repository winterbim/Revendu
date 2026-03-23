from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field

AlertLevel = Literal["safe", "warning", "danger", "exceeded"]


class ThresholdStatus(BaseModel):
    current: int | Decimal
    max: int | Decimal
    pct: float = Field(ge=0.0)


class PlatformBreakdown(BaseModel):
    platform: str
    count: int
    gross: Decimal
    profit: Decimal


class ThresholdAlert(BaseModel):
    alert_level: AlertLevel
    threshold_type: Literal["transactions", "receipts"]
    current_value: int | Decimal
    max_value: int | Decimal
    pct: float
    message: str


class StatsResponse(BaseModel):
    year: int
    total_sold_items: int
    gross_receipts: Decimal
    total_profit: Decimal
    avg_profit_per_item: Decimal
    best_platform: str | None
    platform_breakdown: list[PlatformBreakdown]
    threshold_transactions: ThresholdStatus
    threshold_receipts: ThresholdStatus
    alert_level: AlertLevel
    is_pro: bool = False  # Added for frontend to conditionally show features
