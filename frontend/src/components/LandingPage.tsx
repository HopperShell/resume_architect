import React from 'react';
import { ArrowRight, FileText, Search, Target, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
      {/* Navigation */}
      <nav className="relative z-10 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">Resume Architect</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <a href="#features" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">Features</a>
                <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium">How It Works</a>
                <button
                  onClick={() => navigate('/resume-builder')}
                  className="text-indigo-600 hover:text-indigo-800 font-medium px-3 py-2 rounded-md text-sm"
                >
                  Get Started
                </button>
              </div>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => navigate('/resume-builder')}
                className="text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-16 pb-32 overflow-hidden">
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
                <h1>
                  <span className="block text-sm font-semibold uppercase tracking-wide text-gray-500 sm:text-base lg:text-sm xl:text-base">
                    Introducing
                  </span>
                  <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                    <span className="block text-gray-900">AI-Powered</span>
                    <span className="block text-indigo-600">Resume Architect</span>
                  </span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                  Tailor your resume to match specific job descriptions and optimize your chances of success. Our AI analyzes your skills and experiences to highlight what matters most for each application.
                </p>
                <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                  <button
                    onClick={() => navigate('/resume-builder')}
                    className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
                <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
                  <div className="relative block w-full bg-white rounded-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-10 h-64 w-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <div className="text-center p-4 bg-white bg-opacity-90 rounded-lg max-w-xs mx-auto shadow-md">
                        <FileText className="h-12 w-12 text-indigo-600 mb-3 mx-auto" />
                        <h3 className="text-lg font-medium text-gray-900">Resume Tailoring</h3>
                        <p className="mt-2 text-sm text-gray-500">
                          Optimize your resume for each job application with our AI-powered tools
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to land your dream job
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our AI-powered platform offers all the tools you need to make your resume stand out.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Target className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Resume Tailoring</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Customize your resume to match specific job descriptions, highlighting relevant skills and experience.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Search className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Job Search</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Find job opportunities that match your skills and experience with our integrated job search.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">AI-Powered Matching</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Our system identifies key requirements from job postings and highlights areas to emphasize in your resume.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <Shield className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">ATS-Friendly Format</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Ensures your resume passes through Applicant Tracking Systems with optimized formatting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-16 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Process</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              How Resume Architect Works
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Our simple 3-step process helps you create the perfect resume for each job application.
            </p>
          </div>

          <div className="mt-16">
            <div className="lg:grid lg:grid-cols-3 lg:gap-8">
              <div className="relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">1</span>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">Upload Your Resume</h3>
                <p className="mt-2 text-base text-gray-500 text-center px-6">
                  Start by uploading your existing resume or creating a new one from scratch with our easy-to-use tools.
                </p>
              </div>

              <div className="mt-10 lg:mt-0 relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">2</span>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">Add Job Posting</h3>
                <p className="mt-2 text-base text-gray-500 text-center px-6">
                  Enter the job description or search for jobs directly within our platform to find your next opportunity.
                </p>
              </div>

              <div className="mt-10 lg:mt-0 relative">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-indigo-500 text-white mx-auto mb-4">
                  <span className="text-lg font-bold">3</span>
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">Get Optimized Resume</h3>
                <p className="mt-2 text-base text-gray-500 text-center px-6">
                  Our AI tailors your resume to highlight relevant skills and experience, generating a professional, job-specific document.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div id="sign-in-section" className="bg-indigo-600">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to boost your job search?</span>
            <span className="block">Get started today.</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-indigo-100">
            Join thousands of job seekers who have optimized their resumes and landed their dream jobs.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="inline-flex rounded-md shadow">
              <button
                onClick={() => navigate('/resume-builder')}
                className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">© 2025 Resume Architect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;