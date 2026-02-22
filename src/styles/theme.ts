// src/styles/theme.ts

// Exporting standard typography, spacing, and border radius tokens
export const typography = {
  fontFamily: 'System',
  fontWeight: '600' as const,
  letterSpacing: 1.2,
  h1: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: 1.5,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
  },
  body: {
    fontSize: 18,
    fontWeight: '500' as const,
    letterSpacing: 1.2,
    lineHeight: 28,
  },
  caption: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 1.2,
  }
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 36
};

export const borderRadius = {
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  circle: 9999
};

// Light Mode (Soft Day) - Warm, high contrast cream
export const lightColors = {
  background: '#FFF8E7',
  primary: '#FF6B35',
  secondary: '#3B82F6', // Blue accent
  tertiary: '#F59E0B',  // Yellow/Amber accent
  textPrimary: '#333333', // Softened from #1A1A1A
  textSecondary: '#666666',
  white: '#FFFFFF',
  border: '#E2DCD0',
  cardGlow: 'rgba(255, 107, 53, 0.15)', // Primary orange glow
  error: '#EF4444',
  success: '#10B981',
  nodeCompleted: '#F59E0B',
  nodeDefault: '#E5E7EB'
};

// Dark Mode (Premium Slate) - Slate grey with soft neon accents
export const darkColors = {
  background: '#1F2937', // Lightened from deep charcoal #121212
  primary: '#FF7A45',    // Softer vibrant orange for less eye strain
  secondary: '#818CF8',  // Soft indigo
  tertiary: '#FBBF24',   // Bright amber
  textPrimary: '#F9FAFB',// High contrast off-white
  textSecondary: '#9CA3AF',// Subtle grey
  white: '#374151',      // Lighter cards (#374151) instead of very dark (#1E1E24)
  border: '#4B5563',     // Lighter border instead of #374151
  cardGlow: 'rgba(255, 122, 69, 0.08)', // Very subtle orange glow
  error: '#FCA5A5',
  success: '#34D399',
  nodeCompleted: '#FDE68A',
  nodeDefault: '#6B7280' // Slightly lighter empty state
};

// We will default export a structure that ThemeContext will hydrate
export const theme = {
  colors: lightColors,
  typography,
  spacing,
  borderRadius
};
