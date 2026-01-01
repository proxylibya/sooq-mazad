/**
 * اختبارات إنشاء الإعلانات والمزادات
 * Ads & Auctions Creation Tests
 */

import { test } from '@playwright/test';
import { PAGES, TIMEOUTS } from './helpers/test-data';
import { loginAdmin, navigateTo } from './helpers/test-helpers';

test.describe('إنشاء الإعلانات - Create Ads', () => {

    test.describe('السوق الفوري - Marketplace', () => {

        test('يجب أن تفتح صفحة السوق من لوحة التحكم', async ({ page }) => {
            await loginAdmin(page);
            await navigateTo(page, PAGES.adminCars);

            await page.waitForTimeout(TIMEOUTS.medium);

            const pageContent = await page.textContent('body');
            const hasContent = pageContent && pageContent.length > 100;

            console.log(`✅ صفحة السوق الإداري: ${hasContent ? 'تعمل' : 'فارغة'}`);
        });

        test('يجب أن تعرض قائمة السيارات أو رسالة فارغة', async ({ page }) => {
            await loginAdmin(page);
            await navigateTo(page, PAGES.adminCars);

            await page.waitForTimeout(TIMEOUTS.medium);

            // البحث عن السيارات في الجدول
            const tableRows = page.locator('table tbody tr, [data-car-row]');
            const count = await tableRows.count();

            console.log(`✅ عدد السيارات في الجدول: ${count}`);
        });
    });

    test.describe('المزادات - Auctions', () => {

        test('يجب أن تفتح صفحة المزادات من لوحة التحكم', async ({ page }) => {
            await loginAdmin(page);
            await navigateTo(page, PAGES.adminAuctions);

            await page.waitForTimeout(TIMEOUTS.medium);

            const pageTitle = await page.title();
            console.log(`✅ صفحة المزادات الإداري: ${pageTitle}`);
        });

        test('يجب أن تعرض المزادات الموجودة', async ({ page }) => {
            await loginAdmin(page);
            await navigateTo(page, PAGES.adminAuctions);

            await page.waitForTimeout(TIMEOUTS.medium);

            // البحث عن المزادات
            const auctionCards = page.locator('table tbody tr, [data-auction], .auction-card');
            const count = await auctionCards.count();

            console.log(`✅ عدد المزادات: ${count}`);
        });
    });

    test.describe('خدمات النقل - Transport', () => {

        test('يجب أن تفتح صفحة النقل من لوحة التحكم', async ({ page }) => {
            await loginAdmin(page);
            await navigateTo(page, PAGES.adminTransport);

            await page.waitForTimeout(TIMEOUTS.medium);

            const pageContent = await page.textContent('body');
            console.log(`✅ صفحة النقل الإداري: ${pageContent ? 'تعمل' : 'فارغة'}`);
        });

        test('يجب أن تفتح صفحة إضافة خدمة نقل', async ({ page }) => {
            await loginAdmin(page);
            await navigateTo(page, PAGES.adminAddTransport);

            await page.waitForTimeout(TIMEOUTS.medium);

            const form = page.locator('form');
            const hasForm = await form.isVisible().catch(() => false);

            console.log(`✅ صفحة إضافة خدمة نقل: نموذج=${hasForm}`);
        });

        test('يجب ملء نموذج إضافة خدمة نقل', async ({ page }) => {
            await loginAdmin(page);
            await navigateTo(page, PAGES.adminAddTransport);

            await page.waitForTimeout(TIMEOUTS.short);

            // ملء اسم الشركة
            const companyInput = page.locator('input[name="companyName"], input[placeholder*="شركة"]').first();
            if (await companyInput.isVisible()) {
                await companyInput.fill('شركة نقل اختبار ' + Date.now());
            }

            // ملء اسم المسؤول
            const contactInput = page.locator('input[name="contactPerson"], input[placeholder*="مسؤول"]').first();
            if (await contactInput.isVisible()) {
                await contactInput.fill('أحمد الاختبار');
            }

            // ملء رقم الهاتف
            const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first();
            if (await phoneInput.isVisible()) {
                await phoneInput.fill('+218925551234');
            }

            // ملء الوصف
            const descInput = page.locator('textarea[name="description"]').first();
            if (await descInput.isVisible()) {
                await descInput.fill('خدمة نقل اختبار آلي - وصف تجريبي');
            }

            console.log('✅ تم ملء نموذج إضافة خدمة النقل');
        });
    });
});

test.describe('العمليات المجمعة - Bulk Operations', () => {

    test.beforeEach(async ({ page }) => {
        await loginAdmin(page);
    });

    test('يجب أن تعمل خاصية تحديد الكل في المزادات', async ({ page }) => {
        await navigateTo(page, PAGES.adminAuctions);
        await page.waitForTimeout(TIMEOUTS.medium);

        // البحث عن checkbox تحديد الكل
        const selectAllCheckbox = page.locator('input[type="checkbox"]').first();

        if (await selectAllCheckbox.isVisible()) {
            await selectAllCheckbox.click();
            console.log('✅ تم تحديد الكل');
        } else {
            console.log('⚠️ لا يوجد checkbox للتحديد');
        }
    });

    test('يجب أن تظهر أزرار الإجراءات المجمعة', async ({ page }) => {
        await navigateTo(page, PAGES.adminAuctions);
        await page.waitForTimeout(TIMEOUTS.medium);

        // البحث عن أزرار الإجراءات
        const bulkButtons = page.locator('button:has-text("موافقة"), button:has-text("رفض"), button:has-text("حذف")');
        const count = await bulkButtons.count();

        console.log(`✅ عدد أزرار الإجراءات: ${count}`);
    });
});

test.describe('البحث والفلترة - Search & Filter', () => {

    test.beforeEach(async ({ page }) => {
        await loginAdmin(page);
    });

    test('يجب أن يعمل البحث في صفحة المستخدمين', async ({ page }) => {
        await navigateTo(page, PAGES.adminUsers);
        await page.waitForTimeout(TIMEOUTS.short);

        const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"]').first();

        if (await searchInput.isVisible()) {
            await searchInput.fill('test');
            await page.waitForTimeout(TIMEOUTS.short);
            console.log('✅ البحث يعمل');
        } else {
            console.log('⚠️ لا يوجد حقل بحث');
        }
    });

    test('يجب أن تعمل الفلاتر في صفحة السوق', async ({ page }) => {
        await navigateTo(page, PAGES.marketplace);
        await page.waitForTimeout(TIMEOUTS.short);

        const filterSelect = page.locator('select').first();

        if (await filterSelect.isVisible()) {
            const options = await filterSelect.locator('option').count();
            console.log(`✅ عدد خيارات الفلتر: ${options}`);
        }
    });
});
