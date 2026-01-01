/**
 * نظام معالجة الأخطاء للعميل
 * Client-side Error Handler
 */

export enum ErrorSeverity {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical',
    // Aliases for compatibility
    LOW = 'info',
    MEDIUM = 'warning',
    HIGH = 'error',
}

export enum ClientErrorType {
    NETWORK = 'network',
    VALIDATION = 'validation',
    AUTHENTICATION = 'authentication',
    AUTHORIZATION = 'authorization',
    NOT_FOUND = 'not_found',
    SERVER = 'server',
    CLIENT = 'client',
    UNKNOWN = 'unknown',
}

export interface ClientError {
    id: string;
    type: ClientErrorType;
    severity: ErrorSeverity;
    message: string;
    userMessage: string;
    timestamp: Date;
    statusCode?: number;
    suggestions?: string[];
    retryable?: boolean;
    context?: Record<string, unknown>;
}

type ErrorListener = (error: ClientError) => void;

class ClientErrorHandler {
    private errors: ClientError[] = [];
    private listeners: ErrorListener[] = [];
    private maxErrors = 100;

    /**
     * إنشاء خطأ جديد
     */
    createError(
        type: ClientErrorType,
        message: string,
        options: Partial<ClientError> = {}
    ): ClientError {
        const error: ClientError = {
            id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            severity: options.severity || ErrorSeverity.ERROR,
            message,
            userMessage: options.userMessage || this.getDefaultUserMessage(type),
            timestamp: new Date(),
            retryable: options.retryable ?? this.isRetryable(type),
            suggestions: options.suggestions || this.getDefaultSuggestions(type),
            ...options,
        };

        this.addError(error);
        return error;
    }

    /**
     * إضافة خطأ للقائمة وإخطار المستمعين
     */
    private addError(error: ClientError): void {
        this.errors.unshift(error);

        // الحفاظ على حد أقصى للأخطاء المخزنة
        if (this.errors.length > this.maxErrors) {
            this.errors = this.errors.slice(0, this.maxErrors);
        }

        // إخطار جميع المستمعين
        this.listeners.forEach((listener) => {
            try {
                listener(error);
            } catch (e) {
                console.error('Error in error listener:', e);
            }
        });
    }

    /**
     * تسجيل مستمع للأخطاء
     */
    subscribe(listener: ErrorListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    /**
     * إضافة callback للإشعارات (للتوافق)
     */
    addNotificationCallback(callback: ErrorListener): void {
        this.listeners.push(callback);
    }

    /**
     * إزالة callback للإشعارات (للتوافق)
     */
    removeNotificationCallback(callback: ErrorListener): void {
        this.listeners = this.listeners.filter((l) => l !== callback);
    }

    /**
     * الحصول على جميع الأخطاء
     */
    getErrors(): ClientError[] {
        return [...this.errors];
    }

    /**
     * مسح جميع الأخطاء
     */
    clearErrors(): void {
        this.errors = [];
    }

    /**
     * حذف خطأ محدد
     */
    removeError(id: string): void {
        this.errors = this.errors.filter((e) => e.id !== id);
    }

    /**
     * الحصول على رسالة المستخدم الافتراضية
     */
    private getDefaultUserMessage(type: ClientErrorType): string {
        const messages: Record<ClientErrorType, string> = {
            [ClientErrorType.NETWORK]: 'فشل الاتصال بالخادم. تحقق من اتصالك بالإنترنت.',
            [ClientErrorType.VALIDATION]: 'يرجى التحقق من البيانات المدخلة.',
            [ClientErrorType.AUTHENTICATION]: 'يرجى تسجيل الدخول للمتابعة.',
            [ClientErrorType.AUTHORIZATION]: 'ليس لديك صلاحية لهذا الإجراء.',
            [ClientErrorType.NOT_FOUND]: 'العنصر المطلوب غير موجود.',
            [ClientErrorType.SERVER]: 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.',
            [ClientErrorType.CLIENT]: 'حدث خطأ. يرجى تحديث الصفحة.',
            [ClientErrorType.UNKNOWN]: 'حدث خطأ غير متوقع.',
        };
        return messages[type];
    }

    /**
     * الحصول على اقتراحات افتراضية
     */
    private getDefaultSuggestions(type: ClientErrorType): string[] {
        const suggestions: Record<ClientErrorType, string[]> = {
            [ClientErrorType.NETWORK]: [
                'تحقق من اتصالك بالإنترنت',
                'حاول تحديث الصفحة',
            ],
            [ClientErrorType.VALIDATION]: [
                'راجع البيانات المدخلة',
                'تأكد من ملء جميع الحقول المطلوبة',
            ],
            [ClientErrorType.AUTHENTICATION]: [
                'سجل دخولك مرة أخرى',
                'تحقق من بيانات الدخول',
            ],
            [ClientErrorType.AUTHORIZATION]: [
                'تواصل مع المسؤول للحصول على الصلاحيات',
            ],
            [ClientErrorType.NOT_FOUND]: [
                'تحقق من الرابط',
                'ابحث عن العنصر مرة أخرى',
            ],
            [ClientErrorType.SERVER]: [
                'انتظر قليلاً وحاول مرة أخرى',
                'إذا استمرت المشكلة، تواصل مع الدعم',
            ],
            [ClientErrorType.CLIENT]: [
                'حاول تحديث الصفحة',
                'امسح ذاكرة التخزين المؤقت',
            ],
            [ClientErrorType.UNKNOWN]: [
                'حاول مرة أخرى',
                'تواصل مع الدعم إذا استمرت المشكلة',
            ],
        };
        return suggestions[type];
    }

    /**
     * تحديد إذا كان الخطأ قابل لإعادة المحاولة
     */
    private isRetryable(type: ClientErrorType): boolean {
        return [
            ClientErrorType.NETWORK,
            ClientErrorType.SERVER,
        ].includes(type);
    }

    /**
     * معالجة خطأ HTTP
     */
    handleHttpError(statusCode: number, message?: string): ClientError {
        let type = ClientErrorType.UNKNOWN;
        let severity = ErrorSeverity.ERROR;

        if (statusCode >= 400 && statusCode < 500) {
            switch (statusCode) {
                case 400:
                    type = ClientErrorType.VALIDATION;
                    break;
                case 401:
                    type = ClientErrorType.AUTHENTICATION;
                    break;
                case 403:
                    type = ClientErrorType.AUTHORIZATION;
                    break;
                case 404:
                    type = ClientErrorType.NOT_FOUND;
                    break;
                default:
                    type = ClientErrorType.CLIENT;
            }
        } else if (statusCode >= 500) {
            type = ClientErrorType.SERVER;
            severity = ErrorSeverity.CRITICAL;
        }

        return this.createError(type, message || `HTTP Error ${statusCode}`, {
            statusCode,
            severity,
        });
    }

    /**
     * معالجة خطأ الشبكة
     */
    handleNetworkError(error: Error): ClientError {
        return this.createError(
            ClientErrorType.NETWORK,
            error.message || 'Network error',
            {
                severity: ErrorSeverity.ERROR,
                retryable: true,
            }
        );
    }

    /**
     * تسجيل خطأ في React Error Boundary
     */
    handleReactError(error: Error, componentName?: string): ClientError {
        return this.createError(
            ClientErrorType.CLIENT,
            error.message,
            {
                severity: ErrorSeverity.CRITICAL,
                context: {
                    componentName,
                    stack: error.stack,
                },
            }
        );
    }
}

// تصدير instance واحد
export const clientErrorHandler = new ClientErrorHandler();

// تصدير الكلاس للاختبار
export { ClientErrorHandler };

