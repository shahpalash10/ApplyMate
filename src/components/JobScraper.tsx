"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import CoverLetterModal from './CoverLetterModal';

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
  const formRef = useRef<HTMLFormElement>(null);

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
    
    // Log for debugging
    console.log("Opening cover letter modal with job:", JSON.stringify(jobData, null, 2));
    
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

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-100px)] bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl overflow-hidden border border-gray-200">
      <div className="p-4 md:p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Job Search Wizard ✨
        </h2>
        <p className="text-blue-100 mt-1 text-sm md:text-base">Find your dream job with AI-powered search</p>
      </div>
      
      <div className="p-4 md:p-6 overflow-y-auto flex-1 pb-16" style={{ WebkitOverflowScrolling: 'touch' }}>
        <form ref={formRef} onSubmit={handleSubmit} className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title / Role
              </label>
              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Software Engineer, Product Manager"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                required
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location (Optional)
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Bangalore, Remote"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              />
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1">
                Experience (Optional)
              </label>
              <select
                id="experience"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              >
                <option value="">Any Experience</option>
                <option value="fresher">Fresher</option>
                <option value="0-1 years">0-1 Years</option>
                <option value="1-3 years">1-3 Years</option>
                <option value="3-5 years">3-5 Years</option>
                <option value="5+ years">5+ Years</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className={`px-4 py-2 rounded-lg ${
                isLoading || !query.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
              } transition-all duration-200`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Find Jobs
                </div>
              )}
            </button>
          </div>
        </form>
        
        {isLoading && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
            <div className="text-center mb-4">
              <div className="flex justify-center mb-2">
                <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Searching for jobs</h3>
              <p className="text-gray-600">Crawling multiple job sites to find the best matches for you...</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {Object.keys(sourceFilters).map(source => (
                <div key={source} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-gray-800">{source}</span>
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute h-3 w-3 rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative rounded-full h-3 w-3 bg-blue-500"></span>
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">Searching...</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 mb-2">{error}</div>
            <button
              onClick={() => formRef.current?.reset()}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try a different search
            </button>
          </div>
        )}
        
        {jobs.length > 0 && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium text-gray-900">Found {filteredJobs.length} job listings</h3>
              
              <button
                onClick={() => openCoverLetterModal()}
                className="inline-flex items-center px-3 py-1.5 border border-indigo-500 text-indigo-600 rounded-md text-sm hover:bg-indigo-50 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Create Cover Letter
              </button>
            </div>
            
            <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-between sticky top-0 bg-white p-3 md:p-4 rounded-lg shadow-sm z-10 border border-gray-100">
              <div className="text-base md:text-lg font-medium text-gray-800 mb-2">
                Found {jobs.length} job{jobs.length !== 1 ? 's' : ''} matching your search
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3">
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                  {Object.entries(sourceFilters).map(([source, isActive]) => (
                    <button 
                      key={source}
                      onClick={() => handleSourceFilterChange(source)}
                      className={`px-2 py-1 rounded-md text-xs flex items-center ${
                        isActive 
                          ? 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full mr-1 ${isActive ? 'bg-indigo-500' : 'bg-gray-400'}`}></span>
                      {source}
                      {sourceCounts[source] > 0 && (
                        <span className={`ml-1 px-1 rounded-full text-xs ${
                          isActive ? 'bg-indigo-200 text-indigo-800' : 'bg-gray-200 text-gray-600'
                        }`}>
                          {sourceCounts[source]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs md:text-sm text-gray-600">Sort:</span>
                  <select 
                    id="sortBy"
                    aria-label="Sort jobs by"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'match' | 'company' | 'location')}
                    className="text-xs px-2 md:px-3 py-1 rounded-md border border-gray-200 text-gray-800"
                  >
                    <option value="match">Best Match</option>
                    <option value="company">Company</option>
                    <option value="location">Location</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="grid gap-4 md:gap-6 pb-10">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-4 md:p-5">
                      <div className="flex justify-between items-start">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
                        {job.match_score && (
                          <div className={`text-xs md:text-sm font-medium px-2 py-1 rounded-full ml-2 ${
                            job.match_score >= 80 ? 'bg-green-100 text-green-800' :
                            job.match_score >= 60 ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {job.match_score}% Match
                          </div>
                        )}
                      </div>
                      
                      <div className="text-gray-600 text-xs md:text-sm mb-2">{job.company}</div>
                      
                      <div className="flex flex-wrap gap-1 md:gap-2 mb-2">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate max-w-[150px]">{job.location}</span>
                        </div>
                        
                        {job.salary && (
                          <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="truncate max-w-[120px]">{job.salary}</span>
                          </div>
                        )}
                        
                        <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          job.source === 'LinkedIn' ? 'bg-blue-100 text-blue-800' :
                          job.source === 'Naukri' ? 'bg-purple-100 text-purple-800' :
                          job.source === 'Internshala' ? 'bg-green-100 text-green-800' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {job.source}
                        </div>
                        
                        {job.difficulty && (
                          <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            job.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                            job.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {job.difficulty}
                          </div>
                        )}
                      </div>
                      
                      {job.keywords && job.keywords.length > 0 && (
                        <div className="mb-2">
                          <div className="text-xs text-gray-500 mb-1">Keywords:</div>
                          <div className="flex flex-wrap gap-1">
                            {job.keywords.map((keyword, kIndex) => (
                              <span 
                                key={kIndex} 
                                className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
                              >
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {job.recommendations && (
                        <div className="mt-2 p-2 md:p-3 bg-blue-50 rounded-md text-xs md:text-sm text-blue-800">
                          <div className="font-medium mb-1">AI Recommendations:</div>
                          <div className="text-xs md:text-sm">
                            <ReactMarkdown>{job.recommendations}</ReactMarkdown>
                          </div>
                        </div>
                      )}
                      
                      <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500 inline-flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Source: {job.source}
                          </span>
                          <button
                            onClick={() => openCoverLetterModal(job)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center"
                            aria-label={`Generate cover letter for ${job.title} at ${job.company}`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Generate Cover Letter
                          </button>
                        </div>
                        {job.link && (
                          <a 
                            href={job.link.startsWith('http') ? job.link : `https://${job.link}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 border border-transparent rounded-md shadow-sm text-xs md:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                            onClick={(e) => {
                              // Validate the URL before attempting to open
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
                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                  <p className="text-gray-500">No jobs match your current filters. Try adjusting your filter settings.</p>
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4 mb-8">
              <div className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">About the "Apply Now" links</h4>
                  <p className="text-xs text-blue-700">
                    Clicking "Apply Now" will take you directly to the original job posting on the respective job site. If you encounter any issues with a link, try searching for the job directly on the source website.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Cover Letter Modal */}
      {selectedJob && (
        <CoverLetterModal
          isOpen={coverLetterModalOpen}
          onClose={closeCoverLetterModal}
          jobTitle={selectedJob.title}
          company={selectedJob.company}
          location={selectedJob.location}
          keywords={selectedJob.keywords}
        />
      )}
    </div>
  );
} 