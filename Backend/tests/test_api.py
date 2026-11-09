import base64

import pytest
from fastapi.testclient import TestClient

from app.config import get_settings
from app.main import app

# PNG 1x1 transparan
PNG_BASE64 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
)

client = TestClient(app)


@pytest.fixture(autouse=True)
def no_api_key(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "")
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "model" in body
    assert body["gemini_configured"] is False


def test_demo_lessons_available():
    response = client.get("/api/demo")
    assert response.status_code == 200
    lessons = response.json()
    assert len(lessons) >= 2
    assert lessons[0]["points"]


def test_demo_lesson_not_found():
    response = client.get("/api/demo/tidak-ada")
    assert response.status_code == 404
    assert "error" in response.json()


def test_scan_without_api_key_returns_friendly_error():
    response = client.post(
        "/api/scan",
        json={
            "imageBase64": PNG_BASE64,
            "mimeType": "image/png",
            "imagePreview": None,
        },
    )
    assert response.status_code == 503
    assert "Contoh Halaman" in response.json()["error"]


def test_scan_rejects_invalid_base64():
    response = client.post(
        "/api/scan",
        json={"imageBase64": "bukan-base64", "mimeType": "image/png"},
    )
    assert response.status_code == 400
    assert "error" in response.json()


def test_scan_rejects_non_image_bytes():
    fake = base64.b64encode(b"halo dunia").decode()
    response = client.post(
        "/api/scan",
        json={"imageBase64": fake, "mimeType": "image/png"},
    )
    assert response.status_code == 415


def test_explain_uses_safe_demo_fallback_without_key():
    ocr = "Matahari memanaskan air laut sehingga menguap. Uap naik ke langit."
    response = client.post(
        "/api/explain",
        json={
            "pointText": "Air laut menguap karena panas matahari.",
            "ocrText": ocr,
            "requestType": "lebih_mudah",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["text"]
    assert body["source_quote"] == "Matahari memanaskan air laut sehingga menguap."
    assert body["is_valid_quote"] is True


def test_explain_requires_text():
    response = client.post(
        "/api/explain",
        json={"pointText": "Poin", "ocrText": "", "requestType": "lebih_mudah"},
    )
    assert response.status_code == 400


def test_scan_success_validates_quotes_and_caches(monkeypatch):
    monkeypatch.setenv("GEMINI_API_KEY", "test-key")
    get_settings.cache_clear()

    calls = {"count": 0}

    def fake_generate_scan(image_bytes: bytes, mime_type: str) -> dict:
        calls["count"] += 1
        ocr = "Matahari memanaskan air laut sehingga air menguap. Uap naik ke langit."
        return {
            "title": "Siklus Air",
            "ocr_text": ocr,
            "points": [
                {
                    "order": 1,
                    "text": "Air laut menguap karena panas matahari.",
                    "analogy": "Seperti air panas yang beruap.",
                    "source_quote": "Matahari memanaskan air laut sehingga air menguap.",
                },
                {
                    "order": 2,
                    "text": "Poin yang tidak ada di buku.",
                    "analogy": None,
                    "source_quote": "Kalimat yang tidak ada di halaman.",
                },
            ],
            "glossary": [
                {
                    "term": "Evaporasi",
                    "meaning": "Air berubah menjadi uap.",
                    "source_quote": "air menguap",
                }
            ],
            "flashcards": [],
            "readable": True,
        }

    monkeypatch.setattr("app.routers.scan.generate_scan", fake_generate_scan)

    payload = {
        "imageBase64": PNG_BASE64,
        "mimeType": "image/png",
        "imagePreview": "data:image/png;base64,abc",
    }

    first = client.post("/api/scan", json=payload)
    assert first.status_code == 200
    body = first.json()
    assert body["title"] == "Siklus Air"
    assert body["points"][0]["is_valid_quote"] is True
    assert body["points"][1]["is_valid_quote"] is False
    assert body["image_preview"] == "data:image/png;base64,abc"
    assert body["id"].startswith("scan-")

    second = client.post("/api/scan", json=payload)
    assert second.status_code == 200
    assert calls["count"] == 1  # hasil kedua diambil dari cache

