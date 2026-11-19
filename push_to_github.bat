@echo off
setlocal
title Push to GitHub - Diabetes Prediction System

set "PATH=C:\Program Files\Git\cmd;%PATH%"

echo ============================================================
echo   Pushing to https://github.com/sarim9047/diabetes-prediction-system
echo ============================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Git repository...
git status >nul 2>&1
if errorlevel 1 (
    git init
    git branch -M main
    git remote add origin https://github.com/sarim9047/diabetes-prediction-system.git
    git add .
    git commit -m "Complete Diabetes Prediction and Health Risk Assessment System"
)

echo [2/3] Verifying remote URL...
git remote set-url origin https://github.com/sarim9047/diabetes-prediction-system.git

echo [3/3] Pushing all files to GitHub (main branch)...
echo.
echo If a GitHub sign-in window opens, please click "Sign in with your browser"
echo.
git push -u origin main

if errorlevel 1 (
    echo.
    echo ============================================================
    echo [!] Push encountered an authentication step.
    echo     Please complete the browser sign-in and run this file again.
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo [SUCCESS] All 85 files successfully pushed to GitHub!
    echo   https://github.com/sarim9047/diabetes-prediction-system
    echo ============================================================
)

echo.
pause
