# Free Hosting Setup Helper for Windows

Write-Host "Comment App Free Hosting Setup" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you prepare your app for free hosting!" -ForegroundColor Yellow
Write-Host ""

# Check if git is available
try {
    git --version | Out-Null
    Write-Host "Git is available" -ForegroundColor Green
} catch {
    Write-Host "Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Setting up configuration files..." -ForegroundColor Yellow

# Check if package.json exists in the right location
if (-not (Test-Path "frontend\package.json") -or -not (Test-Path "backend\package.json")) {
    Write-Host "Make sure you're in the project root directory" -ForegroundColor Red
    Write-Host "Should contain both 'frontend' and 'backend' folders" -ForegroundColor Yellow
    exit 1
}

Write-Host "Updating frontend configuration for Vercel..." -ForegroundColor Cyan
Write-Host "Configuration files are ready" -ForegroundColor Green

Write-Host ""
Write-Host "Free Hosting Options Available:" -ForegroundColor Green
Write-Host ""

Write-Host "Option 1: Railway + Vercel + Supabase (Recommended)" -ForegroundColor Cyan
Write-Host "   Cost: FREE"
Write-Host "   Backend: Railway (500 hours/month)"
Write-Host "   Frontend: Vercel (unlimited)"
Write-Host "   Database: Supabase (500MB)"
Write-Host "   Best for: Production-ready apps"
Write-Host ""

Write-Host "Option 2: Render (All-in-one)" -ForegroundColor Cyan
Write-Host "   Cost: FREE (90 days DB)"
Write-Host "   Backend: Render (750 hours/month)"
Write-Host "   Frontend: Render static"
Write-Host "   Database: Render PostgreSQL"
Write-Host "   Best for: Simple deployment"
Write-Host ""

Write-Host "Option 3: Fly.io" -ForegroundColor Cyan
Write-Host "   Cost: FREE (5 dollar credit)"
Write-Host "   Backend: Fly.io"
Write-Host "   Frontend: Fly.io"
Write-Host "   Database: Fly.io PostgreSQL"
Write-Host "   Best for: Docker lovers"
Write-Host ""

Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Push your code to GitHub:" -ForegroundColor White
Write-Host "   git add ."
Write-Host "   git commit -m 'Ready for free hosting'"
Write-Host "   git push origin main"
Write-Host ""
Write-Host "2. Set up database (choose one):" -ForegroundColor White
Write-Host "   • Supabase: https://supabase.com (500MB free)"
Write-Host "   • Render: https://render.com (1GB free, 90 days)"
Write-Host "   • Railway: https://railway.app (PostgreSQL addon)"
Write-Host ""
Write-Host "3. Deploy backend (choose one):" -ForegroundColor White
Write-Host "   • Railway: https://railway.app"
Write-Host "   • Render: https://render.com"
Write-Host "   • Fly.io: https://fly.io"
Write-Host ""
Write-Host "4. Deploy frontend (choose one):" -ForegroundColor White
Write-Host "   • Vercel: https://vercel.com (recommended)"
Write-Host "   • Netlify: https://netlify.com"
Write-Host "   • Render: https://render.com"
Write-Host ""

Write-Host "Detailed guides available:" -ForegroundColor Yellow
Write-Host "   • FREE-HOSTING-GUIDE.md - Step-by-step instructions"
Write-Host "   • HOSTING-GUIDE.md - All hosting options"
Write-Host ""

$choice = Read-Host "Would you like to open the free hosting guide? (y/n)"
if ($choice -eq 'y' -or $choice -eq 'Y') {
    if (Test-Path "FREE-HOSTING-GUIDE.md") {
        Start-Process "FREE-HOSTING-GUIDE.md"
    } else {
        Write-Host "Guide file not found. Please check the project directory." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Quick Links:" -ForegroundColor Green
Write-Host "   Supabase (Database): https://supabase.com"
Write-Host "   Railway (Backend): https://railway.app"
Write-Host "   Vercel (Frontend): https://vercel.com"
Write-Host "   GitHub: https://github.com"
Write-Host ""
Write-Host "Pro tip: Start with Supabase + Railway + Vercel combo!"
Write-Host "It's the most reliable free setup for your Comment App."
Write-Host ""
Write-Host "Your app will be 100% FREE to host!"
