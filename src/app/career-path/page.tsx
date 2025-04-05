"use client";

import { useState } from 'react';
import Link from 'next/link';

interface CareerPath {
  title: string;
  description: string;
  skills: string[];
  salary: string;
  growth: string;
  education: string;
  nextSteps: string[];
}

const careerPaths: Record<string, CareerPath> = {
  "software-development": {
    title: "Software Development",
    description: "Design, develop, and maintain software applications across various platforms.",
    skills: ["Programming Languages", "Software Architecture", "Testing", "DevOps", "Problem Solving"],
    salary: "$80,000 - $150,000+",
    growth: "22% (Much faster than average)",
    education: "Bachelor's degree in Computer Science or related field; bootcamps are also viable paths",
    nextSteps: [
      "Learn key programming languages (JavaScript, Python)",
      "Build a portfolio of projects",
      "Contribute to open source",
      "Practice algorithmic problem solving"
    ]
  },
  "data-science": {
    title: "Data Science",
    description: "Extract insights from complex data using statistics, programming, and domain knowledge.",
    skills: ["Statistics", "Machine Learning", "SQL", "Python/R", "Data Visualization"],
    salary: "$95,000 - $180,000+",
    growth: "36% (Much faster than average)",
    education: "Master's degree in Data Science, Statistics, or related field often preferred",
    nextSteps: [
      "Master Python and R for data analysis",
      "Learn key ML libraries (scikit-learn, TensorFlow)",
      "Practice with real datasets on Kaggle",
      "Build data visualization skills"
    ]
  },
  "product-management": {
    title: "Product Management",
    description: "Guide product development from conception to market, balancing user needs with business goals.",
    skills: ["User Research", "Strategic Thinking", "Prioritization", "Communication", "Technical Knowledge"],
    salary: "$85,000 - $170,000+",
    growth: "10% (Faster than average)",
    education: "Bachelor's degree; technical background often helpful; MBA sometimes preferred",
    nextSteps: [
      "Learn product development methodologies",
      "Gain experience with market research",
      "Develop technical understanding of your domain",
      "Practice storytelling and presentation skills"
    ]
  },
  "ux-design": {
    title: "UX Design",
    description: "Create meaningful, accessible user experiences through research, prototyping, and design.",
    skills: ["User Research", "Wireframing", "Prototyping", "Usability Testing", "Visual Design"],
    salary: "$75,000 - $130,000+",
    growth: "23% (Much faster than average)",
    education: "Bachelor's degree in Design, HCI, or related field; bootcamps are also common",
    nextSteps: [
      "Build a portfolio showcasing user-centered design",
      "Learn key design tools (Figma, Sketch)",
      "Practice user research methods",
      "Develop understanding of accessibility standards"
    ]
  }
};

export default function CareerPathPage() {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [currentRole, setCurrentRole] = useState<string>("");
  const [interests, setInterests] = useState<string>("");
  const [skills, setSkills] = useState<string>("");
  const [education, setEducation] = useState<string>("");
  const [results, setResults] = useState<string[]>([]);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple matching algorithm based on keywords in inputs
    const matches: string[] = [];
    
    Object.keys(careerPaths).forEach(pathKey => {
      const path = careerPaths[pathKey];
      let score = 0;
      
      // Check for keyword matches in user inputs
      if (interests.toLowerCase().includes(path.title.toLowerCase())) score += 3;
      
      path.skills.forEach(skill => {
        if (skills.toLowerCase().includes(skill.toLowerCase())) score += 2;
      });
      
      if (score > 0) matches.push(pathKey);
    });
    
    setResults(matches.length > 0 ? matches : Object.keys(careerPaths));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text tracking-tight">
            ✨ Career Path Planning ✨
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Discover your ideal career path and get a personalized roadmap to success.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
          <div className="md:flex">
            {/* Assessment Form */}
            <div className="p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Career Assessment</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="currentRole" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Role
                  </label>
                  <input
                    type="text"
                    id="currentRole"
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    placeholder="e.g. Junior Developer"
                  />
                </div>
                
                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700 mb-1">
                    Career Interests
                  </label>
                  <textarea
                    id="interests"
                    value={interests}
                    onChange={(e) => setInterests(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    placeholder="e.g. I'm interested in technology and solving problems"
                  />
                </div>
                
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Skills
                  </label>
                  <textarea
                    id="skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    placeholder="e.g. Programming, communication, project management"
                  />
                </div>
                
                <div>
                  <label htmlFor="education" className="block text-sm font-medium text-gray-700 mb-1">
                    Education Background
                  </label>
                  <input
                    type="text"
                    id="education"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    placeholder="e.g. Bachelor's in Computer Science"
                  />
                </div>
                
                <div>
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-md shadow-sm text-white font-medium bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    Find My Career Path
                  </button>
                </div>
              </form>
            </div>
            
            {/* Results Section */}
            <div className="p-8 md:w-1/2 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {results.length > 0 ? "Recommended Paths" : "Select a Career Path"}
              </h2>
              
              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((pathKey) => (
                    <button
                      key={pathKey}
                      onClick={() => setSelectedPath(pathKey)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors duration-200 ${
                        selectedPath === pathKey
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      <h3 className="font-medium text-gray-900">{careerPaths[pathKey].title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{careerPaths[pathKey].description}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Complete the assessment to get personalized career path recommendations.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.keys(careerPaths).map((pathKey) => (
                      <button
                        key={pathKey}
                        onClick={() => setSelectedPath(pathKey)}
                        className={`text-left p-4 rounded-lg border transition-colors duration-200 ${
                          selectedPath === pathKey
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        <h3 className="font-medium text-gray-900">{careerPaths[pathKey].title}</h3>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Career Path Details */}
        {selectedPath && (
          <div className="mt-12 bg-white rounded-xl shadow-lg overflow-hidden max-w-4xl mx-auto">
            <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-700">
              <h2 className="text-2xl font-bold text-white">{careerPaths[selectedPath].title}</h2>
              <p className="mt-2 text-blue-100">{careerPaths[selectedPath].description}</p>
            </div>
            
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Skills</h3>
                  <ul className="space-y-2">
                    {careerPaths[selectedPath].skills.map((skill, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700">{skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Average Salary</h3>
                    <p className="text-gray-700">{careerPaths[selectedPath].salary}</p>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Job Growth</h3>
                    <p className="text-gray-700">{careerPaths[selectedPath].growth}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Typical Education</h3>
                    <p className="text-gray-700">{careerPaths[selectedPath].education}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h3>
                <ol className="space-y-2">
                  {careerPaths[selectedPath].nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-medium text-sm mr-3">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
                
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/skill-development"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Explore Skills
                    <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  
                  <Link
                    href="/resume"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Update Resume
                    <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 