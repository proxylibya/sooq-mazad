// Error Monitoring System
const fs = require('fs');
const path = require('path');

class ErrorMonitor {
  constructor() {
    this.errors = new Map();
    this.startTime = Date.now();
  }

  recordError(error, context = {}) {
    const key = `${error.name}:${error.message}`;
    const existing = this.errors.get(key) || { count: 0, lastSeen: null, contexts: [] };

    existing.count++;
    existing.lastSeen = new Date().toISOString();
    existing.contexts.push({
      timestamp: new Date().toISOString(),
      ...context,
    });

    // احتفظ بآخر 10 contexts فقط
    if (existing.contexts.length > 10) {
      existing.contexts = existing.contexts.slice(-10);
    }

    this.errors.set(key, existing);
  }

  getStats() {
    const now = Date.now();
    const uptime = Math.floor((now - this.startTime) / 1000);

    const errorStats = Array.from(this.errors.entries()).map(([key, data]) => ({
      error: key,
      count: data.count,
      lastSeen: data.lastSeen,
      frequency: data.count / (uptime / 3600), // errors per hour
    }));

    return {
      uptime,
      totalErrors: Array.from(this.errors.values()).reduce((sum, err) => sum + err.count, 0),
      uniqueErrors: this.errors.size,
      topErrors: errorStats.sort((a, b) => b.count - a.count).slice(0, 10),
    };
  }

  generateReport() {
    const stats = this.getStats();
    const report = `# تقرير مراقبة الأخطاء

## إحصائيات عامة
- وقت التشغيل: ${Math.floor(stats.uptime / 3600)} ساعة
- إجمالي الأخطاء: ${stats.totalErrors}
- أخطاء فريدة: ${stats.uniqueErrors}

## أكثر الأخطاء تكراراً
${stats.topErrors
  .map((err) => `- ${err.error}: ${err.count} مرة (معدل: ${err.frequency.toFixed(2)}/ساعة)`)
  .join('\n')}

Generated at: ${new Date().toISOString()}
`;

    const reportsDir = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
    }

    const reportPath = path.join(
      reportsDir,
      `error-report-${new Date().toISOString().split('T')[0]}.md`,
    );
    fs.writeFileSync(reportPath, report);

    return reportPath;
  }
}

const errorMonitor = new ErrorMonitor();
module.exports = { errorMonitor };
