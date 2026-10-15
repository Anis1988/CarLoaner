export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '"Noto Sans Arabic"', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', '"Noto Sans Arabic"', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: { 50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b' },
        ink: { 950: '#04070d', 900: '#0a101d', 800: '#111a2c', 700: '#1a2540' },
        mist: { 50: '#f6f9fc', 100: '#eef3f8' },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(16,185,129,.25), 0 10px 40px -10px rgba(16,185,129,.45)',
        soft: '0 10px 30px -12px rgba(15,23,42,.18)',
        float: '0 24px 60px -20px rgba(15,23,42,.35), 0 2px 6px -2px rgba(15,23,42,.08)',
        'float-dark': '0 24px 60px -18px rgba(0,0,0,.75), 0 0 0 1px rgba(255,255,255,.06)',
      },
      borderRadius: { '4xl': '2rem' },
    },
  },
  plugins: [],
};
