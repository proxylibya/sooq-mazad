/**
 * ثوابت نظام المحفظة
 * Wallet System Constants
 *
 * @description جميع الثوابت والإعدادات المستخدمة في نظام المحفظة
 */

import type { Currency, WalletLimits, WalletType } from './wallet-types';

// ============================================
// Wallet Limits
// ============================================

export const WALLET_LIMITS: Record<WalletType, WalletLimits> = {
    LOCAL: {
        min: 10,
        max: 50000,
        daily: 10000,
        monthly: 100000,
    },
    GLOBAL: {
        min: 5,
        max: 10000,
        daily: 5000,
        monthly: 50000,
    },
    CRYPTO: {
        min: 10,
        max: 100000,
        daily: 50000,
        monthly: 500000,
    },
};

// ============================================
// Fee Rates
// ============================================

export const FEE_RATES = {
    LOCAL: {
        DEPOSIT: 0.02, // 2%
        WITHDRAWAL: 0.025, // 2.5%
        TRANSFER: 0.01, // 1%
        SWAP: 0.015, // 1.5%
    },
    GLOBAL: {
        DEPOSIT: 0.034, // 3.4%
        WITHDRAWAL: 0.04, // 4%
        TRANSFER: 0.025, // 2.5%
        SWAP: 0.02, // 2%
    },
    CRYPTO: {
        DEPOSIT: 0.01, // 1%
        WITHDRAWAL: 0.015, // 1.5%
        TRANSFER: 0.01, // 1%
        SWAP: 0.01, // 1%
        NETWORK_FEE: 1, // 1 USDT fixed
    },
} as const;

// ============================================
// Supported Currencies
// ============================================

export const SUPPORTED_CURRENCIES: Record<Currency, {
    code: Currency;
    symbol: string;
    name: string;
    nameAr: string;
    decimals: number;
}> = {
    LYD: {
        code: 'LYD',
        symbol: 'د.ل',
        name: 'Libyan Dinar',
        nameAr: 'دينار ليبي',
        decimals: 2,
    },
    USD: {
        code: 'USD',
        symbol: '$',
        name: 'US Dollar',
        nameAr: 'دولار أمريكي',
        decimals: 2,
    },
    USDT: {
        code: 'USDT',
        symbol: 'USDT',
        name: 'Tether USD',
        nameAr: 'تيثر',
        decimals: 2,
    },
    'USDT-TRC20': {
        code: 'USDT-TRC20',
        symbol: 'USDT',
        name: 'Tether USD (TRC20)',
        nameAr: 'تيثر (شبكة ترون)',
        decimals: 6,
    },
};

// ============================================
// Wallet Type Mapping
// ============================================

export const WALLET_TYPE_MAP = {
    local: 'LOCAL',
    global: 'GLOBAL',
    crypto: 'CRYPTO',
    LOCAL: 'local',
    GLOBAL: 'global',
    CRYPTO: 'crypto',
} as const;

export const WALLET_CURRENCY_MAP: Record<WalletType, Currency> = {
    LOCAL: 'LYD',
    GLOBAL: 'USD',
    CRYPTO: 'USDT',
};

// ============================================
// Exchange Rate Configuration
// ============================================

export const EXCHANGE_RATE_API = {
    // Primary API (CoinGecko for crypto)
    COINGECKO_URL: 'https://api.coingecko.com/api/v3',

    // Fallback rates (updated manually)
    FALLBACK_RATES: {
        LYD_USD: 0.20,
        USD_LYD: 5.0,
        LYD_USDT: 0.20,
        USDT_LYD: 5.0,
        USD_USDT: 1.0,
        USDT_USD: 1.0,
    },

    // Cache duration for exchange rates (5 minutes)
    CACHE_TTL: 5 * 60 * 1000,

    // Rate update interval (1 minute)
    UPDATE_INTERVAL: 60 * 1000,
};

// ============================================
// Transaction Reference Prefixes
// ============================================

export const TRANSACTION_PREFIXES = {
    LOCAL: 'LCL',
    GLOBAL: 'GLB',
    CRYPTO: 'CRY',
    DEPOSIT: 'DEP',
    WITHDRAWAL: 'WTH',
    TRANSFER: 'TRF',
    SWAP: 'SWP',
} as const;

