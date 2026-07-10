/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fener: {
          navy: '#00285E',
          'navy-dark': '#001B40',
          'navy-light': '#123C77',
          yellow: '#FFED00',
          'yellow-dark': '#B39B00',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
