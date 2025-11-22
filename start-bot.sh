#!/bin/bash

# Smart WhatsApp Bot v2.0 - Start Script
# Works on Windows (Git Bash), Linux, and macOS

echo ""
echo "╔═════════════════════════════════════════════════════════╗"
echo "║   🤖 SMART WHATSAPP BOT v2.0 - STARTUP SCRIPT         ║"
echo "╚═════════════════════════════════════════════════════════╝"
echo ""

# Navigate to bot directory
cd whatsapp-bot 2>/dev/null || {
    echo "❌ Error: whatsapp-bot directory not found!"
    echo "Make sure you're running this from the project root."
    exit 1
}

echo "📦 Checking dependencies..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📥 Installing dependencies... (this may take a moment)"
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Error: Failed to install dependencies"
        exit 1
    fi
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "🔍 Checking configuration..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Configuration file (.env) not found!"
    echo "Creating from template..."
    cp .env.example .env 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo "✅ Configuration file created at .env"
        echo ""
        echo "📝 Please edit .env and set your ADMIN_PHONE number"
        echo "   (Format: 263771234567 without + or 00)"
        echo ""
        echo "Then run this script again."
        exit 0
    else
        echo "❌ Error: Could not create .env file"
        exit 1
    fi
fi

echo "✅ Configuration file found"

echo ""
echo "🚀 Starting Smart WhatsApp Bot..."
echo ""
echo "═════════════════════════════════════════════════════════"
echo ""

# Start the bot
npm start

# If bot exits
echo ""
echo "═════════════════════════════════════════════════════════"
echo "⏹️  Bot stopped"
echo ""
echo "To restart, run this script again or use:"
echo "  cd whatsapp-bot && npm start"
echo ""
