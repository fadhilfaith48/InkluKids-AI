"""Router health check untuk memastikan backend hidup dan terkonfigurasi."""

from fastapi import APIRouter

from app.config import get_settings
from app.schemas import HealthResponse

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        model=settings.gemini_model,
        gemini_configured=settings.gemini_enabled,
        demo_fallback=settings.enable_demo_fallback,
    )
