import Link from 'next/link';
import ChatWidget from '@/components/ChatWidget';

interface Feature {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  external?: boolean;
}

const features: Feature[] = [
  {
    title: '✨ Resume Wizard',
    description: 'Turn your experience into an impressive resume with the help of our magical AI assistant.',
    link: '/resume',
    icon: (
      <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    title: 'Cover Letter Generator',
    description: 'Create personalized cover letters tailored to specific job descriptions in seconds.',
    link: '/cover-letter',
    icon: (
      <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  {
    title: 'Interview Preparation',
    description: 'Practice common interview questions and receive feedback on your responses.',
    link: 'https://cognicore.vercel.app/',
    external: true,
    icon: (
      <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
      </svg>
    )
  },
  {
    title: '✨ Job Search Wizard',
    description: 'Find your perfect job with our AI-powered job scraper that searches multiple platforms.',
    link: '/jobs',
    icon: (
      <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )
  },
  {
    title: 'Skill Development',
    description: 'Identify in-demand skills for your industry and get personalized learning resources.',
    link: '/skill-development',
    icon: (
      <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    title: 'Career Path Planning',
    description: 'Receive guidance on career progression and skill development opportunities.',
    link: '/career-path',
    icon: (
      <svg className="h-6 w-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text sm:text-5xl md:text-6xl">
            ✨ ApplyMate ✨
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600">
            Your magical career companion. Get expert guidance on resumes, interviews, and career development!
          </p>
          <div className="mt-8">
            <Link 
              href="/resume" 
              className="px-8 py-3 text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 md:py-4 md:text-lg md:px-10 shadow-md transition-all duration-200"
            >
              Begin the Magic ✨
            </Link>
            <div className="mt-4 text-sm text-gray-500">
              <a 
                href="https://ai.google.dev/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Set up a Gemini API key
              </a>{" "}
              for full AI functionality
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            feature.external ? (
              <a 
                key={index}
                href={feature.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100"
              >
                <div className="p-6 flex-1">
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
                <div className="px-6 py-4 bg-gray-50 group-hover:bg-gray-100 transition-colors duration-200 flex items-center text-blue-600 font-medium">
                  <span>Visit now</span>
                  <svg className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </a>
            ) : (
              <Link 
                key={index}
                href={feature.link}
                className="group flex flex-col bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100"
              >
                <div className="p-6 flex-1">
                  <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-100 transition-colors duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
                <div className="px-6 py-4 bg-gray-50 group-hover:bg-gray-100 transition-colors duration-200 flex items-center text-blue-600 font-medium">
                  <span>Try it now</span>
                  <svg className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </div>
              </Link>
            )
          ))}
        </div>
      </div>

      <ChatWidget />
    </main>
  );
}
