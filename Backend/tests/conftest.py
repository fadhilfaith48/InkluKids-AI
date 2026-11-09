"""Konfigurasi pytest.

Tes tidak boleh bergantung pada isi `Backend/.env` milik pengembang, karena nilai
rate limit di sana bisa berbeda (mis. 4 request/menit menyesuaikan kuota Gemini).
Environment variable di bawah menimpa `.env` sebelum aplikasi diimpor.
"""

from __future__ import annotations

import os

import pytest

os.environ["GEMINI_API_KEY"] = ""
os.environ["RATE_LIMIT_REQUESTS"] = "100"
os.environ["RATE_LIMIT_WINDOW_SECONDS"] = "60"
os.environ["ENABLE_DEMO_FALLBACK"] = "true"

from app.deps import explain_cache, limiter, scan_cache  # noqa: E402


@pytest.fixture(autouse=True)
def reset_runtime_state():
    """Bersihkan rate limit dan cache agar setiap tes berdiri sendiri."""
    limiter.reset()
    scan_cache.clear()
    explain_cache.clear()

    yield

    limiter.reset()
    scan_cache.clear()
    explain_cache.clear()
