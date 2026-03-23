import uuid
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.core.plan_guard import check_item_limit
from app.database import get_db
from app.models.item import PLATFORM_VALUES, STATUS_VALUES, Item
from app.models.user import User
from app.schemas.item import ItemCreate, ItemOut, ItemUpdate, MarkSoldRequest
from app.services.item_service import (
    create_item,
    delete_item,
    get_item,
    list_items,
    mark_item_sold,
    update_item,
)

router = APIRouter(prefix="/items", tags=["items"])

# ---------------------------------------------------------------------------
# Annotated dependency aliases (S8410 — prefer Annotated for DI)
# ---------------------------------------------------------------------------

DbDep = Annotated[AsyncSession, Depends(get_db)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]


def _item_out(item: Item) -> ItemOut:
    """Convert ORM Item to ItemOut, including computed properties."""
    return ItemOut(
        id=item.id,
        user_id=item.user_id,
        name=item.name,
        description=item.description,
        platform=item.platform,  # type: ignore[arg-type]
        status=item.status,  # type: ignore[arg-type]
        purchase_price=item.purchase_price,
        purchase_date=item.purchase_date,
        sale_price=item.sale_price,
        sale_date=item.sale_date,
        platform_fees=item.platform_fees,
        shipping_cost=item.shipping_cost,
        gross_receipt=item.gross_receipt,
        net_profit=item.net_profit,
        created_at=item.created_at,
        updated_at=item.updated_at,
    )


async def _get_owned_item(
    item_id: uuid.UUID,
    db: AsyncSession,
    current_user: User,
) -> Item:
    """Fetch item by id scoped to the current user, or raise 404."""
    item = await get_item(db, item_id, current_user.id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article introuvable.",
        )
    return item


# ---------------------------------------------------------------------------
# GET /items
# ---------------------------------------------------------------------------


@router.get("", summary="Lister les articles")
async def get_items(
    db: DbDep,
    current_user: CurrentUserDep,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
    platform: Annotated[str | None, Query()] = None,
    year: Annotated[int | None, Query(ge=2000, le=2100)] = None,
    search: Annotated[str | None, Query(max_length=200)] = None,
    date_from: Annotated[date | None, Query(alias="date_from")] = None,
    date_to: Annotated[date | None, Query(alias="date_to")] = None,
) -> list[ItemOut]:
    if status_filter is not None and status_filter not in STATUS_VALUES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Statut invalide. Valeurs acceptées : {STATUS_VALUES}",
        )
    if platform is not None and platform not in PLATFORM_VALUES:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Plateforme invalide. Valeurs acceptées : {PLATFORM_VALUES}",
        )

    items = await list_items(
        db,
        current_user.id,
        status=status_filter,
        platform=platform,
        year=year,
        search=search,
        date_from=date_from,
        date_to=date_to,
    )
    return [_item_out(i) for i in items]


# ---------------------------------------------------------------------------
# POST /items
# ---------------------------------------------------------------------------


@router.post("", status_code=status.HTTP_201_CREATED, summary="Créer un article")
async def create_item_route(
    payload: ItemCreate,
    db: DbDep,
    current_user: CurrentUserDep,
) -> ItemOut:
    # Check item limit for free plan
    await check_item_limit(db, current_user)
    item = await create_item(db, current_user.id, payload)
    return _item_out(item)


# ---------------------------------------------------------------------------
# PUT /items/{id}
# ---------------------------------------------------------------------------


@router.put("/{item_id}", summary="Modifier un article")
async def update_item_route(
    item_id: uuid.UUID,
    payload: ItemUpdate,
    db: DbDep,
    current_user: CurrentUserDep,
) -> ItemOut:
    item = await _get_owned_item(item_id, db, current_user)
    updated = await update_item(db, item, payload)
    return _item_out(updated)


# ---------------------------------------------------------------------------
# DELETE /items/{id}
# ---------------------------------------------------------------------------


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Supprimer un article")
async def delete_item_route(
    item_id: uuid.UUID,
    db: DbDep,
    current_user: CurrentUserDep,
) -> None:
    item = await _get_owned_item(item_id, db, current_user)
    await delete_item(db, item)


# ---------------------------------------------------------------------------
# POST /items/{id}/mark-sold
# ---------------------------------------------------------------------------


@router.post("/{item_id}/mark-sold", summary="Marquer un article comme vendu")
async def mark_sold_route(
    item_id: uuid.UUID,
    payload: MarkSoldRequest,
    db: DbDep,
    current_user: CurrentUserDep,
) -> ItemOut:
    item = await _get_owned_item(item_id, db, current_user)
    if item.status == "sold":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cet article est déjà marqué comme vendu.",
        )
    sold = await mark_item_sold(db, item, payload)
    return _item_out(sold)
