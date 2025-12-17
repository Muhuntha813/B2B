// Design tokens for B2B Plastics SRM
export const tokens = {
  colors: {
    // Primary palette - Blue tones
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main primary
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },
    
    // Secondary palette - Green tones
    secondary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main secondary
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    
    // Accent colors
    accent: {
      blue: '#0ea5ff', // Current primary
      green: '#10b981',
      teal: '#14b8a6',
    },
    
    // Neutral palette
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
    
    // Semantic colors
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    
    // Background colors
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      tertiary: '#f1f5f9',
      accent: '#f4f7fb', // Current background
    },
    
    // Text colors
    text: {
      primary: '#1f2937',
      secondary: '#4b5563',
      tertiary: '#6b7280',
      inverse: '#ffffff',
      accent: '#3b82f6',
    },
    
    // Border colors
    border: {
      light: '#e5e7eb',
      medium: '#d1d5db',
      dark: '#9ca3af',
      accent: '#3b82f6',
    }
  },
  
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  typography: {
    fontFamily: {
      primary: ['Inter', 'sans-serif'],
      heading: ['Poppins', 'sans-serif'],
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
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    }
  },
  
  transitions: {
    fast: '150ms ease-in-out',
    normal: '200ms ease-in-out',
    slow: '300ms ease-in-out',
  }
}

// CSS Custom Properties for runtime theme switching
export const cssVariables = {
  '--color-primary': tokens.colors.primary[500],
  '--color-primary-hover': tokens.colors.primary[600],
  '--color-secondary': tokens.colors.secondary[500],
  '--color-secondary-hover': tokens.colors.secondary[600],
  '--color-accent-blue': tokens.colors.accent.blue,
  '--color-accent-green': tokens.colors.accent.green,
  '--color-background': tokens.colors.background.primary,
  '--color-background-secondary': tokens.colors.background.secondary,
  '--color-background-accent': tokens.colors.background.accent,
  '--color-text-primary': tokens.colors.text.primary,
  '--color-text-secondary': tokens.colors.text.secondary,
  '--color-border': tokens.colors.border.light,
  '--color-success': tokens.colors.success,
  '--color-warning': tokens.colors.warning,
  '--color-error': tokens.colors.error,
  '--color-info': tokens.colors.info,
}

export default tokens