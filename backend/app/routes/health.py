from fastapi import APIRouter
from datetime import datetime, timezone
from app.services.ml_service import ml_service

router = APIRouter(tags=["Health"])

@router.get("/health")
def health_check():
    meta = ml_service.get_metadata()
    return {
        "status": "healthy",
        "service": "Diabetes Prediction and Health Risk Assessment API",
        "version": "1.0.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "model_loaded": ml_service._model is not None,
        "active_model": ml_service.get_model_name(),
        "database": "SQLite (Connected)"
    }
