import JobScraper from '@/components/JobScraper';

export default function JobsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="z-10 w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          AI-Powered Job Search
        </h1>
        
        <JobScraper />
      </div>
    </main>
  );
} 