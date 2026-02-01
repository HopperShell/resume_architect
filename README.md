# Resume Architect

AI-powered resume tailoring system with a Python FastAPI backend and React TypeScript frontend. Optimizes resumes for specific job postings using Google's Gemini API.

**This is a local-only deployment** - no authentication, user accounts, or external services required. Simply deploy and start optimizing your resumes immediately!

## Features

- Resume analysis and job posting matching
- AI-driven keyword optimization
- ATS-friendly formatting
- PDF generation with proper font rendering
- Modern, responsive UI
- **No login required** - immediate access to all features
- **Local deployment** - your data stays on your machine
- **Job search integration** - find relevant positions

## Screenshots

### Resume Input
Upload your resume and job posting to get started.

![Resume Input](docs/images/resume-input.png)

### Resume Review & Customization
Review the AI analysis, see your match score, and select additional skills you have.

![Resume Review](docs/images/resume-review.png)

### Optimized Resume Output
Download your tailored resume as HTML or PDF.

![Resume Output](docs/images/resume-output.png)

## Setup Options

### Option 1: Docker Containerization (Recommended)

This is the easiest way to get everything running with minimal setup.

1. Clone the repository  
   git clone git@github.com:andrewwarz/resume_architect.git  
   cd resume_architect  

2. Create a .env file in the project root with your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   DEBUG=True
   REACT_APP_API_URL=http://localhost:8000
   ```

   **Note:** Get your free Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

3. Run with Docker Compose
   ```bash
   docker-compose up -d
   ```

4. Access the application at http://localhost

   The application will be immediately available - no login or setup required!

---

### Option 2: Local Development Setup

#### Backend Setup (Python)

1. Navigate to backend directory
   ```bash
   cd backend
   ```

2. Create and activate virtual environment
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables
   ```bash
   # Linux/macOS
   export GEMINI_API_KEY=your_gemini_api_key_here

   # Windows (Command Prompt)
   set GEMINI_API_KEY=your_gemini_api_key_here

   # Windows (PowerShell)
   $env:GEMINI_API_KEY="your_gemini_api_key_here"
   ```

5. Start the backend server
   ```bash
   uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

#### Frontend Setup (React + TypeScript)

1. Navigate to frontend directory
   ```bash
   cd frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. Access the frontend at http://localhost:3000

   The application will open automatically in your browser - no login required!

---

## Quick Start Usage

1. **Open the application** - Navigate to http://localhost (Docker) or http://localhost:3000 (local development)

2. **Upload your resume** - Paste your resume text or upload a file

3. **Add a job posting** - Copy and paste the job description you're applying for

4. **Optimize your resume** - Click "Optimize Resume" to get an AI-tailored version

5. **Download PDF** - Get a professionally formatted PDF of your optimized resume

6. **Search for jobs** - Use the job search feature to find relevant positions

**No account creation or login required!** All processing happens locally.

---

## Prerequisites

- Docker and Docker Compose (for containerized setup)  
- Python 3.11+ (for local backend setup)  
- Node.js 16.x+ (for local frontend setup)  
- npm (comes with Node.js)  

---

## Project Structure

resume_architect/  
├── backend/             → FastAPI backend (Python)  
│   ├── app.py           → Main application file  
│   ├── gemini_client.py → Google Gemini API integration  
│   ├── html_generator.py → Resume HTML generator  
│   ├── pdf_generator.py → PDF generation with Gotenberg  
│   ├── resume_processor.py → Resume processing logic  
│   └── requirements.txt → Python dependencies  
├── frontend/            → React frontend (TypeScript)  
│   ├── src/             → Source code  
│   │   ├── components/  → React components  
│   │   └── services/    → API services  
│   ├── package.json     → Node dependencies  
│   └── tsconfig.json    → TypeScript configuration  
├── docker-compose.yml   → Docker Compose configuration  
└── README.md            → Documentation  

---

## PDF Generation

The application uses Gotenberg for PDF generation from HTML. The PDF generator is configured to properly render fonts and ensure all text is visible in the generated PDFs.

---

## API Documentation

When running the backend, API documentation is available at:  
- Swagger UI: http://localhost:8000/docs  
- ReDoc: http://localhost:8000/redoc  