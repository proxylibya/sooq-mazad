import { AlertLevel, AttackType } from './security';

// أنواع الأحداث الأمنية
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'LOGIN_ATTEMPT',
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  BRUTE_FORCE_DETECTED = 'BRUTE_FORCE_DETECTED',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  CSRF_VIOLATION = 'CSRF_VIOLATION',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  IP_BLOCKED = 'IP_BLOCKED',
  TWO_FACTOR_SUCCESS = 'TWO_FACTOR_SUCCESS',
  TWO_FACTOR_FAILURE = 'TWO_FACTOR_FAILURE',
  ADMIN_ACTION = 'ADMIN_ACTION',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
}

// واجهة الحدث الأمني
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  level: AlertLevel;
  timestamp: Date;
  ip: string;
  userAgent?: string;
  userId?: string;
  email?: string;
  details: any;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  notes?: string;
}

// واجهة التنبيه الأمني
export interface SecurityAlert {
  id: string;
  type: AttackType;
  level: AlertLevel;
  title: string;
  description: string;
  timestamp: Date;
  ip: string;
  userAgent?: string;
  userId?: string;
  events: SecurityEvent[];
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: Date;
  actions: string[];
  notes?: string;
}

// إحصائيات الأمان
export interface SecurityStats {
  totalEvents: number;
  totalAlerts: number;
  unresolvedAlerts: number;
  blockedIPs: number;
  topAttackTypes: Array<{ type: AttackType; count: number; }>;
  recentEvents: SecurityEvent[];
  criticalAlerts: SecurityAlert[];
}

// فئة مراقبة الأمان
export class SecurityMonitoring {
  private events: Map<string, SecurityEvent> = new Map();
  private alerts: Map<string, SecurityAlert> = new Map();
  private ipStats: Map<string, { events: number; lastSeen: Date; blocked: boolean; }> = new Map();
  private alertThresholds = {
    [AttackType.BRUTE_FORCE]: 5,
    [AttackType.SQL_INJECTION]: 1,
    [AttackType.XSS]: 1,
    [AttackType.CSRF]: 3,
    [AttackType.DDOS]: 10,
    [AttackType.SUSPICIOUS_ACTIVITY]: 10,
  };

  // تسجيل حدث أمني
  logEvent(
    type: SecurityEventType,
    level: AlertLevel,
    ip: string,
    details: any,
    userAgent?: string,
    userId?: string,
    email?: string,
  ): SecurityEvent {
    const event: SecurityEvent = {
      id: this.generateId(),
      type,
      level,
      timestamp: new Date(),
      ip,
      userAgent,
      userId,
      email,
      details,
      resolved: false,
    };

    this.events.set(event.id, event);

    // تحديث إحصائيات IP
    this.updateIPStats(ip);

    // فحص إنشاء تنبيه
    this.checkForAlert(event);

    // تنظيف الأحداث القديمة
    this.cleanupOldEvents();

    return event;
  }

  // إنشاء تنبيه أمني
  createAlert(
    type: AttackType,
    level: AlertLevel,
    title: string,
    description: string,
    ip: string,
    relatedEvents: SecurityEvent[] = [],
    userAgent?: string,
    userId?: string,
  ): SecurityAlert {
    const alert: SecurityAlert = {
      id: this.generateId(),
      type,
      level,
      title,
      description,
      timestamp: new Date(),
      ip,
      userAgent,
      userId,
      events: relatedEvents,
      acknowledged: false,
      resolved: false,
      actions: this.getRecommendedActions(type, level),
    };

    this.alerts.set(alert.id, alert);

    // إرسال إشعار فوري للتنبيهات الحرجة
    if (level === AlertLevel.CRITICAL) {
      this.sendCriticalAlert(alert);
    }

    return alert;
  }

