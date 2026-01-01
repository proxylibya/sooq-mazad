/**
 * نظام BullMQ للعمليات الثقيلة Asynchronous
 * يستخدم KeyDB كـ Backend للـ Queue
 *
 * @author سوق مزاد
 * @version 1.0.0
 */

import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { keydbBullMQConnection as connection } from '../keydb-connection';

/**
 * أنواع الـ Jobs
 */
export enum JobType {
  AUCTION_PRICE_UPDATE = 'auction_price_update',
  STATISTICS_CALCULATION = 'statistics_calculation',
  MATERIALIZED_VIEW_REFRESH = 'materialized_view_refresh',
  EMAIL_NOTIFICATION = 'email_notification',
  SMS_NOTIFICATION = 'sms_notification',
  IMAGE_OPTIMIZATION = 'image_optimization',
  CACHE_WARMUP = 'cache_warmup',
  DATA_EXPORT = 'data_export',
  SHOWROOM_STATS_UPDATE = 'showroom_stats_update',
  USER_ANALYTICS_UPDATE = 'user_analytics_update',
}

/**
 * واجهة بيانات Job
 */
export interface JobData {
  type: JobType;
  payload: Record<string, unknown>;
  priority?: number;
  timestamp?: number;
}

/**
 * واجهة نتيجة Job
 */
export interface JobResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  duration?: number;
}

/**
 * إعدادات الـ Queue
 */
const queueOptions = {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      count: 100, // الاحتفاظ بآخر 100 job ناجح
      age: 24 * 3600, // حذف بعد 24 ساعة
    },
    removeOnFail: {
      count: 500, // الاحتفاظ بآخر 500 job فاشل
    },
  },
};

/**
 * خدمة إدارة Queues
 */
class QueueService {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private queueEvents: Map<string, QueueEvents> = new Map();

