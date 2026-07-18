/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './pages/**/*.html', './scripts/**/*.ts'],
  theme: {
    extend: {
      colors: {
        bg: '#0A0A0A',
        surface: '#111111',
        'surface-raised': '#1A1A1A',
        border: '#222222',
        'text-primary': '#FFFFFF',
        'text-secondary': '#A0A0A0',
        'text-muted': '#666666',
        accent: {
          cyan: '#00E5FF',
          magenta: '#FF00A0',
          gold: '#FFD700',
        },
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
};