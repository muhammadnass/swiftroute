#!/bin/bash

# ============================================================
#  SwiftRoute Setup Script
#  Swift Hub Innovative Enterprise
# ============================================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}╔══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     SwiftRoute - Logistics Platform      ║${NC}"
echo -e "${BLUE}║     Swift Hub Innovative Enterprise      ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════╝${NC}"
echo ""

# ── Check prerequisites ──────────────────────────────────────
echo -e "${YELLOW}Checking prerequisites...${NC}"

check_command() {
  if ! command -v "$1" &>/dev/null; then
    echo -e "${RED}✗ $1 is not installed. Please install it first.${NC}"
    exit 1
  else
    echo -e "${GREEN}✓ $1 found${NC}"
  fi
}

check_command node
check_command npm
check_command psql

NODE_VERSION=$(node -v | cut -d. -f1 | tr -d 'v')
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}✗ Node.js 18+ required (found $(node -v))${NC}"
  exit 1
fi

echo ""

# ── Backend Setup ────────────────────────────────────────────
echo -e "${YELLOW}Setting up backend...${NC}"
cd backend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ Created backend/.env from .env.example${NC}"
  echo -e "${YELLOW}  ⚠  Edit backend/.env with your database credentials before continuing${NC}"
  echo ""
  read -p "  Press ENTER after editing backend/.env ..."
fi

echo -e "${YELLOW}Installing backend dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma migrate deploy 2>/dev/null || npx prisma db push
echo -e "${GREEN}✓ Database schema applied${NC}"

echo -e "${YELLOW}Seeding database (37 Nigerian states + demo accounts)...${NC}"
node prisma/seed.js
echo -e "${GREEN}✓ Database seeded${NC}"

cd ..

# ── Frontend Setup ───────────────────────────────────────────
echo ""
echo -e "${YELLOW}Setting up frontend...${NC}"
cd frontend

if [ ! -f ".env.local" ]; then
  cp .env.local.example .env.local
  echo -e "${GREEN}✓ Created frontend/.env.local from .env.local.example${NC}"
  echo -e "${YELLOW}  ⚠  Add your NEXT_PUBLIC_GOOGLE_MAPS_KEY to frontend/.env.local${NC}"
fi

echo -e "${YELLOW}Installing frontend dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

cd ..

# ── Done ─────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║         Setup Complete! 🚀               ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Demo credentials:${NC}"
echo "  Admin:    admin@swiftroute.ng  /  Admin@12345"
echo "  Company:  lagos@swiftdemo.ng   /  Company@12345"
echo ""
echo -e "${BLUE}To start the servers:${NC}"
echo ""
echo "  # Terminal 1 — Backend (API)"
echo "  cd backend && npm run dev"
echo ""
echo "  # Terminal 2 — Frontend (Next.js)"
echo "  cd frontend && npm run dev"
echo ""
echo -e "${BLUE}URLs:${NC}"
echo "  Frontend:  http://localhost:3000"
echo "  Backend:   http://localhost:5000"
echo "  API Docs:  http://localhost:5000/health"
echo ""