  // فحص إنشاء تنبيه بناءً على الأحداث
  private checkForAlert(event: SecurityEvent): void {
    const recentEvents = this.getRecentEventsByIP(event.ip, 10 * 60 * 1000); // آخر 10 دقائق

    // فحص هجمات Brute Force
    if (event.type === SecurityEventType.LOGIN_FAILURE) {
      const failedLogins = recentEvents.filter((e) => e.type === SecurityEventType.LOGIN_FAILURE);
      if (failedLogins.length >= this.alertThresholds[AttackType.BRUTE_FORCE]) {
        this.createAlert(
          AttackType.BRUTE_FORCE,
          AlertLevel.HIGH,
          'هجوم Brute Force مكتشف',
          `تم اكتشاف ${failedLogins.length} محاولة تسجيل دخول فاشلة من IP: ${event.ip}`,
          event.ip,
          failedLogins,
          event.userAgent,
          event.userId,
        );
      }
    }

    // فحص محاولات SQL Injection
    if (event.type === SecurityEventType.SQL_INJECTION_ATTEMPT) {
      this.createAlert(
        AttackType.SQL_INJECTION,
        AlertLevel.CRITICAL,
        'محاولة حقن SQL',
        'تم اكتشاف محاولة حقن SQL في النظام',
        event.ip,
        [event],
        event.userAgent,
        event.userId,
      );
    }

    // فحص محاولات XSS
    if (event.type === SecurityEventType.XSS_ATTEMPT) {
      this.createAlert(
        AttackType.XSS,
        AlertLevel.HIGH,
        'محاولة هجوم XSS',
        'تم اكتشاف محاولة هجوم XSS في النظام',
        event.ip,
        [event],
        event.userAgent,
        event.userId,
      );
    }

    // فحص النشاط المشبوه
    const suspiciousEvents = recentEvents.filter(
      (e) =>
        e.type === SecurityEventType.SUSPICIOUS_ACTIVITY ||
        e.type === SecurityEventType.UNAUTHORIZED_ACCESS,
    );

    if (suspiciousEvents.length >= this.alertThresholds[AttackType.SUSPICIOUS_ACTIVITY]) {
      this.createAlert(
        AttackType.SUSPICIOUS_ACTIVITY,
        AlertLevel.MEDIUM,
        'نشاط مشبوه مكتشف',
        `تم اكتشاف ${suspiciousEvents.length} حدث مشبوه من IP: ${event.ip}`,
        event.ip,
        suspiciousEvents,
        event.userAgent,
        event.userId,
      );
    }
  }

  // الحصول على الأحداث الأخيرة لـ IP معين
  private getRecentEventsByIP(ip: string, timeWindow: number): SecurityEvent[] {
    const cutoff = new Date(Date.now() - timeWindow);
    return Array.from(this.events.values())
      .filter((event) => event.ip === ip && event.timestamp > cutoff)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // تحديث إحصائيات IP
  private updateIPStats(ip: string): void {
    const stats = this.ipStats.get(ip) || {
      events: 0,
      lastSeen: new Date(),
      blocked: false,
    };
    stats.events++;
    stats.lastSeen = new Date();
    this.ipStats.set(ip, stats);
  }

  // الحصول على الإجراءات المقترحة
  private getRecommendedActions(type: AttackType, level: AlertLevel): string[] {
    const actions: string[] = [];

    switch (type) {
      case AttackType.BRUTE_FORCE:
        actions.push('حظر IP المهاجم');
        actions.push('تفعيل المصادقة الثنائية');
        actions.push('زيادة قوة كلمات المرور');
        break;

      case AttackType.SQL_INJECTION:
        actions.push('حظر IP فوراً');
        actions.push('مراجعة استعلامات قاعدة البيانات');
        actions.push('تحديث نظام الحماية');
        break;

      case AttackType.XSS:
        actions.push('تنظيف المدخلات');
        actions.push('تحديث Content Security Policy');
        actions.push('مراجعة الكود المعرض للخطر');
        break;

      case AttackType.CSRF:
        actions.push('التحقق من CSRF tokens');
        actions.push('تحديث إعدادات CORS');
        break;

      case AttackType.DDOS:
        actions.push('تفعيل حماية DDoS');
        actions.push('حظر IP المهاجم');
        actions.push('زيادة موارد الخادم');
        break;

      case AttackType.SUSPICIOUS_ACTIVITY:
        actions.push('مراقبة النشاط عن كثب');
        actions.push('مراجعة سجلات الوصول');
        break;
    }

    if (level === AlertLevel.CRITICAL) {
      actions.unshift('إشعار فريق الأمان فوراً');
    }

    return actions;
  }

  // إرسال تنبيه حرج
  private sendCriticalAlert(alert: SecurityAlert): void {
    // في التطبيق الحقيقي، يتم إرسال إشعارات عبر:
    // - البريد الإلكتروني
    // - SMS
    // - Slack/Discord
    // - نظام التنبيهات الداخلي

    console.error('🚨 تنبيه أمني حرج:', {
      id: alert.id,
      type: alert.type,
      title: alert.title,
      description: alert.description,
      ip: alert.ip,
      timestamp: alert.timestamp,
    });

    // محاكاة إرسال إشعار
    this.simulateNotification(alert);
  }

  // محاكاة إرسال إشعار
  private simulateNotification(alert: SecurityAlert): void {
    // في الإنتاج، يتم استبدال هذا بخدمة إشعارات حقيقية
    setTimeout(() => {
      console.log(`📧 تم إرسال إشعار للتنبيه: ${alert.id}`);
    }, 1000);
  }

  // تأكيد التنبيه
  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.acknowledged = true;
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = new Date();

    return true;
  }

