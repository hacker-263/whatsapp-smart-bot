#!/bin/bash

# 🚀 Smart WhatsApp Bot - Quick Start Script
# This script automates the local setup process

set -e

echo "╔════════════════════════════════════════════════════════╗"
echo "║   Smart WhatsApp Bot - Quick Start Setup Script        ║"
echo "║   v2.0 - Production Ready                              ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check prerequisites
echo "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo "${RED}❌ Docker not found. Please install Docker Desktop${NC}"
    exit 1
fi
echo "${GREEN}✅ Docker found${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo "${RED}❌ Docker Compose not found. Please install Docker Compose${NC}"
    exit 1
fi
echo "${GREEN}✅ Docker Compose found${NC}"

if ! command -v node &> /dev/null; then
    echo "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi
echo "${GREEN}✅ Node.js found ($(node -v))${NC}"

if ! command -v npm &> /dev/null; then
    echo "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi
echo "${GREEN}✅ npm found ($(npm -v))${NC}"

echo ""

# Create environment file
echo "${BLUE}⚙️  Setting up environment...${NC}"

if [ ! -f .env.local ]; then
    echo "Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "${GREEN}✅ .env.local created${NC}"
    echo "${YELLOW}⚠️  Please edit .env.local if needed${NC}"
else
    echo "${GREEN}✅ .env.local already exists${NC}"
fi

echo ""

# Start Docker services
echo "${BLUE}🐳 Starting Docker services...${NC}"

docker-compose down 2>/dev/null || true
docker-compose up -d

echo "${YELLOW}⏳ Waiting for services to be healthy...${NC}"
sleep 10

# Check service health
echo "${BLUE}🏥 Checking service health...${NC}"

if ! docker-compose ps | grep -q "postgres.*healthy"; then
    echo "${RED}❌ PostgreSQL not healthy${NC}"
    docker-compose logs postgres
    exit 1
fi
echo "${GREEN}✅ PostgreSQL is healthy${NC}"

if ! docker-compose ps | grep -q "redis.*healthy"; then
    echo "${RED}❌ Redis not healthy${NC}"
    docker-compose logs redis
    exit 1
fi
echo "${GREEN}✅ Redis is healthy${NC}"

echo "${GREEN}✅ pgAdmin accessible at http://localhost:5050${NC}"

echo ""

# Install dependencies
echo "${BLUE}📦 Installing dependencies...${NC}"

npm install
echo "${GREEN}✅ Root dependencies installed${NC}"

cd whatsapp-bot
npm install
echo "${GREEN}✅ Bot dependencies installed${NC}"

cd ..

echo ""

# Create logs directory
mkdir -p logs

echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║            ✅ Setup Complete!                          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

echo "${BLUE}📚 Next Steps:${NC}"
echo ""
echo "1. ${YELLOW}Start the Web Platform:${NC}"
echo "   npm run dev"
echo "   → Open http://localhost:5173"
echo ""
echo "2. ${YELLOW}In another terminal, start the Bot:${NC}"
echo "   cd whatsapp-bot"
echo "   npm start"
echo "   → Scan QR code with WhatsApp"
echo ""
echo "3. ${YELLOW}In another terminal, start the API:${NC}"
echo "   cd whatsapp-bot"
echo "   npm run api"
echo "   → API available at http://localhost:4001"
echo ""

echo "${BLUE}🔗 Service URLs:${NC}"
echo "   Web Platform:  http://localhost:5173"
echo "   Bot Health:    http://localhost:3001/health"
echo "   API Health:    http://localhost:4001/health"
echo "   pgAdmin:       http://localhost:5050 (admin@example.com / admin)"
echo "   PostgreSQL:    localhost:5432"
echo "   Redis:         localhost:6379"
echo ""

echo "${BLUE}📖 Documentation:${NC}"
echo "   • LOCAL_SETUP_GUIDE.md - Docker & local setup"
echo "   • BOT_FEATURES.md - All bot features"
echo "   • API_DOCUMENTATION.md - API endpoints"
echo "   • FEATURES_COMPLETE.md - Complete feature list"
echo ""

echo "${GREEN}🎉 Your Smart WhatsApp Bot is ready!${NC}"
echo ""
