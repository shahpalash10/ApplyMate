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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-t-lg">
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
          {!profileComplete ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                <h3 className="text-md font-medium text-blue-800 mb-2">
                  Complete Your Profile to Apply
                </h3>
                <p className="text-sm text-blue-700">
                  Please fill out all required information below. This will be used to apply to all selected jobs.
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="resumeUrl" className="block text-sm font-medium text-gray-700">
                    Resume URL (Google Drive, Dropbox, etc.)
                  </label>
                  <input
                    type="url"
                    id="resumeUrl"
                    name="resumeUrl"
                    value={formData.resumeUrl}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Upload Resume (PDF, DOCX)
                </label>
                <div className="mt-1 flex items-center">
                  <input
                    type="file"
                    id="resumeFile"
                    name="resumeFile"
                    onChange={handleFileChange}
                    accept=".pdf,.docx"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    aria-label="Upload resume file"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Please upload your resume or provide a URL. One of these is required.
                </p>
              </div>
              
              <div>
                <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700">
                  Default Cover Letter (Optional)
                </label>
                <textarea
                  id="coverLetter"
                  name="coverLetter"
                  rows={4}
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-800 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter a default cover letter that will be used for all applications. You can customize this for each job later."
                ></textarea>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {isApplying ? (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                      <span className="text-sm font-medium text-gray-700">{overallProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${overallProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <ul className="divide-y divide-gray-200">
                    {applicationStatuses.map((jobStatus, index) => (
                      <li key={index} className="py-3 flex items-start">
                        <div className="mt-1 mr-3 flex-shrink-0">
                          {getStatusIcon(jobStatus.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {jobStatus.job.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {jobStatus.job.company} • {jobStatus.job.source}
                          </p>
                          {jobStatus.message && (
                            <p className={`text-xs mt-1 ${
                              jobStatus.status === 'completed' ? 'text-green-600' : 
                              jobStatus.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {jobStatus.message}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                    <h3 className="text-md font-medium text-blue-800 mb-2">
                      Ready to Apply
                    </h3>
                    <p className="text-sm text-blue-700">
                      You're about to apply to {selectedJobs.length} jobs using the profile information you provided. Click "Start Applications" when you're ready.
                    </p>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                    <ul className="divide-y divide-gray-200">
                      {selectedJobs.map((job, index) => (
                        <li key={index} className="p-3 hover:bg-gray-50">
                          <p className="text-sm font-medium text-gray-900">{job.title}</p>
                          <p className="text-xs text-gray-500">{job.company} • {job.source}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {isApplying ? 'Close' : 'Cancel'}
          </button>
          
          {!isApplying && (
            <button
              type="button"
              onClick={startApplicationProcess}
              disabled={!profileComplete}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                profileComplete 
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500' 
                  : 'bg-indigo-400 cursor-not-allowed'
              }`}
            >
              <CheckIcon className="h-4 w-4 mr-1.5" />
              Start Applications
            </button>
          )}
        </div>
        
        {/* Disclaimer */}
        <div className="px-6 py-3 bg-gray-50 rounded-b-lg text-xs text-gray-500">
          <p>Note: This feature will attempt to apply to each job automatically. Success may vary based on the job source and their application process.</p>
        </div>
      </div>
    </div>
  );
} 