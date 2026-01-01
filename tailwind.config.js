/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        opensooq: {
          blue: '#2563eb',
          lightBlue: '#eff6ff',
          gray: '#6b7280',
          lightGray: '#f3f4f6',
          darkGray: '#374151',
          orange: '#FF6600',
          orangeHover: '#E55A00',
        },
        // اللون الأزرق الافتراضي للمشروع - يحل محل البنفسجي
        defaultBlue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        libyana: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          primary: '#64748b',
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      fontFamily: {
        arabic: ['Cairo', 'Tajawal', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        english: ['Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        cairo: ['Cairo', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: [
          'Cairo',
          'Inter',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'system-ui',
          'sans-serif',
        ],
        fallback: ['Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'system-ui', 'sans-serif'],
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
      },
      screens: {
        xs: '475px',
        'auction-lg': '1142px', // نقطة انكسار مخصصة للمزادات - عرض 1142px أو أكثر
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.125rem',
      },
      // نظام حركات سلس مستوحى من iOS
      transitionDuration: {
        smooth: '400ms', // الافتراضي للحركات السلسة
        'smooth-fast': '300ms', // سريع قليلاً
        'smooth-slow': '500ms', // بطيء قليلاً
      },
      transitionTimingFunction: {
        // منحنيات iOS الأصلية
        ios: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // ease-in-out محسّن
        'ios-in': 'cubic-bezier(0.42, 0, 1, 1)', // ease-in
        'ios-out': 'cubic-bezier(0, 0, 0.58, 1)', // ease-out
        'ios-spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', // spring effect
        smooth: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // نفس ios
      },
    },
  },
  plugins: [],
};
