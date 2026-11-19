from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.prediction import Prediction
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.services.ml_service import ml_service

def get_user_dashboard_stats(arg1, arg2):
    # Support both (db, user_id) and (user_id, db) calling conventions
    if isinstance(arg1, int):
        user_id = arg1
        db = arg2
    else:
        db = arg1
        user_id = arg2

    # Total count
    total = db.query(Prediction).filter(Prediction.user_id == user_id).count()
    positive = db.query(Prediction).filter(Prediction.user_id == user_id, Prediction.prediction_result == 1).count()
    negative = db.query(Prediction).filter(Prediction.user_id == user_id, Prediction.prediction_result == 0).count()

    # Latest prediction
    latest_obj = db.query(Prediction).filter(Prediction.user_id == user_id).order_by(desc(Prediction.created_at)).first()
    latest_summary = None
    if latest_obj:
        latest_summary = {
            "id": latest_obj.id,
            "created_at": latest_obj.created_at,
            "prediction_result": latest_obj.prediction_result,
            "classification_label": "Positive Classification" if latest_obj.prediction_result == 1 else "Negative Classification",
            "risk_level": latest_obj.risk_level,
            "glucose": latest_obj.glucose,
            "bmi": latest_obj.bmi,
            "age": latest_obj.age
        }

    # Outcome distribution
    pos_pct = round((positive / total * 100), 1) if total > 0 else 0.0
    neg_pct = round((negative / total * 100), 1) if total > 0 else 0.0

    # Monthly trends (last 6 months or all recorded)
    # Group by date formatted string
    now = datetime.now(timezone.utc)
    trends = []
    # Query past 7 days for fine-grained recent history or past weeks
    for i in range(6, -1, -1):
        target_day = (now - timedelta(days=i)).date()
        start = datetime(target_day.year, target_day.month, target_day.day, 0, 0, 0, tzinfo=timezone.utc)
        end = datetime(target_day.year, target_day.month, target_day.day, 23, 59, 59, tzinfo=timezone.utc)
        
        day_total = db.query(Prediction).filter(
            Prediction.user_id == user_id,
            Prediction.created_at >= start,
            Prediction.created_at <= end
        ).count()
        day_pos = db.query(Prediction).filter(
            Prediction.user_id == user_id,
            Prediction.prediction_result == 1,
            Prediction.created_at >= start,
            Prediction.created_at <= end
        ).count()
        trends.append({
            "date": target_day.strftime("%b %d"),
            "total": day_total,
            "positive": day_pos,
            "negative": day_total - day_pos
        })

    # Recent 5 predictions
    recents_objs = db.query(Prediction).filter(Prediction.user_id == user_id).order_by(desc(Prediction.created_at)).limit(5).all()
    recent_list = [
        {
            "id": r.id,
            "created_at": r.created_at,
            "prediction_result": r.prediction_result,
            "classification_label": "Positive Classification" if r.prediction_result == 1 else "Negative Classification",
            "risk_level": r.risk_level,
            "glucose": r.glucose,
            "bmi": r.bmi,
            "age": r.age
        }
        for r in recents_objs
    ]

    meta = ml_service.get_metadata()
    metrics = meta.get("metrics_summary", {}).get(meta.get("selected_model", ""), {})
    active_acc = metrics.get("test_accuracy", 0.7857)

    return {
        "total_predictions": total,
        "high_risk_count": positive,
        "low_risk_count": negative,
        "latest_prediction": latest_summary,
        "outcome_distribution": {
            "positive": positive,
            "negative": negative,
            "positive_percentage": pos_pct,
            "negative_percentage": neg_pct
        },
        "monthly_trends": trends,
        "recent_predictions": recent_list,
        "active_model_name": ml_service.get_model_name(),
        "active_model_accuracy": round(active_acc * 100, 2)
    }

def get_admin_dashboard_stats(db: Session):
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_preds = db.query(Prediction).count()
    pos_preds = db.query(Prediction).filter(Prediction.prediction_result == 1).count()
    neg_preds = db.query(Prediction).filter(Prediction.prediction_result == 0).count()
    total_logs = db.query(ActivityLog).count()

    # System activity trends (past 7 days)
    now = datetime.now(timezone.utc)
    activity_trends = []
    for i in range(6, -1, -1):
        target_day = (now - timedelta(days=i)).date()
        start = datetime(target_day.year, target_day.month, target_day.day, 0, 0, 0, tzinfo=timezone.utc)
        end = datetime(target_day.year, target_day.month, target_day.day, 23, 59, 59, tzinfo=timezone.utc)

        day_preds = db.query(Prediction).filter(Prediction.created_at >= start, Prediction.created_at <= end).count()
        day_users = db.query(User).filter(User.created_at >= start, User.created_at <= end).count()
        activity_trends.append({
            "date": target_day.strftime("%b %d"),
            "predictions": day_preds,
            "new_registrations": day_users
        })

    meta = ml_service.get_metadata()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_predictions": total_preds,
        "positive_classifications": pos_preds,
        "negative_classifications": neg_preds,
        "total_activity_logs": total_logs,
        "activity_trends": activity_trends,
        "model_metadata": meta
    }
