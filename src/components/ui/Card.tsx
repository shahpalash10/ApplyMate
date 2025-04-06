'use client';

import React, { ReactNode } from 'react';
import { useTheme } from '../ThemeProvider';
import { glassMorphismStyles, neuMorphismStyles } from '../../utils/designSystem';

export type CardVariant = 'default' | 'glass' | 'neumorphic' | 'gradient';
export type CardElevation = 'flat' | 'low' | 'medium' | 'high';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  elevation?: CardElevation;
  hoverEffect?: boolean;
  className?: string;
  onClick?: () => void;
  animated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  elevation = 'medium',
  hoverEffect = false,
  className = '',
  onClick,
  animated = true,
}) => {
  const { isDark } = useTheme();
  
  // Common styles
  const baseStyles = 'rounded-xl overflow-hidden';
  
  // Elevation styles
  const elevationStyles = {
    flat: 'shadow-none',
    low: `${isDark ? 'shadow-md shadow-black/20' : 'shadow-sm shadow-black/10'}`,
    medium: `${isDark ? 'shadow-lg shadow-black/30' : 'shadow-md shadow-black/15'}`,
    high: `${isDark ? 'shadow-xl shadow-black/40' : 'shadow-lg shadow-black/20'}`,
  };
  
  // Variant styles
  const variantStyles = {
    default: `${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`,
    glass: `${isDark ? 'backdrop-blur-md bg-black/40 border border-gray-800/80' : 'backdrop-blur-md bg-white/70 border border-white/80'}`,
    neumorphic: isDark 
      ? 'bg-gray-800 shadow-[5px_5px_10px_#0f1621,-5px_-5px_10px_#1f2937]' 
      : 'bg-gray-50 shadow-[5px_5px_10px_#d4d4d8,-5px_-5px_10px_#ffffff]',
    gradient: isDark 
      ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800 border border-gray-700' 
      : 'bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200',
  };
  
  // Hover effect
  const hoverStyles = hoverEffect
    ? isDark
      ? 'hover:shadow-xl hover:shadow-primary-900/10 transition-shadow hover:-translate-y-1 transition-transform duration-200 cursor-pointer'
      : 'hover:shadow-xl hover:shadow-black/5 transition-shadow hover:-translate-y-1 transition-transform duration-200 cursor-pointer'
    : '';

  // Apply glass morphism or neumorphism styles directly if those variants are selected
  let styles = `${baseStyles} ${elevationStyles[elevation]} ${variantStyles[variant]} ${hoverStyles} ${className}`;
  
  if (variant === 'glass') {
    const glassStyles = isDark ? glassMorphismStyles.dark : glassMorphismStyles.light;
    styles = `${baseStyles} ${hoverStyles} ${className}`;
    const inlineStyles = {
      background: glassStyles.background,
      backdropFilter: glassStyles.backdropFilter,
      border: glassStyles.border,
      boxShadow: glassStyles.boxShadow,
    };
    
    return (
      <div className={styles} style={inlineStyles} onClick={onClick}>
        {children}
      </div>
    );
  }
  
  if (variant === 'neumorphic') {
    const neuStyles = isDark ? neuMorphismStyles.dark : neuMorphismStyles.light;
    styles = `${baseStyles} ${hoverStyles} ${className}`;
    const inlineStyles = {
      background: neuStyles.background,
      boxShadow: neuStyles.boxShadow,
      borderRadius: neuStyles.borderRadius,
    };
    
    return (
      <div className={styles} style={inlineStyles} onClick={onClick}>
        {children}
      </div>
    );
  }
  
  // For default and gradient variants
  return (
    <div className={styles} onClick={onClick}>
      {children}
    </div>
  );
}; 