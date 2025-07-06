# Comment App Production Deployment Script for Windows
Write-Host "🚀 Starting Comment App Production Deployment..." -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Docker Compose is installed
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose is not installed. Please install Docker Compose first." -ForegroundColor Red
    exit 1
}

# Load environment variables
if (Test-Path ".env.production") {
    Get-Content ".env.production" | Where-Object { $_ -match "^[^#].*=" } | ForEach-Object {
        $key, $value = $_.Split('=', 2)
        [Environment]::SetEnvironmentVariable($key, $value, "Process")
    }
    Write-Host "✅ Loaded production environment variables" -ForegroundColor Green
} else {
    Write-Host "⚠️  No .env.production file found. Using defaults." -ForegroundColor Yellow
}

# Stop any existing containers
Write-Host "🛑 Stopping existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down --remove-orphans

# Remove old images (optional - saves space)
Write-Host "🧹 Cleaning up old images..." -ForegroundColor Yellow
docker system prune -f

# Build and start services
Write-Host "🏗️  Building and starting services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up --build -d

# Wait for services to be ready
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Check service health
Write-Host "🔍 Checking service health..." -ForegroundColor Yellow

# Check database
try {
    docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres | Out-Null
    Write-Host "✅ Database is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Database is not healthy" -ForegroundColor Red
    exit 1
}

# Check backend
try {
    Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing | Out-Null
    Write-Host "✅ Backend is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not healthy" -ForegroundColor Red
    exit 1
}

# Check frontend
try {
    Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing | Out-Null
    Write-Host "✅ Frontend is healthy" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend is not healthy" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Deployment completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Application URLs:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend API: http://localhost:3001/api"
Write-Host "   Database: localhost:5432"
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker-compose -f docker-compose.prod.yml logs -f"
Write-Host "   Stop services: docker-compose -f docker-compose.prod.yml down"
Write-Host "   Update services: .\deploy.ps1"
Write-Host ""
Write-Host "🔐 Security reminders:" -ForegroundColor Yellow
Write-Host "   - Change default passwords in .env.production"
Write-Host "   - Configure SSL certificates for production"
Write-Host "   - Set up firewall rules"
Write-Host "   - Configure backups"
