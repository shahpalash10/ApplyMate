"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePDF } from 'react-to-pdf';
import { useTheme } from './ThemeProvider';
import { Button } from './ui/Button';

interface Message {
  text: string;
  isUser: boolean;
  isLoading?: boolean;
  id: string;
}

interface ResumeData {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  education: string;
  experience: string;
  skills: string;
  projects: string;
  certifications: string;
  currentField: string;
  collectedFields: string[];
  detailedFields: string[];
  experienceEntries: Array<{
    company: string;
    title: string;
    dates: string;
    responsibilities: string;
    achievements: string;
  }>;
  projectEntries: Array<{
    name: string;
    description: string;
    technologies: string;
    outcome: string;
  }>;
  skillCategories: {
    technical?: string[];
    soft?: string[];
    languages?: string[];
    tools?: string[];
    [key: string]: string[] | undefined;
  };
  isTechJob: boolean;
}

const initialResumeData: ResumeData = {
  name: '',
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  education: '',
  experience: '',
  skills: '',
  projects: '',
  certifications: '',
  currentField: 'intro',
  collectedFields: [],
  detailedFields: [],
  experienceEntries: [],
  projectEntries: [],
  skillCategories: {},
  isTechJob: false
};

export default function ConversationalResumeBuilder() {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome',
      text: "I'm your Resume Wizard! ✨ I'll help you create an ATS-friendly resume. What's your name? (Type 'none' to skip any field or 'generate' anytime to create your resume)", 
      isUser: false 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [isGeneratingResume, setIsGeneratingResume] = useState(false);
  const [generatedResume, setGeneratedResume] = useState('');
  const [showResume, setShowResume] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toPDF, targetRef } = usePDF({
    filename: `${resumeData.name.replace(/\s+/g, '_') || 'resume'}_ATS_resume.pdf`,
    page: {
      margin: 25,
      format: 'letter',
      orientation: 'portrait',
    },
    canvas: {
      mimeType: 'image/png',
      qualityRatio: 1
    },
    overrides: {
      pdf: {
        compress: true,
        userUnit: 1.0,
        precision: 2,
        floatPrecision: 16
      },
      canvas: {
        useCORS: true,
        scale: 2
      }
    }
  });

  useEffect(() => {
    scrollToBottom();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;
    
    const userMessage = inputMessage;
    setInputMessage('');
    
    // Generate unique ID for the message
    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;
    
    // Add user message to chat
    setMessages(prev => [...prev, { id: userMessageId, text: userMessage, isUser: true }]);
    
    // Add loading indicator with fun message
    setMessages(prev => [...prev, { id: 'loading', text: "Thinking... ✨", isUser: false, isLoading: true }]);
    
    // Extract information from the user message based on context
    extractInformation(userMessage);
    
    // Check if the user's message was a direct generate command
    if (shouldGenerateResume(userMessage)) {
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      return; // Stop here since we're generating the resume
    }
    
    // Get response from Gemini
    const aiResponse = await getGeminiResponse(userMessage);
    
    // Remove loading message
    setMessages(prev => prev.filter(msg => !msg.isLoading));
    
    // Display typing effect
    setIsTyping(true);
    
    // Add AI response with typing effect
    const fullMessage = aiResponse;
    let currentText = '';
    
    setMessages(prev => [...prev, { id: assistantMessageId, text: currentText, isUser: false }]);
    
    // Simulate typing effect
    for (let i = 0; i < fullMessage.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 5)); // adjust speed here - faster
      currentText += fullMessage[i];
      setMessages(prev => 
        prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, text: currentText } 
            : msg
        )
      );
    }
    
    setIsTyping(false);
  };

  const extractInformation = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Generate resume if requested, regardless of completion status
    if (shouldGenerateResume(message)) {
      generateResume();
      return;
    }
    
    // Check if this is a tech job early in the conversation
    if (!resumeData.collectedFields.includes('jobfield') && 
        (lowerMessage.includes('tech') || 
         lowerMessage.includes('software') ||
         lowerMessage.includes('developer') ||
         lowerMessage.includes('engineer') ||
         lowerMessage.includes('data scientist') ||
         lowerMessage.includes('programmer'))) {
      setResumeData(prev => ({
        ...prev,
        isTechJob: true,
        collectedFields: [...prev.collectedFields, 'jobfield']
      }));
    }
    
    // Handle "none" or "skip" responses
    if (lowerMessage === 'none' || lowerMessage === 'skip' || lowerMessage === 'n/a') {
      // Find the first missing required field to mark as skipped
      const required = ["name", "email", "phone", "education", "experience", "skills"];
      const missingRequired = required.filter(field => !resumeData.collectedFields.includes(field));
      
      if (missingRequired.length > 0) {
        const fieldToSkip = missingRequired[0];
        
        // Add message about what field was skipped
        const skipMessageId = `skip-${Date.now()}`;
        setMessages(prev => [...prev, { 
          id: skipMessageId,
          text: `Got it, skipping ${fieldToSkip}. ✨`, 
          isUser: false 
        }]);
        
        setResumeData(prev => {
          const updated = { ...prev };
          
          // Type-safe approach to update fields
          switch(fieldToSkip) {
            case 'name':
              updated.name = 'N/A';
              break;
            case 'email':
              updated.email = 'N/A';
              break;
            case 'phone':
              updated.phone = 'N/A';
              break;
            case 'education':
              updated.education = 'N/A';
              break;
            case 'experience':
              updated.experience = 'N/A';
              break;
            case 'skills':
              updated.skills = 'N/A';
              break;
          }
          
          updated.collectedFields = [...prev.collectedFields, fieldToSkip];
          return updated;
        });
      } else {
        // Handle optional fields or suggest generating if everything is collected
        const optional = ["linkedin", "github", "projects", "certifications"];
        const missingOptional = optional.filter(field => !resumeData.collectedFields.includes(field));
        
        if (missingOptional.length > 0) {
          const fieldToSkip = missingOptional[0];
          
          // Add message about what optional field was skipped
          const skipMessageId = `skip-${Date.now()}`;
          setMessages(prev => [...prev, { 
            id: skipMessageId,
            text: `Got it, skipping ${fieldToSkip}. ✨`, 
            isUser: false 
          }]);
          
          setResumeData(prev => {
            const updated = { ...prev };
            
            // Type-safe approach to update fields
            switch(fieldToSkip) {
              case 'linkedin':
                updated.linkedin = 'N/A';
                break;
              case 'github':
                updated.github = 'N/A';
                break;
              case 'projects':
                updated.projects = 'N/A';
                break;
              case 'certifications':
                updated.certifications = 'N/A';
                break;
            }
            
            updated.collectedFields = [...prev.collectedFields, fieldToSkip];
            return updated;
          });
        } else {
          // If all fields are collected or skipped, suggest generating the resume
          const generatePromptId = `generate-prompt-${Date.now()}`;
          setMessages(prev => [...prev, { 
            id: generatePromptId,
            text: "All fields are complete! Type 'generate' to create your resume. ✨", 
            isUser: false 
          }]);
        }
      }
      return;
    }
    
    // Extract information based on the current field we're expecting
    setResumeData(prev => {
      const updated = { ...prev };
      
      // Track which fields we've collected
      if (prev.currentField === 'intro' && !prev.collectedFields.includes('name')) {
        // First message is likely the name
        updated.name = message;
        updated.collectedFields = [...prev.collectedFields, 'name'];
        updated.currentField = 'name';
      }
      // Look for email pattern
      else if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(message) && 
               !prev.collectedFields.includes('email')) {
        updated.email = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)?.[0] || '';
        updated.collectedFields = [...prev.collectedFields, 'email'];
      }
      // Look for phone pattern
      else if (/(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/.test(message) && 
               !prev.collectedFields.includes('phone')) {
        updated.phone = message.match(/(\+\d{1,3}[ -]?)?\(?\d{3}\)?[ -]?\d{3}[ -]?\d{4}/)?.[0] || '';
        updated.collectedFields = [...prev.collectedFields, 'phone'];
      }
      // Look for LinkedIn URLs
      else if (/linkedin\.com\/in\/[\w-]+/.test(message) && 
               !prev.collectedFields.includes('linkedin')) {
        updated.linkedin = message.match(/linkedin\.com\/in\/[\w-]+/)?.[0] || '';
        updated.collectedFields = [...prev.collectedFields, 'linkedin'];
      }
      // Look for GitHub URLs for tech jobs
      else if (prev.isTechJob && /github\.com\/[\w-]+/.test(message) && 
               !prev.collectedFields.includes('github')) {
        updated.github = message.match(/github\.com\/[\w-]+/)?.[0] || '';
        updated.collectedFields = [...prev.collectedFields, 'github'];
      }
      // For education data
      else if (message.length > 20 && 
               !prev.collectedFields.includes('education') &&
               (lowerMessage.includes('university') || 
                lowerMessage.includes('college') || 
                lowerMessage.includes('degree') || 
                lowerMessage.includes('school') ||
                lowerMessage.includes('bachelor') ||
                lowerMessage.includes('master') ||
                lowerMessage.includes('phd'))) {
        updated.education = message;
        updated.collectedFields = [...prev.collectedFields, 'education'];
      }
      // For work experience data
      else if (message.length > 30 && 
               !prev.detailedFields.includes('experience') &&
               (lowerMessage.includes('work') || 
                lowerMessage.includes('job') || 
                lowerMessage.includes('company') || 
                lowerMessage.includes('position') ||
                lowerMessage.includes('role'))) {
        
        // Extract company names, job titles, and dates if possible
        const companyPattern = /(?:at|for|with)\s+([A-Z][A-Za-z\s&]+(?:Inc\.?|LLC|Corp\.?|Company|Ltd\.?)?)/i;
        const titlePattern = /(?:as|was|am|a)\s+([A-Z][A-Za-z\s]+(?:Engineer|Developer|Manager|Analyst|Designer|Specialist|Consultant|Director|Assistant|Coordinator|Lead|Architect))/i;
        const datePattern = /(?:from|between|since|in)\s+(\w+\s+\d{4}|\d{4})\s+(?:to|until|through|-)\s+(\w+\s+\d{4}|\d{4}|present|now)/i;
        
        const companyMatch = message.match(companyPattern);
        const titleMatch = message.match(titlePattern);
        const dateMatch = message.match(datePattern);
        
        // If we can extract structured data, add it to the experienceEntries
        if (companyMatch || titleMatch) {
          updated.experienceEntries.push({
            company: companyMatch ? companyMatch[1].trim() : '',
            title: titleMatch ? titleMatch[1].trim() : '',
            dates: dateMatch ? `${dateMatch[1]} - ${dateMatch[2]}` : '',
            responsibilities: message,
            achievements: ''
          });
        }
        
        updated.experience = updated.experience ? `${updated.experience}\n\n${message}` : message;
        
        if (!prev.collectedFields.includes('experience')) {
          updated.collectedFields = [...prev.collectedFields, 'experience'];
        }
        
        // Mark that we've collected detailed experience info
        updated.detailedFields = [...prev.detailedFields, 'experience'];
      }
      // For skills data
      else if (message.length > 10 && !prev.collectedFields.includes('skills') && 
               (lowerMessage.includes('skill') || 
                lowerMessage.includes('proficient') || 
                lowerMessage.includes('expertise') ||
                message.includes(','))) {
        
        // Try to categorize skills
        const technicalSkills = [
          'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'ruby', 'php',
          'html', 'css', 'sql', 'nosql', 'react', 'angular', 'vue', 'node', 'express',
          'django', 'flask', 'spring', 'aws', 'azure', 'gcp', 'docker', 'kubernetes',
          'tensorflow', 'pytorch', 'machine learning', 'data science', 'ai', 'blockchain'
        ];
        
        const softSkills = [
          'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
          'time management', 'adaptability', 'creativity', 'collaboration', 'decision making'
        ];
        
        const skillsByCategory: {[key: string]: string[]} = {};
        
        // Split the skills by commas, semicolons, and "and"
        const skillsList = message.split(/,|;|\sand\s/).map(s => s.trim());
        
        skillsList.forEach(skill => {
          const lowerSkill = skill.toLowerCase();
          
          // Categorize the skill
          if (technicalSkills.some(ts => lowerSkill.includes(ts))) {
            if (!skillsByCategory.technical) skillsByCategory.technical = [];
            skillsByCategory.technical.push(skill);
          } else if (softSkills.some(ss => lowerSkill.includes(ss))) {
            if (!skillsByCategory.soft) skillsByCategory.soft = [];
            skillsByCategory.soft.push(skill);
          } else if (lowerSkill.includes('language') || 
                     ['english', 'spanish', 'french', 'german', 'chinese', 'japanese'].some(l => lowerSkill.includes(l))) {
            if (!skillsByCategory.languages) skillsByCategory.languages = [];
            skillsByCategory.languages.push(skill);
          } else {
            if (!skillsByCategory.other) skillsByCategory.other = [];
            skillsByCategory.other.push(skill);
          }
        });
        
        updated.skills = message;
        updated.skillCategories = {...prev.skillCategories, ...skillsByCategory};
        updated.collectedFields = [...prev.collectedFields, 'skills'];
      }
      // For projects data
      else if (message.length > 30 && !prev.collectedFields.includes('projects') && 
               (lowerMessage.includes('project') || 
                lowerMessage.includes('built') || 
                lowerMessage.includes('created') || 
                lowerMessage.includes('developed'))) {
        
        // Try to extract project name and technologies
        const projectNamePattern = /(?:called|named|titled)\s+["']?([A-Za-z0-9\s]+)["']?/i;
        const techPattern = /(?:using|with|in)\s+([A-Za-z0-9,\s]+(?:and [A-Za-z0-9\s]+)?)/i;
        
        const projectNameMatch = message.match(projectNamePattern);
        const techMatch = message.match(techPattern);
        
        if (projectNameMatch) {
          updated.projectEntries.push({
            name: projectNameMatch[1].trim(),
            description: message,
            technologies: techMatch ? techMatch[1].trim() : '',
            outcome: ''
          });
        }
        
        updated.projects = message;
        updated.collectedFields = [...prev.collectedFields, 'projects'];
      }
      // For certifications data
      else if (message.length > 10 && !prev.collectedFields.includes('certifications') && 
               (lowerMessage.includes('certification') || 
                lowerMessage.includes('certified') || 
                lowerMessage.includes('certificate'))) {
        updated.certifications = message;
        updated.collectedFields = [...prev.collectedFields, 'certifications'];
      }
      // Additional context for existing fields - add to what we've already collected
      else if (prev.collectedFields.includes('experience') && 
               message.length > 20 &&
               (lowerMessage.includes('responsible') || 
                lowerMessage.includes('achievement') || 
                lowerMessage.includes('accomplishment') ||
                lowerMessage.includes('managed') ||
                lowerMessage.includes('led') ||
                lowerMessage.includes('developed') ||
                lowerMessage.includes('created') ||
                lowerMessage.includes('implemented'))) {
        
        // Add to experience with formatting
        updated.experience = `${prev.experience}\n\n${message}`;
        
        // If we have experienceEntries, add this as an achievement to the latest entry
        if (updated.experienceEntries.length > 0) {
          const lastIndex = updated.experienceEntries.length - 1;
          updated.experienceEntries[lastIndex].achievements += message + '\n';
        }
      }
      // Add technologies or outcomes to existing projects
      else if (prev.collectedFields.includes('projects') && 
               message.length > 10 &&
               (lowerMessage.includes('technology') || 
                lowerMessage.includes('tool') || 
                lowerMessage.includes('outcome') ||
                lowerMessage.includes('result'))) {
        
        updated.projects = `${prev.projects}\n\n${message}`;
        
        // If we have projectEntries, add this as additional info to the latest entry
        if (updated.projectEntries.length > 0) {
          const lastIndex = updated.projectEntries.length - 1;
          if (lowerMessage.includes('technology') || lowerMessage.includes('tool')) {
            updated.projectEntries[lastIndex].technologies += message + '\n';
          } else {
            updated.projectEntries[lastIndex].outcome += message + '\n';
          }
        }
      }
      
      return updated;
    });
  };

  const getGeminiResponse = async (userMessage: string): Promise<string> => {
    try {
      // Send the user message and conversation context to Gemini for a response
      const conversationContext = buildConversationContext();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `${conversationContext}
          
User's message: "${userMessage}"

Keep responses to 1-2 sentences max with 1 emoji. Ask for only ONE specific piece of missing information at a time.
If the user types "none" or similar, don't ask for the same field again. The system will handle skipping fields.
Always remind users they can type 'none' to skip fields or 'generate' anytime to create their resume.`,
        }),
      });

      const data = await response.json();
      
      // Check if there was an API configuration error
      if (data.error === 'API key not configured') {
        return data.response || "⚠️ AI features are currently unavailable. Please check the API configuration.";
      }
      
      return data.response || "What else for your resume? ✨";
    } catch (error) {
      console.error('Error getting Gemini response:', error);
      return "Oops! Try again? 🧙‍♂️";
    }
  };

  const buildConversationContext = (): string => {
    // Build context of what we've collected so far for Gemini
    const fields = resumeData.collectedFields;
    let context = "You are a Resume Wizard helping build a professional resume. Be direct and to-the-point.\n\n";
    context += "IMPORTANT: Users can type 'none' to skip any field and 'generate' at any time to create their resume.\n\n";
    
    context += "COLLECTED:\n";
    if (fields.includes('name')) context += `Name: ${resumeData.name}\n`;
    if (fields.includes('email')) context += `Email: ${resumeData.email}\n`;
    if (fields.includes('phone')) context += `Phone: ${resumeData.phone}\n`;
    if (fields.includes('linkedin')) context += `LinkedIn: ${resumeData.linkedin}\n`;
    if (fields.includes('github')) context += `GitHub: ${resumeData.github}\n`;
    
    // Add detailed education data if available
    if (fields.includes('education')) {
      context += `Education: ${resumeData.education}\n`;
    }
    
    // Add detailed experience data
    if (fields.includes('experience')) {
      context += `Experience: ${resumeData.experience}\n`;
      
      // Add structured experience data if available
      if (resumeData.experienceEntries.length > 0) {
        context += "Structured Experience Data:\n";
        resumeData.experienceEntries.forEach((entry, index) => {
          context += `  Entry ${index + 1}:\n`;
          if (entry.company) context += `    Company: ${entry.company}\n`;
          if (entry.title) context += `    Title: ${entry.title}\n`;
          if (entry.dates) context += `    Dates: ${entry.dates}\n`;
          if (entry.responsibilities) context += `    Responsibilities: ${entry.responsibilities}\n`;
          if (entry.achievements) context += `    Achievements: ${entry.achievements}\n`;
        });
      }
    }
    
    // Add detailed skills data with categories
    if (fields.includes('skills')) {
      context += `Skills: ${resumeData.skills}\n`;
      
      // Add categorized skills if available
      if (Object.keys(resumeData.skillCategories).length > 0) {
        context += "Categorized Skills:\n";
        Object.entries(resumeData.skillCategories).forEach(([category, skills]) => {
          if (skills && skills.length > 0) {
            context += `  ${category.charAt(0).toUpperCase() + category.slice(1)}: ${skills.join(', ')}\n`;
          }
        });
      }
    }
    
    // Add detailed project data
    if (fields.includes('projects')) {
      context += `Projects: ${resumeData.projects}\n`;
      
      // Add structured project data if available
      if (resumeData.projectEntries.length > 0) {
        context += "Structured Project Data:\n";
        resumeData.projectEntries.forEach((project, index) => {
          context += `  Project ${index + 1}:\n`;
          if (project.name) context += `    Name: ${project.name}\n`;
          if (project.description) context += `    Description: ${project.description}\n`;
          if (project.technologies) context += `    Technologies: ${project.technologies}\n`;
          if (project.outcome) context += `    Outcome: ${project.outcome}\n`;
        });
      }
    }
    
    if (fields.includes('certifications')) context += `Certifications: ${resumeData.certifications}\n`;
    
    // Indicate if this is a tech job
    if (resumeData.isTechJob) {
      context += "Note: User is looking for a technical/software role.\n";
    }
    
    context += "\nMISSING:\n";
    const missing: string[] = [];
    if (!fields.includes('name')) missing.push("Name");
    if (!fields.includes('email')) missing.push("Email");
    if (!fields.includes('phone')) missing.push("Phone");
    if (!fields.includes('education')) missing.push("Education");
    if (!fields.includes('experience')) missing.push("Experience");
    if (!fields.includes('skills')) missing.push("Skills");
    if (!fields.includes('linkedin')) missing.push("LinkedIn (optional)");
    if (resumeData.isTechJob && !fields.includes('github')) missing.push("GitHub (recommended for tech jobs)");
    if (!fields.includes('projects')) missing.push("Projects (optional)");
    if (!fields.includes('certifications')) missing.push("Certifications (optional)");
    
    context += missing.join(", ") + "\n\n";
    
    // Specific follow-up instructions based on what we've collected
    if (fields.includes('experience') && !resumeData.detailedFields.includes('experience')) {
      context += "INSTRUCTION: Ask for specific achievements, metrics, and responsibilities for their experience. Focus on quantifiable results, technologies used, and impact.\n";
    }
    else if (fields.includes('projects') && resumeData.projectEntries.length > 0 && 
             (!resumeData.projectEntries[resumeData.projectEntries.length - 1].technologies || 
              !resumeData.projectEntries[resumeData.projectEntries.length - 1].outcome)) {
      context += "INSTRUCTION: Ask about specific technologies used in their latest project and outcomes/results achieved.\n";
    }
    else if (isReadyToGenerateResume()) {
      context += "INSTRUCTION: All essential info collected. Suggest generating the resume now.\n";
    } else {
      const required: string[] = ["Name", "Email", "Phone", "Education", "Experience", "Skills"];
      const missingRequired = required.filter(item => missing.includes(item) || missing.includes(`${item} (optional)`));
      if (missingRequired.length > 0) {
        context += `INSTRUCTION: Ask for ${missingRequired[0]} specifically. Remind they can type 'none' to skip.\n`;
      }
      
      // If we're collecting skills, suggest organizing by category
      if (missingRequired[0] === "Skills") {
        context += "For skills, ask them to separate technical skills, soft skills, and tools/languages if applicable.\n";
      }
      
      // If we're collecting experience, ask for structured information
      if (missingRequired[0] === "Experience") {
        context += "For experience, ask for company names, job titles, dates, and specific responsibilities.\n";
      }
    }
    
    return context;
  };

  const shouldGenerateResume = (message: string): boolean => {
    const lowerMessage = message.toLowerCase();
    // Check if the user explicitly wants to generate a resume
    return (
      lowerMessage.includes('generate') || 
      lowerMessage.includes('create') || 
      lowerMessage.includes('make') || 
      lowerMessage.includes('build') ||
      lowerMessage === 'yes' && isReadyToGenerateResume()
    );
  };

  const isReadyToGenerateResume = (): boolean => {
    // Check if we have the minimum required fields to suggest resume generation
    // Note: We now allow generating at any time when explicitly requested
    const requiredFields = ['name', 'email', 'education', 'experience', 'skills'];
    return requiredFields.every(field => resumeData.collectedFields.includes(field));
  };

  const generateResume = async () => {
    setIsGeneratingResume(true);
    
    // Add message that we're generating
    const generatingMessageId = `generating-${Date.now()}`;
    setMessages(prev => [...prev, { 
      id: generatingMessageId,
      text: "Creating your ATS-friendly resume now... ✨", 
      isUser: false 
    }]);
    
    try {
      // Choose between LaTeX and Markdown generation based on the structured data quality
      const useStructuredTemplate = 
        resumeData.experienceEntries.length > 0 ||
        resumeData.projectEntries.length > 0 || 
        Object.keys(resumeData.skillCategories).length > 0;
      
      let apiPayload;
      
      if (useStructuredTemplate) {
        // Use structured template approach
        apiPayload = {
          isResumeRequest: true,
          useStructuredTemplate: true,
          resumeData: {
            ...resumeData,
            template: generateLatexTemplate()
          },
          message: ''
        };
      } else {
        // Use the standard AI generation approach
        apiPayload = {
          isResumeRequest: true,
          resumeData,
          message: ''
        };
      }
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPayload),
      });

      const data = await response.json();
      if (data.response) {
        setGeneratedResume(data.response);
        setShowResume(true);
        
        const readyMessageId = `ready-${Date.now()}`;
        setMessages(prev => [...prev, { 
          id: readyMessageId,
          text: "Your ATS-friendly resume is ready! Check it out below and download the PDF for applications! 🎉", 
          isUser: false 
        }]);
      }
    } catch (error) {
      console.error('Error:', error);
      
      const errorMessageId = `error-${Date.now()}`;
      setMessages(prev => [...prev, { 
        id: errorMessageId,
        text: "Oops! Something went wrong. Let's try again. 😅", 
        isUser: false 
      }]);
    } finally {
      setIsGeneratingResume(false);
    }
  };
  
  // Function to generate a LaTeX template based on collected user data
  const generateLatexTemplate = (): string => {
    const name = resumeData.name || '';
    const email = resumeData.email || '';
    const phone = resumeData.phone || '';
    const linkedin = resumeData.linkedin || '';
    const github = resumeData.github || '';
    
    // Extract location if available (usually from education or experience)
    let location = '';
    if (resumeData.experience.includes('located in') || resumeData.experience.includes('based in')) {
      const locationMatch = resumeData.experience.match(/(?:located|based) in ([^,.]+)/i);
      if (locationMatch && locationMatch[1]) {
        location = locationMatch[1].trim();
      }
    }
    
    // Create a basic template with placeholders for dynamic content
    let template = `% ATS-FRIENDLY RESUME TEMPLATE
% This LaTeX-based template is optimized for ATS systems
\\documentclass[11pt,letterpaper]{article}
\\usepackage[empty]{fullpage}
\\usepackage{hyperref}
\\usepackage{enumitem}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{titlesec}

% Define colors and styling
\\usepackage{xcolor}
\\definecolor{primary}{HTML}{0066cc}
\\definecolor{secondary}{HTML}{444444}

% Custom section styling
\\titleformat{\\section}{\\normalfont\\Large\\bfseries}{}{0em}{\\color{primary}}[\\titlerule]
\\titlespacing*{\\section}{0pt}{12pt}{8pt}

\\begin{document}

% HEADER
\\begin{center}
    {\\LARGE\\textbf{${name}}}\\\\[0.5em]
    ${location ? location + ' $\\cdot$ ' : ''}${phone} $\\cdot$ \\href{mailto:${email}}{${email}}${linkedin ? ' $\\cdot$ \\href{https://' + linkedin + '}{' + linkedin + '}' : ''}${github ? ' $\\cdot$ \\href{https://' + github + '}{' + github + '}' : ''}
\\end{center}

% PROFESSIONAL SUMMARY
\\section{Professional Summary}
% Will be filled by AI based on experience and skills

% EXPERIENCE SECTION
\\section{Professional Experience}
% EXPERIENCE_PLACEHOLDER

% EDUCATION SECTION  
\\section{Education}
% EDUCATION_PLACEHOLDER

% SKILLS SECTION
\\section{Skills}
% SKILLS_PLACEHOLDER

% PROJECTS SECTION
${resumeData.projects ? '\\section{Projects}\n% PROJECTS_PLACEHOLDER' : ''}

% CERTIFICATIONS SECTION
${resumeData.certifications ? '\\section{Certifications}\n% CERTIFICATIONS_PLACEHOLDER' : ''}

\\end{document}
`;
    
    return template;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isTyping) {
        handleSendMessage();
      }
    }
  };

  const resetBuilder = () => {
    setResumeData(initialResumeData);
    setGeneratedResume('');
    setShowResume(false);
    
    const newMessageId = `welcome-new-${Date.now()}`;
    setMessages([{ 
      id: newMessageId,
      text: "Let's start fresh! I'll help you create an ATS-friendly resume. What's your name? ✨ (Type 'none' to skip any field or 'generate' anytime to create your resume)", 
      isUser: false 
    }]);
  };

  // Check if the content is LaTeX
  const isLatexContent = (content: string): boolean => {
    return content.includes('\\documentclass') && 
           content.includes('\\begin{document}') && 
           content.includes('\\end{document}');
  };
  
  // Convert LaTeX to presentable HTML (for preview only)
  const convertLatexToHtml = (latex: string): string => {
    // This is a simple converter for preview only - real LaTeX to PDF conversion
    // would typically be done server-side or via a dedicated library
    
    // First, extract the document content (remove preamble)
    const documentMatch = latex.match(/\\begin{document}([\s\S]*)\\end{document}/);
    const documentContent = documentMatch ? documentMatch[1] : latex;
    
    let html = documentContent
      // Remove LaTeX comments
      .replace(/%.+$/gm, '')
      
      // Section headers
      .replace(/\\section{([^}]+)}/g, '<h2 class="text-xl font-bold text-primary-600 border-b border-primary-300 pb-1 mb-3 mt-6">$1</h2>')
      .replace(/\\subsection{([^}]+)}/g, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
      
      // Text formatting
      .replace(/\\textbf{([^}]+)}/g, '<strong>$1</strong>')
      .replace(/\\textit{([^}]+)}/g, '<em>$1</em>')
      .replace(/\\underline{([^}]+)}/g, '<u>$1</u>')
      
      // Lists
      .replace(/\\begin{itemize}(\[.*?\])?/g, '<ul class="list-disc pl-5 space-y-1">')
      .replace(/\\end{itemize}/g, '</ul>')
      .replace(/\\item\s+/g, '<li>')
      .replace(/\\item\s+([^\n]+)\n/g, '<li>$1</li>\n')
      
      // Layout
      .replace(/\\begin{center}([\s\S]*?)\\end{center}/g, '<div class="text-center">$1</div>')
      .replace(/\\hfill/g, '<span class="ml-auto"></span>')
      
      // Links
      .replace(/\\href{([^}]+)}{([^}]+)}/g, '<a href="$1" class="text-blue-600 hover:underline">$2</a>')
      
      // Special characters and spacing
      .replace(/\\\\/g, '<br>')
      .replace(/\\&/g, '&amp;')
      .replace(/\\\$/g, '$')
      .replace(/\\%/g, '%')
      .replace(/\s*{\\LARGE\\textbf{([^}]+)}}/g, '<h1 class="text-3xl font-bold text-center mb-4">$1</h1>')
      .replace(/\[0\.5em\]/g, '<div class="h-2"></div>')
      
      // Fix dots in contact section
      .replace(/\$\\cdot\$/g, '<span class="mx-1">•</span>');
    
    // Clean up any remaining LaTeX commands
    html = html.replace(/\\[a-zA-Z]+(\{[^}]*\})?/g, '');
    
    // Wrap in a container for proper styling
    return `<div class="latex-preview">${html}</div>`;
  };

  // Function to handle PDF download
  const handleDownloadPDF = () => {
    // Set a small timeout to ensure content is fully rendered
    setTimeout(() => {
      toPDF();
    }, 200);
  };

  return (
    <div className={`flex flex-col h-[calc(100vh-16rem)] overflow-hidden ${isDark ? 'text-white' : 'text-gray-900'}`}>
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <h2 className="text-2xl font-bold tracking-tight flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Resume Wizard ✨
        </h2>
        <p className="text-blue-100 mt-1">Let's craft an amazing resume through a fun conversation!</p>
      </div>
      
      <div className={`flex-1 p-4 overflow-y-auto ${isDark ? 'bg-gray-800/40' : 'bg-white'}`}>
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`mb-4 flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.isUser 
                    ? `${isDark ? 'bg-primary-700 text-white' : 'bg-primary-600 text-white'}` 
                    : `${isDark ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'}`
                } ${message.isLoading ? 'animate-pulse' : ''}`}
              >
                {message.text.includes('```') ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {message.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap">{message.text}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className={`p-4 border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
        <div className="max-w-3xl mx-auto flex">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message here..."
            className={`flex-1 p-3 rounded-l-lg ${
              isDark 
                ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            } border focus:outline-none focus:ring-2 focus:ring-primary-500`}
            onKeyDown={handleKeyPress}
            disabled={isTyping || isGeneratingResume}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isTyping || isGeneratingResume}
            variant="primary"
            className="rounded-l-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-90" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </Button>
        </div>
      </div>

      {showResume && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${isDark ? 'bg-black/80' : 'bg-gray-500/75'}`}>
          <div className={`relative w-full max-w-4xl max-h-[90vh] overflow-auto rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} p-6`}>
            <button 
              onClick={() => setShowResume(false)}
              className={`absolute top-4 right-4 p-2 rounded-full ${
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label="Close resume preview"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="mb-6 text-center">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>Your Resume Preview</h2>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                Review your resume below. You can download it as a PDF or go back to make changes.
              </p>
            </div>
            
            <div 
              ref={targetRef} 
              className={`p-8 border ${isDark ? 'border-gray-700 bg-white' : 'border-gray-200 bg-white'} rounded-lg mb-6 text-black`}
            >
              {isLatexContent(generatedResume) ? (
                <div 
                  className="prose prose-sm max-w-none" 
                  dangerouslySetInnerHTML={{ __html: convertLatexToHtml(generatedResume) }}
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>
                    {generatedResume}
                  </ReactMarkdown>
                </div>
              )}
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => setShowResume(false)} 
                variant="outline"
              >
                Back to Chat
              </Button>
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    // Copy to clipboard
                    navigator.clipboard.writeText(generatedResume)
                      .then(() => {
                        alert("Resume content copied to clipboard!");
                      })
                      .catch(err => {
                        console.error('Failed to copy: ', err);
                        alert("Failed to copy content. Please try again.");
                      });
                  }} 
                  variant="outline"
                >
                  Copy to Clipboard
                </Button>
                <Button 
                  onClick={handleDownloadPDF} 
                  variant="primary"
                >
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 