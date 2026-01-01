/**
 * سكربت فحص جميع صفحات الموقع واكتشاف أخطاء الكونسول
 * يتصفح كل صفحة ويسجل الأخطاء والتحذيرات
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// قائمة الصفحات للفحص (فقط الصفحات الموجودة فعلياً)
const PAGES_TO_CHECK = [
  // الصفحات العامة
  { path: '/', name: 'الصفحة الرئيسية' },
  { path: '/auctions', name: 'صفحة المزادات' },
  { path: '/marketplace', name: 'السوق' },
  { path: '/showrooms', name: 'المعارض' },
  { path: '/about', name: 'من نحن' },
  { path: '/contact', name: 'اتصل بنا' },
  { path: '/privacy', name: 'سياسة الخصوصية' },
  { path: '/terms', name: 'الشروط والأحكام' },

  // صفحات المصادقة
  { path: '/auth/login', name: 'تسجيل الدخول' },
  { path: '/auth/signup', name: 'التسجيل' },

  // صفحات إضافة إعلان
  { path: '/add-listing', name: 'إضافة إعلان' },
  { path: '/add-listing/car-details?type=auction', name: 'تفاصيل السيارة - مزاد' },
  { path: '/add-listing/car-details?type=marketplace', name: 'تفاصيل السيارة - بيع' },

  // صفحات المستخدم
  { path: '/profile', name: 'الملف الشخصي' },
  { path: '/favorites', name: 'المفضلة' },
  { path: '/messages', name: 'الرسائل' },
  { path: '/notifications', name: 'الإشعارات' },

  // صفحات البحث والتصفية
  { path: '/search', name: 'البحث' },
  { path: '/search?q=toyota', name: 'نتائج البحث' },
];

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// تصنيف الأخطاء
const ERROR_CATEGORIES = {
  REACT_HYDRATION: 'خطأ React Hydration',
  UNDEFINED_PROPERTY: 'خاصية غير معرفة',
  NETWORK_ERROR: 'خطأ شبكة',
  TYPE_ERROR: 'خطأ نوع',
  REFERENCE_ERROR: 'خطأ مرجع',
  SYNTAX_ERROR: 'خطأ صياغة',
  DEPRECATION: 'تحذير إهمال',
  REACT_WARNING: 'تحذير React',
  OTHER: 'أخرى',
};

function categorizeError(message) {
  const msg = message.toLowerCase();

  if (msg.includes('hydration') || msg.includes('hydrat')) {
    return ERROR_CATEGORIES.REACT_HYDRATION;
  }
  if (msg.includes('undefined') || msg.includes('null') || msg.includes('cannot read prop')) {
    return ERROR_CATEGORIES.UNDEFINED_PROPERTY;
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to load')) {
    return ERROR_CATEGORIES.NETWORK_ERROR;
  }
  if (msg.includes('typeerror')) {
    return ERROR_CATEGORIES.TYPE_ERROR;
  }
  if (msg.includes('referenceerror')) {
    return ERROR_CATEGORIES.REFERENCE_ERROR;
  }
  if (msg.includes('syntaxerror')) {
    return ERROR_CATEGORIES.SYNTAX_ERROR;
  }
  if (msg.includes('deprecated') || msg.includes('deprecation')) {
    return ERROR_CATEGORIES.DEPRECATION;
  }
  if (msg.includes('warning') && msg.includes('react')) {
    return ERROR_CATEGORIES.REACT_WARNING;
  }

  return ERROR_CATEGORIES.OTHER;
}

async function checkAllPages() {
  console.log('🚀 بدء فحص جميع الصفحات...\n');
  console.log(`📍 الرابط الأساسي: ${BASE_URL}`);
  console.log(`📄 عدد الصفحات: ${PAGES_TO_CHECK.length}\n`);
  console.log('='.repeat(80));

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const results = {
    totalPages: PAGES_TO_CHECK.length,
    checkedPages: 0,
    successPages: 0,
    errorPages: 0,
    pages: [],
    allErrors: [],
    allWarnings: [],
    errorsByCategory: {},
    timestamp: new Date().toISOString(),
  };

  for (const pageInfo of PAGES_TO_CHECK) {
    const page = await browser.newPage();
    const pageResult = {
      path: pageInfo.path,
      name: pageInfo.name,
      url: `${BASE_URL}${pageInfo.path}`,
      status: 'unknown',
      errors: [],
      warnings: [],
      loadTime: 0,
    };

    console.log(`\n🔍 فحص: ${pageInfo.name} (${pageInfo.path})`);

    // جمع أخطاء الكونسول
    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      const location = msg.location();

      // تجاهل الرسائل غير المهمة
      if (text.includes('[HMR]') || text.includes('[Fast Refresh]')) {
        return;
      }

      // تجاهل أخطاء Socket.IO المتوقعة (polling requests)
      if (location?.url?.includes('/api/socketio') || text.includes('socketio')) {
        return;
      }

      // تجاهل أخطاء webpack hot update
      if (location?.url?.includes('.webpack.hot-update') || text.includes('hot-update')) {
        return;
      }

      if (type === 'error') {
        const category = categorizeError(text);
        pageResult.errors.push({
          message: text,
          category,
          location: msg.location(),
        });

        // تجميع حسب الفئة
        if (!results.errorsByCategory[category]) {
          results.errorsByCategory[category] = [];
        }
        results.errorsByCategory[category].push({
          page: pageInfo.path,
          message: text,
        });
      } else if (type === 'warning') {
        pageResult.warnings.push({
          message: text,
          location: msg.location(),
        });
      }
    });

    // جمع أخطاء الصفحة
    page.on('pageerror', (error) => {
      const category = categorizeError(error.message);
      pageResult.errors.push({
        message: error.message,
        category,
        stack: error.stack,
      });
    });

    try {
      const startTime = Date.now();
      const response = await page.goto(pageResult.url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });
      pageResult.loadTime = Date.now() - startTime;

      // انتظار تحميل React
      await new Promise((resolve) => setTimeout(resolve, 2000));

      pageResult.httpStatus = response?.status() || 0;

      if (response?.ok()) {
        if (pageResult.errors.length === 0) {
          pageResult.status = 'success';
          results.successPages++;
          console.log(`   ✅ نجاح (${pageResult.loadTime}ms)`);
        } else {
          pageResult.status = 'warning';
          results.errorPages++;
          console.log(`   ⚠️ تحذير - ${pageResult.errors.length} أخطاء`);
          pageResult.errors.forEach((err) => {
            console.log(`      ❌ ${err.category}: ${err.message.substring(0, 100)}...`);
          });
        }
      } else {
        pageResult.status = 'error';
        results.errorPages++;
        console.log(`   ❌ فشل - HTTP ${pageResult.httpStatus}`);
      }
    } catch (error) {
      pageResult.status = 'error';
      pageResult.errors.push({
        message: error.message,
        category: 'PAGE_LOAD_ERROR',
      });
      results.errorPages++;
      console.log(`   ❌ خطأ في التحميل: ${error.message}`);
    }

    results.checkedPages++;
    results.pages.push(pageResult);
    results.allErrors.push(...pageResult.errors);
    results.allWarnings.push(...pageResult.warnings);

    await page.close();
  }

  await browser.close();

  // طباعة الملخص
  console.log('\n' + '='.repeat(80));
  console.log('\n📊 ملخص الفحص:');
  console.log(`   📄 إجمالي الصفحات: ${results.totalPages}`);
  console.log(`   ✅ صفحات ناجحة: ${results.successPages}`);
  console.log(`   ❌ صفحات بها مشاكل: ${results.errorPages}`);
  console.log(`   🔴 إجمالي الأخطاء: ${results.allErrors.length}`);
  console.log(`   🟡 إجمالي التحذيرات: ${results.allWarnings.length}`);

  if (Object.keys(results.errorsByCategory).length > 0) {
    console.log('\n📋 الأخطاء حسب الفئة:');
    for (const [category, errors] of Object.entries(results.errorsByCategory)) {
      console.log(`   ${category}: ${errors.length} أخطاء`);
    }
  }

  // حفظ التقرير
  const reportPath = path.join(__dirname, '..', 'test-reports', `pages-check-${Date.now()}.json`);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf-8');
  console.log(`\n💾 تم حفظ التقرير: ${reportPath}`);

  return results;
}

// تشغيل الفحص
checkAllPages()
  .then((results) => {
    if (results.errorPages > 0) {
      console.log('\n⚠️ يوجد صفحات تحتاج إصلاح!');
      process.exit(1);
    } else {
      console.log('\n✅ جميع الصفحات تعمل بشكل سليم!');
      process.exit(0);
    }
  })
  .catch((error) => {
    console.error('❌ خطأ في الفحص:', error);
    process.exit(1);
  });
