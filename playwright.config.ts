import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Sooq Mazad
 * نظام الاختبار الشامل للمشروع
 */
export default defineConfig({
    // مجلد الاختبارات
    testDir: './e2e-tests',

    // التشغيل المتوازي
    fullyParallel: true,

    // إعادة المحاولة عند الفشل
    retries: process.env.CI ? 2 : 1,

    // عدد Workers
    workers: process.env.CI ? 1 : 3,

    // التقارير
    reporter: [
        ['html', { outputFolder: 'test-reports/html' }],
        ['json', { outputFile: 'test-reports/results.json' }],
        ['list'],
    ],

    // الإعدادات العامة
    use: {
        // URL الأساسي
        baseURL: 'http://localhost:3021',

        // تسجيل الشاشة عند الفشل
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'on-first-retry',

        // انتظار العناصر
        actionTimeout: 15000,
        navigationTimeout: 30000,

        // اللغة العربية
        locale: 'ar-LY',
        timezoneId: 'Africa/Tripoli',

        // Headers إضافية
        extraHTTPHeaders: {
            'Accept-Language': 'ar',
        },
    },

    // المشاريع (المتصفحات)
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        // Mobile
        {
            name: 'mobile-chrome',
            use: { ...devices['Pixel 5'] },
        },
    ],

    // تشغيل السيرفر قبل الاختبارات
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3021',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
    },

    // مجلد النتائج
    outputDir: 'test-results/',

    // timeout للاختبارات
    timeout: 60000,
    expect: {
        timeout: 10000,
    },
});
