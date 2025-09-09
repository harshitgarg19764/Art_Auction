@echo off
echo ========================================
echo    Kunsthaus Canvas Bids - Full Stack
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    pause
    exit /b 1
)

echo Starting Kunsthaus Canvas Bids Application...
echo.

REM Check if virtual environment exists
if not exist "backend\venv" (
    echo Creating Python virtual environment...
    cd backend
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
    cd ..
)

REM Activate virtual environment and install dependencies
echo Setting up backend dependencies...
cd backend
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM Start the Flask application (serves both API and frontend)
echo.
echo ========================================
echo    Application Starting...
echo ========================================
echo Full Stack App: http://localhost:5000
echo API Endpoints:   http://localhost:5000/api/
echo ========================================
echo.
echo Press Ctrl+C to stop the server
echo.

python app.py

pause