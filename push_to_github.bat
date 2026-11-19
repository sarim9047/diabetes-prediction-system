@echo off
setlocal enabledelayedexpansion
title Push to GitHub - Diabetes Prediction System

echo ============================================================
echo   Pushing to https://github.com/sarim9047/diabetes-prediction-system
echo ============================================================
echo.

cd /d "%~dp0"

REM Check if git is installed
where git >nul 2>&1
if errorlevel 1 (
    echo [!] Git is not yet installed on this computer.
    echo.
    echo Opening the official Git for Windows download page...
    start https://git-scm.com/download/win
    echo.
    echo ------------------------------------------------------------
    echo Quick Instructions:
    echo 1. Click "64-bit Git for Windows Setup" to download.
    echo 2. Run the installer and click "Next" -> "Install".
    echo 3. Once installation finishes, double-click this file again!
    echo ------------------------------------------------------------
    echo.
    pause
    exit /b 1
)

echo [1/5] Initializing Git repository...
if not exist ".git" (
    git init
)

echo [2/5] Configuring remote repository to:
echo       https://github.com/sarim9047/diabetes-prediction-system.git
git remote remove origin >nul 2>&1
git remote add origin https://github.com/sarim9047/diabetes-prediction-system.git

echo [3/5] Staging all project files...
git add .

echo [4/5] Committing changes...
git commit -m "Complete Diabetes Prediction & Health Risk Assessment System with Full Stack ML"

echo [5/5] Pushing to GitHub (main branch)...
git branch -M main
git push -u origin main

if errorlevel 1 (
    echo.
    echo ============================================================
    echo [!] If a GitHub login window opened in your browser,
    echo     complete the sign-in, then run this file again.
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo [SUCCESS] All files successfully pushed to:
    echo   https://github.com/sarim9047/diabetes-prediction-system
    echo ============================================================
)

echo.
pause
