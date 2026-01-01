/**
 * API Error Handler
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiRes = any;

export interface ApiError {
    success: false;
    message: string;
    code?: string;
    details?: unknown;
}

export function handleApiError(
    res: ApiRes,
    error: unknown,
    defaultMessage: string = 'حدث خطأ في الخادم'
): void {
    console.error('API Error:', error);

    const message = error instanceof Error ? error.message : defaultMessage;
    const statusCode = getStatusCode(error);

    res.status(statusCode).json({
        success: false,
        message,
    });
}

function getStatusCode(error: unknown): number {
    if (error && typeof error === 'object' && 'statusCode' in error) {
        return (error as { statusCode: number; }).statusCode;
    }
    return 500;
}

export function badRequest(res: ApiRes, message: string): void {
    res.status(400).json({ success: false, message });
}

export function unauthorized(res: ApiRes, message: string = 'غير مصرح'): void {
    res.status(401).json({ success: false, message });
}

export function forbidden(res: ApiRes, message: string = 'ممنوع'): void {
    res.status(403).json({ success: false, message });
}

export function notFound(res: ApiRes, message: string = 'غير موجود'): void {
    res.status(404).json({ success: false, message });
}

export function serverError(res: ApiRes, message: string = 'خطأ في الخادم'): void {
    res.status(500).json({ success: false, message });
}

/**
 * إرسال استجابة خطأ موحدة
 */
export function sendErrorResponse(
    res: ApiRes,
    statusCode: number,
    message: string,
    code?: string,
    details?: unknown
): void {
    res.status(statusCode).json({
        success: false,
        message,
        code,
        details,
    });
}

/**
 * إرسال استجابة نجاح موحدة
 */
export function sendSuccessResponse(
    res: ApiRes,
    statusCode: number,
    data: unknown,
    message?: string
): void {
    res.status(statusCode).json({
        success: true,
        message: message || 'تمت العملية بنجاح',
        data,
    });
}

export default {
    handleApiError,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    serverError,
    sendErrorResponse,
    sendSuccessResponse,
};
