"""Utility bersama untuk router: rate limit dan cache."""

from __future__ import annotations

import hashlib

from fastapi import HTTPException, Request

from app.config import get_settings
from app.services.cache import TTLCache
from app.services.rate_limit import RateLimiter

_settings = get_settings()

limiter = RateLimiter(
    limit=_settings.rate_limit_requests,
    window_seconds=_settings.rate_limit_window_seconds,
)

scan_cache = TTLCache(
    ttl_seconds=_settings.cache_ttl_seconds,
    max_entries=_settings.cache_max_entries,
)

explain_cache = TTLCache(
    ttl_seconds=_settings.cache_ttl_seconds,
    max_entries=_settings.cache_max_entries,
)


def client_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def enforce_rate_limit(request: Request) -> None:
    allowed, retry_after = limiter.hit(client_key(request))
    if not allowed:
        raise HTTPException(
            status_code=429,
            detail=(
                "Terlalu banyak permintaan. Mohon tunggu "
                f"{retry_after} detik lalu coba lagi ya."
            ),
            headers={"Retry-After": str(retry_after)},
        )


def sha256_hex(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def text_cache_key(*parts: str) -> str:
    return sha256_hex("\u0000".join(parts).encode("utf-8"))
