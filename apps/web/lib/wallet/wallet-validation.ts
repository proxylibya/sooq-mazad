/**
 * التحقق من صحة طلبات المحفظة
 * Wallet Request Validation
 *
 * @description دوال التحقق من صحة جميع طلبات المحفظة
 */

import { WALLET_ERROR_CODES, WALLET_ERROR_MESSAGES, WALLET_LIMITS } from './wallet-constants';
import type {
    DepositRequest,
    SwapRequest,
    TransferRequest,
    WalletTypeLower,
    WithdrawalRequest,
} from './wallet-types';
import { validateTransactionLimits, validateWalletAddress } from './wallet-utils';

// ============================================
// Types
// ============================================

interface ValidationResult {
    isValid: boolean;
    error?: string;
    code?: string;
    field?: string;
}

// ============================================
// Transfer Validation
// ============================================

/**
 * التحقق من صحة طلب التحويل
 */
export function validateTransferRequest(
    request: Partial<TransferRequest>
): ValidationResult {
    // Check required fields
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
            code: WALLET_ERROR_CODES.INVALID_AMOUNT,
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

    // Validate wallet type
    const validWalletTypes: WalletTypeLower[] = ['local', 'global', 'crypto'];
    if (!validWalletTypes.includes(request.walletType)) {
        return {
            isValid: false,
            error: 'نوع محفظة غير صالح',
            code: 'INVALID_WALLET_TYPE',
            field: 'walletType',
        };
    }

    // Validate amount limits
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

// ============================================
// Swap Validation
// ============================================

/**
 * التحقق من صحة طلب التبديل
 */
export function validateSwapRequest(
    request: Partial<SwapRequest>
): ValidationResult {
    // Check required fields
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
            code: WALLET_ERROR_CODES.INVALID_AMOUNT,
            field: 'amount',
        };
    }

    // Validate wallet types
    const validWalletTypes: WalletTypeLower[] = ['local', 'global', 'crypto'];
    if (!validWalletTypes.includes(request.fromWallet)) {
        return {
            isValid: false,
            error: 'نوع محفظة المصدر غير صالح',
            code: 'INVALID_FROM_WALLET',
            field: 'fromWallet',
        };
    }

    if (!validWalletTypes.includes(request.toWallet)) {
        return {
            isValid: false,
            error: 'نوع محفظة الهدف غير صالح',
            code: 'INVALID_TO_WALLET',
            field: 'toWallet',
        };
    }

    // Validate amount limits for source wallet
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

// ============================================
// Deposit Validation
// ============================================

/**
 * التحقق من صحة طلب الإيداع
 */
export function validateDepositRequest(
    request: Partial<DepositRequest>
): ValidationResult {
    // Check required fields
    if (!request.userId) {
        return {
            isValid: false,
            error: WALLET_ERROR_MESSAGES.AUTH_REQUIRED,
            code: WALLET_ERROR_CODES.AUTH_REQUIRED,
            field: 'userId',
        };
    }

    if (!request.amount || request.amount <= 0) {
        return {
            isValid: false,
            error: WALLET_ERROR_MESSAGES.INVALID_AMOUNT,
            code: WALLET_ERROR_CODES.INVALID_AMOUNT,
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

    // Validate wallet type and currency combination
    const walletTypeLower = request.walletType.toLowerCase() as WalletTypeLower;
    const validCombinations: Record<WalletTypeLower, string[]> = {
        local: ['LYD'],
        global: ['USD'],
        crypto: ['USDT', 'USDT-TRC20'],
    };

    if (
        request.currency &&
        !validCombinations[walletTypeLower]?.includes(request.currency)
    ) {
        return {
            isValid: false,
            error: 'العملة غير متوافقة مع نوع المحفظة',
            code: 'CURRENCY_MISMATCH',
            field: 'currency',
        };
    }

    // Validate amount limits
    const limits = WALLET_LIMITS[request.walletType];
    if (request.amount < limits.min) {
        return {
            isValid: false,
            error: `الحد الأدنى للإيداع هو ${limits.min}`,
            code: WALLET_ERROR_CODES.AMOUNT_TOO_LOW,
            field: 'amount',
        };
    }

    if (request.amount > limits.max) {
        return {
            isValid: false,
            error: `الحد الأقصى للإيداع هو ${limits.max}`,
            code: WALLET_ERROR_CODES.AMOUNT_TOO_HIGH,
            field: 'amount',
        };
    }

    return { isValid: true };
}

// ============================================
// Withdrawal Validation
// ============================================

/**
 * التحقق من صحة طلب السحب
 */
export function validateWithdrawalRequest(
    request: Partial<WithdrawalRequest>
): ValidationResult {
    // Check required fields
    if (!request.userId) {
        return {
            isValid: false,
            error: WALLET_ERROR_MESSAGES.AUTH_REQUIRED,
            code: WALLET_ERROR_CODES.AUTH_REQUIRED,
            field: 'userId',
        };
    }

    if (!request.amount || request.amount <= 0) {
        return {
            isValid: false,
            error: WALLET_ERROR_MESSAGES.INVALID_AMOUNT,
            code: WALLET_ERROR_CODES.INVALID_AMOUNT,
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

    // For crypto withdrawals, validate destination address
    if (request.walletType === 'crypto') {
        if (!request.destinationAddress) {
            return {
                isValid: false,
                error: 'يرجى إدخال عنوان المحفظة',
                code: 'MISSING_DESTINATION',
                field: 'destinationAddress',
            };
        }

        if (!validateWalletAddress(request.destinationAddress, 'TRC20')) {
            return {
                isValid: false,
                error: 'عنوان المحفظة غير صالح',
                code: 'INVALID_ADDRESS',
                field: 'destinationAddress',
            };
        }
    }

    // For local/global withdrawals, require bank account
    if (
        (request.walletType === 'local' || request.walletType === 'global') &&
        !request.bankAccountId
    ) {
        return {
            isValid: false,
            error: 'يرجى اختيار الحساب البنكي',
            code: 'MISSING_BANK_ACCOUNT',
            field: 'bankAccountId',
        };
    }

    // Validate amount limits
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

// ============================================
// Generic Validators
// ============================================

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

/**
 * التحقق من صحة نوع المحفظة
 */
export function validateWalletType(type: unknown): {
    isValid: boolean;
    value: WalletTypeLower | null;
    error?: string;
} {
    const validTypes: WalletTypeLower[] = ['local', 'global', 'crypto'];

    if (!type || typeof type !== 'string') {
        return { isValid: false, value: null, error: 'نوع المحفظة مطلوب' };
    }

    const lowerType = type.toLowerCase() as WalletTypeLower;

    if (!validTypes.includes(lowerType)) {
        return { isValid: false, value: null, error: 'نوع محفظة غير صالح' };
    }

    return { isValid: true, value: lowerType };
}
