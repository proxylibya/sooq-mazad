/**
 * أدوات نظام المحفظة
 * Wallet Utilities
 *
 * @description دوال مساعدة لعمليات المحفظة
 */

import crypto from 'crypto';
import {
    FEE_RATES,
    SUPPORTED_CURRENCIES,
    TRANSACTION_PREFIXES,
    WALLET_LIMITS,
    WALLET_TYPE_MAP,
} from './wallet-constants';
import type {
    Currency,
    FeeCalculation,
    WalletType,
    WalletTypeLower,
} from './wallet-types';

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
    const currencyMap: Record<WalletType, Currency> = {
        LOCAL: 'LYD',
        GLOBAL: 'USD',
        CRYPTO: 'USDT',
    };
    return formatCurrency(balance, currencyMap[type]);
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
): FeeCalculation {
    const type = walletType.toUpperCase() as WalletType;
    const rates = FEE_RATES[type];
    const feeRate = rates[transactionType] || 0;

    // Add network fee for crypto withdrawals
    let networkFee = 0;
    if (type === 'CRYPTO' && transactionType === 'WITHDRAWAL') {
        networkFee = FEE_RATES.CRYPTO.NETWORK_FEE;
    }

    const baseFee = amount * feeRate;
    const totalFee = baseFee + networkFee;
    const netAmount = transactionType === 'DEPOSIT'
        ? amount - totalFee
        : amount;

    const currencyMap: Record<WalletType, Currency> = {
        LOCAL: 'LYD',
        GLOBAL: 'USD',
        CRYPTO: 'USDT',
    };

    return {
        amount,
        feeRate,
        feeAmount: totalFee,
        netAmount,
        currency: currencyMap[type],
        breakdown: {
            baseFee,
            networkFee,
            serviceFee: 0,
        },
    };
}

// ============================================
// Validation
// ============================================

/**
 * التحقق من حدود المعاملة
 */
export function validateTransactionLimits(
    amount: number,
    walletType: WalletType | WalletTypeLower,
    userLimits?: { dailyUsed: number; monthlyUsed: number; }
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

    if (userLimits) {
        if (userLimits.dailyUsed + amount > limits.daily) {
            return {
                isValid: false,
                error: `تجاوز الحد اليومي المسموح (${limits.daily})`,
                code: 'DAILY_LIMIT_EXCEEDED',
            };
        }

        if (userLimits.monthlyUsed + amount > limits.monthly) {
            return {
                isValid: false,
                error: `تجاوز الحد الشهري المسموح (${limits.monthly})`,
                code: 'MONTHLY_LIMIT_EXCEEDED',
            };
        }
    }

    return { isValid: true };
}

/**
 * التحقق من صحة عنوان TRC20
 */
export function validateWalletAddress(
    address: string,
    network: 'TRC20' | 'ERC20' = 'TRC20'
): boolean {
    if (!address || typeof address !== 'string') return false;

    if (network === 'TRC20') {
        // TRON addresses start with 'T' and are 34 characters long
        if (!address.startsWith('T') || address.length !== 34) return false;

        // Check if all characters are valid Base58
        const base58Regex =
            /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
        return base58Regex.test(address);
    }

    if (network === 'ERC20') {
        // Ethereum addresses start with '0x' and are 42 characters long
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    return false;
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
    const walletPrefix = TRANSACTION_PREFIXES[type];
    const txPrefix = TRANSACTION_PREFIXES[transactionType];
    const timestamp = Date.now();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();

    return `${walletPrefix}-${txPrefix}-${timestamp}-${random}`;
}

/**
 * توليد معرف فريد
 */
export function generateUniqueId(prefix: string = 'id'): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `${prefix}_${timestamp}_${random}`;
}

// ============================================
// Type Conversions
// ============================================

/**
 * تحويل نوع المحفظة من lowercase إلى uppercase
 */
export function toUpperWalletType(type: WalletTypeLower): WalletType {
    return WALLET_TYPE_MAP[type] as WalletType;
}

/**
 * تحويل نوع المحفظة من uppercase إلى lowercase
 */
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
    const map: Record<WalletType, Currency> = {
        LOCAL: 'LYD',
        GLOBAL: 'USD',
        CRYPTO: 'USDT',
    };
    return map[type];
}

// ============================================
// Wallet Address Generation
// ============================================

/**
 * توليد عنوان TRC20 للمستخدم
 */
export function generateTRC20Address(userId: string): string {
    try {
        const secret = process.env.WALLET_SECRET || 'default-secret-key-change-in-production';
        const seed = crypto
            .createHash('sha256')
            .update(`${userId}-${secret}`)
            .digest('hex');

        const alphabet =
            '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
        let address = 'T';

        for (let i = 0; i < 33; i++) {
            const index = parseInt(seed.substr(i * 2, 2), 16) % alphabet.length;
            address += alphabet[index];
        }

        return address;
    } catch (error) {
        console.error('Error generating TRC20 address:', error);
        throw new Error('فشل في توليد عنوان المحفظة');
    }
}

// ============================================
// Exchange Rate Helpers
// ============================================

/**
 * الحصول على سعر الصرف بين عملتين
 */
export function getExchangeRate(
    from: Currency,
    to: Currency,
    rates?: Record<string, number>
): number {
    if (from === to) return 1;

    // Default fallback rates
    const defaultRates: Record<string, number> = {
        LYD_USD: 0.2,
        USD_LYD: 5.0,
        LYD_USDT: 0.2,
        USDT_LYD: 5.0,
        USD_USDT: 1.0,
        USDT_USD: 1.0,
        'USDT-TRC20_USD': 1.0,
        'USD_USDT-TRC20': 1.0,
        'USDT-TRC20_LYD': 5.0,
        'LYD_USDT-TRC20': 0.2,
    };

    const rateKey = `${from}_${to}`;
    const activeRates = rates || defaultRates;

    return activeRates[rateKey] || defaultRates[rateKey] || 1;
}

/**
 * تحويل المبلغ بين عملتين
 */
export function convertCurrency(
    amount: number,
    from: Currency,
    to: Currency,
    rates?: Record<string, number>
): { amount: number; rate: number; } {
    const rate = getExchangeRate(from, to, rates);
    return {
        amount: amount * rate,
        rate,
    };
}

// ============================================
// Date Helpers
// ============================================

/**
 * الحصول على بداية اليوم
 */
export function getStartOfDay(date: Date = new Date()): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
}

/**
 * الحصول على بداية الشهر
 */
export function getStartOfMonth(date: Date = new Date()): Date {
    const start = new Date(date);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return start;
}