// ============================================
// Error Codes
// ============================================

export const WALLET_ERROR_CODES = {
    // Authentication
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    SESSION_EXPIRED: 'SESSION_EXPIRED',

    // Wallet
    WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
    WALLET_INACTIVE: 'WALLET_INACTIVE',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',

    // Transaction
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    AMOUNT_TOO_LOW: 'AMOUNT_TOO_LOW',
    AMOUNT_TOO_HIGH: 'AMOUNT_TOO_HIGH',
    DAILY_LIMIT_EXCEEDED: 'DAILY_LIMIT_EXCEEDED',
    MONTHLY_LIMIT_EXCEEDED: 'MONTHLY_LIMIT_EXCEEDED',

    // User
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    RECIPIENT_NOT_FOUND: 'RECIPIENT_NOT_FOUND',
    SELF_TRANSFER_NOT_ALLOWED: 'SELF_TRANSFER_NOT_ALLOWED',

    // System
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

// ============================================
// Error Messages (Arabic)
// ============================================

export const WALLET_ERROR_MESSAGES: Record<string, string> = {
    AUTH_REQUIRED: 'يرجى تسجيل الدخول',
    INVALID_TOKEN: 'جلسة غير صالحة',
    SESSION_EXPIRED: 'انتهت صلاحية الجلسة',
    WALLET_NOT_FOUND: 'المحفظة غير موجودة',
    WALLET_INACTIVE: 'المحفظة غير مفعلة',
    INSUFFICIENT_BALANCE: 'الرصيد غير كافي',
    INVALID_AMOUNT: 'مبلغ غير صالح',
    AMOUNT_TOO_LOW: 'المبلغ أقل من الحد الأدنى',
    AMOUNT_TOO_HIGH: 'المبلغ يتجاوز الحد الأقصى',
    DAILY_LIMIT_EXCEEDED: 'تجاوز الحد اليومي المسموح',
    MONTHLY_LIMIT_EXCEEDED: 'تجاوز الحد الشهري المسموح',
    USER_NOT_FOUND: 'المستخدم غير موجود',
    RECIPIENT_NOT_FOUND: 'المستلم غير موجود',
    SELF_TRANSFER_NOT_ALLOWED: 'لا يمكنك الإرسال لنفسك',
    RATE_LIMIT_EXCEEDED: 'تجاوز حد الطلبات، يرجى المحاولة لاحقاً',
    SERVICE_UNAVAILABLE: 'الخدمة غير متاحة حالياً',
    INTERNAL_ERROR: 'حدث خطأ غير متوقع',
};

// ============================================
// Security Settings
// ============================================

export const SECURITY_CONFIG = {
    // Rate limiting
    RATE_LIMIT: {
        TRANSFER: { windowMs: 60000, max: 10 }, // 10 per minute
        SWAP: { windowMs: 60000, max: 5 }, // 5 per minute
        DEPOSIT: { windowMs: 60000, max: 20 }, // 20 per minute
        WITHDRAWAL: { windowMs: 3600000, max: 5 }, // 5 per hour
    },

    // 2FA thresholds
    TWO_FACTOR_THRESHOLD: {
        LOCAL: 5000, // LYD
        GLOBAL: 1000, // USD
        CRYPTO: 1000, // USDT
    },

    // Withdrawal cooldown (minutes)
    WITHDRAWAL_COOLDOWN: 60,

    // Required confirmations for crypto
    REQUIRED_CONFIRMATIONS: 20,
    FAST_CONFIRMATIONS: 6,
};

// ============================================
// Processing Times (for display)
// ============================================

export const PROCESSING_TIMES = {
    LOCAL: {
        DEPOSIT: '1-24 ساعة',
        WITHDRAWAL: '1-3 أيام عمل',
        TRANSFER: 'فوري',
    },
    GLOBAL: {
        DEPOSIT: '1-3 أيام عمل',
        WITHDRAWAL: '3-5 أيام عمل',
        TRANSFER: 'فوري',
    },
    CRYPTO: {
        DEPOSIT: '10-30 دقيقة',
        WITHDRAWAL: '10-30 دقيقة',
        TRANSFER: 'فوري',
    },
};
