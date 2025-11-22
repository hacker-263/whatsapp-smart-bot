#!/usr/bin/env pwsh
# WhatsApp Smart Bot - Windows PowerShell Quick Setup Script
# Author: Hxcker
# Date: November 22, 2025

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   WhatsApp Smart Bot - Windows Setup" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

# Check if running as Admin (helpful but not required)
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "💡 Tip: Run as Administrator for better experience" -ForegroundColor Yellow
}

# Function to check command exists
function Test-CommandExists {
    param($command)
    try {
        if (Get-Command $command -ErrorAction Stop) {
            return $true
        }
    }
    catch {
        return $false
    }
}

# [1/5] Check Node.js
Write-Host "[1/5] Checking Node.js..." -ForegroundColor Cyan
if (Test-CommandExists "node") {
    $nodeVersion = node --version
    Write-Host "✓ Node.js found: $nodeVersion" -ForegroundColor Green
}
else {
    Write-Host "✗ ERROR: Node.js not found!" -ForegroundColor Red
    Write-Host "Please install from: https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# [2/5] Check Git
Write-Host ""
Write-Host "[2/5] Checking Git..." -ForegroundColor Cyan
if (Test-CommandExists "git") {
    $gitVersion = git --version
    Write-Host "✓ Git found: $gitVersion" -ForegroundColor Green
}
else {
    Write-Host "⚠ WARNING: Git not found" -ForegroundColor Yellow
    Write-Host "Install from: https://git-scm.com/download/win" -ForegroundColor Yellow
    $response = Read-Host "Continue anyway? (Y/N)"
    if ($response -ne "Y") {
        exit 1
    }
}

# [3/5] Setup environment files
Write-Host ""
Write-Host "[3/5] Setting up environment files..." -ForegroundColor Cyan

if (-not (Test-Path ".env.local")) {
    Write-Host "Creating .env.local..." -ForegroundColor Yellow
    $envContent = @"
DEPLOYMENT_MODE=local
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_whatsapp
DB_USER=postgres
DB_PASSWORD=your-postgres-password
REDIS_HOST=localhost
REDIS_PORT=6379
BOT_PHONE=
BOT_API_PORT=4001
"@
    Set-Content -Path ".env.local" -Value $envContent
    Write-Host "✓ .env.local created. EDIT IT with your settings!" -ForegroundColor Green
}
else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

# Check bot .env
if (-not (Test-Path "whatsapp-bot\.env")) {
    Write-Host "Creating whatsapp-bot\.env..." -ForegroundColor Yellow
    $botEnvContent = @"
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
BOT_API_PORT=4001
WEBHOOK_SECRET=your-secret-key-123
BOT_API_KEY=your-api-key-123
"@
    Set-Content -Path "whatsapp-bot\.env" -Value $botEnvContent
    Write-Host "✓ whatsapp-bot\.env created" -ForegroundColor Green
}
else {
    Write-Host "✓ whatsapp-bot\.env already exists" -ForegroundColor Green
}

# [4/5] Install dependencies
Write-Host ""
Write-Host "[4/5] Installing npm dependencies..." -ForegroundColor Cyan

Write-Host "Installing root dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ ERROR: Failed to install root dependencies" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Installing bot dependencies..." -ForegroundColor Yellow
Push-Location whatsapp-bot
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ ERROR: Failed to install bot dependencies" -ForegroundColor Red
    Pop-Location
    Read-Host "Press Enter to exit"
    exit 1
}
Pop-Location
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# [5/5] Check PostgreSQL and Redis
Write-Host ""
Write-Host "[5/5] Checking additional services..." -ForegroundColor Cyan

if (Test-CommandExists "psql") {
    $pgVersion = psql --version
    Write-Host "✓ PostgreSQL found: $pgVersion" -ForegroundColor Green
    Write-Host "  Next: Setup database (see below)" -ForegroundColor Yellow
}
else {
    Write-Host "⚠ WARNING: PostgreSQL not found" -ForegroundColor Yellow
    Write-Host "  Install from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
}

if (Test-CommandExists "redis-cli") {
    $redisPing = redis-cli ping 2>$null
    if ($redisPing -eq "PONG") {
        Write-Host "✓ Redis is running" -ForegroundColor Green
    }
    else {
        Write-Host "⚠ WARNING: Redis not running" -ForegroundColor Yellow
        Write-Host "  Start with: redis-server or docker run -d -p 6379:6379 redis:latest" -ForegroundColor Yellow
    }
}
else {
    Write-Host "⚠ WARNING: Redis not found" -ForegroundColor Yellow
    Write-Host "  Option 1 - WSL: wsl && redis-server" -ForegroundColor Yellow
    Write-Host "  Option 2 - Docker: docker run -d -p 6379:6379 redis:latest" -ForegroundColor Yellow
}

# Success message
Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "Next steps:" -ForegroundColor Green
Write-Host ""
Write-Host "1. Edit .env.local with your settings:" -ForegroundColor Cyan
Write-Host "   - DB_PASSWORD: your PostgreSQL password" -ForegroundColor Gray
Write-Host "   - BOT_PHONE: your WhatsApp number (optional)" -ForegroundColor Gray
Write-Host ""

Write-Host "2. Setup Database (run in PowerShell):" -ForegroundColor Cyan
Write-Host "   psql -U postgres" -ForegroundColor Gray
Write-Host "   CREATE DATABASE smart_whatsapp;" -ForegroundColor Gray
Write-Host "   (copy content from docker/init.sql)" -ForegroundColor Gray
Write-Host ""

Write-Host "3. Start services (open 2-3 new PowerShell windows):" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Terminal 1 - Bot:" -ForegroundColor Yellow
Write-Host "   cd whatsapp-bot" -ForegroundColor Gray
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "   Terminal 2 - API:" -ForegroundColor Yellow
Write-Host "   cd whatsapp-bot" -ForegroundColor Gray
Write-Host "   npm run api:dev" -ForegroundColor Gray
Write-Host ""

Write-Host "   Terminal 3 - Frontend (optional):" -ForegroundColor Yellow
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""

Write-Host "4. Scan QR code in Terminal 1 with WhatsApp" -ForegroundColor Cyan
Write-Host ""

Write-Host "5. Send" -ForegroundColor Cyan -NoNewline
Write-Host " !help " -ForegroundColor Yellow -NoNewline
Write-Host "to bot number to test" -ForegroundColor Cyan
Write-Host ""

Write-Host "Need help? See: LOCAL_PC_SETUP_GUIDE.md" -ForegroundColor Yellow
Write-Host ""

Read-Host "Press Enter to close"
