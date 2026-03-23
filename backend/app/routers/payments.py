"""
Payments router — Stripe Checkout, Customer Portal and Webhooks.
Prefix /payments, tags ["payments"].
"""

import asyncio
import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.deps import get_current_user
from app.database import get_db
from app.models.user import User

router = APIRouter(prefix="/payments", tags=["payments"])
logger = logging.getLogger(__name__)

DbDep = Annotated[AsyncSession, Depends(get_db)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]


def _get_stripe():
    """Return the stripe module configured with the secret key, or raise 503."""
    settings = get_settings()
    if not settings.stripe_secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Le paiement en ligne n'est pas encore configuré. Réessayez plus tard.",
        )
    try:
        import stripe  # noqa: PLC0415
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Dépendance Stripe manquante.",
        ) from exc
    stripe.api_key = settings.stripe_secret_key
    return stripe


async def _get_or_create_stripe_customer(
    stripe,
    db: AsyncSession,
    user: User,
) -> str:
    """Return existing Stripe customer ID or create a new one."""
    if user.stripe_customer_id:
        return user.stripe_customer_id

    # Create customer in Stripe (sync call wrapped)
    customer = await asyncio.to_thread(
        stripe.Customer.create,
        email=user.email,
        name=user.full_name,
        metadata={"user_id": str(user.id)},
    )
    customer_id: str = customer["id"]

    # Persist on the user row
    user.stripe_customer_id = customer_id
    db.add(user)
    await db.flush()

    return customer_id


# ---------------------------------------------------------------------------
# POST /payments/create-checkout
# ---------------------------------------------------------------------------


@router.post("/create-checkout", summary="Créer une session de paiement Stripe")
async def create_checkout(
    db: DbDep,
    current_user: CurrentUserDep,
) -> dict:
    stripe = _get_stripe()
    settings = get_settings()

    customer_id = await _get_or_create_stripe_customer(stripe, db, current_user)

    success_url = f"{settings.frontend_url}/dashboard?checkout=success"
    cancel_url = f"{settings.frontend_url}/dashboard?checkout=cancelled"

    # Build price_data inline (no pre-created price needed)
    checkout_kwargs = dict(
        customer=customer_id,
        mode="subscription",
        line_items=[
            {
                "price_data": {
                    "currency": "eur",
                    "unit_amount": 400,  # 4,00 €
                    "recurring": {"interval": "month"},
                    "product_data": {
                        "name": "Revendu Pro",
                        "description": "Accès illimité à toutes les fonctionnalités Revendu",
                    },
                },
                "quantity": 1,
            }
        ],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={"user_id": str(current_user.id)},
        client_reference_id=str(current_user.id),
    )

    # If a specific price ID is configured, use it instead
    if settings.stripe_pro_price_id:
        checkout_kwargs["line_items"] = [
            {"price": settings.stripe_pro_price_id, "quantity": 1}
        ]

    session = await asyncio.to_thread(stripe.checkout.Session.create, **checkout_kwargs)

    await db.commit()
    return {"checkout_url": session["url"]}


# ---------------------------------------------------------------------------
# POST /payments/webhook
# ---------------------------------------------------------------------------


