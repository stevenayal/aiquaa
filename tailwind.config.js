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
          DEFAULT: "#49e3b3",       // Verde agua del logo
          dark: "#1e1e1e",          // Fondo oscuro general
          light: "#ffffff",         // Texto claro / botones
          muted: "#d1f7ec",         // Hover / cards suaves
          accent: "#006f5f",        // Para CTA o enlaces importantes
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
      },
    },
  },
  plugins: [],
} 