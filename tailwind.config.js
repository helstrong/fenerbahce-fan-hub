/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        fener: {
          navy: '#00285E', // card / raised surface
          'navy-dark': '#001B40', // app background
          'navy-deep': '#001430', // bottom nav, sits under the background
          'navy-light': '#123C77',
          'navy-glow': '#0A3573', // lit top edge of the hero gradients
          yellow: '#FFED00',
          'yellow-dark': '#B39B00',
        },
        // Result colours, named so W/D/L reads the same everywhere it appears.
        result: {
          win: '#22C55E',
          loss: '#EF4444',
          draw: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
