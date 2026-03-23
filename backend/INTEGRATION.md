# Revendu Backend — Integration Guide

This guide explains how to integrate the new exception handling and logging systems into the existing codebase.

## Exception Handling Integration

### 1. Update main.py

Add exception handlers for custom exceptions:

```python
from fastapi import FastAPI
from app.core.exceptions import RevenduException

app = FastAPI(...)

@app.exception_handler(RevenduException)
async def revendu_exception_handler(request: Request, exc: RevenduException):
    """Handle all custom Revendu exceptions uniformly."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
```

### 2. Update routers to use exceptions

Instead of `HTTPException`, raise custom exceptions:

**Before:**
```python
from fastapi import HTTPException, status

@router.get("/items/{item_id}")
async def get_item(item_id: uuid.UUID, db: DbDep, user: CurrentUserDep):
    item = await get_item(db, item_id, user.id)
    if item is None:
        raise HTTPException(status_code=404, detail="Item not found")
    return item
```

**After:**
```python
from app.core.exceptions import NotFoundError

@router.get("/items/{item_id}")
async def get_item(item_id: uuid.UUID, db: DbDep, user: CurrentUserDep):
    item = await get_item(db, item_id, user.id)
    if item is None:
        raise NotFoundError("Item introuvable.")
    return item
```

### 3. Replace HTTPException usage

Global replacements:
| HTTPException | Custom Exception |
|---|---|
| `status_code=404` | `NotFoundError(...)` |
| `status_code=403` | `ForbiddenError(...)` |
| `status_code=401` | `UnauthorizedError(...)` |
| `status_code=409` | `ConflictError(...)` |
| `status_code=422` | `ValidationError(...)` |
| `status_code=402` | `PlanLimitError(...)` |
| `status_code=400` | `BusinessLogicError(...)` |

## Logging Integration

### 1. Initialize logging in main.py

```python
from app.core.logging_config import setup_logging, generate_request_id

# At app startup
setup_logging()

# Optional: add request ID middleware
from fastapi import Request
from app.core.logging_config import ContextFilter

@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = generate_request_id()
    ContextFilter.set_context(request_id=request_id)

    response = await call_next(request)

    ContextFilter.clear_context()
    return response
```

### 2. Use logger in services/routers

```python
from app.core.logging_config import get_logger

logger = get_logger(__name__)

async def create_user(db: AsyncSession, payload: RegisterRequest) -> User:
    logger.debug(f"Creating user with email: {payload.email}")

    try:
        user = User(email=payload.email, ...)
        db.add(user)
        await db.commit()
        logger.info(f"User created: {user.id}", extra={"user_id": str(user.id)})
        return user
    except IntegrityError:
        logger.warning(f"Duplicate email: {payload.email}")
        raise ConflictError("Un compte existe déjà avec cette adresse e-mail.")
```

### 3. Add context to logs

```python
from app.core.logging_config import ContextFilter

# In auth router
ContextFilter.set_context(user_id=str(current_user.id), action="export_csv")
logger.info("CSV export started")
# ...
ContextFilter.clear_context()
```

## Configuration Validation

The updated `config.py` now validates secrets in production. Test it:

```bash
# Should pass (test env, no validation)
ENVIRONMENT=test pytest tests/

# Should fail (production without proper JWT_SECRET)
ENVIRONMENT=production \
JWT_SECRET=change-me \
python backend/app/config.py
# → ValueError: JWT_SECRET must be a 256-bit random secret in production
```

## Environment Setup

### 1. Copy .env.example to .env

```bash
cp backend/.env.example backend/.env
```

### 2. Development setup (already in .env.example)

```env
ENVIRONMENT=development
JWT_SECRET=change-me-in-production-use-256-bit-random-secret
DATABASE_URL=postgresql+asyncpg://revendu:revendu@localhost:5435/revendu
```

### 3. Production setup

Generate secure secrets:
```bash
# JWT_SECRET: generate 256-bit random secret
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
# → FgH5Jk_9LmN2OpQrSt-UvW3XyZ1a2b3c4d5e6f7g8h

# Stripe webhook secret: get from https://dashboard.stripe.com/webhooks
# → whsec_live_abcdef123456...
```

