"""
Plan gating — FastAPI dependency to enforce plan-based access control.
Defines free plan limits and enforces pro-only features.
"""

from typing import Literal

from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.services.item_service import count_items


# Plan limits (free tier)
PLAN_LIMITS = {
    "free": {
        "max_items": 50,
        "export_pdf": False,
        "gmail_sync": False,
        "platform_breakdown": False,
    },
    "pro": {
        "max_items": None,  # Unlimited
        "export_pdf": True,
        "gmail_sync": True,
        "platform_breakdown": True,
    },
}


def require_plan(required_plan: Literal["free", "pro"] = "pro"):
    """
    FastAPI dependency factory to enforce plan requirements.

    Usage:
        @router.post("/feature")
        async def feature(
            current_user: CurrentUserDep = Depends(require_plan("pro")),
        ):
            ...

    Raises:
        403 Forbidden if user.plan != required_plan
    """
    async def _check_plan(
        current_user: User = Depends(get_current_user),
    ) -> User:
        if current_user.plan != required_plan:
            if required_plan == "pro":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Cette fonctionnalité est réservée aux utilisateurs Revendu Pro. Passez à la version Pro pour y accéder.",
                )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Accès refusé.",
            )
        return current_user

    return _check_plan


async def check_item_limit(
    db: AsyncSession,
    user: User,
) -> None:
    """
    Verify that user hasn't exceeded their plan's item limit.

    Raises:
        402 Payment Required if limit exceeded
    """
    limit = PLAN_LIMITS[user.plan]["max_items"]
    if limit is None:
        return  # Unlimited for pro

    count = await count_items(db, user.id)
    if count >= limit:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail=f"Limite atteinte ({limit} articles maximum en plan gratuit). Passez à Revendu Pro pour ajouter plus d'articles.",
        )
