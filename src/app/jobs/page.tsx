'use client';

import { useTheme } from '../../components/ThemeProvider';
import JobScraper from '../../components/JobScraper';

export default function JobsPage() {
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-16 px-4`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold ${
            isDark 
              ? 'text-gradient-dark' 
              : 'bg-gradient-to-r from-primary-600 to-primary-700 text-transparent bg-clip-text'
          } tracking-tight`}>
            ✨ Job Search Wizard ✨
          </h1>
          <p className={`mt-4 text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Find your dream job with our AI-powered job search platform
          </p>
        </div>
        
        <JobScraper />
      </div>
    </div>
  );
} 