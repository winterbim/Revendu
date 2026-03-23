"""
Tests for the items and dashboard endpoints.

Covers:
- Auth guard on protected routes
- Item CRUD (create, list, update, delete)
- mark-sold endpoint
- Dashboard stats + threshold logic
- DAC7 alert level transitions
- Row-level isolation: user A cannot see user B's items
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
    await create_test_user(client)
    return await get_auth_headers(client)


@pytest_asyncio.fixture
async def auth_headers_b(client: AsyncClient) -> dict:
    """Second user for isolation tests."""
    await create_test_user(client, email="other@example.com")
    return await get_auth_headers(client, email="other@example.com")


# ---------------------------------------------------------------------------
# Auth guard
# ---------------------------------------------------------------------------


async def test_items_requires_auth(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/items")
    assert resp.status_code in (401, 403)  # FastAPI HTTPBearer: 403 pre-0.111, 401 post-0.111


async def test_dashboard_requires_auth(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/dashboard/stats")
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# Registration & login
# ---------------------------------------------------------------------------


async def test_register_success(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "new@example.com", "password": "MyPass42", "full_name": "Alice"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "new@example.com"
    assert "password" not in data
    assert "password_hash" not in data


async def test_register_duplicate_email(client: AsyncClient) -> None:
    await create_test_user(client)
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "test@example.com", "password": "MyPass42", "full_name": "Alice"},
    )
    assert resp.status_code == 409


async def test_login_invalid_credentials(client: AsyncClient) -> None:
    await create_test_user(client)
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "WrongPass1"},
    )
    assert resp.status_code == 401


async def test_password_too_weak(client: AsyncClient) -> None:
    resp = await client.post(
        "/api/v1/auth/register",
        json={"email": "weak@example.com", "password": "nodigits", "full_name": "Weak"},
    )
    assert resp.status_code == 422


# ---------------------------------------------------------------------------
# Items CRUD
# ---------------------------------------------------------------------------


async def test_create_item(client: AsyncClient, auth_headers: dict) -> None:
    resp = await client.post(
        "/api/v1/items",
        json={
            "name": "Nike Air Max",
            "platform": "vinted",
            "purchase_price": "45.00",
            "purchase_date": "2024-03-01",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Nike Air Max"
    assert data["status"] == "unsold"
    assert data["gross_receipt"] is None
    assert data["net_profit"] is None


async def test_create_item_already_sold(client: AsyncClient, auth_headers: dict) -> None:
    resp = await client.post(
        "/api/v1/items",
        json={
            "name": "iPhone 12",
            "platform": "leboncoin",
            "purchase_price": "300.00",
            "purchase_date": "2024-01-10",
            "sale_price": "380.00",
            "sale_date": "2024-01-20",
            "platform_fees": "15.00",
            "shipping_cost": "5.00",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "sold"
    assert data["gross_receipt"] == "380.00"
    # net = 380 - 300 - 15 - 5 = 60
    assert Decimal(data["net_profit"]) == Decimal("60.00")


async def test_list_items_empty(client: AsyncClient, auth_headers: dict) -> None:
    resp = await client.get("/api/v1/items", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


async def test_list_items_filter_status(client: AsyncClient, auth_headers: dict) -> None:
    # Create one unsold and one sold item
    await client.post(
        "/api/v1/items",
        json={"name": "Unsold", "platform": "vinted", "purchase_price": "10.00", "purchase_date": "2024-01-01"},
        headers=auth_headers,
    )
    await client.post(
        "/api/v1/items",
        json={
            "name": "Sold",
            "platform": "ebay",
            "purchase_price": "20.00",
            "purchase_date": "2024-01-01",
            "sale_price": "30.00",
            "sale_date": "2024-01-15",
        },
        headers=auth_headers,
    )

    resp = await client.get("/api/v1/items?status=unsold", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["name"] == "Unsold"

    resp_sold = await client.get("/api/v1/items?status=sold", headers=auth_headers)
    assert resp_sold.status_code == 200
    assert len(resp_sold.json()) == 1


async def test_update_item(client: AsyncClient, auth_headers: dict) -> None:
    create_resp = await client.post(
        "/api/v1/items",
        json={"name": "Old Name", "platform": "vinted", "purchase_price": "10.00", "purchase_date": "2024-01-01"},
        headers=auth_headers,
    )
    item_id = create_resp.json()["id"]

    resp = await client.put(
        f"/api/v1/items/{item_id}",
        json={"name": "New Name", "purchase_price": "12.00"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"
    assert Decimal(resp.json()["purchase_price"]) == Decimal("12.00")


async def test_delete_item(client: AsyncClient, auth_headers: dict) -> None:
    create_resp = await client.post(
        "/api/v1/items",
        json={"name": "To Delete", "platform": "vinted", "purchase_price": "5.00", "purchase_date": "2024-01-01"},
        headers=auth_headers,
    )
    item_id = create_resp.json()["id"]

    del_resp = await client.delete(f"/api/v1/items/{item_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    # Should no longer appear in list
    list_resp = await client.get("/api/v1/items", headers=auth_headers)
    assert all(i["id"] != item_id for i in list_resp.json())


async def test_mark_sold(client: AsyncClient, auth_headers: dict) -> None:
    create_resp = await client.post(
        "/api/v1/items",
        json={"name": "Jacket", "platform": "vestiaire", "purchase_price": "150.00", "purchase_date": "2024-02-01"},
        headers=auth_headers,
    )
    item_id = create_resp.json()["id"]

    resp = await client.post(
        f"/api/v1/items/{item_id}/mark-sold",
        json={
            "sale_price": "200.00",
            "sale_date": "2024-03-10",
            "platform_fees": "20.00",
            "shipping_cost": "8.00",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "sold"
    assert Decimal(data["net_profit"]) == Decimal("22.00")  # 200 - 150 - 20 - 8


async def test_mark_sold_already_sold(client: AsyncClient, auth_headers: dict) -> None:
    create_resp = await client.post(
        "/api/v1/items",
        json={
            "name": "Already Sold",
            "platform": "vinted",
            "purchase_price": "10.00",
            "purchase_date": "2024-01-01",
            "sale_price": "20.00",
            "sale_date": "2024-01-15",
        },
        headers=auth_headers,
    )
    item_id = create_resp.json()["id"]

    resp = await client.post(
        f"/api/v1/items/{item_id}/mark-sold",
        json={"sale_price": "25.00", "sale_date": "2024-01-20"},
        headers=auth_headers,
    )
    assert resp.status_code == 409


# ---------------------------------------------------------------------------
# Row-level security: user isolation
# ---------------------------------------------------------------------------


async def test_user_cannot_access_other_users_item(
    client: AsyncClient,
    auth_headers: dict,
    auth_headers_b: dict,
) -> None:
    # User A creates an item
    create_resp = await client.post(
        "/api/v1/items",
        json={"name": "Secret Item", "platform": "vinted", "purchase_price": "50.00", "purchase_date": "2024-01-01"},
        headers=auth_headers,
    )
    item_id = create_resp.json()["id"]

    # User B tries to update it
    resp = await client.put(
        f"/api/v1/items/{item_id}",
        json={"name": "Stolen"},
        headers=auth_headers_b,
    )
    assert resp.status_code == 404

    # User B tries to delete it
    resp = await client.delete(f"/api/v1/items/{item_id}", headers=auth_headers_b)
    assert resp.status_code == 404

    # User B's list does not contain it
    list_resp = await client.get("/api/v1/items", headers=auth_headers_b)
    assert all(i["id"] != item_id for i in list_resp.json())


# ---------------------------------------------------------------------------
# Dashboard stats & DAC7 thresholds
# ---------------------------------------------------------------------------


async def _create_sold_item(client: AsyncClient, headers: dict, sale_price: str, year: int = 2024) -> None:
    await client.post(
        "/api/v1/items",
        json={
            "name": f"Item {sale_price}",
            "platform": "vinted",
            "purchase_price": "1.00",
            "purchase_date": f"{year}-01-01",
            "sale_price": sale_price,
            "sale_date": f"{year}-06-01",
        },
        headers=headers,
    )


async def test_dashboard_stats_empty(client: AsyncClient, auth_headers: dict) -> None:
    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_sold_items"] == 0
    assert Decimal(data["gross_receipts"]) == Decimal("0")
    assert data["alert_level"] == "safe"


async def test_dashboard_stats_with_sales(client: AsyncClient, auth_headers: dict) -> None:
    await _create_sold_item(client, auth_headers, "500.00")
    await _create_sold_item(client, auth_headers, "300.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_sold_items"] == 2
    assert Decimal(data["gross_receipts"]) == Decimal("800.00")


async def test_alert_level_warning(client: AsyncClient, auth_headers: dict) -> None:
    """70% of €2000 = €1400 triggers 'warning'."""
    await _create_sold_item(client, auth_headers, "1400.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.json()["alert_level"] == "warning"


async def test_alert_level_danger(client: AsyncClient, auth_headers: dict) -> None:
    """85% of €2000 = €1700 triggers 'danger'."""
    await _create_sold_item(client, auth_headers, "1700.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.json()["alert_level"] == "danger"


async def test_alert_level_exceeded(client: AsyncClient, auth_headers: dict) -> None:
    """€2001 exceeds the receipts threshold."""
    await _create_sold_item(client, auth_headers, "2001.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    assert resp.json()["alert_level"] == "exceeded"


async def test_alert_level_exceeded_by_transactions(client: AsyncClient, auth_headers: dict) -> None:
    """31 transactions exceeds the transactions threshold regardless of receipts."""
    for i in range(31):
        await _create_sold_item(client, auth_headers, "10.00")

    resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=auth_headers)
    data = resp.json()
    assert data["threshold_transactions"]["current"] == 31
    assert data["alert_level"] == "exceeded"


async def test_alerts_endpoint_returns_list(client: AsyncClient, auth_headers: dict) -> None:
    await _create_sold_item(client, auth_headers, "1500.00")

    resp = await client.get("/api/v1/dashboard/alerts?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    alerts = resp.json()
    assert isinstance(alerts, list)
    assert len(alerts) >= 1
    assert alerts[0]["alert_level"] in ("warning", "danger", "exceeded")


async def test_export_csv(client: AsyncClient, auth_headers: dict) -> None:
    await _create_sold_item(client, auth_headers, "99.00")

    resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]
    content = resp.text
    # Header row must be present
    assert "Nom" in content
    assert "Plateforme" in content
    # Data row must be present
    assert "99.00" in content


async def test_export_csv_user_isolation(
    client: AsyncClient,
    auth_headers: dict,
    auth_headers_b: dict,
) -> None:
    """User B's export must not contain User A's data."""
    await _create_sold_item(client, auth_headers, "999.00")

    resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers_b)
    assert resp.status_code == 200
    # Only header row — no data
    lines = [ln for ln in resp.text.splitlines() if ln.strip()]
    assert len(lines) == 1  # header only
