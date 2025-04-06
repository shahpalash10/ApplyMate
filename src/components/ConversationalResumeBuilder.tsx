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
  education: string;
  experience: string;
  skills: string;
  projects: string;
  certifications: string;
  currentField: string;
  collectedFields: string[];
}

const initialResumeData: ResumeData = {
  name: '',
  email: '',
  phone: '',
  linkedin: '',
  education: '',
  experience: '',
  skills: '',
  projects: '',
  certifications: '',
  currentField: 'intro',
  collectedFields: []
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
        const optional = ["linkedin", "projects", "certifications"];
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
    // This is a basic extraction - Gemini will handle the actual conversational flow
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
      // For other fields, we'll let Gemini guide the conversation
      // If the message is more than 30 chars, it might be a detailed response about education/experience/etc.
      else if (message.length > 30) {
        if (!prev.collectedFields.includes('education') && 
            (lowerMessage.includes('university') || lowerMessage.includes('college') || 
             lowerMessage.includes('degree') || lowerMessage.includes('school'))) {
          updated.education = message;
          updated.collectedFields = [...prev.collectedFields, 'education'];
        }
        else if (!prev.collectedFields.includes('experience') && 
                 (lowerMessage.includes('work') || lowerMessage.includes('job') || 
                  lowerMessage.includes('company') || lowerMessage.includes('position'))) {
          updated.experience = message;
          updated.collectedFields = [...prev.collectedFields, 'experience'];
        }
        else if (!prev.collectedFields.includes('skills') && 
                 (lowerMessage.includes('skill') || lowerMessage.includes('proficient') || 
                  lowerMessage.includes('expertise'))) {
          updated.skills = message;
          updated.collectedFields = [...prev.collectedFields, 'skills'];
        }
        else if (!prev.collectedFields.includes('projects') && 
                 (lowerMessage.includes('project') || lowerMessage.includes('built') || 
                  lowerMessage.includes('created') || lowerMessage.includes('developed'))) {
          updated.projects = message;
          updated.collectedFields = [...prev.collectedFields, 'projects'];
        }
        else if (!prev.collectedFields.includes('certifications') && 
                 (lowerMessage.includes('certification') || lowerMessage.includes('certified') || 
                  lowerMessage.includes('certificate'))) {
          updated.certifications = message;
          updated.collectedFields = [...prev.collectedFields, 'certifications'];
        }
        // Look for location information in the message
        else if (message.length > 10 && 
                 (lowerMessage.includes('live in') || lowerMessage.includes('located in') || 
                  lowerMessage.includes('based in') || lowerMessage.includes('from '))) {
          // If there's a location in the message, add it to the experience field for the resume generator
          // This is a simple approach - the AI will extract the location when generating the resume
          if (!prev.collectedFields.includes('experience')) {
            updated.experience = `Location: ${message}`;
            updated.collectedFields = [...prev.collectedFields, 'experience'];
          } else {
            updated.experience = `${prev.experience}. Location: ${message}`;
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
    if (fields.includes('education')) context += `Education: ${resumeData.education}\n`;
    if (fields.includes('experience')) context += `Experience: ${resumeData.experience}\n`;
    if (fields.includes('skills')) context += `Skills: ${resumeData.skills}\n`;
    if (fields.includes('projects')) context += `Projects: ${resumeData.projects}\n`;
    if (fields.includes('certifications')) context += `Certifications: ${resumeData.certifications}\n`;
    
    context += "\nMISSING:\n";
    const missing: string[] = [];
    if (!fields.includes('name')) missing.push("Name");
    if (!fields.includes('email')) missing.push("Email");
    if (!fields.includes('phone')) missing.push("Phone");
    if (!fields.includes('education')) missing.push("Education");
    if (!fields.includes('experience')) missing.push("Experience");
    if (!fields.includes('skills')) missing.push("Skills");
    if (!fields.includes('linkedin')) missing.push("LinkedIn (optional)");
    if (!fields.includes('projects')) missing.push("Projects (optional)");
    if (!fields.includes('certifications')) missing.push("Certifications (optional)");
    
    context += missing.join(", ") + "\n\n";
    
    if (isReadyToGenerateResume()) {
      context += "INSTRUCTION: All essential info collected. Suggest generating the resume now.\n";
    } else {
      const required: string[] = ["Name", "Email", "Phone", "Education", "Experience", "Skills"];
      const missingRequired = required.filter(item => missing.includes(item) || missing.includes(`${item} (optional)`));
      if (missingRequired.length > 0) {
        context += `INSTRUCTION: Ask for ${missingRequired[0]} specifically. Remind they can type 'none' to skip.\n`;
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
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          isResumeRequest: true, 
          resumeData,
          message: '' 
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
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>
                  {generatedResume}
                </ReactMarkdown>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                onClick={() => setShowResume(false)} 
                variant="outline"
              >
                Back to Chat
              </Button>
              <Button 
                onClick={() => toPDF()} 
                variant="primary"
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 