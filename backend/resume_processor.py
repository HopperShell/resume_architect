"""
Resume Processor

This module handles the processing of resumes and job postings,
interacting with LLM providers to optimize resumes.
"""

import re
import json
from typing import Dict, Any, Optional, List
from llm_client import LLMClient


class ResumeProcessor:
    """Processes resumes and job postings for optimization"""

    def __init__(self):
        """Initialize the resume processor with an LLM client"""
        self.llm_client = LLMClient()
    
    def optimize_resume(
        self, 
        resume_text: str, 
        job_posting: str,
        customization: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Optimize a resume based on the job posting with customization options
        
        Args:
            resume_text: The text of the original resume
            job_posting: The text of the job posting
            customization: Optional customization parameters
            
        Returns:
            A structured dictionary representing the optimized resume
        """
        # Clean and preprocess the texts
        cleaned_resume = self._preprocess_text(resume_text)
        cleaned_job_posting = self._preprocess_text(job_posting)
        
        try:
            # Ensure customization is a dict
            if customization is None:
                customization = {}
            
            # Generate optimized resume using Gemini with customization data
            optimized_resume_data = json.loads(
                self.llm_client.generate_optimized_resume(
                    cleaned_resume, 
                    cleaned_job_posting,
                    customization
                )
            )
            
            # Validate the returned JSON structure
            self._validate_resume_structure(optimized_resume_data)
            
            return optimized_resume_data
        
        except Exception as e:
            print(f"Error in optimize_resume: {e}")
            # More detailed fallback with error information
            return {
                "name": "Candidate Name",
                "title": "Job Title",
                "contact": {"email": "error@example.com", "phone": "", "location": ""},
                "summary": f"Resume generation error: {str(e)}",
                "skills": {"Technical Skills": [], "Soft Skills": []},
                "experience": [],
                "education": [],
                "certifications": []
            }
        
    def _validate_resume_structure(self, resume_data: Dict[str, Any]):
        """
        Validate the structure of the optimized resume JSON
        
        Args:
            resume_data: The resume data dictionary to validate
        
        Raises:
            ValueError if the structure is invalid
        """
        required_keys = [
            "name", "title", "contact", "summary", 
            "skills", "experience", "education"
        ]
        
        for key in required_keys:
            if key not in resume_data:
                raise ValueError(f"Missing required key: {key}")
        
        # Additional structural checks
        if not isinstance(resume_data.get("experience", []), list):
            raise ValueError("Experience must be a list")
        
        if not isinstance(resume_data.get("skills", {}), dict):
            raise ValueError("Skills must be a dictionary")
    
    def analyze_match(self, resume_text: str, job_posting: str) -> Dict[str, Any]:
        """
        Analyze how well the resume matches the job posting
        
        Args:
            resume_text: The text of the resume
            job_posting: The text of the job posting
            
        Returns:
            A dictionary containing match analysis results
        """
        # Clean and preprocess the texts
        cleaned_resume = self._preprocess_text(resume_text)
        cleaned_job_posting = self._preprocess_text(job_posting)
        
        # Get match analysis from Gemini
        match_analysis = self.llm_client.analyze_match(
            cleaned_resume, cleaned_job_posting
        )
        
        return match_analysis
    
    def _preprocess_text(self, text: str) -> str:
        """
        Clean and preprocess text to improve AI processing
        
        Args:
            text: The input text to preprocess
            
        Returns:
            The preprocessed text
        """
        if not text:
            return ""
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters that might confuse the AI
        text = re.sub(r'[^\w\s\.,;:\-\(\)\/]', '', text)
        
        return text.strip()
    
    def extract_sections(self, resume_text: str) -> Dict[str, str]:
        """
        Extract common sections from a resume
        
        Args:
            resume_text: The resume text
            
        Returns:
            A dictionary of section names and their content
        """
        # Common section headers in resumes
        section_patterns = {
            "contact": r"(?:CONTACT|PERSONAL)\s+(?:INFORMATION|INFO|DETAILS)",
            "summary": r"(?:SUMMARY|PROFILE|OBJECTIVE)",
            "experience": r"(?:EXPERIENCE|WORK\s+EXPERIENCE|EMPLOYMENT|WORK\s+HISTORY)",
            "education": r"EDUCATION",
            "skills": r"(?:SKILLS|TECHNICAL\s+SKILLS|COMPETENCIES)",
            "certifications": r"(?:CERTIFICATIONS|CERTIFICATES|ACCREDITATIONS)",
            "projects": r"PROJECTS",
            "awards": r"(?:AWARDS|HONORS|ACHIEVEMENTS)"
        }
        
        sections = {}
        
        # Convert to uppercase for case-insensitive matching
        upper_resume = resume_text.upper()
        
        # Find all potential section headers
        for section_name, pattern in section_patterns.items():
            matches = re.finditer(pattern, upper_resume)
            for match in matches:
                section_start = match.start()
                sections[section_name] = {"start": section_start, "content": ""}
        
        # Sort sections by their starting position
        sorted_sections = sorted(sections.items(), key=lambda x: x[1]["start"])
        
        # Extract content between sections
        for i, (section_name, section_info) in enumerate(sorted_sections):
            start_pos = section_info["start"]
            
            # Find the end of the section (start of next section or end of text)
            end_pos = len(resume_text)
            if i < len(sorted_sections) - 1:
                end_pos = sorted_sections[i+1][1]["start"]
            
            # Find the end of the header line
            header_end = resume_text.find("\n", start_pos)
            if header_end == -1 or header_end > end_pos:
                header_end = end_pos
            
            # Extract section content (skip the header)
            content = resume_text[header_end:end_pos].strip()
            sections[section_name] = content
        
        return sections

    def extract_keywords_from_resume(self, resume_text: str) -> List[str]:
        """
        Extract relevant keywords from a resume for job searching

        Args:
            resume_text: The text of the resume

        Returns:
            A list of keywords extracted from the resume
        """
        cleaned_resume = self._preprocess_text(resume_text)
        return self.llm_client.extract_keywords(cleaned_resume)