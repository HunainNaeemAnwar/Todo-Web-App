#!/bin/bash

# Quick Backend Restart Script
# Clears cache and restarts with Gemini 2.5 Flash

set -e

echo "🔄 Restarting Backend with Gemini 2.5 Flash..."
echo ""

# Navigate to backend
cd "$(dirname "$0")/backend"

# Clear Python cache
echo "1️⃣  Clearing Python cache..."
find . -name "*.pyc" -delete 2>/dev/null || true
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
echo "   ✓ Cache cleared"
echo ""

# Check environment
echo "2️⃣  Checking environment..."
if grep -q "^GEMINI_API_KEY=" .env 2>/dev/null; then
    echo "   ✓ GEMINI_API_KEY configured"
else
    echo "   ✗ GEMINI_API_KEY missing in .env"
    exit 1
fi

if grep -q "^GEMINI_MODEL=" .env 2>/dev/null; then
    MODEL=$(grep "^GEMINI_MODEL=" .env | cut -d'=' -f2)
    echo "   ✓ GEMINI_MODEL: $MODEL"
else
    echo "   ⚠ GEMINI_MODEL not set (will use default: gemini-2.5-flash)"
fi
echo ""

echo "3️⃣  Starting backend..."
echo "   Watch for: [INFO] Model factory initialized ... api_type=chat_completions"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start backend
uvicorn src.api.main:app --reload --port 8000

