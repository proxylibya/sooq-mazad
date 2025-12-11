/**
 * اختبار محسن الكونسول
 * Console Optimizer Test
 */

import { ConsoleOptimizer, optimizeConsole, restoreConsole } from './consoleOptimizer';

/**
 * اختبار أساسي لمحسن الكونسول
 */
export function testConsoleOptimizer(): void {
  console.log('الاختبار بدء اختبار محسن الكونسول...');

  // حفظ الكونسول الأصلي
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  try {
    // تطبيق التحسينات
    optimizeConsole({
      maxLogsPerMinute: 5,
      maxWarnsPerMinute: 3,
      maxErrorsPerMinute: 2,
      silentPatterns: ['اختبار تجاهل'],
      debugMode: true,
    });

    console.log('تم بنجاح تم تطبيق التحسينات');

    // اختبار تجاهل الرسائل المحددة
    console.log('اختبار تجاهل - يجب ألا تظهر هذه الرسالة');
    console.log('رسالة عادية - يجب أن تظهر');

    // اختبار الحد الأقصى للرسائل
    for (let i = 1; i <= 10; i++) {
      console.log(`رسالة اختبار ${i}`);
    }

    // اختبار التحذيرات
    for (let i = 1; i <= 5; i++) {
      console.warn(`تحذير اختبار ${i}`);
    }

    // اختبار الأخطاء
    for (let i = 1; i <= 4; i++) {
      console.error(`خطأ اختبار ${i}`);
    }

    console.log('البحث اختبار مكتمل - تحقق من الكونسول للنتائج');
  } catch (error) {
    console.error('فشل خطأ في اختبار محسن الكونسول:', error);
  } finally {
    // استعادة الكونسول الأصلي
    restoreConsole();
    console.log('التحديث تم استعادة الكونسول الأصلي');
  }
}

/**
 * اختبار متقدم لمحسن الكونسول
 */
export function testAdvancedConsoleOptimizer(): void {
  console.log('🔬 بدء الاختبار المتقدم لمحسن الكونسول...');

  const optimizer = new ConsoleOptimizer({
    maxLogsPerMinute: 3,
    maxWarnsPerMinute: 2,
    maxErrorsPerMinute: 1,
    silentPatterns: ['متجاهل'],
    debugMode: true,
  });

  try {
    optimizer.apply();

    // اختبار إضافة نمط جديد
    optimizer.addSilentPattern('نمط جديد');
    console.log('نمط جديد - يجب تجاهل هذه الرسالة');

    // اختبار الإحصائيات
    console.log('رسالة 1');
    console.log('رسالة 2');
    console.log('رسالة 3');
    console.log('رسالة 4 - يجب تجاهلها');

    const stats = optimizer.getStats();
    console.log('الإحصائيات إحصائيات الاستخدام:', stats);

    // اختبار إزالة نمط
    optimizer.removeSilentPattern('نمط جديد');
    console.log('نمط جديد - يجب أن تظهر الآن');
  } catch (error) {
    console.error('فشل خطأ في الاختبار المتقدم:', error);
  } finally {
    optimizer.restore();
    console.log('التحديث تم استعادة الكونسول من الاختبار المتقدم');
  }
}

/**
 * اختبار الأداء
 */
export function testPerformance(): void {
  console.log('البرق بدء اختبار الأداء...');

  const startTime = performance.now();

  // تطبيق التحسينات
  optimizeConsole({
    maxLogsPerMinute: 100,
    debugMode: false, // تعطيل وضع التشخيص لاختبار الأداء
  });

  // إرسال 1000 رسالة
  for (let i = 0; i < 1000; i++) {
    console.log(`رسالة أداء ${i}`);
  }

  const endTime = performance.now();
  const duration = endTime - startTime;

  restoreConsole();
  console.log(`⏱️ وقت معالجة 1000 رسالة: ${duration.toFixed(2)} مللي ثانية`);
}

/**
 * تشغيل جميع الاختبارات
 */
export function runAllTests(): void {
  console.log('🚀 تشغيل جميع اختبارات محسن الكونسول...');
  console.log('='.repeat(50));

  try {
    testConsoleOptimizer();
    console.log('-'.repeat(30));

    testAdvancedConsoleOptimizer();
    console.log('-'.repeat(30));

    testPerformance();
    console.log('-'.repeat(30));

    console.log('تم بنجاح تم إكمال جميع الاختبارات بنجاح');
  } catch (error) {
    console.error('فشل فشل في تشغيل الاختبارات:', error);
  }

  console.log('='.repeat(50));
}

// تصدير دالة سريعة للاختبار
export default function quickTest(): void {
  if (process.env.NODE_ENV === 'development') {
    testConsoleOptimizer();
  }
}

// إضافة الاختبارات إلى window للوصول السهل في الكونسول
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testConsoleOptimizer = {
    basic: testConsoleOptimizer,
    advanced: testAdvancedConsoleOptimizer,
    performance: testPerformance,
    all: runAllTests,
  };

  console.log('الأدوات اختبارات محسن الكونسول متاحة في window.testConsoleOptimizer');
}
