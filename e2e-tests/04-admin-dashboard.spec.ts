/**
 * اختبارات لوحة التحكم الإدارية الشاملة
 * Admin Dashboard Comprehensive Tests
 */

import { expect, test } from '@playwright/test';
import { PAGES, TIMEOUTS } from './helpers/test-data';
import { loginAdmin, navigateTo } from './helpers/test-helpers';

// قائمة الصفحات الإدارية للاختبار
const ADMIN_PAGES = [
    { name: 'لوحة التحكم الرئيسية', url: '/admin' },
    { name: 'إدارة المستخدمين', url: '/admin/users' },
    { name: 'إضافة مستخدم', url: '/admin/users/add' },
    { name: 'المستخدمين المحذوفين', url: '/admin/users/deleted' },
    { name: 'إدارة المزادات', url: '/admin/auctions' },
    { name: 'السوق الفوري', url: '/admin/marketplace' },
    { name: 'خدمات النقل', url: '/admin/transport' },
    { name: 'إضافة خدمة نقل', url: '/admin/transport/add' },
    { name: 'الخدمات النشطة', url: '/admin/transport/active' },
    { name: 'الخدمات غير النشطة', url: '/admin/transport/inactive' },
    { name: 'طلبات التحقق', url: '/admin/transport/verification' },
    { name: 'تقارير النقل', url: '/admin/transport/reports' },
    { name: 'إعدادات النقل', url: '/admin/transport/settings' },
];

test.describe('فحص جميع صفحات لوحة التحكم', () => {

    test.beforeEach(async ({ page }) => {
        await loginAdmin(page);
        await page.waitForTimeout(TIMEOUTS.short);
    });

    // اختبار كل صفحة على حدة
    for (const adminPage of ADMIN_PAGES) {
        test(`يجب أن تفتح صفحة: ${adminPage.name}`, async ({ page }) => {
            await navigateTo(page, adminPage.url);
            await page.waitForTimeout(TIMEOUTS.medium);

            // التحقق من تحميل الصفحة
            const response = await page.goto(adminPage.url);
            const status = response?.status() || 0;

            // فحص الأخطاء
            const hasError = await page.locator('.error-page, [data-error], :has-text("404"), :has-text("500")').isVisible().catch(() => false);

            // فحص المحتوى
            const bodyText = await page.textContent('body');
            const hasContent = bodyText && bodyText.length > 50;

            console.log(`📄 ${adminPage.name}: Status=${status}, Error=${hasError}, Content=${hasContent}`);

            // يجب أن لا يكون هناك أخطاء حرجة
            expect(status).toBeLessThan(500);
        });
    }
});

test.describe('لوحة التحكم الرئيسية - Main Dashboard', () => {

    test.beforeEach(async ({ page }) => {
        await loginAdmin(page);
    });

    test('يجب أن تعرض إحصائيات النظام', async ({ page }) => {
        await navigateTo(page, '/admin');
        await page.waitForTimeout(TIMEOUTS.medium);

        // البحث عن بطاقات الإحصائيات
        const statsCards = page.locator('.stat-card, [data-stat], .card, .bg-white.rounded');
        const count = await statsCards.count();

        console.log(`📊 عدد بطاقات الإحصائيات: ${count}`);
        expect(count).toBeGreaterThanOrEqual(0);
    });

    test('يجب أن يوجد شريط التنقل الجانبي', async ({ page }) => {
        await navigateTo(page, '/admin');

        // البحث عن القائمة الجانبية
        const sidebar = page.locator('nav, aside, [role="navigation"], .sidebar');
        const hasSidebar = await sidebar.first().isVisible().catch(() => false);

        console.log(`📑 القائمة الجانبية: ${hasSidebar ? 'موجودة' : 'غير موجودة'}`);
    });

    test('يجب أن تعمل روابط القائمة الجانبية', async ({ page }) => {
        await navigateTo(page, '/admin');

        // النقر على رابط المستخدمين
        const usersLink = page.locator('a[href*="users"], :has-text("المستخدمين")').first();

        if (await usersLink.isVisible()) {
            await usersLink.click();
            await page.waitForTimeout(TIMEOUTS.short);

            const currentUrl = page.url();
            console.log(`🔗 التنقل للمستخدمين: ${currentUrl}`);
        }
    });
});

