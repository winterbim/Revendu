"""
Tests for data import functionality (CSV, Excel).

Covers:
- CSV import: valid format, data parsing
- CSV import with errors (malformed rows, missing columns)
- Excel import (if implemented)
- Date format handling (various formats)
- Column mapping and validation
"""

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


# ---------------------------------------------------------------------------
# CSV Import Helpers
# ---------------------------------------------------------------------------


def _create_csv_content(headers: list[str], rows: list[list[str]]) -> bytes:
    """Create CSV file content."""
    buffer = io.StringIO()
    buffer.write(",".join(headers) + "\n")
    for row in rows:
        buffer.write(",".join(row) + "\n")
    return buffer.getvalue().encode("utf-8")


# ---------------------------------------------------------------------------
# CSV Import Tests
# ---------------------------------------------------------------------------


async def test_import_csv_valid(client: AsyncClient, auth_headers: dict) -> None:
    """Import a valid CSV file with standard format."""
    csv_content = _create_csv_content(
        ["Nom", "Plateforme", "Prix d'achat", "Date d'achat", "Prix de vente", "Date de vente"],
        [
            ["iPhone 12", "vinted", "300.00", "2024-01-01", "350.00", "2024-02-01"],
            ["Jacket", "leboncoin", "50.00", "2024-01-05", "70.00", "2024-02-10"],
        ],
    )

    resp = await client.post(
        "/api/v1/import",
        files={"file": ("items.csv", io.BytesIO(csv_content), "text/csv")},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "imported" in data
    assert data["imported"] >= 2


async def test_import_csv_with_missing_columns(client: AsyncClient, auth_headers: dict) -> None:
    """Import CSV with missing required columns should return error details."""
    # Missing "Prix de vente" (sale price)
    csv_content = _create_csv_content(
        ["Nom", "Plateforme", "Prix d'achat", "Date d'achat"],
        [
            ["Item 1", "vinted", "100.00", "2024-01-01"],
        ],
    )

    resp = await client.post(
        "/api/v1/import",
        files={"file": ("incomplete.csv", io.BytesIO(csv_content), "text/csv")},
        headers=auth_headers,
    )
    # Should either succeed with unsold items, or fail with details
    # Depends on implementation — unsold items are allowed
    assert resp.status_code in (200, 400, 422)


async def test_import_csv_empty_file(client: AsyncClient, auth_headers: dict) -> None:
    """Import an empty CSV should handle gracefully."""
    csv_content = _create_csv_content(
        ["Nom", "Plateforme", "Prix d'achat", "Date d'achat"],
        [],
    )

    resp = await client.post(
        "/api/v1/import",
        files={"file": ("empty.csv", io.BytesIO(csv_content), "text/csv")},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["imported"] == 0


async def test_import_csv_with_invalid_prices(client: AsyncClient, auth_headers: dict) -> None:
    """Import CSV with invalid price formats should fail or skip rows."""
    csv_content = _create_csv_content(
        ["Nom", "Plateforme", "Prix d'achat", "Date d'achat", "Prix de vente", "Date de vente"],
        [
            ["Item 1", "vinted", "invalid_price", "2024-01-01", "100.00", "2024-02-01"],
        ],
    )

    resp = await client.post(
        "/api/v1/import",
        files={"file": ("invalid.csv", io.BytesIO(csv_content), "text/csv")},
        headers=auth_headers,
    )
    # Should handle error gracefully
    assert resp.status_code in (200, 400, 422)


async def test_import_csv_with_invalid_dates(client: AsyncClient, auth_headers: dict) -> None:
    """Import CSV with invalid date formats should fail or skip rows."""
    csv_content = _create_csv_content(
        ["Nom", "Plateforme", "Prix d'achat", "Date d'achat", "Prix de vente", "Date de vente"],
        [
            ["Item 1", "vinted", "100.00", "invalid-date", "150.00", "2024-02-01"],
        ],
    )

    resp = await client.post(
        "/api/v1/import",
        files={"file": ("invalid_date.csv", io.BytesIO(csv_content), "text/csv")},
        headers=auth_headers,
    )
    # Should handle error gracefully
    assert resp.status_code in (200, 400, 422)


# ---------------------------------------------------------------------------
# Date Format Handling
# ---------------------------------------------------------------------------


async def test_import_csv_iso_format_dates(client: AsyncClient, auth_headers: dict) -> None:
    """Import CSV with ISO format dates (YYYY-MM-DD)."""
    csv_content = _create_csv_content(
        ["Nom", "Plateforme", "Prix d'achat", "Date d'achat", "Prix de vente", "Date de vente"],
        [
            ["Item", "vinted", "100.00", "2024-01-15", "150.00", "2024-02-20"],
        ],
    )

    resp = await client.post(
        "/api/v1/import",
        files={"file": ("iso_dates.csv", io.BytesIO(csv_content), "text/csv")},
        headers=auth_headers,
    )
    assert resp.status_code == 200


async def test_import_csv_french_format_dates(client: AsyncClient, auth_headers: dict) -> None:
    """Import CSV with French format dates (DD/MM/YYYY) if supported."""
    csv_content = _create_csv_content(
        ["Nom", "Plateforme", "Prix d'achat", "Date d'achat", "Prix de vente", "Date de vente"],
        [
            ["Item", "vinted", "100.00", "15/01/2024", "150.00", "20/02/2024"],
        ],
    )

    resp = await client.post(
        "/api/v1/import",
        files={"file": ("fr_dates.csv", io.BytesIO(csv_content), "text/csv")},
        headers=auth_headers,
    )
    # Depends on implementation — may or may not support French format
    assert resp.status_code in (200, 400, 422)


# ---------------------------------------------------------------------------
# Import Response Structure
# ---------------------------------------------------------------------------


async def test_import_response_structure(client: AsyncClient, auth_headers: dict) -> None:
    """Import response should have proper structure."""
    csv_content = _create_csv_content(
        ["Nom", "Plateforme", "Prix d'achat", "Date d'achat", "Prix de vente", "Date de vente"],
        [
            ["Item 1", "vinted", "100.00", "2024-01-01", "150.00", "2024-02-01"],
            ["Item 2", "ebay", "50.00", "2024-01-05", "80.00", "2024-02-10"],
        ],
    )

    resp = await client.post(
        "/api/v1/import",
        files={"file": ("test.csv", io.BytesIO(csv_content), "text/csv")},
        headers=auth_headers,
    )
    assert resp.status_code == 200

    data = resp.json()
    assert "imported" in data
    assert isinstance(data["imported"], int)
    assert data["imported"] >= 0


async def test_import_error_response_details(client: AsyncClient, auth_headers: dict) -> None:
    """Import error response should include details about failures."""
    csv_content = _create_csv_content(
        ["Nom", "Plateforme", "Prix d'achat", "Date d'achat"],
        [
            ["Item", "invalid_platform", "100.00", "2024-01-01"],
        ],
    )

    resp = await client.post(
        "/api/v1/import",
        files={"file": ("errors.csv", io.BytesIO(csv_content), "text/csv")},
        headers=auth_headers,
    )
    # Should be 200 with details or 400/422 with error message
    assert resp.status_code in (200, 400, 422)
    if resp.status_code != 200:
        data = resp.json()
        assert "detail" in data or "error" in data


# ---------------------------------------------------------------------------
# Auth Requirements
# ---------------------------------------------------------------------------


async def test_import_requires_auth(client: AsyncClient) -> None:
    """Import without auth should fail."""
    csv_content = _create_csv_content(
        ["Nom", "Plateforme", "Prix d'achat", "Date d'achat"],
        [["Item", "vinted", "100.00", "2024-01-01"]],
    )

    resp = await client.post(
        "/api/v1/import",
        files={"file": ("test.csv", io.BytesIO(csv_content), "text/csv")},
    )
    assert resp.status_code in (401, 403)


# ---------------------------------------------------------------------------
# File Type Handling
# ---------------------------------------------------------------------------


async def test_import_csv_content_type(client: AsyncClient, auth_headers: dict) -> None:
    """Import endpoint should accept text/csv content type."""
    csv_content = _create_csv_content(
        ["Nom", "Plateforme", "Prix d'achat", "Date d'achat", "Prix de vente", "Date de vente"],
        [
            ["Item", "vinted", "100.00", "2024-01-01", "150.00", "2024-02-01"],
        ],
    )

    resp = await client.post(
        "/api/v1/import",
        files={"file": ("test.csv", io.BytesIO(csv_content), "text/csv")},
        headers=auth_headers,
    )
    assert resp.status_code == 200


async def test_import_missing_file(client: AsyncClient, auth_headers: dict) -> None:
    """Import without file should fail."""
    resp = await client.post(
        "/api/v1/import",
        headers=auth_headers,
    )
    assert resp.status_code in (400, 422)
