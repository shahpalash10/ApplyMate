import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getGeminiApiKey, isGeminiConfigured, geminiConfig } from '@/utils/apiConfig';

const apiKey = getGeminiApiKey();
const genAI = new GoogleGenerativeAI(apiKey);

export async function POST(request: Request) {
  try {
    const { message, isResumeRequest, resumeData, useLatexTemplate } = await request.json();
    
    if (!message && !isResumeRequest) {
      return NextResponse.json(
        { error: 'Message or resume data is required' },
        { status: 400 }
      );
    }
    
    // Check if API key is available before making requests
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { 
          error: 'API key not configured', 
          response: "I'm sorry, the AI service is not properly configured. Please check your environment variables and set GOOGLE_GEMINI_API_KEY."
        },
        { status: 503 }
      );
    }

    const model = genAI.getGenerativeModel({ model: geminiConfig.modelName });
    
    let result;
    
    if (isResumeRequest && resumeData) {
      // Format the education, experience, skills, and other multi-entry fields for the prompt
      let educationText = '';
      if (resumeData.education && resumeData.education.length > 0) {
        resumeData.education.forEach((edu, index) => {
          educationText += `Education ${index+1}: ${edu}\n`;
        });
      }
      
      let experienceText = '';
      if (resumeData.experience && resumeData.experience.length > 0) {
        resumeData.experience.forEach((exp, index) => {
          experienceText += `Experience ${index+1}: ${exp}\n`;
        });
      }
      
      let skillsText = '';
      if (resumeData.skills) {
        if (resumeData.skills.technical && resumeData.skills.technical.length > 0) {
          skillsText += `Technical Skills: ${resumeData.skills.technical.join(', ')}\n`;
        }
        if (resumeData.skills.soft && resumeData.skills.soft.length > 0) {
          skillsText += `Soft Skills: ${resumeData.skills.soft.join(', ')}\n`;
        }
        if (resumeData.skills.languages && resumeData.skills.languages.length > 0) {
          skillsText += `Languages: ${resumeData.skills.languages.join(', ')}\n`;
        }
      }
      
      let projectsText = '';
      if (resumeData.projects && resumeData.projects.length > 0) {
        resumeData.projects.forEach((proj, index) => {
          projectsText += `Project ${index+1}: ${proj}\n`;
        });
      }
      
      let certificationsText = '';
      if (resumeData.certifications && resumeData.certifications.length > 0) {
        resumeData.certifications.forEach((cert, index) => {
          certificationsText += `Certification ${index+1}: ${cert}\n`;
        });
      }
      
      let template = '';
      
      // Use LaTeX template if requested
      if (useLatexTemplate) {
        template = generateLatexTemplate(resumeData.name);
        
        // Generate a professional resume using LaTeX
        const latexResumePrompt = `Create a professional ATS-friendly resume using the following information, by completing the LaTeX template I'll provide below:

Personal Information:
Name: ${resumeData.name}
Email: ${resumeData.email}
Phone: ${resumeData.phone}
LinkedIn: ${resumeData.linkedin}
${resumeData.github ? `GitHub: ${resumeData.github}` : ''}

Education:
${educationText}

Experience:
${experienceText}

Skills:
${skillsText}

${projectsText ? `Projects:\n${projectsText}\n` : ''}
${certificationsText ? `Certifications:\n${certificationsText}\n` : ''}

IMPORTANT INSTRUCTIONS:
1. You are filling in a LaTeX template, so use proper LaTeX formatting
2. Transform user's casual language into professional resume phrases with strong action verbs
3. Focus on concrete achievements and quantifiable results
4. Use bullet points for lists with proper LaTeX formatting (\\item)
5. Make descriptions concise and impactful
6. ONLY fill in the placeholders marked with comments (e.g. % REPLACE THIS)
7. Keep all existing LaTeX commands and structure
8. DO NOT duplicate section headings

Here's the template:

${template}

Return ONLY the completed LaTeX code with the placeholders filled. Ensure that the output is valid LaTeX that can be compiled.`;

        result = await model.generateContent(latexResumePrompt);
      } else {
        // Generate a professional resume with the provided data using Markdown (fallback)
        const resumePrompt = `Create a professional ATS-friendly resume using the following information:

Personal Information:
Name: ${resumeData.name}
Email: ${resumeData.email}
Phone: ${resumeData.phone}
LinkedIn: ${resumeData.linkedin}
${resumeData.github ? `GitHub: ${resumeData.github}` : ''}

Education:
${educationText}

Experience:
${experienceText}

Skills:
${skillsText}

${projectsText ? `Projects:\n${projectsText}\n` : ''}
${certificationsText ? `Certifications:\n${certificationsText}\n` : ''}

First, organize this information into a structured JSON format using this schema:
{
  "name": "",
  "contact": {
    "email": "",
    "phone": "",
    "location": "Extract location from education or experience if available",
    "linkedin": "",
    "github": ""
  },
  "objective": "Generate a professional objective based on their skills and experience (2-3 lines)",
  "education": [
    {
      "institution": "",
      "degree": "",
      "start": "",
      "end": "",
      "grade": ""
    }
  ],
  "experience": [
    {
      "company": "",
      "position": "",
      "start": "",
      "end": "",
      "responsibilities": ["", "", ""]
    }
  ],
  "projects": [
    {
      "title": "",
      "description": "",
      "tech": []
    }
  ],
  "skills": {
    "technical": [],
    "soft": [],
    "languages": []
  },
  "certifications": []
}

After creating the JSON, convert it into a Markdown-formatted resume using this layout:

# {name}

**Email**: {contact.email} | **Phone**: {contact.phone} | **LinkedIn**: {contact.linkedin} ${resumeData.github ? '| **GitHub**: {contact.github}' : ''}

## Professional Summary
{objective}

## Education
For each education item:
**{institution}** — {degree}  
*{start} - {end}*, Grade: {grade}

## Experience
For each experience item:
**{company}** — {position}  
*{start} - {end}*  
- {responsibilities[0]}
- {responsibilities[1]}
- {responsibilities[2]}

## Skills
Technical: {skills.technical joined by commas}
Soft Skills: {skills.soft joined by commas}
Languages: {skills.languages joined by commas}

## Projects
For each project:
**{title}**  
{description}  
_Technologies: {tech joined by commas}_

## Certifications
List the certifications in a clean format.

IMPORTANT ATS-FRIENDLY FORMATTING INSTRUCTIONS:
1. Transform the user's casual language into professional resume language with action verbs
2. Highlight measurable achievements and results whenever possible
3. Use proper spacing between sections (at least one blank line)
4. Use standard section headers (##) for each main section
5. Use bold formatting for job titles, institutions, and project names
6. Focus on relevant keywords from the candidate's industry
7. Ensure all information is clearly formatted and easy to scan
8. Keep the layout simple with a single-column format
9. Make sure the contact information at the top has proper spacing
10. Use bullet points for lists where appropriate
11. Do NOT include any non-standard characters that could confuse ATS parsers

Return ONLY the markdown-formatted resume content that can be directly converted to PDF. Do not include the JSON in your response.`;

        result = await model.generateContent(resumePrompt);
      }
    } else {
      // For conversational interactions, maintain the fun wizard persona but be concise
      const chatPrompt = `${message}

IMPORTANT: You are the "Resume Wizard" 🧙‍♂️, a magical AI assistant that helps create resumes.

CRUCIAL GUIDELINES:
1. Be EXTREMELY CONCISE - keep responses under 2-3 sentences maximum
2. Use a friendly, casual tone with 1-2 emojis per message
3. Focus on one question or topic at a time
4. Directly acknowledge what the user shared
5. Ask only the most logical next question
6. No lengthy explanations, introductions, or multi-part questions
7. Always remind users they can type 'none' to skip any field
8. Tell users they can type 'generate' at any time to create their resume

You're collecting information in a structured manner following these stages:
1. Determine if it's a technical job
2. Personal info (name, email, phone, LinkedIn, GitHub for tech jobs)
3. Education (multiple entries possible)
4. Experience (multiple entries possible)
5. Skills (categorized into technical, soft, and languages)
6. Projects (optional, multiple entries possible)
7. Certifications (optional, multiple entries possible)

If they share information, acknowledge it briefly and move to the next logical question. Respond to off-topic questions but quickly refocus.

RESPONSE FORMAT:
- Brief acknowledgment (if needed)
- One clear question or statement
- Use 1-2 emojis max

Your goal is a fun but EFFICIENT conversation that gets information for their resume without being wordy.`;

      result = await model.generateContent(chatPrompt);
    }
    
    const response = await result.response;
    const text = response.text();

    // If it's a LaTeX template, convert it to HTML for preview
    if (isResumeRequest && useLatexTemplate) {
      const htmlPreview = convertLatexToHtml(text);
      return NextResponse.json({ response: htmlPreview });
    }

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