Update production `.env`:
```env
ENVIRONMENT=production
JWT_SECRET=FgH5Jk_9LmN2OpQrSt-UvW3XyZ1a2b3c4d5e6f7g8h
DATABASE_URL=postgresql+asyncpg://user:pass@prod-db.railway.app:5432/revendu
STRIPE_WEBHOOK_SECRET=whsec_live_abcdef123456...
CORS_ORIGINS=https://app.revendu.fr
FRONTEND_URL=https://app.revendu.fr
```

## Migration Path

### Phase 1: Exception Handling (Done)
✅ Created `app/core/exceptions.py` with all exception classes

### Phase 2: Integration (Next)
- [ ] Update `app/main.py` with exception handler
- [ ] Replace `HTTPException` in routers with custom exceptions
- [ ] Add exception handler tests

### Phase 3: Logging (Next)
- [ ] Initialize `setup_logging()` in `app/main.py`
- [ ] Add request ID middleware
- [ ] Update services to use `get_logger()`
- [ ] Add logging tests

### Phase 4: Configuration (Next)
- [ ] Test production validation
- [ ] Update deployment docs
- [ ] Add secret rotation docs

### Phase 5: Testing (Done)
✅ Comprehensive tests for auth, dashboard, export, import, isolation

## Testing the Integration

Run the comprehensive test suite:

```bash
# All tests (should all pass)
make test

# Auth tests (token handling)
cd backend && pytest tests/test_auth.py -v

# Dashboard tests (alert levels, profit calc)
cd backend && pytest tests/test_dashboard.py -v

# Export/Import tests
cd backend && pytest tests/test_export.py tests/test_import.py -v

# Critical: User isolation (security)
cd backend && pytest tests/test_isolation.py -v

# Coverage report
make test-cov
```

## Monitoring in Production

With JSON logging enabled, use these queries:

### Elasticsearch
```json
{
  "query": {
    "bool": {
      "must": [
        { "match": { "action": "export_csv" } },
        { "match": { "level": "ERROR" } }
      ]
    }
  }
}
```

### CloudWatch / Datadog
```
level:ERROR action:export_csv
```

### Manual log parsing
```bash
# Count errors by action
grep ERROR /var/log/revendu/app.log | jq -r '.action' | sort | uniq -c

# Find all requests for user X
grep user_id revendu.log | jq 'select(.user_id == "abc-123")'
```

## Troubleshooting

### Tests fail with "Refresh token manquant"
- ✅ Expected: httpOnly cookie not sent in test environment
- Solution: Tests use `client.cookies.set()` to set refresh token manually

### Exception handler not catching exceptions
- Check: Exception handler is registered in `app.add_exception_handler()`
- Check: Exception is a subclass of `RevenduException`
- Check: Custom exceptions are raised, not `HTTPException`

### Logging not showing up
- Check: `setup_logging()` called at app startup
- Check: Logger name matches module (`get_logger(__name__)`)
- Check: `ENVIRONMENT` env var is set correctly
- Debug: `python -c "from app.core.logging_config import setup_logging; setup_logging(); import logging; logging.getLogger().debug('test')"`

## File Checklist

✅ Created:
- `backend/app/core/exceptions.py` — custom exceptions
- `backend/app/core/logging_config.py` — logging setup
- `backend/.env.example` — env template with docs
- `backend/tests/test_auth.py` — 20+ auth tests
- `backend/tests/test_dashboard.py` — 20+ dashboard tests
- `backend/tests/test_export.py` — 15+ export tests
- `backend/tests/test_import.py` — 15+ import tests
- `backend/tests/test_isolation.py` — 15+ isolation tests
- `backend/TESTING.md` — testing guide
- `backend/INTEGRATION.md` — this file

⚠️ Updated:
- `backend/app/config.py` — added validators, ENVIRONMENT field
- `Makefile` — added test-cov, check, better messaging

## Next Maintainer Notes

**For the next developer:**

1. **Exception handlers**: Before deploying, integrate exceptions into main.py and routers (Phase 2)
2. **Logging**: Add request ID middleware and use logger in services (Phase 3)
3. **Secrets**: Never commit `.env` files; use environment variables in production
4. **Tests**: Always run `make check` before pushing code
5. **Coverage**: Target >80% coverage for critical paths (auth, isolation, DAC7)

**Architecture decisions:**
- Tests use SQLite in-memory (no external DB)
- Logging supports both pretty-print (dev) and JSON (prod)
- Config is validated at startup (fail-fast in production)
- User isolation is critical (tested extensively)
- DAC7 thresholds are tested at every level (unit, integration)
