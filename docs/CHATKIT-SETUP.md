# ChatKit Integration Setup Guide

## Overview

This project uses OpenAI ChatKit with a custom FastAPI backend powered by the OpenAI Agents SDK and MCP servers.

**Architecture:**
```
Browser → Next.js Frontend → Next.js API Proxy → FastAPI Backend → Agents SDK → MCP Tools → Neon PostgreSQL
```

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# ChatKit Configuration
CHATKIT_DOMAIN_KEY=local-dev  # Change for production

# AI Model Provider (choose one)
# Option 1: OpenRouter (recommended for free models)
OPENROUTER_API_KEY=your-openrouter-key
OPENROUTER_MODEL=openrouter/meta-llama/llama-3.2-3b-instruct:free

# Option 2: Gemini (fallback)
GEMINI_API_KEY=your-gemini-key
# or
GOOGLE_API_KEY=your-google-key
```

### Frontend (.env.local)

```bash
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# ChatKit Configuration
NEXT_PUBLIC_CHATKIT_API_URL=/api/chatkit
NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=local-dev

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn src.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Start the development server
npm run dev
```

### 3. Verify Installation

1. **Backend Health Check:**
   ```bash
   curl http://localhost:8000/api/chatkit/health
   # Expected: {"status":"ok","service":"chatkit"}
   ```

2. **Frontend Access:**
   - Navigate to: http://localhost:3000/chat
   - You should see the ChatKit interface

3. **Test Authentication:**
   - Sign up/login at: http://localhost:3000/login
   - Navigate to chat page
   - Verify JWT token is present in cookies

## Features

### ✅ Implemented

- **Custom Backend Integration:** FastAPI backend with ChatKit Python SDK
- **OpenAI Agents SDK:** AI agent with MCP tool integration
- **Conversation Persistence:** All conversations stored in Neon PostgreSQL
- **Better Auth JWT:** Secure authentication with user isolation
- **SSE Streaming:** Real-time streaming responses
- **User Context Injection:** Page context and user info sent to AI
- **MCP Tools:** Task management tools (create, list, update, delete)
- **Multi-Model Support:** OpenRouter and Gemini via LiteLLM

### ⚠️ Not Implemented

- **File Uploads:** Attachments are disabled (backend returns 501)
- **Session Token Validation:** Client secrets are generated but not validated
- **Rate Limiting:** No rate limiting on API endpoints
- **Conversation Export:** No export/import functionality

## API Endpoints

### Backend (FastAPI)

- `POST /api/chatkit` - Main ChatKit endpoint (handles chat requests)
- `POST /api/chatkit/session` - Create ChatKit session
- `POST /api/chatkit/upload` - File upload (not implemented, returns 501)
- `GET /api/chatkit/health` - Health check

### Frontend (Next.js API Routes)

- `POST /api/chatkit` - Proxy to backend `/api/chatkit`
- `POST /api/chatkit/session` - Proxy to backend `/api/chatkit/session`

## Troubleshooting

### Issue: Blank ChatKit Widget

**Possible Causes:**
1. Domain key mismatch between frontend and backend
2. CORS issues
3. API proxy not working

**Solution:**
```bash
# Check domain key in both .env files
# Backend: CHATKIT_DOMAIN_KEY=local-dev
# Frontend: NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=local-dev

# Verify API proxy is working
curl -X POST http://localhost:3000/api/chatkit/session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Issue: Authentication Errors

**Possible Causes:**
1. JWT token not being sent
2. Token expired
3. BETTER_AUTH_SECRET mismatch

**Solution:**
```bash
# Check cookie in browser DevTools
# Should see: auth_token=...

# Verify BETTER_AUTH_SECRET matches in both .env files
```

### Issue: Agent Not Responding

**Possible Causes:**
1. No API key configured
2. MCP server not starting
3. Database connection issues

**Solution:**
```bash
# Check backend logs for errors
# Verify OPENROUTER_API_KEY or GEMINI_API_KEY is set
# Check DATABASE_URL is correct
```

### Issue: "Failed to proxy request to backend"

**Possible Causes:**
1. Backend not running
2. Wrong NEXT_PUBLIC_API_BASE_URL
3. Network connectivity issues

**Solution:**
```bash
# Verify backend is running
curl http://localhost:8000/api/chatkit/health

# Check NEXT_PUBLIC_API_BASE_URL in frontend/.env.local
# Should be: http://localhost:8000
```

## Production Deployment

### Backend

1. **Set Production Environment Variables:**
   ```bash
   CHATKIT_DOMAIN_KEY=your-production-domain.com
   DATABASE_URL=postgresql://prod-connection-string
   ```

2. **Enable HTTPS:**
   - Use reverse proxy (nginx, Caddy)
   - Configure SSL certificates

3. **Add Rate Limiting:**
   - Implement rate limiting middleware
   - Use Redis for distributed rate limiting

### Frontend

1. **Update Environment Variables:**
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
   NEXT_PUBLIC_CHATKIT_DOMAIN_KEY=yourdomain.com
   ```

2. **Domain Allowlist:**
   - Add your production domain to ChatKit allowlist
   - Verify domain key matches

3. **Build and Deploy:**
   ```bash
   npm run build
   npm start
   ```

## Security Considerations

1. **API Keys:** Never expose API keys in frontend code
2. **JWT Validation:** Implement proper JWT validation in backend
3. **CORS:** Configure CORS properly for production
4. **Rate Limiting:** Add rate limiting to prevent abuse
5. **Input Validation:** Validate all user inputs
6. **SQL Injection:** Use parameterized queries (SQLModel handles this)
7. **XSS Protection:** Sanitize user-generated content

## Support

For issues or questions:
1. Check backend logs: `tail -f backend/logs/app.log`
2. Check frontend console: Browser DevTools → Console
3. Review this documentation
4. Check ChatKit official docs: https://platform.openai.com/docs/chatkit