// Generate a LaTeX template with placeholders for the resume information
function generateLatexTemplate(name: string): string {
  return `\\documentclass[11pt,a4paper,sans]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{blue}
\\usepackage[scale=0.9]{geometry}
\\usepackage{hyperref}

% Personal Information
\\name{${name || 'PLACEHOLDER NAME'}}{}
\\phone[mobile]{} % REPLACE THIS WITH PHONE
\\email{} % REPLACE THIS WITH EMAIL
\\social[linkedin]{} % REPLACE THIS WITH LINKEDIN
\\social[github]{} % REPLACE THIS WITH GITHUB

\\begin{document}
\\makecvtitle

% Professional Summary
\\section{Professional Summary}
% REPLACE THIS WITH PROFESSIONAL SUMMARY

% Education Section
\\section{Education}
% REPLACE THIS WITH EDUCATION ENTRIES

% Experience Section
\\section{Experience}
% REPLACE THIS WITH EXPERIENCE ENTRIES

% Skills Section
\\section{Skills}
\\cvitem{Technical}{} % REPLACE THIS WITH TECHNICAL SKILLS
\\cvitem{Soft Skills}{} % REPLACE THIS WITH SOFT SKILLS
\\cvitem{Languages}{} % REPLACE THIS WITH LANGUAGES

% Projects Section (if available)
\\section{Projects}
% REPLACE THIS WITH PROJECT ENTRIES

% Certifications Section (if available)
\\section{Certifications}
% REPLACE THIS WITH CERTIFICATION ENTRIES

\\end{document}`;
}

