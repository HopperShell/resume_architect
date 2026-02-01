# backend/app.py

"""
FastAPI Backend for Resume Architect
This module sets up the API endpoints for the resume optimization service.
"""

import os
import json
from typing import Optional, List
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from pydantic import BaseModel, Field
import uvicorn
from datetime import datetime

from resume_processor import ResumeProcessor
from html_generator import HTMLGenerator
from pdf_generator import PDFGenerator
from jobspy import scrape_jobs
from pathlib import Path

app = FastAPI(title="Resume Architect API")
BASE_DIR = (Path(__file__).resolve().parent / "static").resolve()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize service components
resume_processor = ResumeProcessor()
html_generator = HTMLGenerator()
pdf_generator = PDFGenerator()

# Model for custom experience data
class CustomExperience(BaseModel):
    section: str
    title: Optional[str] = None
    company: Optional[str] = None
    period: Optional[str] = None
    description: str

# Model for resume customization options
class ResumeCustomization(BaseModel):
    selected_skills: List[str] = Field(default_factory=list)
    custom_keywords: List[str] = Field(default_factory=list)
    custom_experiences: List[CustomExperience] = Field(default_factory=list)

class OptimizeResumeRequest(BaseModel):
    resume_text: str
    job_posting: str
    customization: Optional[ResumeCustomization] = None

class OptimizeResumeResponse(BaseModel):
    html: str
    pdf_url: Optional[str] = None

class AnalyzeMatchRequest(BaseModel):
    resume_text: str
    job_posting: str

class AnalyzeMatchResponse(BaseModel):
    match_score: int
    missing_keywords: list[str]
    skill_matches: list[str]
    recommendations: list[str]

class KeywordExtractRequest(BaseModel):
    resume_text: str

class KeywordExtractResponse(BaseModel):
    keywords: List[str]

class JobSearchRequest(BaseModel):
    keywords: List[str]
    days_ago: int = Field(default=2)
    limit: int = Field(default=20)

class JobSearchResponse(BaseModel):
    jobs: List[dict]





@app.get("/")
async def root():
    return {"status": "healthy", "service": "Resume Architect API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/optimize", response_model=OptimizeResumeResponse)
async def optimize_resume(
    request: OptimizeResumeRequest
):
    if not request.resume_text or not request.job_posting:
        raise HTTPException(status_code=400, detail="Resume and job posting are required")
    
    try:
        # Debug the customization data
        print("Customization data in app.py:")
        if request.customization:
            # Convert Pydantic model to dict explicitly
            customization_dict = {
                "selected_skills": request.customization.selected_skills or [],
                "custom_keywords": request.customization.custom_keywords or [],
                "custom_experiences": [
                    {
                        "section": exp.section,
                        "title": exp.title or "",
                        "company": exp.company or "",
                        "period": exp.period or "",
                        "description": exp.description
                    } for exp in (request.customization.custom_experiences or [])
                ]
            }
            print(f"  Selected skills: {customization_dict['selected_skills']}")
            print(f"  Custom keywords: {customization_dict['custom_keywords']}")
            if customization_dict['custom_experiences']:
                print(f"  Custom experiences: {len(customization_dict['custom_experiences'])} items")
        else:
            customization_dict = None
        
        # Get structured dict with customization options
        raw_or_struct = resume_processor.optimize_resume(
            request.resume_text, 
            request.job_posting,
            customization_dict  # Pass as a dictionary
        )

        # Wrap or render via html_generator
        optimized_html = html_generator.generate_html(raw_or_struct)

        # PDF generation
        pdf_url = None
        try:
            static_dir = os.path.join(os.path.dirname(__file__), "static")

            # Create directories if needed
            os.makedirs(static_dir, exist_ok=True)

            # Use timestamp in filename
            timestamp = int(datetime.now().timestamp())
            pdf_filename = f"resume_{timestamp}.pdf"
            pdf_path = os.path.join(static_dir, pdf_filename)

            if pdf_generator.generate_pdf_from_html(optimized_html, pdf_path):
                pdf_url = f"/download/{pdf_filename}"
        except Exception as e:
            print(f"Error generating PDF: {e}")
            # Continue without PDF if generation fails

        return {"html": optimized_html, "pdf_url": pdf_url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error optimizing resume: {e}")

@app.post("/analyze", response_model=AnalyzeMatchResponse)
async def analyze_match(
    request: AnalyzeMatchRequest
):
    if not request.resume_text or not request.job_posting:
        raise HTTPException(status_code=400, detail="Resume and job posting are required")
    try:
        analysis = resume_processor.analyze_match(
            request.resume_text, request.job_posting
        )
        return {
            "match_score": analysis.get("match_score", 0),
            "missing_keywords": analysis.get("missing_keywords", []),
            "skill_matches": analysis.get("skill_matches", []),
            "recommendations": analysis.get("recommendations", [])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing resume match: {e}")

@app.post("/upload-resume")
async def upload_resume(
    resume_file: UploadFile = File(...)
):
    if not resume_file:
        raise HTTPException(status_code=400, detail="Resume file is required")
    try:
        content = await resume_file.read()
        resume_text = content.decode("utf-8") if content else ""
        return {"success": True, "resume_text": resume_text}
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Invalid file format.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing file: {e}")

@app.get("/download/{path:path}")
async def download_file(
    path: str
):
    # Security check for path traversal
    if ".." in path:
        raise HTTPException(status_code=400, detail="Invalid path")

    requested_path = (BASE_DIR / path).resolve()

    # Ensure file is inside static directory and exists
    if not requested_path.is_file() or not str(requested_path).startswith(str(BASE_DIR)):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=str(requested_path), 
        filename=requested_path.name, 
        media_type="application/pdf"
    )

@app.post("/extract-keywords", response_model=KeywordExtractResponse)
async def extract_keywords(
    request: KeywordExtractRequest
):
    if not request.resume_text:
        raise HTTPException(status_code=400, detail="Resume text is required")
    try:
        # Use the resume processor to extract keywords from the resume
        keywords = resume_processor.extract_keywords_from_resume(request.resume_text)
        return {"keywords": keywords}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error extracting keywords: {e}")

@app.post("/search-jobs", response_model=JobSearchResponse)
async def search_jobs(
    request: JobSearchRequest
):
    if not request.keywords or len(request.keywords) == 0:
        raise HTTPException(status_code=400, detail="Keywords are required")
    
    try:
        # Create a search query from the keywords
        search_query = " ".join(request.keywords[:5])  # Use top 5 keywords
        
        # Search for jobs using JobSpy
        jobs = scrape_jobs(
            site_name=["indeed", "linkedin"],  # Search on multiple job sites
            search_term=search_query,
            location="",  # Empty for remote/anywhere
            results_wanted=request.limit,  # Limit results
            hours_old=request.days_ago * 24,  # Convert days to hours
            hyperlinks=True  # Include links to job postings
        )
        
        # Convert to JSON-serializable format
        jobs_list = json.loads(jobs.to_json(orient="records"))
        
        return {"jobs": jobs_list}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching jobs: {e}")





if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)