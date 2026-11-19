import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.services.ml_service import ml_service

# Import API routes
from app.routes.auth import router as auth_router
from app.routes.prediction import router as predict_router, predictions_router
from app.routes.report import router as report_router
from app.routes.dashboard import router as dashboard_router
from app.routes.ml import router as ml_router
from app.routes.admin import router as admin_router
from app.routes.health import router as health_router

def init_database_and_seed():
    """Initializes tables and creates seed admin & demo accounts for local evaluation."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if admin user exists
        admin_email = "admin@diabetesrisk.org"
        admin = db.query(User).filter(User.email == admin_email).first()
        if not admin:
            admin = User(
                email=admin_email,
                full_name="System Administrator (Academic)",
                hashed_password=get_password_hash("Admin@Diabetes2026"),
                role=UserRole.ADMIN.value,
                is_active=True
            )
            db.add(admin)
            db.commit()
            print("Admin account created: admin@diabetesrisk.org / Admin@Diabetes2026")

        # Check if demo user exists
        demo_email = "demo@diabetesrisk.org"
        demo_user = db.query(User).filter(User.email == demo_email).first()
        if not demo_user:
            demo_user = User(
                email=demo_email,
                full_name="Sarah Jenkins (Sample Patient)",
                hashed_password=get_password_hash("User@Diabetes2026"),
                role=UserRole.USER.value,
                is_active=True
            )
            db.add(demo_user)
            db.commit()
            print("Demo user created: demo@diabetesrisk.org / User@Diabetes2026")
    except Exception as e:
        db.rollback()
        print(f"Database seed notice: {e}")
    finally:
        db.close()

# Initialize tables & seeds on module load
init_database_and_seed()
ml_service._load_resources()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack Production-style Diabetes Prediction and Health Risk Assessment System API"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    print(f"Unhandled server error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred. Please verify your input or check server logs."}
    )

# Include routers
app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(auth_router, prefix=settings.API_PREFIX)
app.include_router(predict_router, prefix=settings.API_PREFIX)
app.include_router(predictions_router, prefix=settings.API_PREFIX)
app.include_router(report_router, prefix=settings.API_PREFIX)
app.include_router(dashboard_router, prefix=settings.API_PREFIX)
app.include_router(ml_router, prefix=settings.API_PREFIX)
app.include_router(admin_router, prefix=settings.API_PREFIX)

# Serve Frontend SPA (Production Build)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
assets_dir = os.path.join(dist_dir, "assets")

if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # Allow API, docs, openapi routes to be handled by FastAPI
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path == "openapi.json":
        return JSONResponse(status_code=404, content={"detail": f"Route '{full_path}' not found"})
    
    # Check if a specific static file was requested (e.g. favicon, vite.svg)
    if dist_dir and os.path.exists(dist_dir):
        file_path = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        index_file = os.path.join(dist_dir, "index.html")
        if os.path.exists(index_file):
            return FileResponse(index_file)
            
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_check": f"{settings.API_PREFIX}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
