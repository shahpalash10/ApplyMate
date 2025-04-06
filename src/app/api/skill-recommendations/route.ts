import { NextRequest, NextResponse } from 'next/server';

// Sample skill database
// In a real application, this would come from a database
const skillsDatabase = [
  {
    id: "react",
    name: "React",
    category: "Frontend Development",
    description: "A JavaScript library for building user interfaces, particularly single-page applications.",
    demand: 9,
    difficulty: 6,
    timeToLearn: "2-4 months",
    keywords: ["javascript", "frontend", "ui", "web development", "jsx", "component", "hooks"],
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
      }
    ]
  },
  {
    id: "node-js",
    name: "Node.js",
    category: "Backend Development",
    description: "A JavaScript runtime built on Chrome's V8 engine for building server-side applications.",
    demand: 8,
    difficulty: 5,
    timeToLearn: "1-3 months",
    keywords: ["javascript", "backend", "server", "express", "npm", "api"],
    resources: [
      {
        title: "Node.js Official Documentation",
        url: "https://nodejs.org/en/docs/",
        type: "free",
        description: "The official Node.js documentation with guides and API references."
      },
      {
        title: "Node.js: The Complete Guide",
        url: "https://www.udemy.com/course/nodejs-the-complete-guide/",
        type: "paid",
        description: "A comprehensive guide to Node.js development including REST APIs and GraphQL."
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
    keywords: ["programming", "scripting", "data science", "automation", "backend", "machine learning"],
    resources: [
      {
        title: "Python Official Documentation",
        url: "https://docs.python.org/3/",
        type: "free",
        description: "The official Python documentation with tutorials and library references."
      },
      {
        title: "Python Crash Course",
        url: "https://nostarch.com/pythoncrashcourse2e",
        type: "paid",
        description: "A hands-on, project-based introduction to Python programming."
      }
    ]
  },
  {
    id: "aws",
    name: "AWS",
    category: "Cloud Computing",
    description: "Amazon Web Services, a comprehensive cloud platform offering computing power, storage, and other services.",
    demand: 9,
    difficulty: 7,
    timeToLearn: "3-6 months",
    keywords: ["cloud", "devops", "infrastructure", "serverless", "lambda", "s3", "ec2"],
    resources: [
      {
        title: "AWS Documentation",
        url: "https://docs.aws.amazon.com/",
        type: "free",
        description: "Comprehensive documentation for all AWS services."
      },
      {
        title: "AWS Certified Solutions Architect",
        url: "https://aws.amazon.com/certification/certified-solutions-architect-associate/",
        type: "paid",
        description: "Preparation for the AWS Solutions Architect certification."
      }
    ]
  },
  {
    id: "machine-learning",
    name: "Machine Learning",
    category: "Data Science",
    description: "The study of computer algorithms that improve automatically through experience and data use.",
    demand: 9,
    difficulty: 8,
    timeToLearn: "6-12 months",
    keywords: ["ai", "data science", "neural networks", "deep learning", "tensorflow", "pytorch", "algorithms"],
    resources: [
      {
        title: "Machine Learning Crash Course",
        url: "https://developers.google.com/machine-learning/crash-course",
        type: "free",
        description: "Google's fast-paced, practical introduction to machine learning."
      },
      {
        title: "Deep Learning Specialization",
        url: "https://www.coursera.org/specializations/deep-learning",
        type: "paid",
        description: "A comprehensive course on deep learning fundamentals by Andrew Ng."
      }
    ]
  },
  {
    id: "devops",
    name: "DevOps",
    category: "DevOps & Cloud",
    description: "A set of practices that combines software development and IT operations to shorten the development lifecycle.",
    demand: 8,
    difficulty: 7,
    timeToLearn: "3-6 months",
    keywords: ["ci/cd", "docker", "kubernetes", "automation", "infrastructure", "pipeline", "deployment"],
    resources: [
      {
        title: "The DevOps Handbook",
        url: "https://itrevolution.com/the-devops-handbook/",
        type: "paid",
        description: "A guide to implementing DevOps principles in any organization."
      },
      {
        title: "Docker and Kubernetes: The Complete Guide",
        url: "https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
        type: "paid",
        description: "A comprehensive course on containerization and orchestration."
      }
    ]
  }
];

// Process raw text from OCR to extract additional information
function analyzeResumeText(rawText: string = ''): {
  additionalSkills: string[],
  jobTitles: string[],
  domains: string[]
} {
  const lowerText = rawText.toLowerCase();
  const result = {
    additionalSkills: [] as string[],
    jobTitles: [] as string[],
    domains: [] as string[]
  };
  
  // Extract potential additional skills
  const techTerms = [
    "javascript", "react", "angular", "vue", "node", "python", "java", "c#", "ruby",
    "php", "go", "rust", "swift", "kotlin", "typescript", "html", "css", "sass",
    "less", "tailwind", "bootstrap", "material-ui", "redux", "graphql", "rest",
    "docker", "kubernetes", "aws", "azure", "gcp", "firebase", "mongodb", "sql",
    "postgresql", "mysql", "oracle", "data science", "machine learning", "ai",
    "artificial intelligence", "nlp", "computer vision", "devops", "ci/cd",
    "git", "agile", "scrum", "kanban", "frontend", "backend", "fullstack",
    "mobile", "android", "ios", "react native", "flutter", "blockchain",
    "security", "cloud", "networking", "linux", "unix", "bash", "powershell"
  ];
  
  for (const term of techTerms) {
    if (lowerText.includes(term) && !result.additionalSkills.includes(term)) {
      result.additionalSkills.push(term);
    }
  }
  
  // Extract potential job titles
  const jobTitlePatterns = [
    /software engineer/i, /developer/i, /programmer/i, /architect/i,
    /data scientist/i, /data analyst/i, /product manager/i, /project manager/i,
    /designer/i, /ux/i, /ui/i, /devops/i, /sre/i, /reliability/i,
    /qa/i, /quality assurance/i, /tester/i, /full[\s-]*stack/i,
    /front[\s-]*end/i, /back[\s-]*end/i, /mobile/i, /web/i,
    /cloud/i, /security/i, /network/i, /system/i, /admin/i,
    /lead/i, /senior/i, /junior/i, /principal/i, /staff/i, /director/i
  ];
  
  for (const pattern of jobTitlePatterns) {
    const matches = lowerText.match(pattern);
    if (matches && matches.length > 0) {
      const title = matches[0].trim();
      if (!result.jobTitles.includes(title)) {
        result.jobTitles.push(title);
      }
    }
  }
  
  // Extract potential domains/industries
  const domainPatterns = [
    /financ(e|ial)/i, /health(care)?/i, /medical/i, /education/i, /retail/i,
    /e[\s-]*commerce/i, /insurance/i, /bank(ing)?/i, /manufacturing/i,
    /automotive/i, /telecom/i, /media/i, /entertainment/i, /gaming/i,
    /travel/i, /hospitality/i, /real estate/i, /energy/i, /oil/i, /gas/i,
    /utilities/i, /government/i, /public sector/i, /defense/i,
    /consulting/i, /marketing/i, /advertising/i, /non[\s-]*profit/i,
    /sports/i, /technology/i, /startup/i, /aerospace/i, /aviation/i
  ];
  
  for (const pattern of domainPatterns) {
    const matches = lowerText.match(pattern);
    if (matches && matches.length > 0) {
      const domain = matches[0].trim();
      if (!result.domains.includes(domain)) {
        result.domains.push(domain);
      }
    }
  }
  
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skills = [], interests = [], experience = [], rawText = '' } = body;
    
    // Allow empty skills/interests for better user experience
    // This means even with no resume data, we can still provide recommendations
    
    // Process raw text if provided to extract additional context
    const textAnalysis = analyzeResumeText(rawText);
    
    // Combine explicitly listed skills with skills detected in the text
    const allSkills = [...new Set([...skills, ...textAnalysis.additionalSkills])];
    
    // Create a scoring system for skills
    const scoredSkills = skillsDatabase.map(skill => {
      let score = 0;
      
      // Check if user already has this skill
      const hasSkill = allSkills.some(userSkill => 
        userSkill.toLowerCase().includes(skill.name.toLowerCase()) || 
        skill.name.toLowerCase().includes(userSkill.toLowerCase())
      );
      
      // If user already has the skill, give it a lower priority
      if (hasSkill) {
        score -= 5;
      }
      
      // Check for keyword matches with user interests
      interests.forEach(interest => {
        if (skill.keywords && skill.keywords.some(keyword => 
          keyword.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(keyword.toLowerCase())
        )) {
          score += 3;
        }
        
        // Direct match with skill name or category
        if (skill.name.toLowerCase().includes(interest.toLowerCase()) ||
            skill.category.toLowerCase().includes(interest.toLowerCase())) {
          score += 5;
        }
      });
      
      // Check for related career experience
      experience.forEach(exp => {
        if (skill.keywords && skill.keywords.some(keyword => 
          exp.toLowerCase().includes(keyword.toLowerCase())
        )) {
          score += 2;
        }
      });
      
      // Check for job title relevance from text analysis
      textAnalysis.jobTitles.forEach(title => {
        if (skill.keywords && skill.keywords.some(keyword =>
          title.includes(keyword) || keyword.includes(title)
        )) {
          score += 3;
        }
      });
      
      // Check for domain/industry relevance from text analysis
      textAnalysis.domains.forEach(domain => {
        // Domain-specific skill boosts
        if (domain.includes('finance') && ['python', 'sql', 'data analysis'].some(k => 
          skill.name.toLowerCase().includes(k) || (skill.keywords || []).includes(k)
        )) {
          score += 4;
        } else if ((domain.includes('health') || domain.includes('medical')) && 
          ['python', 'data science', 'machine learning'].some(k => 
            skill.name.toLowerCase().includes(k) || (skill.keywords || []).includes(k)
          )) {
          score += 4;
        } else if (domain.includes('ecommerce') && 
          ['react', 'node.js', 'javascript'].some(k => 
            skill.name.toLowerCase().includes(k) || (skill.keywords || []).includes(k)
          )) {
          score += 4;
        }
      });
      
      // Check if skill was detected in resume text but not explicitly listed
      if (!hasSkill && skill.keywords && skill.keywords.some(keyword => 
        textAnalysis.additionalSkills.some(detectedSkill => 
          detectedSkill.includes(keyword) || keyword.includes(detectedSkill)
        )
      )) {
        score += 5; // Boost score for skills related to what's in the resume
      }
      
      // Add market demand factor
      score += skill.demand * 0.5;
      
      return {
        ...skill,
        matchScore: score
      };
    });
    
    // Sort by match score and return top 6
    const recommendedSkills = scoredSkills
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 6);
    
    return NextResponse.json({ 
      success: true,
      recommendations: recommendedSkills,
      analysis: {
        detectedSkills: textAnalysis.additionalSkills,
        jobTitles: textAnalysis.jobTitles,
        domains: textAnalysis.domains
      }
    });
    
  } catch (error) {
    console.error('Error generating skill recommendations:', error);
    // Return 200 with default recommendations instead of 500 error
    const defaultRecommendations = [
      skillsDatabase[0], // React
      skillsDatabase[1], // Node.js (assuming it's the second skill)
      skillsDatabase[2], // Python (assuming it's the third skill)
    ];
    
    return NextResponse.json({ 
      success: true,
      recommendations: defaultRecommendations,
      note: "Using default recommendations due to processing error"
    }, { status: 200 });
  }
} 