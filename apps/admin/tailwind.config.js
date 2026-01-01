/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        admin: {
          primary: '#2563eb',
          secondary: '#64748b',
          success: '#22c55e',
          danger: '#ef4444',
          warning: '#f59e0b',
          info: '#3b82f6',
        },
      },
      fontFamily: {
        // خط واحد موحد - Cairo محمّل من Google Fonts
        sans: ['Cairo', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
