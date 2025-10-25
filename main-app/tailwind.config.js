/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        'cta-start': '#4da6ff',
        'cta-end': '#0b3d91'
      },
      boxShadow: {
        'card': '0 6px 18px rgba(11,18,32,0.06)'
      }
    }
  },
  plugins: []
}
