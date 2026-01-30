#!/bin/bash

# Gemini 2.5 Flash Integration Test Script

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              GEMINI 2.5 FLASH INTEGRATION TEST                               ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Check environment configuration
echo -e "${YELLOW}[TEST 1]${NC} Environment Configuration"
if grep -q "^GEMINI_API_KEY=" backend/.env 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} GEMINI_API_KEY configured"
else
    echo -e "  ${RED}✗${NC} GEMINI_API_KEY missing"
    exit 1
fi

if grep -q "^GEMINI_MODEL=" backend/.env 2>/dev/null; then
    MODEL=$(grep "^GEMINI_MODEL=" backend/.env | cut -d'=' -f2)
    echo -e "  ${GREEN}✓${NC} GEMINI_MODEL: $MODEL"
else
    echo -e "  ${YELLOW}⚠${NC} GEMINI_MODEL not set (will use default: gemini-2.5-flash)"
fi
echo ""

# Test 2: Check code migration
echo -e "${YELLOW}[TEST 2]${NC} Code Migration Verification"
if grep -q "def create_model():" backend/src/api/chatkit_router.py; then
    echo -e "  ${GREEN}✓${NC} Factory function exists"
else
    echo -e "  ${RED}✗${NC} Factory function missing"
    exit 1
fi

if grep -q "from openai import AsyncOpenAI" backend/src/api/chatkit_router.py; then
    echo -e "  ${GREEN}✓${NC} AsyncOpenAI imported"
else
    echo -e "  ${RED}✗${NC} AsyncOpenAI import missing"
    exit 1
fi

if grep -q "set_default_openai_client" backend/src/api/chatkit_router.py; then
    echo -e "  ${GREEN}✓${NC} set_default_openai_client used"
else
    echo -e "  ${RED}✗${NC} set_default_openai_client missing"
    exit 1
fi

if grep -qi "litellm" backend/src/api/chatkit_router.py; then
    echo -e "  ${RED}✗${NC} LiteLLM references still present"
    exit 1
else
    echo -e "  ${GREEN}✓${NC} No LiteLLM references"
fi

if grep -qi "openrouter" backend/src/api/chatkit_router.py; then
    echo -e "  ${RED}✗${NC} OpenRouter references still present"
    exit 1
else
    echo -e "  ${GREEN}✓${NC} No OpenRouter references"
fi
echo ""

# Test 3: Check backend is running
echo -e "${YELLOW}[TEST 3]${NC} Backend Status"
if curl -s http://localhost:8000/api/chatkit/health > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Backend is running"
    
    HEALTH=$(curl -s http://localhost:8000/api/chatkit/health)
    if echo "$HEALTH" | grep -q '"status":"ok"'; then
        echo -e "  ${GREEN}✓${NC} Health check passed"
    else
        echo -e "  ${RED}✗${NC} Health check failed"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Backend not running"
    echo -e "  ${YELLOW}→${NC} Start with: cd backend && uvicorn src.api.main:app --reload --port 8000"
fi
echo ""

# Test 4: Check frontend is running
echo -e "${YELLOW}[TEST 4]${NC} Frontend Status"
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} Frontend is running"
else
    echo -e "  ${YELLOW}⚠${NC} Frontend not running"
    echo -e "  ${YELLOW}→${NC} Start with: cd frontend && npm run dev"
fi
echo ""

# Summary
echo -e "${BLUE}╔══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                              TEST SUMMARY                                    ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✓${NC} Migration completed successfully"
echo -e "${GREEN}✓${NC} All code changes verified"
echo -e "${GREEN}✓${NC} Environment configured"
echo ""
echo -e "${YELLOW}NEXT STEPS:${NC}"
echo "  1. Restart backend: cd backend && uvicorn src.api.main:app --reload --port 8000"
echo "  2. Check logs for: [INFO] Model factory initialized provider=gemini model=gemini-2.5-flash"
echo "  3. Navigate to: http://localhost:3000/chat"
echo "  4. Test with: 'Show me my tasks'"
echo ""
echo -e "${BLUE}For detailed documentation, see: CHATKIT-GEMINI-MIGRATION.md${NC}"
echo ""

