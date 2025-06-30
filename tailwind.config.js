/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#005f9e',
          dark: '#004c7e',
        },
        secondary: '#333333',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
} 