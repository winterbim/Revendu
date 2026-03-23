from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.dashboard import StatsResponse, ThresholdAlert
from app.schemas.item import ItemOut
from app.services.item_service import (
    compute_stats,
    export_items_csv,
    get_alerts,
    get_recent_sold_items,
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

# ---------------------------------------------------------------------------
# Annotated dependency aliases (S8410)
# ---------------------------------------------------------------------------

DbDep = Annotated[AsyncSession, Depends(get_db)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]
YearQuery = Annotated[int | None, Query(ge=2000, le=2100)]


def _current_year() -> int:
    return datetime.now(timezone.utc).year


# ---------------------------------------------------------------------------
# GET /dashboard/stats
# ---------------------------------------------------------------------------


@router.get("/stats", summary="Statistiques et seuils DAC7 pour l'année fiscale")
async def stats(
    db: DbDep,
    current_user: CurrentUserDep,
    year: YearQuery = None,
) -> StatsResponse:
    effective_year = year if year is not None else _current_year()
    return await compute_stats(db, current_user.id, effective_year, current_user)


# ---------------------------------------------------------------------------
# GET /dashboard/alerts
# ---------------------------------------------------------------------------


@router.get("/alerts", summary="Alertes de seuils DAC7 actives")
async def alerts(
    db: DbDep,
    current_user: CurrentUserDep,
    year: YearQuery = None,
) -> list[ThresholdAlert]:
    effective_year = year if year is not None else _current_year()
    return await get_alerts(db, current_user.id, effective_year)


# ---------------------------------------------------------------------------
# GET /dashboard/export/csv
# ---------------------------------------------------------------------------


@router.get("/recent-sales", summary="5 dernières ventes de l'année")
async def recent_sales(
    db: DbDep,
    current_user: CurrentUserDep,
    year: YearQuery = None,
) -> list[ItemOut]:
    effective_year = year if year is not None else _current_year()
    items = await get_recent_sold_items(db, current_user.id, year=effective_year)
    return [ItemOut.model_validate(item) for item in items]


@router.get("/export/csv", summary="Exporter les ventes en CSV", response_class=StreamingResponse)
async def export_csv(
    db: DbDep,
    current_user: CurrentUserDep,
    year: YearQuery = None,
) -> StreamingResponse:
    effective_year = year if year is not None else _current_year()
    csv_buffer = await export_items_csv(db, current_user.id, effective_year)

    filename = f"revendu_ventes_{effective_year}.csv"

    def iter_content():
        yield csv_buffer.read()

    return StreamingResponse(
        iter_content(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
