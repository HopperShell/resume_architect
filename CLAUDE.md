# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Resume Architect is a full-stack application that optimizes resumes for specific job postings using AI. Users paste their resume and a job description, and the app generates a tailored resume with matching keywords and improved formatting. Supports multiple LLM providers via LiteLLM.

## Docker Compose Architecture

This is a containerized application managed via `docker-compose.yml` with three services:

| Service | Container | Port | Purpose |
|---------|-----------|------|---------|
| **frontend** | nginx:alpine | 80 | Serves React production build |
| **backend** | python:3.11-slim | 8000 | FastAPI application |
| **gotenberg** | gotenberg/gotenberg:8 | 3000 | HTML-to-PDF conversion |

The services communicate over a shared `resume-net` bridge network. The backend depends on gotenberg for PDF generation; the frontend depends on the backend API.

## Commands

### Docker Compose (Recommended)
```bash
docker-compose up --build          # Build and start all 3 services
docker-compose up -d --build       # Start in background
docker-compose down                # Stop all services
docker-compose build backend       # Rebuild single service
docker-compose logs -f backend     # View backend logs
```

### Frontend (Local Development)
```bash
cd frontend
npm install                        # Install dependencies
npm start                          # Dev server on port 3000
npm run build                      # Production build
npm test                           # Run tests
```

### Backend (Local Development)
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8000   # Dev server with hot reload
```

### Service URLs
- Frontend: http://localhost:80 (Docker) or http://localhost:3000 (local)
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Gotenberg (PDF): http://localhost:3000

## Architecture

### Data Flow
```
User Input (Resume + Job Posting)
    ↓
Frontend (React) → POST /optimize
    ↓
Backend (FastAPI)
    ↓
ResumeProcessor → LLMClient (AI optimization via LiteLLM)
    ↓
HTMLGenerator (creates styled HTML)
    ↓
PDFGenerator → Gotenberg service (HTML→PDF)
    ↓
Response: { html, pdf_url }
```

### Backend Module Responsibilities
- **app.py**: FastAPI routes, request validation (Pydantic models), CORS config
- **llm_client.py**: LiteLLM wrapper supporting multiple providers, prompt engineering for resume optimization and match analysis
- **resume_processor.py**: Orchestrates AI calls, text preprocessing, keyword extraction
- **html_generator.py**: Converts structured resume JSON to styled HTML
- **pdf_generator.py**: Sends HTML to Gotenberg container for PDF conversion

### Frontend Structure
- **App.tsx**: React Router setup, state management for resume flow
- **components/ResumeBuilder.tsx**: Main editing interface
- **components/ResumeOutput.tsx**: Displays generated resume with download
- **components/JobSearch.tsx**: Job search using python-jobspy
- **services/api.ts**: All backend API calls in single service class

### API Endpoints
| Endpoint | Purpose |
|----------|---------|
| POST /optimize | Generate optimized resume HTML + PDF |
| POST /analyze | Get match score and missing keywords |
| POST /upload-resume | Parse uploaded resume file |
| POST /extract-keywords | Extract job search keywords from resume |
| POST /search-jobs | Search Indeed/LinkedIn via python-jobspy |
| GET /download/{filename} | Download generated PDF |

## LLM Configuration

Uses LiteLLM for multi-provider support. Configure in `.env`:

```bash
# Model for resume optimization (needs quality)
LLM_MODEL_OPTIMIZE=gpt-4o

# Model for match analysis (can be faster/cheaper)
LLM_MODEL_ANALYZE=gpt-4o-mini
```

### Supported Providers

| Provider | Model Format | Required Env Var |
|----------|--------------|------------------|
| OpenAI | `gpt-4o`, `gpt-4-turbo` | `OPENAI_API_KEY` |
| Anthropic | `claude-3-5-sonnet-20241022` | `ANTHROPIC_API_KEY` |
| Google | `gemini/gemini-2.5-flash` | `GEMINI_API_KEY` |
| Ollama | `ollama/llama3.2` | `OLLAMA_API_BASE` |
| OpenRouter | `openrouter/anthropic/claude-3.5-sonnet` | `OPENROUTER_API_KEY` |
| vLLM | `hosted_vllm/model-name` | `VLLM_API_BASE` |

**Note:** For Ollama with Docker, use `OLLAMA_API_BASE=http://host.docker.internal:11434`

## Key Technical Details

- **PDF Generation**: Gotenberg container (not WeasyPrint) - must be running for PDFs
- **TypeScript**: Strict mode enabled in frontend
- **Python**: Type hints with Pydantic v2 for validation
- **Dockerfiles**: `Dockerfile.frontend` (multi-stage build with nginx), `Dockerfile.backend` (Python 3.11-slim)
