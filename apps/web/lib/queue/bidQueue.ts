/**
 * 🚀 Bid Queue System - نظام صف المزايدات
 * 
 * يستخدم BullMQ لضمان معالجة المزايدات المتزامنة بشكل صحيح
 * يمنع تضارب البيانات ويضمن ترتيب المزايدات
 */

import { Job, Queue, Worker } from 'bullmq';
import { EventEmitter } from 'events';

// ═══════════════════════════════════════════════════════════════
// Types & Interfaces
// ═══════════════════════════════════════════════════════════════

export interface BidJobData {
    auctionId: string;
    bidderId: string;
    amount: number;
    confirmHighBid?: boolean;
    timestamp: number;
    clientId?: string;
}

export interface BidJobResult {
    success: boolean;
    bidId?: string;
    error?: string;
    errorCode?: string;
    recommendedMin?: number;
    minIncrement?: number;
}

export interface QueueConfig {
    redis: {
        host: string;
        port: number;
        password?: string;
    };
    maxConcurrency: number;
    maxRetries: number;
    retryDelay: number;
}

// ═══════════════════════════════════════════════════════════════
// Default Configuration
// ═══════════════════════════════════════════════════════════════

const defaultConfig: QueueConfig = {
    redis: {
        host: process.env.KEYDB_HOST || process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.KEYDB_PORT || process.env.REDIS_PORT || '6379'),
        password: process.env.KEYDB_PASSWORD || process.env.REDIS_PASSWORD,
    },
    maxConcurrency: 1, // معالجة مزايدة واحدة فقط لكل مزاد في نفس الوقت
    maxRetries: 3,
    retryDelay: 1000,
};

// ═══════════════════════════════════════════════════════════════
// Bid Queue Manager
// ═══════════════════════════════════════════════════════════════

class BidQueueManager extends EventEmitter {
    private queues: Map<string, Queue<BidJobData, BidJobResult>> = new Map();
    private workers: Map<string, Worker<BidJobData, BidJobResult>> = new Map();
    private config: QueueConfig;
    private isInitialized: boolean = false;

    constructor(config: Partial<QueueConfig> = {}) {
        super();
        this.config = { ...defaultConfig, ...config };
    }

    /**
     * تهيئة النظام
     */
    async initialize(): Promise<void> {
        if (this.isInitialized) return;

        console.log('🚀 [BidQueue] تهيئة نظام صف المزايدات...');
        this.isInitialized = true;
    }

    /**
     * الحصول على Queue لمزاد معين
     */
    private getOrCreateQueue(auctionId: string): Queue<BidJobData, BidJobResult> {
        const queueName = `bid-queue:${auctionId}`;

        if (!this.queues.has(auctionId)) {
            const queue = new Queue<BidJobData, BidJobResult>(queueName, {
                connection: this.config.redis,
                defaultJobOptions: {
                    attempts: this.config.maxRetries,
                    backoff: {
                        type: 'exponential',
                        delay: this.config.retryDelay,
                    },
                    removeOnComplete: { count: 100 },
                    removeOnFail: { count: 50 },
                },
            });

            this.queues.set(auctionId, queue);
            console.log(`📋 [BidQueue] تم إنشاء Queue للمزاد: ${auctionId}`);
        }

        return this.queues.get(auctionId)!;
    }

    /**
     * إضافة مزايدة للصف
     */
    async addBid(data: BidJobData): Promise<Job<BidJobData, BidJobResult>> {
        const queue = this.getOrCreateQueue(data.auctionId);

        const job = await queue.add('process-bid', data, {
            priority: 1, // أولوية عالية
            jobId: `${data.auctionId}-${data.bidderId}-${data.timestamp}`,
        });

        console.log(`📥 [BidQueue] تمت إضافة مزايدة للصف: ${job.id}`);
        return job;
    }

