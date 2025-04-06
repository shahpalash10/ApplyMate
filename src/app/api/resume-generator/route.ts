import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function POST(request: NextRequest) {
  try {
    // Get the request body
    const body = await request.json();
    const { resumeData } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Missing resume data in request' },
        { status: 400 }
      );
    }

    // Build a structured resume based on the data
    const formattedResume = await generateFormattedResume(resumeData);

    return NextResponse.json({ response: formattedResume });
  } catch (error: any) {
    console.error('Error in resume generator API:', error);
    return NextResponse.json(
      { error: 'Error generating resume', details: error.message },
      { status: 500 }
    );
  }
}

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  education: string[];
  experience: string[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  projects: string[];
  certifications: string[];
  currentField: string;
  collectedFields: string[];
  interviewStage: number;
  isJobTechnical: boolean;
}

async function generateFormattedResume(resumeData: ResumeData): Promise<string> {
  try {
    // Create a prompt for the AI model
    const prompt = `
    Create a professional, ATS-friendly resume in HTML format based on the following information:
    
    Name: ${resumeData.name}
    Email: ${resumeData.email}
    Phone: ${resumeData.phone}
    ${resumeData.linkedin && resumeData.linkedin !== 'N/A' ? `LinkedIn: ${resumeData.linkedin}` : ''}
    ${resumeData.github && resumeData.github !== 'N/A' ? `GitHub: ${resumeData.github}` : ''}
    
    Education:
    ${resumeData.education.map(edu => `- ${edu}`).join('\n')}
    
    Experience:
    ${resumeData.experience.map(exp => `- ${exp}`).join('\n')}
    
    Technical Skills:
    ${resumeData.skills.technical.filter(skill => skill !== 'N/A').join(', ')}
    
    Soft Skills:
    ${resumeData.skills.soft.filter(skill => skill !== 'N/A').join(', ')}
    
    Languages:
    ${resumeData.skills.languages.filter(lang => lang !== 'N/A').join(', ')}
    
    ${resumeData.projects.length > 0 && resumeData.projects[0] !== 'N/A' ? `Projects:\n${resumeData.projects.map(proj => `- ${proj}`).join('\n')}` : ''}
    
    ${resumeData.certifications.length > 0 && resumeData.certifications[0] !== 'N/A' ? `Certifications:\n${resumeData.certifications.map(cert => `- ${cert}`).join('\n')}` : ''}
    
    Please format this resume in a clean, professional HTML layout with the following features:
    - Use a clean, modern design with appropriate spacing
    - Structure experience and education with bullet points
    - Organize skills in a scannable format
    - Include a professional summary at the top
    - Optimize for ATS (Applicant Tracking Systems)
    - Include a professional header with contact information
    - Make sure all formatting is done with inline CSS for portability
    - Use a color scheme that is professional and clean
    
    Return only the HTML code without any explanation.
    `;

    // Get response from Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract HTML if wrapped in code blocks
    let formattedHTML = text;
    const htmlMatch = text.match(/```html\s*([\s\S]*?)\s*```/);
    if (htmlMatch && htmlMatch[1]) {
      formattedHTML = htmlMatch[1].trim();
    }

    // Add inline styles for better print formatting
    formattedHTML = `
      <style>
        @media print {
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          a {
            color: #2563eb;
            text-decoration: none;
          }
          h1, h2, h3, h4 {
            margin-top: 0;
          }
          .resume-container {
            max-width: 100%;
            padding: 0.5in;
          }
        }
      </style>
      ${formattedHTML}
    `;

    return formattedHTML;
  } catch (error) {
    console.error('Error generating resume with AI:', error);
    // Return a basic formatted resume as fallback
    return generateBasicResume(resumeData);
  }
}

function generateBasicResume(resumeData: ResumeData): string {
  // Simple HTML template for fallback
  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="margin-bottom: 5px; color: #2563eb;">${resumeData.name}</h1>
        <p>
          ${resumeData.email} | ${resumeData.phone}
          ${resumeData.linkedin && resumeData.linkedin !== 'N/A' ? ` | <a href="${resumeData.linkedin}" style="color: #2563eb;">${resumeData.linkedin}</a>` : ''}
          ${resumeData.github && resumeData.github !== 'N/A' ? ` | <a href="${resumeData.github}" style="color: #2563eb;">${resumeData.github}</a>` : ''}
        </p>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="border-bottom: 2px solid #2563eb; padding-bottom: 5px; color: #2563eb;">Professional Summary</h2>
        <p>Dedicated professional with experience in ${resumeData.isJobTechnical ? 'technical fields' : 'various industries'}, seeking to leverage skills and knowledge to contribute to organizational success.</p>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="border-bottom: 2px solid #2563eb; padding-bottom: 5px; color: #2563eb;">Education</h2>
        <ul style="list-style-type: none; padding-left: 0;">
          ${resumeData.education.map(edu => `<li style="margin-bottom: 10px;"><strong>${edu}</strong></li>`).join('')}
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="border-bottom: 2px solid #2563eb; padding-bottom: 5px; color: #2563eb;">Experience</h2>
        <ul style="list-style-type: none; padding-left: 0;">
          ${resumeData.experience.map(exp => `<li style="margin-bottom: 10px;"><strong>${exp}</strong></li>`).join('')}
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h2 style="border-bottom: 2px solid #2563eb; padding-bottom: 5px; color: #2563eb;">Skills</h2>
        
        <h3 style="margin-top: 15px; color: #333;">Technical Skills</h3>
        <p>${resumeData.skills.technical.filter(skill => skill !== 'N/A').join(', ') || 'N/A'}</p>
        
        <h3 style="margin-top: 15px; color: #333;">Soft Skills</h3>
        <p>${resumeData.skills.soft.filter(skill => skill !== 'N/A').join(', ') || 'N/A'}</p>
        
        <h3 style="margin-top: 15px; color: #333;">Languages</h3>
        <p>${resumeData.skills.languages.filter(lang => lang !== 'N/A').join(', ') || 'N/A'}</p>
      </div>

      ${resumeData.projects.length > 0 && resumeData.projects[0] !== 'N/A' ? `
        <div style="margin-bottom: 20px;">
          <h2 style="border-bottom: 2px solid #2563eb; padding-bottom: 5px; color: #2563eb;">Projects</h2>
          <ul style="list-style-type: none; padding-left: 0;">
            ${resumeData.projects.map(proj => `<li style="margin-bottom: 10px;"><strong>${proj}</strong></li>`).join('')}
          </ul>
        </div>
      ` : ''}

      ${resumeData.certifications.length > 0 && resumeData.certifications[0] !== 'N/A' ? `
        <div style="margin-bottom: 20px;">
          <h2 style="border-bottom: 2px solid #2563eb; padding-bottom: 5px; color: #2563eb;">Certifications</h2>
          <ul style="list-style-type: none; padding-left: 0;">
            ${resumeData.certifications.map(cert => `<li style="margin-bottom: 10px;"><strong>${cert}</strong></li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  `;
} 