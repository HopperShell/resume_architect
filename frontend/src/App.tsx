import React, { useState } from 'react';
import ResumeBuilderWrapper from './components/ResumeBuilderWrapper';
import ResumeOutputWrapper from './components/ResumeOutputWrapper';
import JobSearchWrapper from './components/JobSearchWrapper';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

function AppRoutes() {
  const [resumeText, setResumeText] = useState('');
  const [jobPostingText, setJobPostingText] = useState('');
  const [optimizedResumeHtml, setOptimizedResumeHtml] = useState('');
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResumeGenerated = (html: string, url: string | null) => {
    setOptimizedResumeHtml(html);
    setPdfUrl(url);
    navigate('/resume-output');
  };

  const handleJobSelected = (desc: string, _title: string) => {
    setJobPostingText(desc);
    navigate('/resume-builder');
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <ResumeBuilderWrapper
            onResumeGenerated={handleResumeGenerated}
            initialJobPosting={jobPostingText}
            onJobSearch={() => navigate('/job-search')}
          />
        }
      />
      <Route
        path="/resume-builder"
        element={
          <ResumeBuilderWrapper
            onResumeGenerated={handleResumeGenerated}
            initialJobPosting={jobPostingText}
            onJobSearch={() => navigate('/job-search')}
          />
        }
      />
      <Route
        path="/job-search"
        element={
          <JobSearchWrapper onSelectJob={handleJobSelected} />
        }
      />
      <Route
        path="/resume-output"
        element={
          <ResumeOutputWrapper
            htmlContent={optimizedResumeHtml}
            pdfUrl={pdfUrl}
            onBack={() => navigate('/resume-builder')}
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;