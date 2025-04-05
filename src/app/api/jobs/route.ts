import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';
import * as cheerio from 'cheerio';

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

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { query, location, experience } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Job query is required' },
        { status: 400 }
      );
    }

    // Scrape job listings from multiple sites
    const jobs = await Promise.all([
      scrapeInternshala(query, location),
      scrapeUnstop(query, location),
      scrapeNaukri(query, location, experience),
      scrapeLinkedIn(query, location, experience),
      // Add more job sites as needed
    ]);

    // Flatten the results
    const allJobs = jobs.flat();

    // Process the jobs with Gemini for better formatting and additional insights
    const enhancedJobs = await enhanceJobsWithGemini(allJobs, query, experience);

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
    $('.individual_internship').each((index: number, element: any) => {
      const title = $(element).find('.heading_4_5').text().trim();
      const company = $(element).find('.company_name').text().trim();
      const locationText = $(element).find('.location_link').text().trim();
      const salary = $(element).find('.stipend').text().trim();
      const link = 'https://internshala.com' + $(element).find('a.view_detail_button').attr('href');
      
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
    $('.opportunity-card').each((index: number, element: any) => {
      const title = $(element).find('.opportunity-title').text().trim();
      const company = $(element).find('.company-name').text().trim();
      const locationText = $(element).find('.location-text').text().trim();
      const salary = $(element).find('.stipend-text').text().trim() || 'Not specified';
      const link = 'https://unstop.com' + $(element).find('a.card-link').attr('href');
      
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
    $('.jobTuple').each((index: number, element: any) => {
      const title = $(element).find('.title').text().trim();
      const company = $(element).find('.companyInfo span.subTitle').text().trim();
      const locationText = $(element).find('.subTitle.ellipsis.fleft.location').text().trim();
      const salary = $(element).find('.salary').text().trim() || 'Not specified';
      
      // Try to find the job URL
      let link = $(element).find('a.title').attr('href') || '';
      if (!link.startsWith('http')) {
        link = 'https://www.naukri.com' + link;
      }
      
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
    $('.base-card.relative.job-search-card').each((index: number, element: any) => {
      const title = $(element).find('.base-search-card__title').text().trim();
      const company = $(element).find('.base-search-card__subtitle').text().trim();
      const locationText = $(element).find('.job-search-card__location').text().trim();
      const salary = 'Check on LinkedIn'; // LinkedIn often doesn't show salary
      
      // Get the job link
      let link = $(element).find('a.base-card__full-link').attr('href') || '';
      
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

async function enhanceJobsWithGemini(jobs: JobListing[], query: string, experience?: string): Promise<JobListing[]> {
  try {
    // Skip if no jobs found
    if (jobs.length === 0) {
      // Add fallback jobs for testing if no jobs found
      return getFallbackJobs(query, experience);
    }
    
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    // Create a prompt for Gemini to enhance and analyze the job listings
    const jobsData = JSON.stringify(jobs.slice(0, 10)); // Limit to first 10 jobs for API size
    
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
      let enhancedJobs = JSON.parse(cleanedText) as JobListing[];
      
      // Validate that it's an array
      if (!Array.isArray(enhancedJobs)) {
        throw new Error('Response is not an array');
      }
      
      return enhancedJobs;
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      console.log('Response was:', text.substring(0, 200) + '...');
      // If parsing fails, return original jobs
      return jobs;
    }
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
      link: 'https://example.com/job1',
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
      link: 'https://example.com/job2',
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
      link: 'https://example.com/job3',
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
      link: 'https://example.com/job4',
      source: 'Unstop',
      match_score: 85,
      recommendations: 'Solid opportunity for early career professionals. Highlight your problem-solving skills.',
      difficulty: 'Medium',
      keywords: ['Entry-level', 'Problem Solving']
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