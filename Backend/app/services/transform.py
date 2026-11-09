"""Ubah keluaran mentah AI menjadi skema yang dipakai frontend."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from app.schemas import (
    ExplanationResult,
    Flashcard,
    GlossaryTerm,
    ScanResult,
    SimplifiedPoint,
    VisualStep,
)
from app.services.source_validator import validate_source_quote


class UnreadablePageError(ValueError):
    """Gambar tidak memuat halaman teks yang bisa dibaca."""


def _clean_text(value: Any) -> str:
    return str(value or "").strip()


def _normalize_icon(value: Any) -> str:
    icon = _clean_text(value).lower().replace("_", "-")
    return icon or "sparkles"


def build_scan_result(
    parsed: dict[str, Any],
    image_hash: str,
    image_preview: str | None = None,
) -> ScanResult:
    if parsed.get("readable") is False:
        raise UnreadablePageError("halaman tidak terbaca")

    ocr_text = _clean_text(parsed.get("ocr_text"))
    if not ocr_text:
        raise UnreadablePageError("teks halaman kosong")

    points: list[SimplifiedPoint] = []
    for index, raw in enumerate(parsed.get("points") or []):
        if not isinstance(raw, dict):
            continue
        text = _clean_text(raw.get("text"))
        if not text:
            continue
        quote = _clean_text(raw.get("source_quote"))
        analogy = _clean_text(raw.get("analogy")) or None
        points.append(
            SimplifiedPoint(
                order=index + 1,
                text=text,
                analogy=analogy,
                source_quote=quote,
                is_valid_quote=validate_source_quote(quote, ocr_text),
            )
        )

    if not points:
        raise UnreadablePageError("tidak ada poin yang bisa disusun")

    glossary: list[GlossaryTerm] = []
    for raw in parsed.get("glossary") or []:
        if not isinstance(raw, dict):
            continue
        term = _clean_text(raw.get("term"))
        meaning = _clean_text(raw.get("meaning"))
        if not term or not meaning:
            continue
        glossary.append(
            GlossaryTerm(
                term=term,
                meaning=meaning,
                source_quote=_clean_text(raw.get("source_quote")) or None,
            )
        )

    flashcards: list[Flashcard] = []
    for raw in parsed.get("flashcards") or []:
        if not isinstance(raw, dict):
            continue
        word = _clean_text(raw.get("word"))
        meaning = _clean_text(raw.get("meaning"))
        if not word or not meaning:
            continue

        steps: list[VisualStep] = []
        for step_index, step in enumerate(raw.get("steps") or []):
            if not isinstance(step, dict):
                continue
            step_text = _clean_text(step.get("text"))
            if not step_text:
                continue
            steps.append(
                VisualStep(
                    order=len(steps) + 1,
                    icon=_normalize_icon(step.get("icon")),
                    text=step_text,
                )
            )

        quote = _clean_text(raw.get("source_quote"))
        flashcards.append(
            Flashcard(
                word=word,
                meaning=meaning,
                steps=steps,
                sign_description=_clean_text(raw.get("sign_description")),
                example_sentence=_clean_text(raw.get("example_sentence")),
                source_quote=quote,
                is_valid_quote=validate_source_quote(quote, ocr_text),
            )
        )

    return ScanResult(
        id=f"scan-{image_hash[:12]}",
        title=_clean_text(parsed.get("title")) or "Materi Pelajaran",
        ocr_text=ocr_text,
        points=points,
        glossary=glossary,
        flashcards=flashcards,
        readable=True,
        created_at=datetime.now(timezone.utc).isoformat(),
        image_preview=image_preview,
        stars_earned=0,
    )


def build_explanation(parsed: dict[str, Any], ocr_text: str) -> ExplanationResult:
    text = _clean_text(parsed.get("text"))
    quote = _clean_text(parsed.get("source_quote"))
    if not text:
        raise ValueError("penjelasan kosong")
    return ExplanationResult(
        text=text,
        source_quote=quote,
        is_valid_quote=validate_source_quote(quote, ocr_text),
    )


def build_flashcard(parsed: dict[str, Any], ocr_text: str) -> Flashcard:
    word = _clean_text(parsed.get("word"))
    meaning = _clean_text(parsed.get("meaning"))
    if not word or not meaning:
        raise ValueError("flashcard tidak lengkap")

    steps: list[VisualStep] = []
    for step in parsed.get("steps") or []:
        if not isinstance(step, dict):
            continue
        step_text = _clean_text(step.get("text"))
        if not step_text:
            continue
        steps.append(
            VisualStep(
                order=len(steps) + 1,
                icon=_normalize_icon(step.get("icon")),
                text=step_text,
            )
        )

    quote = _clean_text(parsed.get("source_quote"))
    return Flashcard(
        word=word,
        meaning=meaning,
        steps=steps,
        sign_description=_clean_text(parsed.get("sign_description")),
        example_sentence=_clean_text(parsed.get("example_sentence")),
        source_quote=quote,
        is_valid_quote=validate_source_quote(quote, ocr_text),
    )
