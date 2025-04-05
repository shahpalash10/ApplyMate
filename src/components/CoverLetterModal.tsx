"use client";

import React, { useState, useEffect, useRef } from 'react';

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobTitle: string;
  company: string;
  location: string;
  keywords?: string[];
}

export default function CoverLetterModal({
  isOpen,
  onClose,
  jobTitle: initialJobTitle,
  company: initialCompany,
  location: initialLocation,
  keywords
}: CoverLetterModalProps) {
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [manualJobTitle, setManualJobTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    experience: ''
  });
  const [profileComplete, setProfileComplete] = useState(false);
  
  // Use either the manually entered values or the initial ones
  const jobTitle = manualJobTitle || initialJobTitle;
  const company = manualCompany || initialCompany;
  const location = manualLocation || initialLocation;
  
  const modalRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize job fields with values if available
  useEffect(() => {
    if (isOpen) {
      if (initialJobTitle && typeof initialJobTitle === 'string' && initialJobTitle.trim() !== '') {
        setManualJobTitle(initialJobTitle.trim());
      } else {
        // If no initial job title, ensure we start with an empty field
        setManualJobTitle('');
      }
      
      if (initialCompany && typeof initialCompany === 'string') {
        setManualCompany(initialCompany.trim());
      }
      
      if (initialLocation && typeof initialLocation === 'string') {
        setManualLocation(initialLocation.trim());
      }
    }
  }, [isOpen, initialJobTitle, initialCompany, initialLocation]);

  // Close modal when Escape key is pressed
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Focus the textarea when editing
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Generate the cover letter when modal opens after profile is complete
  useEffect(() => {
    if (isOpen && profileComplete && !coverLetter && !isLoading) {
      // Don't automatically generate if there's no title - let the user enter one
      if (!manualJobTitle?.trim()) {
        console.log('No job title provided - waiting for user input');
        return;
      }
      
      console.log('Starting cover letter generation with:', { 
        jobTitle: manualJobTitle, 
        company: manualCompany, 
        location: manualLocation,
        keywords: keywords ? JSON.stringify(keywords) : undefined 
      });
      generateCoverLetter();
    }
  }, [isOpen, profileComplete, coverLetter, manualJobTitle, manualCompany, manualLocation, keywords]);

  // Load saved profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setUserProfile(parsedProfile);
      
      // Check if profile is complete
      const requiredFields = ['name', 'email', 'skills'];
      const isComplete = requiredFields.every(field => 
        parsedProfile[field] && parsedProfile[field].trim() !== ''
      );
      
      setProfileComplete(isComplete);
    }
  }, []);

  const generateCoverLetter = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Enhanced validation with more detailed error
      if (!manualJobTitle?.trim()) {
        const errorMsg = 'Please enter a job title to generate a cover letter';
        console.error('Missing job title in cover letter generation');
        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      // Make sure we have clean, validated data
      const sanitizedJobTitle = manualJobTitle.trim();
      const sanitizedCompany = manualCompany?.trim() || 'the company';
      const sanitizedLocation = manualLocation?.trim() || '';
      
      // Process keywords safely
      let processedSkills = '';
      if (Array.isArray(keywords) && keywords.length > 0) {
        processedSkills = keywords.filter(k => k).join(', ');
      } else if (userProfile.skills) {
        processedSkills = userProfile.skills;
      }

      const requestData = {
        jobTitle: sanitizedJobTitle,
        company: sanitizedCompany,
        location: sanitizedLocation,
        skills: processedSkills,
        userProfile
      };
      
      console.log('Sending cover letter request with data:', JSON.stringify(requestData, null, 2));

      const response = await fetch('/api/cover-letter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Cover letter API error:', errorData);
        throw new Error(errorData.error || 'Failed to generate cover letter');
      }
      
      const data = await response.json();
      console.log('Successfully generated cover letter');
      setCoverLetter(data.coverLetter);
      setIsEditing(false);
    } catch (error) {
      console.error('Error generating cover letter:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate cover letter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([coverLetter], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `Cover_Letter_${company.replace(/\s+/g, '_')}_${jobTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const saveProfile = () => {
    // Validate required fields
    const requiredFields = ['name', 'email', 'skills'];
    const missingFields = requiredFields.filter(
      field => !userProfile[field as keyof typeof userProfile] || 
               userProfile[field as keyof typeof userProfile].trim() === ''
    );
    
    if (missingFields.length > 0) {
      setError(`Please fill in the required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    setProfileComplete(true);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div 
        ref={modalRef}
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header with dynamic title */}
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-100 to-blue-100">
          <h2 className="text-xl font-bold text-gray-800">
            {!profileComplete 
              ? 'Complete Your Profile' 
              : manualJobTitle
                ? `Cover Letter for ${manualJobTitle} ${manualCompany ? `at ${manualCompany}` : ''}`
                : 'Create Custom Cover Letter'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {!profileComplete ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-blue-100 mb-6">
                <p className="text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Please provide some information about yourself to generate a personalized cover letter.
                  Fields marked with <span className="text-red-500 mx-1">*</span> are required.
                </p>
              </div>
              
              <div className="space-y-5 bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Full Name <span className="text-red-500 ml-1">*</span>
                    <div className="relative ml-2 group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                        Your full name will appear in the cover letter signature.
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="name"
                      value={userProfile.name}
                      onChange={e => setUserProfile({...userProfile, name: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 font-medium transition-colors duration-200"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Email Address <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      id="email"
                      value={userProfile.email}
                      onChange={e => setUserProfile({...userProfile, email: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 font-medium transition-colors duration-200"
                      placeholder="john.doe@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <input
                      type="tel"
                      id="phone"
                      value={userProfile.phone}
                      onChange={e => setUserProfile({...userProfile, phone: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 font-medium transition-colors duration-200"
                      placeholder="+1 (123) 456-7890"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Key Skills/Technologies <span className="text-red-500 ml-1">*</span>
                    <div className="relative ml-2 group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                        List your most relevant skills, separated by commas.
                      </div>
                    </div>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="skills"
                      value={userProfile.skills}
                      onChange={e => setUserProfile({...userProfile, skills: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 font-medium transition-colors duration-200"
                      placeholder="JavaScript, React, Node.js, etc."
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    Professional Experience Summary
                    <div className="relative ml-2 group">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                        Optional, but helps create a more personalized cover letter.
                      </div>
                    </div>
                  </label>
                  <textarea
                    id="experience"
                    value={userProfile.experience}
                    onChange={e => setUserProfile({...userProfile, experience: e.target.value})}
                    rows={4}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 font-medium transition-colors duration-200"
                    placeholder="Briefly describe your relevant work experience, achievements, and qualifications."
                  />
                </div>
              </div>
              
              {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Job details section with improved styling */}
              {profileComplete && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-lg border border-blue-200 shadow-sm">
                  <h3 className="text-base font-bold text-blue-800 mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Job Details
                  </h3>
                  <div className="space-y-4">
                    <div className="relative">
                      <label htmlFor="manual-job-title" className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title *
                      </label>
                      <input
                        type="text"
                        id="manual-job-title"
                        value={manualJobTitle}
                        onChange={(e) => setManualJobTitle(e.target.value)}
                        className="block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 font-medium transition-colors duration-200"
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">
                          Company
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="company-name"
                            value={manualCompany}
                            onChange={(e) => setManualCompany(e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 font-medium transition-colors duration-200"
                            placeholder="e.g. Acme Inc."
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="job-location" className="block text-sm font-medium text-gray-700 mb-1">
                          Location
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            id="job-location"
                            value={manualLocation}
                            onChange={(e) => setManualLocation(e.target.value)}
                            className="block w-full border border-gray-300 rounded-md shadow-sm py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 font-medium transition-colors duration-200"
                            placeholder="e.g. Remote, New York, etc."
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={generateCoverLetter}
                        disabled={!manualJobTitle?.trim()}
                        className={`px-4 py-2.5 rounded-md text-white font-medium transition-colors duration-200 flex items-center ${
                          !manualJobTitle?.trim() 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-sm hover:shadow'
                        }`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Generate Cover Letter
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                  <span className="ml-3 text-gray-600">Generating your cover letter...</span>
                </div>
              ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  {isEditing ? (
                    <>
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Your Cover Letter
                      </h3>
                      <div className="relative">
                        <textarea
                          ref={textareaRef}
                          value={coverLetter}
                          onChange={e => setCoverLetter(e.target.value)}
                          className="w-full min-h-[450px] border border-gray-300 rounded-lg shadow-sm py-4 px-5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-base text-gray-900 leading-relaxed transition-colors duration-200"
                          aria-label="Edit cover letter"
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-white bg-opacity-75 px-2 py-1 rounded">
                          Press Esc to exit editing mode
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Your Cover Letter
                      </h3>
                      <div className="whitespace-pre-wrap font-serif bg-white p-5 border border-gray-200 rounded-lg shadow-sm text-gray-900 text-base leading-relaxed">
                        {coverLetter}
                      </div>
                      <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800 rounded">
                        <p className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>Remember to replace the placeholders with your actual contact information before sending.</span>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Footer with enhanced button styling */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
          {!profileComplete ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                onClick={saveProfile}
                className="px-4 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Continue to Generate Cover Letter
              </button>
            </>
          ) : (
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Close
              </button>
              
              {!isLoading && !error && coverLetter && (
                <>
                  {isEditing ? (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Save Edits
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  )}
                  
                  <button
                    onClick={generateCoverLetter}
                    className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Regenerate
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        {/* Disclaimer with enhanced styling */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-xs text-gray-600 italic flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>This cover letter is AI-generated and may require personalization. Always review and edit before sending.</p>
        </div>
      </div>
    </div>
  );
} 