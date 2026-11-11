"""Endpoint penyederhanaan teks materi yang ditulis guru."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request

from app.config import get_settings
from app.deps import enforce_rate_limit, explain_cache, sha256_hex, text_cache_key
from app.schemas import ScanResult, SimplifyRequest
from app.security import AuthUser, require_user
from app.services.gemini import AIServiceError, generate_text_lesson
from app.services.transform import UnreadablePageError, build_scan_result

router = APIRouter(prefix="/api", tags=["simplify"])


@router.post("/simplify", response_model=ScanResult)
def simplify_text(
    request: Request,
    payload: SimplifyRequest,
    user: AuthUser | None = Depends(require_user),
) -> ScanResult:
    enforce_rate_limit(request, user)
    settings = get_settings()

    text = payload.text.strip()
    title_hint = (payload.title_hint or "").strip()

    if not text:
        raise HTTPException(status_code=400, detail="Teks materi tidak boleh kosong.")
    if len(text) > settings.max_ocr_chars:
        raise HTTPException(
            status_code=400,
            detail=(
                "Teks materi terlalu panjang. Maksimal "
                f"{settings.max_ocr_chars} karakter ya."
            ),
        )

    cache_key = text_cache_key("simplify", text, title_hint)
    cached: Any = explain_cache.get(cache_key)
    if cached is not None:
        return ScanResult.model_validate(cached)

    if not settings.gemini_enabled:
        raise HTTPException(
            status_code=503,
            detail=(
                "Layanan AI belum dikonfigurasi (GEMINI_API_KEY kosong). "
                "Materi tetap bisa ditulis manual tanpa bantuan AI."
            ),
        )

    try:
        parsed = generate_text_lesson(text, title_hint)
        # Teks guru menjadi sumber kutipan, jadi jangan bergantung pada balasan AI.
        parsed["ocr_text"] = text
        if title_hint:
            parsed["title"] = title_hint
        result = build_scan_result(parsed, sha256_hex(text.encode("utf-8")))
    except UnreadablePageError:
        raise HTTPException(
            status_code=502,
            detail=(
                "AI belum bisa menyederhanakan teks itu. Coba tulis lebih lengkap "
                "atau bagi menjadi beberapa bagian."
            ),
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    explain_cache.set(cache_key, result.model_dump())
    return result
