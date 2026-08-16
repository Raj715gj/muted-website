
# GitHub Upload Script - Run this after Git is installed!
# Change these values:
$GITHUB_USERNAME = "YOUR_GITHUB_USERNAME"  # Replace with your GitHub username
$REPO_NAME = "muted-website"

Write-Host "========================================" -ForegroundColor Green
Write-Host "GitHub Upload Helper" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Step 1: Initialize Git
Write-Host "Step 1: Initializing Git repository..." -ForegroundColor Yellow
git init
git config user.name $GITHUB_USERNAME
git config user.email "you@example.com"

# Step 2: Add files
Write-Host "Step 2: Adding all files..." -ForegroundColor Yellow
git add .

# Step 3: First commit
Write-Host "Step 3: Creating first commit..." -ForegroundColor Yellow
git commit -m "Initial commit - muted-website project"

# Step 4: Rename branch to main
Write-Host "Step 4: Setting up main branch..." -ForegroundColor Yellow
git branch -M main

# Step 5: Add remote
Write-Host "Step 5: Connecting to GitHub..." -ForegroundColor Yellow
git remote add origin "https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "NEXT STEPS:" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "1. Go to: https://github.com/new" -ForegroundColor Cyan
Write-Host "2. Create repo named: $REPO_NAME" -ForegroundColor Cyan
Write-Host "3. Come back and run: git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "Then follow the instructions that appear!" -ForegroundColor Green
Write-Host ""
