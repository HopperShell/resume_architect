import React, { useState, useEffect } from 'react';
import {
  Check,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  AlertTriangle
} from 'lucide-react';

interface InteractiveResumeReviewProps {
  matchAnalysis: {
    match_score: number;
    missing_keywords: string[];
    skill_matches: string[];
    recommendations: string[];
  };
  resumeText: string;
  jobPostingText: string;
  onContinue: (
    selectedMissingSkills: string[],
    customKeywords: string[],
    customExperiences: CustomExperience[]
  ) => void;
  onBack: () => void;
  isLoading?: boolean;
}

interface CustomExperience {
  id: string;
  section: 'work' | 'education' | 'projects' | 'skills';
  title?: string;
  company?: string;
  period?: string;
  description: string;
}

interface ResumeExperience {
  title: string;
  company?: string;
  period?: string;
}

// Function to extract career history from resume text
const extractCareerHistory = (text: string): ResumeExperience[] => {
  const experiences: ResumeExperience[] = [];
  
  // Split by lines to process each potential job entry
  const lines = text.split('\n');
  
  // Track if we're in the experience section
  let inExperienceSection = false;
  let currentJob: Partial<ResumeExperience> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for experience section header
    if (/^(EXPERIENCE|WORK EXPERIENCE|EMPLOYMENT|WORK HISTORY)/i.test(line)) {
      inExperienceSection = true;
      continue;
    }
    
    // If we reach another major section, we're done with experience
    if (inExperienceSection && /^(EDUCATION|SKILLS|CERTIFICATIONS|PROJECTS)/i.test(line)) {
      inExperienceSection = false;
      
      // Save any pending job
      if (currentJob.title) {
        experiences.push(currentJob as ResumeExperience);
        currentJob = {};
      }
      
      continue;
    }
    
    if (inExperienceSection) {
      // Look for job title and company patterns
      const titleCompanyMatch = line.match(/^([\w\s.]+)\s+(?:[-–—]|at)\s+([\w\s&.,]+)/i);
      
      if (titleCompanyMatch) {
        // Save any previous job being processed
        if (currentJob.title) {
          experiences.push(currentJob as ResumeExperience);
        }
        
        // Start a new job
        currentJob = {
          title: titleCompanyMatch[1].trim(),
          company: titleCompanyMatch[2].trim()
        };
        
        // Look for period on this line or next line
        const dateMatch = line.match(/(\w+\s+\d{4}\s*[-–—]\s*(?:\w+\s+\d{4}|Present))/i) || 
                          (lines[i+1] && lines[i+1].match(/(\w+\s+\d{4}\s*[-–—]\s*(?:\w+\s+\d{4}|Present))/i));
        
        if (dateMatch) {
          currentJob.period = dateMatch[1].trim();
        }
      }
    }
  }
  
  // Add the last job if needed
  if (currentJob.title) {
    experiences.push(currentJob as ResumeExperience);
  }
  
  return experiences;
}

// Similar function for education history
const extractEducationHistory = (text: string): ResumeExperience[] => {
  const educations: ResumeExperience[] = [];
  
  // Split by lines to process each potential education entry
  const lines = text.split('\n');
  
  // Track if we're in the education section
  let inEducationSection = false;
  let currentEducation: Partial<ResumeExperience> = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Look for education section header
    if (/^(EDUCATION|ACADEMIC BACKGROUND)/i.test(line)) {
      inEducationSection = true;
      continue;
    }
    
    // If we reach another major section, we're done with education
    if (inEducationSection && /^(EXPERIENCE|WORK|SKILLS|CERTIFICATIONS|PROJECTS)/i.test(line)) {
      inEducationSection = false;
      
      // Save any pending education
      if (currentEducation.title) {
        educations.push(currentEducation as ResumeExperience);
        currentEducation = {};
      }
      
      continue;
    }
    
    if (inEducationSection) {
      // Look for degree and institution patterns
      const degreeInstitutionMatch = line.match(/^([\w\s.]+in[\w\s.]+)\s+(?:[-–—]|from|at)\s+([\w\s&.,]+)/i) ||
                                    line.match(/^([\w\s.]+)\s+(?:[-–—]|from|at)\s+([\w\s&.,]+)/i);
      
      if (degreeInstitutionMatch) {
        // Save any previous education being processed
        if (currentEducation.title) {
          educations.push(currentEducation as ResumeExperience);
        }
        
        // Start a new education entry
        currentEducation = {
          title: degreeInstitutionMatch[1].trim(),
          company: degreeInstitutionMatch[2].trim() // Using company field for institution
        };
        
        // Look for graduation year
        const yearMatch = line.match(/(\d{4})/) || 
                         (lines[i+1] && lines[i+1].match(/(\d{4})/));
        
        if (yearMatch) {
          currentEducation.period = yearMatch[1].trim();
        }
      }
    }
  }
  
  // Add the last education if needed
  if (currentEducation.title) {
    educations.push(currentEducation as ResumeExperience);
  }
  
  return educations;
}

