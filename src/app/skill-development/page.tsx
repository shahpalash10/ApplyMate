"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { motion } from 'framer-motion';

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
  const { theme } = useTheme();
  
  const categories: Category[] = ["All", "Frontend Development", "Programming Language", "Data Science", "Business", "Design", "DevOps & Cloud"];
  
  const filteredSkills = skillsData.filter(skill => {
    const matchesSearch = skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         skill.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || skill.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className={`min-h-screen pt-24 pb-16 ${theme === 'dark' ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className={`text-4xl md:text-5xl font-bold ${theme === 'dark' ? 'text-gradient-dark' : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text'} tracking-tight`}>
            ✨ Skill Development Hub ✨
          </h1>
          <p className={`mt-4 text-xl ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} max-w-2xl mx-auto`}>
            Discover in-demand skills, learning resources, and development paths for your career growth.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Search and Filters */}
          <motion.div 
            className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl ${theme === 'dark' ? 'shadow-lg shadow-black/20' : 'shadow-md'} p-6 mb-8`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row gap-4">
              <div className="md:flex-1">
                <label htmlFor="search" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Search Skills
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    id="search"
                    className={`block w-full pl-10 pr-3 py-2 border ${theme === 'dark' ? 'border-gray-700 bg-gray-700 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' : 'border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm`}
                    placeholder="e.g. Python, UX Design"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="category" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                  Category
                </label>
                <select
                  id="category"
                  className={`block w-full pl-3 pr-10 py-2 border ${theme === 'dark' ? 'border-gray-700 bg-gray-700 text-white focus:ring-blue-500 focus:border-blue-500' : 'border-gray-300 text-gray-800 focus:ring-blue-500 focus:border-blue-500'} rounded-md shadow-sm`}
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
          </motion.div>

          {/* Main Content */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Skills List */}
            <motion.div 
              className="lg:w-1/3"
              variants={containerAnimation}
              initial="hidden"
              animate="show"
            >
              <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                Skills ({filteredSkills.length})
              </h2>
              
              {filteredSkills.length === 0 ? (
                <div className={`rounded-lg p-6 ${theme === 'dark' ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} shadow-md text-center`}>
                  No skills found for your search.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSkills.map(skill => (
                    <motion.div
                      key={skill.id}
                      variants={itemAnimation}
                      onClick={() => setSelectedSkill(skill)}
                      className={`cursor-pointer rounded-lg p-4 ${
                        selectedSkill?.id === skill.id 
                          ? theme === 'dark' 
                            ? 'bg-blue-900/30 border border-blue-700'
                            : 'bg-blue-50 border border-blue-100' 
                          : theme === 'dark'
                            ? 'bg-gray-800 hover:bg-gray-700' 
                            : 'bg-white hover:bg-gray-50'
                      } shadow-md transition-all duration-200`}
                    >
                      <div className="flex justify-between items-center">
                        <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{skill.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                          {skill.category}
                        </span>
                      </div>
                      <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                        {skill.description}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <div>
                          <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Demand</span>
                          <div className="mt-1 h-2 w-24 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                              style={{ width: `${skill.demand * 10}%` }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Difficulty</span>
                          <div className="mt-1 h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-400 to-red-500" 
                              style={{ width: `${skill.difficulty * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
            
            {/* Skill Details */}
            <div className="lg:w-2/3">
              {selectedSkill ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-6`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedSkill.name}</h2>
                      <p className={`mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{selectedSkill.category}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      theme === 'dark'
                        ? 'bg-blue-900/30 text-blue-300'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedSkill.timeToLearn} to learn
                    </span>
                  </div>
                  
                  <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {selectedSkill.description}
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-blue-50'}`}>
                      <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Market Demand</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-3 flex-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600" 
                            style={{ width: `${selectedSkill.demand * 10}%` }}
                          ></div>
                        </div>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {selectedSkill.demand}/10
                        </span>
                      </div>
                      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedSkill.demand >= 8 
                          ? 'High demand in the job market' 
                          : selectedSkill.demand >= 5 
                            ? 'Moderate demand in the job market' 
                            : 'Lower demand in the job market'}
                      </p>
                    </div>
                    
                    <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-amber-50'}`}>
                      <h3 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Learning Difficulty</h3>
                      <div className="flex items-center gap-2">
                        <div className="h-3 flex-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-yellow-400 to-red-500" 
                            style={{ width: `${selectedSkill.difficulty * 10}%` }}
                          ></div>
                        </div>
                        <span className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {selectedSkill.difficulty}/10
                        </span>
                      </div>
                      <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {selectedSkill.difficulty >= 8 
                          ? 'Challenging to learn, requires dedication' 
                          : selectedSkill.difficulty >= 5 
                            ? 'Moderate difficulty, approachable with effort' 
                            : 'Relatively easy to learn for beginners'}
                      </p>
                    </div>
                  </div>
                  
                  <h3 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Learning Resources
                  </h3>
                  
                  <div className="space-y-4">
                    {selectedSkill.resources.map((resource, index) => (
                      <div 
                        key={index}
                        className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white hover:bg-gray-50'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'} transition-colors duration-200`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className={`font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {resource.title}
                          </h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            resource.type === 'free'
                              ? theme === 'dark' ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'
                              : resource.type === 'paid'
                                ? theme === 'dark' ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'
                                : theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
                          </span>
                        </div>
                        <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                          {resource.description}
                        </p>
                        <a 
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center text-sm font-medium ${
                            theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          Visit Resource
                          <svg className="ml-1 w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </a>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`rounded-xl ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg p-8 text-center`}
                >
                  <div className={`mx-auto w-16 h-16 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center mb-4`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Select a Skill
                  </h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Choose a skill from the list to view detailed information and learning resources.
                  </p>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 