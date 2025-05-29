/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'laptop': '1600px',
      },
      fontFamily: {
        'display': ['Wix Madefor Display', 'sans-serif'],
      },
      colors: {
        'deep-blue': '#15137C',
        'accent-blue': '#4C6FFF',
        'input-blue': '#EEF2FF',
        'dark-blue': '#101568',
      },
      fontSize: {
        'head': '30px',
        'subhead': '18px',
        'label': '16px',
      },
      maxWidth: {
        'container': '1200px',
      },
      keyframes: {
        slideUpFadeIn: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        fadeInScale: {
          '0%': {
            opacity: '0',
            transform: 'scale(0.8)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      },
      animation: {
        slideUpFadeIn: 'slideUpFadeIn 0.6s ease-out',
        fadeInScale: 'fadeInScale 0.5s ease-out'
      }
    },
  },
  plugins: [],
} 