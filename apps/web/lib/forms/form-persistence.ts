/**
 * Form Persistence Service
 * خدمة حفظ واسترجاع بيانات النماذج
 * 
 * ميزات النظام:
 * - حفظ تلقائي مع debounce
 * - دعم localStorage و sessionStorage
 * - تشفير البيانات الحساسة
 * - انتهاء صلاحية تلقائي
 * - استرجاع المسودات
 * - مزامنة بين التبويبات
 */

// ============================================
// 1. Types & Interfaces
// ============================================

export interface FormPersistenceConfig {
    /** مفتاح التخزين الفريد */
    storageKey: string;
    /** نوع التخزين */
    storageType?: 'local' | 'session';
    /** مدة الصلاحية بالدقائق (افتراضي: 60 دقيقة) */
    expirationMinutes?: number;
    /** تشفير البيانات */
    encrypt?: boolean;
    /** حفظ تلقائي */
    autoSave?: boolean;
    /** فترة الانتظار قبل الحفظ التلقائي (ms) */
    autoSaveDelay?: number;
    /** الحقول التي يجب تجاهلها عند الحفظ */
    excludeFields?: string[];
    /** الإصدار للتحقق من التوافق */
    version?: number;
    /** مزامنة بين التبويبات */
    syncTabs?: boolean;
}

export interface StoredFormData<T = any> {
    data: T;
    timestamp: number;
    version: number;
    stepIndex?: number;
    metadata?: {
        lastField?: string;
        completedSteps?: number[];
        userId?: string;
    };
}

export interface FormPersistenceResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    isExpired?: boolean;
    isVersionMismatch?: boolean;
}

// ============================================
// 2. Constants
// ============================================

const DEFAULT_CONFIG: Required<FormPersistenceConfig> = {
    storageKey: 'form_data',
    storageType: 'local',
    expirationMinutes: 60,
    encrypt: false,
    autoSave: true,
    autoSaveDelay: 1000,
    excludeFields: [],
    version: 1,
    syncTabs: true,
};

// مفتاح التشفير البسيط (للاستخدام الأساسي فقط)
const ENCRYPTION_KEY = 'sooq-mazad-form-key-2024';

// ============================================
// 3. Utility Functions
// ============================================

/**
 * تشفير بسيط للبيانات
 */
function simpleEncrypt(data: string): string {
    try {
        // تشفير Base64 مع XOR بسيط
        const encoded = btoa(
            data
                .split('')
                .map((char, i) =>
                    String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
                )
                .join('')
        );
        return encoded;
    } catch {
        return btoa(data);
    }
}

/**
 * فك تشفير البيانات
 */
function simpleDecrypt(encoded: string): string {
    try {
        const decoded = atob(encoded);
        return decoded
            .split('')
            .map((char, i) =>
                String.fromCharCode(char.charCodeAt(0) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length))
            )
            .join('');
    } catch {
        return atob(encoded);
    }
}

/**
 * الحصول على التخزين المناسب
 */
function getStorage(type: 'local' | 'session'): Storage | null {
    if (typeof window === 'undefined') return null;
    return type === 'local' ? localStorage : sessionStorage;
}

/**
 * التحقق من انتهاء الصلاحية
 */
function isExpired(timestamp: number, expirationMinutes: number): boolean {
    const now = Date.now();
    const expirationTime = timestamp + expirationMinutes * 60 * 1000;
    return now > expirationTime;
}

/**
 * تصفية الحقول المستبعدة
 */
function filterExcludedFields<T extends Record<string, any>>(
    data: T,
    excludeFields: string[]
): Partial<T> {
    if (!excludeFields.length) return data;

    const filtered = { ...data };
    excludeFields.forEach((field) => {
        if (field in filtered) {
            delete filtered[field];
        }
    });
    return filtered;
}

// ============================================
// 4. FormPersistence Class
// ============================================

export class FormPersistence<T extends Record<string, any> = Record<string, any>> {
    private config: Required<FormPersistenceConfig>;
    private storage: Storage | null = null;
    private autoSaveTimer: NodeJS.Timeout | null = null;
    private listeners: Set<(data: T) => void> = new Set();

