# Gemini 2.5 Flash - Quick Start Guide

## ✅ Migration Status: COMPLETE

All code changes have been successfully applied. Your ChatKit backend now uses:
- ✅ Gemini 2.5 Flash (latest model)
- ✅ Factory pattern (skill-recommended)
- ✅ Direct AsyncOpenAI client
- ✅ No LiteLLM wrapper
- ✅ No OpenRouter dependency

---

## 🚀 Start Using Gemini Now

### Step 1: Restart Backend (REQUIRED)

```bash
# Stop current backend (Ctrl+C in backend terminal)

# Start with new Gemini configuration
cd backend
uvicorn src.api.main:app --reload --port 8000
```

**Expected startup log:**
```
[INFO] Model factory initialized provider=gemini model=gemini-2.5-flash base_url=https://generativelanguage.googleapis.com/v1beta/openai/
[INFO] Application startup initiated
```

### Step 2: Verify Health

```bash
curl http://localhost:8000/api/chatkit/health
```

**Expected response:**
```json
{"status":"ok","service":"chatkit"}
```

### Step 3: Test ChatKit

1. Navigate to: http://localhost:3000/chat
2. Wait for widget to load
3. Try these prompts:
   - "Show me my tasks"
   - "Add a new task: Test Gemini 2.5 Flash integration"
   - "What's the weather like?" (should use tools)

---

## 📊 What Changed

### Before (LiteLLM + OpenRouter)
```python
# Old approach - wrapper layer
model = LitellmModel(
    model="openrouter/meta-llama/llama-3.2-3b-instruct:free",
    api_key=openrouter_api_key,
)
```

### After (Direct Gemini)
```python
# New approach - factory pattern
def create_model():
    client = AsyncOpenAI(
        api_key=gemini_api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/"
    )
    set_default_openai_client(client)
    return client, "gemini-2.5-flash"

# Usage
client, model_name = create_model()
```

**Benefits:**
- ✅ Cleaner code
- ✅ Fewer dependencies
- ✅ Better error messages
- ✅ Direct control
- ✅ Follows best practices

---

## 🔧 Configuration

### Environment Variables (backend/.env)

```bash
# Gemini Configuration (REQUIRED)
GEMINI_API_KEY=AIzaSyCKwKY4SaNNWR7QuAYkm35rYvGO3-VM0qA
GEMINI_MODEL=gemini-2.5-flash

# Other required variables
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
CHATKIT_DOMAIN_KEY=local-dev
```

### Model Options

You can change the model by updating `GEMINI_MODEL`:

```bash
# Latest and fastest (recommended)
GEMINI_MODEL=gemini-2.5-flash

# Alternative models
GEMINI_MODEL=gemini-2.0-flash-exp
GEMINI_MODEL=gemini-1.5-flash
GEMINI_MODEL=gemini-1.5-pro
```

---

## 🐛 Troubleshooting

### Issue: Backend won't start

**Check logs for:**
```
ValueError: GEMINI_API_KEY environment variable must be set
```

**Solution:**
```bash
# Verify API key is set
grep GEMINI_API_KEY backend/.env

# If missing, add it
echo "GEMINI_API_KEY=your-key-here" >> backend/.env
```

### Issue: "Invalid API key"

**Solution:**
1. Get new key: https://aistudio.google.com/apikey
2. Update backend/.env
3. Restart backend

### Issue: Still seeing LiteLLM errors

**Solution:**
```bash
# Clear Python cache
find backend -name "*.pyc" -delete
find backend -name "__pycache__" -type d -exec rm -rf {} +

# Restart backend
cd backend
uvicorn src.api.main:app --reload --port 8000
```

### Issue: ChatKit widget blank

**Check:**
1. Backend logs show "Model factory initialized"
2. Domain key matches in frontend and backend
3. JWT token present in browser cookies
4. No CORS errors in browser console

---

## 📈 Performance

### Gemini 2.5 Flash Specs

| Feature | Value |
|---------|-------|
| Speed | Very Fast |
| Context Window | 1M tokens |
| Function Calling | ✅ Yes |
| Streaming | ✅ Yes |
| Cost | Low |
| Quality | High |

### Expected Response Times

- Simple queries: 1-2 seconds
- Tool calls: 2-4 seconds
- Complex reasoning: 3-5 seconds

---

## ✅ Verification Checklist

After restarting backend, verify:

- [ ] Backend starts without errors
- [ ] Logs show "Model factory initialized provider=gemini"
- [ ] Health endpoint returns 200 OK
- [ ] ChatKit widget loads in frontend
- [ ] Chat messages stream correctly
- [ ] MCP tools execute successfully
- [ ] No LiteLLM or OpenRouter in logs

---

## 📚 Documentation

- **CHATKIT-GEMINI-MIGRATION.md** - Complete migration details
- **CHATKIT-SETUP.md** - Full setup guide
- **CHATKIT-FIXES-SUMMARY.md** - Previous fixes
- **test-gemini-integration.sh** - Automated testing

---

## 🎯 Quick Commands

```bash
# Restart backend
cd backend && uvicorn src.api.main:app --reload --port 8000

# Test health
curl http://localhost:8000/api/chatkit/health

# Run integration test
./test-gemini-integration.sh

# Check logs
tail -f backend/logs/app.log

# View environment
cat backend/.env | grep GEMINI
```

---

## 🎉 You're Ready!

Your ChatKit backend is now using Gemini 2.5 Flash with the factory pattern.

**Just restart the backend and start chatting!**

Questions? Check the detailed documentation in CHATKIT-GEMINI-MIGRATION.md

