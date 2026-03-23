"""
Tests for dashboard statistics and DAC7 threshold logic.

Covers:
- Dashboard stats with empty/single/multiple items
- Correct profit calculation (gross_receipt, net_profit)
- Alert level thresholds: safe, warning, danger, exceeded
- Year filtering
- Platform breakdown aggregation
"""

from decimal import Decimal

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


async def _create_sold_item(
    client: AsyncClient,
    headers: dict,
    sale_price: str,
    platform: str = "vinted",
    year: int = 2024,
    platform_fees: str = "0",
    shipping_cost: str = "0",
) -> dict:
    """Helper to create a sold item."""
    resp = await client.post(
        "/api/v1/items",
        json={
            "name": f"Item {sale_price}",
            "platform": platform,
            "purchase_price": "1.00",
            "purchase_date": f"{year}-01-01",
            "sale_price": sale_price,
            "sale_date": f"{year}-06-01",
            "platform_fees": platform_fees,
            "shipping_cost": shipping_cost,
        },
        headers=headers,
    )
    assert resp.status_code == 201
    return resp.json()


# ---------------------------------------------------------------------------
# Empty Dashboard
# ---------------------------------------------------------------------------


async def test_dashboard_stats_empty(client: AsyncClient, auth_headers: dict) -> None:
    """Dashboard with no items should show zeros and 'safe' alert."""
    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["total_sold_items"] == 0
    assert Decimal(data["gross_receipts"]) == Decimal("0")
    assert Decimal(data["total_profit"]) == Decimal("0")
    assert Decimal(data["avg_profit"]) == Decimal("0")
    assert data["alert_level"] == "safe"

    # Thresholds should both be 0%
    assert data["threshold_receipts"]["current"] == 0
    assert data["threshold_receipts"]["percentage"] == 0.0
    assert data["threshold_transactions"]["current"] == 0
    assert data["threshold_transactions"]["percentage"] == 0.0


# ---------------------------------------------------------------------------
# Basic Stats with Items
# ---------------------------------------------------------------------------


