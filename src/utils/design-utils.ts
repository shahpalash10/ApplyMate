/**
 * Common utility functions for design and styling
 */

// Function to get contrasting text color (black/white) based on background color
export function getContrastColor(hexColor: string): 'black' | 'white' {
  // Remove the hash
  const color = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for bright colors, white for dark colors
  return luminance > 0.5 ? 'black' : 'white';
}

// Function to lighten or darken a color by percent
export function shadeColor(color: string, percent: number): string {
  let R = parseInt(color.substring(1, 3), 16);
  let G = parseInt(color.substring(3, 5), 16);
  let B = parseInt(color.substring(5, 7), 16);

  R = Math.round(R * (100 + percent) / 100);
  G = Math.round(G * (100 + percent) / 100);
  B = Math.round(B * (100 + percent) / 100);

  R = R < 255 ? R : 255;
  G = G < 255 ? G : 255;
  B = B < 255 ? B : 255;

  R = R > 0 ? R : 0;
  G = G > 0 ? G : 0;
  B = B > 0 ? B : 0;

  const RR = R.toString(16).length === 1 ? `0${R.toString(16)}` : R.toString(16);
  const GG = G.toString(16).length === 1 ? `0${G.toString(16)}` : G.toString(16);
  const BB = B.toString(16).length === 1 ? `0${B.toString(16)}` : B.toString(16);

  return `#${RR}${GG}${BB}`;
}

// Function to convert HSL values to RGB
export function hslToRgb(h: number, s: number, l: number): string {
  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Function to generate a gradient string
export function createGradient(startColor: string, endColor: string, direction = 'to right'): string {
  return `linear-gradient(${direction}, ${startColor}, ${endColor})`;
}

// Scale values for responsive design
export function scaleValue(value: number, fromScale: number, toScale: number): number {
  return (value / fromScale) * toScale;
}

// Generate rgba color with opacity
export function rgba(hexColor: string, alpha: number): string {
  const color = hexColor.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Utility to create consistent shadow values
export function createShadow(elevation: 'sm' | 'md' | 'lg' | 'xl', colorBase = '#000000'): string {
  const opacity = {
    sm: 0.05,
    md: 0.1,
    lg: 0.15,
    xl: 0.2,
  };
  
  const sizes = {
    sm: '0 1px 2px 0',
    md: '0 4px 6px -1px, 0 2px 4px -1px',
    lg: '0 10px 15px -3px, 0 4px 6px -2px',
    xl: '0 20px 25px -5px, 0 10px 10px -5px',
  };
  
  if (elevation === 'md' || elevation === 'lg' || elevation === 'xl') {
    const sizeParts = sizes[elevation].split(', ');
    const color1 = rgba(colorBase, opacity[elevation]);
    const color2 = rgba(colorBase, opacity[elevation] / 2);
    return `${sizeParts[0]} ${color1}, ${sizeParts[1]} ${color2}`;
  }
  
  return `${sizes[elevation]} ${rgba(colorBase, opacity[elevation])}`;
} 