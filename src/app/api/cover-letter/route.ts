import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { getGeminiApiKey, isGeminiConfigured, geminiConfig } from '@/utils/apiConfig';

// Initialize the Google Generative AI client
const apiKey = getGeminiApiKey();
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: geminiConfig.modelName });

export async function POST(request: Request) {
  try {
    // Log incoming requests to help with debugging
    console.log('Cover letter API called');
    
    // Check if API key is available
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { 
          error: 'API key not configured', 
          text: "I'm sorry, the AI service is not properly configured. Please check your environment variables and set GOOGLE_GEMINI_API_KEY."
        },
        { status: 503 }
      );
    }
    
    // Parse the request body
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const { jobTitle, company, location, skills, userProfile } = body;

    // Comprehensive validation of all inputs
    if (!jobTitle || typeof jobTitle !== 'string' || jobTitle.trim() === '') {
      console.error('Job title validation failed:', { 
        receivedJobTitle: jobTitle,
        type: typeof jobTitle,
        isEmpty: jobTitle === '',
        isNullish: jobTitle == null
      });
      return NextResponse.json(
        { error: 'Job title is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Sanitize and validate all inputs
    const sanitizedJobTitle = jobTitle.trim();
    const sanitizedCompany = company && typeof company === 'string' ? company.trim() : 'the company';
    const sanitizedLocation = location && typeof location === 'string' ? location.trim() : '';

    // Process skills which can be an array or a string
    let processedSkills = 'Not provided';
    if (Array.isArray(skills)) {
      processedSkills = skills.filter(Boolean).join(', ');
    } else if (skills && typeof skills === 'string' && skills.trim() !== '') {
      processedSkills = skills.trim();
    } else if (userProfile?.skills && typeof userProfile.skills === 'string') {
      processedSkills = userProfile.skills.trim();
    }

    // Ensure we have valid userProfile data
    const safeUserProfile = userProfile || {};

    // Log sanitized inputs
    console.log('Sanitized inputs:', {
      jobTitle: sanitizedJobTitle,
      company: sanitizedCompany,
      location: sanitizedLocation,
      skills: processedSkills
    });

    // Construct the prompt for the model
    const prompt = `
      Generate a professional ATS-friendly cover letter for a ${sanitizedJobTitle} position at ${sanitizedCompany}${sanitizedLocation ? ` in ${sanitizedLocation}` : ''}.
      
      About the candidate:
      - Name: ${safeUserProfile.name || 'Not provided'}
      - Email: ${safeUserProfile.email || 'Not provided'}
      - Phone: ${safeUserProfile.phone || 'Not provided'}
      - Skills: ${processedSkills}
      - Experience: ${safeUserProfile.experience || 'Not provided'}
      
      The cover letter should:
      1. Be properly formatted with date, addresses, greeting, and signature
      2. Have a strong opening paragraph that mentions the specific job
      3. Highlight relevant skills and experience that match the position
      4. Include a closing paragraph expressing interest in an interview
      5. Be concise (300-400 words)
      6. Use professional language and be free of spelling/grammar errors
      7. Be personalized to the company and role
      
      IMPORTANT: For the signature, use a generic placeholder like "Sincerely, [Your Name]" instead of including actual name.
      And instead of including actual contact information at the bottom, use placeholders like:
      [Your Name]
      [Your Email]
      [Your Phone]
      
      Format the letter properly with line breaks and spacing. Do not use Markdown formatting.
    `;

    // Generate the cover letter
    console.log('Calling AI model to generate cover letter');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log('Cover letter generated successfully');

    return NextResponse.json({ coverLetter: text });
  } catch (error) {
    console.error('Error generating cover letter:', error);
    return NextResponse.json(
      { error: 'Failed to generate cover letter. Please check input data and try again.' },
      { status: 500 }
    );
  }
} 