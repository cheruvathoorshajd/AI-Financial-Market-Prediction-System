#!/bin/bash

# 🚀 Quick Deploy Script for AI Financial Market Prediction System
# This script helps you deploy to different platforms

echo "🚀 AI Financial Market Prediction System - Deployment Helper"
echo "============================================================"
echo ""
echo "Choose a deployment platform:"
echo ""
echo "1. Netlify (Recommended - Unlimited bandwidth)"
echo "2. Render Static Site (Same platform as backend)"
echo "3. Railway (Modern platform with $5 free credit)"
echo "4. Vercel (Wait for outage to resolve)"
echo "5. Build locally and test"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
  1)
    echo "📦 Deploying to Netlify..."
    echo ""
    echo "Installing Netlify CLI..."
    npm install -g netlify-cli
    
    echo ""
    echo "Building the project..."
    cd frontend
    npm run build
    
    echo ""
    echo "Deploying to Netlify..."
    netlify deploy --prod --dir=build
    
    echo ""
    echo "✅ Deployment complete!"
    echo "📝 Don't forget to add REACT_APP_API_URL environment variable in Netlify dashboard"
    ;;
    
  2)
    echo "📦 Setting up Render deployment..."
    echo ""
    echo "Steps to deploy to Render:"
    echo "1. Go to https://dashboard.render.com"
    echo "2. Click 'New +' → 'Static Site'"
    echo "3. Connect your GitHub repo"
    echo "4. Use these settings:"
    echo "   - Root Directory: frontend"
    echo "   - Build Command: npm run build"
    echo "   - Publish Directory: frontend/build"
    echo "5. Add environment variable REACT_APP_API_URL"
    echo ""
    echo "Press Enter to open Render dashboard..."
    read
    python -m webbrowser -t "https://dashboard.render.com"
    ;;
    
  3)
    echo "📦 Setting up Railway deployment..."
    echo ""
    echo "Steps to deploy to Railway:"
    echo "1. Go to https://railway.app"
    echo "2. Sign up with GitHub"
    echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
    echo "4. Select your repository"
    echo "5. Railway will auto-detect configuration from railway.json"
    echo "6. Add environment variable REACT_APP_API_URL"
    echo ""
    echo "Press Enter to open Railway..."
    read
    python -m webbrowser -t "https://railway.app"
    ;;
    
  4)
    echo "📦 Setting up Vercel deployment..."
    echo ""
    echo "⚠️  Note: Vercel is currently experiencing an outage"
    echo "Check status: https://www.vercel-status.com/"
    echo ""
    echo "When Vercel is back online:"
    echo "1. Go to https://vercel.com"
    echo "2. Import your GitHub repository"
    echo "3. Set Root Directory to: frontend"
    echo "4. Add environment variable REACT_APP_API_URL"
    echo ""
    echo "Press Enter to open Vercel..."
    read
    python -m webbrowser -t "https://vercel.com"
    ;;
    
  5)
    echo "📦 Building locally for testing..."
    echo ""
    cd frontend
    
    echo "Installing dependencies..."
    npm install
    
    echo ""
    echo "Building the project..."
    npm run build
    
    echo ""
    echo "✅ Build complete!"
    echo ""
    echo "To test the build locally, run:"
    echo "  npm run serve"
    echo ""
    echo "Then visit: http://localhost:3000"
    ;;
    
  *)
    echo "❌ Invalid choice. Please run the script again."
    exit 1
    ;;
esac

echo ""
echo "============================================================"
echo "📚 Documentation:"
echo "  - FREE_HOSTING_OPTIONS.md - All platform options"
echo "  - NETLIFY_ALTERNATIVE.md - Netlify guide"
echo "  - VERCEL_DEPLOYMENT_FIX.md - Vercel guide"
echo "  - DEPLOYMENT_GUIDE.md - Complete guide"
echo "============================================================"
