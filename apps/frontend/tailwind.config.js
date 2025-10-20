/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        // Brand colors used in components
        brand: {
          primary: '#1e40af',
          secondary: '#3b82f6',
          accent: '#f59e0b',
          light: '#f8fafc',
          dark: '#1e293b',
          text: '#334155',
          muted: '#64748b',
          background: '#ffffff',
        },
        // Dark theme colors
        dark: {
          primary: '#1e293b',
          secondary: '#334155',
          background: '#0f172a',
          text: '#f1f5f9',
          muted: '#94a3b8',
          accent: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Sora', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
