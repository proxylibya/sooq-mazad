/**
 * تهيئة وإدارة Workers للـ Queue System
 *
 * @author سوق مزاد
 * @version 1.0.0
 */

import { queueService, JobType } from './bullmq';
import { processors } from './processors';

/**
 * أسماء الـ Queues
 */
export const QUEUE_NAMES = {
  HIGH_PRIORITY: 'high-priority-queue',
  MEDIUM_PRIORITY: 'medium-priority-queue',
  LOW_PRIORITY: 'low-priority-queue',
  NOTIFICATIONS: 'notifications-queue',
  BACKGROUND: 'background-queue',
} as const;

/**
 * تهيئة جميع Workers
 */
export function initializeWorkers() {
  console.log('🚀 بدء تهيئة Workers...');

  // Worker للـ High Priority Jobs
  queueService.createWorker(
    QUEUE_NAMES.HIGH_PRIORITY,
    async (job) => {
      const processor = processors[job.data.type as JobType];
      if (!processor) {
        throw new Error(`معالج غير موجود للنوع: ${job.data.type}`);
      }
      return await processor(job);
    },
    { concurrency: 10 }, // معالجة 10 jobs في نفس الوقت
  );

  // Worker للـ Medium Priority Jobs
  queueService.createWorker(
    QUEUE_NAMES.MEDIUM_PRIORITY,
    async (job) => {
      const processor = processors[job.data.type as JobType];
      if (!processor) {
        throw new Error(`معالج غير موجود للنوع: ${job.data.type}`);
      }
      return await processor(job);
    },
    { concurrency: 5 },
  );

  // Worker للـ Low Priority Jobs
  queueService.createWorker(
    QUEUE_NAMES.LOW_PRIORITY,
    async (job) => {
      const processor = processors[job.data.type as JobType];
      if (!processor) {
        throw new Error(`معالج غير موجود للنوع: ${job.data.type}`);
      }
      return await processor(job);
    },
    { concurrency: 3 },
  );

  // Worker للـ Notifications
  queueService.createWorker(
    QUEUE_NAMES.NOTIFICATIONS,
    async (job) => {
      const processor = processors[job.data.type as JobType];
      if (!processor) {
        throw new Error(`معالج غير موجود للنوع: ${job.data.type}`);
      }
      return await processor(job);
    },
    { concurrency: 20 }, // الإشعارات تحتاج concurrency عالي
  );

  // Worker للـ Background Jobs
  queueService.createWorker(
    QUEUE_NAMES.BACKGROUND,
    async (job) => {
      const processor = processors[job.data.type as JobType];
      if (!processor) {
        throw new Error(`معالج غير موجود للنوع: ${job.data.type}`);
      }
      return await processor(job);
    },
    { concurrency: 2 },
  );

  // إنشاء Queue Events للمراقبة
  Object.values(QUEUE_NAMES).forEach((queueName) => {
    queueService.createQueueEvents(queueName);
  });

  console.log('✅ تم تهيئة جميع Workers بنجاح');
}

/**
 * جدولة Jobs دورية
 */
export async function scheduleRecurringJobs() {
  console.log('📅 جدولة Jobs دورية...');

  // تحديث Materialized Views كل ساعة
  await queueService.scheduleRepeatableJob(
    QUEUE_NAMES.BACKGROUND,
    {
      type: JobType.MATERIALIZED_VIEW_REFRESH,
      payload: {
        viewName: 'mv_auction_stats',
        concurrent: true,
      },
    },
    '0 * * * *', // كل ساعة
  );

  // حساب الإحصائيات اليومية في منتصف الليل
  await queueService.scheduleRepeatableJob(
    QUEUE_NAMES.BACKGROUND,
    {
      type: JobType.STATISTICS_CALCULATION,
      payload: {
        type: 'daily',
        startDate: new Date(),
        endDate: new Date(),
      },
    },
    '0 0 * * *', // كل يوم عند منتصف الليل
  );

  // تسخين الكاش كل 6 ساعات
  await queueService.scheduleRepeatableJob(
    QUEUE_NAMES.LOW_PRIORITY,
    {
      type: JobType.CACHE_WARMUP,
      payload: {
        keys: ['featured-cars', 'popular-showrooms', 'trending-auctions'],
      },
    },
    '0 */6 * * *', // كل 6 ساعات
  );

  console.log('✅ تم جدولة Jobs دورية بنجاح');
}

/**
 * إيقاف جميع Workers (للاستخدام عند إيقاف التطبيق)
 */
export async function shutdownWorkers() {
  console.log('🛑 إيقاف Workers...');
  await queueService.closeAll();
  console.log('✅ تم إيقاف Workers بنجاح');
}

/**
 * تنظيف Jobs القديمة
 */
export async function cleanupOldJobs() {
  console.log('🧹 تنظيف Jobs القديمة...');

  for (const queueName of Object.values(QUEUE_NAMES)) {
    await queueService.cleanCompleted(queueName, 24 * 3600); // حذف Jobs المكتملة الأقدم من 24 ساعة
    await queueService.cleanFailed(queueName, 7 * 24 * 3600); // حذف Jobs الفاشلة الأقدم من 7 أيام
  }

  console.log('✅ تم تنظيف Jobs القديمة بنجاح');
}

// تصدير دالة مساعدة لإضافة Jobs
export async function addJobToQueue(
  type: JobType,
  payload: any,
  options?: {
    priority?: 'high' | 'medium' | 'low';
    delay?: number;
  },
) {
  let queueName = QUEUE_NAMES.MEDIUM_PRIORITY;
  let priority = 5;

  // اختيار Queue بناءً على الأولوية
  switch (options?.priority) {
    case 'high':
      queueName = QUEUE_NAMES.HIGH_PRIORITY;
      priority = 1;
      break;
    case 'low':
      queueName = QUEUE_NAMES.LOW_PRIORITY;
      priority = 10;
      break;
    default:
      queueName = QUEUE_NAMES.MEDIUM_PRIORITY;
      priority = 5;
  }

  // Jobs الإشعارات تذهب إلى Queue الإشعارات
  if (type === JobType.EMAIL_NOTIFICATION || type === JobType.SMS_NOTIFICATION) {
    queueName = QUEUE_NAMES.NOTIFICATIONS;
  }

  return await queueService.addJob(
    queueName,
    { type, payload },
    {
      priority,
      delay: options?.delay,
    },
  );
}
