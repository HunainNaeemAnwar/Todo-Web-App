#!/bin/bash

# ChatKit Integration Verification Script
# This script checks if all components are properly configured

set -e

echo "🔍 ChatKit Integration Verification"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check functions
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        return 0
    else
        echo -e "${RED}✗${NC} $1 missing"
        return 1
    fi
}

check_env_var() {
    local file=$1
    local var=$2
    if grep -q "^${var}=" "$file" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $var configured in $file"
        return 0
    else
        echo -e "${YELLOW}⚠${NC} $var not found in $file"
        return 1
    fi
}

# Backend checks
echo "📦 Backend Verification"
echo "----------------------"

check_file "backend/src/api/chatkit_router.py"
check_file "backend/.env"

if [ -f "backend/.env" ]; then
    check_env_var "backend/.env" "DATABASE_URL"
    check_env_var "backend/.env" "BETTER_AUTH_SECRET"
    check_env_var "backend/.env" "CHATKIT_DOMAIN_KEY"
    
    # Check for at least one AI provider
    if grep -q "^OPENROUTER_API_KEY=" "backend/.env" 2>/dev/null || \
       grep -q "^GEMINI_API_KEY=" "backend/.env" 2>/dev/null || \
       grep -q "^GOOGLE_API_KEY=" "backend/.env" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} AI provider configured"
    else
        echo -e "${RED}✗${NC} No AI provider configured (need OPENROUTER_API_KEY or GEMINI_API_KEY)"
    fi
fi

echo ""

# Frontend checks
echo "🎨 Frontend Verification"
echo "----------------------"

check_file "frontend/src/app/api/chatkit/route.ts"
check_file "frontend/src/app/api/chatkit/session/route.ts"
check_file "frontend/src/components/chat/ChatContainer.tsx"
check_file "frontend/src/context/ChatContext.tsx"

if [ -f "frontend/.env.local" ]; then
    check_env_var "frontend/.env.local" "NEXT_PUBLIC_API_BASE_URL"
    check_env_var "frontend/.env.local" "NEXT_PUBLIC_CHATKIT_DOMAIN_KEY"
    check_env_var "frontend/.env.local" "BETTER_AUTH_SECRET"
else
    echo -e "${YELLOW}⚠${NC} frontend/.env.local not found"
fi

echo ""

# Runtime checks
echo "🚀 Runtime Verification"
echo "----------------------"

# Check if backend is running
if curl -s http://localhost:8000/api/chatkit/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Backend is running (http://localhost:8000)"
    
    # Check health endpoint response
    HEALTH=$(curl -s http://localhost:8000/api/chatkit/health)
    if echo "$HEALTH" | grep -q '"status":"ok"'; then
        echo -e "${GREEN}✓${NC} Backend health check passed"
    else
        echo -e "${RED}✗${NC} Backend health check failed"
    fi
else
    echo -e "${YELLOW}⚠${NC} Backend not running (expected at http://localhost:8000)"
fi

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Frontend is running (http://localhost:3000)"
else
    echo -e "${YELLOW}⚠${NC} Frontend not running (expected at http://localhost:3000)"
fi

echo ""

# Summary
echo "📋 Summary"
echo "----------"
echo ""
echo "Critical fixes applied:"
echo "  1. ✅ Fixed string concatenation bug in agent instructions"
echo "  2. ✅ Created Next.js API proxy routes"
echo "  3. ✅ Improved session endpoint security"
echo "  4. ✅ Added upload endpoint stub (returns 501)"
echo "  5. ✅ Updated frontend configuration"
echo ""
echo "Next steps:"
echo "  1. Start backend: cd backend && uvicorn src.main:app --reload"
echo "  2. Start frontend: cd frontend && npm run dev"
echo "  3. Navigate to: http://localhost:3000/chat"
echo "  4. Test chat functionality with authenticated user"
echo ""
echo "For detailed setup instructions, see: CHATKIT-SETUP.md"

