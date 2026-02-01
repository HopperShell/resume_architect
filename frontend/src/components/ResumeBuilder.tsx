import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Briefcase, Upload, Check, Shield, Zap, ChevronRight, Target, ArrowRight, Search, Edit } from 'lucide-react';
import apiService from '../services/api';
import InteractiveResumeReview from './InteractiveResumeReview';

interface ResumeBuilderProps {
  onResumeGenerated?: (html: string, pdfUrl: string | null) => void;
  initialJobPosting?: string;
  onJobSearch?: () => void;
}

interface MatchAnalysis {
  match_score: number;
  missing_keywords: string[];
  skill_matches: string[];
  recommendations: string[];
}

interface CustomExperience {
  id: string;
  section: 'work' | 'education' | 'projects' | 'skills';
  title?: string;
  company?: string;
  period?: string;
  description: string;
}

function ResumeBuilder({ 
  onResumeGenerated,
  initialJobPosting = '',
  onJobSearch
}: ResumeBuilderProps) {
  const [resumeText, setResumeText] = useState<string>('');
  const [jobPostingText, setJobPostingText] = useState<string>(initialJobPosting);
  const [activeTab, setActiveTab] = useState<string>('resume');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [optimizedResumeHtml, setOptimizedResumeHtml] = useState<string>('');
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [matchAnalysis, setMatchAnalysis] = useState<MatchAnalysis>({
    match_score: 0,
    missing_keywords: [],
    skill_matches: [],
    recommendations: []
  });
  
  // New state variables for the interactive review process
  const [showInteractiveReview, setShowInteractiveReview] = useState<boolean>(false);
  const [selectedMissingSkills, setSelectedMissingSkills] = useState<string[]>([]);
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [customExperiences, setCustomExperiences] = useState<CustomExperience[]>([]);
  
  // Handle initialJobPosting changes
  useEffect(() => {
    if (initialJobPosting) {
      setJobPostingText(initialJobPosting);
      setActiveTab('job');
    }
  }, [initialJobPosting]);
  
  const handleResumeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value);
  };
  
  const handleJobPostingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobPostingText(e.target.value);
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
  
  const analyzeMatch = async () => {
    if (resumeText.length === 0 || jobPostingText.length === 0) {
      alert('Please provide both resume and job posting text');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await apiService.analyzeMatch(resumeText, jobPostingText);
      setMatchScore(result.match_score);
      setMatchAnalysis({
        match_score: result.match_score,
        missing_keywords: result.missing_keywords || [],
        skill_matches: result.skill_matches || [],
        recommendations: result.recommendations || []
      });
      
      // Show the interactive review after analysis
      setShowInteractiveReview(true);
    } catch (error) {
      console.error('Error analyzing match:', error);
      alert('Error analyzing the resume match. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Updated function to handle the customization data from interactive review
  const handleInteractiveReviewComplete = async (
    selectedSkills: string[],
    keywords: string[],
    experiences: CustomExperience[]
  ) => {
    setSelectedMissingSkills(selectedSkills);
    setCustomKeywords(keywords);
    setCustomExperiences(experiences);
    
    // Now generate the optimized resume with the customization data
    await generateResume(selectedSkills, keywords, experiences);
  };
  
  // Modified function to accept customization parameters
  const generateResume = async (
    selectedSkills: string[] = [],
    customKeywords: string[] = [],
    customExperiences: CustomExperience[] = []
  ) => {
    if (resumeText.length === 0 || jobPostingText.length === 0) {
      alert('Please provide both resume and job posting text');
      return;
    }
    
    setIsLoading(true);
    try {
      // We would need to modify the API to accept these new parameters
      // For now, let's assume we have an enhanced version of optimizeResume that accepts them
      const result = await apiService.optimizeResume(
        resumeText, 
        jobPostingText,
        {
          selectedSkills,
          customKeywords,
          customExperiences
        }
      );
      
      setOptimizedResumeHtml(result.html);
      setPdfUrl(result.pdf_url || '');
      
      // Hide the interactive review
      setShowInteractiveReview(false);
      
      // Call the callback function if provided
      if (onResumeGenerated) {
        onResumeGenerated(result.html, result.pdf_url);
      }
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Error generating the optimized resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const showOptimizedResume = () => {
    // Create a new window and write the HTML to it
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(optimizedResumeHtml);
      newWindow.document.close();
    }
  };
  
  // Handler for job search button
  const handleJobSearchClick = () => {
    if (onJobSearch) {
      onJobSearch();
    }
  };
  
  // Helper function to go back from interactive review to resume/job editing
  const handleBackFromReview = () => {
    setShowInteractiveReview(false);
  };
  
  // If we're showing the interactive review, render that instead of the main form
  if (showInteractiveReview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-indigo-600 to-blue-500 p-2 rounded-xl mb-6">
              <div className="bg-white rounded-lg px-4 py-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                  Resume Architect
                </h1>
              </div>
            </div>
            <p className="text-xl text-indigo-700 max-w-2xl mx-auto">
              Customize your resume with your actual skills and experience
            </p>
          </div>
          
          <InteractiveResumeReview
            matchAnalysis={matchAnalysis}
            resumeText={resumeText}
            jobPostingText={jobPostingText}
            onContinue={handleInteractiveReviewComplete}
            onBack={handleBackFromReview}
            isLoading={isLoading}
          />
        </div>
      </div>
    );
  }
  
  // Otherwise, render the main resume builder form
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-indigo-600 to-blue-500 p-2 rounded-xl mb-6">
            <div className="bg-white rounded-lg px-4 py-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-700 to-blue-600 bg-clip-text text-transparent">
                Resume Architect
              </h1>
            </div>
          </div>
          <p className="text-xl text-indigo-700 max-w-2xl mx-auto">
            AI-powered resume tailoring for job-specific applications
          </p>
        </div>
        
        {/* Main Content */}
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Left Column - Content Input */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
              {/* Tabs */}
              <div className="flex border-b">
                <button
                  className={`flex-1 py-4 px-6 text-center focus:outline-none transition-colors ${
                    activeTab === 'resume' 
                      ? 'bg-indigo-50 text-indigo-700 font-medium border-b-2 border-indigo-500' 
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                  onClick={() => setActiveTab('resume')}
                >
                  <div className="flex items-center justify-center">
                    <FileText className="w-5 h-5 mr-2" />
                    <span>Your Resume</span>
                  </div>
                </button>
                <button
                  className={`flex-1 py-4 px-6 text-center focus:outline-none transition-colors ${
                    activeTab === 'job' 
                      ? 'bg-indigo-50 text-indigo-700 font-medium border-b-2 border-indigo-500' 
                      : 'text-gray-600 hover:text-indigo-600'
                  }`}
                  onClick={() => setActiveTab('job')}
                >
                  <div className="flex items-center justify-center">
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span>Job Posting</span>
                  </div>
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'resume' ? (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <FileText className="w-6 h-6 text-indigo-600 mr-3" />
                        <h2 className="text-xl font-semibold text-gray-800">Your Resume Content</h2>
                      </div>
                      
                      {/* Job Search Button */}
                      <button
                        className="flex items-center bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg hover:bg-indigo-200 transition-colors"
                        onClick={handleJobSearchClick}
                      >
                        <Search className="w-4 h-4 mr-2" />
                        <span>Find Jobs</span>
                      </button>
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

                        {/* Add the upload button here */}
                        <label
                          htmlFor="resume-file-input"
                          className="inline-flex items-center justify-center mt-4 bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          <span>Upload from device</span>
                        </label>
                        <input
                          id="resume-file-input"
                          type="file"
                          className="hidden"
                          accept=".txt,.md,text/plain"
                          onChange={handleFileSelect}
                          disabled={isLoading}
                        />
                      </div>
                      
                      <textarea
                        className="w-full h-64 mt-4 p-4 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Paste your plain-text resume here..."
                        value={resumeText}
                        onChange={handleResumeChange}
                        disabled={isLoading}
                      ></textarea>
                    </div>
                    
                    <div className="mt-4 flex justify-end">
                      <button 
                        className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
                        onClick={() => setActiveTab('job')}
                        disabled={isLoading}
                      >
                        <span>Continue to Job Posting</span>
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center mb-4">
                      <Briefcase className="w-6 h-6 text-indigo-600 mr-3" />
                      <h2 className="text-xl font-semibold text-gray-800">Job Posting Details</h2>
                    </div>
                    
                    <div className="border-2 border-dashed rounded-xl p-6 border-gray-300 hover:border-indigo-400 transition-all">
                      <div className="text-center mb-4">
                        <Target className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
                        <p className="text-gray-600">
                          Paste the job description to tailor your resume
                        </p>
                      </div>
                      
                      <textarea
                        className="w-full h-64 mt-4 p-4 text-gray-700 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                        placeholder="Paste the job posting text here..."
                        value={jobPostingText}
                        onChange={handleJobPostingChange}
                        disabled={isLoading}
                      ></textarea>
                    </div>
                    
                    <div className="mt-4 flex justify-between">
                      <button 
                        className="text-indigo-600 font-medium flex items-center hover:text-indigo-800"
                        onClick={() => setActiveTab('resume')}
                        disabled={isLoading}
                      >
                        <ArrowRight className="mr-2 w-4 h-4 transform rotate-180" />
                        <span>Back to Resume</span>
                      </button>
                      
                      <button
                        className="bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg font-medium hover:bg-indigo-200 transition-colors disabled:opacity-50"
                        onClick={analyzeMatch}
                        disabled={isLoading || !resumeText || !jobPostingText}
                      >
                        {isLoading ? 'Analyzing...' : 'Analyze Match'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Button */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6">
                <button 
                  className="w-full bg-white text-indigo-700 py-3 px-6 rounded-lg font-semibold flex items-center justify-center hover:bg-indigo-50 transition-colors group disabled:opacity-50"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onClick={analyzeMatch}
                  disabled={isLoading || !resumeText || !jobPostingText}
                >
                  <span>{isLoading ? 'Processing...' : 'Analyze and Customize Resume'}</span>
                  <ChevronRight className={`ml-2 w-5 h-5 transition-transform duration-300 ${isHovering ? 'transform translate-x-1' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Match Score (conditionally rendered) */}
            {matchScore !== null && !showInteractiveReview && (
              <div className="mt-6 bg-white rounded-2xl shadow-lg p-6 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Resume Match Analysis</h3>
                  <div className="text-sm text-gray-500">Updated just now</div>
                </div>
                
                <div className="bg-gray-100 rounded-full h-6 mb-4">
                  <div 
                    className={`h-6 rounded-full ${
                      matchScore >= 80 
                        ? 'bg-green-500' 
                        : matchScore >= 70 
                          ? 'bg-yellow-500' 
                          : 'bg-red-500'
                    }`}
                    style={{ width: `${matchScore}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-3xl font-bold text-indigo-700">{matchScore}%</div>
                    <div className="text-gray-600">Match Score</div>
                  </div>
                  
                  <div className="flex flex-col">
                    {optimizedResumeHtml && (
                      <div className="flex items-center justify-end mb-3">
                        <button 
                          className="bg-indigo-100 text-indigo-700 py-2 px-4 rounded-lg font-medium hover:bg-indigo-200 transition-colors mr-3"
                          onClick={showOptimizedResume}
                        >
                          View Resume
                        </button>
                        
                        {pdfUrl && (
                          <a 
                            href={apiService.getDownloadUrl("optimized_resume.pdf")} 
                            className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Download PDF
                          </a>
                        )}
                      </div>
                    )}
                    
                    {matchAnalysis.recommendations.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold text-indigo-800 mb-2">Recommendations:</h4>
                        <ul className="text-sm text-gray-700">
                          {matchAnalysis.recommendations.slice(0, 3).map((rec, idx) => (
                            <li key={idx} className="mb-1 flex items-start">
                              <div className="text-green-500 mr-2 mt-1">
                                <Check className="w-4 h-4" />
                              </div>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                {matchAnalysis.missing_keywords.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-2">Missing Keywords:</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchAnalysis.missing_keywords.map((keyword, idx) => (
                        <span key={idx} className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {matchAnalysis.skill_matches.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Matching Skills:</h4>
                    <div className="flex flex-wrap gap-2">
                      {matchAnalysis.skill_matches.map((skill, idx) => (
                        <span key={idx} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* New button to enter interactive review */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <button
                    className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold flex items-center justify-center hover:bg-indigo-700 transition-colors"
                    onClick={() => setShowInteractiveReview(true)}
                  >
                    <Edit className="mr-2 w-5 h-5" />
                    <span>Customize Your Resume</span>
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Column - Features */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500 transition-transform hover:scale-105 duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-semibold text-gray-800">AI-Powered Matching</h3>
                  <p className="mt-2 text-gray-600">
                    Our system identifies key requirements from the job posting and highlights areas to emphasize in your resume.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 transition-transform hover:scale-105 duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gradient-to-r from-green-500 to-teal-500 p-3 rounded-lg">
                  <Check className="w-6 h-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-semibold text-gray-800">Interactive Customization</h3>
                  <p className="mt-2 text-gray-600">
                    Review AI recommendations and add your own experience to create a perfectly tailored resume that accurately reflects your skills.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 transition-transform hover:scale-105 duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-semibold text-gray-800">ATS-Friendly Format</h3>
                  <p className="mt-2 text-gray-600">
                    Ensures your resume passes through Applicant Tracking Systems with optimized formatting and content structure.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Job Search Feature Promotion */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 transition-transform hover:scale-105 duration-300">
              <div className="flex items-start">
                <div className="flex-shrink-0 bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
                  <Search className="w-6 h-6 text-white" />
                </div>
                <div className="ml-5">
                  <h3 className="text-lg font-semibold text-gray-800">Job Search</h3>
                  <p className="mt-2 text-gray-600">
                    Find matching job opportunities based on your resume. Our AI extracts key skills and searches for relevant openings.
                  </p>
                  <button
                    onClick={handleJobSearchClick}
                    className="mt-3 inline-flex items-center text-purple-600 hover:text-purple-800 transition-colors"
                  >
                    <span>Try Job Search</span>
                    <ArrowRight className="ml-1 w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Testimonial */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="mb-4">
                <svg className="h-10 w-10 text-white opacity-30" fill="currentColor" viewBox="0 0 32 32">
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
              </div>
              <p className="text-lg mb-4">
                "I applied to my dream job using this tool. The resume analyzer helped me match my experience with exactly what they were looking for. I got the interview and the job!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center text-white font-bold">
                  AM
                </div>
                <div className="ml-3">
                  <p className="font-medium">Alex Morgan</p>
                  <p className="text-sm text-blue-200">Marketing Director</p>
                </div>
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
}

export default ResumeBuilder;