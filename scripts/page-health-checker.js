/**
 * 🔍 Page Health Checker Bot
 * سكريبت فحص تلقائي لجميع صفحات الموقع
 *
 * يقوم بـ:
 * - فحص جميع الصفحات المتاحة
 * - التحقق من حالة الاستجابة
 * - اكتشاف أخطاء الـ 404 و 500
 * - تسجيل النتائج
 * - إنشاء تقرير شامل
 *
 * الاستخدام:
 * node scripts/page-health-checker.js
 * node scripts/page-health-checker.js --with-auth
 * node scripts/page-health-checker.js --continuous
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

// =====================================
// Configuration
// =====================================

const CONFIG = {
  baseUrl: process.env.BASE_URL || 'http://localhost:3021',
  timeout: 10000, // 10 seconds
  retries: 2,
  delayBetweenRequests: 500, // ms
  outputDir: path.join(__dirname, '../test-reports'),

  // صفحات عامة للفحص
  publicPages: [
    '/',
    '/auctions',
    '/marketplace',
    '/showrooms',
    '/transport',
    '/about',
    '/contact',
    '/help',
    '/privacy',
    '/terms',
    '/faq',
    '/search',
    '/premium-cars',
    '/companies',
    '/financing-calculator',
    '/yards',
  ],

  // صفحات تتطلب تسجيل دخول
  protectedPages: [
    '/notifications',
    '/messages',
    '/favorites',
    '/my-account',
    '/wallet',
    '/settings',
    '/my-ads',
    '/profile',
    '/add-listing',
  ],

  // صفحات إدارية
  adminPages: ['/admin/login', '/admin', '/admin/users', '/admin/auctions', '/admin/transport'],
};

// =====================================
// Colors for console output
// =====================================

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

// =====================================
// HTTP Request Helper
// =====================================

async function makeRequest(url, options = {}) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const parsedUrl = new URL(url);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const requestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'Page-Health-Checker-Bot/1.0',
        Accept: 'text/html,application/json',
        ...(options.headers || {}),
      },
    };

    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        const endTime = Date.now();
        resolve({
          url,
          statusCode: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          responseTime: endTime - startTime,
          bodyLength: data.length,
          redirectUrl: res.headers.location || null,
          success: res.statusCode >= 200 && res.statusCode < 400,
          error: null,
        });
      });
    });

    req.on('error', (error) => {
      resolve({
        url,
        statusCode: 0,
        statusMessage: 'Connection Error',
        headers: {},
        responseTime: Date.now() - startTime,
        bodyLength: 0,
        redirectUrl: null,
        success: false,
        error: error.message,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        statusCode: 0,
        statusMessage: 'Timeout',
        headers: {},
        responseTime: CONFIG.timeout,
        bodyLength: 0,
        redirectUrl: null,
        success: false,
        error: 'Request timeout',
      });
    });

    req.end();
  });
}

// =====================================
// Page Checker
// =====================================

async function checkPage(pagePath, options = {}) {
  const url = `${CONFIG.baseUrl}${pagePath}`;
  let result = null;

  for (let attempt = 0; attempt <= CONFIG.retries; attempt++) {
    result = await makeRequest(url, options);
    if (result.success || result.statusCode === 307 || result.statusCode === 302) {
      break;
    }
    if (attempt < CONFIG.retries) {
      await sleep(1000);
    }
  }

  return {
    path: pagePath,
    ...result,
    category: options.category || 'unknown',
  };
}

async function checkAllPages(options = {}) {
  const results = {
    timestamp: new Date().toISOString(),
    baseUrl: CONFIG.baseUrl,
    summary: {
      total: 0,
      success: 0,
      redirects: 0,
      errors: 0,
      notFound: 0,
      serverErrors: 0,
    },
    pages: [],
  };

  log('\n========================================', 'cyan');
  log('  Page Health Checker Bot', 'bright');
  log('========================================\n', 'cyan');
  log(`Base URL: ${CONFIG.baseUrl}`, 'blue');
  log(`Started: ${results.timestamp}\n`, 'blue');

  // Check public pages
  log('Checking Public Pages...', 'yellow');
  for (const page of CONFIG.publicPages) {
    const result = await checkPage(page, { category: 'public' });
    results.pages.push(result);
    logPageResult(result);
    await sleep(CONFIG.delayBetweenRequests);
  }

  // Check protected pages (will likely redirect to login)
  log('\nChecking Protected Pages...', 'yellow');
  for (const page of CONFIG.protectedPages) {
    const result = await checkPage(page, {
      category: 'protected',
      headers: options.authCookie ? { Cookie: options.authCookie } : {},
    });
    results.pages.push(result);
    logPageResult(result);
    await sleep(CONFIG.delayBetweenRequests);
  }

  // Check admin pages
  log('\nChecking Admin Pages...', 'yellow');
  for (const page of CONFIG.adminPages) {
    const result = await checkPage(page, {
      category: 'admin',
      headers: options.adminCookie ? { Cookie: options.adminCookie } : {},
    });
    results.pages.push(result);
    logPageResult(result);
    await sleep(CONFIG.delayBetweenRequests);
  }

  // Calculate summary
  results.summary.total = results.pages.length;
  for (const page of results.pages) {
    if (page.statusCode >= 200 && page.statusCode < 300) {
      results.summary.success++;
    } else if (page.statusCode >= 300 && page.statusCode < 400) {
      results.summary.redirects++;
    } else if (page.statusCode === 404) {
      results.summary.notFound++;
      results.summary.errors++;
    } else if (page.statusCode >= 500) {
      results.summary.serverErrors++;
      results.summary.errors++;
    } else if (page.statusCode === 0) {
      results.summary.errors++;
    }
  }

  return results;
}

function logPageResult(result) {
  const statusIcon = getStatusIcon(result.statusCode);
  const statusColor = getStatusColor(result.statusCode);
  const timeStr = `${result.responseTime}ms`.padStart(6);

  console.log(
    `  ${statusIcon} ${colors[statusColor]}${String(result.statusCode || 'ERR').padStart(3)}${colors.reset} ` +
      `${timeStr} ${result.path}` +
      (result.redirectUrl ? ` -> ${result.redirectUrl}` : '') +
      (result.error ? ` [${result.error}]` : ''),
  );
}

function getStatusIcon(statusCode) {
  if (statusCode >= 200 && statusCode < 300) return '✓';
  if (statusCode >= 300 && statusCode < 400) return '→';
  if (statusCode === 404) return '✗';
  if (statusCode >= 500) return '!';
  return '?';
}

function getStatusColor(statusCode) {
  if (statusCode >= 200 && statusCode < 300) return 'green';
  if (statusCode >= 300 && statusCode < 400) return 'yellow';
  if (statusCode === 404) return 'red';
  if (statusCode >= 500) return 'magenta';
  return 'red';
}

// =====================================
// Report Generator
// =====================================

function generateReport(results) {
  const reportPath = path.join(CONFIG.outputDir, `health-report-${Date.now()}.json`);
  const htmlReportPath = path.join(CONFIG.outputDir, `health-report-${Date.now()}.html`);

  // Ensure output directory exists
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }

  // Save JSON report
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  // Generate HTML report
  const htmlContent = generateHtmlReport(results);
  fs.writeFileSync(htmlReportPath, htmlContent);

  return { jsonPath: reportPath, htmlPath: htmlReportPath };
}

function generateHtmlReport(results) {
  const errorPages = results.pages.filter((p) => p.statusCode >= 400 || p.statusCode === 0);
  const redirectPages = results.pages.filter((p) => p.statusCode >= 300 && p.statusCode < 400);
  const successPages = results.pages.filter((p) => p.statusCode >= 200 && p.statusCode < 300);

  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>تقرير صحة الصفحات - ${results.timestamp}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; }
    h1 { color: #333; text-align: center; }
    .summary { display: flex; gap: 20px; justify-content: center; margin: 20px 0; flex-wrap: wrap; }
    .stat { background: white; padding: 20px 30px; border-radius: 10px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    .stat-value { font-size: 36px; font-weight: bold; }
    .stat-label { color: #666; margin-top: 5px; }
    .success { color: #4caf50; }
    .warning { color: #ff9800; }
    .error { color: #f44336; }
    table { width: 100%; border-collapse: collapse; background: white; margin: 20px 0; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
    th, td { padding: 12px 15px; text-align: right; border-bottom: 1px solid #eee; }
    th { background: #333; color: white; }
    tr:hover { background: #f9f9f9; }
    .status-200 { color: #4caf50; font-weight: bold; }
    .status-300 { color: #ff9800; font-weight: bold; }
    .status-400 { color: #f44336; font-weight: bold; }
    .status-500 { color: #9c27b0; font-weight: bold; }
    .status-0 { color: #f44336; font-weight: bold; }
    .section { margin: 30px 0; }
    .section-title { font-size: 20px; color: #333; margin-bottom: 10px; padding: 10px; background: #e0e0e0; border-radius: 5px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>تقرير صحة الصفحات</h1>
    <p style="text-align: center; color: #666;">${results.timestamp}</p>
    
    <div class="summary">
      <div class="stat">
        <div class="stat-value">${results.summary.total}</div>
        <div class="stat-label">إجمالي الصفحات</div>
      </div>
      <div class="stat">
        <div class="stat-value success">${results.summary.success}</div>
        <div class="stat-label">ناجحة</div>
      </div>
      <div class="stat">
        <div class="stat-value warning">${results.summary.redirects}</div>
        <div class="stat-label">إعادة توجيه</div>
      </div>
      <div class="stat">
        <div class="stat-value error">${results.summary.errors}</div>
        <div class="stat-label">أخطاء</div>
      </div>
    </div>
    
    ${
      errorPages.length > 0
        ? `
    <div class="section">
      <div class="section-title error">الصفحات التي بها أخطاء (${errorPages.length})</div>
      <table>
        <thead>
          <tr><th>المسار</th><th>الحالة</th><th>الوقت</th><th>الخطأ</th></tr>
        </thead>
        <tbody>
          ${errorPages
            .map(
              (p) => `
            <tr>
              <td>${p.path}</td>
              <td class="status-${Math.floor(p.statusCode / 100) * 100}">${p.statusCode || 'ERR'}</td>
              <td>${p.responseTime}ms</td>
              <td>${p.error || p.statusMessage || '-'}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
    `
        : ''
    }
    
    <div class="section">
      <div class="section-title">جميع الصفحات</div>
      <table>
        <thead>
          <tr><th>المسار</th><th>النوع</th><th>الحالة</th><th>الوقت</th><th>إعادة التوجيه</th></tr>
        </thead>
        <tbody>
          ${results.pages
            .map(
              (p) => `
            <tr>
              <td>${p.path}</td>
              <td>${p.category}</td>
              <td class="status-${Math.floor(p.statusCode / 100) * 100}">${p.statusCode || 'ERR'}</td>
              <td>${p.responseTime}ms</td>
              <td>${p.redirectUrl || '-'}</td>
            </tr>
          `,
            )
            .join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
}

// =====================================
// Print Summary
// =====================================

function printSummary(results) {
  log('\n========================================', 'cyan');
  log('  Summary / ملخص', 'bright');
  log('========================================\n', 'cyan');

  log(`  Total Pages:     ${results.summary.total}`, 'blue');
  log(`  Successful:      ${results.summary.success}`, 'green');
  log(`  Redirects:       ${results.summary.redirects}`, 'yellow');
  log(`  Errors:          ${results.summary.errors}`, 'red');
  log(`  Not Found (404): ${results.summary.notFound}`, 'red');
  log(`  Server Errors:   ${results.summary.serverErrors}`, 'magenta');

  const successRate = ((results.summary.success / results.summary.total) * 100).toFixed(1);
  log(`\n  Success Rate:    ${successRate}%`, successRate >= 80 ? 'green' : 'red');

  // List error pages
  const errorPages = results.pages.filter((p) => p.statusCode >= 400 || p.statusCode === 0);
  if (errorPages.length > 0) {
    log('\n  Pages with Errors:', 'red');
    errorPages.forEach((p) => {
      log(`    - ${p.path} (${p.statusCode || 'ERR'}: ${p.error || p.statusMessage})`, 'red');
    });
  }
}

// =====================================
// Utilities
// =====================================

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// =====================================
// Main Entry Point
// =====================================

async function main() {
  const args = process.argv.slice(2);
  const continuous = args.includes('--continuous');
  const withAuth = args.includes('--with-auth');

  const options = {};

  // If --with-auth, you can pass cookies via environment variables
  if (withAuth) {
    options.authCookie = process.env.AUTH_COOKIE || '';
    options.adminCookie = process.env.ADMIN_COOKIE || '';
  }

  if (continuous) {
    log('Running in continuous mode. Press Ctrl+C to stop.', 'yellow');
    while (true) {
      const results = await checkAllPages(options);
      printSummary(results);
      const { jsonPath, htmlPath } = generateReport(results);
      log(`\nReport saved to: ${htmlPath}`, 'green');
      log('\nWaiting 5 minutes before next check...', 'yellow');
      await sleep(5 * 60 * 1000); // 5 minutes
    }
  } else {
    const results = await checkAllPages(options);
    printSummary(results);
    const { jsonPath, htmlPath } = generateReport(results);
    log(`\n  JSON Report: ${jsonPath}`, 'green');
    log(`  HTML Report: ${htmlPath}`, 'green');

    // Exit with error code if there are errors
    if (results.summary.errors > 0) {
      process.exit(1);
    }
  }
}

// Run
main().catch(console.error);
