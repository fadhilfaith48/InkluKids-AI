"""Tes pemilihan model, fallback, dan penanganan error AI."""

from __future__ import annotations

from types import SimpleNamespace

import pytest

from app.config import get_settings
from app.services import gemini
from app.services.gemini import (
    AIServiceError,
    _generate_json,
    _model_chain,
    _translate_error,
    _with_retry,
)


class FakeNotFound(Exception):
    code = 404


class FakeQuota(Exception):
    code = 429


class FakeResponse:
    text = '{"ok": true}'
    finish_reason = "STOP"
    usage_metadata = None

    def __init__(self, text: str = '{"ok": true}', finish_reason: str = "STOP") -> None:
        self.text = text
        self.finish_reason = finish_reason
        self.candidates = [SimpleNamespace(finish_reason=finish_reason)]


class FakeModels:
    def __init__(self, failing: dict[str, Exception]) -> None:
        self.failing = failing
        self.tried: list[str] = []
        self.configs: list[object] = []
        self.responses: list[FakeResponse] = []

    def generate_content(self, model: str, **kwargs):  # noqa: ANN001
        self.tried.append(model)
        if "config" in kwargs:
            self.configs.append(kwargs["config"])
        error = self.failing.get(model)
        if error is not None:
            raise error
        if self.responses:
            return self.responses.pop(0)
        return FakeResponse()


def _client_with(failing: dict[str, Exception]) -> tuple[SimpleNamespace, FakeModels]:
    models = FakeModels(failing)
    return SimpleNamespace(models=models), models


def test_model_chain_has_unique_fallbacks():
    settings = get_settings()
    chain = _model_chain(settings.gemini_model)

    assert chain[0] == settings.gemini_model
    assert len(chain) == len(set(chain))
    assert settings.text_model in chain or chain[0] == settings.text_model


def test_fallback_when_model_is_unavailable(monkeypatch):
    settings = get_settings()
    client, models = _client_with({settings.gemini_model: FakeNotFound("not found")})
    monkeypatch.setattr(gemini, "_get_client", lambda: client)

    result = _generate_json(
        ["halo"], max_output_tokens=16, task="scan", models=_model_chain(settings.gemini_model)
    )

    assert result == {"ok": True}
    assert models.tried[0] == settings.gemini_model
    assert len(models.tried) == 2  # model utama + satu cadangan


def test_no_fallback_on_quota_error(monkeypatch):
    settings = get_settings()
    client, models = _client_with({settings.gemini_model: FakeQuota("quota")})
    monkeypatch.setattr(gemini, "_get_client", lambda: client)

    with pytest.raises(AIServiceError) as excinfo:
        _generate_json(
            ["halo"],
            max_output_tokens=16,
            task="scan",
            models=_model_chain(settings.gemini_model),
        )

    assert models.tried == [settings.gemini_model]  # tidak mencoba cadangan
    assert "Kuota" in str(excinfo.value)
    assert excinfo.value.retryable is False


def test_quota_error_is_not_retried():
    calls = {"count": 0}

    def call():
        calls["count"] += 1
        raise AIServiceError("Kuota AI harian sudah habis.", retryable=False)

    with pytest.raises(AIServiceError):
        _with_retry(call)

    assert calls["count"] == 1  # tidak menggandakan request


def test_transient_error_is_retried():
    calls = {"count": 0}

    def call():
        calls["count"] += 1
        raise AIServiceError("Layanan AI sedang tidak dapat dihubungi.", retryable=True)

    with pytest.raises(AIServiceError):
        _with_retry(call)

    assert calls["count"] == 2


def test_text_tasks_use_text_model(monkeypatch):
    settings = get_settings()
    used: list[str] = []

    def fake_generate_json(contents, max_output_tokens, task, models):  # noqa: ANN001
        used.append(models[0])
        return {"text": "ok", "source_quote": "ok"}

    monkeypatch.setattr(gemini, "_generate_json", fake_generate_json)

    gemini.generate_explanation("Poin", "Teks halaman", "lebih_mudah")
    gemini.generate_flashcard("Air", "Teks halaman")

    assert used == [settings.text_model, settings.text_model]
    assert settings.text_model != settings.gemini_model


def test_translate_error_messages():
    quota = _translate_error("scan", "m", FakeQuota("RESOURCE_EXHAUSTED"))
    assert "15.00 WIB" in str(quota)
    assert quota.retryable is False

    unauthorized = _translate_error("scan", "m", FakePermission())
    assert "Konfigurasi" in str(unauthorized)
    assert unauthorized.retryable is False


class FakePermission(Exception):
    code = 403


def test_truncated_response_is_retried_compactly(monkeypatch):
    settings = get_settings()
    client, models = _client_with({})
    models.responses = [
        FakeResponse(text='{"ok": true, "points": [1, 2', finish_reason="MAX_TOKENS"),
        FakeResponse(text='{"ok": true}', finish_reason="STOP"),
    ]
    monkeypatch.setattr(gemini, "_get_client", lambda: client)

    result = _generate_json(
        ["prompt"], max_output_tokens=8192, task="scan", models=[settings.gemini_model]
    )

    assert result == {"ok": True}
    assert len(models.tried) == 2  # percobaan kedua dengan instruksi ringkas


def test_thinking_is_disabled_in_request_config(monkeypatch):
    settings = get_settings()
    client, models = _client_with({})
    monkeypatch.setattr(gemini, "_get_client", lambda: client)

    _generate_json(
        ["prompt"], max_output_tokens=8192, task="scan", models=[settings.gemini_model]
    )

    config = models.configs[0]
    assert config.thinking_config.thinking_budget == 0
    assert config.max_output_tokens == 8192
