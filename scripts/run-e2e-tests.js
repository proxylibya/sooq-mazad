/**
 * سكريبت تشغيل الاختبارات الشاملة
 * Comprehensive E2E Test Runner
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// الألوان للمخرجات
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(60) + '\n');
}

function logStep(step, status = 'info') {
  const icons = {
    info: '📋',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    running: '🔄',
  };
  log(
    `${icons[status]} ${step}`,
    status === 'success' ? 'green' : status === 'error' ? 'red' : 'yellow',
  );
}

async function main() {
  const startTime = Date.now();

  console.log('\n');
  log('╔══════════════════════════════════════════════════════════╗', 'magenta');
  log('║                                                          ║', 'magenta');
  log('║     🤖 بوت الاختبار الشامل - Sooq Mazad                  ║', 'magenta');
  log('║     Comprehensive E2E Testing Bot                        ║', 'magenta');
  log('║                                                          ║', 'magenta');
  log('╚══════════════════════════════════════════════════════════╝', 'magenta');
  console.log('\n');

  const results = {
    passed: 0,
    failed: 0,
    skipped: 0,
    errors: [],
    startTime: new Date().toISOString(),
  };

  try {
    // ==========================================
    // المرحلة 1: التحقق من المتطلبات
    // ==========================================
    logSection('المرحلة 1: التحقق من المتطلبات');

    // فحص وجود Playwright
    logStep('التحقق من تثبيت Playwright...', 'running');
    try {
      execSync('npx playwright --version', { stdio: 'pipe' });
      logStep('Playwright مثبت', 'success');
    } catch {
      logStep('تثبيت Playwright...', 'warning');
      execSync('npm install -D @playwright/test', { stdio: 'inherit' });
      execSync('npx playwright install chromium', { stdio: 'inherit' });
      logStep('تم تثبيت Playwright', 'success');
    }

    // فحص وجود ملفات الاختبار
    const testDir = path.join(process.cwd(), 'e2e-tests');
    if (!fs.existsSync(testDir)) {
      throw new Error('مجلد الاختبارات غير موجود: e2e-tests');
    }

    const testFiles = fs.readdirSync(testDir).filter((f) => f.endsWith('.spec.ts'));
    logStep(`عدد ملفات الاختبار: ${testFiles.length}`, 'success');

    // ==========================================
    // المرحلة 2: فحص حالة الخادم
    // ==========================================
    logSection('المرحلة 2: فحص حالة الخادم');

    logStep('التحقق من تشغيل الخادم على المنفذ 3021...', 'running');

    let serverRunning = false;
    try {
      const http = require('http');
      await new Promise((resolve, reject) => {
        const req = http.get('http://localhost:3021', (res) => {
          serverRunning = res.statusCode < 500;
          resolve();
        });
        req.on('error', () => resolve());
        req.setTimeout(5000, () => {
          req.destroy();
          resolve();
        });
      });
    } catch {}

    if (serverRunning) {
      logStep('الخادم يعمل على المنفذ 3021', 'success');
    } else {
      logStep('الخادم غير متاح - سيتم تشغيله تلقائياً مع الاختبارات', 'warning');
    }

    // ==========================================
    // المرحلة 3: تشغيل الاختبارات
    // ==========================================
    logSection('المرحلة 3: تشغيل الاختبارات');

    // إنشاء مجلد النتائج
    const resultsDir = path.join(process.cwd(), 'test-results');
    const screenshotsDir = path.join(resultsDir, 'screenshots');

    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    logStep('بدء تشغيل الاختبارات...', 'running');
    console.log('\n');

    // تشغيل Playwright
    try {
      execSync('npx playwright test --reporter=list', {
        stdio: 'inherit',
        env: { ...process.env, FORCE_COLOR: '1' },
      });
      results.passed++;
      logStep('جميع الاختبارات نجحت!', 'success');
    } catch (error) {
      results.failed++;
      logStep('بعض الاختبارات فشلت', 'error');
      results.errors.push(error.message);
    }

    // ==========================================
    // المرحلة 4: إنشاء التقرير
    // ==========================================
    logSection('المرحلة 4: إنشاء التقرير');

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    const report = {
      ...results,
      endTime: new Date().toISOString(),
      duration: `${duration} ثانية`,
      testFiles: testFiles,
      environment: {
        node: process.version,
        platform: process.platform,
        cwd: process.cwd(),
      },
    };

    // حفظ التقرير
    const reportPath = path.join(resultsDir, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
    logStep(`تم حفظ التقرير: ${reportPath}`, 'success');

    // إنشاء تقرير Markdown
    const mdReport = `# تقرير الاختبارات الشامل

## معلومات التشغيل
- **تاريخ البدء:** ${report.startTime}
- **تاريخ الانتهاء:** ${report.endTime}
- **المدة:** ${report.duration}
- **النظام:** ${report.environment.platform}
- **Node.js:** ${report.environment.node}

## النتائج
- **نجح:** ${results.passed}
- **فشل:** ${results.failed}
- **تم تخطيه:** ${results.skipped}

## ملفات الاختبار
${testFiles.map((f) => `- ${f}`).join('\n')}

## الأخطاء
${results.errors.length > 0 ? results.errors.map((e) => `- ${e}`).join('\n') : 'لا توجد أخطاء'}

---
*تم إنشاء هذا التقرير تلقائياً بواسطة بوت الاختبار*
`;

    const mdReportPath = path.join(resultsDir, 'test-report.md');
    fs.writeFileSync(mdReportPath, mdReport, 'utf8');
    logStep(`تم حفظ تقرير Markdown: ${mdReportPath}`, 'success');

    // ==========================================
    // الملخص النهائي
    // ==========================================
    console.log('\n');
    log('╔══════════════════════════════════════════════════════════╗', 'green');
    log('║                    📊 الملخص النهائي                     ║', 'green');
    log('╚══════════════════════════════════════════════════════════╝', 'green');
    console.log('\n');

    log(`   ⏱️  المدة الإجمالية: ${duration} ثانية`, 'cyan');
    log(`   📁 ملفات الاختبار: ${testFiles.length}`, 'cyan');
    log(`   ✅ نجح: ${results.passed}`, 'green');
    log(`   ❌ فشل: ${results.failed}`, results.failed > 0 ? 'red' : 'green');

    console.log('\n');
    log('   📂 التقارير:', 'yellow');
    log(`      - JSON: ${reportPath}`, 'yellow');
    log(`      - Markdown: ${mdReportPath}`, 'yellow');
    log(`      - HTML: test-reports/html/index.html`, 'yellow');

    console.log('\n');

    // فتح تقرير HTML
    logStep('لفتح تقرير HTML، نفذ الأمر:', 'info');
    log('   npx playwright show-report test-reports/html', 'cyan');

    console.log('\n');
  } catch (error) {
    logSection('خطأ!');
    logStep(error.message, 'error');
    process.exit(1);
  }
}

// تشغيل
main().catch(console.error);