    constructor(config: FormPersistenceConfig) {
        this.config = { ...DEFAULT_CONFIG, ...config };
        this.storage = getStorage(this.config.storageType);

        // إعداد مزامنة التبويبات
        if (this.config.syncTabs && typeof window !== 'undefined') {
            this.setupTabSync();
        }
    }

    /**
     * إعداد مزامنة بين التبويبات
     */
    private setupTabSync(): void {
        window.addEventListener('storage', (event) => {
            if (event.key === this.getFullKey() && event.newValue) {
                try {
                    const stored = JSON.parse(event.newValue) as StoredFormData<T>;
                    this.notifyListeners(stored.data);
                } catch {
                    // تجاهل الأخطاء
                }
            }
        });
    }

    /**
     * الحصول على المفتاح الكامل
     */
    private getFullKey(): string {
        return `form_${this.config.storageKey}_v${this.config.version}`;
    }

    /**
     * إشعار المستمعين بالتغييرات
     */
    private notifyListeners(data: T): void {
        this.listeners.forEach((listener) => listener(data));
    }

    /**
     * حفظ البيانات
     */
    save(
        data: T,
        options?: {
            stepIndex?: number;
            metadata?: StoredFormData['metadata'];
        }
    ): FormPersistenceResult {
        if (!this.storage) {
            return { success: false, error: 'التخزين غير متاح' };
        }

        try {
            // تصفية الحقول المستبعدة
            const filteredData = filterExcludedFields(data, this.config.excludeFields);

            const storedData: StoredFormData<Partial<T>> = {
                data: filteredData,
                timestamp: Date.now(),
                version: this.config.version,
                stepIndex: options?.stepIndex,
                metadata: options?.metadata,
            };

            let dataString = JSON.stringify(storedData);

            // تشفير إذا مطلوب
            if (this.config.encrypt) {
                dataString = simpleEncrypt(dataString);
            }

            this.storage.setItem(this.getFullKey(), dataString);

            // إشعار المستمعين
            this.notifyListeners(data);

            return { success: true, data: filteredData as T };
        } catch (error) {
            console.error('[FormPersistence] خطأ في الحفظ:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف'
            };
        }
    }

    /**
     * تحميل البيانات
     */
    load(): FormPersistenceResult<T> {
        if (!this.storage) {
            return { success: false, error: 'التخزين غير متاح' };
        }

        try {
            let dataString = this.storage.getItem(this.getFullKey());

            if (!dataString) {
                return { success: false, error: 'لا توجد بيانات محفوظة' };
            }

            // فك التشفير إذا مطلوب
            if (this.config.encrypt) {
                dataString = simpleDecrypt(dataString);
            }

            const stored: StoredFormData<T> = JSON.parse(dataString);

            // التحقق من الإصدار
            if (stored.version !== this.config.version) {
                return {
                    success: false,
                    error: 'إصدار البيانات غير متوافق',
                    isVersionMismatch: true,
                };
            }

            // التحقق من انتهاء الصلاحية
            if (isExpired(stored.timestamp, this.config.expirationMinutes)) {
                this.clear();
                return {
                    success: false,
                    error: 'انتهت صلاحية البيانات المحفوظة',
                    isExpired: true,
                };
            }

            return { success: true, data: stored.data };
        } catch (error) {
            console.error('[FormPersistence] خطأ في التحميل:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'خطأ غير معروف'
            };
        }
    }

    /**
     * تحميل البيانات مع البيانات الوصفية
     */
    loadWithMetadata(): FormPersistenceResult<StoredFormData<T>> {
        if (!this.storage) {
            return { success: false, error: 'التخزين غير متاح' };
        }

        try {
            let dataString = this.storage.getItem(this.getFullKey());

            if (!dataString) {
                return { success: false, error: 'لا توجد بيانات محفوظة' };
            }

            if (this.config.encrypt) {
                dataString = simpleDecrypt(dataString);
            }

            const stored: StoredFormData<T> = JSON.parse(dataString);

            if (stored.version !== this.config.version) {
                return { success: false, isVersionMismatch: true };
            }

            if (isExpired(stored.timestamp, this.config.expirationMinutes)) {
                this.clear();
                return { success: false, isExpired: true };
            }

            return { success: true, data: stored };
        } catch (error) {
            return { success: false };
        }
    }

