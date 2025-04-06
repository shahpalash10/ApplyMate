'use client';

import { useTheme } from '../../components/ThemeProvider';
import ConversationalResumeBuilder from '../../components/ConversationalResumeBuilder';
import { Card } from '../../components/ui/Card';

export default function ResumePage() {
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
            ✨ Resume Wizard ✨
          </h1>
          <p className={`mt-4 text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Chat with our magical AI assistant and create a job-winning resume in minutes!
          </p>
        </div>
        
        <Card variant={isDark ? "glass" : "default"} className="max-w-5xl mx-auto p-0 overflow-hidden">
          <ConversationalResumeBuilder />
        </Card>
      </div>
    </div>
  );
} 