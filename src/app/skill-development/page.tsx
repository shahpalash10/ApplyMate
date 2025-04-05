"use client";

import { useState } from 'react';
import Link from 'next/link';

interface Skill {
  id: string;
  name: string;
  category: string;
  description: string;
  demand: number; // 1-10 scale
  difficulty: number; // 1-10 scale
  timeToLearn: string;
  resources: {
    title: string;
    url: string;
    type: "free" | "paid" | "mixed";
    description: string;
  }[];
}

const skillsData: Skill[] = [
  {
    id: "react",
    name: "React",
    category: "Frontend Development",
    description: "A JavaScript library for building user interfaces, particularly single-page applications.",
    demand: 9,
    difficulty: 6,
    timeToLearn: "2-4 months",
    resources: [
      {
        title: "React Official Documentation",
        url: "https://reactjs.org/docs/getting-started.html",
        type: "free",
        description: "The official React documentation with guides, API references, and examples."
      },
      {
        title: "Epic React by Kent C. Dodds",
        url: "https://epicreact.dev/",
        type: "paid",
        description: "A comprehensive course on React, from fundamentals to advanced patterns."
      },
      {
        title: "React - The Complete Guide (Udemy)",
        url: "https://www.udemy.com/course/react-the-complete-guide-incl-redux/",
        type: "paid",
        description: "A bestselling course covering React fundamentals, hooks, Redux, and more."
      }
    ]
  },
  {
    id: "python",
    name: "Python",
    category: "Programming Language",
    description: "A versatile programming language used in web development, data science, automation, and more.",
    demand: 10,
    difficulty: 4,
    timeToLearn: "1-3 months",
    resources: [
      {
        title: "Python.org Official Tutorial",
        url: "https://docs.python.org/3/tutorial/",
        type: "free",
        description: "The official Python tutorial, covering fundamentals and standard libraries."
      },
      {
        title: "Automate the Boring Stuff with Python",
        url: "https://automatetheboringstuff.com/",
        type: "mixed",
        description: "A practical programming guide for beginners, with free online content and paid book."
      },
      {
        title: "Python Crash Course (No Starch Press)",
        url: "https://nostarch.com/pythoncrashcourse2e",
        type: "paid",
        description: "A hands-on, project-based introduction to programming with Python."
      }
    ]
  },
  {
    id: "data-analysis",
    name: "Data Analysis",
    category: "Data Science",
    description: "The process of inspecting, cleansing, transforming, and modeling data to discover insights.",
    demand: 9,
    difficulty: 7,
    timeToLearn: "3-6 months",
    resources: [
      {
        title: "Kaggle Learn",
        url: "https://www.kaggle.com/learn/overview",
        type: "free",
        description: "Hands-on tutorials on data analysis, visualization, and machine learning."
      },
      {
        title: "Data Analysis with Python (FreeCodeCamp)",
        url: "https://www.freecodecamp.org/learn/data-analysis-with-python/",
        type: "free",
        description: "A comprehensive course on data analysis using Python libraries like Pandas and NumPy."
      },
      {
        title: "IBM Data Analysis Professional Certificate",
        url: "https://www.coursera.org/professional-certificates/ibm-data-analyst",
        type: "paid",
        description: "A professional certificate program covering all aspects of data analysis."
      }
    ]
  },
  {
    id: "product-management",
    name: "Product Management",
    category: "Business",
    description: "The practice of strategically managing a product throughout its lifecycle, from conception to market.",
    demand: 8,
    difficulty: 7,
    timeToLearn: "6-12 months",
    resources: [
      {
        title: "Product School Resources",
        url: "https://www.productschool.com/resources/",
        type: "mixed",
        description: "Free articles, webinars, and podcasts on product management fundamentals and trends."
      },
      {
        title: "Product Management 101 (Udemy)",
        url: "https://www.udemy.com/course/productmanagement101/",
        type: "paid",
        description: "A comprehensive introduction to product management principles and practices."
      },
      {
        title: "Inspired: How to Create Products Customers Love",
        url: "https://svpg.com/inspired-how-to-create-products-customers-love/",
        type: "paid",
        description: "A highly regarded book on product management by Marty Cagan."
      }
    ]
  },
  {
    id: "ux-design",
    name: "UX Design",
    category: "Design",
    description: "The process of creating products that provide meaningful and relevant experiences to users.",
    demand: 8,
    difficulty: 6,
    timeToLearn: "3-6 months",
    resources: [
      {
        title: "NN/g UX Articles",
        url: "https://www.nngroup.com/articles/",
        type: "free",
        description: "Research-based articles on user experience from the Nielsen Norman Group."
      },
      {
        title: "Google UX Design Professional Certificate",
        url: "https://www.coursera.org/professional-certificates/google-ux-design",
        type: "paid",
        description: "A comprehensive program covering all aspects of UX design, from Google."
      },
      {
        title: "Interaction Design Foundation",
        url: "https://www.interaction-design.org/",
        type: "paid",
        description: "An educational platform offering courses on UX design and related disciplines."
      }
    ]
  },
  {
    id: "aws",
    name: "AWS Cloud Services",
    category: "DevOps & Cloud",
    description: "Amazon Web Services, a cloud computing platform offering over 200 services globally.",
    demand: 9,
    difficulty: 8,
    timeToLearn: "3-6 months",
    resources: [
      {
        title: "AWS Free Digital Training",
        url: "https://aws.amazon.com/training/digital/",
        type: "free",
        description: "Official free digital training resources from Amazon Web Services."
      },
      {
        title: "AWS Certified Solutions Architect",
        url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
        type: "paid",
        description: "A certification program for designing available, cost-efficient AWS architectures."
      },
      {
        title: "A Cloud Guru - AWS Courses",
        url: "https://acloudguru.com/aws-cloud-training",
        type: "paid",
        description: "Comprehensive AWS courses designed for certification and practical skills."
      }
    ]
  }
];

