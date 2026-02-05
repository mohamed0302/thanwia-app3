/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ألوان هادية لتطبيق تعليمي
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        surface: {
          DEFAULT: '#f8fafc',
          card: '#ffffff',
          muted: '#f1f5f9',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 8px rgba(0,0,0,0.06)',
        card: '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
