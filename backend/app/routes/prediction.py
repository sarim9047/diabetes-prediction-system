import math
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.prediction import Prediction
from app.schemas.prediction import PredictionInput, PredictionResponse, PredictionListResponse
from app.services.auth_service import get_current_user, log_user_activity
from app.services.ml_service import ml_service

router = APIRouter(prefix="/predict", tags=["Predictions"])

DISCLAIMER_TEXT = (
    "This system provides machine-learning screening assessments for academic demonstration and research purposes only. "
    "It is NOT a medical diagnosis or diagnostic clinical tool. Please consult a qualified healthcare professional."
)

@router.post("", response_model=PredictionResponse, status_code=status.HTTP_201_CREATED)
def make_prediction(
    payload: PredictionInput,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # Predict using pre-trained model pipeline
        pred_val, class_label, risk_level, risk_score = ml_service.predict(payload.model_dump())
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error executing prediction pipeline: {str(e)}"
        )

    # Save prediction in database
    new_prediction = Prediction(
        user_id=current_user.id,
        pregnancies=payload.pregnancies,
        glucose=payload.glucose,
        blood_pressure=payload.blood_pressure,
        skin_thickness=payload.skin_thickness,
        insulin=payload.insulin,
        bmi=payload.bmi,
        diabetes_pedigree_function=payload.diabetes_pedigree_function,
        age=payload.age,
        prediction_result=pred_val,
        risk_level=risk_level,
        risk_score=risk_score,
        model_name=ml_service.get_model_name(),
        model_version=ml_service.get_model_version(),
        notes=payload.notes
    )
    db.add(new_prediction)
    db.commit()
    db.refresh(new_prediction)

    client_ip = request.client.host if request.client else "127.0.0.1"
    log_user_activity(
        db, current_user.id, "PREDICTION",
        f"Generated prediction ID {new_prediction.id} (Result: {class_label})",
        client_ip
    )

    return {
        "id": new_prediction.id,
        "user_id": new_prediction.user_id,
        "pregnancies": new_prediction.pregnancies,
        "glucose": new_prediction.glucose,
        "blood_pressure": new_prediction.blood_pressure,
        "skin_thickness": new_prediction.skin_thickness,
        "insulin": new_prediction.insulin,
        "bmi": new_prediction.bmi,
        "diabetes_pedigree_function": new_prediction.diabetes_pedigree_function,
        "age": new_prediction.age,
        "prediction_result": new_prediction.prediction_result,
        "classification_label": class_label,
        "risk_level": new_prediction.risk_level,
        "risk_score": new_prediction.risk_score,
        "model_name": new_prediction.model_name,
        "model_version": new_prediction.model_version,
        "notes": new_prediction.notes,
        "created_at": new_prediction.created_at,
        "medical_disclaimer": DISCLAIMER_TEXT
    }

# Also support /predictions as specified in Section 14
predictions_router = APIRouter(prefix="/predictions", tags=["Predictions History"])

@predictions_router.get("", response_model=PredictionListResponse)
def list_predictions(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    result: Optional[str] = Query(None, description="Filter by result: '0' (Negative) or '1' (Positive)"),
    sort: str = Query("newest", description="Sort order: 'newest' or 'oldest'"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Prediction).filter(Prediction.user_id == current_user.id)

    if result in ["0", "1"]:
        query = query.filter(Prediction.prediction_result == int(result))

    if sort == "oldest":
        query = query.order_by(asc(Prediction.created_at))
    else:
        query = query.order_by(desc(Prediction.created_at))

    total = query.count()
    pages = math.ceil(total / limit) if total > 0 else 1
    offset = (page - 1) * limit
    items = query.offset(offset).limit(limit).all()

    formatted_items = [
        {
            "id": item.id,
            "user_id": item.user_id,
            "pregnancies": item.pregnancies,
            "glucose": item.glucose,
            "blood_pressure": item.blood_pressure,
            "skin_thickness": item.skin_thickness,
            "insulin": item.insulin,
            "bmi": item.bmi,
            "diabetes_pedigree_function": item.diabetes_pedigree_function,
            "age": item.age,
            "prediction_result": item.prediction_result,
            "classification_label": "Positive Classification" if item.prediction_result == 1 else "Negative Classification",
            "risk_level": item.risk_level,
            "risk_score": item.risk_score,
            "model_name": item.model_name,
            "model_version": item.model_version,
            "notes": item.notes,
            "created_at": item.created_at,
            "medical_disclaimer": DISCLAIMER_TEXT
        }
        for item in items
    ]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "pages": pages,
        "items": formatted_items
    }

@predictions_router.get("/{id}", response_model=PredictionResponse)
def get_single_prediction(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prediction = db.query(Prediction).filter(Prediction.id == id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record #{id} was not found."
        )

    # Ownership security
    if prediction.user_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this prediction record."
        )

    return {
        "id": prediction.id,
        "user_id": prediction.user_id,
        "pregnancies": prediction.pregnancies,
        "glucose": prediction.glucose,
        "blood_pressure": prediction.blood_pressure,
        "skin_thickness": prediction.skin_thickness,
        "insulin": prediction.insulin,
        "bmi": prediction.bmi,
        "diabetes_pedigree_function": prediction.diabetes_pedigree_function,
        "age": prediction.age,
        "prediction_result": prediction.prediction_result,
        "classification_label": "Positive Classification" if prediction.prediction_result == 1 else "Negative Classification",
        "risk_level": prediction.risk_level,
        "risk_score": prediction.risk_score,
        "model_name": prediction.model_name,
        "model_version": prediction.model_version,
        "notes": prediction.notes,
        "created_at": prediction.created_at,
        "medical_disclaimer": DISCLAIMER_TEXT
    }

@predictions_router.delete("/{id}", status_code=status.HTTP_200_OK)
def delete_prediction(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    prediction = db.query(Prediction).filter(Prediction.id == id).first()
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction record #{id} was not found."
        )

    if prediction.user_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this record."
        )

    db.delete(prediction)
    db.commit()
    log_user_activity(db, current_user.id, "DELETE_PREDICTION", f"Deleted prediction record #{id}")
    return {"message": f"Prediction record #{id} successfully deleted."}