@router.post(
    "/webhook",
    summary="Webhook Stripe",
    include_in_schema=False,  # Don't expose in OpenAPI (Stripe calls this directly)
)
async def stripe_webhook(
    request: Request,
    db: DbDep,
) -> dict:
    """Handle Stripe webhook events. No auth dependency — uses Stripe signature."""
    settings = get_settings()

    try:
        import stripe as _stripe  # noqa: PLC0415
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Dépendance Stripe manquante.",
        ) from exc

    _stripe.api_key = settings.stripe_secret_key

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    if settings.stripe_webhook_secret:
        try:
            event = await asyncio.to_thread(
                _stripe.Webhook.construct_event,
                payload,
                sig_header,
                settings.stripe_webhook_secret,
            )
        except _stripe.error.SignatureVerificationError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Signature Stripe invalide.",
            )
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Webhook error: {exc}",
            ) from exc
    else:
        # In dev: skip signature verification
        import json  # noqa: PLC0415
        try:
            event = json.loads(payload)
        except Exception as exc:  # noqa: BLE001
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Payload JSON invalide.",
            ) from exc

    event_type = event.get("type") if isinstance(event, dict) else event["type"]
    event_data = event.get("data", {}) if isinstance(event, dict) else event["data"]
    event_object = event_data.get("object", {}) if isinstance(event_data, dict) else event_data["object"]

    logger.info("Stripe webhook received: %s", event_type)

    try:
        if event_type == "checkout.session.completed":
            customer_id = event_object.get("customer")
            client_ref = event_object.get("client_reference_id")
            await _handle_subscription_activated(db, customer_id, client_ref)

        elif event_type == "customer.subscription.deleted":
            customer_id = event_object.get("customer")
            await _handle_subscription_cancelled(db, customer_id)

        elif event_type == "customer.subscription.updated":
            customer_id = event_object.get("customer")
            status = event_object.get("status")
            await _handle_subscription_updated(db, customer_id, status)

        elif event_type == "invoice.payment_failed":
            customer_id = event_object.get("customer")
            logger.warning(
                "Payment failed for Stripe customer: %s. Subscription may be cancelled.",
                customer_id,
            )

    except Exception as exc:  # noqa: BLE001
        logger.error("Error processing webhook %s: %s", event_type, exc)
        # Don't re-raise — return 200 to prevent Stripe from retrying indefinitely

    return {"received": True}


async def _handle_subscription_activated(
    db: AsyncSession,
    customer_id: str | None,
    client_ref: str | None,
) -> None:
    """Set user.plan = 'pro' after a successful checkout."""
    user = await _find_user(db, customer_id, client_ref)
    if user is None:
        logger.warning("Stripe webhook: user not found (customer=%s, ref=%s)", customer_id, client_ref)
        return
    user.plan = "pro"
    if customer_id and not user.stripe_customer_id:
        user.stripe_customer_id = customer_id
    db.add(user)
    await db.commit()
    logger.info("User %s upgraded to pro.", user.id)


async def _handle_subscription_cancelled(
    db: AsyncSession,
    customer_id: str | None,
) -> None:
    """Set user.plan = 'free' after subscription deletion."""
    user = await _find_user(db, customer_id, None)
    if user is None:
        logger.warning("Stripe webhook: user not found for cancellation (customer=%s)", customer_id)
        return
    user.plan = "free"
    db.add(user)
    await db.commit()
    logger.info("User %s downgraded to free.", user.id)


async def _handle_subscription_updated(
    db: AsyncSession,
    customer_id: str | None,
    status: str | None,
) -> None:
    """Handle subscription updates (e.g., status changes)."""
    user = await _find_user(db, customer_id, None)
    if user is None:
        logger.warning("Stripe webhook: user not found for update (customer=%s)", customer_id)
        return

    # If subscription is active, ensure plan is pro
    if status == "active":
        user.plan = "pro"
    # If subscription is incomplete or past_due, keep pro (they'll be notified by Stripe)
    # If subscription is canceled, this should be handled by customer.subscription.deleted

    db.add(user)
    await db.commit()
    logger.info("User %s subscription updated (status=%s).", user.id, status)


async def _find_user(
    db: AsyncSession,
    customer_id: str | None,
    client_ref: str | None,
) -> User | None:
    """Lookup user by stripe_customer_id or client_reference_id (UUID string)."""
    if customer_id:
        result = await db.execute(
            select(User).where(User.stripe_customer_id == customer_id)
        )
        user = result.scalar_one_or_none()
        if user:
            return user

    if client_ref:
        import uuid  # noqa: PLC0415
        try:
            uid = uuid.UUID(client_ref)
        except ValueError:
            return None
        result = await db.execute(select(User).where(User.id == uid))
        return result.scalar_one_or_none()

    return None


# ---------------------------------------------------------------------------
# GET /payments/portal
# ---------------------------------------------------------------------------


@router.get("/portal", summary="Accéder au portail de gestion de l'abonnement Stripe")
async def customer_portal(
    db: DbDep,
    current_user: CurrentUserDep,
) -> dict:
    stripe = _get_stripe()
    settings = get_settings()

    customer_id = await _get_or_create_stripe_customer(stripe, db, current_user)

    return_url = f"{settings.frontend_url}/dashboard"

    session = await asyncio.to_thread(
        stripe.billing_portal.Session.create,
        customer=customer_id,
        return_url=return_url,
    )

    await db.commit()
    return {"portal_url": session["url"]}
