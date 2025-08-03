/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4ADE80",       // Soft green (accent)
          dark: "#0F172A",          // Navy Blue (header/footer)
          light: "#ffffff",         // Texto claro / botones
          muted: "#F8FAFC",         // Fondo general claro
          accent: "#059669",        // Verde más oscuro para hover
          background: "#F8FAFC",    // Fondo general
          text: "#0F172A",          // Texto oscuro
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
} 