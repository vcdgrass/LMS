/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5', // indigo-600
          light: '#818cf8', // indigo-400
          dark: '#3730a3', // indigo-800
        }
      }
    },
  },
  plugins: [],
}