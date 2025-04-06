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
  education: string[];
  experience: string[];
  skills: {
    technical: string[];
    soft: string[];
    languages: string[];
  };
  projects: string[];
  certifications: string[];
  currentField: string;
  collectedFields: string[];
  interviewStage: number;
  isJobTechnical: boolean;
}

const initialResumeData: ResumeData = {
  name: '',
  email: '',
  phone: '',
  linkedin: '',
  github: '',
  education: [],
  experience: [],
  skills: {
    technical: [],
    soft: [],
    languages: []
  },
  projects: [],
  certifications: [],
  currentField: 'intro',
  collectedFields: [],
  interviewStage: 0,
  isJobTechnical: false
};

// Define the interview stages for structured information collection
const INTERVIEW_STAGES = {
  INTRO: 0,
  PERSONAL: 1,
  EDUCATION: 2,
  EXPERIENCE: 3,
  SKILLS: 4,
  PROJECTS: 5,
  CERTIFICATIONS: 6,
  FINAL: 7
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
    // Add a timeout to ensure content is rendered before PDF generation
    overrides: {
      pdf: {
        compress: true
      },
      canvas: {
        useCORS: true,
        allowTaint: true
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
    
    // Handle "none" or "skip" responses
    if (lowerMessage === 'none' || lowerMessage === 'skip' || lowerMessage === 'n/a') {
      advanceToNextStage();
      return;
    }
    
    // Process information based on the current interview stage
    setResumeData(prev => {
      const updated = { ...prev };
      
      switch(prev.interviewStage) {
        case INTERVIEW_STAGES.INTRO:
          // Determine if job is technical based on intro message
          if (
            lowerMessage.includes('developer') || 
            lowerMessage.includes('engineer') || 
            lowerMessage.includes('programmer') || 
            lowerMessage.includes('data scientist') || 
            lowerMessage.includes('tech') ||
            lowerMessage.includes('software') ||
            lowerMessage.includes('coding') ||
            lowerMessage.includes('it')
          ) {
            updated.isJobTechnical = true;
          }
          // Move to personal info stage
          updated.interviewStage = INTERVIEW_STAGES.PERSONAL;
          break;
          
        case INTERVIEW_STAGES.PERSONAL:
          // Personal information collection
          if (!prev.collectedFields.includes('name')) {
            updated.name = message;
            updated.collectedFields = [...prev.collectedFields, 'name'];
          } 
          else if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(message) && 
                  !prev.collectedFields.includes('email')) {
            updated.email = message.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/)?.[0] || '';
            updated.collectedFields = [...prev.collectedFields, 'email'];
          }
          else if (/\b(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b/.test(message) && 
                  !prev.collectedFields.includes('phone')) {
            const phoneMatch = message.match(/\b(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b/)?.[0] || '';
            updated.phone = phoneMatch;
            updated.collectedFields = [...prev.collectedFields, 'phone'];
          }
          else if ((lowerMessage.includes('linkedin.com') || lowerMessage.includes('linkedin')) && 
                  !prev.collectedFields.includes('linkedin')) {
            // Extract LinkedIn URL or username
            if (lowerMessage.includes('linkedin.com/in/')) {
              const linkedInMatch = message.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i)?.[0] || '';
              updated.linkedin = linkedInMatch;
            } else {
              updated.linkedin = message;
            }
            updated.collectedFields = [...prev.collectedFields, 'linkedin'];
          }
          else if (updated.isJobTechnical && 
                  (lowerMessage.includes('github.com') || lowerMessage.includes('github')) && 
                  !prev.collectedFields.includes('github')) {
            // Extract GitHub URL or username
            if (lowerMessage.includes('github.com/')) {
              const githubMatch = message.match(/github\.com\/[A-Za-z0-9_-]+/i)?.[0] || '';
              updated.github = githubMatch;
            } else {
              updated.github = message;
            }
            updated.collectedFields = [...prev.collectedFields, 'github'];
          }
          
          // Check if all personal info is collected
          const personalFields = ['name', 'email', 'phone'];
          if (updated.isJobTechnical) {
            personalFields.push('github');
          }
          
          const personalCollected = personalFields.every(
            field => updated.collectedFields.includes(field) || field === 'github'
          );
          
          if (personalCollected && updated.collectedFields.includes('linkedin')) {
            updated.interviewStage = INTERVIEW_STAGES.EDUCATION;
          }
          break;
          
        case INTERVIEW_STAGES.EDUCATION:
          // Education information
          if (message.length > 10) {
            updated.education = [...prev.education, message];
            if (!prev.collectedFields.includes('education')) {
              updated.collectedFields = [...prev.collectedFields, 'education'];
            }
            // Don't advance stage automatically, will ask if user wants to add more
          }
          break;
          
        case INTERVIEW_STAGES.EXPERIENCE:
          // Work experience
          if (message.length > 10) {
            updated.experience = [...prev.experience, message];
            if (!prev.collectedFields.includes('experience')) {
              updated.collectedFields = [...prev.collectedFields, 'experience'];
            }
            // Don't advance stage automatically, will ask if user wants to add more
          }
          break;
          
        case INTERVIEW_STAGES.SKILLS:
          // Skills information
          if (message.length > 3) {
            // Simple skill categorization
            const skills = message.split(/,|\n/).map(s => s.trim()).filter(s => s.length > 0);
            
            skills.forEach(skill => {
              const lowSkill = skill.toLowerCase();
              // Technical skills detection
              if (
                lowSkill.includes('programming') || 
                lowSkill.includes('java') || 
                lowSkill.includes('python') || 
                lowSkill.includes('javascript') || 
                lowSkill.includes('c++') || 
                lowSkill.includes('react') || 
                lowSkill.includes('node') ||
                lowSkill.includes('sql') ||
                lowSkill.includes('data') ||
                lowSkill.includes('cloud') ||
                lowSkill.includes('git') ||
                lowSkill.includes('html') ||
                lowSkill.includes('css')
              ) {
                updated.skills.technical.push(skill);
              }
              // Language skills detection
              else if (
                lowSkill.includes('english') || 
                lowSkill.includes('spanish') || 
                lowSkill.includes('french') || 
                lowSkill.includes('german') || 
                lowSkill.includes('chinese') || 
                lowSkill.includes('japanese') ||
                lowSkill.includes('language')
              ) {
                updated.skills.languages.push(skill);
              }
              // Soft skills detection
              else if (
                lowSkill.includes('communication') || 
                lowSkill.includes('leadership') || 
                lowSkill.includes('teamwork') || 
                lowSkill.includes('time management') || 
                lowSkill.includes('problem solving') || 
                lowSkill.includes('creativity') ||
                lowSkill.includes('soft')
              ) {
                updated.skills.soft.push(skill);
              }
              // Default to technical for tech jobs, soft for non-tech jobs
              else {
                if (updated.isJobTechnical) {
                  updated.skills.technical.push(skill);
                } else {
                  updated.skills.soft.push(skill);
                }
              }
            });
            
            if (!prev.collectedFields.includes('skills')) {
              updated.collectedFields = [...prev.collectedFields, 'skills'];
            }
          }
          break;
          
        case INTERVIEW_STAGES.PROJECTS:
          // Projects
          if (message.length > 10) {
            updated.projects = [...prev.projects, message];
            if (!prev.collectedFields.includes('projects')) {
              updated.collectedFields = [...prev.collectedFields, 'projects'];
            }
          }
          break;
          
        case INTERVIEW_STAGES.CERTIFICATIONS:
          // Certifications
          if (message.length > 3) {
            updated.certifications = [...prev.certifications, message];
            if (!prev.collectedFields.includes('certifications')) {
              updated.collectedFields = [...prev.collectedFields, 'certifications'];
            }
          }
          break;
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
    let context = "You are a Resume Wizard helping build a professional resume with step-by-step questions. Be direct and to-the-point.\n\n";
    context += "IMPORTANT: Users can type 'none' to skip any field and 'generate' at any time to create their resume.\n\n";
    
    context += `CURRENT STAGE: ${resumeData.interviewStage}\n`;
    context += `TECHNICAL JOB: ${resumeData.isJobTechnical ? 'Yes' : 'No'}\n\n`;
    
    context += "COLLECTED:\n";
    if (fields.includes('name')) context += `Name: ${resumeData.name}\n`;
    if (fields.includes('email')) context += `Email: ${resumeData.email}\n`;
    if (fields.includes('phone')) context += `Phone: ${resumeData.phone}\n`;
    if (fields.includes('linkedin')) context += `LinkedIn: ${resumeData.linkedin}\n`;
    if (fields.includes('github')) context += `GitHub: ${resumeData.github}\n`;
    
    if (fields.includes('education')) {
      context += "Education:\n";
      resumeData.education.forEach((edu, i) => {
        context += `- Education Entry ${i+1}: ${edu}\n`;
      });
    }
    
    if (fields.includes('experience')) {
      context += "Experience:\n";
      resumeData.experience.forEach((exp, i) => {
        context += `- Experience Entry ${i+1}: ${exp}\n`;
      });
    }
    
    if (fields.includes('skills')) {
      context += "Skills:\n";
      context += "- Technical Skills: " + (resumeData.skills.technical.length > 0 ? resumeData.skills.technical.join(", ") : "None") + "\n";
      context += "- Soft Skills: " + (resumeData.skills.soft.length > 0 ? resumeData.skills.soft.join(", ") : "None") + "\n";
      context += "- Languages: " + (resumeData.skills.languages.length > 0 ? resumeData.skills.languages.join(", ") : "None") + "\n";
    }
    
    if (fields.includes('projects')) {
      context += "Projects:\n";
      resumeData.projects.forEach((proj, i) => {
        context += `- Project ${i+1}: ${proj}\n`;
      });
    }
    
    if (fields.includes('certifications')) {
      context += "Certifications:\n";
      resumeData.certifications.forEach((cert, i) => {
        context += `- Certification ${i+1}: ${cert}\n`;
      });
    }
    
    // Guide the AI on what to ask next based on current stage
    context += "\nINSTRUCTION: ";
    
    switch(resumeData.interviewStage) {
      case INTERVIEW_STAGES.INTRO:
        context += "Ask about their job field to determine if it's a technical role, and explain we'll be collecting resume information step by step.\n";
        break;
      case INTERVIEW_STAGES.PERSONAL:
        if (!fields.includes('name'))
          context += "Ask for their name.\n";
        else if (!fields.includes('email'))
          context += "Ask for their email address.\n";
        else if (!fields.includes('phone'))
          context += "Ask for their phone number.\n";
        else if (!fields.includes('linkedin'))
          context += "Ask for their LinkedIn profile.\n";
        else if (resumeData.isJobTechnical && !fields.includes('github'))
          context += "Since this is a technical job, ask for their GitHub profile.\n";
        else
          context += "All personal information collected. Ask about their education now.\n";
        break;
      case INTERVIEW_STAGES.EDUCATION:
        if (resumeData.education.length === 0)
          context += "Ask for their education details (institution, degree, graduation year).\n";
        else
          context += `They've provided ${resumeData.education.length} education entries. Ask if they want to add another education entry or continue to experience.\n`;
        break;
      case INTERVIEW_STAGES.EXPERIENCE:
        if (resumeData.experience.length === 0)
          context += "Ask for their work experience (company, position, timeframe, responsibilities).\n";
        else
          context += `They've provided ${resumeData.experience.length} experience entries. Ask if they want to add another experience or continue to skills.\n`;
        break;
      case INTERVIEW_STAGES.SKILLS:
        context += "Ask for their skills, recommending they separate skills by commas or new lines.\n";
        break;
      case INTERVIEW_STAGES.PROJECTS:
        if (resumeData.projects.length === 0)
          context += "Ask for any notable projects they've worked on.\n";
        else
          context += `They've provided ${resumeData.projects.length} project entries. Ask if they want to add another project or continue to certifications.\n`;
        break;
      case INTERVIEW_STAGES.CERTIFICATIONS:
        if (resumeData.certifications.length === 0)
          context += "Ask for any certifications or professional development courses they've completed.\n";
        else
          context += `They've provided ${resumeData.certifications.length} certification entries. Ask if they want to add another certification or suggest generating the resume.\n`;
        break;
      case INTERVIEW_STAGES.FINAL:
        context += "All information collected. Tell them their resume is ready to generate and they should type 'generate' to create it.\n";
        break;
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isResumeRequest: true, 
          resumeData,
          message: '',
          useLatexTemplate: true // Signal to use LaTeX template
        }),
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

  const advanceToNextStage = () => {
    setResumeData(prev => {
      const updated = { ...prev };
      
      // Mark current field as collected with N/A if it wasn't already
      switch(prev.interviewStage) {
        case INTERVIEW_STAGES.INTRO:
          // Nothing to mark here
          break;
        case INTERVIEW_STAGES.PERSONAL:
          // Mark any missing personal fields as N/A
          if (!prev.collectedFields.includes('name')) {
            updated.name = 'N/A';
            updated.collectedFields = [...prev.collectedFields, 'name'];
          }
          if (!prev.collectedFields.includes('email')) {
            updated.email = 'N/A';
            updated.collectedFields = [...prev.collectedFields, 'email'];
          }
          if (!prev.collectedFields.includes('phone')) {
            updated.phone = 'N/A';
            updated.collectedFields = [...prev.collectedFields, 'phone'];
          }
          if (!prev.collectedFields.includes('linkedin')) {
            updated.linkedin = 'N/A';
            updated.collectedFields = [...prev.collectedFields, 'linkedin'];
          }
          if (updated.isJobTechnical && !prev.collectedFields.includes('github')) {
            updated.github = 'N/A';
            updated.collectedFields = [...prev.collectedFields, 'github'];
          }
          break;
        case INTERVIEW_STAGES.EDUCATION:
          if (!prev.collectedFields.includes('education')) {
            updated.education = ['N/A'];
            updated.collectedFields = [...prev.collectedFields, 'education'];
          }
          break;
        case INTERVIEW_STAGES.EXPERIENCE:
          if (!prev.collectedFields.includes('experience')) {
            updated.experience = ['N/A'];
            updated.collectedFields = [...prev.collectedFields, 'experience'];
          }
          break;
        case INTERVIEW_STAGES.SKILLS:
          if (!prev.collectedFields.includes('skills')) {
            updated.skills = {
              technical: ['N/A'],
              soft: ['N/A'],
              languages: ['N/A']
            };
            updated.collectedFields = [...prev.collectedFields, 'skills'];
          }
          break;
        case INTERVIEW_STAGES.PROJECTS:
          if (!prev.collectedFields.includes('projects')) {
            updated.projects = ['N/A'];
            updated.collectedFields = [...prev.collectedFields, 'projects'];
          }
          break;
        case INTERVIEW_STAGES.CERTIFICATIONS:
          if (!prev.collectedFields.includes('certifications')) {
            updated.certifications = ['N/A'];
            updated.collectedFields = [...prev.collectedFields, 'certifications'];
          }
          break;
      }
      
      // Move to next stage
      updated.interviewStage = prev.interviewStage + 1;
      if (updated.interviewStage > INTERVIEW_STAGES.FINAL) {
        // If we've gone through all stages, suggest generating
        const generatePromptId = `generate-prompt-${Date.now()}`;
        setMessages(prev => [...prev, { 
          id: generatePromptId,
          text: "All information collected! Type 'generate' to create your resume. ✨", 
          isUser: false 
        }]);
      }
      
      return updated;
    });
  };

  // Function to download PDF after waiting for content to render
  const downloadPDF = async () => {
    // Show loading notification
    const downloadingMessageId = `downloading-${Date.now()}`;
    setMessages(prev => [...prev, { 
      id: downloadingMessageId,
      text: "Preparing your PDF for download... ✨", 
      isUser: false 
    }]);
    
    // Wait for content to render fully
    setTimeout(() => {
      toPDF();
      
      // Replace loading with success message
      setMessages(prev => 
        prev.map(msg => 
          msg.id === downloadingMessageId
            ? { ...msg, text: "Your resume has been downloaded! 🎉" }
            : msg
        )
      );
    }, 500);
  };

  // Function to copy resume content to clipboard
  const copyToClipboard = () => {
    // Strip HTML tags for plain text copying
    const tempElement = document.createElement('div');
    tempElement.innerHTML = generatedResume;
    const plainText = tempElement.textContent || tempElement.innerText || '';
    
    navigator.clipboard.writeText(plainText).then(
      () => {
        const copyMessageId = `copy-${Date.now()}`;
        setMessages(prev => [...prev, { 
          id: copyMessageId,
          text: "Resume content copied to clipboard! 📋", 
          isUser: false 
        }]);
      },
      (err) => {
        console.error('Could not copy text: ', err);
        const errorMessageId = `copy-error-${Date.now()}`;
        setMessages(prev => [...prev, { 
          id: errorMessageId,
          text: "Oops! Couldn't copy to clipboard. Please try selecting and copying manually. 😅", 
          isUser: false 
        }]);
      }
    );
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-auto ${isDark ? 'text-white' : 'text-gray-900'}`}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-bold">Your ATS-Friendly Resume</h3>
              <button
                onClick={() => setShowResume(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Close resume preview"
                aria-label="Close resume preview"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div 
                ref={targetRef}
                className={`prose max-w-none ${isDark ? 'prose-invert' : ''} resume-content`}
                dangerouslySetInnerHTML={{ __html: generatedResume }}
              />
              
              <div className="flex flex-wrap justify-between mt-6 gap-2">
                <Button 
                  onClick={() => setShowResume(false)} 
                  variant="outline"
                >
                  Back to Chat
                </Button>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={copyToClipboard} 
                    variant="outline"
                  >
                    Copy to Clipboard
                  </Button>
                  
                  <Button 
                    onClick={downloadPDF} 
                    variant="primary"
                  >
                    Download PDF
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 