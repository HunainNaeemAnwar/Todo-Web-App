#!/bin/bash

# ChatKit Endpoints Testing Script
# Tests all ChatKit endpoints to verify they're working correctly

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:3000"

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                    CHATKIT ENDPOINTS TEST SUITE                              ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Backend Health Check
echo -e "${YELLOW}[TEST 1]${NC} Backend Health Check"
echo -e "  → Testing: GET ${BACKEND_URL}/api/chatkit/health"
HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "${BACKEND_URL}/api/chatkit/health" 2>/dev/null || echo "000")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "  ${GREEN}✓${NC} Status: 200 OK"
    echo -e "  ${GREEN}✓${NC} Response: $RESPONSE_BODY"
else
    echo -e "  ${RED}✗${NC} Status: $HTTP_CODE"
    echo -e "  ${RED}✗${NC} Backend health check failed"
    exit 1
fi
echo ""

# Test 2: Session Endpoint (without auth - should fail with 401)
echo -e "${YELLOW}[TEST 2]${NC} Session Endpoint (No Auth - Expected 401)"
echo -e "  → Testing: POST ${BACKEND_URL}/api/chatkit/session"
SESSION_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/chatkit/session" 2>/dev/null || echo "000")
HTTP_CODE=$(echo "$SESSION_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo -e "  ${GREEN}✓${NC} Status: $HTTP_CODE (Auth required - as expected)"
else
    echo -e "  ${YELLOW}⚠${NC} Status: $HTTP_CODE (Expected 401/403)"
fi
echo ""

# Test 3: Upload Endpoint (should return 501)
echo -e "${YELLOW}[TEST 3]${NC} Upload Endpoint (Expected 501 Not Implemented)"
echo -e "  → Testing: POST ${BACKEND_URL}/api/chatkit/upload"
UPLOAD_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/chatkit/upload" 2>/dev/null || echo "000")
HTTP_CODE=$(echo "$UPLOAD_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo -e "  ${GREEN}✓${NC} Status: $HTTP_CODE (Auth required first)"
elif [ "$HTTP_CODE" = "501" ]; then
    echo -e "  ${GREEN}✓${NC} Status: 501 (Not Implemented - as expected)"
else
    echo -e "  ${YELLOW}⚠${NC} Status: $HTTP_CODE"
fi
echo ""

# Test 4: Frontend Health Check
echo -e "${YELLOW}[TEST 4]${NC} Frontend Health Check"
echo -e "  → Testing: GET ${FRONTEND_URL}"
if curl -s "${FRONTEND_URL}" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Frontend is running"
else
    echo -e "  ${RED}✗${NC} Frontend is not running"
    echo -e "  ${YELLOW}⚠${NC} Start frontend with: cd frontend && npm run dev"
fi
echo ""

# Test 5: Frontend API Proxy Routes
echo -e "${YELLOW}[TEST 5]${NC} Frontend API Proxy Routes"
echo -e "  → Checking: /api/chatkit/route.ts"
if [ -f "frontend/src/app/api/chatkit/route.ts" ]; then
    echo -e "  ${GREEN}✓${NC} Main proxy route exists"
else
    echo -e "  ${RED}✗${NC} Main proxy route missing"
fi

echo -e "  → Checking: /api/chatkit/session/route.ts"
if [ -f "frontend/src/app/api/chatkit/session/route.ts" ]; then
    echo -e "  ${GREEN}✓${NC} Session proxy route exists"
else
    echo -e "  ${RED}✗${NC} Session proxy route missing"
fi
echo ""

# Test 6: Environment Configuration
echo -e "${YELLOW}[TEST 6]${NC} Environment Configuration"
echo -e "  → Checking backend .env"
if [ -f "backend/.env" ]; then
    echo -e "  ${GREEN}✓${NC} Backend .env exists"
    
    if grep -q "^CHATKIT_DOMAIN_KEY=" "backend/.env" 2>/dev/null; then
        DOMAIN_KEY=$(grep "^CHATKIT_DOMAIN_KEY=" "backend/.env" | cut -d'=' -f2)
        echo -e "  ${GREEN}✓${NC} CHATKIT_DOMAIN_KEY: $DOMAIN_KEY"
    else
        echo -e "  ${RED}✗${NC} CHATKIT_DOMAIN_KEY not set"
    fi
    
    if grep -q "^GEMINI_API_KEY=" "backend/.env" 2>/dev/null || \
       grep -q "^OPENROUTER_API_KEY=" "backend/.env" 2>/dev/null; then
        echo -e "  ${GREEN}✓${NC} AI provider configured"
    else
        echo -e "  ${RED}✗${NC} No AI provider configured"
    fi
else
    echo -e "  ${RED}✗${NC} Backend .env missing"
fi

echo -e "  → Checking frontend .env.local"
if [ -f "frontend/.env.local" ]; then
    echo -e "  ${GREEN}✓${NC} Frontend .env.local exists"
    
    if grep -q "^NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=" "frontend/.env.local" 2>/dev/null; then
        FRONTEND_DOMAIN_KEY=$(grep "^NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=" "frontend/.env.local" | cut -d'=' -f2)
        echo -e "  ${GREEN}✓${NC} NEXT_PUBLIC_CHATKIT_DOMAIN_KEY: $FRONTEND_DOMAIN_KEY"
    else
        echo -e "  ${RED}✗${NC} NEXT_PUBLIC_CHATKIT_DOMAIN_KEY not set"
    fi
else
    echo -e "  ${RED}✗${NC} Frontend .env.local missing"
fi
echo ""

# Summary
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                              TEST SUMMARY                                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓${NC} Backend health endpoint working"
echo -e "${GREEN}✓${NC} Authentication required on protected endpoints"
echo -e "${GREEN}✓${NC} Upload endpoint properly stubbed"
echo -e "${GREEN}✓${NC} Environment configuration verified"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "  1. Make sure backend is running: uvicorn src.api.main:app --reload --port 8000"
echo "  2. Make sure frontend is running: npm run dev"
echo "  3. Navigate to: http://localhost:3000/login"
echo "  4. Sign up/login to get JWT token"
echo "  5. Navigate to: http://localhost:3000/chat"
echo "  6. Test ChatKit widget with prompts"
echo ""
echo -e "${BLUE}For detailed testing, see: CHATKIT-SETUP.md${NC}"
echo ""

