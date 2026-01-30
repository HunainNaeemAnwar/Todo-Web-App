#!/bin/bash
echo "Starting backend server with all fixes..."
echo "- Database connection pool optimized for Neon Serverless"
echo "- MCP tools with automatic retry logic"
echo "- Enhanced agent instructions for descriptive tasks"
echo ""

# Kill any existing uvicorn processes
pkill -f "uvicorn src.main:app" 2>/dev/null

# Start the server
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
