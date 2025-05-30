@echo off
echo Starting Tyson's Tales...
echo.

echo Starting backend server...
start cmd /k "cd backend && npm start"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak > nul

echo Starting frontend...
start cmd /k "cd frontend && npm start"

echo.
echo Tyson's Tales is starting up!
echo The application will open in your browser automatically.
echo.
echo Backend running on: http://localhost:5000
echo Frontend running on: http://localhost:3000
echo.
pause 