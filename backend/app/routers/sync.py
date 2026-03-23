"""
Sync router — Gmail OAuth endpoints for automatic sale import.
All endpoints require pro plan.
"""

import logging
import secrets
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.deps import get_current_user
from app.core.plan_guard import require_plan
from app.database import get_db
from app.models.user import User
from app.services.email_sync_service import (
    exchange_code_for_tokens,
    get_gmail_auth_url,
    sync_gmail_sales,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/sync", tags=["sync"])

settings = get_settings()

DbDep = Annotated[AsyncSession, Depends(get_db)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]


def _require_gmail_configured() -> None:
    """Raise 503 if Google OAuth credentials are not set."""
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Gmail non configuré : GOOGLE_CLIENT_ID manquant.",
        )


# ---------------------------------------------------------------------------
# GET /sync/gmail/authorize
# ---------------------------------------------------------------------------


@router.get("/gmail/authorize", summary="URL d'autorisation Gmail OAuth")
async def gmail_authorize(
    current_user: Annotated[User, Depends(require_plan("pro"))]
) -> dict:
    """Return the Google OAuth authorisation URL so the frontend can redirect the user."""
    _require_gmail_configured()
    state = secrets.token_urlsafe(16)
    try:
        url = get_gmail_auth_url(state)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    return {"auth_url": url, "state": state}


# ---------------------------------------------------------------------------
# GET /sync/gmail/callback  (browser redirect — no JWT here)
# ---------------------------------------------------------------------------


@router.get("/gmail/callback", summary="Callback OAuth Google")
async def gmail_callback(code: str, state: str) -> RedirectResponse:
    """
    Receive the OAuth code from Google and redirect to the frontend.

    The frontend receives the code via query-string and must call
    POST /sync/gmail/connect to finalise the token exchange.
    """
    _require_gmail_configured()
    frontend_url = settings.frontend_url
    redirect_url = f"{frontend_url}/dashboard/parametres?gmail_code={code}&state={state}"
    return RedirectResponse(url=redirect_url, status_code=302)


# ---------------------------------------------------------------------------
# POST /sync/gmail/connect
# ---------------------------------------------------------------------------


@router.post("/gmail/connect", summary="Finaliser la connexion Gmail")
async def gmail_connect(
    code: str,
    db: DbDep,
    current_user: Annotated[User, Depends(require_plan("pro"))],
) -> dict:
    """
    Exchange the OAuth code for tokens and persist the refresh token.
    Call this after the frontend receives the code from the callback redirect.
    """
    _require_gmail_configured()
    try:
        tokens = await exchange_code_for_tokens(code)
    except Exception as exc:
        logger.error("Erreur lors de l'échange du code OAuth Gmail : %s", exc)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Impossible d'échanger le code OAuth : {exc}",
        ) from exc

    refresh_token = tokens.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Aucun refresh token retourné par Google. "
                "Assurez-vous que access_type=offline et prompt=consent sont bien utilisés."
            ),
        )

    current_user.gmail_refresh_token = refresh_token
    current_user.gmail_connected = True
    await db.commit()
    return {"connected": True}


# ---------------------------------------------------------------------------
# POST /sync/gmail/sync
# ---------------------------------------------------------------------------


@router.post("/gmail/sync", summary="Synchroniser les emails de vente")
async def gmail_sync(
    db: DbDep,
    current_user: Annotated[User, Depends(require_plan("pro"))],
) -> dict:
    """Trigger a Gmail synchronisation and import new sale items."""
    _require_gmail_configured()
    if not current_user.gmail_connected:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Gmail non connecté. Utilisez /sync/gmail/authorize d'abord.",
        )
    try:
        result = await sync_gmail_sales(db, current_user)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.error("Erreur de synchronisation Gmail pour l'utilisateur %s : %s", current_user.id, exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Erreur lors de la synchronisation Gmail : {exc}",
        ) from exc
    return result


# ---------------------------------------------------------------------------
# GET /sync/status
# ---------------------------------------------------------------------------


@router.get("/status", summary="Statut de la connexion Gmail")
async def sync_status(current_user: CurrentUserDep) -> dict:
    """Return whether Gmail is connected and when the last sync occurred."""
    return {
        "gmail_connected": current_user.gmail_connected,
        "last_sync": current_user.last_email_sync,
    }


# ---------------------------------------------------------------------------
# DELETE /sync/gmail/disconnect
# ---------------------------------------------------------------------------


@router.delete("/gmail/disconnect", summary="Déconnecter Gmail")
async def gmail_disconnect(
    db: DbDep,
    current_user: Annotated[User, Depends(require_plan("pro"))],
) -> dict:
    """Remove the stored Gmail refresh token and mark the account as disconnected."""
    current_user.gmail_refresh_token = None
    current_user.gmail_connected = False
    current_user.last_email_sync = None
    await db.commit()
    return {"disconnected": True}