// Convert LaTeX to HTML for preview purposes
function convertLatexToHtml(latexCode: string): string {
  // Extract content between begin{document} and end{document}
  const documentMatch = latexCode.match(/\\begin\{document\}([\s\S]*?)\\end\{document\}/);
  let content = documentMatch ? documentMatch[1] : latexCode;
  
  // Remove LaTeX comments
  content = content.replace(/%.*/g, '');
  
  // Replace LaTeX commands with HTML equivalents
  content = content
    .replace(/\\section\{(.*?)\}/g, '<h2>$1</h2>')
    .replace(/\\subsection\{(.*?)\}/g, '<h3>$1</h3>')
    .replace(/\\textbf\{(.*?)\}/g, '<strong>$1</strong>')
    .replace(/\\textit\{(.*?)\}/g, '<em>$1</em>')
    .replace(/\\underline\{(.*?)\}/g, '<u>$1</u>')
    .replace(/\\href\{(.*?)\}\{(.*?)\}/g, '<a href="$1">$2</a>')
    .replace(/\\begin\{itemize\}([\s\S]*?)\\end\{itemize\}/g, (match, p1) => {
      return '<ul>' + p1.replace(/\\item\s+(.*?)(?=\\item|$)/g, '<li>$1</li>') + '</ul>';
    })
    .replace(/\\cvitem\{(.*?)\}\{(.*?)\}/g, '<p><strong>$1:</strong> $2</p>')
    .replace(/\\makecvtitle/g, '')
    .replace(/\\name\{(.*?)\}\{(.*?)\}/g, '<h1>$1 $2</h1>');
  
  // Extract and format contact information
  let contactInfo = '<div class="contact-info">';
  const phoneMatch = latexCode.match(/\\phone\[mobile\]\{(.*?)\}/);
  const emailMatch = latexCode.match(/\\email\{(.*?)\}/);
  const linkedinMatch = latexCode.match(/\\social\[linkedin\]\{(.*?)\}/);
  const githubMatch = latexCode.match(/\\social\[github\]\{(.*?)\}/);
  
  if (phoneMatch && phoneMatch[1]) contactInfo += `<span>Phone: ${phoneMatch[1]}</span> | `;
  if (emailMatch && emailMatch[1]) contactInfo += `<span>Email: ${emailMatch[1]}</span> | `;
  if (linkedinMatch && linkedinMatch[1]) contactInfo += `<span>LinkedIn: ${linkedinMatch[1]}</span> | `;
  if (githubMatch && githubMatch[1]) contactInfo += `<span>GitHub: ${githubMatch[1]}</span>`;
  
  contactInfo += '</div>';
  
  // Add basic styling
  const html = `
  <div class="resume-preview">
    ${contactInfo}
    ${content}
  </div>
  <style>
    .resume-preview {
      font-family: Arial, sans-serif;
      line-height: 1.5;
      margin: 1em;
    }
    .contact-info {
      margin-bottom: 1em;
      color: #555;
    }
    h1 {
      margin-bottom: 0.5em;
      color: #2c3e50;
    }
    h2 {
      color: #3498db;
      border-bottom: 1px solid #3498db;
      padding-bottom: 0.2em;
      margin-top: 1.5em;
    }
    h3 {
      color: #2c3e50;
    }
    ul {
      padding-left: 1.5em;
    }
    li {
      margin-bottom: 0.5em;
    }
  </style>
  `;
  
  return html;
} 