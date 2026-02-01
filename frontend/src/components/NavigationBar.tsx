import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Briefcase } from 'lucide-react';

const NavigationBar: React.FC = () => {
  const location = useLocation();

  // Helper function to determine if a route is active
  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-indigo-600">
                Resume Architect
              </span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/resume-builder"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActiveRoute('/resume-builder')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <FileText className="mr-2 h-4 w-4" />
                Resume Builder
              </Link>
              <Link
                to="/job-search"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActiveRoute('/job-search')
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Briefcase className="mr-2 h-4 w-4" />
                Job Search
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;