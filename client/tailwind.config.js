/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0F766E', // teal-700
          hover: '#115E59',
        },
        accent: '#F59E0B', // amber
        success: '#16A34A',
        warning: '#D97706',
        danger: '#DC2626',
        surface: {
          DEFAULT: '#FFFFFF',
          alt: '#F9FAFB'
        },
        text: {
          main: '#111827',
          muted: '#4B5563',
          light: '#6B7280'
        },
        border: '#E5E7EB'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        chip: '999px',
      }
    },
  },
  plugins: [],
}
