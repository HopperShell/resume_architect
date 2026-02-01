import React from 'react';
import JobSearch from './JobSearch';
import NavigationBar from './NavigationBar';

interface JobSearchWrapperProps {
  onSelectJob: (jobPosting: string, jobTitle: string) => void;
}

const JobSearchWrapper: React.FC<JobSearchWrapperProps> = (props) => {
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBar />
      <div className="flex-grow">
        <JobSearch {...props} />
      </div>
    </div>
  );
};

export default JobSearchWrapper;