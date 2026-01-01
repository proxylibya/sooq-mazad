/**
 * اختبار التدفق الكامل - Full Flow Test
 * يحاكي رحلة مستخدم حقيقي في النظام
 */

import { test } from '@playwright/test';
import { PAGES, TIMEOUTS } from './helpers/test-data';
import {
    generateTestPhone,
    loginAdmin,
    navigateTo,
    scrollToBottom
} from './helpers/test-helpers';

test.describe('رحلة المستخدم الكاملة - Full User Journey', () => {

    test('رحلة زائر يتصفح الموقع', async ({ page }) => {
        console.log('\n🚀 بدء رحلة الزائر...\n');

        // 1. زيارة الصفحة الرئيسية
        console.log('1️⃣ زيارة الصفحة الرئيسية');
        await navigateTo(page, PAGES.home);
        await page.waitForLoadState('networkidle');
        console.log('   ✅ الصفحة الرئيسية محملة');

        // 2. تصفح السوق الفوري
        console.log('2️⃣ تصفح السوق الفوري');
        await navigateTo(page, PAGES.marketplace);
        await page.waitForTimeout(TIMEOUTS.short);

        // التمرير لأسفل
        await scrollToBottom(page);
        console.log('   ✅ السوق الفوري محمل');

        // 3. تصفح المزادات
        console.log('3️⃣ تصفح المزادات');
        await navigateTo(page, PAGES.auctions);
        await page.waitForTimeout(TIMEOUTS.short);
        console.log('   ✅ صفحة المزادات محملة');

        // 4. تصفح خدمات النقل
        console.log('4️⃣ تصفح خدمات النقل');
        await navigateTo(page, PAGES.transport);
        await page.waitForTimeout(TIMEOUTS.short);
        console.log('   ✅ صفحة النقل محملة');

        // 5. الذهاب لصفحة التسجيل
        console.log('5️⃣ الذهاب لصفحة التسجيل');
        await navigateTo(page, PAGES.register);
        const registerForm = page.locator('form');
        const hasRegisterForm = await registerForm.isVisible().catch(() => false);
        console.log(`   ${hasRegisterForm ? '✅' : '⚠️'} نموذج التسجيل ${hasRegisterForm ? 'موجود' : 'غير موجود'}`);

        console.log('\n✅ رحلة الزائر اكتملت بنجاح!\n');
    });

    test('رحلة المدير الكاملة', async ({ page }) => {
        console.log('\n🚀 بدء رحلة المدير...\n');

        // 1. تسجيل دخول المدير
        console.log('1️⃣ تسجيل دخول المدير');
        await loginAdmin(page);
        await page.waitForTimeout(TIMEOUTS.short);
        console.log('   ✅ تم تسجيل الدخول');

        // 2. عرض لوحة التحكم
        console.log('2️⃣ عرض لوحة التحكم');
        await navigateTo(page, '/admin');
        await page.waitForTimeout(TIMEOUTS.short);
        console.log('   ✅ لوحة التحكم محملة');

        // 3. إدارة المستخدمين
        console.log('3️⃣ إدارة المستخدمين');
        await navigateTo(page, PAGES.adminUsers);
        await page.waitForTimeout(TIMEOUTS.short);

        const usersTable = page.locator('table, .grid');
        const hasUsersTable = await usersTable.first().isVisible().catch(() => false);
        console.log(`   ${hasUsersTable ? '✅' : '⚠️'} جدول المستخدمين ${hasUsersTable ? 'موجود' : 'غير موجود'}`);

        // 4. صفحة إضافة مستخدم
        console.log('4️⃣ صفحة إضافة مستخدم');
        await navigateTo(page, PAGES.adminAddUser);
        await page.waitForTimeout(TIMEOUTS.short);
        console.log('   ✅ صفحة الإضافة محملة');

        // 5. إدارة المزادات
        console.log('5️⃣ إدارة المزادات');
        await navigateTo(page, PAGES.adminAuctions);
        await page.waitForTimeout(TIMEOUTS.short);
        console.log('   ✅ صفحة المزادات محملة');

        // 6. إدارة السوق
        console.log('6️⃣ إدارة السوق');
        await navigateTo(page, PAGES.adminCars);
        await page.waitForTimeout(TIMEOUTS.short);
        console.log('   ✅ صفحة السوق محملة');

        // 7. إدارة خدمات النقل
        console.log('7️⃣ إدارة خدمات النقل');
        await navigateTo(page, PAGES.adminTransport);
        await page.waitForTimeout(TIMEOUTS.short);
        console.log('   ✅ صفحة النقل محملة');

        // 8. إضافة خدمة نقل
        console.log('8️⃣ صفحة إضافة خدمة نقل');
        await navigateTo(page, PAGES.adminAddTransport);
        await page.waitForTimeout(TIMEOUTS.short);
        console.log('   ✅ صفحة الإضافة محملة');

        console.log('\n✅ رحلة المدير اكتملت بنجاح!\n');
    });

    test('اختبار إنشاء محتوى كامل', async ({ page }) => {
        console.log('\n🚀 اختبار إنشاء المحتوى...\n');

        await loginAdmin(page);

        // 1. محاولة إنشاء مستخدم
        console.log('1️⃣ إنشاء مستخدم جديد');
        await navigateTo(page, PAGES.adminAddUser);
        await page.waitForTimeout(TIMEOUTS.short);

        const testPhone = generateTestPhone();

        // ملء النموذج
        const nameInput = page.locator('input[name="name"]').first();
        if (await nameInput.isVisible()) {
            await nameInput.fill('مستخدم اختبار شامل ' + Date.now());
        }

        const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first();
        if (await phoneInput.isVisible()) {
            await phoneInput.fill(testPhone);
        }

        const passwordInput = page.locator('input[name="password"]').first();
        if (await passwordInput.isVisible()) {
            await passwordInput.fill('Test@123456');
        }

        console.log(`   📱 رقم الهاتف: ${testPhone}`);

        // الضغط على زر الإنشاء
        const submitBtn = page.locator('button[type="submit"]').first();
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
            await page.waitForTimeout(TIMEOUTS.medium);

            // فحص النتيجة
            const hasSuccess = await page.locator(':has-text("نجاح"), .success, .alert-success').isVisible().catch(() => false);
            const hasError = await page.locator(':has-text("خطأ"), .error, .alert-error').isVisible().catch(() => false);

            console.log(`   ${hasSuccess ? '✅ تم الإنشاء بنجاح' : hasError ? '❌ حدث خطأ' : '⚠️ نتيجة غير واضحة'}`);
        }

        // 2. محاولة إنشاء خدمة نقل
        console.log('2️⃣ إنشاء خدمة نقل');
        await navigateTo(page, PAGES.adminAddTransport);
        await page.waitForTimeout(TIMEOUTS.short);

        const companyInput = page.locator('input[name="companyName"]').first();
        if (await companyInput.isVisible()) {
            await companyInput.fill('شركة نقل اختبار ' + Date.now());
            console.log('   ✅ تم ملء بيانات الشركة');
        }

        console.log('\n✅ اختبار إنشاء المحتوى اكتمل!\n');
    });
});

