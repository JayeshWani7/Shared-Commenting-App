@echo off
REM Comment App Setup Script for Windows
echo 🚀 Setting up Comment App...

REM Create environment files
echo 📝 Creating environment files...
if not exist backend\.env (
    copy backend\.env.example backend\.env
)
if not exist frontend\.env.local (
    copy frontend\.env.local.example frontend\.env.local
)

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Backend dependency installation failed
    pause
    exit /b 1
)

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd ..\frontend
call npm install
if %ERRORLEVEL% neq 0 (
    echo ❌ Frontend dependency installation failed
    pause
    exit /b 1
)

REM Go back to root
cd ..

echo ✅ Setup complete!
echo.
echo To run the application:
echo 1. Start with Docker: docker-compose up --build
echo 2. Or run development servers:
echo    - Backend: cd backend && npm run start:dev
echo    - Frontend: cd frontend && npm run dev
echo.
echo Access the application at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo - API Documentation: http://localhost:3001/api

pause
