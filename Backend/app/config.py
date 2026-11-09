"""Konfigurasi backend dari environment variable.

Semua nilai dibaca dari `Backend/.env` (lokal) atau environment hosting.
API key Gemini tidak pernah dikirim ke browser.
"""

from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    app_name: str = "PahamInklusif AI Backend"
    environment: str = "development"

    # AI
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    request_timeout_seconds: int = 45

    # Log ringkasan balasan AI (tanpa isi gambar/teks halaman) untuk diagnosis.
    ai_debug_raw: bool = False

    # Batas input
    max_image_bytes: int = 10 * 1024 * 1024
    max_ocr_chars: int = 12_000
    max_point_chars: int = 2_000

    # CORS (dipisah koma)
    allowed_origins: str = (
        "http://localhost:3000,http://127.0.0.1:3000,"
        "http://localhost:5173,http://127.0.0.1:5173"
    )
    allowed_origin_regex: str = r"https://.*\.vercel\.app"

    # Rate limit sederhana per IP
    rate_limit_requests: int = 12
    rate_limit_window_seconds: int = 60

    # Cache hasil scan berdasarkan hash gambar (Green IT)
    cache_ttl_seconds: int = 3_600
    cache_max_entries: int = 50

    # Saat API key belum diisi, endpoint explain memakai jawaban contoh aman.
    enable_demo_fallback: bool = True

    @property
    def gemini_enabled(self) -> bool:
        return bool(self.gemini_api_key.strip())

    @property
    def allowed_origins_list(self) -> list[str]:
        return [item.strip() for item in self.allowed_origins.split(",") if item.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
