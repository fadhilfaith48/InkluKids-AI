"""Verifikasi token Supabase (JWT) untuk endpoint AI.

Tujuan keamanan:
- Mencegah pihak lain memakai kuota Gemini lewat endpoint publik.
- Menolak token palsu/kedaluwarsa sebelum permintaan diproses.
- Rate limit dapat dihitung per akun, bukan hanya per IP.

Mode diatur lewat `AUTH_MODE`:
- `off`      : verifikasi dimatikan (hanya untuk pengujian).
- `optional` : token diverifikasi bila ada; tanpa token tetap boleh (tamu/demo).
- `required` : semua permintaan wajib membawa token yang sah.

`SUPABASE_URL` wajib diisi agar verifikasi aktif. Bila kosong pada mode
`optional`, permintaan diperlakukan sebagai tamu agar demo lokal tidak rusak.
Pada mode `required`, konfigurasi yang kosong menghasilkan 503 (bukan diam-diam
membuka akses).
"""

from __future__ import annotations

import logging
from dataclasses import dataclass
from functools import lru_cache

import jwt
from fastapi import HTTPException, Request
from jwt import PyJWKClient

from app.config import get_settings

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class AuthUser:
    """Identitas pengguna dari token Supabase yang sudah diverifikasi."""

    id: str
    email: str | None = None
    role: str = "authenticated"


def _bearer_token(request: Request) -> str | None:
    header = request.headers.get("authorization", "")
    scheme, _, token = header.partition(" ")
    if scheme.strip().lower() != "bearer":
        return None
    token = token.strip()
    return token or None


@lru_cache(maxsize=4)
def _jwks_client(jwks_url: str) -> PyJWKClient:
    """Cache kunci publik JWKS agar tidak diambil ulang tiap permintaan."""
    return PyJWKClient(jwks_url, cache_keys=True, lifespan=600)


def _decode_token(token: str) -> dict:
    settings = get_settings()
    base = settings.supabase_url.rstrip("/")
    issuer = f"{base}/auth/v1"
    options = {"require": ["exp", "sub"], "verify_aud": True}

    # Proyek Supabase lama memakai HS256 dengan JWT secret.
    if settings.supabase_jwt_secret:
        return jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience=settings.supabase_jwt_audience,
            issuer=issuer,
            options=options,
        )

    # Proyek baru memakai kunci asimetris (ES256/RS256) lewat JWKS.
    jwks_url = f"{base}/auth/v1/.well-known/jwks.json"
    signing_key = _jwks_client(jwks_url).get_signing_key_from_jwt(token)
    return jwt.decode(
        token,
        signing_key.key,
        algorithms=["ES256", "RS256"],
        audience=settings.supabase_jwt_audience,
        issuer=issuer,
        options=options,
    )


def require_user(request: Request) -> AuthUser | None:
    """Dependency FastAPI: kembalikan pengguna terverifikasi atau None.

    Fungsi ini sengaja sinkron agar pemanggilan JWKS berjalan di threadpool,
    bukan memblokir event loop pada endpoint async seperti `/api/scan`.
    """
    settings = get_settings()
    mode = settings.auth_mode_normalized

    if mode == "off":
        return None

    token = _bearer_token(request)

    if not token:
        if mode == "required":
            raise HTTPException(
                status_code=401,
                detail="Silakan masuk terlebih dahulu untuk memakai fitur AI.",
            )
        return None

    if not settings.supabase_url:
        # `optional`: jangan rusak demo lokal yang belum mengisi SUPABASE_URL.
        # `required`: konfigurasi tidak lengkap, jangan buka akses.
        if mode == "required":
            raise HTTPException(
                status_code=503,
                detail=(
                    "Verifikasi login belum dikonfigurasi di server "
                    "(SUPABASE_URL kosong)."
                ),
            )
        logger.warning(
            "Token dikirim tetapi SUPABASE_URL belum diisi; dianggap tamu."
        )
        return None

    try:
        payload = _decode_token(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Sesi login sudah berakhir. Silakan masuk lagi.",
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001 - semua kegagalan decode = 401
        logger.warning("Token Supabase tidak valid: %s", exc)
        raise HTTPException(
            status_code=401,
            detail="Token login tidak valid. Silakan masuk lagi.",
        )

    user_id = payload.get("sub")
    if not isinstance(user_id, str) or not user_id:
        raise HTTPException(
            status_code=401,
            detail="Token login tidak memuat identitas pengguna.",
        )

    email = payload.get("email")
    role = payload.get("role")

    return AuthUser(
        id=user_id,
        email=email if isinstance(email, str) else None,
        role=role if isinstance(role, str) else "authenticated",
    )
