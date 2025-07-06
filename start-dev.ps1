# Comment App Development Startup Script
Write-Host "Starting Comment App in Development Mode..." -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Creating database (if needed)..." -ForegroundColor Yellow
Write-Host "Please ensure PostgreSQL is running and you have created the 'comment_app' database"
Write-Host "If you haven't created it yet, you can run: CREATE DATABASE comment_app;"
Write-Host ""

Write-Host "Step 2: Starting Backend..." -ForegroundColor Yellow
Set-Location backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run start:dev"
Set-Location ..

Write-Host "Step 3: Starting Frontend..." -ForegroundColor Yellow
Set-Location frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Set-Location ..

Write-Host ""
Write-Host "Services are starting:" -ForegroundColor Green
Write-Host "- Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
