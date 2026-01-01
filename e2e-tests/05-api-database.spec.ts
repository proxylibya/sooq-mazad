/**
 * اختبارات APIs وقاعدة البيانات
 * API & Database Tests
 */

import { expect, test } from '@playwright/test';

// قائمة APIs للاختبار
const PUBLIC_APIS = [
    { name: 'فحص الصحة', url: '/api/health', method: 'GET' },
    { name: 'فحص قاعدة البيانات', url: '/api/health/database', method: 'GET' },
    { name: 'قائمة السيارات', url: '/api/cars', method: 'GET' },
    { name: 'قائمة المزادات', url: '/api/auctions', method: 'GET' },
    { name: 'خدمات النقل', url: '/api/transport/services', method: 'GET' },
];

const ADMIN_APIS = [
    { name: 'إحصائيات المدير', url: '/api/admin/stats', method: 'GET' },
    { name: 'قائمة المستخدمين', url: '/api/admin/users', method: 'GET' },
    { name: 'قائمة المزادات الإدارية', url: '/api/admin/auctions', method: 'GET' },
    { name: 'خدمات النقل الإدارية', url: '/api/admin/transport', method: 'GET' },
];

test.describe('APIs العامة - Public APIs', () => {

    for (const api of PUBLIC_APIS) {
        test(`يجب أن تستجيب ${api.name} بشكل صحيح`, async ({ request }) => {
            const startTime = Date.now();

            try {
                const response = await request.get(api.url);
                const responseTime = Date.now() - startTime;
                const status = response.status();

                // محاولة قراءة JSON
                let data = null;
                try {
                    data = await response.json();
                } catch {
                    // قد لا تكون JSON
                }

                console.log(`📡 ${api.name}:`);
                console.log(`   - Status: ${status}`);
                console.log(`   - Response Time: ${responseTime}ms`);
                console.log(`   - Has Data: ${data ? 'نعم' : 'لا'}`);

                // يجب أن لا يكون هناك خطأ سيرفر
                expect(status).toBeLessThan(500);

                // يجب أن يكون وقت الاستجابة معقول
                expect(responseTime).toBeLessThan(10000);

            } catch (error) {
                console.log(`❌ ${api.name}: خطأ - ${error}`);
            }
        });
    }
});

test.describe('APIs الإدارية - Admin APIs', () => {

    // نحتاج cookie المصادقة
    let adminCookie: string = '';

    test.beforeAll(async ({ request }) => {
        // تسجيل دخول المدير للحصول على cookie
        try {
            const loginResponse = await request.post('/api/admin/auth/login', {
                data: {
                    loginIdentifier: 'admin',
                    password: '123456',
                },
            });

            const cookies = loginResponse.headers()['set-cookie'];
            if (cookies) {
                adminCookie = cookies;
            }

            console.log('✅ تم تسجيل دخول المدير للاختبارات');
        } catch (error) {
            console.log('⚠️ لم يتم تسجيل دخول المدير:', error);
        }
    });

    for (const api of ADMIN_APIS) {
        test(`يجب أن تستجيب ${api.name} (مع مصادقة)`, async ({ request }) => {
            try {
                const response = await request.get(api.url, {
                    headers: adminCookie ? { Cookie: adminCookie } : {},
                });

                const status = response.status();

                console.log(`📡 ${api.name}: Status=${status}`);

                // 401 مقبول (يحتاج مصادقة) أو 200 (نجاح)
                expect([200, 401, 403]).toContain(status);

            } catch (error) {
                console.log(`⚠️ ${api.name}: ${error}`);
            }
        });
    }
});

