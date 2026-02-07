#!/bin/bash

# FastAPI Backend Run Script
# Simplifies running the backend server with various options

set -e  # Exit on any error

# Default configuration
HOST="127.0.0.1"
PORT="8000"
RELOAD=true
LOG_LEVEL="info"
WORKERS=""
CHECK_ENV=false

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display usage
usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -h, --host HOST     Host to bind to (default: 127.0.0.1)"
    echo "  -p, --port PORT     Port to run the server on (default: 8000)"
    echo "  --no-reload         Disable auto-reload on code changes"
    echo "  -w, --workers N     Number of worker processes (default: 1)"
    echo "  -l, --log-level     Log level (debug, info, warning, error, critical)"
    echo "  --check-env         Check if required environment variables are set"
    echo "  --help              Show this help message"
    echo ""
}

# Function to check environment variables
check_environment() {
    echo -e "${BLUE}🔍 Checking environment variables...${NC}"

    REQUIRED_VARS=("BETTER_AUTH_SECRET" "NEON_DATABASE_URL")
    MISSING_VARS=()

    for var in "${REQUIRED_VARS[@]}"; do
        if [[ -z "${!var}" ]]; then
            # Try to load from .env if it exists
            if [[ -f ".env" ]]; then
                # Source the .env file temporarily to check the variable
                while IFS='=' read -r key value; do
                    if [[ $key == "$var" && -n "$value" ]]; then
                        export "$key=$value"
                        break
                    fi
                done < <(grep -E "^$var=" .env 2>/dev/null)
            fi

            if [[ -z "${!var}" ]]; then
                MISSING_VARS+=("$var")
            fi
        fi
    done

    if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
        echo -e "${RED}❌ Missing required environment variables:${NC} ${MISSING_VARS[*]}"
        echo "Please set them in your .env file or environment"
        exit 1
    fi

    echo -e "${GREEN}✅ All required environment variables are set${NC}"
    echo ""
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--host)
            HOST="$2"
            shift 2
            ;;
        -p|--port)
            PORT="$2"
            shift 2
            ;;
        --no-reload)
            RELOAD=false
            shift
            ;;
        -w|--workers)
            WORKERS="$2"
            shift 2
            ;;
        -l|--log-level)
            LOG_LEVEL="$2"
            shift 2
            ;;
        --check-env)
            CHECK_ENV=true
            shift
            ;;
        --help)
            usage
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Change to backend directory
cd "$(dirname "$0")"

# Check environment if requested
if [[ "$CHECK_ENV" == true ]]; then
    check_environment
fi

# Kill any existing uvicorn processes
echo -e "${YELLOW}🧹 Cleaning up existing processes...${NC}"
pkill -f "uvicorn src.api.main:app" 2>/dev/null || true

# Build the uvicorn command
CMD="uvicorn src.api.main:app --host $HOST --port $PORT --log-level $LOG_LEVEL"

if [[ "$RELOAD" == true ]]; then
    CMD="$CMD --reload"
    echo -e "${BLUE}🔄 Auto-reload enabled${NC}"
fi

if [[ -n "$WORKERS" && "$RELOAD" != true ]]; then
    CMD="$CMD --workers $WORKERS"
    echo -e "${BLUE}⚙️  Using $WORKERS workers${NC}"
fi

echo -e "${GREEN}🚀 Starting FastAPI server on $HOST:$PORT${NC}"
echo -e "${BLUE}📝 Command: $CMD${NC}"
echo ""

# Execute the command
eval $CMD