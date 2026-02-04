@echo off
echo ========================================
echo   Heady Frontend - Auto Start
echo ========================================
echo.

echo Installing frontend dependencies...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Frontend installation failed
    pause
    exit /b 1
)

echo.
echo Starting frontend server...
echo.
echo ========================================
echo   Frontend Starting
echo ========================================
echo.
call npm run dev
