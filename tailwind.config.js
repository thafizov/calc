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
      },
      fontSize: {
        'head': '30px',
        'subhead': '18px',
        'label': '16px',
      },
      maxWidth: {
        'container': '1200px',
      },
    },
  },
  plugins: [],
} 