"""Endpoint Tanya Penjelasan Lain (AI tutor)."""

from __future__ import annotations

from fastapi import APIRouter, HTTPException, Request

from app.config import get_settings
from app.deps import enforce_rate_limit, explain_cache, text_cache_key
from app.schemas import ExplainRequest, ExplanationResult
from app.services.gemini import AIServiceError, generate_explanation
from app.services.source_validator import best_quote_from_ocr, validate_source_quote
from app.services.transform import build_explanation

router = APIRouter(prefix="/api", tags=["explain"])


def _demo_explanation(payload: ExplainRequest) -> ExplanationResult:
    """Jawaban aman saat API key belum ada. Tidak menambah fakta baru."""
    point = payload.point_text.strip()

    if payload.request_type == "beri_contoh":
        text = (
            f"Coba cari contoh di sekitarmu yang mirip dengan poin ini: {point} "
            "Perhatikan benda atau kejadian yang kamu lihat hari ini."
        )
    elif payload.request_type == "kata_sulit":
        text = (
            "Kata-kata penting pada poin ini sudah dijelaskan di kamus kata "
            "pada halaman materi. Buka bagian kamus kata untuk membacanya lagi."
        )
    else:
        text = f"Intinya: {point} Baca pelan-pelan, satu bagian setiap kali, ya."

    quote = best_quote_from_ocr(payload.ocr_text)
    return ExplanationResult(
        text=text,
        source_quote=quote,
        is_valid_quote=validate_source_quote(quote, payload.ocr_text),
    )


@router.post("/explain", response_model=ExplanationResult)
def explain(request: Request, payload: ExplainRequest) -> ExplanationResult:
    enforce_rate_limit(request)
    settings = get_settings()

    point_text = payload.point_text.strip()
    ocr_text = payload.ocr_text.strip()

    if not point_text:
        raise HTTPException(status_code=400, detail="Poin materi tidak boleh kosong.")
    if not ocr_text:
        raise HTTPException(
            status_code=400,
            detail="Teks halaman tidak tersedia. Silakan pindai ulang halaman buku.",
        )
    if len(point_text) > settings.max_point_chars:
        raise HTTPException(status_code=400, detail="Poin materi terlalu panjang.")

    cache_key = text_cache_key(point_text, ocr_text, payload.request_type)
    cached = explain_cache.get(cache_key)
    if cached is not None:
        return ExplanationResult.model_validate(cached)

    if not settings.gemini_enabled:
        if settings.enable_demo_fallback:
            result = _demo_explanation(payload)
            explain_cache.set(cache_key, result.model_dump())
            return result
        raise HTTPException(
            status_code=503,
            detail=(
                "Layanan AI belum dikonfigurasi (GEMINI_API_KEY kosong). "
                "Silakan isi kunci API terlebih dahulu."
            ),
        )

    try:
        parsed = generate_explanation(point_text, ocr_text, payload.request_type)
        result = build_explanation(parsed, ocr_text)
    except ValueError:
        raise HTTPException(
            status_code=502,
            detail="Tutor AI belum bisa menyusun penjelasan. Silakan coba lagi.",
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    explain_cache.set(cache_key, result.model_dump())
    return result
