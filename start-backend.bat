@echo off
echo ========================================
echo    SentinelAI - Starting Backend
echo ========================================
echo.

cd /d "%~dp0backend"

:: Check if venv exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate venv
call venv\Scripts\activate.bat

:: Install dependencies
echo Installing dependencies...
pip install -r requirements.txt -q

echo.
echo Starting FastAPI server on http://localhost:8000
echo API Docs: http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

uvicorn app.main:app --reload --port 8000 --host 0.0.0.0
