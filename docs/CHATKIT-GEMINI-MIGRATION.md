# ChatKit Gemini 2.5 Flash Migration Guide

## 🎯 Overview

Successfully migrated ChatKit backend from OpenRouter/LiteLLM to **Gemini 2.5 Flash** using the **factory pattern** recommended by the openai-chatkit-backend-python skill.

---

## 📋 Changes Made

### 1. Factory Pattern Implementation

**Created `create_model()` factory function:**

```python
def create_model():
    """
    Factory function to create the AI model for ChatKit.
    
    Uses Gemini via OpenAI-compatible endpoint.
    Configure via environment variables:
    - GEMINI_API_KEY: Your Gemini API key
    - GEMINI_MODEL: Model name (default: gemini-2.5-flash)
    """
    gemini_api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    if not gemini_api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable must be set. "
            "Get your API key from: https://aistudio.google.com/apikey"
        )
    
    # Create AsyncOpenAI client with Gemini endpoint
    client = AsyncOpenAI(
        api_key=gemini_api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    
    # Set as default client for all agents
    set_default_openai_client(client)
    
    logger.info(
        "Model factory initialized",
        provider="gemini",
        model=gemini_model,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    
    return client, gemini_model
```

**Key Features:**
- ✅ Clean separation of concerns
- ✅ Environment-based configuration
- ✅ Direct AsyncOpenAI client (no LiteLLM wrapper)
- ✅ Global client registration with `set_default_openai_client()`
- ✅ Structured logging

---

### 2. Removed Dependencies

**Removed:**
- ❌ `agents.extensions.models.litellm_model.LitellmModel`
- ❌ OpenRouter configuration
- ❌ OpenRouter API key checks
- ❌ LiteLLM wrapper layer

**Added:**
- ✅ `from agents import set_default_openai_client`
- ✅ `from openai import AsyncOpenAI`

---

### 3. Updated TaskChatKitServer

**Before:**
```python
# Configure model using LitellmModel for OpenRouter or Gemini
openrouter_api_key = os.getenv("OPENROUTER_API_KEY")
openrouter_model_name = os.getenv("OPENROUTER_MODEL", "...")

if openrouter_api_key:
    model = LitellmModel(model=openrouter_model_name, api_key=openrouter_api_key)
else:
    model = LitellmModel(model="gemini/gemini-2.0-flash", api_key=gemini_api_key)
```

**After:**
```python
# Use factory to create model
client, model_name = create_model()
self.client = client
self.model_name = model_name
```

**Benefits:**
- Cleaner initialization
- Single source of truth for model configuration
- Easier to test and maintain
- Follows skill-recommended pattern

---

## 🔧 Environment Configuration

### Backend (.env)

**Update your `backend/.env` file:**

```bash
# Database
DATABASE_URL=postgresql://user:password@host/database

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000

# ChatKit Configuration
CHATKIT_DOMAIN_KEY=local-dev

# Gemini Configuration (REQUIRED)
GEMINI_API_KEY=your-gemini-api-key-here
GEMINI_MODEL=gemini-2.5-flash

# REMOVED - No longer needed:
# OPENROUTER_API_KEY=...
# OPENROUTER_MODEL=...
```

**Get Gemini API Key:**
- Visit: https://aistudio.google.com/apikey
- Create a new API key
- Add to `.env` file

---

## 🏗️ Architecture

### Before (LiteLLM):
```
ChatKit → FastAPI → LitellmModel → Provider API → Gemini
                    (wrapper layer)
```

### After (Direct):
```
ChatKit → FastAPI → AsyncOpenAI → Gemini API
                    (direct connection)
```

**Advantages:**
- ✅ Fewer dependencies
- ✅ Direct control over client
- ✅ Better error messages
- ✅ Simpler debugging
- ✅ Follows OpenAI Agents SDK best practices

---

## 🧪 Testing Instructions

### 1. Update Environment Variables

```bash
cd backend

# Edit .env file
nano .env

# Add/Update:
GEMINI_API_KEY=your-actual-api-key
GEMINI_MODEL=gemini-2.5-flash

# Remove (if present):
# OPENROUTER_API_KEY
# OPENROUTER_MODEL
```

### 2. Restart Backend

```bash
# Stop current backend (Ctrl+C)

# Restart with new configuration
uvicorn src.api.main:app --reload --port 8000
```

