/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Hanken Grotesk"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Bricolage Grotesque"', '"Hanken Grotesk"', 'ui-sans-serif', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50: '#ecfdf8',
          100: '#d1faee',
          200: '#a6f3dd',
          300: '#6be6c8',
          400: '#33d0ad',
          500: '#12b392',
          600: '#0a9079',
          700: '#0b7463',
          800: '#0d5c4f',
          900: '#0e4c42',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e1',
          300: '#b0b7c5',
          400: '#8791a4',
          500: '#687388',
          600: '#525b6e',
          700: '#434a5a',
          800: '#2b303c',
          900: '#191c25',
          950: '#0f1117',
        },
      },
      borderRadius: { '2xl': '1rem', '3xl': '1.5rem' },
    },
  },
  plugins: [],
};