async def test_dashboard_stats_single_item(client: AsyncClient, auth_headers: dict) -> None:
    """Dashboard with one sold item."""
    await _create_sold_item(client, auth_headers, "100.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["total_sold_items"] == 1
    assert Decimal(data["gross_receipts"]) == Decimal("100.00")
    # net = 100 - 1 (purchase) = 99
    assert Decimal(data["total_profit"]) == Decimal("99.00")
    assert Decimal(data["avg_profit"]) == Decimal("99.00")


async def test_dashboard_stats_multiple_items(client: AsyncClient, auth_headers: dict) -> None:
    """Dashboard aggregates multiple items correctly."""
    await _create_sold_item(client, auth_headers, "500.00")
    await _create_sold_item(client, auth_headers, "300.00")
    await _create_sold_item(client, auth_headers, "200.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["total_sold_items"] == 3
    assert Decimal(data["gross_receipts"]) == Decimal("1000.00")


# ---------------------------------------------------------------------------
# Profit Calculation
# ---------------------------------------------------------------------------


async def test_dashboard_profit_calculation(client: AsyncClient, auth_headers: dict) -> None:
    """net_profit = sale_price - purchase_price - platform_fees - shipping_cost."""
    resp = await client.post(
        "/api/v1/items",
        json={
            "name": "Test Item",
            "platform": "ebay",
            "purchase_price": "100.00",
            "purchase_date": "2024-01-01",
            "sale_price": "200.00",
            "sale_date": "2024-06-01",
            "platform_fees": "10.00",
            "shipping_cost": "5.00",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201

    dashboard_resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert dashboard_resp.status_code == 200
    data = dashboard_resp.json()

    # net = 200 - 100 - 10 - 5 = 85
    assert Decimal(data["total_profit"]) == Decimal("85.00")


# ---------------------------------------------------------------------------
# DAC7 Alert Levels (DAC7_RECEIPTS = €2000, DAC7_TRANSACTIONS = 30)
# ---------------------------------------------------------------------------


async def test_alert_level_safe(client: AsyncClient, auth_headers: dict) -> None:
    """< 70% of threshold = 'safe'."""
    # 70% of 2000 = 1400, so < 1400 is safe
    await _create_sold_item(client, auth_headers, "1000.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["alert_level"] == "safe"
    assert resp.json()["threshold_receipts"]["percentage"] < 70.0


async def test_alert_level_warning(client: AsyncClient, auth_headers: dict) -> None:
    """70% <= threshold < 85% = 'warning'."""
    # 70% of 2000 = 1400
    await _create_sold_item(client, auth_headers, "1400.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["alert_level"] == "warning"
    assert data["threshold_receipts"]["percentage"] >= 70.0


async def test_alert_level_danger(client: AsyncClient, auth_headers: dict) -> None:
    """85% <= threshold < 100% = 'danger'."""
    # 85% of 2000 = 1700
    await _create_sold_item(client, auth_headers, "1700.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["alert_level"] == "danger"
    assert data["threshold_receipts"]["percentage"] >= 85.0


async def test_alert_level_exceeded_by_receipts(client: AsyncClient, auth_headers: dict) -> None:
    """threshold >= 100% = 'exceeded'."""
    await _create_sold_item(client, auth_headers, "2001.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["alert_level"] == "exceeded"
    assert data["threshold_receipts"]["percentage"] > 100.0


async def test_alert_level_exceeded_by_transactions(client: AsyncClient, auth_headers: dict) -> None:
    """30+ transactions triggers 'exceeded' regardless of receipts."""
    for i in range(31):
        await _create_sold_item(client, auth_headers, f"{10.00 + i}")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["threshold_transactions"]["current"] == 31
    assert data["threshold_transactions"]["percentage"] > 100.0
    assert data["alert_level"] == "exceeded"


async def test_alert_level_exactly_30_transactions(client: AsyncClient, auth_headers: dict) -> None:
    """Exactly 30 transactions should trigger exceeded (100%)."""
    for i in range(30):
        await _create_sold_item(client, auth_headers, "10.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["threshold_transactions"]["current"] == 30
    assert data["threshold_transactions"]["percentage"] == 100.0
    assert data["alert_level"] == "exceeded"


# ---------------------------------------------------------------------------
# Year Filtering
# ---------------------------------------------------------------------------


async def test_dashboard_year_filtering_2024(client: AsyncClient, auth_headers: dict) -> None:
    """Stats for year 2024 should only include 2024 sales."""
    await _create_sold_item(client, auth_headers, "500.00", year=2024)
    await _create_sold_item(client, auth_headers, "1000.00", year=2023)

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_sold_items"] == 1
    assert Decimal(data["gross_receipts"]) == Decimal("500.00")


async def test_dashboard_year_filtering_2023(client: AsyncClient, auth_headers: dict) -> None:
    """Stats for year 2023 should only include 2023 sales."""
    await _create_sold_item(client, auth_headers, "500.00", year=2024)
    await _create_sold_item(client, auth_headers, "1000.00", year=2023)

    resp = await client.get("/api/v1/dashboard/stats?year=2023", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_sold_items"] == 1
    assert Decimal(data["gross_receipts"]) == Decimal("1000.00")


async def test_dashboard_default_year_is_current(client: AsyncClient, auth_headers: dict) -> None:
    """Without year param, should default to current year (2024 in tests)."""
    await _create_sold_item(client, auth_headers, "100.00", year=2024)

    # Don't specify year — should default to current
    resp = await client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    # Should include the 2024 item
    assert data["total_sold_items"] == 1


# ---------------------------------------------------------------------------
# Platform Breakdown
# ---------------------------------------------------------------------------


async def test_platform_breakdown(client: AsyncClient, auth_headers: dict) -> None:
    """Platform breakdown should aggregate by platform."""
    await _create_sold_item(client, auth_headers, "100.00", platform="vinted")
    await _create_sold_item(client, auth_headers, "200.00", platform="vinted")
    await _create_sold_item(client, auth_headers, "300.00", platform="ebay")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()

    # Check breakdown exists and has the right structure
    assert "platform_breakdown" in data
    breakdown = {p["platform"]: p for p in data["platform_breakdown"]}

    assert "vinted" in breakdown
    assert breakdown["vinted"]["count"] == 2
    assert Decimal(breakdown["vinted"]["gross"]) == Decimal("300.00")

    assert "ebay" in breakdown
    assert breakdown["ebay"]["count"] == 1
    assert Decimal(breakdown["ebay"]["gross"]) == Decimal("300.00")


# ---------------------------------------------------------------------------
# Alerts Endpoint
# ---------------------------------------------------------------------------


async def test_alerts_endpoint_empty(client: AsyncClient, auth_headers: dict) -> None:
    """Alerts endpoint with no items should return empty list."""
    resp = await client.get("/api/v1/dashboard/alerts?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


async def test_alerts_endpoint_warning(client: AsyncClient, auth_headers: dict) -> None:
    """Alerts endpoint should return alert when threshold crossed."""
    await _create_sold_item(client, auth_headers, "1400.00")

    resp = await client.get("/api/v1/dashboard/alerts?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    alerts = resp.json()
    assert len(alerts) >= 1
    assert alerts[0]["alert_level"] in ("warning", "danger", "exceeded")


async def test_alerts_endpoint_structure(client: AsyncClient, auth_headers: dict) -> None:
    """Alert objects should have required fields."""
    await _create_sold_item(client, auth_headers, "1500.00")

    resp = await client.get("/api/v1/dashboard/alerts?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    alerts = resp.json()
    if alerts:
        alert = alerts[0]
        assert "alert_level" in alert
        assert "message" in alert
        assert "threshold_type" in alert


# ---------------------------------------------------------------------------
# Auth Guard
# ---------------------------------------------------------------------------


async def test_dashboard_stats_requires_auth(client: AsyncClient) -> None:
    """Stats without auth token should fail."""
    resp = await client.get("/api/v1/dashboard/stats?year=2024")
    assert resp.status_code in (401, 403)


async def test_dashboard_alerts_requires_auth(client: AsyncClient) -> None:
    """Alerts without auth token should fail."""
    resp = await client.get("/api/v1/dashboard/alerts?year=2024")
    assert resp.status_code in (401, 403)
