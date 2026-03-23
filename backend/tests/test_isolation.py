"""
Tests for row-level security and user isolation.

Ensures that:
- User A cannot read User B's items
- User A cannot modify/delete User B's items
- User A's dashboard excludes User B's items
- User A's exports don't leak User B's data
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
async def user_a_headers(client: AsyncClient) -> dict:
    """Authenticated headers for User A."""
    await create_test_user(client, email="user_a@example.com")
    return await get_auth_headers(client, email="user_a@example.com")


@pytest_asyncio.fixture
async def user_b_headers(client: AsyncClient) -> dict:
    """Authenticated headers for User B."""
    await create_test_user(client, email="user_b@example.com")
    return await get_auth_headers(client, email="user_b@example.com")


@pytest_asyncio.fixture
async def user_c_headers(client: AsyncClient) -> dict:
    """Authenticated headers for User C."""
    await create_test_user(client, email="user_c@example.com")
    return await get_auth_headers(client, email="user_c@example.com")


# ---------------------------------------------------------------------------
# Read Access Control (List/Get)
# ---------------------------------------------------------------------------


async def test_user_a_cannot_see_user_b_items(
    client: AsyncClient,
    user_a_headers: dict,
    user_b_headers: dict,
) -> None:
    """User A's items list should not include User B's items."""
    # User A creates an item
    resp_a = await client.post(
        "/api/v1/items",
        json={
            "name": "User A Item",
            "platform": "vinted",
            "purchase_price": "100.00",
            "purchase_date": "2024-01-01",
        },
        headers=user_a_headers,
    )
    assert resp_a.status_code == 201

    # User B creates an item
    resp_b = await client.post(
        "/api/v1/items",
        json={
            "name": "User B Item",
            "platform": "ebay",
            "purchase_price": "200.00",
            "purchase_date": "2024-01-05",
        },
        headers=user_b_headers,
    )
    assert resp_b.status_code == 201

    # User A lists items
    list_resp = await client.get("/api/v1/items", headers=user_a_headers)
    assert list_resp.status_code == 200
    items = list_resp.json()

    # User A should only see their own item
    assert len(items) == 1
    assert items[0]["name"] == "User A Item"


async def test_user_b_cannot_see_user_a_items(
    client: AsyncClient,
    user_a_headers: dict,
    user_b_headers: dict,
) -> None:
    """User B's items list should not include User A's items."""
    # User A creates an item
    resp_a = await client.post(
        "/api/v1/items",
        json={
            "name": "User A Secret",
            "platform": "vinted",
            "purchase_price": "500.00",
            "purchase_date": "2024-01-01",
        },
        headers=user_a_headers,
    )
    assert resp_a.status_code == 201

    # User B lists items
    list_resp = await client.get("/api/v1/items", headers=user_b_headers)
    assert list_resp.status_code == 200
    items = list_resp.json()

    # User B should see no items
    assert len(items) == 0


async def test_user_cannot_access_other_users_item_by_id(
    client: AsyncClient,
    user_a_headers: dict,
    user_b_headers: dict,
) -> None:
    """User B cannot access User A's item by ID, even if they guess the ID."""
    # User A creates an item
    resp_a = await client.post(
        "/api/v1/items",
        json={
            "name": "Secret Item",
            "platform": "vinted",
            "purchase_price": "100.00",
            "purchase_date": "2024-01-01",
        },
        headers=user_a_headers,
    )
    assert resp_a.status_code == 201
    item_id = resp_a.json()["id"]

    # User B tries to access it by ID
    resp_b = await client.get(f"/api/v1/items/{item_id}", headers=user_b_headers)
    # Should return 404 (or 403) — the item doesn't exist for User B
    assert resp_b.status_code in (404, 403)


# ---------------------------------------------------------------------------
# Write Access Control (Update/Delete)
# ---------------------------------------------------------------------------


