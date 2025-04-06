'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

// Define animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1 * i,
      duration: 0.5,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

const features = [
  {
    title: 'Automate Job Applications',
    description: 'Our application fetches the best jobs for you and applies automatically, saving you time and effort.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
      </svg>
    ),
  },
  {
    title: 'Automated Resume Builder',
    description: 'Our AI automatically builds a custom tailored ATS-Friendly resume for you.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    title: 'Skill Development',
    description: 'Identify your skill gaps and get personalized recommendations for courses and resources to boost your career.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
      </svg>
    ),
  },
  {
    title: 'Personalised Profile',
    description: 'We make a custom-profile for you that helps you automate your job applications.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
      </svg>
    ),
  },
];

const jobRoles = [
  'Machine Learning Engineer',
  'Data Scientist',
  'AI Research Scientist',
  'NLP Engineer',
  'Computer Vision Engineer',
  'AI Ethics Researcher',
  'Robotics Engineer',
  'Deep Learning Specialist',
  'AI Product Manager',
  'MLOps Engineer',
];

// Update the job role animation styles to ensure text is fully visible
const jobRoleAnimationStyles = `
  .job-role-container {
    position: relative;
    display: inline-block;
    overflow: hidden;
    height: 1.5em;
    min-width: 240px; /* Increased width to accommodate longer text */
    vertical-align: bottom;
  }
  
  .job-roles-slider {
    position: absolute;
    left: 0;
    display: flex;
    flex-direction: column;
    transition: transform 800ms cubic-bezier(0.34, 1.56, 0.64, 1);
    will-change: transform;
    width: 100%;
  }
  
  .job-role-item {
    height: 1.5em;
    display: flex;
    align-items: center;
    padding-left: 0.25rem;
    padding-right: 0.25rem;
    justify-content: flex-start;
    white-space: nowrap;
    font-weight: 600;
  }

  /* Media query for responsive width adjustment */
  @media (max-width: 640px) {
    .job-role-container {
      min-width: 210px;
    }
  }
`;

