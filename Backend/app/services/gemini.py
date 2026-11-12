"""Klien Gemini untuk OCR, penyederhanaan, dan penjelasan tambahan.

Gemini hanya dipanggil dari backend. API key tidak pernah keluar dari server.
"""

from __future__ import annotations

import json
import logging
import re
import time
from typing import Any

from app.config import get_settings
from app.services.source_validator import normalize_text

logger = logging.getLogger(__name__)

ALLOWED_ICONS = (
    "sun, waves, cloud, droplet, droplets, wind, leaf, heart, eye, sparkles, "
    "arrow-up, cloud-rain, umbrella"
)

SYSTEM_PROMPT_SCAN = f"""
Kamu adalah pendamping belajar untuk anak penyandang disabilitas usia sekolah
(disleksia, ADHD, tunarungu, autisme, tunanetra/low vision).
Tugasmu: membaca halaman buku pada gambar (OCR), lalu menyederhanakannya menjadi
materi belajar yang ramah dan mudah dipahami.

Aturan Ketat:
1. Gunakan HANYA informasi yang ada pada halaman buku. Jangan menambah fakta lain.
2. Tulis kalimat pendek (maksimal sekitar 12 kata), kata sehari-hari, tanpa bahasa kiasan/idiom.
3. Satu poin hanya berisi satu ide konkret. Buat 3 sampai 6 poin.
4. Untuk setiap poin, sertakan "source_quote": potongan teks ASLI dari halaman,
   disalin persis seperti yang terbaca.
5. Beri satu perumpamaan dunia nyata ("analogy") yang ramah anak bila membantu;
   jika tidak perlu, isi null.
6. Buat 2 sampai 8 istilah sulit ("glossary") beserta arti satu kalimat pendek.
7. Buat 2 sampai 4 "flashcards" untuk kata/konsep utama. Setiap flashcard berisi
   3 sampai 4 langkah visual, deskripsi isyarat dalam teks, dan contoh kalimat.
8. Nilai "icon" WAJIB salah satu dari daftar ini: {ALLOWED_ICONS}.
9. Jika gambar buram, miring parah, terpotong, atau bukan halaman teks buku,
   kembalikan "readable": false dan jangan mengarang isi.
10. Keluarkan HANYA JSON murni sesuai skema. Tanpa markdown atau teks tambahan.

Skema JSON:
{{
  "title": "string, judul topik singkat",
  "ocr_text": "string, seluruh teks yang terbaca dari halaman",
  "points": [
    {{
      "order": 1,
      "text": "string, satu ide kalimat pendek",
      "analogy": "string atau null",
      "source_quote": "string, kutipan teks asli dari ocr_text"
    }}
  ],
  "glossary": [
    {{ "term": "string", "meaning": "string", "source_quote": "string atau null" }}
  ],
  "flashcards": [
    {{
      "word": "string",
      "meaning": "string, satu kalimat sederhana",
      "steps": [
        {{ "order": 1, "icon": "string dari daftar ikon", "text": "string, satu kalimat pendek" }}
      ],
      "sign_description": "string, deskripsi gerakan isyarat dalam teks",
      "example_sentence": "string, contoh kalimat konkret",
      "source_quote": "string, kutipan teks asli"
    }}
  ],
  "readable": true
}}
""".strip()