    /**
     * حفظ تلقائي مع debounce
     */
    autoSave(data: T, options?: { stepIndex?: number; }): void {
        if (!this.config.autoSave) return;

        // إلغاء المؤقت السابق
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }

        // إعداد مؤقت جديد
        this.autoSaveTimer = setTimeout(() => {
            this.save(data, options);
        }, this.config.autoSaveDelay);
    }

    /**
     * مسح البيانات
     */
    clear(): boolean {
        if (!this.storage) return false;

        try {
            this.storage.removeItem(this.getFullKey());
            return true;
        } catch {
            return false;
        }
    }

    /**
     * التحقق من وجود بيانات محفوظة
     */
    hasSavedData(): boolean {
        if (!this.storage) return false;
        return this.storage.getItem(this.getFullKey()) !== null;
    }

    /**
     * الحصول على وقت آخر حفظ
     */
    getLastSaveTime(): Date | null {
        const result = this.loadWithMetadata();
        if (!result.success || !result.data) return null;
        return new Date(result.data.timestamp);
    }

    /**
     * الاشتراك في التغييرات
     */
    subscribe(listener: (data: T) => void): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    /**
     * تنظيف الموارد
     */
    dispose(): void {
        if (this.autoSaveTimer) {
            clearTimeout(this.autoSaveTimer);
        }
        this.listeners.clear();
    }
}

// ============================================
// 5. مفاتيح التخزين المعرفة مسبقاً
// ============================================

export const FORM_STORAGE_KEYS = {
    // إعلانات السيارات
    CAR_LISTING: 'car_listing_form',
    CAR_LISTING_IMAGES: 'car_listing_images',

    // خدمات النقل
    TRANSPORT_SERVICE: 'transport_service_form',

    // المعارض
    SHOWROOM_VEHICLE: 'showroom_vehicle_form',
    SHOWROOM_OFFER: 'showroom_offer_form',

    // المزادات
    AUCTION_CREATE: 'auction_create_form',

    // الحساب
    USER_PROFILE: 'user_profile_form',
    USER_SETTINGS: 'user_settings_form',
} as const;

// ============================================
// 6. Factory Function
// ============================================

/**
 * إنشاء instance جديد من FormPersistence
 */
export function createFormPersistence<T extends Record<string, any>>(
    config: FormPersistenceConfig
): FormPersistence<T> {
    return new FormPersistence<T>(config);
}

// ============================================
// 7. دوال مساعدة سريعة
// ============================================

/**
 * حفظ سريع لبيانات النموذج
 */
export function quickSaveForm<T extends Record<string, any>>(
    key: string,
    data: T,
    options?: { expireMinutes?: number; }
): boolean {
    const persistence = new FormPersistence<T>({
        storageKey: key,
        expirationMinutes: options?.expireMinutes || 60,
    });
    const result = persistence.save(data);
    return result.success;
}

/**
 * تحميل سريع لبيانات النموذج
 */
export function quickLoadForm<T extends Record<string, any>>(
    key: string
): T | null {
    const persistence = new FormPersistence<T>({ storageKey: key });
    const result = persistence.load();
    return result.success ? result.data || null : null;
}

/**
 * مسح سريع لبيانات النموذج
 */
export function quickClearForm(key: string): boolean {
    const persistence = new FormPersistence({ storageKey: key });
    return persistence.clear();
}

/**
 * التحقق من وجود مسودة محفوظة
 */
export function hasDraft(key: string): boolean {
    const persistence = new FormPersistence({ storageKey: key });
    return persistence.hasSavedData();
}

export default FormPersistence;
