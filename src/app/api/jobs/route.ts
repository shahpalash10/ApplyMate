import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { getGeminiApiKey, isGeminiConfigured, geminiConfig } from '@/utils/apiConfig';

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

// Replace the existing API key code with:
const apiKey = getGeminiApiKey();
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    const { query, location, experience } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Job query is required' },
        { status: 400 }
      );
    }

    // Check if API key is available - if not, provide fallback experience
    const useAI = isGeminiConfigured();

    // Scrape job listings from multiple sites
    const jobs = await Promise.all([
      scrapeInternshala(query, location),
      scrapeUnstop(query, location),
      scrapeNaukri(query, location, experience),
      scrapeLinkedIn(query, location, experience),
      scrapeIndeed(query, location, experience),
      // Add more job sites as needed
    ]);

    // Flatten the results
    const allJobs = jobs.flat();

    // Process the jobs with Gemini for better formatting and additional insights
    const enhancedJobs = await enhanceJobsWithGemini(allJobs, query, experience, useAI);

    return NextResponse.json({ jobs: enhancedJobs });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape job listings' },
      { status: 500 }
    );
  }
}

async function scrapeInternshala(query: string, location?: string): Promise<JobListing[]> {
  try {
    // Format the query for Internshala URL
    const formattedQuery = query.toLowerCase().replace(/\s+/g, '-');
    const url = `https://internshala.com/jobs/${formattedQuery}`;
    
    console.log(`Scraping Internshala: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const jobs: JobListing[] = [];
    
    // Extract job listings - adjust selectors based on Internshala's HTML structure
    $('.individual_internship').each((_, element) => {
      const title = $(element).find('.heading_4_5').text().trim();
      const company = $(element).find('.company_name').text().trim();
      const locationText = $(element).find('.location_link').text().trim();
      const salary = $(element).find('.stipend').text().trim();
      
      // Get href attribute and ensure it's a complete URL
      let linkHref = $(element).find('a.view_detail_button').attr('href') || '';
      // Check if link is relative and make it absolute
      const link = linkHref.startsWith('http') ? linkHref : `https://internshala.com${linkHref}`;
      
      // Only add jobs that match location if specified
      if (!location || locationText.toLowerCase().includes(location.toLowerCase())) {
        jobs.push({
          title,
          company,
          location: locationText,
          salary,
          link,
          source: 'Internshala'
        });
      }
    });
    
    return jobs;
  } catch (error) {
    console.error('Error scraping Internshala:', error);
    return [];
  }
}

async function scrapeUnstop(query: string, location?: string): Promise<JobListing[]> {
  try {
    // Format the query for Unstop URL
    const formattedQuery = query.toLowerCase().replace(/\s+/g, '+');
    const url = `https://unstop.com/jobs?search=${formattedQuery}`;
    
    console.log(`Scraping Unstop: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const jobs: JobListing[] = [];
    
    // Extract job listings - adjust selectors based on Unstop's HTML structure
    $('.opportunity-card').each((_, element) => {
      const title = $(element).find('.opportunity-title').text().trim();
      const company = $(element).find('.company-name').text().trim();
      const locationText = $(element).find('.location-text').text().trim();
      const salary = $(element).find('.stipend-text').text().trim() || 'Not specified';
      
      // Get href attribute and ensure it's a complete URL
      let linkHref = $(element).find('a.card-link').attr('href') || '';
      // Check if link is relative and make it absolute
      const link = linkHref.startsWith('http') ? linkHref : `https://unstop.com${linkHref}`;
      
      // Only add jobs that match location if specified
      if (!location || locationText.toLowerCase().includes(location.toLowerCase())) {
        jobs.push({
          title,
          company,
          location: locationText,
          salary,
          link,
          source: 'Unstop'
        });
      }
    });
    
    return jobs;
  } catch (error) {
    console.error('Error scraping Unstop:', error);
    return [];
  }
}

