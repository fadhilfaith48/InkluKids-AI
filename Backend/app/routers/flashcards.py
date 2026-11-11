"""Endpoint pembuatan flashcard visual (Fitur 2)."""

from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request

from app.config import get_settings
from app.deps import enforce_rate_limit, explain_cache, text_cache_key
from app.schemas import Flashcard, FlashcardRequest
from app.security import AuthUser, require_user
from app.services.gemini import AIServiceError, generate_flashcard
from app.services.transform import build_flashcard

router = APIRouter(prefix="/api", tags=["flashcards"])


@router.post("/flashcards", response_model=Flashcard)
def create_flashcard(
    request: Request,
    payload: FlashcardRequest,
    user: AuthUser | None = Depends(require_user),
) -> Flashcard:
    enforce_rate_limit(request, user)
    settings = get_settings()

    word = payload.word.strip()
    ocr_text = payload.ocr_text.strip()

    if not word:
        raise HTTPException(status_code=400, detail="Kata yang ingin dijelaskan belum diisi.")
    if not ocr_text:
        raise HTTPException(
            status_code=400,
            detail="Teks halaman tidak tersedia. Silakan pindai ulang halaman buku.",
        )
    if len(word) > 120:
        raise HTTPException(status_code=400, detail="Kata terlalu panjang.")

    if not settings.gemini_enabled:
        raise HTTPException(
            status_code=503,
            detail=(
                "Pembuatan flashcard AI memerlukan GEMINI_API_KEY. "
                "Untuk demo, gunakan flashcard pada materi contoh."
            ),
        )

    cache_key = text_cache_key("flashcard", word, ocr_text, payload.source_quote)
    cached = explain_cache.get(cache_key)
    if cached is not None:
        return Flashcard.model_validate(cached)

    try:
        parsed = generate_flashcard(word, ocr_text, payload.source_quote)
        result = build_flashcard(parsed, ocr_text)
    except ValueError:
        raise HTTPException(
            status_code=502,
            detail="AI belum bisa menyusun flashcard. Silakan coba lagi.",
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    explain_cache.set(cache_key, result.model_dump())
    return result