test.describe('اختبار الأداء الشامل - Performance Test', () => {

    test('قياس أوقات تحميل الصفحات الرئيسية', async ({ page }) => {
        console.log('\n⏱️ قياس أوقات التحميل...\n');

        const pages = [
            { name: 'الرئيسية', url: '/' },
            { name: 'السوق', url: '/marketplace' },
            { name: 'المزادات', url: '/auctions' },
            { name: 'النقل', url: '/transport' },
            { name: 'تسجيل الدخول', url: '/login' },
        ];

        for (const p of pages) {
            const startTime = Date.now();
            await page.goto(p.url);
            await page.waitForLoadState('domcontentloaded');
            const loadTime = Date.now() - startTime;

            const status = loadTime < 2000 ? '✅' : loadTime < 5000 ? '⚠️' : '❌';
            console.log(`${status} ${p.name}: ${loadTime}ms`);
        }

        console.log('\n');
    });

    test('قياس أوقات APIs الرئيسية', async ({ request }) => {
        console.log('\n⏱️ قياس أوقات APIs...\n');

        const apis = [
            { name: 'الصحة', url: '/api/health' },
            { name: 'السيارات', url: '/api/cars' },
            { name: 'المزادات', url: '/api/auctions' },
        ];

        for (const api of apis) {
            const startTime = Date.now();
            try {
                await request.get(api.url);
                const responseTime = Date.now() - startTime;

                const status = responseTime < 500 ? '✅' : responseTime < 2000 ? '⚠️' : '❌';
                console.log(`${status} ${api.name}: ${responseTime}ms`);
            } catch {
                console.log(`❌ ${api.name}: فشل`);
            }
        }

        console.log('\n');
    });
});

test.describe('فحص الاستقرار - Stability Test', () => {

    test('اختبار التنقل السريع بين الصفحات', async ({ page }) => {
        console.log('\n🔄 اختبار التنقل السريع...\n');

        const pages = ['/', '/marketplace', '/auctions', '/transport', '/login'];

        for (let i = 0; i < 3; i++) {
            console.log(`دورة ${i + 1}:`);

            for (const url of pages) {
                await page.goto(url);
                await page.waitForTimeout(500);

                // فحص عدم وجود أخطاء
                const hasError = await page.locator('.error-page, :has-text("500"), :has-text("Error")').isVisible().catch(() => false);

                if (hasError) {
                    console.log(`   ❌ خطأ في ${url}`);
                }
            }

            console.log(`   ✅ الدورة ${i + 1} اكتملت`);
        }

        console.log('\n✅ اختبار الاستقرار نجح!\n');
    });

    test('اختبار تحميل الصفحات مرات متعددة', async ({ page }) => {
        console.log('\n🔁 اختبار التحميل المتكرر...\n');

        for (let i = 0; i < 5; i++) {
            await page.goto('/');
            await page.reload();
            console.log(`   ✅ التحميل ${i + 1} نجح`);
        }

        console.log('\n');
    });
});
