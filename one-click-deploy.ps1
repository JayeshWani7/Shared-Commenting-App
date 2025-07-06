# One-Click Comment App Deployment for Windows
# This script will deploy the entire Comment App with notifications

Write-Host "Comment App One-Click Deployment" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Docker
try {
    docker --version | Out-Null
    Write-Host "Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "Docker is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check Docker Compose
try {
    docker-compose --version | Out-Null
    Write-Host "Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "Docker Compose is not installed!" -ForegroundColor Red
    Write-Host "Please install Docker Compose" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

# Check if Docker is running
try {
    docker ps | Out-Null
    Write-Host "Docker is running" -ForegroundColor Green
} catch {
    Write-Host "Docker is not running!" -ForegroundColor Red
    Write-Host "Please start Docker Desktop and try again" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "Setting up environment..." -ForegroundColor Yellow

# Create environment file if it doesn't exist
if (-not (Test-Path ".env.production")) {
    Write-Host "Creating .env.production file..." -ForegroundColor Cyan
    $envContent = @"
# Production Environment Variables
POSTGRES_PASSWORD=CommentApp2024!SecurePassword
JWT_SECRET=CommentApp2024VerySecureJWTSecretKeyThatIsLongAndSecure!
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
DEBUG_MODE=false
"@
    $envContent | Out-File -FilePath ".env.production" -Encoding UTF8
    Write-Host "Created .env.production with default values" -ForegroundColor Green
} else {
    Write-Host ".env.production already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "Stopping any existing services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down --remove-orphans 2>$null

Write-Host ""
Write-Host "Building and starting services..." -ForegroundColor Yellow
Write-Host "This may take a few minutes on first run..." -ForegroundColor Cyan

# Build and start services
docker-compose -f docker-compose.prod.yml up --build -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to start services!" -ForegroundColor Red
    Write-Host "Please check the logs for errors" -ForegroundColor Yellow
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host ""
Write-Host "Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 45

Write-Host ""
Write-Host "Running health checks..." -ForegroundColor Yellow

# Health checks
$healthPassed = $true

# Check database
Write-Host "Checking database..." -ForegroundColor Cyan
try {
    $dbResult = docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Database is healthy" -ForegroundColor Green
    } else {
        Write-Host "Database is not healthy" -ForegroundColor Red
        $healthPassed = $false
    }
} catch {
    Write-Host "Database health check failed" -ForegroundColor Red
    $healthPassed = $false
}

# Check backend
Write-Host "Checking backend API..." -ForegroundColor Cyan
$maxRetries = 10
$retryCount = 0
$backendHealthy = $false

while ($retryCount -lt $maxRetries -and -not $backendHealthy) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "Backend is healthy" -ForegroundColor Green
            $backendHealthy = $true
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "Backend not ready yet, retrying... ($retryCount/$maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        }
    }
}

if (-not $backendHealthy) {
    Write-Host "Backend is not healthy" -ForegroundColor Red
    $healthPassed = $false
}

# Check frontend
Write-Host "Checking frontend..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend is healthy" -ForegroundColor Green
    } else {
        Write-Host "Frontend is not healthy" -ForegroundColor Red
        $healthPassed = $false
    }
} catch {
    Write-Host "Frontend is not healthy: $_" -ForegroundColor Red
    $healthPassed = $false
}

Write-Host ""
if ($healthPassed) {
    Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "=========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Your Comment App is now running:" -ForegroundColor Green
    Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Backend API: http://localhost:3001/api" -ForegroundColor Cyan
    Write-Host "API Docs: http://localhost:3001/api/docs" -ForegroundColor Cyan
    Write-Host "Database: localhost:5432" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Features Available:" -ForegroundColor Yellow
    Write-Host "   User Authentication" 
    Write-Host "   Real-time Comments"
    Write-Host "   Nested Replies"
    Write-Host "   Live Notifications"
    Write-Host "   Notification Sounds"
    Write-Host "   Mark as Read"
    Write-Host "   Comment Navigation"
    Write-Host ""
    Write-Host "Quick Actions:" -ForegroundColor Yellow
    Write-Host "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
    Write-Host "   Stop app: docker-compose -f docker-compose.prod.yml down"
    Write-Host "   Restart: powershell -ExecutionPolicy Bypass -File one-click-deploy.ps1"
    Write-Host ""
    Write-Host "Opening your app in the browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
} else {
    Write-Host "DEPLOYMENT FAILED!" -ForegroundColor Red
    Write-Host "=========================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Some services are not healthy. Please check the logs:" -ForegroundColor Yellow
    Write-Host "docker-compose -f docker-compose.prod.yml logs" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "- Port conflicts (3000, 3001, 5432 already in use)"
    Write-Host "- Insufficient memory (need at least 4GB available)"
    Write-Host "- Network connectivity issues"
    Write-Host "- Docker Desktop not running properly"
}

Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