const InteractiveResumeReview: React.FC<InteractiveResumeReviewProps> = ({
  matchAnalysis,
  resumeText,
  jobPostingText,
  onContinue,
  onBack,
  isLoading = false
}) => {
  // State for selected missing skills
  const [selectedMissingSkills, setSelectedMissingSkills] = useState<string[]>([]);
  
  // State for custom keywords
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState<string>('');
  
  // State for custom experiences
  const [customExperiences, setCustomExperiences] = useState<CustomExperience[]>([]);
  const [newExperience, setNewExperience] = useState<CustomExperience>({
    id: Math.random().toString(36).substring(2, 9),
    section: 'work',
    title: '',
    company: '',
    period: '',
    description: ''
  });
  
  // State for parsed resume experiences
  const [careerHistory, setCareerHistory] = useState<ResumeExperience[]>([]);
  const [educationHistory, setEducationHistory] = useState<ResumeExperience[]>([]);
  
  // State for accordion sections
  const [openSections, setOpenSections] = useState({
    missingSkills: true,
    customKeywords: true,
    customExperiences: true
  });
  
  // Parse resume on component mount
  useEffect(() => {
    if (resumeText) {
      const extractedJobs = extractCareerHistory(resumeText);
      const extractedEducation = extractEducationHistory(resumeText);
      
      setCareerHistory(extractedJobs);
      setEducationHistory(extractedEducation);
      
      console.log('Extracted jobs:', extractedJobs);
      console.log('Extracted education:', extractedEducation);
    }
  }, [resumeText]);
  
  // Handle toggle missing skill selection
  const toggleSkill = (skill: string) => {
    if (selectedMissingSkills.includes(skill)) {
      setSelectedMissingSkills(selectedMissingSkills.filter(s => s !== skill));
    } else {
      setSelectedMissingSkills([...selectedMissingSkills, skill]);
    }
  };
  
  // Handle adding a new custom keyword
  const addCustomKeyword = () => {
    if (newKeyword.trim() && !customKeywords.includes(newKeyword.trim())) {
      setCustomKeywords([...customKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };
  
  // Handle removing a custom keyword
  const removeCustomKeyword = (keyword: string) => {
    setCustomKeywords(customKeywords.filter(k => k !== keyword));
  };
  
  // Handle selecting a career history item
  const selectCareerItem = (experience: ResumeExperience) => {
    setNewExperience({
      ...newExperience,
      title: experience.title || '',
      company: experience.company || '',
      period: experience.period || '',
    });
  };
  
  // Handle selecting an education history item
  const selectEducationItem = (education: ResumeExperience) => {
    setNewExperience({
      ...newExperience,
      title: education.title || '',
      company: education.company || '',
      period: education.period || '',
    });
  };
  
  // Handle adding a new custom experience
  const addCustomExperience = () => {
    if (newExperience.description.trim()) {
      setCustomExperiences([...customExperiences, newExperience]);
      setNewExperience({
        id: Math.random().toString(36).substring(2, 9),
        section: 'work',
        title: '',
        company: '',
        period: '',
        description: ''
      });
    }
  };
  
  // Handle removing a custom experience
  const removeCustomExperience = (id: string) => {
    setCustomExperiences(customExperiences.filter(exp => exp.id !== id));
  };
  
  // Handle toggling accordion sections
  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections({
      ...openSections,
      [section]: !openSections[section]
    });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    onContinue(selectedMissingSkills, customKeywords, customExperiences);
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Resume Review & Customization</h2>
      
      <div className="mb-6 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
        <div className="flex items-start">
          <AlertTriangle className="w-5 h-5 text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-indigo-700">
            Review the analysis below and customize your resume before final generation. 
            This ensures your resume accurately reflects your true skills and experience 
            while maximizing your match score.
          </p>
        </div>
      </div>
      
      {/* Match Score Summary */}
      <div className="mb-6 p-4 border border-gray-200 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-800">Current Match Score</h3>
          <span className={`font-bold text-lg ${
            matchAnalysis.match_score >= 80 
              ? 'text-green-600' 
              : matchAnalysis.match_score >= 60 
                ? 'text-yellow-600' 
                : 'text-red-600'
          }`}>
            {matchAnalysis.match_score}%
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className={`h-2.5 rounded-full ${
              matchAnalysis.match_score >= 80 
                ? 'bg-green-600' 
                : matchAnalysis.match_score >= 60 
                  ? 'bg-yellow-600' 
                  : 'bg-red-600'
            }`}
            style={{ width: `${matchAnalysis.match_score}%` }}
          ></div>
        </div>
      </div>
      
      {/* Missing Skills Section */}
      <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection('missingSkills')}
        >
          <h3 className="font-semibold text-gray-800">Missing Skills & Keywords</h3>
          {openSections.missingSkills ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
        
        {openSections.missingSkills && (
          <div className="p-4">
            <p className="mb-3 text-gray-600">
              Select the skills below that you actually have, but weren't mentioned in your resume:
            </p>
            
            {matchAnalysis.missing_keywords.length === 0 ? (
              <p className="text-green-600 italic">No missing skills detected!</p>
            ) : (
              <div className="flex flex-wrap gap-2 mb-4">
                {matchAnalysis.missing_keywords.map((skill) => (
                  <button
                    key={skill}
                    className={`px-3 py-1 rounded-full text-sm font-medium flex items-center ${
                      selectedMissingSkills.includes(skill)
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                        : 'bg-gray-100 text-gray-800 border border-gray-200'
                    }`}
                    onClick={() => toggleSkill(skill)}
                  >
                    <span className={`w-4 h-4 mr-1 rounded-full flex items-center justify-center ${
                      selectedMissingSkills.includes(skill) 
                        ? 'bg-indigo-500 text-white' 
                        : 'bg-gray-300'
                    }`}>
                      {selectedMissingSkills.includes(skill) && <Check className="w-3 h-3" />}
                    </span>
                    {skill}
                  </button>
                ))}
              </div>
            )}
            
            <div className="pt-3 border-t border-gray-200">
              <p className="mb-2 text-gray-600 font-medium">Matching Skills:</p>
              <div className="flex flex-wrap gap-2">
                {matchAnalysis.skill_matches.map((skill) => (
                  <span key={skill} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Custom Keywords Section */}
      <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection('customKeywords')}
        >
          <h3 className="font-semibold text-gray-800">Add Custom Keywords</h3>
          {openSections.customKeywords ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
        
        {openSections.customKeywords && (
          <div className="p-4">
            <p className="mb-3 text-gray-600">
              Add any additional keywords you'd like to emphasize in your resume:
            </p>
            
            <div className="flex">
              <input
                type="text"
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter custom keyword"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addCustomKeyword()}
              />
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-r-lg hover:bg-indigo-700 transition-colors"
                onClick={addCustomKeyword}
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            {customKeywords.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {customKeywords.map((keyword) => (
                  <div key={keyword} className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {keyword}
                    <button
                      className="ml-2 text-indigo-500 hover:text-indigo-700"
                      onClick={() => removeCustomKeyword(keyword)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Custom Experiences Section */}
      <div className="mb-6 border border-gray-200 rounded-lg overflow-hidden">
        <div 
          className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer"
          onClick={() => toggleSection('customExperiences')}
        >
          <h3 className="font-semibold text-gray-800">Add Custom Experiences</h3>
          {openSections.customExperiences ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
        
        {openSections.customExperiences && (
          <div className="p-4">
            <p className="mb-3 text-gray-600">
              Add any specific achievements or experiences that demonstrate the skills mentioned in the job posting:
            </p>
            
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Section
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={newExperience.section}
                    onChange={(e) => setNewExperience({
                      ...newExperience,
                      section: e.target.value as 'work' | 'education' | 'projects' | 'skills'
                    })}
                  >
                    <option value="work">Work Experience</option>
                    <option value="education">Education</option>
                    <option value="projects">Projects</option>
                    <option value="skills">Skills</option>
                  </select>
                </div>
                
                {/* Dynamic fields based on selected section */}
                {newExperience.section === 'work' && (
                  <>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select from your career history
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => {
                          const selectedIndex = parseInt(e.target.value);
                          if (!isNaN(selectedIndex) && careerHistory[selectedIndex]) {
                            selectCareerItem(careerHistory[selectedIndex]);
                          }
                        }}
                      >
                        <option value="">-- Select a position --</option>
                        {careerHistory.map((job, index) => (
                          <option key={index} value={index}>
                            {job.title} at {job.company} {job.period ? `(${job.period})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Position
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Software Engineer"
                        value={newExperience.title || ''}
                        onChange={(e) => setNewExperience({
                          ...newExperience,
                          title: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="ABC Company"
                        value={newExperience.company || ''}
                        onChange={(e) => setNewExperience({
                          ...newExperience,
                          company: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Period
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="2020 - 2022"
                        value={newExperience.period || ''}
                        onChange={(e) => setNewExperience({
                          ...newExperience,
                          period: e.target.value
                        })}
                      />
                    </div>
                  </>
                )}
                
                {newExperience.section === 'education' && (
                  <>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select from your education history
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        onChange={(e) => {
                          const selectedIndex = parseInt(e.target.value);
                          if (!isNaN(selectedIndex) && educationHistory[selectedIndex]) {
                            selectEducationItem(educationHistory[selectedIndex]);
                          }
                        }}
                      >
                        <option value="">-- Select education --</option>
                        {educationHistory.map((edu, index) => (
                          <option key={index} value={index}>
                            {edu.title} from {edu.company} {edu.period ? `(${edu.period})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="BS Computer Science"
                        value={newExperience.title || ''}
                        onChange={(e) => setNewExperience({
                          ...newExperience,
                          title: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Institution
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="University of Example"
                        value={newExperience.company || ''}
                        onChange={(e) => setNewExperience({
                          ...newExperience,
                          company: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="2018"
                        value={newExperience.period || ''}
                        onChange={(e) => setNewExperience({
                          ...newExperience,
                          period: e.target.value
                        })}
                      />
                    </div>
                  </>
                )}
                
                {newExperience.section === 'projects' && (
                  <>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Mobile App"
                        value={newExperience.title || ''}
                        onChange={(e) => setNewExperience({
                          ...newExperience,
                          title: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Technologies
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="React, Node.js"
                        value={newExperience.company || ''}
                        onChange={(e) => setNewExperience({
                          ...newExperience,
                          company: e.target.value
                        })}
                      />
                    </div>
                    
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Period
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="2020 - 2022"
                        value={newExperience.period || ''}
                        onChange={(e) => setNewExperience({
                          ...newExperience,
                          period: e.target.value
                        })}
                      />
                    </div>
                  </>
                )}
                
                {newExperience.section === 'skills' && (
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Skill Category
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Technical Skills, Soft Skills, etc."
                      value={newExperience.title || ''}
                      onChange={(e) => setNewExperience({
                        ...newExperience,
                        title: e.target.value
                      })}
                    />
                  </div>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description / Achievement
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                  placeholder="Describe your achievement or experience..."
                  value={newExperience.description}
                  onChange={(e) => setNewExperience({
                    ...newExperience,
                    description: e.target.value
                  })}
                ></textarea>
              </div>
              
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full"
                onClick={addCustomExperience}
              >
                Add Experience
              </button>
            </div>
            
            {customExperiences.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-700">Added Experiences:</h4>
                
                {customExperiences.map((exp) => (
                  <div key={exp.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-indigo-600 mr-2" />
                        <span className="font-medium text-gray-800">
                          {exp.section === 'work' && 'Work Experience'}
                          {exp.section === 'education' && 'Education'}
                          {exp.section === 'projects' && 'Project'}
                          {exp.section === 'skills' && 'Skill'}
                        </span>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={() => removeCustomExperience(exp.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {(exp.title || exp.company || exp.period) && (
                      <div className="mb-2 text-sm">
                        {exp.title && <span className="font-medium">{exp.title}</span>}
                        {exp.title && exp.company && <span> at </span>}
                        {exp.company && <span>{exp.company}</span>}
                        {(exp.title || exp.company) && exp.period && <span> • </span>}
                        {exp.period && <span className="text-gray-600">{exp.period}</span>}
                      </div>
                    )}
                    
                    <p className="text-gray-700 text-sm">{exp.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          onClick={onBack}
          disabled={isLoading}
        >
          Back
        </button>
        
        <button
          className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : 'Generate Tailored Resume'}
        </button>
      </div>
    </div>
  );
};

export default InteractiveResumeReview;