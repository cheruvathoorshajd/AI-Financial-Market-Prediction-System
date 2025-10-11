# FinTrack GitHub Push Script
# Run this script to push your project to GitHub

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  FinTrack GitHub Push Script  " -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if git is installed
Write-Host "[1/8] Checking Git installation..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "✓ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Git is not installed. Please install Git first:" -ForegroundColor Red
    Write-Host "  https://git-scm.com/downloads" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Get GitHub username
Write-Host "[2/8] GitHub Repository Setup" -ForegroundColor Yellow
$githubUsername = Read-Host "Enter your GitHub username"
$repoName = Read-Host "Enter repository name (default: fintrack-ai)"
if ([string]::IsNullOrWhiteSpace($repoName)) {
    $repoName = "fintrack-ai"
}

Write-Host ""

# Step 3: Confirm before proceeding
Write-Host "You are about to:" -ForegroundColor Cyan
Write-Host "  - Initialize Git in this directory" -ForegroundColor White
Write-Host "  - Add all files to Git" -ForegroundColor White
Write-Host "  - Create initial commit" -ForegroundColor White
Write-Host "  - Push to: https://github.com/$githubUsername/$repoName" -ForegroundColor White
Write-Host ""
$confirm = Read-Host "Continue? (y/n)"
if ($confirm -ne 'y' -and $confirm -ne 'Y') {
    Write-Host "Cancelled." -ForegroundColor Red
    exit 0
}

Write-Host ""

# Step 4: Initialize Git
Write-Host "[3/8] Initializing Git..." -ForegroundColor Yellow
git init
Write-Host "✓ Git initialized" -ForegroundColor Green
Write-Host ""

# Step 5: Configure Git user (if not configured)
Write-Host "[4/8] Configuring Git user..." -ForegroundColor Yellow
$gitUserName = git config user.name
if ([string]::IsNullOrWhiteSpace($gitUserName)) {
    $userName = Read-Host "Enter your name for Git commits"
    git config user.name "$userName"
    Write-Host "✓ Git user.name set to: $userName" -ForegroundColor Green
} else {
    Write-Host "✓ Git user.name already set to: $gitUserName" -ForegroundColor Green
}

$gitUserEmail = git config user.email
if ([string]::IsNullOrWhiteSpace($gitUserEmail)) {
    $userEmail = Read-Host "Enter your email for Git commits"
    git config user.email "$userEmail"
    Write-Host "✓ Git user.email set to: $userEmail" -ForegroundColor Green
} else {
    Write-Host "✓ Git user.email already set to: $gitUserEmail" -ForegroundColor Green
}
Write-Host ""

# Step 6: Add all files
Write-Host "[5/8] Adding all files to Git..." -ForegroundColor Yellow
git add .
$filesAdded = git diff --cached --numstat | Measure-Object | Select-Object -ExpandProperty Count
Write-Host "✓ Added $filesAdded files" -ForegroundColor Green
Write-Host ""

# Step 7: Create initial commit
Write-Host "[6/8] Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: FinTrack AI Financial Tracker

Features:
- Real-time stock market data
- Cryptocurrency and Forex tracking
- AI-powered investment recommendations
- JWT authentication
- Premium black & white UI
- Comprehensive documentation"
Write-Host "✓ Initial commit created" -ForegroundColor Green
Write-Host ""

# Step 8: Add remote
Write-Host "[7/8] Adding GitHub remote..." -ForegroundColor Yellow
$remoteUrl = "https://github.com/$githubUsername/$repoName.git"
git remote add origin $remoteUrl
Write-Host "✓ Remote added: $remoteUrl" -ForegroundColor Green
Write-Host ""

# Step 9: Push to GitHub
Write-Host "[8/8] Pushing to GitHub..." -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT: You need to create the repository on GitHub first!" -ForegroundColor Red
Write-Host "1. Go to https://github.com/new" -ForegroundColor Cyan
Write-Host "2. Repository name: $repoName" -ForegroundColor Cyan
Write-Host "3. DO NOT initialize with README, .gitignore, or license" -ForegroundColor Cyan
Write-Host "4. Click 'Create repository'" -ForegroundColor Cyan
Write-Host ""
$ready = Read-Host "Have you created the repository on GitHub? (y/n)"

if ($ready -eq 'y' -or $ready -eq 'Y') {
    Write-Host ""
    Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
    git branch -M main
    git push -u origin main
    
    Write-Host ""
    Write-Host "================================" -ForegroundColor Green
    Write-Host "  ✓ SUCCESS!  " -ForegroundColor Green
    Write-Host "================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your repository is now on GitHub:" -ForegroundColor Cyan
    Write-Host "https://github.com/$githubUsername/$repoName" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Visit your repository URL above" -ForegroundColor White
    Write-Host "2. Add a description and topics" -ForegroundColor White
    Write-Host "3. Share with the world!" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "================================" -ForegroundColor Yellow
    Write-Host "  Setup Complete (Push Pending)  " -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Your local repository is ready!" -ForegroundColor Green
    Write-Host ""
    Write-Host "When you're ready to push:" -ForegroundColor Cyan
    Write-Host "1. Create repository on GitHub: https://github.com/new" -ForegroundColor White
    Write-Host "2. Run these commands:" -ForegroundColor White
    Write-Host "   git branch -M main" -ForegroundColor Gray
    Write-Host "   git push -u origin main" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
