/**
 * سكريبت مراقبة الأداء المباشر
 * يعرض مقاييس الأداء في الوقت الفعلي
 */

const http = require('http');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3021';
const INTERVAL = parseInt(process.env.INTERVAL || '5000', 10);
// ألوان للطباعة
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function fetchMetrics() {
  return new Promise((resolve, reject) => {
    http
      .get(`${BASE_URL}/api/metrics`, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          resolve(data);
        });
      })
      .on('error', reject);
  });
}

function parseMetrics(data) {
  const metrics = {};
  const lines = data.split('\n');
  for (const line of lines) {
    if (line.startsWith('#') || !line.trim()) continue;

    const [metricPart, value] = line.split(' ');
    if (!metricPart || !value) continue;

    const match = metricPart.match(/^([^{]+)(?:{(.+)})?$/);
    if (!match) continue;

    const [, name, labels] = match;
    if (!metrics[name]) {
      metrics[name] = [];
    }

    metrics[name].push({
      labels: labels || '',
      value: parseFloat(value),
    });
  }

  return metrics;
}

function displayMetrics(metrics) {
  console.clear();
  log('═══════════════════════════════════════════════════════', colors.bright);
  log('          سوق مزاد - مراقبة الأداء المباشر', colors.cyan);
  log('═══════════════════════════════════════════════════════', colors.bright);
  log(`الوقت: ${new Date().toLocaleString('ar-LY')}\n`);

  // HTTP Requests
  const httpRequests = metrics['mazad_http_requests_total'];
  if (httpRequests) {
    log('📊 طلبات HTTP:', colors.bright);
    const total = httpRequests.reduce((sum, m) => sum + m.value, 0);
    log(`   إجمالي: ${total.toFixed(0)} طلب`, colors.green);
  }

  // Database Queries
  const dbQueries = metrics['mazad_db_queries_total'];
  if (dbQueries) {
    log('\n💾 استعلامات قاعدة البيانات:', colors.bright);
    const total = dbQueries.reduce((sum, m) => sum + m.value, 0);
    const successful = dbQueries
      .filter((m) => m.labels.includes('success'))
      .reduce((sum, m) => sum + m.value, 0);
    const failed = total - successful;
    log(
      `   إجمالي: ${total.toFixed(0)} | ناجح: ${successful.toFixed(0)} | فاشل: ${failed.toFixed(0)}`,
      failed > 0 ? colors.yellow : colors.green,
    );
  }

  // Cache Performance
  const cacheHits = metrics['mazad_cache_hits_total'];
  if (cacheHits) {
    log('\n🔥 أداء الكاش:', colors.bright);
    const hits = cacheHits
      .filter((m) => m.labels.includes('hit="true"'))
      .reduce((sum, m) => sum + m.value, 0);
    const misses = cacheHits
      .filter((m) => m.labels.includes('hit="false"'))
      .reduce((sum, m) => sum + m.value, 0);
    const hitRate = (hits / (hits + misses)) * 100;
    const color = hitRate > 80 ? colors.green : hitRate > 50 ? colors.yellow : colors.red;
    log(
      `   معدل النجاح: ${hitRate.toFixed(1)}% (${hits.toFixed(0)} / ${(hits + misses).toFixed(0)})`,
      color,
    );
  }

  // Active Auctions
  const activeAuctions = metrics['mazad_active_auctions'];
  if (activeAuctions && activeAuctions[0]) {
    log('\n🏆 مزادات نشطة:', colors.bright);
    log(`   ${activeAuctions[0].value.toFixed(0)} مزاد`, colors.cyan);
  }

  // Online Users
  const onlineUsers = metrics['mazad_online_users'];
  if (onlineUsers && onlineUsers[0]) {
    log('\n👥 مستخدمون متصلون:', colors.bright);
    log(`   ${onlineUsers[0].value.toFixed(0)} مستخدم`, colors.cyan);
  }

  // WebSocket Connections
  const wsConnections = metrics['mazad_websocket_connections'];
  if (wsConnections && wsConnections[0]) {
    log('\n🔌 اتصالات WebSocket:', colors.bright);
    log(`   ${wsConnections[0].value.toFixed(0)} اتصال نشط`, colors.cyan);
  }

  // Memory Usage
  const memoryUsage = metrics['process_resident_memory_bytes'];
  if (memoryUsage && memoryUsage[0]) {
    log('\n💻 استخدام الذاكرة:', colors.bright);
    const memoryGB = memoryUsage[0].value / 1024 / 1024 / 1024;
    const color = memoryGB > 3.5 ? colors.red : memoryGB > 2.5 ? colors.yellow : colors.green;
    log(`   ${memoryGB.toFixed(2)} GB`, color);
  }

  log('\n═══════════════════════════════════════════════════════', colors.bright);
  log(`التحديث التالي بعد ${INTERVAL / 1000} ثانية... (Ctrl+C للإيقاف)`);
}

async function monitor() {
  try {
    const data = await fetchMetrics();
    const metrics = parseMetrics(data);
    displayMetrics(metrics);
  } catch (error) {
    log(`\n❌ خطأ في الاتصال: ${error.message}`, colors.red);
    log('تأكد من تشغيل التطبيق على http://localhost:3021', colors.yellow);
  }
}

// بدء المراقبة
log('بدء مراقبة الأداء...', colors.bright);
log(`جمع البيانات من: ${BASE_URL}`, colors.cyan);
log('════════════════════════════════════════════════════\n', colors.bright);

monitor();
setInterval(monitor, INTERVAL);
