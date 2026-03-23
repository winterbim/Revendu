"""
Email sync service — Gmail OAuth integration for automatic sale import.

Supported platforms: Vinted, Leboncoin, eBay, Vestiaire Collective.
"""

import asyncio
import base64
import logging
import re
from datetime import date, datetime, timezone
from decimal import Decimal, InvalidOperation
from email import message_from_bytes
from email.utils import parsedate_to_datetime

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.models.item import Item
from app.models.user import User

logger = logging.getLogger(__name__)

settings = get_settings()

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

GMAIL_QUERY = (
    "from:(vinted.fr OR leboncoin.fr OR ebay.fr OR vestiaire.com) "
    "subject:(vendu OR vente OR sold OR confirmé OR félicitations) "
    "newer_than:1y"
)

# Mapping of sender domain → platform name (must match PLATFORM_VALUES)
_PLATFORM_MAP = {
    "vinted.fr": "vinted",
    "leboncoin.fr": "leboncoin",
    "ebay.fr": "ebay",
    "vestiaire.com": "vestiaire",
}

# Regex patterns to extract a price in euros
_PRICE_PATTERNS = [
    re.compile(r"(\d+[\.,]\d{2})\s*€"),
    re.compile(r"€\s*(\d+[\.,]\d{2})"),
    re.compile(r"(\d+)\s*euros?", re.IGNORECASE),
    re.compile(r"(\d+[\.,]\d*)\s*€"),
]

# Keywords to strip from email subjects when building the item name
_SUBJECT_NOISE = re.compile(
    r"\b(félicitations|votre article|a été vendu|vendu|vente|sold|confirmé|"
    r"votre annonce|article vendu|vente confirmée|félicitations !)\b",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# OAuth helpers
# ---------------------------------------------------------------------------


def get_gmail_auth_url(state: str) -> str:
    """Return the Google OAuth authorisation URL for Gmail readonly access."""
    if not settings.google_client_id:
        raise ValueError("GOOGLE_CLIENT_ID non configuré.")

    from google_auth_oauthlib.flow import Flow  # type: ignore[import-untyped]

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
        redirect_uri=settings.google_redirect_uri,
    )
    auth_url, _ = flow.authorization_url(
        access_type="offline",
        prompt="consent",
        state=state,
    )
    return auth_url


async def exchange_code_for_tokens(code: str) -> dict:
    """
    Exchange an OAuth authorisation code for access + refresh tokens.
    Returns a dict with at least ``access_token`` and ``refresh_token``.
    """
    if not settings.google_client_id:
        raise ValueError("GOOGLE_CLIENT_ID non configuré.")

    def _exchange() -> dict:
        from google_auth_oauthlib.flow import Flow  # type: ignore[import-untyped]

        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": settings.google_client_id,
                    "client_secret": settings.google_client_secret,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                }
            },
            scopes=SCOPES,
            redirect_uri=settings.google_redirect_uri,
        )
        flow.fetch_token(code=code)
        creds = flow.credentials
        return {
            "access_token": creds.token,
            "refresh_token": creds.refresh_token,
        }

    return await asyncio.to_thread(_exchange)


# ---------------------------------------------------------------------------
# Email parsing helpers
# ---------------------------------------------------------------------------


def _detect_platform(sender: str) -> str:
    """Infer platform name from the sender address."""
    sender_lower = sender.lower()
    for domain, platform in _PLATFORM_MAP.items():
        if domain in sender_lower:
            return platform
    return "autres"


def _extract_price(text: str) -> Decimal | None:
    """Return the first price found in *text*, or None."""
    for pattern in _PRICE_PATTERNS:
        match = pattern.search(text)
        if match:
            raw = match.group(1).replace(",", ".")
            try:
                return Decimal(raw).quantize(Decimal("0.01"))
            except InvalidOperation:
                continue
    return None


def _decode_body(payload: dict) -> str:
    """
    Recursively decode a Gmail message payload into a plain string.
    Prefers text/plain; falls back to text/html (tags stripped).
    """
    mime_type: str = payload.get("mimeType", "")
    body_data: str = payload.get("body", {}).get("data", "")

    if mime_type.startswith("text/") and body_data:
        try:
            raw_bytes = base64.urlsafe_b64decode(body_data + "==")
            text = raw_bytes.decode("utf-8", errors="replace")
            if mime_type == "text/html":
                # Strip HTML tags for simpler regex matching
                text = re.sub(r"<[^>]+>", " ", text)
                text = re.sub(r"\s+", " ", text)
            return text
        except Exception:
            return ""

    if "parts" in payload:
        # Prefer text/plain parts first
        for part in payload["parts"]:
            if part.get("mimeType") == "text/plain":
                result = _decode_body(part)
                if result:
                    return result
        # Fall back to any part
        for part in payload["parts"]:
            result = _decode_body(part)
            if result:
                return result

    return ""


def _extract_header(headers: list[dict], name: str) -> str:
    """Case-insensitive header extraction from a Gmail message."""
    name_lower = name.lower()
    for h in headers:
        if h.get("name", "").lower() == name_lower:
            return h.get("value", "")
    return ""


def _parse_email_date(date_str: str) -> date:
    """Parse an RFC 2822 date string into a Python date. Falls back to today."""
    if not date_str:
        return datetime.now(timezone.utc).date()
    try:
        return parsedate_to_datetime(date_str).date()
    except Exception:
        return datetime.now(timezone.utc).date()


