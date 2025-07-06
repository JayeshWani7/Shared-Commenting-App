# Comment App Deployment Test Script for Windows

Write-Host "🧪 Testing Comment App Deployment..." -ForegroundColor Cyan

# Test backend health
Write-Host "Testing backend health..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend health check passed" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend health check failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend health check failed: $_" -ForegroundColor Red
    exit 1
}

# Test frontend
Write-Host "Testing frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend is not accessible" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Frontend is not accessible: $_" -ForegroundColor Red
    exit 1
}

# Test database connection
Write-Host "Testing database connection..." -ForegroundColor Yellow
try {
    $result = docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Database connection is healthy" -ForegroundColor Green
    } else {
        Write-Host "❌ Database connection failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Database connection failed: $_" -ForegroundColor Red
    exit 1
}

# Test WebSocket connection (basic test)
Write-Host "Testing WebSocket endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/socket.io/?EIO=4&transport=polling" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ WebSocket endpoint is accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ WebSocket endpoint is not accessible" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ WebSocket endpoint is not accessible: $_" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 All tests passed! Your Comment App is ready to use." -ForegroundColor Green
Write-Host ""
Write-Host "📝 Test Results:" -ForegroundColor Cyan
Write-Host "   ✅ Backend API: http://localhost:3001/api"
Write-Host "   ✅ Frontend: http://localhost:3000"
Write-Host "   ✅ Database: Connected"
Write-Host "   ✅ WebSocket: Connected"
Write-Host ""
Write-Host "🔗 Try these URLs:" -ForegroundColor Cyan
Write-Host "   - App: http://localhost:3000"
Write-Host "   - API Health: http://localhost:3001/api/health"
Write-Host "   - API Docs: http://localhost:3001/api/docs"
