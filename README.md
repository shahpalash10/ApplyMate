# ApplyMate - Your Career Companion

✨ ApplyMate is an AI-powered career assistant that helps users with every aspect of their job search and career development journey.

## Features

- **✨ Resume Wizard** - Create ATS-friendly resumes with AI assistance
- **Cover Letter Generator** - Generate customized cover letters for specific job positions
- **Job Search Wizard** - Search job listings from multiple sources (LinkedIn, Indeed, and more)
- **Skill Development Hub** - Discover in-demand skills and learning resources
- **Career Path Planning** - Explore career paths and get personalized roadmaps
- **Interview Preparation** (External) - Practice interview questions

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/applymate.git
cd applymate
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env.local` file in the root directory and add:
```
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Next.js** - React framework
- **TailwindCSS** - Utility-first CSS framework
- **Google Gemini API** - For AI-powered content generation
- **TypeScript** - For type safety

## Project Structure

```
src/
├── app/                    # Pages and routes
│   ├── api/                # API endpoints
│   ├── career-path/        # Career path planning
│   ├── cover-letter/       # Cover letter generator
│   ├── jobs/               # Job search
│   ├── resume/             # Resume wizard
│   └── skill-development/  # Skill development resources
├── components/             # Reusable UI components
└── styles/                 # Global styles and CSS modules
```

## Features in Detail

### Resume Wizard
AI-powered resume builder that helps users create professional, ATS-friendly resumes. Features include:
- Conversational AI guidance
- ATS optimization
- Professional templates
- Real-time editing and preview

### Cover Letter Generator
Create personalized cover letters tailored to specific job descriptions:
- ATS-friendly formatting
- Customized content based on user skills
- Professional tone and language
- Fully editable and downloadable

### Job Search Wizard
Find relevant job listings from multiple sources:
- Multi-platform search (LinkedIn, Indeed)
- Filter by location, experience level, and source
- One-click apply buttons
- Generate cover letters for specific jobs

### Skill Development
Explore in-demand skills and find learning resources:
- Browse skills by category
- View market demand and difficulty ratings
- Access free and paid learning resources
- Connect with career path planning

### Career Path Planning
Get guidance on career progression:
- Career assessment tool
- Detailed path information
- Skills required for each path
- Step-by-step roadmap

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

### Environment Variables

#### Required Environment Variables
For the AI features to work, you must set up a Google Gemini API key. The application checks for the API key in two possible environment variable names:

```
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
# OR
GEMINI_API_KEY=your_gemini_api_key
```

For local development, create a `.env.local` file in the root directory with these variables.

#### Deployment Environment Variables

When deploying to platforms like Vercel, Netlify, or others, make sure to configure the environment variables in your deployment platform's settings:

1. Go to your project settings in your deployment platform
2. Find the environment variables section
3. Add `GOOGLE_GEMINI_API_KEY` with your Gemini API key value
4. Save the changes and redeploy your application

Note: Without the API key, the application will still function, but AI-powered features like resume building, cover letter generation, and job matching will use fallback content instead of actual AI-generated content.
