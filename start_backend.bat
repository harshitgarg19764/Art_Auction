@echo off
echo ========================================
echo        kunstHaus Application Startup
echo ========================================
echo.
echo Step 1: Initializing database...
cd backend
python app.py init-db
echo.
echo Step 2: Starting backend server...
echo Backend will be available at: http://localhost:5000
echo Frontend files are in: ../kunsthaus-canvas-bids/
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.
python app.py
echo.
echo Server stopped.
pause