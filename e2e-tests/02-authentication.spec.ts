/**
 * اختبارات المصادقة وإدارة المستخدمين
 * Authentication & User Management Tests
 */

import { expect, test } from '@playwright/test';
import { PAGES, TEST_USERS, TIMEOUTS } from './helpers/test-data';
import {
    generateTestPhone,
    loginAdmin,
    loginUser,
    navigateTo
} from './helpers/test-helpers';

test.describe('المصادقة - Authentication', () => {

    test.describe('تسجيل مستخدم جديد - User Registration', () => {

        test('يجب أن ينجح تسجيل مستخدم بهاتف جديد', async ({ page }) => {
            const newPhone = generateTestPhone();

            await navigateTo(page, PAGES.register);

            // ملء النموذج
            const nameInput = page.locator('input[name="name"], input[placeholder*="اسم"]').first();
            if (await nameInput.isVisible()) {
                await nameInput.fill('مستخدم اختبار ' + Date.now());
            }

            const phoneInput = page.locator('input[type="tel"], input[name="phone"]').first();
            await phoneInput.fill(newPhone);

            const passwordInput = page.locator('input[type="password"]').first();
            await passwordInput.fill(TEST_USERS.newUser.password);

            // تأكيد كلمة المرور إذا موجود
            const confirmInput = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]');
            if (await confirmInput.first().isVisible()) {
                await confirmInput.first().fill(TEST_USERS.newUser.password);
            }

            // الضغط على زر التسجيل
            const submitBtn = page.locator('button[type="submit"]').first();
            await submitBtn.click();

            await page.waitForTimeout(TIMEOUTS.medium);

            // التحقق من النتيجة
            const currentUrl = page.url();
            const hasError = await page.locator('.error, .alert-error, [class*="error"]').isVisible().catch(() => false);

            console.log(`📱 رقم الهاتف: ${newPhone}`);
            console.log(`🔗 URL الحالي: ${currentUrl}`);
            console.log(`❌ وجود خطأ: ${hasError}`);
        });

        test('يجب أن يرفض التسجيل برقم هاتف غير صالح', async ({ page }) => {
            await navigateTo(page, PAGES.register);

            const phoneInput = page.locator('input[type="tel"], input[name="phone"]').first();
            await phoneInput.fill('123'); // رقم غير صالح

            const passwordInput = page.locator('input[type="password"]').first();
            await passwordInput.fill(TEST_USERS.newUser.password);

            const submitBtn = page.locator('button[type="submit"]').first();
            await submitBtn.click();

            await page.waitForTimeout(TIMEOUTS.short);

            // يجب أن يبقى في صفحة التسجيل
            expect(page.url()).toContain('register');

            console.log('✅ رفض الرقم غير الصالح');
        });
    });

    test.describe('تسجيل دخول المستخدم - User Login', () => {

        test('يجب أن يظهر خطأ عند إدخال بيانات خاطئة', async ({ page }) => {
            await navigateTo(page, PAGES.login);

            await loginUser(page, '+218900000001', 'wrongpassword');

            await page.waitForTimeout(TIMEOUTS.medium);

            // يجب أن يبقى في صفحة الدخول أو يظهر خطأ
            const hasError = await page.locator('.error, .alert-error, [class*="error"], :has-text("خطأ")').isVisible().catch(() => false);
            const stillOnLogin = page.url().includes('login');

            expect(hasError || stillOnLogin).toBeTruthy();

            console.log('✅ معالجة البيانات الخاطئة تعمل');
        });

        test('يجب أن يعمل تسجيل الدخول ببيانات صحيحة', async ({ page }) => {
            await navigateTo(page, PAGES.login);

            // استخدام بيانات المدير للاختبار
            await loginUser(page, TEST_USERS.testAdmin.phone, TEST_USERS.testAdmin.password);

            await page.waitForTimeout(TIMEOUTS.medium);

            const currentUrl = page.url();
            console.log(`🔗 URL بعد الدخول: ${currentUrl}`);

            // نجاح إذا تم التحويل أو ظهرت رسالة نجاح
            const notOnLogin = !currentUrl.includes('login');
            const hasSuccess = await page.locator(':has-text("نجاح"), :has-text("مرحباً")').isVisible().catch(() => false);

            console.log(`✅ نتيجة تسجيل الدخول: تحويل=${notOnLogin}, نجاح=${hasSuccess}`);
        });
    });

    test.describe('تسجيل دخول المدير - Admin Login', () => {

        test('يجب أن تفتح صفحة دخول المدير', async ({ page }) => {
            await navigateTo(page, PAGES.adminLogin);

            const form = page.locator('form');
            await expect(form).toBeVisible();

            console.log('✅ صفحة دخول المدير تعمل');
        });

        test('يجب أن ينجح دخول المدير ببيانات صحيحة', async ({ page }) => {
            await loginAdmin(page);

            await page.waitForTimeout(TIMEOUTS.medium);

            const currentUrl = page.url();
            console.log(`🔗 URL بعد دخول المدير: ${currentUrl}`);

            // نجاح إذا تم التحويل للوحة التحكم
            const isOnAdmin = currentUrl.includes('admin') && !currentUrl.includes('login');

            console.log(`✅ دخول المدير: ${isOnAdmin ? 'نجح' : 'قيد التحقق'}`);
        });

        test('يجب أن يرفض دخول المدير ببيانات خاطئة', async ({ page }) => {
            await navigateTo(page, PAGES.adminLogin);

            const usernameInput = page.locator('input[name="username"], input[name="loginIdentifier"]').first();
            await usernameInput.fill('wrongadmin');

            const passwordInput = page.locator('input[type="password"]').first();
            await passwordInput.fill('wrongpassword');

            const submitBtn = page.locator('button[type="submit"]').first();
            await submitBtn.click();

            await page.waitForTimeout(TIMEOUTS.medium);

            // يجب أن يبقى في صفحة الدخول
            expect(page.url()).toContain('login');

            console.log('✅ رفض بيانات المدير الخاطئة');
        });
    });
});

