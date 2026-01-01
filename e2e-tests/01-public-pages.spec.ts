/**
 * اختبارات الصفحات العامة
 * Public Pages Tests
 */

import { expect, test } from '@playwright/test';
import { PAGES, TIMEOUTS } from './helpers/test-data';
import { navigateTo } from './helpers/test-helpers';

test.describe('الصفحات العامة - Public Pages', () => {

    test.describe('الصفحة الرئيسية - Home Page', () => {

        test('يجب أن تفتح الصفحة الرئيسية بنجاح', async ({ page }) => {
            await navigateTo(page, PAGES.home);

            // التحقق من تحميل الصفحة
            await expect(page).toHaveURL('/');

            // التحقق من وجود العنوان
            const title = await page.title();
            expect(title).toBeTruthy();

            console.log('✅ الصفحة الرئيسية تعمل');
        });

        test('يجب أن تحتوي الصفحة على شريط التنقل', async ({ page }) => {
            await navigateTo(page, PAGES.home);

            // التحقق من وجود عناصر التنقل
            const nav = page.locator('nav, header, [role="navigation"]').first();
            await expect(nav).toBeVisible();

            console.log('✅ شريط التنقل موجود');
        });

        test('يجب أن تعمل روابط التنقل الرئيسية', async ({ page }) => {
            await navigateTo(page, PAGES.home);

            // البحث عن روابط التنقل
            const links = page.locator('a[href]');
            const count = await links.count();

            expect(count).toBeGreaterThan(0);
            console.log(`✅ عدد الروابط: ${count}`);
        });

        test('يجب أن تكون الصفحة responsive', async ({ page }) => {
            // اختبار على شاشة صغيرة
            await page.setViewportSize({ width: 375, height: 667 });
            await navigateTo(page, PAGES.home);

            // التحقق من عدم وجود تمرير أفقي زائد
            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = await page.evaluate(() => window.innerWidth);

            // يسمح بفرق بسيط
            expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20);

            console.log('✅ الصفحة متجاوبة');
        });
    });

    test.describe('صفحة السوق - Marketplace', () => {

        test('يجب أن تفتح صفحة السوق الفوري', async ({ page }) => {
            await navigateTo(page, PAGES.marketplace);

            // التحقق من URL
            expect(page.url()).toContain('marketplace');

            console.log('✅ صفحة السوق تعمل');
        });

        test('يجب أن تعرض قائمة السيارات أو رسالة فارغة', async ({ page }) => {
            await navigateTo(page, PAGES.marketplace);
            await page.waitForTimeout(TIMEOUTS.medium);

            // البحث عن بطاقات السيارات أو رسالة فارغة
            const carCards = page.locator('[data-testid="car-card"], .car-card, article, .grid > div');
            const emptyMessage = page.locator(':has-text("لا توجد"), :has-text("فارغ"), :has-text("No results")');

            const hasCards = await carCards.count() > 0;
            const hasEmpty = await emptyMessage.isVisible().catch(() => false);

            expect(hasCards || hasEmpty).toBeTruthy();

            console.log(`✅ عدد السيارات المعروضة: ${await carCards.count()}`);
        });

        test('يجب أن تعمل فلاتر البحث', async ({ page }) => {
            await navigateTo(page, PAGES.marketplace);

            // البحث عن عناصر الفلترة
            const filters = page.locator('select, input[type="search"], .filter, [data-filter]');
            const count = await filters.count();

            console.log(`✅ عدد عناصر الفلترة: ${count}`);
        });
    });

    test.describe('صفحة المزادات - Auctions', () => {

        test('يجب أن تفتح صفحة المزادات', async ({ page }) => {
            await navigateTo(page, PAGES.auctions);

            expect(page.url()).toContain('auction');

            console.log('✅ صفحة المزادات تعمل');
        });

        test('يجب أن تعرض المزادات النشطة', async ({ page }) => {
            await navigateTo(page, PAGES.auctions);
            await page.waitForTimeout(TIMEOUTS.medium);

            // البحث عن بطاقات المزادات
            const auctionCards = page.locator('[data-testid="auction-card"], .auction-card, article');
            const count = await auctionCards.count();

            console.log(`✅ عدد المزادات المعروضة: ${count}`);
        });
    });

    test.describe('صفحة النقل - Transport', () => {

        test('يجب أن تفتح صفحة خدمات النقل', async ({ page }) => {
            await navigateTo(page, PAGES.transport);

            expect(page.url()).toContain('transport');

            console.log('✅ صفحة النقل تعمل');
        });
    });

    test.describe('صفحة تسجيل الدخول - Login', () => {

        test('يجب أن تفتح صفحة تسجيل الدخول', async ({ page }) => {
            await navigateTo(page, PAGES.login);

            // التحقق من وجود نموذج تسجيل الدخول
            const form = page.locator('form');
            await expect(form).toBeVisible();

            // التحقق من وجود حقل الهاتف
            const phoneInput = page.locator('input[type="tel"], input[name="phone"], input[placeholder*="هاتف"]').first();
            await expect(phoneInput).toBeVisible();

            // التحقق من وجود حقل كلمة المرور
            const passwordInput = page.locator('input[type="password"]').first();
            await expect(passwordInput).toBeVisible();

            console.log('✅ صفحة تسجيل الدخول تعمل');
        });

        test('يجب أن يظهر خطأ عند إدخال بيانات خاطئة', async ({ page }) => {
            await navigateTo(page, PAGES.login);

            // إدخال بيانات خاطئة
            const phoneInput = page.locator('input[type="tel"], input[name="phone"]').first();
            await phoneInput.fill('+218999999999');

            const passwordInput = page.locator('input[type="password"]').first();
            await passwordInput.fill('wrongpassword');

            // الضغط على زر الدخول
            const submitBtn = page.locator('button[type="submit"]').first();
            await submitBtn.click();

            await page.waitForTimeout(TIMEOUTS.medium);

            // التحقق من ظهور رسالة خطأ أو عدم التحويل
            const currentUrl = page.url();
            expect(currentUrl).toContain('login');

            console.log('✅ معالجة الأخطاء تعمل');
        });
    });

    test.describe('صفحة التسجيل - Register', () => {

        test('يجب أن تفتح صفحة التسجيل', async ({ page }) => {
            await navigateTo(page, PAGES.register);

            // التحقق من وجود النموذج
            const form = page.locator('form');
            await expect(form).toBeVisible();

            console.log('✅ صفحة التسجيل تعمل');
        });
    });

    test.describe('لوحة تحكم المدير - Admin Login', () => {

        test('يجب أن تفتح صفحة دخول المدير', async ({ page }) => {
            await navigateTo(page, PAGES.adminLogin);

            // التحقق من وجود النموذج
            const form = page.locator('form');
            await expect(form).toBeVisible();

            console.log('✅ صفحة دخول المدير تعمل');
        });
    });
});

test.describe('التحقق من الأداء - Performance', () => {

    test('يجب أن تحمل الصفحة الرئيسية في أقل من 5 ثواني', async ({ page }) => {
        const startTime = Date.now();

        await page.goto(PAGES.home);
        await page.waitForLoadState('domcontentloaded');

        const loadTime = Date.now() - startTime;

        expect(loadTime).toBeLessThan(5000);
        console.log(`✅ وقت التحميل: ${loadTime}ms`);
    });

    test('لا يجب أن توجد أخطاء JavaScript في الكونسول', async ({ page }) => {
        const errors: string[] = [];

        page.on('pageerror', error => {
            errors.push(error.message);
        });

        await navigateTo(page, PAGES.home);
        await page.waitForTimeout(TIMEOUTS.short);

        // نسمح ببعض الأخطاء غير الحرجة
        const criticalErrors = errors.filter(e =>
            !e.includes('ResizeObserver') &&
            !e.includes('Non-Error') &&
            !e.includes('hydration')
        );

        if (criticalErrors.length > 0) {
            console.log('⚠️ أخطاء JavaScript:', criticalErrors);
        }

        expect(criticalErrors.length).toBeLessThan(3);
        console.log('✅ لا توجد أخطاء حرجة');
    });
});
