import React from 'react';
import ResumeOutput from './ResumeOutput';
import NavigationBar from './NavigationBar';

interface ResumeOutputWrapperProps {
  htmlContent: string;
  pdfUrl?: string | null;
  onBack: () => void;
}

const ResumeOutputWrapper: React.FC<ResumeOutputWrapperProps> = (props) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBar />
      <div className="flex-grow">
        <ResumeOutput {...props} />
      </div>
    </div>
  );
};

export default ResumeOutputWrapper;