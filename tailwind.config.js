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
        dark: '#020617'        // contraste profundo
      }
    },
  },
  plugins: [],
} 