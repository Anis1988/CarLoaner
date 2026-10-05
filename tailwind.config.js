export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Noto Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['Poppins', '"Noto Sans Arabic"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: { 50: '#ecfdf3', 100: '#d1fae0', 500: '#0f9d58', 600: '#0b7f47', 700: '#086337', 900: '#053d22' },
      },
    },
  },
  plugins: [],
};
