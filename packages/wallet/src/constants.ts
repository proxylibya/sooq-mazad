/**
 * ثوابت نظام المحفظة
 * Wallet System Constants
 */

import type { Currency, WalletLimits, WalletType } from './types';

// ============================================
// Wallet Limits
// ============================================

export const WALLET_LIMITS: Record<WalletType, WalletLimits> = {
    LOCAL: { min: 10, max: 50000, daily: 10000, monthly: 100000 },
    GLOBAL: { min: 5, max: 10000, daily: 5000, monthly: 50000 },
    CRYPTO: { min: 10, max: 100000, daily: 50000, monthly: 500000 },
};

// ============================================
// Fee Rates
// ============================================

export const FEE_RATES = {
    LOCAL: {
        DEPOSIT: 0.02,
        WITHDRAWAL: 0.025,
        TRANSFER: 0.01,
        SWAP: 0.015,
    },
    GLOBAL: {
        DEPOSIT: 0.034,
        WITHDRAWAL: 0.04,
        TRANSFER: 0.025,
        SWAP: 0.02,
    },
    CRYPTO: {
        DEPOSIT: 0.01,
        WITHDRAWAL: 0.015,
        TRANSFER: 0.01,
        SWAP: 0.01,
        NETWORK_FEE: 1,
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
// Error Codes
// ============================================

export const WALLET_ERROR_CODES = {
    AUTH_REQUIRED: 'AUTH_REQUIRED',
    INVALID_TOKEN: 'INVALID_TOKEN',
    WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    AMOUNT_TOO_LOW: 'AMOUNT_TOO_LOW',
    AMOUNT_TOO_HIGH: 'AMOUNT_TOO_HIGH',
    DAILY_LIMIT_EXCEEDED: 'DAILY_LIMIT_EXCEEDED',
    MONTHLY_LIMIT_EXCEEDED: 'MONTHLY_LIMIT_EXCEEDED',
    RECIPIENT_NOT_FOUND: 'RECIPIENT_NOT_FOUND',
    SELF_TRANSFER_NOT_ALLOWED: 'SELF_TRANSFER_NOT_ALLOWED',
    RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export const WALLET_ERROR_MESSAGES: Record<string, string> = {
    AUTH_REQUIRED: 'يرجى تسجيل الدخول',
    INVALID_TOKEN: 'جلسة غير صالحة',
    WALLET_NOT_FOUND: 'المحفظة غير موجودة',
    INSUFFICIENT_BALANCE: 'الرصيد غير كافي',
    INVALID_AMOUNT: 'مبلغ غير صالح',
    AMOUNT_TOO_LOW: 'المبلغ أقل من الحد الأدنى',
    AMOUNT_TOO_HIGH: 'المبلغ يتجاوز الحد الأقصى',
    DAILY_LIMIT_EXCEEDED: 'تجاوز الحد اليومي المسموح',
    MONTHLY_LIMIT_EXCEEDED: 'تجاوز الحد الشهري المسموح',
    RECIPIENT_NOT_FOUND: 'المستلم غير موجود',
    SELF_TRANSFER_NOT_ALLOWED: 'لا يمكنك الإرسال لنفسك',
    RATE_LIMIT_EXCEEDED: 'تجاوز حد الطلبات',
};

// ============================================
// Exchange Rates (Fallback)
// ============================================

export const DEFAULT_EXCHANGE_RATES = {
    LYD_USD: 0.2,
    USD_LYD: 5.0,
    LYD_USDT: 0.2,
    USDT_LYD: 5.0,
    USD_USDT: 1.0,
    USDT_USD: 1.0,
};
