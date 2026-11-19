import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath("backend"))

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.models.prediction import Prediction
from app.services.ml_service import ml_service
from app.services.report_service import generate_prediction_pdf
from app.services.stats_service import get_user_dashboard_stats, get_admin_dashboard_stats
from app.core.security import get_password_hash, verify_password, create_access_token, decode_access_token
from app.routes.health import health_check
from app.routes.ml import get_model_information, get_model_evaluation_metrics
from app.schemas.prediction import PredictionInput

def run_system_verification():
    print("=" * 70)
    print("COMPREHENSIVE BACKEND & SYSTEM VERIFICATION SUITE")
    print("=" * 70)

    db = SessionLocal()
    tests_passed = 0
    total_tests = 0

    try:
        # 1. Health check test
        total_tests += 1
        h = health_check()
        assert h["status"] == "healthy"
        assert h["model_loaded"] is True
        print(f"[TEST 1/10] Health Check: PASSED (Model: {h['active_model']}, Status: {h['status']})")
        tests_passed += 1

        # 2. Security & Password Hashing test
        total_tests += 1
        pwd = "ClinicalSecret2026!#"
        hashed = get_password_hash(pwd)
        assert verify_password(pwd, hashed) is True
        assert verify_password("WrongPassword", hashed) is False
        print("[TEST 2/10] Cryptographic Password Hashing (Bcrypt): PASSED")
        tests_passed += 1

        # 3. JWT Access Token Creation & Validation
        total_tests += 1
        token = create_access_token(subject=101, role="admin")
        payload = decode_access_token(token)
        assert payload["sub"] == "101"
        assert payload["role"] == "admin"
        print("[TEST 3/10] JWT Token Issuance & Signature Verification: PASSED")
        tests_passed += 1

        # 4. Database User Query and Role Verification
        total_tests += 1
        admin_user = db.query(User).filter(User.email == "admin@diabetesrisk.org").first()
        demo_user = db.query(User).filter(User.email == "demo@diabetesrisk.org").first()
        assert admin_user is not None
        assert admin_user.role == UserRole.ADMIN.value
        assert demo_user is not None
        assert demo_user.role == UserRole.USER.value
        print(f"[TEST 4/10] Role-Based Access Control (Admin={admin_user.email}, User={demo_user.email}): PASSED")
        tests_passed += 1

        # 5. ML Model Inference & Preprocessing Pipeline
        total_tests += 1
        # Test case A: High risk clinical profile
        high_risk_input = {
            "pregnancies": 6,
            "glucose": 178.0,
            "blood_pressure": 82.0,
            "skin_thickness": 35.0,
            "insulin": 250.0,
            "bmi": 36.4,
            "diabetes_pedigree_function": 0.85,
            "age": 52
        }
        pred_hr, label_hr, risk_hr, score_hr = ml_service.predict(high_risk_input)
        assert pred_hr in [0, 1]
        print(f"[TEST 5/10] High-Risk Case Inference: Result={pred_hr} ({label_hr}), Risk Level='{risk_hr}', Confidence={score_hr}")

        # Test case B: Low risk clinical profile
        low_risk_input = {
            "pregnancies": 1,
            "glucose": 85.0,
            "blood_pressure": 66.0,
            "skin_thickness": 20.0,
            "insulin": 55.0,
            "bmi": 21.5,
            "diabetes_pedigree_function": 0.18,
            "age": 22
        }
        pred_lr, label_lr, risk_lr, score_lr = ml_service.predict(low_risk_input)
        assert pred_lr in [0, 1]
        print(f"            Low-Risk Case Inference:  Result={pred_lr} ({label_lr}), Risk Level='{risk_lr}', Confidence={score_lr}")
        tests_passed += 1

        # 6. Physiological Zero Imputation (Missing values handled without crashing)
        total_tests += 1
        zero_input = {
            "pregnancies": 0,       # Valid 0 pregnancies
            "glucose": 110.0,
            "blood_pressure": 70.0,
            "skin_thickness": 0.0,  # Unmeasured (zero -> imputed with training median)
            "insulin": 0.0,         # Unmeasured (zero -> imputed with training median)
            "bmi": 27.2,
            "diabetes_pedigree_function": 0.24,
            "age": 26
        }
        pred_zero, label_zero, risk_zero, score_zero = ml_service.predict(zero_input)
        assert pred_zero in [0, 1]
        print(f"[TEST 6/10] Physiological Zero Handling (Median Imputation): PASSED (Result: {label_zero})")
        tests_passed += 1

        # 7. Database Persistence of Prediction Record
        total_tests += 1
        new_pred = Prediction(
            user_id=demo_user.id,
            pregnancies=zero_input["pregnancies"],
            glucose=zero_input["glucose"],
            blood_pressure=zero_input["blood_pressure"],
            skin_thickness=zero_input["skin_thickness"],
            insulin=zero_input["insulin"],
            bmi=zero_input["bmi"],
            diabetes_pedigree_function=zero_input["diabetes_pedigree_function"],
            age=zero_input["age"],
            prediction_result=pred_zero,
            risk_level=risk_zero,
            risk_score=score_zero,
            model_name=ml_service.get_model_name(),
            model_version=ml_service.get_model_version(),
            notes="System automated test record"
        )
        db.add(new_pred)
        db.commit()
        db.refresh(new_pred)
        assert new_pred.id is not None
        print(f"[TEST 7/10] Database Prediction Persistence: PASSED (Created Prediction Record #{new_pred.id})")
        tests_passed += 1

        # 8. ReportLab PDF Generation
        total_tests += 1
        pdf_buffer = generate_prediction_pdf(new_pred, demo_user)
        pdf_bytes = pdf_buffer.getvalue()
        assert len(pdf_bytes) > 2000
        assert pdf_bytes.startswith(b"%PDF")
        print(f"[TEST 8/10] ReportLab PDF Generation: PASSED ({len(pdf_bytes)} bytes, Valid %PDF magic bytes)")
        tests_passed += 1

        # 9. Dynamic Dashboard Statistics Calculation
        total_tests += 1
        user_stats = get_user_dashboard_stats(db, demo_user.id)
        assert user_stats["total_predictions"] >= 1
        assert "outcome_distribution" in user_stats
        assert "monthly_trends" in user_stats
        admin_stats = get_admin_dashboard_stats(db)
        assert admin_stats["total_users"] >= 2
        assert admin_stats["total_predictions"] >= 1
        print(f"[TEST 9/10] Dynamic Dashboard Analytics: PASSED (User Total={user_stats['total_predictions']}, Admin Total Users={admin_stats['total_users']})")
        tests_passed += 1

        # 10. ML Model Information & Viva Guides
        total_tests += 1
        ml_info = get_model_information()
        assert "educational_guides" in ml_info
        assert "SVM" in ml_info["educational_guides"]
        assert "Overfitting" in ml_info["educational_guides"]
        ml_metrics = get_model_evaluation_metrics()
        assert "metrics_summary" in ml_metrics
        assert "Decision Tree" in ml_metrics["metrics_summary"]
        assert "Linear SVM (Baseline)" in ml_metrics["metrics_summary"]
        print("[TEST 10/10] ML Model Metadata & Viva Educational Documentation: PASSED")
        tests_passed += 1

        print("=" * 70)
        print(f"VERIFICATION SUMMARY: {tests_passed}/{total_tests} TESTS PASSED (100% SUCCESS)")
        print("=" * 70)

    finally:
        db.close()

if __name__ == "__main__":
    run_system_verification()
