"use client";

import { useState } from 'react';
import Link from 'next/link';
import CoverLetterModal from '@/components/CoverLetterModal';

export default function CoverLetterPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customJobDetails, setCustomJobDetails] = useState({
    jobTitle: '',
    company: '',
    location: '',
  });

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text tracking-tight">
            ✨ Cover Letter Generator ✨
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Create a personalized, professional cover letter in minutes with our AI-powered generator.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-3xl mx-auto">
          <div className="p-8">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Custom Cover Letter
              </h2>
              
              <p className="text-gray-600">
                Enter the job details below to create a tailored cover letter for your specific position.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    id="jobTitle"
                    value={customJobDetails.jobTitle}
                    onChange={(e) => setCustomJobDetails({...customJobDetails, jobTitle: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={customJobDetails.company}
                    onChange={(e) => setCustomJobDetails({...customJobDetails, company: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    placeholder="e.g. Acme Inc."
                  />
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    value={customJobDetails.location}
                    onChange={(e) => setCustomJobDetails({...customJobDetails, location: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    placeholder="e.g. Remote, New York, etc."
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={handleModalOpen}
                  disabled={!customJobDetails.jobTitle.trim()}
                  className={`w-full py-3 px-4 rounded-md shadow-sm text-white font-medium transition-colors duration-200 ${
                    !customJobDetails.jobTitle.trim() 
                      ? 'bg-gray-300 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Generate Cover Letter
                </button>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Looking for a job?
              </h3>
              <p className="text-gray-600 mb-4">
                Use our AI-powered job search tool to find relevant positions and generate cover letters automatically.
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Search Jobs
                <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Why use our Cover Letter Generator?</h2>
          <ul className="space-y-3">
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">ATS-friendly formatting to pass through applicant tracking systems</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Customized content based on your skills and experience</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Professional tone and language that impresses employers</span>
            </li>
            <li className="flex items-start">
              <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Fully editable and downloadable in seconds</span>
            </li>
          </ul>
        </div>
      </div>
      
      {isModalOpen && (
        <CoverLetterModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          jobTitle={customJobDetails.jobTitle}
          company={customJobDetails.company}
          location={customJobDetails.location}
        />
      )}
    </div>
  );
} 