from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.schemas.dashboard import DashboardStats
from app.services.auth_service import get_current_user
from app.services.stats_service import get_user_dashboard_stats

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_dashboard_statistics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = get_user_dashboard_stats(db, current_user.id)
    return stats

@router.get("/history")
def get_dashboard_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    stats = get_user_dashboard_stats(db, current_user.id)
    return {
        "recent_predictions": stats["recent_predictions"],
        "monthly_trends": stats["monthly_trends"],
        "total_predictions": stats["total_predictions"]
    }
