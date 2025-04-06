'use client';

import React, { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../ThemeProvider';
import { colors } from '../../utils/designSystem';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'glass' | 'neon';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) => {
  const { isDark } = useTheme();

  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-2.5 text-lg',
    xl: 'px-6 py-3 text-xl',
  };
  
  const variantStyles = {
    primary: `bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:shadow-md hover:from-primary-700 hover:to-primary-600 active:from-primary-800 active:to-primary-700 focus:ring-primary-500 ${isDark ? 'shadow-lg shadow-primary-500/20' : ''}`,
    
    secondary: `bg-gradient-to-r from-secondary-600 to-secondary-500 text-white hover:shadow-md hover:from-secondary-700 hover:to-secondary-600 active:from-secondary-800 active:to-secondary-700 focus:ring-secondary-500 ${isDark ? 'shadow-lg shadow-secondary-500/20' : ''}`,
    
    accent: `bg-gradient-to-r from-accent-600 to-accent-500 text-white hover:shadow-md hover:from-accent-700 hover:to-accent-600 active:from-accent-800 active:to-accent-700 focus:ring-accent-500 ${isDark ? 'shadow-lg shadow-accent-500/20' : ''}`,
    
    outline: `border-2 border-primary-500 ${isDark ? 'text-primary-300' : 'text-primary-600'} hover:bg-primary-50 dark:hover:bg-primary-900/20 active:bg-primary-100 dark:active:bg-primary-900/30 focus:ring-primary-500`,
    
    ghost: `${isDark ? 'text-gray-200 hover:bg-gray-800' : 'text-gray-700 hover:bg-gray-100'} hover:text-primary-600 active:bg-gray-200 dark:active:bg-gray-700 focus:ring-gray-500`,
    
    glass: `backdrop-filter backdrop-blur-lg ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-black/5 text-gray-900 hover:bg-black/10'} border border-white/20 shadow-sm hover:shadow focus:ring-white/30`,
    
    neon: `relative overflow-hidden text-white ${isDark ? 'bg-primary-600' : 'bg-primary-500'} hover:shadow-lg hover:shadow-primary-500/50 before:absolute before:-inset-1 before:block before:rounded-lg before:bg-primary-400 before:opacity-0 hover:before:opacity-30 before:transition focus:ring-primary-400`,
  };

  // Handle loading state
  const loadingSpinner = (
    <svg className="w-5 h-5 mr-2 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  const buttonContent = (
    <>
      {loading && loadingSpinner}
      {icon && iconPosition === 'left' && !loading && <span className="mr-2">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
    </>
  );

  // Use a standard button instead of motion.button to avoid type errors
  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${fullWidth ? 'w-full' : ''} ${className} transform hover:scale-[1.02] active:scale-[0.98] transition-transform`}
      disabled={loading || props.disabled}
      {...props}
    >
      {buttonContent}
    </button>
  );
}; 