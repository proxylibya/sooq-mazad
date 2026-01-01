/**
 * أدوات نظام المحفظة
 * Wallet Utilities
 */

import {
    DEFAULT_EXCHANGE_RATES,
    FEE_RATES,
    SUPPORTED_CURRENCIES,
    WALLET_CURRENCY_MAP,
    WALLET_LIMITS,
    WALLET_TYPE_MAP,
} from './constants';
import type { Currency, WalletType, WalletTypeLower } from './types';

// ============================================
// Currency Formatting
// ============================================

/**
 * تنسيق العملة بالصيغة العربية
 */
export function formatCurrency(
    amount: number,
    currency: Currency = 'LYD'
): string {
    const config = SUPPORTED_CURRENCIES[currency];
    if (!config) return `${amount} ${currency}`;

    const formatted = amount.toLocaleString('ar-EG', {
        minimumFractionDigits: 2,
        maximumFractionDigits: config.decimals,
    });

    return `${formatted} ${config.symbol}`;
}

/**
 * تنسيق رصيد المحفظة
 */
export function formatWalletBalance(
    balance: number,
    walletType: WalletType | WalletTypeLower
): string {
    const type = walletType.toUpperCase() as WalletType;
    return formatCurrency(balance, WALLET_CURRENCY_MAP[type]);
}

// ============================================
// Fee Calculations
// ============================================

/**
 * حساب الرسوم للمعاملة
 */
export function calculateFees(
    amount: number,
    walletType: WalletType | WalletTypeLower,
    transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'SWAP'
): { feeRate: number; feeAmount: number; netAmount: number; } {
    const type = walletType.toUpperCase() as WalletType;
    const rates = FEE_RATES[type];
    const feeRate = rates[transactionType] || 0;
    const feeAmount = amount * feeRate;
    const netAmount = transactionType === 'DEPOSIT' ? amount - feeAmount : amount;

    return { feeRate, feeAmount, netAmount };
}

// ============================================
// Validation
// ============================================

/**
 * التحقق من حدود المعاملة
 */
export function validateTransactionLimits(
    amount: number,
    walletType: WalletType | WalletTypeLower
): { isValid: boolean; error?: string; code?: string; } {
    const type = walletType.toUpperCase() as WalletType;
    const limits = WALLET_LIMITS[type];

    if (amount < limits.min) {
        return {
            isValid: false,
            error: `الحد الأدنى للمعاملة هو ${limits.min}`,
            code: 'AMOUNT_TOO_LOW',
        };
    }

    if (amount > limits.max) {
        return {
            isValid: false,
            error: `الحد الأقصى للمعاملة هو ${limits.max}`,
            code: 'AMOUNT_TOO_HIGH',
        };
    }

    return { isValid: true };
}

/**
 * التحقق من صحة عنوان TRC20
 */
export function validateTRC20Address(address: string): boolean {
    if (!address || typeof address !== 'string') return false;
    if (!address.startsWith('T') || address.length !== 34) return false;
    const base58Regex =
        /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
    return base58Regex.test(address);
}

// ============================================
// Type Conversions
// ============================================

/**
 * تحويل نوع المحفظة
 */
export function toUpperWalletType(type: WalletTypeLower): WalletType {
    return WALLET_TYPE_MAP[type] as WalletType;
}

export function toLowerWalletType(type: WalletType): WalletTypeLower {
    return WALLET_TYPE_MAP[type] as WalletTypeLower;
}

/**
 * الحصول على العملة من نوع المحفظة
 */
export function getCurrencyFromWalletType(
    walletType: WalletType | WalletTypeLower
): Currency {
    const type = walletType.toUpperCase() as WalletType;
    return WALLET_CURRENCY_MAP[type];
}

// ============================================
// Exchange Rate Helpers
// ============================================

/**
 * الحصول على سعر الصرف بين عملتين
 */
export function getExchangeRate(from: Currency, to: Currency): number {
    if (from === to) return 1;

    const normalizedFrom = from === 'USDT-TRC20' ? 'USDT' : from;
    const normalizedTo = to === 'USDT-TRC20' ? 'USDT' : to;

    const rateKey = `${normalizedFrom}_${normalizedTo}` as keyof typeof DEFAULT_EXCHANGE_RATES;
    return DEFAULT_EXCHANGE_RATES[rateKey] || 1;
}

/**
 * تحويل المبلغ بين عملتين
 */
export function convertCurrency(
    amount: number,
    from: Currency,
    to: Currency
): { amount: number; rate: number; } {
    const rate = getExchangeRate(from, to);
    return { amount: amount * rate, rate };
}

// ============================================
// Reference Generation
// ============================================

/**
 * توليد مرجع المعاملة
 */
export function generateTransactionReference(
    walletType: WalletType | WalletTypeLower,
    transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER' | 'SWAP'
): string {
    const type = walletType.toUpperCase() as WalletType;
    const prefixes: Record<WalletType, string> = {
        LOCAL: 'LCL',
        GLOBAL: 'GLB',
        CRYPTO: 'CRY',
    };
    const txPrefixes: Record<string, string> = {
        DEPOSIT: 'DEP',
        WITHDRAWAL: 'WTH',
        TRANSFER: 'TRF',
        SWAP: 'SWP',
    };

    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6).toUpperCase();

    return `${prefixes[type]}-${txPrefixes[transactionType]}-${timestamp}-${random}`;
}
