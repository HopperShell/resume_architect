import React from 'react';
import ResumeBuilder from './ResumeBuilder';
import NavigationBar from './NavigationBar';

interface ResumeBuilderWrapperProps {
  onResumeGenerated?: (html: string, pdfUrl: string | null) => void;
  initialJobPosting?: string;
  onJobSearch?: () => void;
}

const ResumeBuilderWrapper: React.FC<ResumeBuilderWrapperProps> = (props) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBar />
      <div className="flex-grow">
        <ResumeBuilder {...props} />
      </div>
    </div>
  );
};

export default ResumeBuilderWrapper;