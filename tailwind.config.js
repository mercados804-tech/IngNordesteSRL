/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        corporate: {
          red: "#B22222",
          gold: "#D4AF37", // Restaurado color dorado
          gray: "#f5f5f5",
          white: "#ffffff",
          dark: "#1a1a1a",
        }
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.7)), url('https://images.unsplash.com/photo-1541913080213-48119e70621c?auto=format&fit=crop&q=80')",
      }
    },
  },
  plugins: [],
}
