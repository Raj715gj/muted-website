#!/usr/bin/env pwsh
# Quick Setup Script - Connect Backend URL

Write-Host "=====================================", "`n", -ForegroundColor Green
Write-Host "MUTED WEBSITE - Backend Connection Setup", "`n", -ForegroundColor Green
Write-Host "=====================================", "`n" -ForegroundColor Green

Write-Host "Paste your Replit URL (from Replit dashboard):" -ForegroundColor Cyan
Write-Host "Example: https://muted-website-abc123.replit.dev" -ForegroundColor Gray
$backendUrl = Read-Host "Enter Backend URL"

if (-not $backendUrl -or $backendUrl -eq "") {
    Write-Host "❌ No URL provided. Exiting.", "`n" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Backend URL: $backendUrl`n" -ForegroundColor Green

# Read current script.js
$scriptPath = "script.js"
$scriptContent = Get-Content $scriptPath -Raw

# Find and update GITHUB_PAGES_MODE
if ($scriptContent -match "const GITHUB_PAGES_MODE = true;") {
    $scriptContent = $scriptContent -replace "const GITHUB_PAGES_MODE = true;", "const GITHUB_PAGES_MODE = false;"
    Write-Host "✅ Updated: GITHUB_PAGES_MODE = false" -ForegroundColor Green
} else {
    Write-Host "❌ Could not find GITHUB_PAGES_MODE in script.js" -ForegroundColor Red
}

# Add BACKEND_URL after API_BASE definition
if ($scriptContent -match "const API_BASE = isLocalBackendPreview") {
    $newLine = "const BACKEND_URL = '$backendUrl';"
    $scriptContent = $scriptContent -replace "const API_BASE = isLocalBackendPreview([\s\S]*?)const RAZORPAY_KEY", "$&`nconst BACKEND_URL = '$backendUrl';`nlet RAZORPAY_KEY"
    Write-Host "✅ Added: BACKEND_URL = $backendUrl" -ForegroundColor Green
}

# Save updated script
Set-Content -Path $scriptPath -Value $scriptContent
Write-Host "✅ Saved: script.js`n" -ForegroundColor Green

# Git commit and push
Write-Host "Committing to GitHub..." -ForegroundColor Cyan
git add script.js
git commit -m "Connect to backend at $backendUrl"
git push origin main

Write-Host "`n✅ All done! Your website is now connected to your backend!`n" -ForegroundColor Green
Write-Host "Website: https://Raj715gj.github.io/muted-website" -ForegroundColor Yellow
Write-Host "Backend:  $backendUrl`n" -ForegroundColor Yellow