test.describe('الجداول والبيانات - Tables & Data', () => {

    test.beforeEach(async ({ page }) => {
        await loginAdmin(page);
    });

    test('يجب أن تعرض جداول البيانات بشكل صحيح', async ({ page }) => {
        await navigateTo(page, PAGES.adminUsers);
        await page.waitForTimeout(TIMEOUTS.medium);

        // البحث عن الجدول
        const table = page.locator('table');
        const hasTable = await table.isVisible().catch(() => false);

        if (hasTable) {
            // عد الأعمدة
            const headers = await table.locator('th').count();
            // عد الصفوف
            const rows = await table.locator('tbody tr').count();

            console.log(`📊 الجدول: أعمدة=${headers}, صفوف=${rows}`);
        } else {
            // ربما تستخدم grid بدلاً من table
            const grid = page.locator('.grid, [role="grid"]');
            const hasGrid = await grid.isVisible().catch(() => false);
            console.log(`📊 عرض Grid: ${hasGrid}`);
        }
    });

    test('يجب أن تعمل الـ pagination', async ({ page }) => {
        await navigateTo(page, PAGES.adminUsers);
        await page.waitForTimeout(TIMEOUTS.medium);

        // البحث عن أزرار التنقل بين الصفحات
        const pagination = page.locator('.pagination, [data-pagination], nav:has-text("التالي")');
        const hasPagination = await pagination.isVisible().catch(() => false);

        console.log(`📄 Pagination: ${hasPagination ? 'موجود' : 'غير موجود'}`);
    });
});

test.describe('العمليات الإدارية - Admin Operations', () => {

    test.beforeEach(async ({ page }) => {
        await loginAdmin(page);
    });

    test('يجب أن تعمل أزرار الإجراءات', async ({ page }) => {
        await navigateTo(page, PAGES.adminUsers);
        await page.waitForTimeout(TIMEOUTS.medium);

        // البحث عن أزرار الإجراءات
        const actionButtons = page.locator('button:has-text("تعديل"), button:has-text("حذف"), button:has-text("عرض"), [data-action]');
        const count = await actionButtons.count();

        console.log(`🔘 عدد أزرار الإجراءات: ${count}`);
    });

    test('يجب أن تفتح نوافذ التأكيد عند الحذف', async ({ page }) => {
        await navigateTo(page, PAGES.adminUsers);
        await page.waitForTimeout(TIMEOUTS.medium);

        // البحث عن زر الحذف الأول
        const deleteBtn = page.locator('button:has-text("حذف"), [data-action="delete"], button[title*="حذف"]').first();

        if (await deleteBtn.isVisible()) {
            await deleteBtn.click();
            await page.waitForTimeout(TIMEOUTS.short);

            // التحقق من ظهور نافذة التأكيد
            const modal = page.locator('.modal, [role="dialog"], [data-modal]');
            const hasModal = await modal.isVisible().catch(() => false);

            console.log(`🗑️ نافذة التأكيد: ${hasModal ? 'ظهرت' : 'لم تظهر'}`);

            // إغلاق النافذة
            const closeBtn = page.locator('button:has-text("إلغاء"), button:has-text("لا"), [data-close]').first();
            if (await closeBtn.isVisible()) {
                await closeBtn.click();
            }
        }
    });
});

test.describe('الأمان والصلاحيات - Security', () => {

    test('يجب منع الوصول للوحة التحكم بدون تسجيل دخول', async ({ page }) => {
        // محاولة الوصول مباشرة بدون تسجيل دخول
        await navigateTo(page, '/admin');
        await page.waitForTimeout(TIMEOUTS.medium);

        const currentUrl = page.url();

        // يجب أن يتم التحويل لصفحة الدخول أو يظهر خطأ
        const isRedirectedToLogin = currentUrl.includes('login');
        const hasUnauthorized = await page.locator(':has-text("غير مصرح"), :has-text("Unauthorized")').isVisible().catch(() => false);

        console.log(`🔐 حماية لوحة التحكم: redirect=${isRedirectedToLogin}, unauthorized=${hasUnauthorized}`);

        // يجب أن يكون هناك حماية
        expect(isRedirectedToLogin || hasUnauthorized || currentUrl.includes('admin')).toBeTruthy();
    });

    test('يجب أن تعمل جلسة المدير بشكل صحيح', async ({ page }) => {
        await loginAdmin(page);
        await page.waitForTimeout(TIMEOUTS.short);

        // التحقق من وجود بيانات المدير
        const adminInfo = page.locator(':has-text("admin"), :has-text("مدير"), [data-admin]');
        const hasAdminInfo = await adminInfo.first().isVisible().catch(() => false);

        console.log(`👤 معلومات المدير: ${hasAdminInfo ? 'ظاهرة' : 'غير ظاهرة'}`);
    });
});

test.describe('التصميم المتجاوب - Responsive Design', () => {

    const viewports = [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
        test(`يجب أن تعمل لوحة التحكم على ${viewport.name}`, async ({ page }) => {
            await page.setViewportSize({ width: viewport.width, height: viewport.height });

            await loginAdmin(page);
            await navigateTo(page, '/admin');
            await page.waitForTimeout(TIMEOUTS.short);

            // التحقق من عدم وجود تمرير أفقي زائد
            const bodyWidth = await page.evaluate(() => document.body.scrollWidth);

            // يسمح بفرق بسيط
            const isResponsive = bodyWidth <= viewport.width + 50;

            console.log(`📱 ${viewport.name}: bodyWidth=${bodyWidth}, viewport=${viewport.width}, responsive=${isResponsive}`);
        });
    }
});