    /**
     * الانتظار للنتيجة
     */
    async waitForResult(job: Job<BidJobData, BidJobResult>, timeout: number = 10000): Promise<BidJobResult> {
        const startTime = Date.now();

        while (Date.now() - startTime < timeout) {
            const state = await job.getState();

            if (state === 'completed') {
                return await job.returnvalue as BidJobResult;
            }

            if (state === 'failed') {
                const failedReason = job.failedReason || 'Unknown error';
                return {
                    success: false,
                    error: failedReason,
                    errorCode: 'JOB_FAILED',
                };
            }

            // انتظار قصير قبل الفحص مجدداً
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        return {
            success: false,
            error: 'Timeout waiting for bid result',
            errorCode: 'TIMEOUT',
        };
    }

    /**
     * بدء معالج المزايدات
     */
    async startWorker(
        auctionId: string,
        processor: (data: BidJobData) => Promise<BidJobResult>
    ): Promise<void> {
        if (this.workers.has(auctionId)) {
            return; // المعالج موجود بالفعل
        }

        const queueName = `bid-queue:${auctionId}`;

        const worker = new Worker<BidJobData, BidJobResult>(
            queueName,
            async (job) => {
                console.log(`⚙️ [BidQueue] معالجة المزايدة: ${job.id}`);

                try {
                    const result = await processor(job.data);

                    if (result.success) {
                        this.emit('bid:success', { auctionId, ...result });
                    } else {
                        this.emit('bid:failed', { auctionId, ...result });
                    }

                    return result;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error(`❌ [BidQueue] خطأ في معالجة المزايدة: ${errorMessage}`);

                    return {
                        success: false,
                        error: errorMessage,
                        errorCode: 'PROCESSING_ERROR',
                    };
                }
            },
            {
                connection: this.config.redis,
                concurrency: this.config.maxConcurrency,
                limiter: {
                    max: 10,
                    duration: 1000, // 10 مزايدات في الثانية كحد أقصى
                },
            }
        );

        worker.on('error', (error) => {
            console.error(`❌ [BidQueue] خطأ في المعالج: ${error.message}`);
        });

        worker.on('completed', (job) => {
            console.log(`✅ [BidQueue] اكتملت المزايدة: ${job.id}`);
        });

        this.workers.set(auctionId, worker);
        console.log(`👷 [BidQueue] تم بدء المعالج للمزاد: ${auctionId}`);
    }

    /**
     * إيقاف معالج لمزاد معين
     */
    async stopWorker(auctionId: string): Promise<void> {
        const worker = this.workers.get(auctionId);
        if (worker) {
            await worker.close();
            this.workers.delete(auctionId);
            console.log(`🛑 [BidQueue] تم إيقاف المعالج للمزاد: ${auctionId}`);
        }
    }

    /**
     * إحصائيات الصف
     */
    async getQueueStats(auctionId: string) {
        const queue = this.queues.get(auctionId);
        if (!queue) {
            return {
                waiting: 0,
                active: 0,
                completed: 0,
                failed: 0,
            };
        }

        const [waiting, active, completed, failed] = await Promise.all([
            queue.getWaitingCount(),
            queue.getActiveCount(),
            queue.getCompletedCount(),
            queue.getFailedCount(),
        ]);

        return { waiting, active, completed, failed };
    }

    /**
     * إيقاف جميع المعالجات والصفوف
     */
    async shutdown(): Promise<void> {
        console.log('🛑 [BidQueue] إيقاف نظام صف المزايدات...');

        // إيقاف جميع المعالجات
        for (const [auctionId, worker] of this.workers) {
            await worker.close();
            console.log(`   - تم إيقاف معالج: ${auctionId}`);
        }
        this.workers.clear();

        // إغلاق جميع الصفوف
        for (const [auctionId, queue] of this.queues) {
            await queue.close();
            console.log(`   - تم إغلاق صف: ${auctionId}`);
        }
        this.queues.clear();

        this.isInitialized = false;
        console.log('✅ [BidQueue] تم إيقاف النظام بنجاح');
    }
}

// ═══════════════════════════════════════════════════════════════
// Singleton Instance
// ═══════════════════════════════════════════════════════════════

let bidQueueInstance: BidQueueManager | null = null;

export function getBidQueue(config?: Partial<QueueConfig>): BidQueueManager {
    if (!bidQueueInstance) {
        bidQueueInstance = new BidQueueManager(config);
    }
    return bidQueueInstance;
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

/**
 * إضافة مزايدة وانتظار النتيجة
 */
export async function queueBid(data: Omit<BidJobData, 'timestamp'>): Promise<BidJobResult> {
    const queue = getBidQueue();
    await queue.initialize();

    const jobData: BidJobData = {
        ...data,
        timestamp: Date.now(),
    };

    const job = await queue.addBid(jobData);
    return queue.waitForResult(job);
}

/**
 * تسجيل معالج المزايدات
 */
export async function registerBidProcessor(
    auctionId: string,
    processor: (data: BidJobData) => Promise<BidJobResult>
): Promise<void> {
    const queue = getBidQueue();
    await queue.initialize();
    await queue.startWorker(auctionId, processor);
}

// ═══════════════════════════════════════════════════════════════
// Fallback (في حالة عدم توفر Redis/KeyDB)
// ═══════════════════════════════════════════════════════════════

/**
 * معالج مزايدات بسيط (بدون Queue)
 * يُستخدم كـ fallback إذا لم يكن Redis متاحاً
 */
export class SimpleBidProcessor {
    private locks: Map<string, boolean> = new Map();
    private lockTimeout: number = 5000;

    /**
     * معالجة مزايدة مع قفل بسيط
     */
    async processBid<T>(
        auctionId: string,
        processor: () => Promise<T>
    ): Promise<T> {
        const lockKey = `lock:${auctionId}`;

        // انتظار إذا كان هناك قفل
        let waitTime = 0;
        while (this.locks.get(lockKey) && waitTime < this.lockTimeout) {
            await new Promise(resolve => setTimeout(resolve, 50));
            waitTime += 50;
        }

        if (this.locks.get(lockKey)) {
            throw new Error('LOCK_TIMEOUT: لم يتم الحصول على القفل');
        }

        // تعيين القفل
        this.locks.set(lockKey, true);

        try {
            return await processor();
        } finally {
            // إزالة القفل
            this.locks.delete(lockKey);
        }
    }
}

export const simpleBidProcessor = new SimpleBidProcessor();

export default getBidQueue;
