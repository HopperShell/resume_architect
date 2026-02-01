# Suggested Commands

## Docker Commands (Recommended for Development)

### Start All Services
```bash
docker-compose up --build
```

### Start Services in Background
```bash
docker-compose up -d --build
```

### Stop All Services
```bash
docker-compose down
```

### View Logs
```bash
docker-compose logs -f           # All services
docker-compose logs -f backend   # Backend only
docker-compose logs -f frontend  # Frontend only
```

### Rebuild Specific Service
```bash
docker-compose build backend
docker-compose build frontend
```

## Frontend Development (Local)

### Install Dependencies
```bash
cd frontend && npm install
```

### Start Development Server
```bash
cd frontend && npm start
```

### Run Tests
```bash
cd frontend && npm test
```

### Build for Production
```bash
cd frontend && npm run build
```

## Backend Development (Local)

### Create Virtual Environment
```bash
cd backend && python -m venv venv
source venv/bin/activate  # macOS/Linux
```

### Install Dependencies
```bash
cd backend && pip install -r requirements.txt
```

### Run Development Server
```bash
cd backend && uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## Git Commands
```bash
git status                    # Check status
git add <files>               # Stage changes
git commit -m "message"       # Commit
git push origin <branch>      # Push to remote
git pull origin <branch>      # Pull from remote
```

## System Commands (macOS/Darwin)
```bash
ls -la                        # List files with details
find . -name "*.py"           # Find Python files
grep -r "pattern" .           # Search for pattern
```

## Service URLs (When Running)
- Frontend: http://localhost:80 (or http://localhost:3000 for local dev)
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Gotenberg: http://localhost:3000
