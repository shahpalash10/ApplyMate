'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the ThemeMode type
type ThemeMode = 'light' | 'dark';

type ThemeContextType = {
  theme: ThemeMode;
  toggleTheme: () => void;
  isDark: boolean;
};

// Create context with a default value to avoid the undefined check
const defaultThemeContext: ThemeContextType = {
  theme: 'light',
  toggleTheme: () => {}, // Will be overridden
  isDark: false,
};

const ThemeContext = createContext<ThemeContextType>(defaultThemeContext);

export const useTheme = () => {
  return useContext(ThemeContext);
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Initialize theme from localStorage or use system preference as fallback
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [mounted, setMounted] = useState(false);

  // Effect to handle initial theme setup
  useEffect(() => {
    // Get theme from localStorage or use system preference
    const storedTheme = localStorage.getItem('theme') as ThemeMode | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (storedTheme) {
      setTheme(storedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
    
    setMounted(true);
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // Apply theme to document
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Effect to update document class when theme changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Apply styles to the body based on current theme
  useEffect(() => {
    if (!mounted) return;
    
    const body = document.body;
    
    if (theme === 'dark') {
      body.style.backgroundColor = 'hsl(222.2 84% 4.9%)';
      body.style.color = 'hsl(210 40% 98%)';
    } else {
      body.style.backgroundColor = 'hsl(0 0% 100%)';
      body.style.color = 'hsl(222.2 84% 4.9%)';
    }
    
    // Add gradient background
    body.style.backgroundImage = theme === 'dark' 
      ? 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15), transparent 30%), radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.1), transparent 30%)'
      : 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.1), transparent 30%), radial-gradient(circle at 90% 90%, rgba(236, 72, 153, 0.05), transparent 30%)';
    
    body.style.transition = 'background 0.5s ease, color 0.5s ease';
  }, [theme, mounted]);

  // Create context value
  const contextValue: ThemeContextType = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {mounted ? children : 
        <div style={{ visibility: 'hidden' }}>
          {children}
        </div>
      }
    </ThemeContext.Provider>
  );
}; 