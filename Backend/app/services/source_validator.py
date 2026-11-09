"""Validasi kutipan sumber (Explainable AI).

Port dari `Frontend/lib/source-validator.ts` supaya hasil backend dan route
handler Next.js memakai aturan yang sama.
"""

import re
import unicodedata


def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFD", text.lower())
    text = "".join(ch for ch in text if unicodedata.category(ch) != "Mn")
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def validate_source_quote(quote: str, ocr_text: str, threshold: float = 0.85) -> bool:
    """True bila kutipan persis ada di OCR atau proporsi katanya >= threshold."""
    normalized_quote = normalize_text(quote)
    normalized_ocr = normalize_text(ocr_text)

    if not normalized_quote or not normalized_ocr:
        return False

    if normalized_quote in normalized_ocr:
        return True

    words = [word for word in normalized_quote.split(" ") if len(word) > 2]
    if not words:
        return normalized_quote in normalized_ocr

    matched = sum(1 for word in words if word in normalized_ocr)
    return (matched / len(words)) >= threshold


def best_quote_from_ocr(ocr_text: str, max_chars: int = 160) -> str:
    """Ambil satu kalimat dari OCR sebagai rujukan fallback yang aman."""
    cleaned = re.sub(r"\s+", " ", (ocr_text or "").strip())
    if not cleaned:
        return ""

    for sentence in re.split(r"(?<=[.!?])\s+", cleaned):
        sentence = sentence.strip()
        if sentence:
            return sentence[:max_chars]

    return cleaned[:max_chars]