  // حل التنبيه
  resolveAlert(alertId: string, resolvedBy: string, notes?: string): boolean {
    const alert = this.alerts.get(alertId);
    if (!alert) return false;

    alert.resolved = true;
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = new Date();
    if (notes) alert.notes = notes;

    return true;
  }

  // الحصول على إحصائيات الأمان
  getSecurityStats(): SecurityStats {
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const recentEvents = Array.from(this.events.values())
      .filter((event) => event.timestamp > last24Hours)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 50);

    const unresolvedAlerts = Array.from(this.alerts.values()).filter((alert) => !alert.resolved);

    const criticalAlerts = unresolvedAlerts
      .filter((alert) => alert.level === AlertLevel.CRITICAL)
      .slice(0, 10);

    // إحصائيات أنواع الهجمات
    const attackTypeCounts = new Map<AttackType, number>();
    Array.from(this.alerts.values()).forEach((alert) => {
      const count = attackTypeCounts.get(alert.type) || 0;
      attackTypeCounts.set(alert.type, count + 1);
    });

    const topAttackTypes = Array.from(attackTypeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalEvents: this.events.size,
      totalAlerts: this.alerts.size,
      unresolvedAlerts: unresolvedAlerts.length,
      blockedIPs: Array.from(this.ipStats.values()).filter((stats) => stats.blocked).length,
      topAttackTypes,
      recentEvents,
      criticalAlerts,
    };
  }

  // تنظيف الأحداث القديمة
  private cleanupOldEvents(): void {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 أيام

    for (const [id, event] of this.events.entries()) {
      if (event.timestamp < cutoff) {
        this.events.delete(id);
      }
    }

    // تنظيف التنبيهات المحلولة القديمة
    for (const [id, alert] of this.alerts.entries()) {
      if (alert.resolved && alert.resolvedAt && alert.resolvedAt < cutoff) {
        this.alerts.delete(id);
      }
    }
  }

  // إنشاء معرف فريد
  private generateId(): string {
    return `sec_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }

  // الحصول على جميع التنبيهات
  getAllAlerts(): SecurityAlert[] {
    return Array.from(this.alerts.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  // الحصول على جميع الأحداث
  getAllEvents(): SecurityEvent[] {
    return Array.from(this.events.values()).sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime(),
    );
  }

  // حظر IP
  blockIP(ip: string): void {
    const stats = this.ipStats.get(ip) || {
      events: 0,
      lastSeen: new Date(),
      blocked: false,
    };
    stats.blocked = true;
    this.ipStats.set(ip, stats);

    this.logEvent(SecurityEventType.IP_BLOCKED, AlertLevel.HIGH, ip, {
      reason: 'Manual block',
      timestamp: new Date(),
    });
  }

  // إلغاء حظر IP
  unblockIP(ip: string): void {
    const stats = this.ipStats.get(ip);
    if (stats) {
      stats.blocked = false;
      this.ipStats.set(ip, stats);
    }
  }
}

// إنشاء مثيل واحد للاستخدام في التطبيق
export const securityMonitoring = new SecurityMonitoring();

// تنظيف دوري كل ساعة
setInterval(
  () => {
    securityMonitoring['cleanupOldEvents']();
  },
  60 * 60 * 1000,
);

// دوال مساعدة
export const logSecurityEvent = (
  type: SecurityEventType,
  level: AlertLevel,
  ip: string,
  details: any,
  userAgent?: string,
  userId?: string,
  email?: string,
) => securityMonitoring.logEvent(type, level, ip, details, userAgent, userId, email);

export const createSecurityAlert = (
  type: AttackType,
  level: AlertLevel,
  title: string,
  description: string,
  ip: string,
  events?: SecurityEvent[],
  userAgent?: string,
  userId?: string,
) => securityMonitoring.createAlert(type, level, title, description, ip, events, userAgent, userId);

export const getSecurityStats = () => securityMonitoring.getSecurityStats();
export const acknowledgeAlert = (alertId: string, acknowledgedBy: string) =>
  securityMonitoring.acknowledgeAlert(alertId, acknowledgedBy);
export const resolveAlert = (alertId: string, resolvedBy: string, notes?: string) =>
  securityMonitoring.resolveAlert(alertId, resolvedBy, notes);
