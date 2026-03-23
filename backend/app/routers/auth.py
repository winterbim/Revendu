import uuid
from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from jose import JWTError
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.core.deps import get_current_user
from app.core.security import create_access_token, create_refresh_token, decode_refresh_token
from app.database import get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserOut
from app.services.auth_service import authenticate_user, create_user, get_user_by_email, get_user_by_id

settings = get_settings()

router = APIRouter(prefix="/auth", tags=["auth"])
limiter = Limiter(key_func=get_remote_address)

_REFRESH_COOKIE = "revendu_refresh_token"
_COOKIE_MAX_AGE = settings.refresh_token_expire_days * 24 * 3600

# ---------------------------------------------------------------------------
# Annotated dependency aliases (S8410)
# ---------------------------------------------------------------------------

DbDep = Annotated[AsyncSession, Depends(get_db)]
CurrentUserDep = Annotated[User, Depends(get_current_user)]
RefreshCookieDep = Annotated[str | None, Cookie(alias=_REFRESH_COOKIE)]


def _set_refresh_cookie(response: Response, token: str) -> None:
    """Attach the refresh token as a secure httpOnly cookie."""
    response.set_cookie(
        key=_REFRESH_COOKIE,
        value=token,
        httponly=True,
        secure=settings.is_production,
        samesite="lax",
        max_age=_COOKIE_MAX_AGE,
        path="/api/v1/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=_REFRESH_COOKIE, path="/api/v1/auth")


# ---------------------------------------------------------------------------
# POST /register
# ---------------------------------------------------------------------------


@router.post("/register", status_code=status.HTTP_201_CREATED, summary="Créer un compte")
@limiter.limit("5/minute")
async def register(
    request: Request,
    payload: RegisterRequest,
    db: DbDep,
) -> UserOut:
    existing = await get_user_by_email(db, payload.email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Un compte existe déjà avec cette adresse e-mail.",
        )
    user = await create_user(db, payload)
    return UserOut.model_validate(user)


# ---------------------------------------------------------------------------
# POST /login
# ---------------------------------------------------------------------------


@router.post("/login", summary="Se connecter")
@limiter.limit(settings.rate_limit_login)
async def login(
    request: Request,
    payload: LoginRequest,
    response: Response,
    db: DbDep,
) -> TokenResponse:
    user = await authenticate_user(db, payload.email, payload.password)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail ou mot de passe incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token, expires_in = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))
    _set_refresh_cookie(response, refresh_token)

    return TokenResponse(
        access_token=access_token,
        expires_in=expires_in,
    )


# ---------------------------------------------------------------------------
# POST /logout
# ---------------------------------------------------------------------------


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT, summary="Se déconnecter")
async def logout(response: Response) -> None:
    _clear_refresh_cookie(response)


# ---------------------------------------------------------------------------
# GET /me
# ---------------------------------------------------------------------------


@router.get("/me", summary="Profil de l'utilisateur connecté")
async def me(current_user: CurrentUserDep) -> UserOut:
    return UserOut.model_validate(current_user)


# ---------------------------------------------------------------------------
# POST /refresh
# ---------------------------------------------------------------------------


@router.post("/refresh", summary="Renouveler l'access token")
async def refresh_token(
    response: Response,
    db: DbDep,
    refresh_cookie: RefreshCookieDep = None,
) -> TokenResponse:
    if refresh_cookie is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token manquant.",
        )

    try:
        user_id_str = decode_refresh_token(refresh_cookie)
    except JWTError:
        _clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token invalide ou expiré.",
        )

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token corrompu.")

    user = await get_user_by_id(db, user_id)
    if user is None:
        _clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Utilisateur introuvable.",
        )

    access_token, expires_in = create_access_token(str(user.id))
    # Rotate refresh token on each use
    new_refresh = create_refresh_token(str(user.id))
    _set_refresh_cookie(response, new_refresh)

    return TokenResponse(
        access_token=access_token,
        expires_in=expires_in,
    )
