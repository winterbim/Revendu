# Revendu Backend — Testing Guide

This document describes the testing strategy and how to run tests.

## Quick Start

```bash
# Run all tests
make test

# Run with coverage report
make test-cov

# Run specific test file
cd backend && pytest tests/test_auth.py -v

# Run tests matching a pattern
cd backend && pytest tests/ -k "test_alert_level" -v

# Run CI pipeline locally (lint + test)
make check
```

## Test Organization

Tests are organized by feature/domain:

### test_auth.py
Authentication and JWT flow testing.
- Registration (success, validation, duplicates)
- Login (success, wrong credentials, rate limiting)
- Logout (cookie clearing)
- Token refresh (rotation, expiration)
- Current user endpoint
- Token structure validation

**Key patterns:**
- Use `create_test_user()` to register a user
- Use `get_auth_headers()` to login and get Bearer token
- Check status codes: 201 (create), 200 (ok), 401 (unauth), 409 (conflict)

### test_dashboard.py
Dashboard statistics and DAC7 threshold logic.
- Empty dashboard (0 items)
- Stats aggregation (multiple items)
- Profit calculation (sale price - costs)
- DAC7 alert levels: safe (<70%), warning (70-85%), danger (85-100%), exceeded (>100%)
- Threshold calculations (receipts €2000, transactions 30)
- Year filtering
- Platform breakdown
- Alerts endpoint

**Key patterns:**
- Use `_create_sold_item()` helper to quickly create test items
- Test both thresholds: `threshold_receipts` and `threshold_transactions`
- Alert levels depend on BOTH thresholds (max of the two)

### test_export.py
CSV/Excel/PDF export functionality.
- CSV export with 0, 1, multiple items
- CSV headers and format validation
- CSV parsing with `csv.DictReader`
- Year filtering in exports
- Content-Disposition headers
- **User isolation**: User A's export must NOT include User B's items

**Key patterns:**
- Check `Content-Type: text/csv` header
- Check `Content-Disposition: attachment` header
- Parse response as CSV using `csv.reader()` or `csv.DictReader()`
- Verify row count (header + data rows)

### test_import.py
CSV/Excel import functionality.
- Valid CSV import
- Missing columns handling
- Invalid prices/dates
- Date format support (ISO, French)
- Empty files
- Response structure

**Key patterns:**
- Use `_create_csv_content()` to generate test CSV
- Upload via `multipart/form-data` (file upload)
- Check response: `{"imported": N}`
- Validate error messages

### test_isolation.py (Row-Level Security)
**CRITICAL SECURITY TESTS** — ensures data leakage is impossible.

Tests that User A CANNOT:
- See User B's items (GET /items)
- Access User B's item by ID (GET /items/{id})
- Update User B's item (PUT /items/{id})
- Delete User B's item (DELETE /items/{id})
- Mark User B's item as sold
- See User B's items in dashboard stats
- Access User B's items in CSV export
- See User B's alerts

**Key patterns:**
- Create separate users: `user_a_headers`, `user_b_headers`, etc.
- Expect 404 (item not found) when User B tries to access User A's item
- Verify stats are independent (User A's dashboard ≠ User B's)
- Verify exports don't leak (User B's CSV ≠ User A's items)

## Test Database

Tests use **SQLite in-memory** (`sqlite+aiosqlite:///:memory:`), not PostgreSQL.

Benefits:
- Fast: no external DB needed
- Isolated: each test gets a fresh database
- No cleanup required
- Works offline

See `conftest.py` for setup:
- `db_engine`: creates schema for each test
- `db_session`: transaction-scoped session
- `client`: FastAPI test client with DB override

## Async Testing

All tests are async (`pytest-asyncio`). Use:
```python
@pytest.mark.asyncio
async def test_something(client: AsyncClient) -> None:
    resp = await client.get("/api/v1/...")
    assert resp.status_code == 200
```

