from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.prediction import Prediction
from app.models.activity_log import ActivityLog
from app.services.auth_service import get_current_admin
from app.services.stats_service import get_admin_dashboard_stats

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])

@router.get("/stats")
def get_system_admin_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    return get_admin_dashboard_stats(db)

@router.get("/users")
def list_system_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query("", description="Search by name or email"),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter((User.full_name.ilike(search_pattern)) | (User.email.ilike(search_pattern)))

    total = query.count()
    users = query.order_by(desc(User.created_at)).offset((page - 1) * limit).limit(limit).all()

    users_data = []
    for u in users:
        pred_count = db.query(Prediction).filter(Prediction.user_id == u.id).count()
        users_data.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "created_at": u.created_at,
            "total_predictions": pred_count
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "users": users_data
    }

@router.get("/predictions")
def list_all_predictions(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    query = db.query(Prediction)
    total = query.count()
    preds = query.order_by(desc(Prediction.created_at)).offset((page - 1) * limit).limit(limit).all()

    data = []
    for p in preds:
        user = db.query(User).filter(User.id == p.user_id).first()
        data.append({
            "id": p.id,
            "user_id": p.user_id,
            "user_name": user.full_name if user else "Unknown",
            "user_email": user.email if user else "Unknown",
            "glucose": p.glucose,
            "bmi": p.bmi,
            "age": p.age,
            "blood_pressure": p.blood_pressure,
            "prediction_result": p.prediction_result,
            "risk_level": p.risk_level,
            "model_name": p.model_name,
            "created_at": p.created_at
        })

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "predictions": data
    }

@router.delete("/users/{id}")
def delete_user_account(
    id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    if id == admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot delete their own active account."
        )

    target_user = db.query(User).filter(User.id == id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User #{id} not found."
        )

    db.delete(target_user)
    db.commit()
    return {"message": f"User account #{id} ({target_user.email}) successfully deleted."}
