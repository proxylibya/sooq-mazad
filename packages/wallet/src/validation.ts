/**
 * التحقق من صحة طلبات المحفظة
 * Wallet Request Validation
 */

import { WALLET_ERROR_MESSAGES, WALLET_LIMITS } from './constants';
import type {
    DepositRequest,
    SwapRequest,
    TransferRequest,
    WalletTypeLower,
} from './types';
import { validateTransactionLimits } from './utils';

interface ValidationResult {
    isValid: boolean;
    error?: string;
    code?: string;
    field?: string;
}

/**
 * التحقق من صحة طلب التحويل
 */
export function validateTransferRequest(
    request: Partial<TransferRequest>
): ValidationResult {
    if (!request.recipientIdentifier?.trim()) {
        return {
            isValid: false,
            error: 'يرجى إدخال رقم هاتف أو معرف المستلم',
            code: 'MISSING_RECIPIENT',
            field: 'recipientIdentifier',
        };
    }

    if (!request.amount || request.amount <= 0) {
        return {
            isValid: false,
            error: WALLET_ERROR_MESSAGES.INVALID_AMOUNT,
            code: 'INVALID_AMOUNT',
            field: 'amount',
        };
    }

    if (!request.walletType) {
        return {
            isValid: false,
            error: 'يرجى اختيار نوع المحفظة',
            code: 'MISSING_WALLET_TYPE',
            field: 'walletType',
        };
    }

    const validWalletTypes: WalletTypeLower[] = ['local', 'global', 'crypto'];
    if (!validWalletTypes.includes(request.walletType)) {
        return {
            isValid: false,
            error: 'نوع محفظة غير صالح',
            code: 'INVALID_WALLET_TYPE',
            field: 'walletType',
        };
    }

    const limitsCheck = validateTransactionLimits(request.amount, request.walletType);
    if (!limitsCheck.isValid) {
        return {
            isValid: false,
            error: limitsCheck.error,
            code: limitsCheck.code,
            field: 'amount',
        };
    }

    return { isValid: true };
}

/**
 * التحقق من صحة طلب التبديل
 */
export function validateSwapRequest(
    request: Partial<SwapRequest>
): ValidationResult {
    if (!request.fromWallet) {
        return {
            isValid: false,
            error: 'يرجى اختيار المحفظة المصدر',
            code: 'MISSING_FROM_WALLET',
            field: 'fromWallet',
        };
    }

    if (!request.toWallet) {
        return {
            isValid: false,
            error: 'يرجى اختيار المحفظة الهدف',
            code: 'MISSING_TO_WALLET',
            field: 'toWallet',
        };
    }

    if (request.fromWallet === request.toWallet) {
        return {
            isValid: false,
            error: 'يرجى اختيار محفظتين مختلفتين',
            code: 'SAME_WALLET',
            field: 'toWallet',
        };
    }

    if (!request.amount || request.amount <= 0) {
        return {
            isValid: false,
            error: WALLET_ERROR_MESSAGES.INVALID_AMOUNT,
            code: 'INVALID_AMOUNT',
            field: 'amount',
        };
    }

    const validWalletTypes: WalletTypeLower[] = ['local', 'global', 'crypto'];
    if (!validWalletTypes.includes(request.fromWallet) || !validWalletTypes.includes(request.toWallet)) {
        return {
            isValid: false,
            error: 'نوع محفظة غير صالح',
            code: 'INVALID_WALLET_TYPE',
            field: 'walletType',
        };
    }

    const limitsCheck = validateTransactionLimits(request.amount, request.fromWallet);
    if (!limitsCheck.isValid) {
        return {
            isValid: false,
            error: limitsCheck.error,
            code: limitsCheck.code,
            field: 'amount',
        };
    }

    return { isValid: true };
}

/**
 * التحقق من صحة طلب الإيداع
 */
export function validateDepositRequest(
    request: Partial<DepositRequest>
): ValidationResult {
    if (!request.userId) {
        return {
            isValid: false,
            error: WALLET_ERROR_MESSAGES.AUTH_REQUIRED,
            code: 'AUTH_REQUIRED',
            field: 'userId',
        };
    }

    if (!request.amount || request.amount <= 0) {
        return {
            isValid: false,
            error: WALLET_ERROR_MESSAGES.INVALID_AMOUNT,
            code: 'INVALID_AMOUNT',
            field: 'amount',
        };
    }

    if (!request.walletType) {
        return {
            isValid: false,
            error: 'يرجى اختيار نوع المحفظة',
            code: 'MISSING_WALLET_TYPE',
            field: 'walletType',
        };
    }

    if (!request.paymentMethodId) {
        return {
            isValid: false,
            error: 'يرجى اختيار طريقة الدفع',
            code: 'MISSING_PAYMENT_METHOD',
            field: 'paymentMethodId',
        };
    }

    const limits = WALLET_LIMITS[request.walletType];
    if (request.amount < limits.min) {
        return {
            isValid: false,
            error: `الحد الأدنى للإيداع هو ${limits.min}`,
            code: 'AMOUNT_TOO_LOW',
            field: 'amount',
        };
    }

    if (request.amount > limits.max) {
        return {
            isValid: false,
            error: `الحد الأقصى للإيداع هو ${limits.max}`,
            code: 'AMOUNT_TOO_HIGH',
            field: 'amount',
        };
    }

    return { isValid: true };
}

/**
 * التحقق من صحة المبلغ
 */
export function validateAmount(amount: unknown): {
    isValid: boolean;
    value: number;
    error?: string;
} {
    if (amount === null || amount === undefined) {
        return { isValid: false, value: 0, error: 'المبلغ مطلوب' };
    }

    const numAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount);

    if (isNaN(numAmount)) {
        return { isValid: false, value: 0, error: 'مبلغ غير صالح' };
    }

    if (numAmount <= 0) {
        return { isValid: false, value: 0, error: 'المبلغ يجب أن يكون أكبر من صفر' };
    }

    return { isValid: true, value: numAmount };
}
