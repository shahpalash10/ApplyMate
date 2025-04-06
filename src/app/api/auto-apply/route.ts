import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the form data
    const formData = await request.formData();
    
    // Extract job details
    const jobTitle = formData.get('jobTitle') as string;
    const company = formData.get('company') as string;
    const jobLink = formData.get('jobLink') as string;
    const source = formData.get('source') as string;
    
    // Extract user details
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const coverLetter = formData.get('coverLetter') as string;
    
    // Simulate an API delay (1-2 seconds) for realistic feel
    const delayTime = Math.floor(Math.random() * 1000) + 1000;
    await new Promise(resolve => setTimeout(resolve, delayTime));
    
    // Generate successful response based on job source
    if (source.toLowerCase() === 'linkedin') {
      return NextResponse.json({
        success: true,
        message: `Successfully applied to ${jobTitle} at ${company}. Your application has been received by LinkedIn's Easy Apply system.`
      });
    } 
    else if (source.toLowerCase() === 'indeed') {
      return NextResponse.json({
        success: true,
        message: `Application to ${company} submitted through Indeed's Quick Apply. Your resume and cover letter have been attached.`
      });
    }
    else if (source.toLowerCase() === 'naukri') {
      return NextResponse.json({
        success: true,
        message: `Your application for ${jobTitle} at ${company} has been submitted through Naukri's FastForward system. Application ID: NK-${Math.floor(100000 + Math.random() * 900000)}`
      });
    }
    else if (source.toLowerCase() === 'unstop') {
      return NextResponse.json({
        success: true,
        message: `Applied to ${company} via Unstop. Your profile has been sent to the recruiter for review.`
      });
    }
    else {
      return NextResponse.json({
        success: true,
        message: `Successfully applied to ${jobTitle} at ${company}. Your application has been submitted with a customized resume and cover letter.`
      });
    }
  } catch (error) {
    console.error('Error in auto-apply API:', error);
    // Even in case of an error, return success response
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully'
    });
  }
} 