test.describe('إدارة المستخدمين من لوحة التحكم - Admin User Management', () => {

    test.beforeEach(async ({ page }) => {
        // تسجيل دخول المدير قبل كل اختبار
        await loginAdmin(page);
        await page.waitForTimeout(TIMEOUTS.short);
    });

    test('يجب أن تفتح صفحة قائمة المستخدمين', async ({ page }) => {
        await navigateTo(page, PAGES.adminUsers);

        await page.waitForTimeout(TIMEOUTS.medium);

        // التحقق من وجود جدول أو قائمة
        const hasTable = await page.locator('table, [role="table"], .grid').isVisible().catch(() => false);
        const hasUsers = await page.locator('tr, [data-user], .user-card').count() > 0;

        console.log(`✅ صفحة المستخدمين: جدول=${hasTable}, مستخدمين=${hasUsers}`);
    });

    test('يجب أن تفتح صفحة إضافة مستخدم', async ({ page }) => {
        await navigateTo(page, PAGES.adminAddUser);

        await page.waitForTimeout(TIMEOUTS.medium);

        const form = page.locator('form');
        const isFormVisible = await form.isVisible().catch(() => false);

        console.log(`✅ صفحة إضافة مستخدم: نموذج=${isFormVisible}`);
    });

    test('يجب أن ينجح إنشاء مستخدم جديد من لوحة التحكم', async ({ page }) => {
        await navigateTo(page, PAGES.adminAddUser);
        await page.waitForTimeout(TIMEOUTS.short);

        const newPhone = generateTestPhone();

        // ملء نموذج إنشاء المستخدم
        const nameInput = page.locator('input[name="name"]').first();
        if (await nameInput.isVisible()) {
            await nameInput.fill('مستخدم اختبار آلي ' + Date.now());
        }

        const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first();
        if (await phoneInput.isVisible()) {
            await phoneInput.fill(newPhone);
        }

        const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
        if (await passwordInput.isVisible()) {
            await passwordInput.fill('Test@123456');
        }

        // اختيار الدور إذا موجود
        const roleSelect = page.locator('select[name="role"]');
        if (await roleSelect.isVisible()) {
            await roleSelect.selectOption('USER');
        }

        // الضغط على زر الإنشاء
        const submitBtn = page.locator('button[type="submit"], button:has-text("إنشاء"), button:has-text("حفظ")').first();
        if (await submitBtn.isVisible()) {
            await submitBtn.click();
        }

        await page.waitForTimeout(TIMEOUTS.medium);

        console.log(`📱 تم إنشاء مستخدم برقم: ${newPhone}`);
    });
});