SYSTEM_PROMPT_SIMPLIFY_TEXT = f"""
Kamu adalah pendamping belajar untuk anak penyandang disabilitas usia sekolah
(disleksia, ADHD, tunarungu, autisme, tunanetra/low vision).
Tugasmu: menyederhanakan TEKS materi yang ditulis guru menjadi materi belajar
yang ramah dan mudah dipahami.

Aturan Ketat:
1. Gunakan HANYA informasi yang ada pada teks guru. Jangan menambah fakta lain.
2. Tulis kalimat pendek (maksimal sekitar 12 kata), kata sehari-hari, tanpa bahasa kiasan/idiom.
3. Satu poin hanya berisi satu ide konkret. Buat 3 sampai 6 poin.
4. Untuk setiap poin, sertakan "source_quote": potongan teks ASLI dari teks guru,
   disalin persis seperti yang diberikan.
5. Beri satu perumpamaan dunia nyata ("analogy") yang ramah anak bila membantu;
   jika tidak perlu, isi null.
6. Buat 2 sampai 8 istilah sulit ("glossary") beserta arti satu kalimat pendek.
7. Buat 2 sampai 4 "flashcards" untuk kata/konsep utama. Setiap flashcard berisi
   3 sampai 4 langkah visual, deskripsi isyarat dalam teks, dan contoh kalimat.
8. Nilai "icon" WAJIB salah satu dari daftar ini: {ALLOWED_ICONS}.
9. Kembalikan "title" berupa judul topik singkat.
10. Keluarkan HANYA JSON murni sesuai skema. Tanpa markdown atau teks tambahan.

Skema JSON:
{{
  "title": "string, judul topik singkat",
  "points": [
    {{
      "order": 1,
      "text": "string, satu ide kalimat pendek",
      "analogy": "string atau null",
      "source_quote": "string, kutipan teks asli dari teks guru"
    }}
  ],
  "glossary": [
    {{ "term": "string", "meaning": "string", "source_quote": "string atau null" }}
  ],
  "flashcards": [
    {{
      "word": "string",
      "meaning": "string, satu kalimat sederhana",
      "steps": [
        {{ "order": 1, "icon": "string dari daftar ikon", "text": "string, satu kalimat pendek" }}
      ],
      "sign_description": "string, deskripsi gerakan isyarat dalam teks",
      "example_sentence": "string, contoh kalimat konkret",
      "source_quote": "string, kutipan teks asli"
    }}
  ]
}}
""".strip()

SYSTEM_PROMPT_EXPLAIN = """
Kamu adalah tutor pendamping belajar ramah anak.
Jelaskan ulang satu poin materi untuk anak usia sekolah berdasarkan teks halaman
buku yang diberikan.

Jenis permintaan:
- "lebih_mudah": jelaskan dengan kalimat jauh lebih sederhana dan pendek.
- "beri_contoh": berikan contoh konkret dalam kehidupan sehari-hari anak.
- "kata_sulit": jelaskan kata-kata sulit pada poin ini.

Aturan Ketat:
1. Gunakan HANYA informasi dari teks halaman yang diberikan.
2. Kalimat ramah anak, positif, dan pendek.
3. Sertakan "source_quote" berupa potongan teks asli dari teks halaman.
4. Keluarkan HANYA JSON murni tanpa markdown:
{
  "text": "string, penjelasan singkat ramah anak",
  "source_quote": "string, kutipan teks asli dari teks halaman"
}
""".strip()

SYSTEM_PROMPT_FLASHCARD = f"""
Kamu adalah pendamping belajar visual untuk anak tunarungu dan autisme.
Buat satu flashcard untuk kata abstrak yang diminta, berdasarkan teks halaman buku.

Aturan Ketat:
1. Gunakan hanya informasi dari teks halaman.
2. Arti dan contoh memakai kalimat pendek, konkret, tanpa bahasa kiasan.
3. Buat 3 sampai 5 langkah visual berurutan.
4. "icon" WAJIB salah satu dari: {ALLOWED_ICONS}.
5. Sertakan "source_quote" berupa potongan teks asli yang memuat kata tersebut.
6. Keluarkan HANYA JSON murni sesuai skema:
{{
  "word": "string",
  "meaning": "string, satu kalimat sederhana",
  "steps": [{{ "order": 1, "icon": "string", "text": "string" }}],
  "sign_description": "string, saran gerakan isyarat dalam teks",
  "example_sentence": "string",
  "source_quote": "string"
}}
""".strip()


class AIServiceError(RuntimeError):
    """Kesalahan AI yang aman ditampilkan ke pengguna.

    `retryable` menandai apakah percobaan ulang masuk akal. Kesalahan kuota
    (429), kunci tidak sah (401/403), atau permintaan salah (400) tidak diulang
    karena pasti gagal lagi dan hanya membuang kuota.
    """

    def __init__(self, message: str, retryable: bool = False) -> None:
        super().__init__(message)
        self.retryable = retryable


_client: Any = None
_client_key: str = ""


