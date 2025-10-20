# 🚀 Quick Deploy Script for AI Financial Market Prediction System
# PowerShell version for Windows

Write-Host "🚀 AI Financial Market Prediction System - Deployment Helper" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Choose a deployment platform:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Netlify (Recommended - Unlimited bandwidth)"
Write-Host "2. Render Static Site (Same platform as backend)"
Write-Host "3. Railway (Modern platform with `$5 free credit)"
Write-Host "4. Vercel (Wait for outage to resolve)"
Write-Host "5. Build locally and test"
Write-Host ""

$choice = Read-Host "Enter your choice (1-5)"

switch ($choice) {
    "1" {
        Write-Host "📦 Deploying to Netlify..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Installing Netlify CLI..."
        npm install -g netlify-cli
        
        Write-Host ""
        Write-Host "Building the project..."
        Set-Location frontend
        npm run build
        
        Write-Host ""
        Write-Host "Deploying to Netlify..."
        netlify deploy --prod --dir=build
        
        Write-Host ""
        Write-Host "✅ Deployment complete!" -ForegroundColor Green
        Write-Host "📝 Don't forget to add REACT_APP_API_URL environment variable in Netlify dashboard"
    }
    
    "2" {
        Write-Host "📦 Setting up Render deployment..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Steps to deploy to Render:"
        Write-Host "1. Go to https://dashboard.render.com"
        Write-Host "2. Click 'New +' → 'Static Site'"
        Write-Host "3. Connect your GitHub repo"
        Write-Host "4. Use these settings:"
        Write-Host "   - Root Directory: frontend"
        Write-Host "   - Build Command: npm run build"
        Write-Host "   - Publish Directory: frontend/build"
        Write-Host "5. Add environment variable REACT_APP_API_URL"
        Write-Host ""
        Write-Host "Press Enter to open Render dashboard..."
        Read-Host
        Start-Process "https://dashboard.render.com"
    }
    
    "3" {
        Write-Host "📦 Setting up Railway deployment..." -ForegroundColor Green
        Write-Host ""
        Write-Host "Steps to deploy to Railway:"
        Write-Host "1. Go to https://railway.app"
        Write-Host "2. Sign up with GitHub"
        Write-Host "3. Click 'New Project' → 'Deploy from GitHub repo'"
        Write-Host "4. Select your repository"
        Write-Host "5. Railway will auto-detect configuration from railway.json"
        Write-Host "6. Add environment variable REACT_APP_API_URL"
        Write-Host ""
        Write-Host "Press Enter to open Railway..."
        Read-Host
        Start-Process "https://railway.app"
    }
    
    "4" {
        Write-Host "📦 Setting up Vercel deployment..." -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  Note: Vercel is currently experiencing an outage" -ForegroundColor Yellow
        Write-Host "Check status: https://www.vercel-status.com/"
        Write-Host ""
        Write-Host "When Vercel is back online:"
        Write-Host "1. Go to https://vercel.com"
        Write-Host "2. Import your GitHub repository"
        Write-Host "3. Set Root Directory to: frontend"
        Write-Host "4. Add environment variable REACT_APP_API_URL"
        Write-Host ""
        Write-Host "Press Enter to open Vercel..."
        Read-Host
        Start-Process "https://vercel.com"
    }
    
    "5" {
        Write-Host "📦 Building locally for testing..." -ForegroundColor Green
        Write-Host ""
        Set-Location frontend
        
        Write-Host "Installing dependencies..."
        npm install
        
        Write-Host ""
        Write-Host "Building the project..."
        npm run build
        
        Write-Host ""
        Write-Host "✅ Build complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "To test the build locally, run:"
        Write-Host "  npm run serve" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Then visit: http://localhost:3000" -ForegroundColor Cyan
    }
    
    default {
        Write-Host "❌ Invalid choice. Please run the script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "📚 Documentation:"
Write-Host "  - FREE_HOSTING_OPTIONS.md - All platform options"
Write-Host "  - NETLIFY_ALTERNATIVE.md - Netlify guide"
Write-Host "  - VERCEL_DEPLOYMENT_FIX.md - Vercel guide"
Write-Host "  - DEPLOYMENT_GUIDE.md - Complete guide"
Write-Host "============================================================" -ForegroundColor Cyan
