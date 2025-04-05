import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl text-white">
                ✨ ApplyMate
              </span>
            </Link>
            <p className="mt-3 text-gray-400 text-sm">
              Your magical career companion for job search, resume building, and professional growth.
            </p>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Features
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/resume" className="text-gray-400 hover:text-white transition duration-200">
                  Resume Wizard
                </Link>
              </li>
              <li>
                <Link href="/cover-letter" className="text-gray-400 hover:text-white transition duration-200">
                  Cover Letters
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-gray-400 hover:text-white transition duration-200">
                  Job Search
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Career Growth
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/skill-development" className="text-gray-400 hover:text-white transition duration-200">
                  Skill Development
                </Link>
              </li>
              <li>
                <Link href="/career-path" className="text-gray-400 hover:text-white transition duration-200">
                  Career Path Planning
                </Link>
              </li>
              <li>
                <a 
                  href="https://cognicore.vercel.app/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition duration-200"
                >
                  Interview Preparation
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
              Get Started
            </h3>
            <div className="mt-4 space-y-3">
              <Link
                href="/resume"
                className="inline-flex px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Resume
              </Link>
              <p className="text-sm text-gray-400 mt-6">
                Start your career journey with our magical AI-powered tools
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} ApplyMate. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Privacy Policy</span>
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-white">
              <span className="sr-only">Terms of Service</span>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 