@echo off
echo ========================================
echo    Kunsthaus Backend Server
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        pause
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing/updating dependencies...
pip install -r requirements.txt

REM Start the Flask application
echo.
echo Starting Flask backend server...
echo Backend API will be available at: http://localhost:5000
echo.
python run.py

pause