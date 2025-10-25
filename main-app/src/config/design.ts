export const designTokens = {
  colors: {
    primary: {
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
    },
    neutral: {
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      500: '#64748b',
      700: '#334155',
      800: '#1e293b',
    }
  },
  spacing: {
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  }
} as const;

export const utils = {
  cn: (...classes: string[]) => classes.join(' ')
};
