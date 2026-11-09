"""Router data contoh untuk demo dan pengujian integrasi."""

from fastapi import APIRouter, HTTPException

from app.schemas import ScanResult
from app.services.demo_data import get_demo_lesson, list_demo_lessons

router = APIRouter(prefix="/api/demo", tags=["demo"])


@router.get("", response_model=list[ScanResult])
def demo_lessons() -> list[ScanResult]:
    return list_demo_lessons()


@router.get("/{lesson_id}", response_model=ScanResult)
def demo_lesson(lesson_id: str) -> ScanResult:
    lesson = get_demo_lesson(lesson_id)
    if lesson is None:
        raise HTTPException(status_code=404, detail="Materi contoh tidak ditemukan.")
    return lesson
