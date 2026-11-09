"""Skema Pydantic.

Bentuk respons sengaja disamakan dengan `Frontend/types/index.ts` agar
komponen UI yang sudah ada tidak perlu diubah.
"""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

RequestType = Literal["lebih_mudah", "beri_contoh", "kata_sulit"]


class SimplifiedPoint(BaseModel):
    order: int
    text: str
    analogy: str | None = None
    source_quote: str = ""
    is_valid_quote: bool = False


class GlossaryTerm(BaseModel):
    term: str
    meaning: str
    source_quote: str | None = None


class VisualStep(BaseModel):
    order: int
    icon: str
    text: str


class Flashcard(BaseModel):
    word: str
    meaning: str
    steps: list[VisualStep] = Field(default_factory=list)
    sign_description: str = ""
    example_sentence: str = ""
    source_quote: str = ""
    is_valid_quote: bool = False


class ScanResult(BaseModel):
    id: str
    title: str
    ocr_text: str
    points: list[SimplifiedPoint]
    glossary: list[GlossaryTerm] = Field(default_factory=list)
    flashcards: list[Flashcard] = Field(default_factory=list)
    readable: bool = True
    created_at: str
    image_preview: str | None = None
    stars_earned: int = 0


class ExplanationResult(BaseModel):
    text: str
    source_quote: str = ""
    is_valid_quote: bool = False


class ScanRequest(BaseModel):
    """Body JSON dari frontend (camelCase)."""

    model_config = ConfigDict(populate_by_name=True)

    image_base64: str = Field(alias="imageBase64")
    mime_type: str = Field(default="image/jpeg", alias="mimeType")
    image_preview: str | None = Field(default=None, alias="imagePreview")


class SimplifyRequest(BaseModel):
    """Teks materi yang ditulis guru lalu disederhanakan AI."""

    model_config = ConfigDict(populate_by_name=True)

    text: str
    title_hint: str | None = Field(default=None, alias="titleHint")


class ExplainRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    point_text: str = Field(alias="pointText")
    ocr_text: str = Field(alias="ocrText")
    request_type: RequestType = Field(default="lebih_mudah", alias="requestType")


class FlashcardRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    word: str
    ocr_text: str = Field(alias="ocrText")
    source_quote: str = Field(default="", alias="sourceQuote")


class HealthResponse(BaseModel):
    status: str
    service: str
    model: str
    gemini_configured: bool
    demo_fallback: bool
