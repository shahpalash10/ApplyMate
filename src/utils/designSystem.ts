export const colors = {
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Main primary
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },
  secondary: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6', // Main secondary
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
    950: '#042f2e',
  },
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Main accent
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e',
  },
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  background: {
    light: '#f8fafc',
    dark: '#0f172a',
  },
  glass: {
    light: 'rgba(255, 255, 255, 0.8)',
    dark: 'rgba(15, 23, 42, 0.8)',
  },
  text: {
    light: {
      primary: '#1e293b',
      secondary: '#64748b',
      tertiary: '#94a3b8',
    },
    dark: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      tertiary: '#94a3b8',
    },
  },
  gradient: {
    primary: 'linear-gradient(to right, #4f46e5, #7c3aed)',
    secondary: 'linear-gradient(to right, #14b8a6, #0ea5e9)',
    accent: 'linear-gradient(to right, #d946ef, #ec4899)',
    background: {
      light: 'linear-gradient(to bottom right, #eef2ff, #e0f2fe)',
      dark: 'linear-gradient(to bottom right, #0f172a, #1e1b4b)',
    },
    button: 'linear-gradient(to right, #4f46e5, #6366f1, #7c3aed)',
    card: {
      light: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7))',
      dark: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(30, 41, 59, 0.7))',
    },
  },
  shadow: {
    light: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    dark: '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.15)',
    neon: {
      primary: '0 0 15px rgba(99, 102, 241, 0.5)',
      secondary: '0 0 15px rgba(20, 184, 166, 0.5)',
      accent: '0 0 15px rgba(217, 70, 239, 0.5)',
    },
  },
  border: {
    light: '#e2e8f0',
    dark: '#334155',
  },
};

export const typography = {
  fontFamily: {
    sans: [
      'Inter',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
      'sans-serif',
    ].join(','),
    mono: [
      'JetBrains Mono',
      'Menlo',
      'Monaco',
      'Consolas',
      'Liberation Mono',
      'Courier New',
      'monospace',
    ].join(','),
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
    '8xl': '6rem',
    '9xl': '8rem',
  },
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
};

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
};

export const borderRadius = {
  none: '0',
  sm: '0.125rem',
  DEFAULT: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
};

export const animations = {
  transition: {
    default: 'all 0.3s ease',
    fast: 'all 0.15s ease',
    slow: 'all 0.5s ease',
  },
  easing: {
    default: [0.25, 0.1, 0.25, 1],
    easeIn: [0.42, 0, 1, 1],
    easeOut: [0, 0, 0.58, 1],
    easeInOut: [0.42, 0, 0.58, 1],
    spring: [0.175, 0.885, 0.32, 1.275],
  },
  duration: {
    fastest: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    slowest: 0.8,
  },
  keyframes: {
    fadeIn: {
      '0%': { opacity: 0 },
      '100%': { opacity: 1 },
    },
    fadeOut: {
      '0%': { opacity: 1 },
      '100%': { opacity: 0 },
    },
    slideInRight: {
      '0%': { transform: 'translateX(100%)' },
      '100%': { transform: 'translateX(0)' },
    },
    slideInLeft: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(0)' },
    },
    slideInUp: {
      '0%': { transform: 'translateY(100%)' },
      '100%': { transform: 'translateY(0)' },
    },
    slideInDown: {
      '0%': { transform: 'translateY(-100%)' },
      '100%': { transform: 'translateY(0)' },
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    bounce: {
      '0%, 100%': {
        transform: 'translateY(0)',
        animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)',
      },
      '50%': {
        transform: 'translateY(-25%)',
        animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
    spin: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' },
    },
    ping: {
      '75%, 100%': {
        transform: 'scale(2)',
        opacity: 0,
      },
    },
    float: {
      '0%, 100%': { transform: 'translateY(0)' },
      '50%': { transform: 'translateY(-10px)' },
    },
    shimmer: {
      '0%': { backgroundPosition: '-200% 0' },
      '100%': { backgroundPosition: '200% 0' },
    },
  },
};

// Glass morphism styles for light and dark modes
export const glassMorphismStyles = {
  light: {
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.1)',
  },
  dark: {
    background: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)',
  },
};

// Neumorphism styles for light and dark modes
export const neuMorphismStyles = {
  light: {
    background: '#f0f4f8',
    boxShadow: '5px 5px 10px #d4d4d8, -5px -5px 10px #ffffff',
    borderRadius: '16px',
  },
  dark: {
    background: '#1f2937',
    boxShadow: '5px 5px 10px #0f1621, -5px -5px 10px #2f3b4d',
    borderRadius: '16px',
  },
};

// Theme configuration for light/dark mode
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  background: string;
  textPrimary: string;
  textSecondary: string;
  cardBackground: string;
  cardBorder: string;
  inputBackground: string;
  buttonGradient: string;
  glassMorphism: typeof glassMorphismStyles.light | typeof glassMorphismStyles.dark;
  neuMorphism: typeof neuMorphismStyles.light | typeof neuMorphismStyles.dark;
}

export const themeConfig: Record<ThemeMode, ThemeConfig> = {
  light: {
    background: colors.background.light,
    textPrimary: colors.text.light.primary,
    textSecondary: colors.text.light.secondary,
    cardBackground: 'rgba(255, 255, 255, 0.8)',
    cardBorder: colors.border.light,
    inputBackground: 'rgba(255, 255, 255, 0.9)',
    buttonGradient: colors.gradient.button,
    glassMorphism: glassMorphismStyles.light,
    neuMorphism: neuMorphismStyles.light,
  },
  dark: {
    background: colors.background.dark,
    textPrimary: colors.text.dark.primary,
    textSecondary: colors.text.dark.secondary,
    cardBackground: 'rgba(30, 41, 59, 0.8)',
    cardBorder: colors.border.dark,
    inputBackground: 'rgba(30, 41, 59, 0.9)',
    buttonGradient: colors.gradient.button,
    glassMorphism: glassMorphismStyles.dark,
    neuMorphism: neuMorphismStyles.dark,
  },
};

// Media breakpoints (sync with Tailwind's defaults)
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Z-index values to maintain consistent stacking
export const zIndices = {
  base: 0,
  elevated: 1,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modalBackdrop: 1300,
  modal: 1400,
  popover: 1500,
  tooltip: 1600,
  toast: 1700,
}; 