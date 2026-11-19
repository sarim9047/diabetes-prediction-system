@echo off
REM ============================================================
REM  Diabetes Prediction System — Backend Startup Script
REM  Uses bundled Python runtime (no system Python required)
REM ============================================================

set PYTHON=C:\Users\sarim\.gemini\antigravity\scratch\python_runtime\python.exe
set PYTHONPATH=%~dp0backend

echo ============================================================
echo   Diabetes Prediction & Health Risk Assessment System
echo   Starting FastAPI Backend...
echo ============================================================
echo.

REM Check bundled Python
if not exist "%PYTHON%" (
    echo ERROR: Bundled Python not found at:
    echo   %PYTHON%
    echo.
    echo Please install Python 3.9+ from https://www.python.org/
    echo and add it to PATH, then update this script.
    pause
    exit /b 1
)

echo Python: %PYTHON%
echo.

REM Install/verify dependencies
echo Checking backend dependencies...
"%PYTHON%" -m pip install -r "%~dp0backend\requirements.txt" --quiet --disable-pip-version-check
echo.

REM Change to backend directory and start server
cd /d "%~dp0backend"

echo ============================================================
echo   FastAPI server starting on http://127.0.0.1:8000
echo   API Docs:  http://127.0.0.1:8000/docs
echo   Health:    http://127.0.0.1:8000/health
echo ============================================================
echo.
echo   Default Credentials:
echo   Admin : admin@diabetesrisk.org  / Admin@Diabetes2026
echo   User  : demo@diabetesrisk.org   / User@Diabetes2026
echo.
echo   Press Ctrl+C to stop the server.
echo.

"%PYTHON%" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

pause