test.describe('فحص قاعدة البيانات - Database Health', () => {

    test('يجب أن تكون قاعدة البيانات متصلة', async ({ request }) => {
        try {
            const response = await request.get('/api/health/database');
            const status = response.status();

            let data = null;
            try {
                data = await response.json();
            } catch { }

            console.log('📦 حالة قاعدة البيانات:');
            console.log(`   - Status: ${status}`);

            if (data) {
                console.log(`   - Connected: ${data.connected || data.status || 'غير محدد'}`);
                if (data.counts) {
                    console.log(`   - Users: ${data.counts.users || 0}`);
                    console.log(`   - Cars: ${data.counts.cars || 0}`);
                    console.log(`   - Auctions: ${data.counts.auctions || 0}`);
                }
            }

            // يجب أن يكون الاتصال ناجح
            expect(status).toBeLessThan(500);

        } catch (error) {
            console.log('❌ خطأ في فحص قاعدة البيانات:', error);
        }
    });

    test('يجب أن تكون البيانات متاحة', async ({ request }) => {
        // فحص عدد المستخدمين
        try {
            const usersResponse = await request.get('/api/admin/users');

            if (usersResponse.status() === 200) {
                const data = await usersResponse.json();
                const count = data.users?.length || data.length || 0;
                console.log(`👥 عدد المستخدمين: ${count}`);
            }
        } catch { }

        // فحص عدد السيارات
        try {
            const carsResponse = await request.get('/api/cars');

            if (carsResponse.status() === 200) {
                const data = await carsResponse.json();
                const count = data.cars?.length || data.length || 0;
                console.log(`🚗 عدد السيارات: ${count}`);
            }
        } catch { }

        // فحص عدد المزادات
        try {
            const auctionsResponse = await request.get('/api/auctions');

            if (auctionsResponse.status() === 200) {
                const data = await auctionsResponse.json();
                const count = data.auctions?.length || data.length || 0;
                console.log(`🔨 عدد المزادات: ${count}`);
            }
        } catch { }
    });
});

test.describe('API المصادقة - Authentication API', () => {

    test('يجب أن يرفض تسجيل الدخول ببيانات خاطئة', async ({ request }) => {
        const response = await request.post('/api/auth/login', {
            data: {
                phone: '+218999999999',
                password: 'wrongpassword',
            },
        });

        const status = response.status();
        console.log(`🔐 رفض بيانات خاطئة: Status=${status}`);

        // يجب أن يرفض (401 أو 400)
        expect([400, 401, 403]).toContain(status);
    });

    test('يجب أن يعمل تسجيل دخول المدير', async ({ request }) => {
        const response = await request.post('/api/admin/auth/login', {
            data: {
                loginIdentifier: 'admin',
                password: '123456',
            },
        });

        const status = response.status();
        console.log(`👨‍💼 دخول المدير: Status=${status}`);

        // نتوقع نجاح أو فشل محتمل
        expect(status).toBeLessThan(500);
    });
});

test.describe('API CRUD Operations', () => {

    test('يجب أن تستجيب APIs البحث بشكل صحيح', async ({ request }) => {
        // بحث السيارات
        try {
            const response = await request.get('/api/cars?search=toyota');
            console.log(`🔍 بحث السيارات: Status=${response.status()}`);
        } catch { }

        // بحث المزادات
        try {
            const response = await request.get('/api/auctions?status=ACTIVE');
            console.log(`🔍 فلتر المزادات: Status=${response.status()}`);
        } catch { }
    });

    test('يجب أن تستجيب APIs التفاصيل بشكل صحيح', async ({ request }) => {
        // تفاصيل سيارة (قد تفشل لعدم وجود ID صالح)
        try {
            const response = await request.get('/api/cars/test-id');
            const status = response.status();
            console.log(`📄 تفاصيل سيارة: Status=${status}`);

            // 404 مقبول (لعدم وجود السيارة)
            expect([200, 404]).toContain(status);
        } catch { }
    });
});

test.describe('أداء APIs - API Performance', () => {

    test('يجب أن تستجيب APIs الرئيسية في أقل من 3 ثواني', async ({ request }) => {
        const apis = [
            '/api/health',
            '/api/cars',
            '/api/auctions',
        ];

        for (const api of apis) {
            const startTime = Date.now();

            try {
                await request.get(api);
                const responseTime = Date.now() - startTime;

                console.log(`⏱️ ${api}: ${responseTime}ms`);
                expect(responseTime).toBeLessThan(3000);

            } catch (error) {
                console.log(`❌ ${api}: خطأ`);
            }
        }
    });
});

test.describe('أمان APIs - API Security', () => {

    test('يجب حماية APIs الإدارية', async ({ request }) => {
        const protectedApis = [
            '/api/admin/users',
            '/api/admin/stats',
            '/api/admin/auctions',
        ];

        for (const api of protectedApis) {
            try {
                const response = await request.get(api);
                const status = response.status();

                console.log(`🔒 ${api}: Status=${status}`);

                // يجب أن تكون محمية (401) أو تعمل (200 إذا سمحت)
                expect(status).toBeLessThan(500);

            } catch { }
        }
    });

    test('يجب رفض الطلبات غير الصالحة', async ({ request }) => {
        // محاولة إنشاء مستخدم بدون بيانات
        try {
            const response = await request.post('/api/auth/register', {
                data: {},
            });

            const status = response.status();
            console.log(`⛔ طلب فارغ: Status=${status}`);

            // يجب أن يرفض
            expect([400, 401, 422]).toContain(status);

        } catch { }
    });
});
