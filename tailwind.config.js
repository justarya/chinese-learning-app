/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': {
          500: '#3B82F6',
          600: '#2563EB',
        },
        'success-green': {
          500: '#10B981',
          600: '#059669',
        },
      },
    },
  },
  plugins: [],
}
