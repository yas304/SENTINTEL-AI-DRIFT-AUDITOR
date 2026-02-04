@echo off
echo ========================================
echo    SentinelAI - Starting Frontend
echo ========================================
echo.

cd /d "%~dp0frontend"

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting Vite dev server on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

npm run dev
