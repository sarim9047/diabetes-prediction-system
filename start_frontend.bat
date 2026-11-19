@echo off
REM ============================================================
REM  Diabetes Prediction System — Frontend Startup Script
REM  Uses bundled Node.js runtime
REM ============================================================

set NODE=C:\Users\sarim\.gemini\antigravity\scratch\node_runtime\node.exe
set NODE_DIR=C:\Users\sarim\.gemini\antigravity\scratch\node_runtime
set PATH=%NODE_DIR%;%PATH%

echo ============================================================
echo   Diabetes Prediction & Health Risk Assessment System
echo   Starting React Frontend (Vite Dev Server)...
echo ============================================================
echo.

REM Try system node first, fallback to bundled
where node >nul 2>&1
if errorlevel 1 (
    if not exist "%NODE%" (
        echo ERROR: Node.js not found.
        echo Please install Node.js 18+ from https://nodejs.org/
        pause
        exit /b 1
    )
    echo Using bundled Node.js: %NODE%
) else (
    set NODE=node
    echo Using system Node.js
)

cd /d "%~dp0frontend"

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing frontend dependencies (this may take a minute)...
    "%NODE%" ..\node_modules\.bin\npm install
    if errorlevel 1 (
        echo.
        echo ERROR: Failed to install npm packages.
        pause
        exit /b 1
    )
)

echo.
echo ============================================================
echo   Vite dev server starting on http://localhost:5173
echo   Make sure the backend is running on port 8000 first!
echo ============================================================
echo.
echo   Press Ctrl+C to stop.
echo.

"%NODE%" node_modules\vite\bin\vite.js

pause
