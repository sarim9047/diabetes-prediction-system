from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.prediction import Prediction
from app.services.auth_service import get_current_user
from app.services.report_service import generate_prediction_pdf

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/{id}/pdf")
def download_pdf_report(
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

    # Ownership check
    if prediction.user_id != current_user.id and current_user.role != UserRole.ADMIN.value:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to access this report."
        )

    # Patient record
    patient = db.query(User).filter(User.id == prediction.user_id).first()

    pdf_buffer = generate_prediction_pdf(prediction, patient or current_user)
    filename = f"Diabetes_Screening_Report_DPA_2026_{prediction.id:05d}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={filename}",
            "Cache-Control": "no-cache"
        }
    )
