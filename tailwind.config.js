/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Sora', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: '#0F172A',    // fondo oscuro moderno
        accent: '#4ADE80',     // verde lima elegante
        neutral: '#F8FAFC',    // texto claro
        dark: '#020617',       // contraste profundo
        // Brand color mappings to maintain compatibility
        brand: '#0F172A',      // same as primary
        'brand-dark': '#020617', // same as dark
        'brand-light': '#F8FAFC', // same as neutral
        'brand-accent': '#4ADE80', // same as accent
        'brand-text': '#0F172A',   // same as primary
        'brand-muted': '#64748B',  // muted text color
        'brand-background': '#0F172A' // same as primary
      }
    },
  },
  plugins: [],
} 