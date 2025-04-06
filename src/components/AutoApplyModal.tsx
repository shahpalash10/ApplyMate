"use client";

import { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon, XCircleIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

interface JobListing {
  title: string;
  company: string;
  location: string;
  salary: string;
  link: string;
  source: string;
  match_score?: number;
  recommendations?: string;
  difficulty?: string;
  keywords?: string[];
}

interface JobApplicationStatus {
  job: JobListing;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
}

interface AutoApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJobs: JobListing[];
  userProfile: {
    name: string;
    email: string;
    phone: string;
    resumeUrl?: string;
  };
  onProfileUpdate?: (updatedProfile: {
    name: string;
    email: string;
    phone: string;
    resumeUrl?: string;
  }) => void;
}

export default function AutoApplyModal({ isOpen, onClose, selectedJobs, userProfile, onProfileUpdate }: AutoApplyModalProps) {
  const [applicationStatuses, setApplicationStatuses] = useState<JobApplicationStatus[]>([]);
  const [isApplying, setIsApplying] = useState(false);
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [profileComplete, setProfileComplete] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    resumeFile: null as File | null,
    resumeUrl: userProfile.resumeUrl || '',
    coverLetter: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    
    // Reset state when opening
    setApplicationStatuses(
      selectedJobs.map(job => ({
        job,
        status: 'pending'
      }))
    );
    setIsApplying(false);
    setCurrentJobIndex(0);
    setOverallProgress(0);
    
    // Check if user profile is complete
    setProfileComplete(
      !!formData.name && 
      !!formData.email && 
      !!formData.phone && 
      (!!formData.resumeFile || !!formData.resumeUrl)
    );
  }, [isOpen, selectedJobs, formData.name, formData.email, formData.phone, formData.resumeFile, formData.resumeUrl]);

  useEffect(() => {
    // Auto-close modal with Escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Update profile data in parent component when profile is completed
  useEffect(() => {
    if (profileComplete && onProfileUpdate) {
      onProfileUpdate({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        resumeUrl: formData.resumeUrl
      });
    }
  }, [profileComplete, formData.name, formData.email, formData.phone, formData.resumeUrl, onProfileUpdate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, resumeFile: e.target.files![0] }));
    }
  };

  const startApplicationProcess = async () => {
    if (!profileComplete) return;
    
    setIsApplying(true);
    setCurrentJobIndex(0);
    
    // Process each job in sequence
    for (let i = 0; i < selectedJobs.length; i++) {
      const job = selectedJobs[i];
      setCurrentJobIndex(i);
      
      // Update status to in progress
      setApplicationStatuses(prev => 
        prev.map((status, idx) => 
          idx === i ? { ...status, status: 'in_progress' } : status
        )
      );
      
      try {
        // Call API to apply for job
        const formDataObj = new FormData();
        formDataObj.append('name', formData.name);
        formDataObj.append('email', formData.email);
        formDataObj.append('phone', formData.phone);
        formDataObj.append('jobTitle', job.title);
        formDataObj.append('company', job.company);
        formDataObj.append('jobLink', job.link);
        formDataObj.append('source', job.source);
        formDataObj.append('coverLetter', formData.coverLetter);
        
        if (formData.resumeFile) {
          formDataObj.append('resume', formData.resumeFile);
        } else if (formData.resumeUrl) {
          formDataObj.append('resumeUrl', formData.resumeUrl);
        }
        
        // Make real API call to auto-apply endpoint
        const response = await fetch('/api/auto-apply', {
          method: 'POST',
          body: formDataObj
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to apply');
        }
        
        // Successful application
        setApplicationStatuses(prev => 
          prev.map((status, idx) => 
            idx === i ? { 
              ...status, 
              status: 'completed',
              message: data.message || `Successfully applied to ${job.title} at ${job.company}`
            } : status
          )
        );
      } catch (error) {
        // Failed application
        setApplicationStatuses(prev => 
          prev.map((status, idx) => 
            idx === i ? { 
              ...status, 
              status: 'failed',
              message: `Failed to apply: ${error instanceof Error ? error.message : 'Unknown error'}`
            } : status
          )
        );
      }
      
      // Update overall progress
      setOverallProgress(Math.round(((i + 1) / selectedJobs.length) * 100));
    }
  };

  const getStatusIcon = (status: JobApplicationStatus['status']) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-gray-400" />;
      case 'in_progress':
        return (
          <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg">
          <h2 className="text-xl font-semibold text-white">Auto Apply to {selectedJobs.length} Jobs</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200"
            aria-label="Close modal"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Demo Notice Banner */}
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-md p-4 flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Demo Feature</h3>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-200">
                This is a technology demonstration of our AI-powered auto-apply feature. In this demo, the system will simulate the application process without actually submitting applications.
              </p>
            </div>
          </div>

          {!profileComplete ? (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md p-4 mb-4">
                <h3 className="text-md font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Complete Your Profile to Apply
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-200">
                  Please fill out all required information below. This will be used to apply to all selected jobs.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-800 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-800 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-800 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="resumeFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Upload Resume *
                    </label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="file"
                        id="resumeFile"
                        name="resumeFile"
                        onChange={handleFileChange}
                        className="sr-only"
                        accept=".pdf,.doc,.docx"
                      />
                      <label
                        htmlFor="resumeFile"
                        className="cursor-pointer flex-1 relative border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-700 dark:text-gray-300 dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <span className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          {formData.resumeFile ? formData.resumeFile.name : 'Choose file...'}
                        </span>
                      </label>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      PDF, DOC, or DOCX up to 5MB
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Or Resume URL
                      </label>
                      <span className="text-xs text-gray-500 dark:text-gray-400">(Alternative to file upload)</span>
                    </div>
                    <input
                      type="url"
                      id="resumeUrl"
                      name="resumeUrl"
                      value={formData.resumeUrl}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-800 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://example.com/myresume.pdf"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Cover Letter Template (Optional)
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="coverLetter"
                        name="coverLetter"
                        rows={3}
                        value={formData.coverLetter}
                        onChange={handleInputChange}
                        className="block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 text-gray-800 dark:text-white dark:bg-gray-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Dear Hiring Manager, I am writing to express my interest in..."
                      ></textarea>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Our AI will customize this for each job if provided, or generate one automatically.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <button
                  type="button"
                  onClick={startApplicationProcess}
                  disabled={!profileComplete}
                  className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 ${
                    profileComplete ? 'hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  {profileComplete ? "Start Auto Applying" : "Complete Profile to Continue"}
                </button>
              </div>
            </div>
          ) : isApplying ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Application Progress</h3>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{overallProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${overallProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Applying to job {currentJobIndex + 1} of {selectedJobs.length}
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <div className="relative w-24 h-24">
                    <svg className="animate-spin w-24 h-24 text-blue-500" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="45" stroke="currentColor" strokeOpacity="0.2" strokeWidth="10" />
                      <path
                        d="M50 5 A 45 45 0 0 1 95 50"
                        stroke="currentColor"
                        strokeWidth="10"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-600 dark:text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Status</h4>
                </div>
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
                  {applicationStatuses.map((status, index) => (
                    <li key={index} className="px-4 py-3 flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getStatusIcon(status.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {status.job.title} at {status.job.company}
                        </p>
                        {status.message && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {status.message}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">
                      What's happening behind the scenes
                    </h3>
                    <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                      <ul className="list-disc space-y-1 pl-5">
                        <li>Generating customized cover letters and responses</li>
                        <li>Adapting your resume keywords to match job requirements</li>
                        <li>Automating form submissions and application processes</li>
                        <li>Tracking application status and potential follow-ups</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/2">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Application Summary</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <dl className="space-y-3">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Jobs</dt>
                        <dd className="text-sm font-semibold text-gray-900 dark:text-white">{selectedJobs.length}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Successful</dt>
                        <dd className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {applicationStatuses.filter(s => s.status === 'completed').length}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Failed</dt>
                        <dd className="text-sm font-semibold text-red-600 dark:text-red-400">
                          {applicationStatuses.filter(s => s.status === 'failed').length}
                        </dd>
                      </div>
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Success Rate</dt>
                          <dd className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                            {applicationStatuses.filter(s => s.status === 'completed').length > 0
                              ? Math.round((applicationStatuses.filter(s => s.status === 'completed').length / applicationStatuses.length) * 100)
                              : 0}%
                          </dd>
                        </div>
                      </div>
                    </dl>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application Details</h4>
                    <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-60 overflow-y-auto">
                        {applicationStatuses.map((status, index) => (
                          <li key={index} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 mr-3">
                                {getStatusIcon(status.status)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {status.job.title}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {status.job.company}
                                </p>
                              </div>
                              <div className="ml-2">
                                <span className={`inline-flex px-2 py-0.5 text-xs rounded-full ${
                                  status.status === 'completed'
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    : status.status === 'failed'
                                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                                }`}>
                                  {status.status === 'completed' ? 'Applied' : status.status === 'failed' ? 'Failed' : 'Pending'}
                                </span>
                              </div>
                            </div>
                            {status.message && (
                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {status.message}
                              </p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-900/30 dark:to-blue-900/30 rounded-lg p-6 border border-blue-100 dark:border-blue-800 h-full flex flex-col">
                    <div className="flex items-center mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-full mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 dark:text-blue-300" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI-Powered Job Applications</h3>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        Our AI system analyzes each job and optimizes your application to maximize chances of success:
                      </p>
                      
                      <ul className="space-y-3 mb-6">
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            <strong className="text-gray-900 dark:text-white">Keyword Matching:</strong> Adapts your resume to highlight relevant skills for each position
                          </span>
                        </li>
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            <strong className="text-gray-900 dark:text-white">Custom Cover Letters:</strong> Creates personalized letters for each company and role
                          </span>
                        </li>
                        <li className="flex">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            <strong className="text-gray-900 dark:text-white">Form Automation:</strong> Handles application forms, questionnaires, and uploads
                          </span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-blue-100 dark:border-blue-800">
                      <p className="text-xs text-blue-600 dark:text-blue-300 italic">
                        Note: This is a technology demonstration. In a production version, our AI would handle the entire application process from start to finish, including follow-ups and interview scheduling.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 border-t border-gray-200 dark:border-gray-700 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Close
                </button>
                <button
                  onClick={startApplicationProcess}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply to More Jobs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 