"""
Export router — Excel, PDF reports and import templates.
All endpoints are scoped to the authenticated user.
PDF and Excel exports require pro plan.
"""

import asyncio
import csv
import io
from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.plan_guard import require_plan
from app.database import get_db
from app.models.user import User
from app.services.export_service import (
    _build_excel_report,
    _build_excel_template,
    _build_pdf_report,
)
from app.services.item_service import get_sold_items_for_year, list_items

router = APIRouter(prefix="/export", tags=["export"])

DbDep = Annotated[AsyncSession, Depends(get_db)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]


def _current_year() -> int:
    return datetime.now(timezone.utc).year


# ---------------------------------------------------------------------------
# GET /export/excel
# ---------------------------------------------------------------------------


@router.get("/excel", summary="Exporter les ventes en Excel (.xlsx)")
async def export_excel(
    db: DbDep,
    current_user: Annotated[User, Depends(require_plan("pro"))],
    year: Annotated[int, Query(ge=2000, le=2100)] = None,  # type: ignore[assignment]
) -> StreamingResponse:
    if year is None:
        year = _current_year()

    # Fetch all items (sold + unsold) for the sheet; sold-only for stats
    items = await list_items(db, current_user.id, year=year)

    xlsx_bytes = await asyncio.to_thread(_build_excel_report, current_user, items, year)

    filename = f"revendu_fiscal_{year}_{current_user.id}.xlsx"
    return StreamingResponse(
        io.BytesIO(xlsx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------------------------------------------------------------------------
# GET /export/pdf
# ---------------------------------------------------------------------------


@router.get("/pdf", summary="Exporter le rapport fiscal en PDF")
async def export_pdf(
    db: DbDep,
    current_user: Annotated[User, Depends(require_plan("pro"))],
    year: Annotated[int, Query(ge=2000, le=2100)] = None,  # type: ignore[assignment]
) -> StreamingResponse:
    if year is None:
        year = _current_year()

    items = await list_items(db, current_user.id, year=year)

    pdf_bytes = await asyncio.to_thread(_build_pdf_report, current_user, items, year)

    filename = f"revendu_rapport_{year}_{current_user.id}.pdf"
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


# ---------------------------------------------------------------------------
# GET /export/template/excel
# ---------------------------------------------------------------------------


@router.get("/template/excel", summary="Télécharger le template Excel d'import")
async def export_template_excel(
    current_user: CurrentUserDep,
) -> StreamingResponse:
    xlsx_bytes = await asyncio.to_thread(_build_excel_template)

    return StreamingResponse(
        io.BytesIO(xlsx_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="revendu_template_import.xlsx"'},
    )


# ---------------------------------------------------------------------------
# GET /export/template/csv
# ---------------------------------------------------------------------------


@router.get("/template/csv", summary="Télécharger le template CSV d'import")
async def export_template_csv(
    current_user: CurrentUserDep,
) -> StreamingResponse:
    output = io.StringIO()
    writer = csv.writer(output, delimiter=",", quoting=csv.QUOTE_MINIMAL)

    headers = [
        "nom",
        "plateforme",
        "prix_achat",
        "date_achat",
        "prix_vente",
        "date_vente",
        "frais_plateforme",
        "frais_port",
        "description",
    ]
    writer.writerow(headers)

    # Example row 1
    writer.writerow([
        "Nike Air Max 90",
        "vinted",
        "45.00",
        "2024-01-15",
        "72.00",
        "2024-02-01",
        "3.50",
        "0.00",
        "Taille 42 très bon état",
    ])

    # Example row 2 (unsold)
    writer.writerow([
        "Veste en cuir vintage",
        "leboncoin",
        "30.00",
        "2024-03-10",
        "",
        "",
        "",
        "",
        "Taille M",
    ])

    output.seek(0)
    csv_bytes = output.read().encode("utf-8-sig")  # BOM for Excel compatibility

    return StreamingResponse(
        io.BytesIO(csv_bytes),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": 'attachment; filename="revendu_template_import.csv"'},
    )
