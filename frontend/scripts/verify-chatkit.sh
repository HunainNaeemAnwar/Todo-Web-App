#!/bin/bash
# Script to verify ChatKit configuration

echo "Checking ChatKit frontend configuration..."

# Check if required environment variables are present
if [ -f .env ]; then
    echo "✓ Found .env file"

    # Check for required variables
    if grep -q "NEXT_PUBLIC_CHATKIT_DOMAIN_KEY" .env; then
        echo "✓ NEXT_PUBLIC_CHATKIT_DOMAIN_KEY found"
    else
        echo "✗ NEXT_PUBLIC_CHATKIT_DOMAIN_KEY not found"
    fi

    if grep -q "NEXT_PUBLIC_API_BASE_URL" .env; then
        echo "✓ NEXT_PUBLIC_API_BASE_URL found"
    else
        echo "✗ NEXT_PUBLIC_API_BASE_URL not found"
    fi
else
    echo "✗ No .env file found"
fi

# Check if ChatKit dependency is installed
if node -e "require('@openai/chatkit-react')" 2>/dev/null; then
    echo "✓ @openai/chatkit-react dependency is available"
else
    echo "✗ @openai/chatkit-react dependency is not available"
    echo "Run: npm install @openai/chatkit-react"
fi

# Check important files
if [ -f "src/components/chat/ChatContainer.tsx" ]; then
    echo "✓ ChatContainer.tsx exists"
    if grep -q "useChatKit" "src/components/chat/ChatContainer.tsx"; then
        echo "✓ ChatContainer uses useChatKit hook"
    fi
fi

if [ -f "src/app/api/chat/route.ts" ]; then
    echo "✓ Chat API route exists"
fi

if [ -f "src/app/api/chatkit/session/route.ts" ]; then
    echo "✓ ChatKit session route exists"
fi

echo "Configuration check complete!"