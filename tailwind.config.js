/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#EA580C',
        'primary-hover': '#C2410C',
        'secondary': '#475569',
        'background': '#f8fafc',
        'surface': '#ffffff',
        'sidebar': '#0f172a',
        'text-primary': '#1e293b',
        'text-secondary': '#64748b',
        'border-color': '#e2e8f0',
        'success': '#16a34a',
        'success-hover': '#15803d',
        'warning': '#f59e0b',
        'danger': '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.07)',
        'card': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      }
    },
  },
  plugins: [],
};


