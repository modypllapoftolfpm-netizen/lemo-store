/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/pages/admin/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'lemo-cream': '#FAF7F2',
        'lemo-beige': '#E8DDD0',
        'lemo-nude': '#D4B896',
        'lemo-gold': '#C9A96E',
        'lemo-dark': '#3D2B1F',
        'lemo-text': '#2C1810',
        'lemo-muted': '#8B7355',
      }
    },
  },
  plugins: [],
}