async function scrapeNaukri(query: string, location?: string, experience?: string): Promise<JobListing[]> {
  try {
    // Format the query for Naukri URL
    const formattedQuery = query.toLowerCase().replace(/\s+/g, '-');
    let url = `https://www.naukri.com/jobs-in-india?keyword=${formattedQuery}`;
    
    if (location) {
      url += `&location=${location.toLowerCase().replace(/\s+/g, '-')}`;
    }
    
    if (experience) {
      // Map experience to Naukri's format
      let expValue = '0';
      if (experience.includes('fresher') || experience.includes('0-1')) {
        expValue = '0';
      } else if (experience.includes('1-3')) {
        expValue = '1';
      } else if (experience.includes('3-5')) {
        expValue = '3';
      } else if (experience.includes('5+')) {
        expValue = '5';
      }
      url += `&experience=${expValue}`;
    }
    
    console.log(`Scraping Naukri: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const jobs: JobListing[] = [];
    
    // Extract job listings
    $('.jobTuple').each((_, element) => {
      const title = $(element).find('.title').text().trim();
      const company = $(element).find('.companyInfo span.subTitle').text().trim();
      const locationText = $(element).find('.subTitle.ellipsis.fleft.location').text().trim();
      const salary = $(element).find('.salary').text().trim() || 'Not specified';
      
      // Try to find the job URL and ensure it's a complete URL
      let linkHref = $(element).find('a.title').attr('href') || '';
      // Ensure the link is a complete URL
      const link = linkHref.startsWith('http') ? linkHref : `https://www.naukri.com${linkHref}`;
      
      // Only add jobs that match location if specified
      if (!location || locationText.toLowerCase().includes(location.toLowerCase())) {
        jobs.push({
          title,
          company,
          location: locationText,
          salary,
          link,
          source: 'Naukri'
        });
      }
    });
    
    return jobs;
  } catch (error) {
    console.error('Error scraping Naukri:', error);
    return [];
  }
}

