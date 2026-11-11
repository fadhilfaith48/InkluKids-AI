"""Endpoint pemindaian halaman buku (Fitur 1)."""

from __future__ import annotations

import asyncio
import base64
import binascii
import json
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Request
from starlette.datastructures import UploadFile

from app.config import get_settings
from app.deps import enforce_rate_limit, scan_cache, sha256_hex
from app.schemas import ScanRequest, ScanResult
from app.security import AuthUser, require_user
from app.services.gemini import AIServiceError, generate_scan
from app.services.transform import UnreadablePageError, build_scan_result

router = APIRouter(prefix="/api", tags=["scan"])

VALID_MIMES = {"image/jpeg", "image/png", "image/webp"}


def _detect_mime(data: bytes) -> str | None:
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if len(data) >= 12 and data[0:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "image/webp"
    return None


def _validate_image(data: bytes, declared_mime: str) -> tuple[bytes, str]:
    settings = get_settings()

    if not data:
        raise HTTPException(status_code=400, detail="Gambar kosong. Silakan unggah foto halaman buku.")

    if len(data) > settings.max_image_bytes:
        max_mb = settings.max_image_bytes // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"Ukuran gambar terlalu besar. Maksimal {max_mb} MB ya.",
        )

    detected = _detect_mime(data)
    if detected is None:
        raise HTTPException(
            status_code=415,
            detail="Format gambar tidak dikenali. Gunakan foto JPG, PNG, atau WEBP.",
        )

    declared = (declared_mime or "").split(";")[0].strip().lower()
    if declared and declared not in VALID_MIMES:
        raise HTTPException(
            status_code=415,
            detail="Tipe gambar tidak didukung. Gunakan JPG, PNG, atau WEBP.",
        )

    return data, detected


async def _read_request(request: Request) -> tuple[bytes, str, str | None]:
    content_type = request.headers.get("content-type", "").lower()

    if content_type.startswith("application/json"):
        raw_body = await request.body()
        try:
            payload = ScanRequest.model_validate(json.loads(raw_body))
        except (json.JSONDecodeError, ValueError, TypeError):
            raise HTTPException(
                status_code=400,
                detail="Permintaan tidak valid. Sertakan gambar dalam format base64.",
            )

        try:
            image_bytes = base64.b64decode(payload.image_base64, validate=True)
        except (binascii.Error, ValueError):
            raise HTTPException(status_code=400, detail="Data gambar tidak valid.")

        return image_bytes, payload.mime_type, payload.image_preview

    if content_type.startswith("multipart/form-data"):
        form = await request.form()
        upload = form.get("file") or form.get("image")
        if not isinstance(upload, UploadFile):
            raise HTTPException(status_code=400, detail="File gambar tidak ditemukan.")

        image_bytes = await upload.read()
        preview = form.get("imagePreview")
        return (
            image_bytes,
            upload.content_type or "image/jpeg",
            preview if isinstance(preview, str) else None,
        )

    if content_type.startswith("image/"):
        image_bytes = await request.body()
        return image_bytes, content_type.split(";")[0], None

    raise HTTPException(
        status_code=415,
        detail=(
            "Format permintaan tidak didukung. Kirim JSON base64 atau unggah file gambar."
        ),
    )


@router.post("/scan", response_model=ScanResult)
async def scan_book(
    request: Request,
    user: AuthUser | None = Depends(require_user),
) -> ScanResult:
    enforce_rate_limit(request, user)
    settings = get_settings()

    content_length = request.headers.get("content-length", "")
    if content_length.isdigit() and int(content_length) > settings.max_image_bytes * 2:
        raise HTTPException(
            status_code=413,
            detail="Permintaan terlalu besar. Kompres gambar terlebih dahulu ya.",
        )

    image_bytes, declared_mime, image_preview = await _read_request(request)
    image_bytes, mime_type = _validate_image(image_bytes, declared_mime)

    image_hash = sha256_hex(image_bytes)
    cached: Any = scan_cache.get(image_hash)
    if cached is not None:
        result = ScanResult.model_validate(cached)
        result.image_preview = image_preview
        return result

    if not settings.gemini_enabled:
        raise HTTPException(
            status_code=503,
            detail=(
                "Layanan AI belum dikonfigurasi (GEMINI_API_KEY kosong). "
                "Untuk demo, gunakan tombol \"Contoh Halaman\" pada jendela pindai."
            ),
        )

    try:
        parsed = await asyncio.to_thread(generate_scan, image_bytes, mime_type)
        result = build_scan_result(parsed, image_hash=image_hash, image_preview=image_preview)
    except UnreadablePageError:
        raise HTTPException(
            status_code=422,
            detail=(
                "Foto terlihat terlalu buram, terpotong, atau bukan halaman teks "
                "pelajaran. Silakan ambil foto ulang dengan pencahayaan yang cukup."
            ),
        )
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc))

    cached_payload = result.model_dump()
    cached_payload["image_preview"] = None
    scan_cache.set(image_hash, cached_payload)

    return result
