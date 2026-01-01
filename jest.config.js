const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // مسار تطبيق Next.js لتحميل next.config.js وملفات .env
  dir: './',
});

// إعدادات Jest المخصصة
const customJestConfig = {
  // إضافة المزيد من setup options قبل كل اختبار
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

  // البيئة الافتراضية للاختبار
  testEnvironment: 'jest-environment-node',

  // تحسين الأداء ومعالجة open handles
  forceExit: true,
  detectOpenHandles: false,
  testTimeout: 10000,

  // حل مشكلة Haste module naming collision
  modulePathIgnorePatterns: [
    '<rootDir>/backup-emergency---/',
    '<rootDir>/archive-backups-2025-11-13-01-37-39/',
    '<rootDir>/archive-cleanup-2025-11-13-01-00-28/',
  ],

  // أنماط الملفات المراد اختبارها
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/tests/**/*.test.[jt]s?(x)',
    '**/utils/__tests__/**/*.test.[jt]s?(x)',
  ],

  // المسارات المراد تجاهلها
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    '<rootDir>/build/',
    '<rootDir>/dist/',
    '<rootDir>/e2e-tests/',
    '<rootDir>/backup-emergency---/',
    '<rootDir>/archive-backups-2025-11-13-01-37-39/',
    '<rootDir>/archive-cleanup-2025-11-13-01-00-28/',
    '.spec.ts$',
    '.spec.tsx$',
  ],

  // تحويل الوحدات
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    '^@/utils/(.*)$': '<rootDir>/utils/$1',
    '^@/config/(.*)$': '<rootDir>/config/$1',
    '^@/types/(.*)$': '<rootDir>/types/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },

  // التغطية
  collectCoverageFrom: [
    'utils/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'pages/api/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
  ],

  // تقارير التغطية
  coverageReporters: ['text', 'lcov', 'html'],

  // حد التغطية المطلوب
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};

// إنشاء إعدادات Jest النهائية
module.exports = createJestConfig(customJestConfig);
