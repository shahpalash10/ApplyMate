/**
 * Utilities for safely accessing environment variables and API configurations
 */

/**
 * Gets the Gemini API key from environment variables, checking multiple possible names
 * @returns The API key if available, empty string otherwise
 */
export const getGeminiApiKey = (): string => {
  return process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
};

/**
 * Checks if the Gemini API is properly configured
 * @returns True if the API key is available, false otherwise
 */
export const isGeminiConfigured = (): boolean => {
  return !!getGeminiApiKey();
};

/**
 * Logs a warning if the API key is missing
 */
export const checkApiConfiguration = (): void => {
  if (!isGeminiConfigured()) {
    console.warn('⚠️ No Gemini API key found in environment variables. AI features will not work properly.');
  }
};

/**
 * Configuration object for Gemini API
 */
export const geminiConfig = {
  modelName: 'gemini-1.5-flash',
  maxOutputTokens: 2048,
  temperature: 0.7,
  topP: 0.8,
};

// Log warning during module initialization
checkApiConfiguration(); 