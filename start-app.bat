@echo off
echo Starting Comment App with Docker...
echo.
echo Step 1: Building and starting all services...
docker-compose down
docker-compose up --build

echo.
echo All services should now be running:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:3001
echo - Database: localhost:5432
echo.
echo Press Ctrl+C to stop all services
