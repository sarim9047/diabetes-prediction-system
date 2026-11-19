import pytest
from fastapi.testclient import TestClient
from app.main import app, init_database_and_seed
from app.core.database import SessionLocal, Base, engine
from app.models.user import User, UserRole
from app.models.prediction import Prediction

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    init_database_and_seed()
    yield

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "active_model" in data

def test_user_registration_and_login():
    reg_payload = {
        "full_name": "Test Clinical Researcher",
        "email": "researcher@example.org",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    # Register
    res_reg = client.post("/api/auth/register", json=reg_payload)
    assert res_reg.status_code in [201, 400] # 201 or already exists
    
    # Login
    login_payload = {
        "email": "researcher@example.org",
        "password": "Password123!"
    }
    res_login = client.post("/api/auth/login", json=login_payload)
    assert res_login.status_code == 200
    data = res_login.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "researcher@example.org"

def test_auth_me():
    # Login with demo user
    res_login = client.post("/api/auth/login", json={"email": "demo@diabetesrisk.org", "password": "User@Diabetes2026"})
    assert res_login.status_code == 200
    token = res_login.json()["access_token"]

    # Call /auth/me
    res_me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "demo@diabetesrisk.org"

def test_prediction_invalid_input():
    # Login
    res_login = client.post("/api/auth/login", json={"email": "demo@diabetesrisk.org", "password": "User@Diabetes2026"})
    token = res_login.json()["access_token"]

    # Test negative or zero glucose (physiologically impossible)
    invalid_payload = {
        "pregnancies": 2,
        "glucose": -5.0,  # Invalid
        "blood_pressure": 70.0,
        "skin_thickness": 20.0,
        "insulin": 80.0,
        "bmi": 25.0,
        "diabetes_pedigree_function": 0.5,
        "age": 30
    }
    res = client.post("/api/predict", json=invalid_payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 422 # Unprocessable Entity

def test_prediction_valid_input():
    res_login = client.post("/api/auth/login", json={"email": "demo@diabetesrisk.org", "password": "User@Diabetes2026"})
    token = res_login.json()["access_token"]

    valid_payload = {
        "pregnancies": 1,
        "glucose": 115.0,
        "blood_pressure": 72.0,
        "skin_thickness": 22.0,
        "insulin": 85.0,
        "bmi": 26.4,
        "diabetes_pedigree_function": 0.35,
        "age": 28,
        "notes": "Routine pre-employment screening test"
    }
    res = client.post("/api/predict", json=valid_payload, headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 201
    data = res.json()
    assert "prediction_result" in data
    assert data["prediction_result"] in [0, 1]
    assert "classification_label" in data
    assert "risk_level" in data
    assert "medical_disclaimer" in data
    assert "id" in data

    # Test fetching the created prediction
    pred_id = data["id"]
    res_get = client.get(f"/api/predictions/{pred_id}", headers={"Authorization": f"Bearer {token}"})
    assert res_get.status_code == 200
    assert res_get.json()["id"] == pred_id

    # Test PDF report generation
    res_pdf = client.get(f"/api/reports/{pred_id}/pdf", headers={"Authorization": f"Bearer {token}"})
    assert res_pdf.status_code == 200
    assert res_pdf.headers["content-type"] == "application/pdf"
    assert len(res_pdf.content) > 1000 # Valid non-empty PDF binary

def test_admin_authorization_restrictions():
    # Regular user attempting admin endpoint
    res_user = client.post("/api/auth/login", json={"email": "demo@diabetesrisk.org", "password": "User@Diabetes2026"})
    user_token = res_user.json()["access_token"]

    res_forbidden = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {user_token}"})
    assert res_forbidden.status_code == 403

    # Admin user accessing admin endpoint
    res_admin = client.post("/api/auth/login", json={"email": "admin@diabetesrisk.org", "password": "Admin@Diabetes2026"})
    admin_token = res_admin.json()["access_token"]

    res_admin_stats = client.get("/api/admin/stats", headers={"Authorization": f"Bearer {admin_token}"})
    assert res_admin_stats.status_code == 200
    admin_data = res_admin_stats.json()
    assert "total_users" in admin_data
    assert "total_predictions" in admin_data

def test_ml_endpoints():
    res_info = client.get("/api/model/info")
    assert res_info.status_code == 200
    data_info = res_info.json()
    assert "selected_model" in data_info
    assert "dataset_info" in data_info
    assert "educational_guides" in data_info

    res_metrics = client.get("/api/model/metrics")
    assert res_metrics.status_code == 200
    data_metrics = res_metrics.json()
    assert "metrics_summary" in data_metrics