export default function Home() {
  const { isDark } = useTheme();
  const [currentJobIndex, setCurrentJobIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Auto-rotate job titles
  useEffect(() => {
    // We'll wait a bit before starting the animation for everything to render properly
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentJobIndex((prev) => (prev + 1) % jobRoles.length);
      }, 3500); // Slightly longer time between changes for better readability
      
      return () => clearInterval(interval);
    }, 1000); // Delay the start of rotation
    
    return () => clearTimeout(startDelay);
  }, []);

  // Set visibility for animation when component mounts
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:py-32 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute inset-0 ${isDark ? 'grid-pattern-dark' : 'grid-pattern'} opacity-30`}></div>
          <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary-500/20 rounded-full filter blur-[100px] -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-accent-500/20 rounded-full filter blur-[100px] translate-y-1/2"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="mb-6"
            >
              <span className="inline-block px-4 py-1.5 rounded-full text-sm font-medium bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300">
                Apply Smarter, Not Harder.
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              One-Stop Solution for all your <span className="text-gradient">Job Applications</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-12 mb-8"
            >
              <style jsx>{jobRoleAnimationStyles}</style>

              <p className="text-xl text-gray-600 dark:text-gray-300">
                Discover the perfect role as a{' '}
                <span className="job-role-container">
                  <span 
                    className="job-roles-slider text-primary-600 dark:text-primary-400 font-semibold"
                    style={{ 
                      transform: `translateY(${-currentJobIndex * 1.5}em)`,
                    }}
                  >
                    {jobRoles.map((role, index) => (
                      <span key={index} className="job-role-item">
                        {role}
                      </span>
                    ))}
                  </span>
                </span>
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button
                variant="primary"
                size="lg"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                }
              >
                <Link href="/jobs">Explore Jobs</Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                }
              >
                <Link href="/resume">Build Your Resume</Link>
              </Button>
            </motion.div>
          </div>

          {/* 3D-like mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-16 relative max-w-4xl mx-auto"
          >
            <div className="aspect-[16/9] rounded-xl overflow-hidden shadow-2xl transform -rotate-1 hover:rotate-0 transition-transform duration-500">
              <div className={`w-full h-full ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl overflow-hidden relative border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`absolute top-0 left-0 right-0 h-10 ${isDark ? 'bg-gray-900' : 'bg-gray-100'} flex items-center px-4`}>
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className={`mx-auto text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>ApplyMate Platform Dashboard</div>
                </div>
                <div className="pt-10 h-full animate-pulse-slow">
                  <div className={`grid grid-cols-3 gap-4 p-4 h-full ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className={`col-span-1 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className={`h-4 w-2/3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-3`}></div>
                      <div className={`h-24 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-3`}></div>
                      <div className={`h-4 w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-3`}></div>
                      <div className={`h-4 w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                    </div>
                    <div className={`col-span-2 ${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className={`h-4 w-1/3 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded mb-3`}></div>
                      <div className={`grid grid-cols-2 gap-3`}>
                        <div className={`h-20 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                        <div className={`h-20 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                        <div className={`h-20 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                        <div className={`h-20 ${isDark ? 'bg-gray-700' : 'bg-gray-200'} rounded`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent-500/30 rounded-full filter blur-xl animate-pulse-slow"></div>
            <div className="absolute -top-4 -left-8 w-16 h-16 bg-primary-500/30 rounded-full filter blur-xl animate-pulse-slow"></div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <motion.h2 
              custom={0}
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-4"
            >
              How <span className="text-gradient">ApplyMate</span> Transforms Your Career
            </motion.h2>
            <motion.p 
              custom={1}
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              Our intelligent platform uses cutting-edge AI to optimize every aspect of your job search journey
            </motion.p>
        </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
              <motion.div
                key={index}
                custom={index + 2}
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <Card 
                  variant={isDark ? "glass" : "neumorphic"} 
                  className="h-full p-6"
                  hoverEffect
                >
                  <div className={`w-12 h-12 rounded-lg mb-5 flex items-center justify-center ${
                    isDark 
                      ? 'bg-primary-900/50 text-primary-400' 
                      : 'bg-primary-100 text-primary-600'
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`py-20 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                custom={0}
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="text-center"
              >
                <Card 
                  variant="glass" 
                  className="p-6"
                >
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gradient">60%</span>
                </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">ApplyMate reduces your job hunt-time.</p>
                </Card>
              </motion.div>
              
              <motion.div
                custom={1}
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="text-center"
              >
                <Card 
                  variant="glass" 
                  className="p-6"
                >
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gradient">40%</span>
                </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">Tailored Resumes increases your Interview Chances.</p>
                </Card>
              </motion.div>
              
              <motion.div
                custom={2}
                variants={fadeIn}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                className="text-center"
              >
                <Card 
                  variant="glass" 
                  className="p-6"
                >
                  <div className="mb-4">
                    <span className="text-5xl font-bold text-gradient">11 Hrs+</span>
                  </div>
                  <p className="text-lg text-gray-600 dark:text-gray-300">The time it takes per week to search and apply for jobs manually.</p>
                </Card>
              </motion.div>
                </div>
                </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary-500/10 rounded-full filter blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-accent-500/10 rounded-full filter blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
      </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              custom={0}
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold mb-6"
            >
              Ready to Accelerate Your <span className="text-gradient">Career</span>?
            </motion.h2>
            
            <motion.p
              custom={1}
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="text-xl text-gray-600 dark:text-gray-300 mb-8"
            >
              Automate Applications so that you can focus on what matters most-your skills.
            </motion.p>
            
            <motion.div
              custom={2}
              variants={fadeIn}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button variant="primary" size="lg">
                <Link href="/profile">Create Your Profile</Link>
              </Button>
              <Button variant="glass" size="lg">
                <Link href="/jobs">Browse Jobs</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}