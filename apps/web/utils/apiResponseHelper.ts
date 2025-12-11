/**
 * API Response Helper
 */

import type { NextApiResponse } from 'next';

export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        pages?: number;
    };
}

export function successResponse<T>(
    res: NextApiResponse,
    data: T,
    message?: string,
    statusCode: number = 200
): void {
    res.status(statusCode).json({
        success: true,
        data,
        message,
    });
}

export function errorResponse(
    res: NextApiResponse,
    message: string,
    statusCode: number = 500,
    error?: unknown
): void {
    console.error('API Error:', error || message);
    res.status(statusCode).json({
        success: false,
        message,
    });
}

export function paginatedResponse<T>(
    res: NextApiResponse,
    data: T[],
    meta: { page: number; limit: number; total: number; }
): void {
    res.status(200).json({
        success: true,
        data,
        meta: {
            ...meta,
            pages: Math.ceil(meta.total / meta.limit),
        },
    });
}

export function notFoundResponse(res: NextApiResponse, message: string = 'غير موجود'): void {
    errorResponse(res, message, 404);
}

export function badRequestResponse(res: NextApiResponse, message: string): void {
    errorResponse(res, message, 400);
}

export function unauthorizedResponse(res: NextApiResponse, message: string = 'غير مصرح'): void {
    errorResponse(res, message, 401);
}

/**
 * عرض بيانات المستخدم بشكل آمن
 */
export interface UserDisplayData {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
    rating?: number;
    accountType?: string;
}

export function displayUserData(user: Record<string, unknown> | null | undefined): UserDisplayData | null {
    if (!user) return null;

    return {
        id: String(user.id || ''),
        name: String(user.name || user.username || 'مستخدم'),
        avatar: user.profileImage as string || user.avatar as string || '/images/avatars/default.svg',
        verified: Boolean(user.verified),
        rating: Number(user.rating) || 0,
        accountType: String(user.accountType || 'individual'),
    };
}

/**
 * تنسيق بيانات الاستجابة
 */
export function formatResponseData<T>(data: T): { success: true; data: T; } {
    return { success: true, data };
}

export default {
    successResponse,
    errorResponse,
    paginatedResponse,
    notFoundResponse,
    badRequestResponse,
    unauthorizedResponse,
    displayUserData,
    formatResponseData,
};