def _get_client() -> Any:
    """Buat klien google-genai sekali saja (lazy import agar /health tetap jalan)."""
    global _client, _client_key

    settings = get_settings()
    if not settings.gemini_enabled:
        raise AIServiceError("Layanan AI belum dikonfigurasi pada server.")

    if _client is None or _client_key != settings.gemini_api_key:
        try:
            from google import genai
            from google.genai import types
        except ImportError as exc:  # pragma: no cover - dependency belum terpasang
            raise AIServiceError("Pustaka AI belum terpasang pada server.") from exc

        _client = genai.Client(
            api_key=settings.gemini_api_key,
            http_options=types.HttpOptions(
                timeout=settings.request_timeout_seconds * 1000
            ),
        )
        _client_key = settings.gemini_api_key

    return _client


def _extract_json(text: str) -> dict[str, Any]:
    cleaned = (text or "").strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start == -1 or end == -1 or end <= start:
            raise AIServiceError("AI mengembalikan format yang tidak valid.")
        try:
            parsed = json.loads(cleaned[start : end + 1])
        except json.JSONDecodeError as exc:
            raise AIServiceError("AI mengembalikan format yang tidak valid.") from exc

    if not isinstance(parsed, dict):
        raise AIServiceError("AI mengembalikan format yang tidak valid.")
    return parsed


MODEL_UNAVAILABLE_MARKERS = (
    "not found",
    "not supported",
    "no longer available",
    "is not found",
    "unsupported model",
)


def _status_code(exc: Exception) -> int | None:
    """Ambil kode HTTP dari exception google-genai dengan aman."""
    for attr in ("code", "status_code"):
        value = getattr(exc, attr, None)
        if isinstance(value, int):
            return value
        if isinstance(value, str) and value.isdigit():
            return int(value)
    return None


def _error_text(exc: Exception) -> str:
    return f"{type(exc).__name__} {exc}".lower()


def _is_model_unavailable(exc: Exception) -> bool:
    """True bila error berarti model tidak ada / sudah dihentikan."""
    if _status_code(exc) == 404:
        return True
    text = _error_text(exc)
    return any(marker in text for marker in MODEL_UNAVAILABLE_MARKERS)


def _translate_error(task: str, model: str, exc: Exception) -> AIServiceError:
    """Ubah error teknis menjadi pesan ramah + tandai bisa/tidak bisa diulang."""
    code = _status_code(exc)
    text = _error_text(exc)
    _log_debug_error(task, model, exc)

    if code == 429 or "resource_exhausted" in text or "quota" in text:
        return AIServiceError(
            "Kuota AI harian sudah habis. Coba lagi setelah pukul 15.00 WIB ya.",
            retryable=False,
        )

    if (
        code in (401, 403)
        or "permission_denied" in text
        or "unauthenticated" in text
        or "api key not valid" in text
    ):
        return AIServiceError(
            "Konfigurasi layanan AI bermasalah. Hubungi pendamping ya.",
            retryable=False,
        )

    if code == 400 or "invalid_argument" in text:
        return AIServiceError(
            "Permintaan AI tidak dapat diproses. Coba lagi dengan gambar atau teks lain.",
            retryable=False,
        )

    if code == 404 or _is_model_unavailable(exc):
        return AIServiceError(
            "Model AI yang dipakai sudah tidak tersedia. Hubungi pendamping ya.",
            retryable=False,
        )

    return AIServiceError(
        "Layanan AI sedang tidak dapat dihubungi. Silakan coba lagi.",
        retryable=True,
    )


def _model_chain(primary: str) -> list[str]:
    """Model utama + cadangan, tanpa duplikat."""
    chain = [primary]
    for name in get_settings().fallback_models_list:
        if name not in chain:
            chain.append(name)
    return chain


def _build_config(types: Any, max_output_tokens: int) -> Any:
    """Konfigurasi permintaan JSON.

    Thinking dimatikan secara bawaan: OCR dan penyederhanaan tidak butuh
    penalaran panjang, dan token "berpikir" memakan jatah output sehingga JSON
    bisa terpotong pada halaman yang padat.
    """
    settings = get_settings()
    budget = settings.ai_thinking_budget
    kwargs: dict[str, Any] = {
        "response_mime_type": "application/json",
        "temperature": 0.2,
        "max_output_tokens": max_output_tokens,
    }
    if budget is not None and budget >= 0:
        kwargs["thinking_config"] = types.ThinkingConfig(thinking_budget=budget)
    return types.GenerateContentConfig(**kwargs)


