@echo off
echo ========================================
echo   Heady System - Auto Start
echo ========================================
echo.

echo [1/3] Installing backend dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Backend installation failed
    pause
    exit /b 1
)

echo.
echo [2/3] Initializing database...
call npm run db:init
if %errorlevel% neq 0 (
    echo ERROR: Database initialization failed
    pause
    exit /b 1
)

echo.
echo [3/3] Starting backend server...
echo.
echo ========================================
echo   System Starting - All Automation Active
echo ========================================
echo.
call npm run dev
