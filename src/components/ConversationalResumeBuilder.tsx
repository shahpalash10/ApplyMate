"use client";

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { usePDF } from 'react-to-pdf';

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
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-200px)] bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-xl overflow-hidden border border-gray-200">
      <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <h2 className="text-2xl font-bold tracking-tight flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Resume Wizard ✨
        </h2>
        <p className="text-blue-100 mt-1">Let's craft an amazing resume through a fun conversation!</p>
      </div>
      
      <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
        <div className="space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} items-start`}
            >
              {!message.isUser && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white mr-3 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
              )}
              
              <div
                className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  message.isUser
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                } ${message.isLoading ? 'min-w-[100px]' : ''}`}
              >
                {message.isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-2.5 w-2.5 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="h-2.5 w-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2.5 w-2.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.text}</ReactMarkdown>
                  </div>
                )}
              </div>
              
              {message.isUser && (
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white ml-3 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>
      
      {showResume && (
        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Your ATS-Friendly Resume
            </h3>
            <button
              onClick={() => toPDF()}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download ATS-Friendly PDF
            </button>
          </div>
          <div 
            ref={targetRef} 
            className="border border-gray-200 rounded-lg p-8 bg-white max-h-[600px] overflow-y-auto shadow-inner mt-4"
          >
            <div className="prose prose-black text-black max-w-none pt-4 prose-headings:mb-4 prose-headings:mt-6 prose-p:my-2 prose-li:my-0 prose-h1:text-3xl prose-h2:text-xl prose-h2:border-b prose-h2:pb-2 prose-h2:border-gray-200">
              <ReactMarkdown>{generatedResume}</ReactMarkdown>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={resetBuilder}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Create New Resume
            </button>
          </div>
        </div>
      )}
      
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="flex space-x-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isTyping ? "Wait..." : "Type your answer here..."}
            className="flex-1 border border-gray-300 rounded-full px-6 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm bg-gray-50"
            disabled={isGeneratingResume || isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isGeneratingResume || isTyping}
            className={`rounded-full p-3 shadow-md transition-all duration-200 flex items-center justify-center ${
              !inputMessage.trim() || isGeneratingResume || isTyping
                ? 'bg-gray-300 text-gray-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700'
            }`}
          >
            {isGeneratingResume ? (
              <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <p className="text-gray-500 text-sm text-center my-4">Don&apos;t see the right sections? Just tell me what you want to include.</p>
    </div>
  );
} 