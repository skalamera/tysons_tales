@echo off
echo Installing Tyson's Tales dependencies...
echo.

echo Installing backend dependencies...
cd backend
call npm install
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Installation complete!
echo.
echo To run the application:
echo 1. Open a terminal and run: cd backend && npm start
echo 2. Open another terminal and run: cd frontend && npm start
echo 3. Open your browser to http://localhost:3000
echo.
pause 