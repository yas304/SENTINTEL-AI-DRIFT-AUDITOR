@echo off
echo ========================================
echo    SentinelAI - Full Stack Startup
echo ========================================
echo.
echo Starting both backend and frontend...
echo.

:: Start backend in new window
start "SentinelAI Backend" cmd /k "%~dp0start-backend.bat"

:: Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

:: Start frontend in new window
start "SentinelAI Frontend" cmd /k "%~dp0start-frontend.bat"

echo.
echo ========================================
echo    Servers starting in new windows
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:3000
echo API Docs: http://localhost:8000/docs
echo.
echo Close this window when done.
pause
