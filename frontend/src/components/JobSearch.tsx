// components/JobSearch.tsx

import React, { useState, useCallback } from 'react';
import { FileText, Search, Upload, Briefcase, Clock, MapPin, Building, Tag, ArrowRight, ChevronRight, RefreshCw } from 'lucide-react';
import apiService from '../services/api';

interface Job {
  title: string;
  company: string;
  location: string;
  date_posted: string;
  job_url: string;
  description: string;
  salary?: string;
}

interface JobSearchProps {
  onSelectJob: (jobPosting: string, jobTitle: string) => void;
}

const JobSearch: React.FC<JobSearchProps> = ({ onSelectJob }) => {
  const [resumeText, setResumeText] = useState<string>('');
  const [extractedKeywords, setExtractedKeywords] = useState<string[]>([]);
  const [customKeywords, setCustomKeywords] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  
  // Add URL sanitizer function
  const sanitizeUrl = (url: string): string => {
    if (!url) return '#';
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return url;
      }
    } catch (e) {
      // URL parsing failed
    }
    return '#';
  };
  
  const handleResumeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value);
    // Reset keywords when resume changes
    setExtractedKeywords([]);
  };
  
  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomKeywords(e.target.value);
  };
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    // Handle file drop
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Only process text files
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        setIsLoading(true);
        try {
          const text = await apiService.uploadResume(file);
          setResumeText(text);
          // Reset keywords when resume changes
          setExtractedKeywords([]);
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('Error uploading file. Please try again or paste the content manually.');
        } finally {
          setIsLoading(false);
        }
      } else {
        alert('Please upload a text file (.txt or .md)');
      }
    }
  }, []);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Only process text files
      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        setIsLoading(true);
        try {
          const text = await apiService.uploadResume(file);
          setResumeText(text);
          // Reset keywords when resume changes (only needed in JobSearch.tsx)
          if (typeof setExtractedKeywords === 'function') {
            setExtractedKeywords([]);
          }
        } catch (error) {
          console.error('Error uploading file:', error);
          alert('Error uploading file. Please try again or paste the content manually.');
        } finally {
          setIsLoading(false);
        }
      } else {
        alert('Please upload a text file (.txt or .md)');
      }
    }
  }, []);
  
  const extractKeywords = async () => {
    if (resumeText.length === 0) {
      alert('Please provide your resume text first');
      return;
    }
    
    setIsLoading(true);
    try {
      const keywords = await apiService.extractKeywords(resumeText);
      setExtractedKeywords(keywords);
      setCustomKeywords(keywords.join(', '));
    } catch (error) {
      console.error('Error extracting keywords:', error);
      alert('Error extracting keywords. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const searchJobs = async () => {
    let keywords: string[] = [];
    
    // Use custom keywords if provided, otherwise use extracted keywords
    if (customKeywords.trim()) {
      keywords = customKeywords.split(',').map(kw => kw.trim()).filter(kw => kw.length > 0);
    } else if (extractedKeywords.length > 0) {
      keywords = extractedKeywords;
    } else if (resumeText.length > 0) {
      // Extract keywords first if we have resume text but no keywords yet
      await extractKeywords();
      return; // Will call searchJobs again after keywords are extracted
    } else {
      alert('Please provide either a resume or custom search keywords');
      return;
    }
    
    if (keywords.length === 0) {
      alert('Please provide search keywords');
      return;
    }
    
    setIsSearching(true);
    try {
      const jobResults = await apiService.searchJobs(keywords);
      setJobs(jobResults);
    } catch (error) {
      console.error('Error searching jobs:', error);
      alert('Error searching for jobs. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleJobSelect = (job: Job) => {
    setSelectedJobId(job.job_url);
    // Pass the job description and title to the parent component
    if (onSelectJob) {
      console.log("Sending job to parent:", job.title);
      onSelectJob(job.description, job.title);
    } else {
      console.error("onSelectJob prop is not defined");
    }
  };
  
  const toggleJobExpand = (jobId: string) => {
    if (expandedJobId === jobId) {
      setExpandedJobId(null);
    } else {
      setExpandedJobId(jobId);
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return dateString; // Return original string if parsing fails
      }
      
      // Get relative time (today, yesterday, or days ago)
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return 'Today';
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else {
        // Format as MM/DD/YYYY for older dates
        return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
      }
    } catch (e) {
      return dateString; // Return original if any error occurs
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-blue-500 p-2 rounded-xl mb-6">
            <div className="bg-white rounded-lg px-4 py-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                Job Search
              </h1>
            </div>
          </div>
          <p className="text-xl text-indigo-700 max-w-2xl mx-auto">
            Find job opportunities that match your skills and experience
          </p>
        </div>
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Resume Upload */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <FileText className="w-6 h-6 text-indigo-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-800">Upload Your Resume</h2>
                </div>
                
                <div 
                  className={`border-2 border-dashed rounded-xl p-6 transition-all ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : isLoading
                        ? 'border-gray-300 bg-gray-50'
                        : 'border-gray-300 hover:border-indigo-400'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragOver={(e) => e.preventDefault()}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="text-center mb-4">
                    <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
                    <p className="text-gray-600">
                      {isLoading 
                        ? 'Processing file...' 
                        : 'Drag & drop a text file or paste your resume below'}
                    </p>
                    <label
                        htmlFor="job-search-file-input" 
                        className="inline-flex items-center justify-center mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                        <Upload className="w-4 h-4 mr-2" />
                        <span>Upload from Device</span>
                    
                    </label>
                    <input
                        id="job-search-file-input" 
                        type="file" 
                        className="hidden"
                        accept=".txt,.md,text/plain" 
                        onChange={handleFileSelect}
                        disabled={isLoading}
                      />                
                  </div>
                  
                  <textarea
                    className="w-full h-48 mt-4 p-4 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="Paste your plain-text resume here..."
                    value={resumeText}
                    onChange={handleResumeChange}
                    disabled={isLoading}
                  ></textarea>
                </div>
                
                <button
                  className="w-full mt-4 bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  onClick={extractKeywords}
                  disabled={isLoading || !resumeText}
                >
                  <Tag className="w-5 h-5 mr-2" />
                  <span>{isLoading ? 'Extracting...' : 'Extract Keywords'}</span>
                </button>
              </div>
            </div>
            
            {/* Keywords Section */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Tag className="w-6 h-6 text-indigo-600 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-800">Search Keywords</h2>
                </div>
                
                {extractedKeywords.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Extracted Keywords:</h3>
                    <div className="flex flex-wrap gap-2">
                      {extractedKeywords.map((keyword, idx) => (
                        <span key={idx} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="custom-keywords" className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Keywords (comma separated):
                  </label>
                  <input
                    id="custom-keywords"
                    type="text"
                    className="w-full p-3 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="e.g. Python, React, Project Management"
                    value={customKeywords}
                    onChange={handleKeywordsChange}
                    disabled={isLoading || isSearching}
                  />
                </div>
                
                <button
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
                  onClick={searchJobs}
                  disabled={isLoading || isSearching || (!resumeText && !customKeywords)}
                >
                  <Search className="w-5 h-5 mr-2" />
                  <span>{isSearching ? 'Searching...' : 'Search Jobs'}</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column - Job Results */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Briefcase className="w-6 h-6 text-indigo-600 mr-3" />
                    <h2 className="text-xl font-semibold text-gray-800">Job Matches</h2>
                  </div>
                  
                  {jobs.length > 0 && (
                    <div className="text-sm text-gray-500">
                      Found {jobs.length} matching jobs
                    </div>
                  )}
                </div>
                
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
                    <p className="text-gray-600">Searching for matching jobs...</p>
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Search className="w-12 h-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-2">No job matches found yet</p>
                    <p className="text-gray-500 text-sm max-w-md">
                      Upload your resume and extract keywords or enter custom keywords to find matching jobs
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div 
                        key={job.job_url}
                        className={`border rounded-lg overflow-hidden transition-all ${
                          selectedJobId === job.job_url
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex justify-between">
                            <h3 className="font-semibold text-lg text-gray-800">{job.title}</h3>
                            <span className="text-sm text-gray-500">{formatDate(job.date_posted)}</span>
                          </div>
                          
                          <div className="mt-2 space-y-2">
                            <div className="flex items-center text-gray-600">
                              <Building className="w-4 h-4 mr-2" />
                              <span>{job.company}</span>
                            </div>
                            
                            {job.location && (
                              <div className="flex items-center text-gray-600">
                                <MapPin className="w-4 h-4 mr-2" />
                                <span>{job.location}</span>
                              </div>
                            )}
                            
                            {job.salary && (
                              <div className="flex items-center text-gray-600">
                                <span className="font-medium">Salary:</span>
                                <span className="ml-2">{job.salary}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {customKeywords.split(',').slice(0, 5).map((keyword, idx) => (
                              <span key={idx} className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
                                {keyword.trim()}
                              </span>
                            ))}
                          </div>
                          
                          {expandedJobId === job.job_url && (
                            <div className="mt-4 p-3 bg-gray-50 rounded border border-gray-200">
                              <h4 className="font-medium text-gray-800 mb-2">Job Description:</h4>
                              <p className="text-gray-700 text-sm whitespace-pre-line">
                                {job.description.length > 300 
                                  ? `${job.description.substring(0, 300)}...` 
                                  : job.description}
                              </p>
                              {job.job_url && (
                                <a 
                                  href={sanitizeUrl(job.job_url)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center mt-2"
                                >
                                  <span>View full job posting</span>
                                  <ArrowRight className="w-3 h-3 ml-1" />
                                </a>
                              )}
                            </div>
                          )}
                          
                          <div className="flex justify-between mt-4">
                            <button
                              className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center"
                              onClick={() => toggleJobExpand(job.job_url)}
                            >
                              <span>{expandedJobId === job.job_url ? 'Show less' : 'Show more'}</span>
                              <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${
                                expandedJobId === job.job_url ? 'transform rotate-90' : ''
                              }`} />
                            </button>
                            
                            <button
                              className="bg-indigo-600 text-white py-1 px-3 rounded text-sm hover:bg-indigo-700 transition-colors"
                              onClick={() => handleJobSelect(job)}
                            >
                              Tailor Resume
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="mt-16 text-center">
          <p className="text-indigo-600 font-medium">© 2025 Resume Architect • AI-powered resume tailoring service</p>
        </footer>
      </div>
    </div>
  );
};

export default JobSearch;