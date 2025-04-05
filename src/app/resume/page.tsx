import ConversationalResumeBuilder from '@/components/ConversationalResumeBuilder';

export default function ResumePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-700 text-transparent bg-clip-text tracking-tight">
            ✨ Resume Wizard ✨
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Chat with our magical AI assistant and create a job-winning resume in minutes!
          </p>
        </div>
        
        <ConversationalResumeBuilder />
      </div>
    </div>
  );
} 