# ApplyMate

A full-stack AI-powered job search and resume building application built with Next.js and Gemini AI.

## Features

- **Resume Wizard**: Create professional resumes with conversational AI
- **Job Search**: Search for jobs across multiple platforms (LinkedIn, Naukri, Internshala, Unstop)
- **AI-Enhanced Job Listings**: Get match scores, recommendations, and difficulty ratings for each job
- **Conversational Interface**: Natural language interaction for resume building
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI**: Google Gemini 1.5 Flash
- **Web Scraping**: Axios, Cheerio

## Screenshots

![Job Search Interface](screenshots/job-search.png)
![Resume Builder](screenshots/resume-builder.png)

## Getting Started

1. **Clone the repository**

```bash
git clone https://github.com/your-username/applymate.git
cd applymate
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory with the following:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Run the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

- **Job Search**: Navigate to the Job Search page, enter a job title, optional location and experience, and click "Find Jobs"
- **Resume Builder**: Use the Resume Wizard to create a professional resume through a conversational interface

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