type Category = "All" | "Frontend Development" | "Programming Language" | "Data Science" | "Business" | "Design" | "DevOps & Cloud";

export default function SkillDevelopmentPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>("All");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  
  const categories: Category[] = ["All", "Frontend Development", "Programming Language", "Data Science", "Business", "Design", "DevOps & Cloud"];
  
  const filteredSkills = skillsData.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text tracking-tight">
            ✨ Skill Development Hub ✨
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Discover in-demand skills, learning resources, and development paths for your career growth.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:flex-1">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Skills
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-800"
                    placeholder="e.g. Python, UX Design"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as Category)}
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Skills List and Detail View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Skills List */}
            <div className="md:col-span-1 space-y-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Skills ({filteredSkills.length})</h2>
              
              {filteredSkills.length > 0 ? (
                <div className="space-y-3">
                  {filteredSkills.map(skill => (
                    <button
                      key={skill.id}
                      className={`w-full text-left p-4 rounded-lg shadow-sm transition-colors duration-200 ${
                        selectedSkill?.id === skill.id
                          ? 'bg-blue-50 border border-blue-200 ring-2 ring-blue-500'
                          : 'bg-white border border-gray-200 hover:border-blue-200 hover:bg-blue-50'
                      }`}
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <h3 className="font-semibold text-gray-900">{skill.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{skill.category}</p>
                      <div className="flex items-center mt-2">
                        <span className="text-xs text-white bg-blue-600 px-2 py-1 rounded-full">
                          Demand: {skill.demand}/10
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center text-gray-500">
                  No skills match your search criteria
                </div>
              )}
            </div>
            
            {/* Skill Details */}
            <div className="md:col-span-2">
              {selectedSkill ? (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
                    <h2 className="text-xl font-bold text-white">{selectedSkill.name}</h2>
                    <p className="text-blue-100 text-sm mt-1">{selectedSkill.category}</p>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-700 mb-6">{selectedSkill.description}</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-blue-800 mb-1">Market Demand</h3>
                        <div className="flex items-center">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-600 rounded-full" 
                              style={{ width: `${selectedSkill.demand * 10}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-blue-800 font-semibold">{selectedSkill.demand}/10</span>
                        </div>
                      </div>
                      
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-purple-800 mb-1">Learning Difficulty</h3>
                        <div className="flex items-center">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-purple-600 rounded-full" 
                              style={{ width: `${selectedSkill.difficulty * 10}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-purple-800 font-semibold">{selectedSkill.difficulty}/10</span>
                        </div>
                      </div>
                      
                      <div className="bg-green-50 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-green-800 mb-1">Time to Learn</h3>
                        <p className="text-green-800 font-semibold">{selectedSkill.timeToLearn}</p>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Resources</h3>
                    <div className="space-y-4">
                      {selectedSkill.resources.map((resource, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors duration-200">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900">{resource.title}</h4>
                            <span className={`text-xs uppercase font-semibold px-2 py-1 rounded-full ${
                              resource.type === 'free' 
                                ? 'bg-green-100 text-green-800' 
                                : resource.type === 'paid' 
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-blue-100 text-blue-800'
                            }`}>
                              {resource.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 mb-3">{resource.description}</p>
                          <a 
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                          >
                            Visit Resource
                            <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 border-t border-gray-200 pt-6 flex flex-wrap gap-3">
                      <Link
                        href="/career-path"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Explore Career Paths
                        <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                      
                      <Link
                        href="/resume"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                      >
                        Update Resume
                        <svg className="ml-2 -mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 flex flex-col items-center justify-center h-full">
                  <svg className="h-16 w-16 text-gray-300 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a skill</h3>
                  <p className="text-gray-500 text-center max-w-sm">
                    Choose a skill from the list to view detailed information, demand metrics, and learning resources.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 