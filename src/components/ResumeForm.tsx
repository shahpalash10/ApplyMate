"use client";

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePDF } from 'react-to-pdf';

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  education: string;
  experience: string;
  skills: string;
  projects: string;
  certifications: string;
}

const initialResumeData: ResumeData = {
  name: '',
  email: '',
  phone: '',
  linkedin: '',
  education: '',
  experience: '',
  skills: '',
  projects: '',
  certifications: '',
};

export default function ResumeForm() {
  const [step, setStep] = useState(1);
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [generatedResume, setGeneratedResume] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toPDF, targetRef } = usePDF({
    filename: `${resumeData.name.replace(/\s+/g, '_') || 'resume'}_resume.pdf`,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const generateResume = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isResumeRequest: true, 
          resumeData,
          message: '' 
        }),
      });

      const data = await response.json();
      if (data.response) {
        setGeneratedResume(data.response);
        nextStep();
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={resumeData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={resumeData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={resumeData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                <input
                  type="text"
                  name="linkedin"
                  value={resumeData.linkedin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="linkedin.com/in/johndoe"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!resumeData.name || !resumeData.email}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Education & Experience</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
              <textarea
                name="education"
                value={resumeData.education}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Bachelor of Science in Computer Science, University Name, 2015-2019"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Work Experience</label>
              <textarea
                name="experience"
                value={resumeData.experience}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Software Engineer, Company Name, Jan 2020 - Present: Developed and maintained web applications..."
                required
              />
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!resumeData.education || !resumeData.experience}
              >
                Next
              </button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Skills & Achievements</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
              <textarea
                name="skills"
                value={resumeData.skills}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="JavaScript, React, Node.js, Python, SQL, AWS, etc."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Projects</label>
              <textarea
                name="projects"
                value={resumeData.projects}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Project Name: Description of the project and your role in it."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
              <textarea
                name="certifications"
                value={resumeData.certifications}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="AWS Certified Developer, Google Cloud Professional, etc."
              />
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Previous
              </button>
              <button
                onClick={generateResume}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!resumeData.skills || isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Resume'}
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold mb-6">Your Generated Resume</h2>
            <div className="flex justify-end mb-4">
              <button
                onClick={() => toPDF()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
              >
                <span>Download PDF</span>
              </button>
            </div>
            <div 
              ref={targetRef} 
              className="border border-gray-300 rounded-lg p-8 bg-white"
            >
              <ReactMarkdown>{generatedResume}</ReactMarkdown>
            </div>
            <div className="flex justify-between mt-6">
              <button
                onClick={prevStep}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Edit Information
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setResumeData(initialResumeData);
                  setGeneratedResume('');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create New Resume
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow-md">
      {renderStep()}
    </div>
  );
} 