def _clean_subject_to_name(subject: str, platform: str) -> str:
    """Remove noise keywords from the email subject to produce an article name."""
    cleaned = _SUBJECT_NOISE.sub("", subject).strip(" !:-–—|")
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if not cleaned or len(cleaned) < 3:
        cleaned = f"Vente {platform}"
    return cleaned[:500]


def parse_sale_email(msg_data: dict) -> dict | None:
    """
    Extract sale information from a raw Gmail message dict.

    Returns a dict compatible with ``create_item`` or None if parsing fails.
    """
    payload: dict = msg_data.get("payload", {})
    headers: list[dict] = payload.get("headers", [])

    subject = _extract_header(headers, "Subject")
    sender = _extract_header(headers, "From")
    date_str = _extract_header(headers, "Date")

    if not sender:
        logger.debug("Email ignoré : pas d'expéditeur.")
        return None

    platform = _detect_platform(sender)
    sale_date = _parse_email_date(date_str)
    body = _decode_body(payload)

    # Try to find a price in body, then subject
    price = _extract_price(body) or _extract_price(subject)
    if price is None or price <= Decimal("0"):
        logger.debug("Email ignoré : aucun prix trouvé. Sujet: %r", subject)
        return None

    name = _clean_subject_to_name(subject, platform)

    return {
        "name": name,
        "platform": platform,
        "sale_price": price,
        "sale_date": sale_date,
        "purchase_price": Decimal("0.01"),  # unknown — user must complete
        "purchase_date": sale_date,
        "platform_fees": Decimal("0.00"),
        "shipping_cost": Decimal("0.00"),
        "description": f"Importé depuis email — {subject[:200]}",
    }


# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------


async def _item_exists(
    db: AsyncSession,
    user_id,
    name: str,
    sale_date: date,
    platform: str,
) -> bool:
    """Return True if an identical item already exists for this user."""
    result = await db.execute(
        select(Item.id).where(
            and_(
                Item.user_id == user_id,
                Item.name == name,
                Item.sale_date == sale_date,
                Item.platform == platform,
            )
        )
    )
    return result.scalar_one_or_none() is not None


# ---------------------------------------------------------------------------
# Main sync function
# ---------------------------------------------------------------------------


async def sync_gmail_sales(db: AsyncSession, user: User) -> dict:
    """
    Read sale emails from the user's Gmail inbox and import them as items.

    Returns: ``{"imported": N, "skipped": N, "errors": [...]}``
    """
    if not settings.google_client_id:
        raise ValueError("GOOGLE_CLIENT_ID non configuré.")

    if not user.gmail_refresh_token:
        raise ValueError("Aucun refresh token Gmail stocké pour cet utilisateur.")

    # Build credentials from the stored refresh token
    def _build_service():
        import google.oauth2.credentials as google_creds  # type: ignore[import-untyped]
        from googleapiclient.discovery import build  # type: ignore[import-untyped]

        creds = google_creds.Credentials(
            token=None,
            refresh_token=user.gmail_refresh_token,
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.google_client_id,
            client_secret=settings.google_client_secret,
            scopes=SCOPES,
        )
        return build("gmail", "v1", credentials=creds, cache_discovery=False)

    service = await asyncio.to_thread(_build_service)

    # Fetch matching message IDs
    def _list_messages():
        return (
            service.users()
            .messages()
            .list(userId="me", q=GMAIL_QUERY, maxResults=100)
            .execute()
        )

    list_result = await asyncio.to_thread(_list_messages)
    messages = list_result.get("messages", [])

    if not messages:
        logger.info("Aucun email de vente trouvé pour l'utilisateur %s.", user.id)
        await _update_last_sync(db, user)
        return {"imported": 0, "skipped": 0, "errors": []}

    imported = 0
    skipped = 0
    errors: list[str] = []

    for msg_ref in messages:
        msg_id: str = msg_ref["id"]
        try:
            def _get_message(mid=msg_id):
                return (
                    service.users()
                    .messages()
                    .get(userId="me", id=mid, format="full")
                    .execute()
                )

            msg_data = await asyncio.to_thread(_get_message)
            parsed = parse_sale_email(msg_data)

            if parsed is None:
                skipped += 1
                continue

            # Deduplication check
            already_exists = await _item_exists(
                db,
                user.id,
                parsed["name"],
                parsed["sale_date"],
                parsed["platform"],
            )
            if already_exists:
                logger.debug(
                    "Item dupliqué ignoré : %r (%s %s)",
                    parsed["name"],
                    parsed["platform"],
                    parsed["sale_date"],
                )
                skipped += 1
                continue

            # Create the item
            item = Item(
                user_id=user.id,
                name=parsed["name"],
                description=parsed.get("description"),
                platform=parsed["platform"],
                status="sold",
                purchase_price=parsed["purchase_price"],
                purchase_date=parsed["purchase_date"],
                sale_price=parsed["sale_price"],
                sale_date=parsed["sale_date"],
                platform_fees=parsed["platform_fees"],
                shipping_cost=parsed["shipping_cost"],
            )
            db.add(item)
            await db.flush()
            imported += 1
            logger.info(
                "Item importé depuis email : %r (%.2f€) [%s]",
                item.name,
                item.sale_price,
                item.platform,
            )

        except Exception as exc:
            logger.error("Erreur lors du traitement de l'email %s : %s", msg_id, exc)
            errors.append(f"Email {msg_id}: {exc!s}")

    await _update_last_sync(db, user)
    await db.commit()

    return {"imported": imported, "skipped": skipped, "errors": errors}


async def _update_last_sync(db: AsyncSession, user: User) -> None:
    """Stamp user.last_email_sync with the current UTC time."""
    user.last_email_sync = datetime.now(timezone.utc)
    await db.flush()
