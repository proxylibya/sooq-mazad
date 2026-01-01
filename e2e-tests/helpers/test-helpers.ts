/**
 * دوال مساعدة للاختبارات
 * Helper Functions for E2E Tests
 */

import { Page } from '@playwright/test';
import { PAGES, TEST_USERS, TIMEOUTS } from './test-data';

/**
 * تسجيل دخول مستخدم عادي
 */
export async function loginUser(page: Page, phone: string, password: string): Promise<void> {
    await page.goto(PAGES.login);
    await page.waitForLoadState('networkidle');

    // إدخال رقم الهاتف
    const phoneInput = page.locator('input[name="phone"], input[type="tel"], input[placeholder*="هاتف"]').first();
    await phoneInput.fill(phone);

    // إدخال كلمة المرور
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.fill(password);

    // الضغط على زر تسجيل الدخول
    const submitBtn = page.locator('button[type="submit"], button:has-text("دخول"), button:has-text("تسجيل الدخول")').first();
    await submitBtn.click();

    // انتظار التحميل
    await page.waitForLoadState('networkidle');
}

/**
 * تسجيل دخول المدير
 */
export async function loginAdmin(page: Page): Promise<void> {
    await page.goto(PAGES.adminLogin);
    await page.waitForLoadState('networkidle');

    // إدخال اسم المستخدم
    const usernameInput = page.locator('input[name="username"], input[name="loginIdentifier"], input[placeholder*="مستخدم"]').first();
    await usernameInput.fill(TEST_USERS.admin.username);

    // إدخال كلمة المرور
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.fill(TEST_USERS.admin.password);

    // الضغط على زر الدخول
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TIMEOUTS.short);
}

/**
 * التسجيل كمستخدم جديد
 */
export async function registerUser(page: Page, userData: {
    phone: string;
    password: string;
    name: string;
    city?: string;
}): Promise<void> {
    await page.goto(PAGES.register);
    await page.waitForLoadState('networkidle');

    // إدخال الاسم
    const nameInput = page.locator('input[name="name"], input[placeholder*="اسم"]').first();
    if (await nameInput.isVisible()) {
        await nameInput.fill(userData.name);
    }

    // إدخال رقم الهاتف
    const phoneInput = page.locator('input[name="phone"], input[type="tel"]').first();
    await phoneInput.fill(userData.phone);

    // إدخال كلمة المرور
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    await passwordInput.fill(userData.password);

    // تأكيد كلمة المرور (إذا موجود)
    const confirmInput = page.locator('input[name="confirmPassword"], input[name="passwordConfirm"]').first();
    if (await confirmInput.isVisible()) {
        await confirmInput.fill(userData.password);
    }

    // الضغط على زر التسجيل
    const submitBtn = page.locator('button[type="submit"]').first();
    await submitBtn.click();

    await page.waitForLoadState('networkidle');
}

/**
 * تسجيل الخروج
 */
export async function logout(page: Page): Promise<void> {
    const logoutBtn = page.locator('button:has-text("خروج"), a:has-text("خروج"), [data-testid="logout"]').first();
    if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
        await page.waitForLoadState('networkidle');
    }
}

/**
 * التنقل إلى صفحة مع الانتظار
 */
export async function navigateTo(page: Page, url: string): Promise<void> {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(TIMEOUTS.short);
}

/**
 * التحقق من وجود عنصر مرئي
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
    const element = page.locator(selector).first();
    try {
        await element.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });
        return true;
    } catch {
        return false;
    }
}

/**
 * الانتظار حتى تختفي رسالة التحميل
 */
export async function waitForLoading(page: Page): Promise<void> {
    const loadingSelectors = [
        '.loading',
        '[data-loading="true"]',
        '.spinner',
        '.animate-spin',
    ];

    for (const selector of loadingSelectors) {
        const loading = page.locator(selector);
        if (await loading.isVisible()) {
            await loading.waitFor({ state: 'hidden', timeout: TIMEOUTS.long });
        }
    }
}

/**
 * ملء نموذج بالبيانات
 */
export async function fillForm(page: Page, formData: Record<string, string | number>): Promise<void> {
    for (const [name, value] of Object.entries(formData)) {
        const input = page.locator(`input[name="${name}"], select[name="${name}"], textarea[name="${name}"]`).first();
        if (await input.isVisible()) {
            const tagName = await input.evaluate(el => el.tagName.toLowerCase());

            if (tagName === 'select') {
                await input.selectOption(String(value));
            } else {
                await input.fill(String(value));
            }
        }
    }
}

/**
 * الضغط على زر وانتظار الاستجابة
 */
export async function clickAndWait(page: Page, selector: string): Promise<void> {
    const button = page.locator(selector).first();
    await button.click();
    await page.waitForLoadState('networkidle');
}

/**
 * أخذ لقطة شاشة
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
    await page.screenshot({
        path: `test-results/screenshots/${name}-${Date.now()}.png`,
        fullPage: true,
    });
}

/**
 * التحقق من استجابة API
 */
export async function checkApiResponse(page: Page, url: string): Promise<{
    status: number;
    ok: boolean;
    data: unknown;
}> {
    const response = await page.request.get(url);
    return {
        status: response.status(),
        ok: response.ok(),
        data: await response.json().catch(() => null),
    };
}

/**
 * إنشاء رقم هاتف عشوائي للاختبار
 */
export function generateTestPhone(): string {
    const suffix = Math.floor(Math.random() * 9000000) + 1000000;
    return `+21892${suffix}`;
}

/**
 * التحقق من وجود نص في الصفحة
 */
export async function hasText(page: Page, text: string): Promise<boolean> {
    const content = await page.textContent('body');
    return content?.includes(text) ?? false;
}

/**
 * انتظار ظهور رسالة نجاح
 */
export async function waitForSuccessMessage(page: Page): Promise<boolean> {
    const successSelectors = [
        '.toast-success',
        '.alert-success',
        '[class*="success"]',
        ':has-text("بنجاح")',
    ];

    for (const selector of successSelectors) {
        const element = page.locator(selector).first();
        try {
            await element.waitFor({ state: 'visible', timeout: TIMEOUTS.medium });
            return true;
        } catch {
            continue;
        }
    }
    return false;
}

/**
 * التحقق من عدم وجود أخطاء في الكونسول
 */
export async function checkConsoleErrors(page: Page): Promise<string[]> {
    const errors: string[] = [];

    page.on('console', msg => {
        if (msg.type() === 'error') {
            errors.push(msg.text());
        }
    });

    page.on('pageerror', error => {
        errors.push(error.message);
    });

    return errors;
}

/**
 * عد العناصر في قائمة
 */
export async function countElements(page: Page, selector: string): Promise<number> {
    return await page.locator(selector).count();
}

/**
 * التمرير إلى نهاية الصفحة
 */
export async function scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(() => {
        window.scrollTo(0, document.body.scrollHeight);
    });
    await page.waitForTimeout(TIMEOUTS.short);
}

/**
 * التمرير إلى عنصر معين
 */
export async function scrollToElement(page: Page, selector: string): Promise<void> {
    const element = page.locator(selector).first();
    await element.scrollIntoViewIfNeeded();
}
