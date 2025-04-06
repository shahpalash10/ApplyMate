"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTheme } from './ThemeProvider';
import CoverLetterModal from './CoverLetterModal';
import AutoApplyModal from './AutoApplyModal';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

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

export default function JobScraper() {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [experience, setExperience] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([]);
  const [error, setError] = useState('');
  const [sourceCounts, setSourceCounts] = useState<{[key: string]: number}>({});
  const [sortBy, setSortBy] = useState<'match' | 'company' | 'location'>('match');
  const [sourceFilters, setSourceFilters] = useState<{[key: string]: boolean}>({
    Internshala: true,
    Unstop: true,
    Naukri: true,
    LinkedIn: true,
    Indeed: true
  });
  const [coverLetterModalOpen, setCoverLetterModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<JobListing[]>([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [autoApplyModalOpen, setAutoApplyModalOpen] = useState(false);
  const [showAutoApplyDemo, setShowAutoApplyDemo] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    phone: '',
    resumeUrl: ''
  });
  const formRef = useRef<HTMLFormElement>(null);

  // Load user profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setUserProfile(parsedProfile);
      } catch (err) {
        console.error('Error parsing saved profile:', err);
      }
    }
  }, []);

  // Save user profile when updated by AutoApplyModal
  const handleProfileUpdate = (updatedProfile: {
    name: string; 
    email: string; 
    phone: string; 
    resumeUrl?: string;
  }) => {
    setUserProfile({
      name: updatedProfile.name || '',
      email: updatedProfile.email || '',
      phone: updatedProfile.phone || '',
      resumeUrl: updatedProfile.resumeUrl || ''
    });
    localStorage.setItem('userProfile', JSON.stringify({
      name: updatedProfile.name || '',
      email: updatedProfile.email || '',
      phone: updatedProfile.phone || '',
      resumeUrl: updatedProfile.resumeUrl || ''
    }));
  };

  // Filter jobs when source filters or jobs change
  useEffect(() => {
    let sorted = [...jobs].filter(job => sourceFilters[job.source]);
    
    // Sort jobs
    if (sortBy === 'match') {
      sorted = sorted.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    } else if (sortBy === 'company') {
      sorted = sorted.sort((a, b) => a.company.localeCompare(b.company));
    } else if (sortBy === 'location') {
      sorted = sorted.sort((a, b) => a.location.localeCompare(b.location));
    }
    
    setFilteredJobs(sorted);
    
    // Count jobs by source
    const counts: {[key: string]: number} = {};
    jobs.forEach(job => {
      counts[job.source] = (counts[job.source] || 0) + 1;
    });
    setSourceCounts(counts);
  }, [sourceFilters, jobs, sortBy]);

  const handleSourceFilterChange = (source: string) => {
    setSourceFilters(prev => ({
      ...prev,
      [source]: !prev[source]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError('');
    setJobs([]);
    setSelectedJobs([]);
    setSelectionMode(false);
    
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query,
          location: location.trim() || undefined,
          experience: experience.trim() || undefined
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch job listings');
      }
      
      setJobs(data.jobs || []);
      
      if (data.jobs?.length === 0) {
        setError('No job listings found. Try a different search term or location.');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to fetch job listings. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCoverLetterModal = (job?: JobListing) => {
    // If no job is provided or job title is missing, create an empty job object
    // to allow the user to manually enter job details
    const defaultJob: JobListing = {
      title: '',
      company: '',
      location: '',
      salary: '',
      link: '',
      source: ''
    };
    
    // Use the provided job or the default empty job
    const jobData = job || defaultJob;
    
    // Create a sanitized version with guaranteed values (even if empty)
    setSelectedJob({
      ...jobData,
      title: jobData.title?.trim() || '',
      company: (jobData.company?.trim()) || '',
      location: (jobData.location?.trim()) || '',
      keywords: Array.isArray(jobData.keywords) ? jobData.keywords : 
                (jobData.keywords ? [String(jobData.keywords)] : [])
    });
    
    setCoverLetterModalOpen(true);
  };

  const closeCoverLetterModal = () => {
    setCoverLetterModalOpen(false);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedJobs([]);
    }
  };

  const toggleJobSelection = (job: JobListing) => {
    if (!selectionMode) return;
    
    setSelectedJobs(prev => {
      const isSelected = prev.some(j => j.title === job.title && j.company === job.company);
      if (isSelected) {
        return prev.filter(j => !(j.title === job.title && j.company === job.company));
      } else {
        return [...prev, job];
      }
    });
  };

  const isJobSelected = (job: JobListing) => {
    return selectedJobs.some(j => j.title === job.title && j.company === job.company);
  };

  const openAutoApplyModal = () => {
    setAutoApplyModalOpen(true);
  };

  const closeAutoApplyModal = () => {
    setAutoApplyModalOpen(false);
  };

  return (
    <Card 
      variant={isDark ? "glass" : "default"}
      className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-200px)] overflow-hidden"
    >
      <div className="p-4 md:p-6 overflow-y-auto flex-1 pb-16" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Auto Apply Feature Section */}
        {showAutoApplyDemo && (
          <div className={`mb-6 rounded-lg overflow-hidden border ${isDark ? 'border-primary-700' : 'border-primary-200'}`}>
            <div className={`p-4 ${isDark ? 'bg-primary-900/40' : 'bg-primary-50'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className={`p-2 rounded-full ${isDark ? 'bg-primary-700' : 'bg-primary-100'} mr-3`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isDark ? 'text-primary-300' : 'text-primary-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${isDark ? 'text-primary-300' : 'text-primary-700'}`}>
                      Auto Apply
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-primary-200' : 'text-primary-600'}`}>
                      Apply to multiple jobs with a single click using our AI-powered system
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowAutoApplyDemo(false)}
                  className={`p-1 rounded-full ${isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300' : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700'}`}
                  aria-label="Dismiss auto apply section"
                  title="Dismiss"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className={`p-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <h4 className={`font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>How it works:</h4>
                  <ol className={`list-decimal pl-5 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} space-y-1`}>
                    <li>Search for jobs that match your skills and preferences</li>
                    <li>Enter "Selection Mode" and choose multiple jobs</li>
                    <li>Click "Auto Apply" to apply to all selected jobs at once</li>
                    <li>Our AI will prepare customized applications for each position</li>
                  </ol>
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex gap-3 mb-3 justify-center md:justify-start">
                    <Button
                      variant={selectionMode ? "primary" : "outline"}
                      size="sm"
                      onClick={toggleSelectionMode}
                      className="min-w-[120px]"
                    >
                      {selectionMode ? "Exit Selection" : "Enter Selection Mode"}
                    </Button>
                    
                    {selectionMode && selectedJobs.length > 0 && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={openAutoApplyModal}
                        className="min-w-[120px]"
                      >
                        Auto Apply ({selectedJobs.length})
                      </Button>
                    )}
                  </div>
                  <p className={`text-xs text-center md:text-left ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectionMode 
                      ? "Now click on jobs below to select them for auto-apply" 
                      : "Click 'Enter Selection Mode' to start selecting jobs"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className={`mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-sm ${isDark ? 'border-gray-700' : 'border-gray-100'} border`}>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="query" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Job Title / Role
              </label>
              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Software Engineer, Product Manager"
                className={`w-full border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                required
              />
            </div>
            <div>
              <label htmlFor="location" className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                Location (Optional)
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, Remote"
                className={`w-full border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500`}
              />
            </div>
            <div className="flex items-end">
              <Button
                type="submit"
                variant="primary"
                className="w-full h-10"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search Jobs
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>

        {error && (
          <div className={`p-4 mb-6 ${isDark ? 'bg-red-900/40 text-red-200' : 'bg-red-50 text-red-800'} rounded-lg border ${isDark ? 'border-red-800' : 'border-red-200'}`}>
            {error}
          </div>
        )}

        {jobs.length > 0 && !isLoading && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Filter by:</span>
                {Object.entries(sourceFilters).map(([source, checked]) => (
                  <button
                    key={source}
                    className={`px-3 py-1 text-xs rounded-full flex items-center ${
                      checked
                        ? `${isDark ? 'bg-primary-700 text-primary-200' : 'bg-primary-100 text-primary-800'}`
                        : `${isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`
                    }`}
                    onClick={() => handleSourceFilterChange(source)}
                  >
                    {source}
                    <span className={`ml-1 text-xs rounded-full inline-flex items-center justify-center w-4 h-4 ${
                      checked
                        ? `${isDark ? 'bg-primary-800 text-primary-300' : 'bg-primary-200 text-primary-800'}`
                        : `${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-300 text-gray-700'}`
                    }`}>
                      {sourceCounts[source] || 0}
                    </span>
                  </button>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'match' | 'company' | 'location')}
                  className={`text-sm rounded-md border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'} py-1 px-2`}
                  aria-label="Sort jobs by"
                >
                  <option value="match">Match Score</option>
                  <option value="company">Company</option>
                  <option value="location">Location</option>
                </select>
                
                <Button
                  variant={selectionMode ? "primary" : "outline"}
                  size="sm"
                  className="ml-2"
                  onClick={toggleSelectionMode}
                >
                  {selectionMode ? "Exit Selection" : "Select Jobs"}
                </Button>
                
                {selectionMode && selectedJobs.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={openAutoApplyModal}
                  >
                    Auto Apply ({selectedJobs.length})
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <div 
                    key={`${job.title}-${job.company}-${index}`}
                    className={`${isDark ? 'bg-gray-800 border-gray-700 hover:border-gray-600' : 'bg-white border-gray-200 hover:border-gray-300'} border rounded-lg transition-all duration-200 shadow-sm ${
                      selectionMode && isJobSelected(job) ? `${isDark ? 'ring-2 ring-primary-500' : 'ring-2 ring-primary-500'}` : ''
                    } ${selectionMode ? 'cursor-pointer' : ''}`}
                    onClick={() => selectionMode && toggleJobSelection(job)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-grow">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className={`text-base md:text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                              {job.title}
                            </h3>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${
                              job.match_score && job.match_score > 80
                                ? `${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`
                                : job.match_score && job.match_score > 60
                                  ? `${isDark ? 'bg-yellow-900/30 text-yellow-300' : 'bg-yellow-100 text-yellow-800'}`
                                  : `${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`
                            }`}>
                              {job.match_score ? `${job.match_score}% Match` : 'No Match Score'}
                            </span>
                            <span className={`px-2 py-0.5 text-xs rounded-full ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                              {job.source}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-y-1 gap-x-4 text-sm mb-2">
                            <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              {job.company}
                            </div>
                            {job.location && (
                              <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {job.location}
                              </div>
                            )}
                            {job.salary && (
                              <div className={`flex items-center ${isDark ? 'text-green-300' : 'text-green-600'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {job.salary}
                              </div>
                            )}
                          </div>
                          {job.keywords && job.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {job.keywords.map((keyword, i) => (
                                <span key={i} className={`px-2 py-0.5 text-xs rounded-full ${isDark ? 'bg-primary-900/30 text-primary-300' : 'bg-primary-50 text-primary-700'}`}>
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          )}
                          
                          {job.recommendations && (
                            <div className={`mt-3 text-sm ${isDark ? 'bg-gray-700/50 text-gray-200' : 'bg-gray-50 text-gray-700'} p-2 rounded-md`}>
                              <div className="font-medium mb-1">AI Recommendations:</div>
                              <div className="prose-sm max-w-none">
                                <ReactMarkdown>
                                  {job.recommendations}
                                </ReactMarkdown>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {selectionMode && (
                          <div className={`ml-2 rounded-full w-5 h-5 flex-shrink-0 border ${
                            isJobSelected(job) 
                              ? `${isDark ? 'bg-primary-600 border-primary-500' : 'bg-primary-600 border-primary-500'}`
                              : `${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`
                          }`}>
                            {isJobSelected(job) && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex justify-end gap-2 mt-3">
                        {!selectionMode && (
                          <Button
                            variant="outline" 
                            size="sm"
                            onClick={() => openCoverLetterModal(job)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Create Cover Letter
                          </Button>
                        )}
                        {!selectionMode && job.link && (
                          <a
                            href={job.link.startsWith('http') ? job.link : `https://${job.link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`inline-flex items-center text-xs px-3 py-1 rounded-md ${
                              isDark 
                                ? 'bg-primary-600 hover:bg-primary-700 text-white' 
                                : 'bg-primary-600 hover:bg-primary-700 text-white'
                            }`}
                            onClick={(e) => {
                              try {
                                // Check if we have a valid URL
                                new URL(job.link.startsWith('http') ? job.link : `https://${job.link}`);
                              } catch (error) {
                                e.preventDefault();
                                alert("Sorry, this job listing has an invalid link. Try visiting the job source's website directly.");
                              }
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Apply Now
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <Card className="text-center py-8">
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-500'}`}>No jobs match your current filters. Try adjusting your filter settings.</p>
                </Card>
              )}
            </div>

            <Card variant="glass" className="mt-4 mb-8 p-4">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isDark ? 'text-primary-400' : 'text-primary-600'} mt-0.5 mr-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className={`text-sm font-medium ${isDark ? 'text-primary-300' : 'text-primary-700'} mb-1`}>About the "Apply Now" links</h4>
                  <p className={`text-xs ${isDark ? 'text-primary-200' : 'text-primary-600'}`}>
                    Clicking "Apply Now" will take you directly to the original job posting on the respective job site. If you encounter any issues with a link, try searching for the job directly on the source website.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
      
      {/* Cover Letter Modal */}
      {coverLetterModalOpen && selectedJob && (
        <CoverLetterModal
          isOpen={coverLetterModalOpen}
          onClose={closeCoverLetterModal}
          jobTitle={selectedJob?.title || ''}
          company={selectedJob?.company || ''}
          location={selectedJob?.location || ''}
          keywords={selectedJob?.keywords || []}
        />
      )}

      {/* Auto Apply Modal */}
      {autoApplyModalOpen && (
        <AutoApplyModal
          isOpen={autoApplyModalOpen}
          onClose={closeAutoApplyModal}
          selectedJobs={selectedJobs}
          userProfile={userProfile}
          onProfileUpdate={handleProfileUpdate}
        />
      )}
    </Card>
  );
} 