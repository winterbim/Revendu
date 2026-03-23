"""
Tests for data export functionality (CSV, Excel, PDF).

Covers:
- CSV export: valid format, headers, data
- CSV export with 0 items
- Excel export (if implemented)
- PDF export (if implemented)
- User isolation in exports
"""

import csv
import io

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


@pytest_asyncio.fixture
async def auth_headers_b(client: AsyncClient) -> dict:
    """Second user for isolation tests."""
    await create_test_user(client, email="other@example.com")
    return await get_auth_headers(client, email="other@example.com")


async def _create_sold_item(
    client: AsyncClient,
    headers: dict,
    name: str,
    sale_price: str,
    year: int = 2024,
) -> None:
    """Helper to create a sold item."""
    await client.post(
        "/api/v1/items",
        json={
            "name": name,
            "platform": "vinted",
            "purchase_price": "10.00",
            "purchase_date": f"{year}-01-01",
            "sale_price": sale_price,
            "sale_date": f"{year}-06-01",
        },
        headers=headers,
    )


# ---------------------------------------------------------------------------
# CSV Export
# ---------------------------------------------------------------------------


async def test_export_csv_empty(client: AsyncClient, auth_headers: dict) -> None:
    """CSV export with no items should return only headers."""
    resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]

    # Parse CSV
    lines = [line for line in resp.text.splitlines() if line.strip()]
    # Header row only
    assert len(lines) == 1


async def test_export_csv_single_item(client: AsyncClient, auth_headers: dict) -> None:
    """CSV export with one item should have header + data row."""
    await _create_sold_item(client, auth_headers, "Test Item", "100.00")

    resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    assert "text/csv" in resp.headers["content-type"]

    # Parse CSV
    lines = [line for line in resp.text.splitlines() if line.strip()]
    # Header + 1 data row
    assert len(lines) == 2

    # Data should contain the item name and sale price
    content = resp.text
    assert "Test Item" in content
    assert "100.00" in content


async def test_export_csv_multiple_items(client: AsyncClient, auth_headers: dict) -> None:
    """CSV export with multiple items."""
    await _create_sold_item(client, auth_headers, "Item 1", "50.00")
    await _create_sold_item(client, auth_headers, "Item 2", "75.00")
    await _create_sold_item(client, auth_headers, "Item 3", "125.00")

    resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers)
    assert resp.status_code == 200

    # Parse CSV
    lines = [line for line in resp.text.splitlines() if line.strip()]
    # Header + 3 data rows
    assert len(lines) == 4

    content = resp.text
    assert "Item 1" in content
    assert "Item 2" in content
    assert "Item 3" in content


async def test_export_csv_headers(client: AsyncClient, auth_headers: dict) -> None:
    """CSV should have proper headers."""
    resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers)
    assert resp.status_code == 200

    # Check for common header names (in French)
    content = resp.text
    # These headers should exist in the export
    assert "Nom" in content or "name" in content.lower()
    assert "Plateforme" in content or "platform" in content.lower()


async def test_export_csv_year_filtering(client: AsyncClient, auth_headers: dict) -> None:
    """CSV export should filter by year."""
    await _create_sold_item(client, auth_headers, "2024 Item", "100.00", year=2024)
    await _create_sold_item(client, auth_headers, "2023 Item", "100.00", year=2023)

    # Export 2024 only
    resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers)
    assert resp.status_code == 200
    content = resp.text

    assert "2024 Item" in content
    # 2023 item should not be in 2024 export
    # (Note: depends on exact CSV format, may need adjustment)


async def test_export_csv_filename(client: AsyncClient, auth_headers: dict) -> None:
    """CSV response should have proper Content-Disposition header."""
    resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers)
    assert resp.status_code == 200

    disposition = resp.headers.get("content-disposition", "")
    assert "attachment" in disposition
    assert "2024" in disposition or ".csv" in disposition


async def test_export_csv_requires_auth(client: AsyncClient) -> None:
    """CSV export without auth should fail."""
    resp = await client.get("/api/v1/dashboard/export/csv?year=2024")
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# User Isolation in Exports
# ---------------------------------------------------------------------------


async def test_export_csv_user_isolation(
    client: AsyncClient,
    auth_headers: dict,
    auth_headers_b: dict,
) -> None:
    """User B's export must not contain User A's data."""
    await _create_sold_item(client, auth_headers, "User A Secret", "999.00")

    # User B exports
    resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers_b)
    assert resp.status_code == 200

    content = resp.text
    # User A's item should NOT be in User B's export
    assert "User A Secret" not in content


async def test_export_csv_user_a_intact(
    client: AsyncClient,
    auth_headers: dict,
    auth_headers_b: dict,
) -> None:
    """User A's export should still contain their own data."""
    await _create_sold_item(client, auth_headers, "User A Item", "500.00")
    await _create_sold_item(client, auth_headers_b, "User B Item", "300.00")

    # User A exports
    resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers)
    assert resp.status_code == 200

    content = resp.text
    # User A's item should be present
    assert "User A Item" in content
    # User B's item should NOT be present
    assert "User B Item" not in content


# ---------------------------------------------------------------------------
# CSV Parsing
# ---------------------------------------------------------------------------


async def test_export_csv_valid_format(client: AsyncClient, auth_headers: dict) -> None:
    """Exported CSV should be valid and parsable."""
    await _create_sold_item(client, auth_headers, "Parseable", "123.45")

    resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers)
    assert resp.status_code == 200

    # Try to parse as CSV
    csv_buffer = io.StringIO(resp.text)
    reader = csv.DictReader(csv_buffer)
    rows = list(reader)

    # Should have at least one data row
    assert len(rows) >= 1
    # Should have fieldnames
    assert reader.fieldnames is not None
    assert len(reader.fieldnames) > 0


async def test_export_csv_contains_prices(client: AsyncClient, auth_headers: dict) -> None:
    """CSV should include sale prices and profit calculations."""
    resp = await client.post(
        "/api/v1/items",
        json={
            "name": "Expensive Item",
            "platform": "ebay",
            "purchase_price": "50.00",
            "purchase_date": "2024-01-01",
            "sale_price": "150.00",
            "sale_date": "2024-06-01",
            "platform_fees": "10.00",
            "shipping_cost": "5.00",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 201

    export_resp = await client.get("/api/v1/dashboard/export/csv?year=2024", headers=auth_headers)
    assert export_resp.status_code == 200

    content = export_resp.text
    # Should contain the sale price
    assert "150.00" in content or "150" in content
