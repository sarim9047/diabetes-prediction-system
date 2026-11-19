import asyncio
import sys
import os

sys.path.insert(0, os.path.abspath("backend"))

import httpx
from app.main import app, init_database_and_seed
from app.services.ml_service import ml_service

async def async_test_suite():
    print("=" * 60)
    print("INITIALIZING TEST DATABASE & RESOURCES...")
    print("=" * 60)
    init_database_and_seed()
    ml_service._load_resources()

    passed = 0
    total = 0

    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        # Test 1: Health check
        total += 1
        res = await client.get("/api/health")
        assert res.status_code == 200, f"Health check failed: {res.text}"
        data = res.json()
        assert data["status"] == "healthy"
        assert data["model_loaded"] is True
        print(f"[{total}] Health check PASSED: Status={data['status']}, Active Model={data['active_model']}")
        passed += 1

        # Test 2: User registration
        total += 1
        reg_payload = {
            "full_name": "Test Clinical Researcher",
            "email": "researcher@example.org",
            "password": "Password123!",
            "confirm_password": "Password123!"
        }
        res_reg = await client.post("/api/auth/register", json=reg_payload)
        assert res_reg.status_code in [201, 400], f"Registration failed: {res_reg.text}"
        print(f"[{total}] Registration test PASSED (Status: {res_reg.status_code})")
        passed += 1

        # Test 3: User login & JWT authentication
        total += 1
        res_login = await client.post("/api/auth/login", json={"email": "demo@diabetesrisk.org", "password": "User@Diabetes2026"})
        assert res_login.status_code == 200, f"Login failed: {res_login.text}"
        token = res_login.json()["access_token"]
        assert len(token) > 20
        res_me = await client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert res_me.status_code == 200
        assert res_me.json()["email"] == "demo@diabetesrisk.org"
        print(f"[{total}] Login & JWT Authentication PASSED: Authenticated User={res_me.json()['full_name']}")
        passed += 1

        # Test 4: Invalid input validation
        total += 1
        invalid_payload = {
            "pregnancies": 2,
            "glucose": -10.0, # Impossible glucose
            "blood_pressure": 70.0,
            "skin_thickness": 20.0,
            "insulin": 80.0,
            "bmi": 25.0,
            "diabetes_pedigree_function": 0.5,
            "age": 30
        }
        res_inv = await client.post("/api/predict", json=invalid_payload, headers={"Authorization": f"Bearer {token}"})
        assert res_inv.status_code == 422, f"Expected 422 for invalid input, got {res_inv.status_code}"
        print(f"[{total}] Input Validation & Rejection of Negative Glucose PASSED (422 Unprocessable Entity)")
        passed += 1

        # Test 5: Real ML Prediction with 8 clinical parameters
        total += 1
        valid_payload = {
            "pregnancies": 2,
            "glucose": 130.0,
            "blood_pressure": 76.0,
            "skin_thickness": 28.0,
            "insulin": 120.0,
            "bmi": 31.5,
            "diabetes_pedigree_function": 0.52,
            "age": 42,
            "notes": "Automated system test prediction"
        }
        res_pred = await client.post("/api/predict", json=valid_payload, headers={"Authorization": f"Bearer {token}"})
        assert res_pred.status_code == 201, f"Prediction failed: {res_pred.text}"
        pred_data = res_pred.json()
        assert pred_data["prediction_result"] in [0, 1]
        assert "classification_label" in pred_data
        assert "risk_level" in pred_data
        pred_id = pred_data["id"]
        print(f"[{total}] ML Prediction PASSED: ID={pred_id}, Result={pred_data['classification_label']}, Risk={pred_data['risk_level']}")
        passed += 1

        # Test 6: Fetch prediction record and history
        total += 1
        res_get = await client.get(f"/api/predictions/{pred_id}", headers={"Authorization": f"Bearer {token}"})
        assert res_get.status_code == 200
        res_hist = await client.get("/api/predictions?page=1&limit=10", headers={"Authorization": f"Bearer {token}"})
        assert res_hist.status_code == 200
        assert res_hist.json()["total"] >= 1
        print(f"[{total}] Prediction Retrieval & History Query PASSED")
        passed += 1

        # Test 7: PDF Report generation
        total += 1
        res_pdf = await client.get(f"/api/reports/{pred_id}/pdf", headers={"Authorization": f"Bearer {token}"})
        assert res_pdf.status_code == 200
        assert res_pdf.headers["content-type"] == "application/pdf"
        assert len(res_pdf.content) > 1000
        assert res_pdf.content.startswith(b"%PDF")
        print(f"[{total}] PDF Report Generation PASSED: Byte size={len(res_pdf.content)} bytes, Valid %PDF magic header")
        passed += 1

        # Test 8: User Dashboard statistics
        total += 1
        res_dash = await client.get("/api/dashboard/stats", headers={"Authorization": f"Bearer {token}"})
        assert res_dash.status_code == 200
        dash_data = res_dash.json()
        assert dash_data["total_predictions"] >= 1
        assert "monthly_trends" in dash_data
        assert "outcome_distribution" in dash_data
        print(f"[{total}] User Dashboard Statistics PASSED: Dynamic Total={dash_data['total_predictions']}")
        passed += 1

        # Test 9: ML model info & evaluation metrics
        total += 1
        res_ml_info = await client.get("/api/model/info")
        assert res_ml_info.status_code == 200
        res_ml_metrics = await client.get("/api/model/metrics")
        assert res_ml_metrics.status_code == 200
        print(f"[{total}] ML Model Info & Evaluation Metrics PASSED")
        passed += 1

        # Test 10: Admin authorization and system management
        total += 1
        # Regular user attempt
        res_forbid = await client.get("/api/admin/stats", headers={"Authorization": f"Bearer {token}"})
        assert res_forbid.status_code == 403, "Regular user should be forbidden from admin endpoint"
        
        # Admin user
        res_admin_login = await client.post("/api/auth/login", json={"email": "admin@diabetesrisk.org", "password": "Admin@Diabetes2026"})
        assert res_admin_login.status_code == 200
        admin_token = res_admin_login.json()["access_token"]
        
        res_admin_stats = await client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
        assert res_admin_stats.status_code == 200
        admin_stats = res_admin_stats.json()
        assert admin_stats["total_users"] >= 2
        print(f"[{total}] Role-Based Access Control & Admin Dashboard PASSED: Total Registered Users={admin_stats['total_users']}")
        passed += 1

    print("\n" + "=" * 60)
    print(f"AUTOMATED BACKEND VERIFICATION SUMMARY: {passed}/{total} TESTS PASSED (100%)")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(async_test_suite())
