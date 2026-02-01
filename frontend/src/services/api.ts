// services/api.ts

// Backend API URL - adjust based on your environment
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ApiService {
  // Helper method to get standard headers
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json'
    };
  }

  // Upload a resume file and return its text content
  async uploadResume(file: File): Promise<string> {
    try {
      // No headers needed for FormData

      const formData = new FormData();
      formData.append('resume_file', file);

      const response = await fetch(`${API_URL}/upload-resume`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed with status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();
      return data.resume_text;
    } catch (error) {
      console.error('Resume Upload Error:', error);
      throw error;
    }
  }

  // Extract keywords from resume text
  async extractKeywords(resumeText: string): Promise<string[]> {
    try {
      const headers = this.getHeaders();

      const response = await fetch(`${API_URL}/extract-keywords`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ resume_text: resumeText })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Keyword extraction failed with status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();
      return data.keywords;
    } catch (error) {
      console.error('Error extracting keywords:', error);
      throw error;
    }
  }

  // Analyze the match between resume and job posting
  async analyzeMatch(resumeText: string, jobPostingText: string): Promise<{
    match_score: number;
    missing_keywords: string[];
    skill_matches: string[];
    recommendations: string[];
  }> {
    try {
      const headers = this.getHeaders();

      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          resume_text: resumeText,
          job_posting: jobPostingText
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Match analysis failed with status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error analyzing match:', error);
      throw error;
    }
  }

  // Optimize a resume based on job posting
  async optimizeResume(
    resumeText: string, 
    jobPostingText: string,
    customization?: {
      selectedSkills?: string[];
      customKeywords?: string[];
      customExperiences?: any[];
    }
  ): Promise<{
    html: string;
    pdf_url: string | null;
  }> {
    try {
      const headers = this.getHeaders();

      const response = await fetch(`${API_URL}/optimize`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          resume_text: resumeText,
          job_posting: jobPostingText,
          customization: customization || undefined
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Resume optimization failed with status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating optimized resume:', error);
      throw error;
    }
  }

  // Search for jobs based on keywords
  async searchJobs(keywords: string[]): Promise<any[]> {
    try {
      const headers = this.getHeaders();

      const response = await fetch(`${API_URL}/search-jobs`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          keywords,
          days_ago: 3,
          limit: 20
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Job search failed with status: ${response.status}. ${errorText}`);
      }

      const data = await response.json();
      return data.jobs || [];
    } catch (error) {
      console.error('Error searching jobs:', error);
      // Return empty array as fallback
      return [];
    }
  }

  // Get download URL for files
  getDownloadUrl(filename: string): string {
    return `${API_URL}/download/${filename}`;
  }
}

export default new ApiService();