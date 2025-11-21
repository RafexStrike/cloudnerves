import type { Config } from 'tailwindcss';
import daisyui from 'daisyui';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9333ea', // Purple
        'primary-dark': '#6b21a8', // Darker purple
        'primary-light': '#a855f7', // Lighter purple
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        cloudnerves: {
          primary: '#9333ea',
          'primary-content': '#ffffff',
          secondary: '#6b21a8',
          'secondary-content': '#ffffff',
          accent: '#a855f7',
          'accent-content': '#000000',
          neutral: '#1f2937',
          'neutral-content': '#f3f4f6',
          'base-100': '#111827',
          'base-200': '#1f2937',
          'base-300': '#374151',
          'base-content': '#f3f4f6',
          info: '#0ea5e9',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        },
      },
    ],
    darkMode: 'class',
    defaultTheme: 'cloudnerves',
  },
};

export default config;
