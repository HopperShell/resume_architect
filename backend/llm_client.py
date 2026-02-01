"""
LLM Client

This module provides a unified interface for multiple LLM providers using LiteLLM.
Supports: OpenAI, Anthropic, Google Gemini, Ollama, OpenRouter, vLLM
"""

import os
import re
import json
import traceback
from typing import Dict, Any, Optional, List
import litellm
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure LiteLLM settings
litellm.drop_params = True  # Drop unsupported params for different providers


class LLMClient:
    """Unified client for interacting with multiple LLM providers via LiteLLM"""

    def __init__(self):
        """Initialize the LLM client with models from environment variables"""
        self.model_optimize = os.getenv("LLM_MODEL_OPTIMIZE", "gemini/gemini-2.5-flash")
        self.model_analyze = os.getenv("LLM_MODEL_ANALYZE", "gemini/gemini-2.5-flash")

        print("LLM Client initialized:")
        print(f"  Optimize model: {self.model_optimize}")
        print(f"  Analyze model: {self.model_analyze}")

    def generate_optimized_resume(
        self,
        resume_text: str,
        job_posting: str,
        customization: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Generate an optimized resume using the configured LLM

        Args:
            resume_text: Original resume text
            job_posting: Job posting text
            customization: Optional customization parameters

        Returns:
            JSON string representing the optimized resume
        """
        try:
            # Debug the customization data
            print("Customization in LLM Client:")
            print(json.dumps(customization, indent=2) if customization else "No customization")

            # Create prompt with customization
            prompt = self._create_resume_prompt(
                resume_text,
                job_posting,
                customization or {}
            )

            print(f"Prompt length: {len(prompt)} characters")
            print(f"Using model: {self.model_optimize}")

            # Call LiteLLM
            response = litellm.completion(
                model=self.model_optimize,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                top_p=0.95,
                max_tokens=8192,
            )

            # Extract and clean response
            response_text = response.choices[0].message.content
            cleaned_response = self._clean_markdown_from_response(response_text)

            # Try to extract valid JSON from the response
            extracted_json = self._extract_json_object(cleaned_response)
            if extracted_json:
                return extracted_json

            # If extraction failed, return cleaned response and let caller handle parsing
            return cleaned_response

        except Exception as e:
            print(f"Error in generate_optimized_resume: {str(e)}")
            traceback.print_exc()
            # Return valid JSON even on error
            fallback = {
                "name": "Candidate Name",
                "title": "Job Title",
                "contact": {"email": "error@example.com", "phone": "", "location": ""},
                "summary": f"Resume generation error: {str(e)}",
                "skills": {"Technical Skills": [], "Soft Skills": []},
                "experience": [],
                "education": [],
                "certifications": []
            }
            return json.dumps(fallback)

    def analyze_match(self, resume_text: str, job_posting: str) -> Dict[str, Any]:
        """
        Analyze how well the resume matches the job posting

        Args:
            resume_text: The resume text
            job_posting: The job posting text

        Returns:
            A dictionary containing match analysis results
        """
        # Validate inputs
        if not resume_text or not job_posting:
            return {
                "match_score": 0,
                "missing_keywords": [],
                "skill_matches": [],
                "recommendations": ["Unable to analyze: Empty resume or job posting"]
            }

        prompt = self._create_analysis_prompt(resume_text, job_posting)

        try:
            print(f"Using model for analysis: {self.model_analyze}")

            # Call LiteLLM
            response = litellm.completion(
                model=self.model_analyze,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                top_p=0.8,
            )

            # Extract and clean response
            response_text = response.choices[0].message.content
            cleaned_response = self._clean_markdown_from_response(response_text)
            print("Raw analysis response:", cleaned_response)

            # Multiple strategies for JSON extraction
            result = self._extract_analysis_result(cleaned_response)

            # Validate the result to ensure all required fields are present
            return self._validate_analysis_result(result)

        except Exception as e:
            print(f"Comprehensive error in analyze_match: {e}")
            traceback.print_exc()

            return {
                "match_score": 50,
                "missing_keywords": [],
                "skill_matches": [],
                "recommendations": [
                    "Analysis encountered an unexpected error.",
                    f"Error details: {str(e)}",
                    "Please try again or check your input."
                ]
            }

    def extract_keywords(self, resume_text: str) -> List[str]:
        """
        Extract relevant keywords from a resume for job searching

        Args:
            resume_text: The text of the resume

        Returns:
            A list of keywords extracted from the resume
        """
        prompt = f"""
You are KeywordExtractor, an AI specializing in analyzing resumes for job searching.

Extract the most important keywords from this resume that would be useful for finding matching job postings.
Focus on:
1. Technical skills and tools
2. Job titles and roles
3. Industries and domains
4. Qualifications and certifications

Return ONLY a JSON array of strings with the top 10 most relevant keywords. Ensure to pick job titles that would be
most likely to match based on the resume content. Make sure keywords are related to the job titles
that are chosen. Attempt to find jobs that match the experience and qualifications listed in the resume.
Example: ["Python", "Full Stack Developer", "React", "AWS", "Project Management"]

Resume:
```
{resume_text}
```

IMPORTANT: Return ONLY the JSON array. No additional text or explanation.
"""

        try:
            print(f"Using model for keyword extraction: {self.model_analyze}")

            response = litellm.completion(
                model=self.model_analyze,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.2,
                top_p=0.95,
            )

            response_text = response.choices[0].message.content
            cleaned_text = self._clean_markdown_from_response(response_text)

            # Parse JSON array
            keywords = json.loads(cleaned_text.strip())
            if isinstance(keywords, list):
                return [str(k) for k in keywords if k][:15]

        except json.JSONDecodeError:
            # Try regex extraction
            keyword_pattern = r'"([^"]+)"'
            matches = re.findall(keyword_pattern, response_text)
            if matches:
                return matches[:15]
        except Exception as e:
            print(f"Error extracting keywords: {e}")
            traceback.print_exc()

        # Fallback
        return ["software", "developer", "python", "javascript", "react"]

    def _extract_analysis_result(self, text: str) -> Dict[str, Any]:
        """Extract analysis result using multiple strategies"""
        # Strategy 1: Direct JSON extraction
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # Strategy 2: Extract JSON using regex
        try:
            json_match = self._extract_json(text)
            if json_match:
                return json.loads(json_match)
        except json.JSONDecodeError:
            pass

        # Strategy 3: Fallback to manual extraction
        return self._fallback_analysis_extraction(text)

    def _clean_markdown_from_response(self, text: str) -> str:
        """Remove markdown formatting (code blocks, backticks) from text"""
        # Remove code block markers with language specification
        text = re.sub(r'```(?:html|json|[a-zA-Z0-9]+)\n', '', text)
        # Remove ending code block markers
        text = re.sub(r'```', '', text)
        # Remove any remaining backticks
        text = re.sub(r'`', '', text)
        return text.strip()

    def _extract_json(self, text: str) -> Optional[str]:
        """Extract JSON from text that might contain other content"""
        # Try to find JSON between curly braces
        json_pattern = r'(\{[\s\S]*?\})'
        matches = re.findall(json_pattern, text)

        for potential_json in matches:
            try:
                json.loads(potential_json)
                return potential_json
            except json.JSONDecodeError:
                continue

        return None

    def _extract_json_object(self, text: str) -> Optional[str]:
        """Extract a complete JSON object by matching balanced braces"""
        # Find the first opening brace
        start = text.find('{')
        if start == -1:
            return None

        # Count braces to find matching closing brace
        depth = 0
        in_string = False
        escape = False

        for i, char in enumerate(text[start:], start):
            if escape:
                escape = False
                continue

            if char == '\\' and in_string:
                escape = True
                continue

            if char == '"' and not escape:
                in_string = not in_string
                continue

            if in_string:
                continue

            if char == '{':
                depth += 1
            elif char == '}':
                depth -= 1
                if depth == 0:
                    potential_json = text[start:i+1]
                    try:
                        json.loads(potential_json)
                        return potential_json
                    except json.JSONDecodeError:
                        # Try to find next JSON object
                        next_start = text.find('{', start + 1)
                        if next_start != -1:
                            return self._extract_json_object(text[next_start:])
                        return None

        return None

    def _validate_analysis_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and ensure the analysis result has all required fields"""
        validated = {}

        # Ensure match_score is an integer between 0 and 100
        if "match_score" in result and isinstance(result["match_score"], (int, float)):
            validated["match_score"] = min(100, max(0, int(result["match_score"])))
        else:
            validated["match_score"] = 50

        # Ensure other fields are lists
        for field in ["missing_keywords", "skill_matches", "recommendations"]:
            if field in result and isinstance(result[field], list):
                validated[field] = result[field]
            else:
                validated[field] = []

        return validated

    def _fallback_analysis_extraction(self, text: str) -> Dict[str, Any]:
        """Extract analysis information from text when JSON parsing fails"""
        result = {
            "match_score": 50,
            "missing_keywords": [],
            "skill_matches": [],
            "recommendations": []
        }

        # Extract match score
        score_pattern = r'(?:match|score).*?(\d{1,3})%?'
        score_match = re.search(score_pattern, text, re.IGNORECASE)
        if score_match:
            try:
                score = int(score_match.group(1))
                result["match_score"] = min(100, max(0, score))
            except ValueError:
                pass

        def extract_section(section_name: str) -> List[str]:
            section_pattern = rf'{section_name}\s*:?\s*(.*?)(?:\n\n|\Z)'
            section_match = re.search(section_pattern, text, re.IGNORECASE | re.DOTALL)

            if section_match:
                section_text = section_match.group(1)
                items = re.findall(r'[-\*•]?\s*([^,\n]+?)(?:,|\n|$)', section_text)
                return [item.strip() for item in items if item.strip()]

            return []

        result["missing_keywords"] = extract_section('missing keywords')
        result["skill_matches"] = extract_section('matching skills')
        result["recommendations"] = extract_section('recommendations')

        if not result["recommendations"]:
            result["recommendations"] = [
                "Review the job description carefully",
                "Highlight skills that directly match job requirements",
                "Use keywords from the job posting in your resume"
            ]

        return result

    def _create_resume_prompt(
        self,
        resume_text: str,
        job_posting: str,
        customization: Optional[Dict[str, Any]] = None
    ) -> str:
        """Create a prompt for resume optimization with customization options"""

        base_prompt = """
You are ResumePro, an expert professional resume writer with 15+ years of experience
helping job seekers optimize their resumes for specific job applications.

Your task is to transform the given resume to PERFECTLY match the job posting requirements.
Return a JSON object with this structure:

{
"name": "Full Name",
"title": "Optimized Job Title",
"contact": {
    "email": "email@example.com",
    "phone": "Phone Number",
    "location": "City, State"
},
"summary": "Professional summary highlighting key strengths",
"skills": {
    "Technical Skills": ["skill1", "skill2"],
    "Soft Skills": ["skill3", "skill4"]
},
"experience": [
    {
    "position": "Job Title",
    "company": "Company Name",
    "period": "Start Date - End Date",
    "description": [
        "Key achievement with metrics",
        "Another key achievement"
    ]
    }
],
"education": [
    {
    "degree": "Degree Name",
    "institution": "University Name",
    "period": "Graduation Year",
    "details": ["Honors or relevant coursework"]
    }
],
"certifications": [
    {
    "certification": "Certification Name",
    "provider": "Provider Name"
    }
]
}

Guidelines for tailoring the resume:
1. Maintain the candidate's core experience and education, but add keywords that fit into experience to improve match score.
2. Highlight skills that directly match job requirements, add skills to skills section to better match the job posting.
3. Use industry-specific keywords from the job posting
4. Quantify achievements where possible
5. Use strong, impactful action verbs
6. Ensure professional and concise language
7. Any other tips and tricks for getting through a resume ATS screening.
"""

        # Add customization data if provided
        customization_text = ""
        if customization:
            customization_text = "\n\nUSER CUSTOMIZATION:\n"

            if customization.get("selected_skills"):
                skills = customization.get("selected_skills", [])
                if skills:
                    customization_text += f"SKILLS TO ADD: {', '.join(skills)}\n\n"

            if customization.get("custom_keywords"):
                keywords = customization.get("custom_keywords", [])
                if keywords:
                    customization_text += f"KEYWORDS TO EMPHASIZE: {', '.join(keywords)}\n\n"

            if customization.get("custom_experiences"):
                experiences = customization.get("custom_experiences", [])
                if experiences:
                    customization_text += "ADDITIONAL EXPERIENCES TO INTEGRATE:\n"
                    for exp in experiences:
                        section = exp.get("section", "")
                        description = exp.get("description", "")
                        company = exp.get("company", "")

                        if description:
                            section_name = {
                                "work": "Work",
                                "education": "Education",
                                "projects": "Project",
                                "skills": "Skill"
                            }.get(section, section.capitalize())

                            if company:
                                customization_text += f"- Integrate with {company}: {description}\n"
                            else:
                                customization_text += f"- {section_name}: {description}\n"

                    customization_text += "\n"

        final_prompt = base_prompt + customization_text + f"""
Original Resume:
```
{resume_text}
```

Job Posting:
```
{job_posting}
```

IMPORTANT: Return ONLY the valid JSON object. NO ADDITIONAL TEXT."""

        return final_prompt

    def _create_analysis_prompt(self, resume_text: str, job_posting: str) -> str:
        """Create a precision-focused prompt for resume-job posting match analysis"""
        return f"""
You are ResumeAnalyzer, a specialized AI recruitment expert with deep expertise in Applicant Tracking Systems (ATS) and keyword optimization.

Your task is to perform an EXACT keyword-level analysis between a resume and job posting.

CRITICAL ANALYSIS RULES:
1. Extract EXACT phrases and terminology from the job posting - not conceptual categories
2. Ensure "missing_keywords" contains ONLY exact phrases that appear in the job posting but have no equivalent in the resume
3. Ensure "skill_matches" contains ONLY exact matches or clear equivalents between resume and job posting
4. Verify each skill by checking for exact phrasing, not just concept recognition
5. Use granular, phrase-level matching - not general concept mapping

Return a JSON object with this precise structure:
{{
  "match_score": 75,
  "missing_keywords": [
    "exact_missing_phrase1",
    "exact_missing_phrase2"
  ],
  "skill_matches": [
    "exact_matching_term1",
    "exact_matching_term2"
  ],
  "recommendations": [
    "specific_recommendation1",
    "specific_recommendation2",
    "specific_recommendation3"
  ]
}}

ANALYSIS METHODOLOGY:
1. First, extract all specific required skills, tools, technologies and responsibilities as exact phrases from the job posting
2. Second, check each extracted item against the resume using EXACT text matching
3. For each item, classify it as either "missing" or "matching" based on precise wording
4. Do not list a skill as both "matching" and "missing" - if any form of the skill is present, it should be "matching"
5. Avoid generalizing specific named tools into broad categories

For example:
- If job requires "Cortex XSOAR" and resume mentions "SOAR platforms" but not "Cortex XSOAR" specifically, list "Cortex XSOAR" as missing
- If job requires "custom playbook creation" and resume mentions "creating playbooks" then it should be a matching skill

Resume:
```
{resume_text}
```

Job Posting:
```
{job_posting}
```

YOUR RESPONSE MUST BE ONLY A VALID JSON OBJECT WITH EXACT ANALYSIS. No additional text, explanations, or formatting.
"""
