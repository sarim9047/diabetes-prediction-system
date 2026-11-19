import os

class Settings:
    PROJECT_NAME: str = "Diabetes Prediction and Health Risk Assessment System"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    SECRET_KEY: str = os.getenv("SECRET_KEY", "academic-project-secret-key-diabetes-system-2026-very-secure-jwt-token")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./diabetes_app.db")
    
    # Paths
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    MODEL_PATH: str = os.path.join(BASE_DIR, "models", "diabetes_best_model.joblib")
    BASELINE_MODEL_PATH: str = os.path.join(BASE_DIR, "models", "diabetes_svm_baseline.joblib")
    METADATA_PATH: str = os.path.join(BASE_DIR, "models", "model_metadata.json")
    EVAL_RESULTS_DIR: str = os.path.join(BASE_DIR, "backend", "ml", "evaluation_results")

    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
