# Resume Architect - Project Overview

## Purpose
Resume Architect is a web application that helps users optimize their resumes for specific job postings. It uses AI (Google Gemini) to analyze resumes and job descriptions, then generates tailored resume content. The app also includes job search functionality.

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Routing**: React Router v7
- **Build Tool**: Create React App (react-scripts)
- **Icons**: Lucide React
- **PDF Generation**: html2pdf.js

### Backend
- **Framework**: FastAPI (Python)
- **AI Integration**: LiteLLM (supports OpenAI, Anthropic, Google Gemini, Ollama, OpenRouter, vLLM)
- **PDF Generation**: Gotenberg (containerized service)
- **Job Search**: python-jobspy library
- **Validation**: Pydantic v2

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Services**:
  - `backend`: FastAPI server on port 8000
  - `frontend`: React app served via nginx on port 80
  - `gotenberg`: PDF generation service on port 3000

## Project Structure
```
resume_architect/
├── frontend/                 # React TypeScript application
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── services/         # API service layer
│   │   └── types/            # TypeScript type definitions
│   └── package.json
├── backend/                  # FastAPI Python application
│   ├── app.py               # Main FastAPI application
│   ├── resume_processor.py  # Resume processing logic
│   ├── html_generator.py    # HTML resume generation
│   ├── pdf_generator.py     # PDF generation via Gotenberg
│   ├── gemini_client.py     # Google Gemini AI client
│   └── requirements.txt
├── Templates/               # Resume templates
├── docker-compose.yml       # Container orchestration
├── Dockerfile.backend       # Backend container
└── Dockerfile.frontend      # Frontend container
```

## Key Components

### Frontend Components
- `ResumeBuilder.tsx` - Main resume editing interface
- `ResumeOutput.tsx` - Displays generated resume
- `JobSearch.tsx` - Job search functionality
- `LandingPage.tsx` - Landing page
- `NavigationBar.tsx` - Navigation component

### Backend Modules
- `app.py` - FastAPI routes and endpoints
- `resume_processor.py` - AI-powered resume optimization
- `html_generator.py` - Generates HTML resume output
- `pdf_generator.py` - Converts HTML to PDF via Gotenberg
- `gemini_client.py` - Google Gemini API wrapper
