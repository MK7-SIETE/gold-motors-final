/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        gold:  { DEFAULT: '#C9A84C', hover: '#B8962E', light: '#FDF4E0' },
        navy:  { DEFAULT: '#0F2044', hover: '#162d5e', light: '#E6EDF8' },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
