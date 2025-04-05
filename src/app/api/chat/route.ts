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
      // Generate a professional resume with the provided data with a fun, magical tone
      const resumePrompt = `Create a professional resume in Markdown format using the following information:
Name: ${resumeData.name}
Email: ${resumeData.email}
Phone: ${resumeData.phone}
LinkedIn: ${resumeData.linkedin}
Education: ${resumeData.education}
Experience: ${resumeData.experience}
Skills: ${resumeData.skills}
Projects: ${resumeData.projects}
Certifications: ${resumeData.certifications}

Please organize the resume with the following sections:
1. Summary - Write a compelling professional summary based on their experience and skills
2. Education - Format their education details properly
3. Work Experience - Format their work experience with bullet points highlighting achievements
4. Skills - List their skills organized by category
5. Projects - Format their projects with descriptions
6. Certifications - List their certifications

IMPORTANT STYLE INSTRUCTIONS:
- The resume should be professional but with engaging language
- Use vivid action verbs and descriptive phrasing to bring their experience to life
- Make achievements stand out with specific metrics where possible
- Keep the overall tone professional but energetic and confident
- Format everything clearly with proper markdown (headings, bullet points, etc.)

Return ONLY the markdown-formatted resume content that can be directly converted to PDF.`;

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