def _finish_reason(response: Any) -> str:
    try:
        return str(response.candidates[0].finish_reason or "")
    except Exception:  # noqa: BLE001 - struktur balasan bisa berbeda
        return ""


def _is_truncated(response: Any) -> bool:
    return "MAX_TOKENS" in _finish_reason(response).upper()


def _compact_contents(contents: list[Any]) -> list[Any]:
    """Minta balasan yang lebih ringkas saat JSON sebelumnya terpotong."""
    note = (
        "\n\nPENTING: balasan sebelumnya terpotong karena terlalu panjang. "
        "Keluarkan JSON yang lebih ringkas: maksimal 3 poin, 2 glosarium, "
        "2 flashcard, dan potong ocr_text sampai 1.200 karakter. "
        "Jangan menulis apa pun di luar JSON."
    )
    compact = list(contents)
    if compact and isinstance(compact[0], str):
        compact[0] = compact[0] + note
    return compact


def _generate_json(
    contents: list[Any],
    max_output_tokens: int,
    task: str,
    models: list[str],
) -> dict[str, Any]:
    from google.genai import types

    client = _get_client()

    for index, model in enumerate(models):
        attempt_contents = contents
        compact_used = False

        while True:
            try:
                response = client.models.generate_content(
                    model=model,
                    contents=attempt_contents,
                    config=_build_config(types, max_output_tokens),
                )
            except Exception as exc:  # jangan bocorkan isi gambar/teks ke log
                # Model dihentikan/di-deprecate: coba cadangan berikutnya.
                if _is_model_unavailable(exc) and index < len(models) - 1:
                    logger.warning(
                        "Model %s tidak tersedia untuk tugas %s; mencoba model cadangan.",
                        model,
                        task,
                    )
                    _log_debug_error(task, model, exc)
                    break
                raise _translate_error(task, model, exc) from exc

            raw_text = getattr(response, "text", "") or ""

            if _is_truncated(response) and not compact_used:
                compact_used = True
                logger.warning(
                    "Balasan %s terpotong untuk tugas %s; mengulang dengan "
                    "instruksi ringkas.",
                    model,
                    task,
                )
                attempt_contents = _compact_contents(contents)
                continue

            try:
                parsed = _extract_json(raw_text)
            except AIServiceError as exc:
                _log_debug_summary(task, model, raw_text, None, response)
                # Format salah bisa jadi kebetulan; layak dicoba sekali lagi.
                raise AIServiceError(str(exc), retryable=True) from exc

            _log_debug_summary(task, model, raw_text, parsed, response)
            return parsed

    raise AIServiceError(
        "Semua model AI yang tersedia sedang tidak bisa dipakai. Coba lagi nanti ya.",
        retryable=False,
    )


def _log_debug_error(task: str, model: str, exc: Exception) -> None:
    """Catat jenis error AI (tanpa isi gambar/teks) bila AI_DEBUG_RAW aktif."""
    if not get_settings().ai_debug_raw:
        return

    logger.warning(
        "AI_DEBUG_RAW error task=%s model=%s type=%s code=%s",
        task,
        model,
        type(exc).__name__,
        getattr(exc, "code", None) or getattr(exc, "status_code", None),
    )


def _log_debug_summary(
    task: str,
    model: str,
    raw_text: str,
    parsed: dict[str, Any] | None,
    response: Any = None,
) -> None:
    """Catat ringkasan balasan AI.

    Sengaja TIDAK mencatat isi gambar maupun teks halaman buku demi privasi
    data anak. Hanya bentuk/struktur balasan yang dicatat.
    """
    if not get_settings().ai_debug_raw:
        return

    summary: dict[str, Any] = {
        "task": task,
        "model": model,
        "raw_chars": len(raw_text),
        "json_parsed": parsed is not None,
        "finish_reason": _finish_reason(response) if response is not None else None,
    }

    usage = getattr(response, "usage_metadata", None)
    if usage is not None:
        summary["tokens"] = {
            "prompt": getattr(usage, "prompt_token_count", None),
            "output": getattr(usage, "candidates_token_count", None),
            "thinking": getattr(usage, "thoughts_token_count", None),
        }

    if isinstance(parsed, dict):
        summary["keys"] = sorted(parsed.keys())
        summary["readable"] = parsed.get("readable")
        summary["points"] = len(parsed.get("points") or [])
        summary["glossary"] = len(parsed.get("glossary") or [])
        summary["flashcards"] = len(parsed.get("flashcards") or [])

    logger.warning("AI_DEBUG_RAW %s", json.dumps(summary, ensure_ascii=False))