Key fixtures:
- `client: AsyncClient` — HTTP client with dependency overrides
- `auth_headers: dict` — Bearer token for authenticated requests
- `auth_headers_b: dict` — Second user for isolation tests

## Fixtures

### Provided by conftest.py
```python
async def create_test_user(client, email="test@example.com") -> dict
    """Register a user, return response body."""

async def get_auth_headers(client, email="test@example.com") -> dict
    """Login, return {"Authorization": "Bearer ..."}"""
```

### Common patterns
```python
@pytest_asyncio.fixture
async def auth_headers(client: AsyncClient) -> dict:
    """Setup: create user and get token."""
    await create_test_user(client)
    return await get_auth_headers(client)

@pytest_asyncio.fixture
async def auth_headers_b(client: AsyncClient) -> dict:
    """Setup: create second user."""
    await create_test_user(client, email="other@example.com")
    return await get_auth_headers(client, email="other@example.com")
```

## Status Codes to Expect

| Code | Meaning | When |
|------|---------|------|
| 200 | OK | GET, DELETE (no content) |
| 201 | Created | POST (new resource) |
| 204 | No Content | DELETE, POST /logout |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource doesn't exist or user doesn't own it |
| 409 | Conflict | Duplicate (e.g., email exists) |
| 422 | Unprocessable | Validation error (Pydantic) |
| 429 | Rate Limited | Too many requests |
| 500 | Server Error | Unhandled exception |

## DAC7 Thresholds (IMPORTANT)

From `CLAUDE.md`:
- **30 transactions/year** OR **€2000 gross receipts** → platform auto-reports to DGFIP
- `gross_receipt` = sale price (what DAC7 measures)
- `net_profit` = sale price - purchase price - platform fees - shipping

Alert levels:
- **safe**: both thresholds < 70%
- **warning**: either threshold 70-85%
- **danger**: either threshold 85-100%
- **exceeded**: either threshold ≥ 100%

Example:
```python
# 70% of €2000 = €1400
await _create_sold_item(client, headers, "1400.00")
resp = await client.get("/api/v1/dashboard/stats?year=2024", headers=headers)
assert resp.json()["alert_level"] == "warning"
```

## Common Assertions

### Auth checks
```python
assert resp.status_code in (401, 403)  # No token
assert resp.status_code == 200         # Valid token
```

### Decimal comparison (prices)
```python
from decimal import Decimal
assert Decimal(resp.json()["net_profit"]) == Decimal("85.00")
```

### CSV parsing
```python
import csv
import io
csv_buffer = io.StringIO(resp.text)
reader = csv.DictReader(csv_buffer)
rows = list(reader)
assert len(rows) == 1
```

### Item isolation
```python
resp = await client.get(f"/api/v1/items/{item_id}", headers=user_b_headers)
assert resp.status_code == 404  # User B cannot see User A's item
```

## Running Tests in CI/CD

Use `make check` for CI pipelines:
```bash
make check  # Runs: lint + test
```

Or for coverage:
```bash
make test-cov  # Generates htmlcov/index.html
```

## Debugging Tests

### Verbose output
```bash
cd backend && pytest tests/ -v -s
```

### Run one test
```bash
cd backend && pytest tests/test_auth.py::test_login_success -v
```

### Print debug info
```python
print(resp.text)  # Full response body
print(resp.json())  # Parsed JSON
print(resp.headers)  # Headers
```

### Check database state
```python
# In a test, inspect the session directly
async def test_example(db_session):
    result = await db_session.execute(select(Item))
    items = result.scalars().all()
    assert len(items) == 1
```

## Next Steps

1. **Add exception handlers** — integrate `app/core/exceptions.py` into routers
2. **Add logging** — integrate `app/core/logging_config.py` into middleware
3. **Expand import/export** — implement Excel and PDF export
4. **Add performance tests** — test with 10k+ items
5. **Add E2E tests** — test full frontend + backend flow
