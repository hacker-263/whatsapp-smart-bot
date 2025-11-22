@echo off
REM WhatsApp Smart Bot - Windows Quick Setup Script
REM Author: Hxcker
REM Date: November 22, 2025

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   WhatsApp Smart Bot - Windows Setup
echo ============================================
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found! Please install from https://nodejs.org/
    pause
    exit /b 1
)
echo ✓ Node.js found: 
node --version

REM Check if Git is installed
echo.
echo [2/5] Checking Git...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Git not found. Continue anyway? (Y/N)
    set /p continue=
    if /i "!continue!"=="N" exit /b 1
) else (
    echo ✓ Git found:
    git --version
)

REM Create .env.local if not exists
echo.
echo [3/5] Setting up environment files...
if not exist .env.local (
    echo Creating .env.local...
    (
        echo DEPLOYMENT_MODE=local
        echo DB_HOST=localhost
        echo DB_PORT=5432
        echo DB_NAME=smart_whatsapp
        echo DB_USER=postgres
        echo DB_PASSWORD=your-postgres-password
        echo REDIS_HOST=localhost
        echo REDIS_PORT=6379
        echo BOT_PHONE=
        echo BOT_API_PORT=4001
    ) > .env.local
    echo ✓ .env.local created. EDIT IT with your settings!
) else (
    echo ✓ .env.local already exists
)

if not exist whatsapp-bot\.env (
    echo Creating whatsapp-bot\.env...
    cd whatsapp-bot
    (
        echo NODE_ENV=development
        echo REDIS_HOST=localhost
        echo REDIS_PORT=6379
        echo REDIS_PASSWORD=
        echo BOT_API_PORT=4001
        echo WEBHOOK_SECRET=your-secret-key-123
        echo BOT_API_KEY=your-api-key-123
    ) > .env
    cd ..
    echo ✓ whatsapp-bot\.env created
) else (
    echo ✓ whatsapp-bot\.env already exists
)

REM Install dependencies
echo.
echo [4/5] Installing npm dependencies...
echo Installing root dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install root dependencies
    pause
    exit /b 1
)

echo Installing bot dependencies...
cd whatsapp-bot
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install bot dependencies
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Dependencies installed

REM Check PostgreSQL
echo.
echo [5/5] Checking PostgreSQL...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: PostgreSQL not found!
    echo Install from: https://www.postgresql.org/download/windows/
    echo Then run the database init manually:
    echo   psql -U postgres
    echo   CREATE DATABASE smart_whatsapp;
    echo   Run migrations from: docker/init.sql
) else (
    echo ✓ PostgreSQL found:
    psql --version
    echo.
    echo Database setup: Run these commands in another terminal:
    echo   psql -U postgres
    echo   CREATE DATABASE smart_whatsapp;
    echo   (copy content from docker/init.sql)
)

REM Check Redis
echo.
echo Checking Redis...
redis-cli ping >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: Redis not running!
    echo Start Redis first:
    echo   Option 1 - WSL: wsl ^&^& redis-server
    echo   Option 2 - Docker: docker run -d -p 6379:6379 redis:latest
) else (
    echo ✓ Redis is running
)

echo.
echo ============================================
echo   Setup Complete!
echo ============================================
echo.
echo Next steps:
echo.
echo 1. Edit .env.local with your settings:
echo    - DB_PASSWORD: your PostgreSQL password
echo    - BOT_PHONE: your WhatsApp number (optional)
echo.
echo 2. Setup Database (run in new terminal):
echo    psql -U postgres
echo    CREATE DATABASE smart_whatsapp;
echo    (paste content from docker/init.sql)
echo.
echo 3. Start the bot (from project folder):
echo    Terminal 1 - Bot:
echo      cd whatsapp-bot
echo      npm run dev
echo.
echo    Terminal 2 - API:
echo      cd whatsapp-bot
echo      npm run api:dev
echo.
echo    Terminal 3 - Frontend (optional):
echo      npm run dev
echo.
echo 4. Scan QR code in Terminal 1 with WhatsApp
echo.
echo 5. Send !help to bot number to test
echo.
echo Need help? See: LOCAL_PC_SETUP_GUIDE.md
echo.
pause
