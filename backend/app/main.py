import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from sqlalchemy import text

from app.config import get_settings
from app.core.exceptions import RevenduException
from app.core.logging_config import ContextFilter, generate_request_id, setup_logging
from app.routers import auth, dashboard, items
from app.routers.export import router as export_router
from app.routers.import_router import router as import_router
from app.routers.payments import router as payments_router
from app.routers.sync import router as sync_router

settings = get_settings()

# ---------------------------------------------------------------------------
# Logging setup
# ---------------------------------------------------------------------------
setup_logging()
logger = logging.getLogger("revendu")


# ---------------------------------------------------------------------------
# Rate limiter (global instance, shared with routers)
# ---------------------------------------------------------------------------

limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Revendu API starting (env=%s)", settings.environment)
    yield
    # Shutdown: dispose the engine connection pool
    from app.database import engine

    await engine.dispose()


# ---------------------------------------------------------------------------
# FastAPI application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="Revendu API",
    description=(
        "Suivi de bénéfices et des seuils fiscaux DAC7 "
        "pour les revendeurs français (Vinted, Leboncoin, eBay, Vestiaire Collective)."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
if not settings.is_test:
    app.add_middleware(SlowAPIMiddleware)

# CORS — allow the Next.js frontend in development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Global exception handler — never leak stack traces in production
# ---------------------------------------------------------------------------


# ---------------------------------------------------------------------------
# Request ID middleware
# ---------------------------------------------------------------------------

@app.middleware("http")
async def request_id_middleware(request: Request, call_next):
    request_id = generate_request_id()
    request.state.request_id = request_id
    ContextFilter.set_context(request_id=request_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    ContextFilter.clear_context()
    return response


# ---------------------------------------------------------------------------
# Exception handlers
# ---------------------------------------------------------------------------

@app.exception_handler(RevenduException)
async def revendu_exception_handler(request: Request, exc: RevenduException) -> JSONResponse:
    logger.warning("Business error: %s (status=%d)", exc.detail, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception: %s", str(exc), exc_info=True)
    if settings.is_production:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "Une erreur interne est survenue."},
        )
    # In development, re-raise so FastAPI shows the full traceback
    raise exc


# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------

API_PREFIX = "/api/v1"

app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(items.router, prefix=API_PREFIX)
app.include_router(dashboard.router, prefix=API_PREFIX)
app.include_router(export_router, prefix=API_PREFIX)
app.include_router(import_router, prefix=API_PREFIX)
app.include_router(payments_router, prefix=API_PREFIX)
app.include_router(sync_router, prefix=API_PREFIX)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health", tags=["system"], summary="Health check")
async def health() -> dict:
    from app.database import engine

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "error"

    http_status = status.HTTP_200_OK if db_status == "ok" else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(
        status_code=http_status,
        content={"status": "ok" if db_status == "ok" else "degraded", "db": db_status, "version": "0.1.0"},
    )