async def test_user_cannot_update_other_users_item(
    client: AsyncClient,
    user_a_headers: dict,
    user_b_headers: dict,
) -> None:
    """User B cannot modify User A's item."""
    # User A creates an item
    resp_a = await client.post(
        "/api/v1/items",
        json={
            "name": "Original Name",
            "platform": "vinted",
            "purchase_price": "100.00",
            "purchase_date": "2024-01-01",
        },
        headers=user_a_headers,
    )
    assert resp_a.status_code == 201
    item_id = resp_a.json()["id"]

    # User B tries to update it
    resp_b = await client.put(
        f"/api/v1/items/{item_id}",
        json={"name": "Stolen Name"},
        headers=user_b_headers,
    )
    assert resp_b.status_code in (404, 403)

    # Verify the name wasn't changed (User A can still see original)
    resp_check = await client.get(f"/api/v1/items/{item_id}", headers=user_a_headers)
    assert resp_check.status_code == 200
    assert resp_check.json()["name"] == "Original Name"


async def test_user_cannot_delete_other_users_item(
    client: AsyncClient,
    user_a_headers: dict,
    user_b_headers: dict,
) -> None:
    """User B cannot delete User A's item."""
    # User A creates an item
    resp_a = await client.post(
        "/api/v1/items",
        json={
            "name": "Item to Protect",
            "platform": "vinted",
            "purchase_price": "100.00",
            "purchase_date": "2024-01-01",
        },
        headers=user_a_headers,
    )
    assert resp_a.status_code == 201
    item_id = resp_a.json()["id"]

    # User B tries to delete it
    resp_b = await client.delete(f"/api/v1/items/{item_id}", headers=user_b_headers)
    assert resp_b.status_code in (404, 403)

    # Verify it wasn't deleted (User A can still get it)
    resp_check = await client.get(f"/api/v1/items/{item_id}", headers=user_a_headers)
    assert resp_check.status_code == 200


async def test_user_cannot_mark_other_users_item_sold(
    client: AsyncClient,
    user_a_headers: dict,
    user_b_headers: dict,
) -> None:
    """User B cannot mark User A's item as sold."""
    # User A creates an unsold item
    resp_a = await client.post(
        "/api/v1/items",
        json={
            "name": "Unsold Item",
            "platform": "vinted",
            "purchase_price": "100.00",
            "purchase_date": "2024-01-01",
        },
        headers=user_a_headers,
    )
    assert resp_a.status_code == 201
    item_id = resp_a.json()["id"]

    # User B tries to mark it sold
    resp_b = await client.post(
        f"/api/v1/items/{item_id}/mark-sold",
        json={
            "sale_price": "150.00",
            "sale_date": "2024-02-01",
        },
        headers=user_b_headers,
    )
    assert resp_b.status_code in (404, 403)

    # Verify it's still unsold (User A can check)
    resp_check = await client.get(f"/api/v1/items/{item_id}", headers=user_a_headers)
    assert resp_check.status_code == 200
    assert resp_check.json()["status"] == "unsold"


# ---------------------------------------------------------------------------
# Dashboard Isolation
# ---------------------------------------------------------------------------


async def test_dashboard_excludes_other_users_items(
    client: AsyncClient,
    user_a_headers: dict,
    user_b_headers: dict,
) -> None:
    """User A's dashboard should not include User B's items."""
    # User A creates a sold item
    await client.post(
        "/api/v1/items",
        json={
            "name": "User A Sale",
            "platform": "vinted",
            "purchase_price": "100.00",
            "purchase_date": "2024-01-01",
            "sale_price": "150.00",
            "sale_date": "2024-02-01",
        },
        headers=user_a_headers,
    )

    # User B creates a sold item
    await client.post(
        "/api/v1/items",
        json={
            "name": "User B Sale",
            "platform": "ebay",
            "purchase_price": "200.00",
            "purchase_date": "2024-01-05",
            "sale_price": "300.00",
            "sale_date": "2024-02-10",
        },
        headers=user_b_headers,
    )

    # User A's dashboard
    resp_a = await client.get("/api/v1/dashboard/stats?year=2024", headers=user_a_headers)
    assert resp_a.status_code == 200
    stats_a = resp_a.json()

    # User B's dashboard
    resp_b = await client.get("/api/v1/dashboard/stats?year=2024", headers=user_b_headers)
    assert resp_b.status_code == 200
    stats_b = resp_b.json()

    # User A should see 1 sale
    assert stats_a["total_sold_items"] == 1
    assert Decimal(stats_a["gross_receipts"]) == Decimal("150.00")

    # User B should see 1 sale
    assert stats_b["total_sold_items"] == 1
    assert Decimal(stats_b["gross_receipts"]) == Decimal("300.00")


