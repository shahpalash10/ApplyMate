import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { message, isResumeRequest, resumeData } = await request.json();
    
    if (!message && !isResumeRequest) {
      return NextResponse.json(
        { error: 'Message or resume data is required' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    let result;
    
    if (isResumeRequest && resumeData) {
      // Generate a professional resume with the provided data
      const resumePrompt = `Create a professional ATS-friendly resume using the following information:
Name: ${resumeData.name}
Email: ${resumeData.email}
Phone: ${resumeData.phone}
LinkedIn: ${resumeData.linkedin}
Education: ${resumeData.education}
Experience: ${resumeData.experience}
Skills: ${resumeData.skills}
Projects: ${resumeData.projects}
Certifications: ${resumeData.certifications}

First, organize this information into a structured JSON format using this schema:
{
  "name": "",
  "contact": {
    "email": "",
    "phone": "",
    "location": "Extract location from education or experience if available",
    "linkedin": ""
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
  "projects": [
    {
      "title": "",
      "description": "",
      "tech": []
    }
  ],
  "skills": [],
  "certifications": []
}

After creating the JSON, convert it into a Markdown-formatted resume using this layout:

# {name}

**Email**: {contact.email} | **Phone**: {contact.phone} | **Location**: {contact.location} | **LinkedIn**: {contact.linkedin}

## Professional Summary
{objective}

## Education
For each education item:
**{institution}** — {degree}  
*{start} - {end}*, Grade: {grade}

## Projects
For each project:
**{title}**  
{description}  
_Technologies: {tech joined by commas}_

## Skills
Create a clean, organized list of skills grouped by category when possible.

## Certifications
List the certifications in a clean format.

IMPORTANT ATS-FRIENDLY FORMATTING INSTRUCTIONS:
- Use proper spacing between sections (at least one blank line)
- Use standard section headers (##) for each main section
- Use bold formatting for job titles, institutions, and project names
- Focus on relevant keywords from the candidate's industry
- Ensure all information is clearly formatted and easy to scan
- Keep the layout simple with a single-column format
- Make sure the contact information at the top has proper spacing
- Use bullet points for lists where appropriate
- Do NOT include any non-standard characters that could confuse ATS parsers

Return ONLY the markdown-formatted resume content that can be directly converted to PDF. Do not include the JSON in your response.`;

      result = await model.generateContent(resumePrompt);
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

You're collecting: name, email, phone, LinkedIn (optional), education, experience, skills, projects (optional), certifications (optional).

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

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
} 