def _with_retry(call) -> dict[str, Any]:
    """Ulangi hanya error sementara; error kuota/kunci langsung dilempar."""
    last_error: AIServiceError | None = None
    for attempt in range(2):
        try:
            return call()
        except AIServiceError as exc:
            if not exc.retryable:
                raise
            last_error = exc
            if attempt == 0:
                # Beri jeda singkat: 503/timeout biasanya pulih cepat.
                time.sleep(1.2)
    raise last_error or AIServiceError("Layanan AI gagal memproses permintaan.")


def generate_scan(image_bytes: bytes, mime_type: str) -> dict[str, Any]:
    from google.genai import types

    def call() -> dict[str, Any]:
        image_part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
        prompt = (
            f"{SYSTEM_PROMPT_SCAN}\n\n"
            "Silakan baca foto halaman buku berikut, sederhanakan, dan kembalikan "
            "JSON terstruktur sesuai skema."
        )
        return _generate_json(
            [prompt, image_part],
            max_output_tokens=8192,
            task="scan",
            models=_model_chain(get_settings().gemini_model),
        )

    return _with_retry(call)


def generate_text_lesson(text: str, title_hint: str = "") -> dict[str, Any]:
    """Sederhanakan teks materi guru (tanpa gambar) menjadi poin ramah anak."""
    settings = get_settings()
    text_excerpt = text[: settings.max_ocr_chars]
    title_line = f'\nJudul yang disarankan guru: "{title_hint}"' if title_hint else ""
    prompt = (
        f"{SYSTEM_PROMPT_SIMPLIFY_TEXT}{title_line}\n\n"
        f'Teks materi dari guru:\n"""\n{text_excerpt}\n"""\n\n'
        "Sederhanakan teks di atas dan kembalikan JSON terstruktur sesuai skema."
    )

    def call() -> dict[str, Any]:
        return _generate_json(
            [prompt],
            max_output_tokens=8192,
            task="simplify",
            models=_model_chain(settings.text_model),
        )

    return _with_retry(call)


def generate_explanation(
    point_text: str, ocr_text: str, request_type: str
) -> dict[str, Any]:
    settings = get_settings()
    ocr_excerpt = ocr_text[: settings.max_ocr_chars]
    prompt = (
        f"{SYSTEM_PROMPT_EXPLAIN}\n\n"
        f'Poin yang ditanyakan: "{point_text}"\n'
        f'Jenis permintaan: "{request_type}"\n'
        f'Teks halaman buku:\n"""\n{ocr_excerpt}\n"""'
    )

    def call() -> dict[str, Any]:
        return _generate_json(
            [prompt],
            max_output_tokens=1024,
            task="explain",
            models=_model_chain(settings.text_model),
        )

    return _with_retry(call)


def generate_flashcard(
    word: str, ocr_text: str, source_quote: str = ""
) -> dict[str, Any]:
    settings = get_settings()
    ocr_excerpt = ocr_text[: settings.max_ocr_chars]
    quote_line = f'\nKutipan yang disarankan: "{source_quote}"' if source_quote else ""
    prompt = (
        f"{SYSTEM_PROMPT_FLASHCARD}\n\n"
        f'Kata yang diminta: "{word}"{quote_line}\n'
        f'Teks halaman buku:\n"""\n{ocr_excerpt}\n"""'
    )

    def call() -> dict[str, Any]:
        return _generate_json(
            [prompt],
            max_output_tokens=1536,
            task="flashcard",
            models=_model_chain(settings.text_model),
        )

    return _with_retry(call)


def is_source_relevant(source_quote: str, ocr_text: str) -> bool:
    """Helper kecil untuk memastikan kutipan tidak kosong dan relevan."""
    return bool(normalize_text(source_quote)) and normalize_text(source_quote) in normalize_text(
        ocr_text
    )