async def test_dashboard_stats_independent(
    client: AsyncClient,
    user_a_headers: dict,
    user_b_headers: dict,
    user_c_headers: dict,
) -> None:
    """Multiple users' dashboards should be completely independent."""
    # Create items for each user with different amounts
    await client.post(
        "/api/v1/items",
        json={
            "name": "A Item",
            "platform": "vinted",
            "purchase_price": "100.00",
            "purchase_date": "2024-01-01",
            "sale_price": "500.00",
            "sale_date": "2024-02-01",
        },
        headers=user_a_headers,
    )

    await client.post(
        "/api/v1/items",
        json={
            "name": "B Item",
            "platform": "ebay",
            "purchase_price": "100.00",
            "purchase_date": "2024-01-01",
            "sale_price": "1000.00",
            "sale_date": "2024-02-01",
        },
        headers=user_b_headers,
    )

    # User C has no items
    resp_c = await client.get("/api/v1/dashboard/stats?year=2024", headers=user_c_headers)
    assert resp_c.status_code == 200
    assert resp_c.json()["total_sold_items"] == 0
    assert Decimal(resp_c.json()["gross_receipts"]) == Decimal("0")


# ---------------------------------------------------------------------------
# Export Isolation
# ---------------------------------------------------------------------------


async def test_export_csv_excludes_other_users_data(
    client: AsyncClient,
    user_a_headers: dict,
    user_b_headers: dict,
) -> None:
    """User A's CSV export must not contain User B's items."""
    # User A creates an item
    await client.post(
        "/api/v1/items",
        json={
            "name": "User A Exported",
            "platform": "vinted",
            "purchase_price": "100.00",
            "purchase_date": "2024-01-01",
            "sale_price": "150.00",
            "sale_date": "2024-02-01",
        },
        headers=user_a_headers,
    )

    # User B creates an item
    await client.post(
        "/api/v1/items",
        json={
            "name": "User B Secret",
            "platform": "ebay",
            "purchase_price": "200.00",
            "purchase_date": "2024-01-05",
            "sale_price": "300.00",
            "sale_date": "2024-02-10",
        },
        headers=user_b_headers,
    )

    # User A's export
    resp_a = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=user_a_headers)
    assert resp_a.status_code == 200
    content_a = resp_a.text

    # User A should see their item
    assert "User A Exported" in content_a
    # User A should NOT see User B's item
    assert "User B Secret" not in content_a

    # User B's export
    resp_b = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=user_b_headers)
    assert resp_b.status_code == 200
    content_b = resp_b.text

    # User B should see their item
    assert "User B Secret" in content_b
    # User B should NOT see User A's item
    assert "User A Exported" not in content_b


# ---------------------------------------------------------------------------
# Alerts Isolation
# ---------------------------------------------------------------------------


async def test_alerts_endpoint_excludes_other_users_items(
    client: AsyncClient,
    user_a_headers: dict,
    user_b_headers: dict,
) -> None:
    """User A's alerts should not be affected by User B's items."""
    # User A creates a small sale (no alert)
    await client.post(
        "/api/v1/items",
        json={
            "name": "User A Small",
            "platform": "vinted",
            "purchase_price": "100.00",
            "purchase_date": "2024-01-01",
            "sale_price": "500.00",
            "sale_date": "2024-02-01",
        },
        headers=user_a_headers,
    )

    # User B creates a large sale (exceeds threshold)
    for i in range(31):
        await client.post(
            "/api/v1/items",
            json={
                "name": f"User B Item {i}",
                "platform": "ebay",
                "purchase_price": "10.00",
                "purchase_date": "2024-01-01",
                "sale_price": "50.00",
                "sale_date": "2024-02-01",
            },
            headers=user_b_headers,
        )

    # User A's alerts should not include User B's threshold
    resp_a = await client.get("/api/v1/dashboard/alerts?year=2024", headers=user_a_headers)
    assert resp_a.status_code == 200
    alerts_a = resp_a.json()
    # User A should have no alerts (< 70% of threshold)
    assert len(alerts_a) == 0

    # User B's alerts should show exceeded
    resp_b = await client.get("/api/v1/dashboard/alerts?year=2024", headers=user_b_headers)
    assert resp_b.status_code == 200
    alerts_b = resp_b.json()
    # User B should have alerts (exceeded)
    assert len(alerts_b) > 0