  /**
   * إنشاء أو جلب Queue
   */
  getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, queueOptions);
      this.queues.set(name, queue);

      console.log(`تم إنشاء Queue: ${name}`);
    }

    return this.queues.get(name)!;
  }

  /**
   * إضافة Job إلى Queue
   */
  async addJob(
    queueName: string,
    jobData: JobData,
    options?: {
      delay?: number;
      priority?: number;
      repeat?: {
        pattern?: string;
        every?: number;
      };
    },
  ): Promise<Job> {
    const queue = this.getQueue(queueName);

    const jobOptions: Record<string, unknown> = {
      priority: options?.priority || jobData.priority || 5,
    };

    if (options?.delay !== undefined) {
      jobOptions.delay = options.delay;
    }

    if (options?.repeat !== undefined) {
      jobOptions.repeat = options.repeat;
    }

    const job = await queue.add(
      jobData.type,
      {
        ...jobData,
        timestamp: Date.now(),
      },
      jobOptions,
    );

    console.log(`تم إضافة Job ${jobData.type} إلى Queue ${queueName} (ID: ${job.id})`);

    return job;
  }

  /**
   * إنشاء Worker لمعالجة Jobs
   */
  createWorker(
    queueName: string,
    processor: (job: Job<JobData>) => Promise<JobResult>,
    options?: {
      concurrency?: number;
    },
  ): Worker {
    if (this.workers.has(queueName)) {
      console.warn(`Worker موجود بالفعل للـ Queue: ${queueName}`);
      return this.workers.get(queueName)!;
    }

    const worker = new Worker<JobData, JobResult>(
      queueName,
      async (job) => {
        const startTime = Date.now();
        console.log(`بدء معالجة Job ${job.data.type} (ID: ${job.id})`);

        try {
          const result = await processor(job);
          const duration = Date.now() - startTime;

          console.log(`تم إنجاز Job ${job.data.type} في ${duration}ms`);

          return {
            ...result,
            duration,
          };
        } catch (error) {
          console.error(`فشل Job ${job.data.type}:`, error);

          throw error;
        }
      },
      {
        connection,
        concurrency: options?.concurrency || 5,
      },
    );

    // Event listeners
    worker.on('completed', (job) => {
      console.log(`Job ${job.id} اكتمل بنجاح`);
    });

    worker.on('failed', (job, error) => {
      console.error(`Job ${job?.id} فشل:`, error.message);
    });

    worker.on('error', (error) => {
      console.error(`خطأ في Worker ${queueName}:`, error);
    });

    this.workers.set(queueName, worker);
    console.log(`تم إنشاء Worker للـ Queue: ${queueName}`);

    return worker;
  }

  /**
   * مراقبة أحداث Queue
   */
  createQueueEvents(queueName: string): QueueEvents {
    if (this.queueEvents.has(queueName)) {
      return this.queueEvents.get(queueName)!;
    }

    const queueEvents = new QueueEvents(queueName, { connection });

    queueEvents.on('completed', ({ jobId }) => {
      console.log(`Job ${jobId} اكتمل`);
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`Job ${jobId} فشل: ${failedReason}`);
    });

    queueEvents.on('progress', ({ jobId, data }) => {
      console.log(`Job ${jobId} تقدم: ${JSON.stringify(data)}`);
    });

    this.queueEvents.set(queueName, queueEvents);

    return queueEvents;
  }

  /**
   * الحصول على إحصائيات Queue
   */
  async getQueueStats(queueName: string): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const queue = this.getQueue(queueName);

    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ]);

    return { waiting, active, completed, failed, delayed };
  }

  /**
   * مسح جميع Jobs المكتملة
   */
  async cleanCompleted(queueName: string, grace: number = 0): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, 100, 'completed');
    console.log(`تم تنظيف Jobs المكتملة من ${queueName}`);
  }

  /**
   * مسح جميع Jobs الفاشلة
   */
  async cleanFailed(queueName: string, grace: number = 0): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, 100, 'failed');
    console.log(`تم تنظيف Jobs الفاشلة من ${queueName}`);
  }

  /**
   * إيقاف جميع Workers
   */
  async closeAll(): Promise<void> {
    console.log('إيقاف جميع Workers...');

    for (const [name, worker] of this.workers) {
      await worker.close();
      console.log(`تم إيقاف Worker: ${name}`);
    }

    for (const [name, queueEvents] of this.queueEvents) {
      await queueEvents.close();
      console.log(`تم إيقاف QueueEvents: ${name}`);
    }

    for (const [name, queue] of this.queues) {
      await queue.close();
      console.log(`تم إيقاف Queue: ${name}`);
    }

    await connection.quit();
    console.log('تم إغلاق اتصال KeyDB');
  }

  /**
   * الحصول على Job بواسطة ID
   */
  async getJob(queueName: string, jobId: string): Promise<Job | undefined> {
    const queue = this.getQueue(queueName);
    return await queue.getJob(jobId);
  }

  /**
   * إعادة محاولة Job فاشل
   */
  async retryJob(queueName: string, jobId: string): Promise<void> {
    const job = await this.getJob(queueName, jobId);
    if (job) {
      await job.retry();
      console.log(`تم إعادة محاولة Job ${jobId}`);
    }
  }

  /**
   * حذف Job
   */
  async removeJob(queueName: string, jobId: string): Promise<void> {
    const job = await this.getJob(queueName, jobId);
    if (job) {
      await job.remove();
      console.log(`تم حذف Job ${jobId}`);
    }
  }

  /**
   * الحصول على جميع Jobs قيد الانتظار
   */
  async getWaitingJobs(queueName: string, start = 0, end = 10): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    return await queue.getJobs(['waiting'], start, end);
  }

  /**
   * الحصول على جميع Jobs النشطة
   */
  async getActiveJobs(queueName: string): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    return await queue.getJobs(['active']);
  }

  /**
   * الحصول على جميع Jobs الفاشلة
   */
  async getFailedJobs(queueName: string, start = 0, end = 10): Promise<Job[]> {
    const queue = this.getQueue(queueName);
    return await queue.getJobs(['failed'], start, end);
  }

  /**
   * جدولة Job متكرر (Cron-like)
   */
  async scheduleRepeatableJob(
    queueName: string,
    jobData: JobData,
    cronExpression: string,
  ): Promise<Job> {
    return await this.addJob(queueName, jobData, {
      repeat: {
        pattern: cronExpression,
      },
    });
  }

  /**
   * إلغاء جميع Jobs المتكررة
   */
  async removeRepeatableJobs(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const repeatableJobs = await queue.getRepeatableJobs();

    for (const job of repeatableJobs) {
      await queue.removeRepeatableByKey(job.key);
    }

    console.log(`تم إلغاء ${repeatableJobs.length} jobs متكررة من ${queueName}`);
  }
}

// Singleton instance
export const queueService = new QueueService();

export default queueService;