async function scrapeLinkedIn(query: string, location?: string, experience?: string): Promise<JobListing[]> {
  try {
    // Format the query for LinkedIn URL
    const formattedQuery = query.toLowerCase().replace(/\s+/g, '%20');
    let url = `https://www.linkedin.com/jobs/search/?keywords=${formattedQuery}`;
    
    if (location) {
      url += `&location=${location.toLowerCase().replace(/\s+/g, '%20')}`;
    }
    
    if (experience) {
      // Map experience to LinkedIn's format
      let expFilter = '';
      if (experience.includes('fresher') || experience.includes('0-1')) {
        expFilter = '&f_E=1%2C2'; // Internship, Entry level
      } else if (experience.includes('1-3')) {
        expFilter = '&f_E=2'; // Entry level
      } else if (experience.includes('3-5')) {
        expFilter = '&f_E=3'; // Associate level
      } else if (experience.includes('5+')) {
        expFilter = '&f_E=4%2C5'; // Mid-Senior level, Director
      }
      url += expFilter;
    }
    
    console.log(`Scraping LinkedIn: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const jobs: JobListing[] = [];
    
    // Extract job listings - LinkedIn has complex structure and may require updates
    $('.base-card.relative.job-search-card').each((_, element) => {
      const title = $(element).find('.base-search-card__title').text().trim();
      const company = $(element).find('.base-search-card__subtitle').text().trim();
      const locationText = $(element).find('.job-search-card__location').text().trim();
      const salary = 'Check on LinkedIn'; // LinkedIn often doesn't show salary
      
      // Get the job link and ensure it's a complete URL
      let linkHref = $(element).find('a.base-card__full-link').attr('href') || '';
      // Ensure we have a complete URL
      const link = linkHref;
      
      // Only add jobs that match location if specified and have required info
      if (title && company && (!location || locationText.toLowerCase().includes(location.toLowerCase()))) {
        jobs.push({
          title,
          company,
          location: locationText,
          salary,
          link,
          source: 'LinkedIn'
        });
      }
    });
    
    return jobs;
  } catch (error) {
    console.error('Error scraping LinkedIn:', error);
    return [];
  }
}

async function scrapeIndeed(query: string, location?: string, experience?: string): Promise<JobListing[]> {
  try {
    // Format the query for Indeed URL
    const formattedQuery = query.toLowerCase().replace(/\s+/g, '+');
    let url = `https://www.indeed.com/jobs?q=${formattedQuery}`;
    
    if (location) {
      url += `&l=${location.toLowerCase().replace(/\s+/g, '+')}`;
    }
    
    if (experience) {
      // Map experience to Indeed's format if applicable
      // Indeed doesn't have a direct experience filter in the URL, but we can add keywords
      if (experience.includes('fresher') || experience.includes('0-1')) {
        url += '&sc=0kf%3Aattr(FSME%2CEXREC)%3B';  // Entry level filter
      }
    }
    
    console.log(`Scraping Indeed: ${url}`);
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const jobs: JobListing[] = [];
    
    // Extract job listings from Indeed
    $('.job_seen_beacon').each((_, element) => {
      const title = $(element).find('.jobTitle span').text().trim() || 
                    $(element).find('[data-testid="jobTitle"]').text().trim();
      const company = $(element).find('.companyName').text().trim() || 
                      $(element).find('[data-testid="company-name"]').text().trim();
      const locationText = $(element).find('.companyLocation').text().trim();
      
      // Try to extract salary if available
      const salary = $(element).find('.salary-snippet-container').text().trim() || 
                     $(element).find('[data-testid="attribute_snippet_testid"]').text().trim() || 
                     'Not specified';
      
      // Get the job link and ensure it's a complete URL
      let jobId = $(element).attr('data-jk') || $(element).attr('id')?.replace('job_', '') || '';
      // Construct the job URL
      const link = jobId ? `https://www.indeed.com/viewjob?jk=${jobId}` : '';
      
      // Only add jobs that have valid data and match location if specified
      if (title && company && link && (!location || locationText.toLowerCase().includes(location.toLowerCase()))) {
        jobs.push({
          title,
          company,
          location: locationText,
          salary,
          link,
          source: 'Indeed'
        });
      }
    });
    
    return jobs;
  } catch (error) {
    console.error('Error scraping Indeed:', error);
    return [];
  }
}

async function enhanceJobsWithGemini(jobs: JobListing[], query: string, experience?: string, useAI: boolean = true): Promise<JobListing[]> {
  try {
    // Check if we have any jobs and AI is enabled
    if (jobs.length === 0 || !useAI) {
      // If we have jobs but AI is disabled, just return the jobs with basic enhancement
      if (jobs.length > 0 && !useAI) {
        return jobs.map(job => ({
          ...job,
          match_score: 75, // Default match score
          recommendations: "Consider applying if this matches your skills and interests.",
          difficulty: "Medium" // Default difficulty
        }));
      }
      return getFallbackJobs(query, experience);
    }
    
    const model = genAI.getGenerativeModel({ model: geminiConfig.modelName });
    
    // Process jobs in batches to avoid overwhelming Gemini API
    const batches: JobListing[][] = [];
    for (let i = 0; i < jobs.length; i += 5) {
      batches.push(jobs.slice(i, i + 5));
    }
    
    const enhancedJobs = await Promise.all(batches.map(async (batch) => {
      // Create a prompt for Gemini to enhance and analyze the job listings
      const jobsData = JSON.stringify(batch);
      
      const prompt = `
      I have scraped these job listings for "${query}" ${experience ? `with ${experience} experience` : ''}:
      
      ${jobsData}
      
      Please enhance these job listings by:
      1. Identifying keywords in job titles
      2. Adding a "match_score" field (0-100) showing how well each job matches the query "${query}"
      3. Adding a "recommendations" field with 1-2 sentences of advice for each job
      4. Adding a "difficulty" field (Easy, Medium, Hard) based on job requirements
      5. Sort jobs from best match to worst match
      
      Return ONLY a valid JSON array with the enhanced job listings. DO NOT include markdown formatting, code blocks, or any explanation text. Just return the raw JSON array.
      `;
      
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      try {
        // Clean the response text in case it contains markdown code blocks
        let cleanedText = text;
        
        // Remove markdown code blocks if present
        if (text.includes('```')) {
          // Extract content between code blocks
          const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (codeBlockMatch && codeBlockMatch[1]) {
            cleanedText = codeBlockMatch[1].trim();
          } else {
            // If regex didn't work, brute force removal
            cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
          }
        }
        
        console.log('Attempting to parse:', cleanedText.substring(0, 100) + '...');
        
        // Try to parse the JSON response
        const enhancedBatch = JSON.parse(cleanedText) as JobListing[];
        
        // Validate that it's an array
        if (!Array.isArray(enhancedBatch)) {
          throw new Error('Response is not an array');
        }
        
        return enhancedBatch;
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
        console.log('Response was:', text.substring(0, 200) + '...');
        // If parsing fails, return original jobs
        return batch;
      }
    }));
    
    // Flatten the batches back into a single array
    return enhancedJobs.flat();
  } catch (error) {
    console.error('Error enhancing jobs with Gemini:', error);
    return jobs;
  }
}

// Fallback jobs in case API scraping fails due to CORS or anti-scraping measures
function getFallbackJobs(query: string, experience?: string): JobListing[] {
  const fallbackJobs: JobListing[] = [
    {
      title: `${query} - Software Engineer`,
      company: 'TechCorp',
      location: 'Bangalore, India',
      salary: '₹10-15 LPA',
      link: 'https://www.naukri.com/software-engineer-jobs',
      source: 'Naukri',
      match_score: 95,
      recommendations: 'This role aligns well with your skills. Highlight your experience with cloud technologies.',
      difficulty: 'Medium',
      keywords: ['Java', 'Cloud', 'API']
    },
    {
      title: `Senior ${query}`,
      company: 'InnovateX',
      location: 'Remote',
      salary: '₹18-25 LPA',
      link: 'https://www.linkedin.com/jobs/search/?keywords=senior',
      source: 'LinkedIn',
      match_score: 88,
      recommendations: 'Excellent opportunity for growth. Emphasize your leadership skills in your application.',
      difficulty: 'Hard',
      keywords: ['Leadership', 'Architecture', 'Team Management']
    },
    {
      title: `${query} Intern`,
      company: 'StartupHub',
      location: 'Delhi, India',
      salary: '₹25-30K per month',
      link: 'https://internshala.com/internships/internship-in-delhi',
      source: 'Internshala',
      match_score: 75,
      recommendations: 'Great for beginners. Focus on your academic projects in your application.',
      difficulty: 'Easy',
      keywords: ['Internship', 'Learning', 'Growth']
    },
    {
      title: `Junior ${query}`,
      company: 'GrowthLabs',
      location: 'Hyderabad, India',
      salary: '₹6-8 LPA',
      link: 'https://unstop.com/jobs',
      source: 'Unstop',
      match_score: 85,
      recommendations: 'Solid opportunity for early career professionals. Highlight your problem-solving skills.',
      difficulty: 'Medium',
      keywords: ['Entry-level', 'Problem Solving']
    },
    {
      title: `${query} Developer`,
      company: 'GlobalTech',
      location: 'Mumbai, India',
      salary: '₹12-18 LPA',
      link: 'https://www.indeed.com/jobs?q=developer',
      source: 'Indeed',
      match_score: 90,
      recommendations: 'Strong technical opportunity with growth potential. Emphasize your coding skills and project experience.',
      difficulty: 'Medium',
      keywords: ['Developer', 'Coding', 'Technical']
    }
  ];
  
  // Adjust based on experience level
  if (experience?.includes('fresher') || experience?.includes('0-1')) {
    return fallbackJobs.filter(job => job.title.toLowerCase().includes('intern') || 
                                      job.title.toLowerCase().includes('junior') ||
                                      job.difficulty === 'Easy');
  } else if (experience?.includes('5+')) {
    return fallbackJobs.filter(job => job.title.toLowerCase().includes('senior') || 
                                      job.difficulty === 'Hard');
  }
  
  return fallbackJobs;
} 