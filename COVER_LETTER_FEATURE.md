# Cover Letter Generation Feature

This document outlines the cover letter generation feature added to the job search application.

## Overview

The cover letter generation feature allows users to quickly create professional, ATS-friendly cover letters based on job listings they find in the job search tool. The feature:

1. Lets users generate customized cover letters for specific job listings
2. Provides an editing interface to refine the generated content
3. Allows users to download the cover letter as a text file
4. Saves user profile information for future use

## Implementation Details

### Components

1. **JobScraper Component Enhancement**
   - Added a "Generate Cover Letter" button to each job listing
   - Button appears alongside the "Apply Now" button
   - Clicking the button opens the CoverLetterModal with job details

2. **CoverLetterModal Component**
   - Manages the user profile collection, cover letter generation, editing, and downloading
   - Stores user profile in localStorage for convenience
   - Provides a clean UI for viewing and editing the cover letter

3. **Cover Letter API Endpoint**
   - Located at `/api/cover-letter`
   - Uses Google's Generative AI (Gemini) to create high-quality cover letters
   - Takes job details and user information to generate personalized content

### User Flow

1. User searches for jobs using the JobScraper component
2. User finds an interesting job listing and clicks "Generate Cover Letter"
3. If first time, user is prompted to enter their profile information
4. The system generates a cover letter using AI, tailored to the job
5. User can edit the cover letter, regenerate it, or download it
6. For future cover letter generations, the user's profile is pre-filled

### Technical Implementation

- Uses React state management for the modal and form handling
- Implements localStorage for persisting user profile information
- Leverages Google's Generative AI for creating professional cover letters
- Follows accessibility best practices with proper ARIA labels

## Configuration

To use the cover letter generation feature, you need to:

1. Set up a Google Gemini API key
2. Add the API key to your `.env.local` file:
   ```
   GOOGLE_GEMINI_API_KEY=your_api_key_here
   ```
3. Install the required dependency:
   ```
   npm install @google/generative-ai
   ```

## Security Considerations

- User profile data is stored only in the browser's localStorage
- No user data is sent to third parties except to Google's AI service for cover letter generation
- All API calls use HTTPS to ensure data is encrypted in transit 