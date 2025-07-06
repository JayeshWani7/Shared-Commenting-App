@echo off
echo Starting Comment App in Development Mode...
echo.

echo Step 1: Starting Backend...
cd backend
start "Backend API" cmd /k "npm run start:dev"
cd ..

echo Step 2: Starting Frontend...
cd frontend
start "Frontend" cmd /k "npm run dev"
cd ..

echo.
echo Services are starting:
echo - Backend API: http://localhost:3001
echo - Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul
