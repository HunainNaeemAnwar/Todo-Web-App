# Quickstart Guide: Task Management Web Application

## Prerequisites
- Node.js 18+ for frontend
- Python 3.13+ for backend
- PostgreSQL (or Neon Serverless PostgreSQL)
- Docker (optional, for containerized deployment)

## Environment Setup

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Update .env with your database and auth configuration
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local
# Update .env.local with your API and auth configuration
```

## Database Configuration
- Configure your Neon PostgreSQL connection in backend/.env
- Configure Better Auth in frontend with your database connection
- Initialize and run database migrations: `python -m alembic upgrade head`

## Running the Application

### Development Mode
```bash
# Terminal 1 - Backend
cd backend
uvicorn src.api.main:app --reload --port 8000

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Key Endpoints
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Backend Docs: http://localhost:8000/docs

## Testing
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm run test
```