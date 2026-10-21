/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FAF9F6',
          50: '#FFFFFF',
          100: '#FAF9F6',
          200: '#F3EFE6',
          300: '#E8E2D5',
        },
        gold: {
          DEFAULT: '#B8863B',
          50: '#FBF6EE',
          100: '#F4E8D3',
          200: '#E6CDA2',
          300: '#D5AD6C',
          400: '#C7964B',
          500: '#B8863B',
          600: '#9B6D29',
          700: '#7B541C',
          800: '#5C3E14',
          900: '#3D280B',
        },
        charcoal: {
          DEFAULT: '#20201D',
          50: '#F6F6F5',
          100: '#E6E6E4',
          200: '#CCCCCC',
          400: '#70706B',
          600: '#40403B',
          700: '#30302C',
          800: '#20201D',
          900: '#131311',
        },
        burgundy: {
          DEFAULT: '#8B2635',
          50: '#FDF2F4',
          100: '#F9DCE1',
          200: '#F1B5C0',
          500: '#8B2635',
          600: '#761E2C',
          700: '#5F1722',
          800: '#461018',
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(32, 32, 29, 0.05)',
        'premium': '0 10px 30px rgba(32, 32, 29, 0.08)',
        'gold-glow': '0 0 20px rgba(184, 134, 59, 0.25)',
      }
    },
  },
  plugins: [],
}