### 3. Verify Logs

**Expected startup logs:**
```
[INFO] Model factory initialized provider=gemini model=gemini-2.5-flash base_url=https://generativelanguage.googleapis.com/v1beta/openai/
[INFO] Application startup initiated
```

### 4. Test ChatKit Session

```bash
# Get JWT token from browser cookies after login
TOKEN="your-jwt-token-here"

# Test session endpoint
curl -X POST http://localhost:8000/api/chatkit/session \
  -H "Authorization: Bearer $TOKEN"

# Expected response:
{
  "client_secret": "...",
  "domain_key": "local-dev",
  "expires_in": 3600,
  "user_id": "..."
}
```

### 5. Test Chat Functionality

1. Navigate to: http://localhost:3000/chat
2. Wait for ChatKit widget to load
3. Try these prompts:
   - "Show me my tasks"
   - "Add a new task: Test Gemini integration"
   - "What can you help me with?"

**Expected behavior:**
- Widget loads without errors
- Responses stream in real-time
- MCP tools work correctly
- Conversation persists in database

---

## 🔍 Verification Checklist

- [ ] Backend starts without errors
- [ ] Logs show "Model factory initialized" with Gemini
- [ ] Session endpoint returns valid response
- [ ] ChatKit widget loads in frontend
- [ ] Chat messages stream correctly
- [ ] MCP tools execute successfully
- [ ] Conversation history persists
- [ ] No LiteLLM or OpenRouter references in logs

---

## 🐛 Troubleshooting

### Issue: "GEMINI_API_KEY environment variable must be set"

**Solution:**
```bash
# Check if API key is set
grep GEMINI_API_KEY backend/.env

# If missing, add it:
echo "GEMINI_API_KEY=your-key-here" >> backend/.env

# Restart backend
```

### Issue: "Invalid API key"

**Solution:**
1. Verify API key at: https://aistudio.google.com/apikey
2. Ensure no extra spaces in `.env` file
3. Check key hasn't expired
4. Try generating a new key

### Issue: "Model not found: gemini-2.5-flash"

**Solution:**
```bash
# Check available models at Gemini API docs
# Or use alternative model:
GEMINI_MODEL=gemini-2.0-flash-exp
```

### Issue: Backend logs show LiteLLM errors

**Solution:**
```bash
# Ensure you've restarted the backend after changes
# Check for cached Python bytecode:
find backend -name "*.pyc" -delete
find backend -name "__pycache__" -type d -exec rm -rf {} +

# Restart backend
uvicorn src.api.main:app --reload --port 8000
```

---

## 📊 Performance Comparison

### Gemini 2.5 Flash vs 2.0 Flash

| Metric | 2.0 Flash | 2.5 Flash |
|--------|-----------|-----------|
| Speed | Fast | Faster |
| Quality | Good | Better |
| Context | 32K tokens | 1M tokens |
| Function Calling | ✅ Yes | ✅ Yes (improved) |
| Cost | Low | Similar |

**Recommendation:** Use `gemini-2.5-flash` for best performance.

---

## 🔐 Security Notes

### ✅ Secure Practices:
1. API key stored server-side only
2. No API key in frontend code
3. Environment variables for configuration
4. JWT authentication on all endpoints
5. User isolation in database queries

### ⚠️ Important:
- Never commit `.env` file to git
- Rotate API keys regularly
- Use different keys for dev/prod
- Monitor API usage in Google AI Studio

---

## 📚 References

- **Gemini API Docs:** https://ai.google.dev/gemini-api/docs
- **OpenAI Agents SDK:** https://github.com/openai/openai-agents-python
- **ChatKit Docs:** https://platform.openai.com/docs/chatkit
- **Factory Pattern:** Recommended by openai-chatkit-backend-python skill

---

## ✅ Migration Complete

Your ChatKit backend now uses:
- ✅ Gemini 2.5 Flash (latest model)
- ✅ Factory pattern (clean architecture)
- ✅ Direct AsyncOpenAI client (no wrappers)
- ✅ Skill-recommended best practices

**Next Steps:**
1. Update `backend/.env` with Gemini API key
2. Restart backend server
3. Test chat functionality
4. Monitor logs for any issues

**Questions?** Check CHATKIT-SETUP.md for detailed troubleshooting.

