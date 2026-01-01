/**
 * أنواع نظام المحفظة الموحدة
 * Unified Wallet Types
 */

// ============================================
// Basic Types
// ============================================

export type WalletType = 'LOCAL' | 'GLOBAL' | 'CRYPTO';
export type WalletTypeLower = 'local' | 'global' | 'crypto';
export type Currency = 'LYD' | 'USD' | 'USDT' | 'USDT-TRC20';

export type TransactionType =
    | 'DEPOSIT'
    | 'WITHDRAWAL'
    | 'TRANSFER'
    | 'SWAP'
    | 'FEE'
    | 'REFUND'
    | 'ADJUSTMENT';

export type TransactionStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'CANCELLED'
    | 'REFUNDED';

export type DepositStatus =
    | 'INITIATED'
    | 'PENDING'
    | 'CONFIRMED'
    | 'COMPLETED'
    | 'FAILED'
    | 'EXPIRED'
    | 'CANCELLED';

// ============================================
// Wallet Interfaces
// ============================================

export interface WalletBalance {
    balance: number;
    currency: Currency;
    isActive: boolean;
    updatedAt?: Date;
}

export interface MultiWalletBalance {
    local: WalletBalance;
    global: WalletBalance;
    crypto: WalletBalance & {
        address?: string;
        network?: string;
    };
}

export interface WalletLimits {
    min: number;
    max: number;
    daily: number;
    monthly: number;
}

// ============================================
// Transaction Interfaces
// ============================================

export interface TransactionRecord {
    id: string;
    walletId: string;
    userId: string;
    type: TransactionType;
    amount: number;
    currency: Currency;
    status: TransactionStatus;
    walletType?: WalletType;
    description?: string;
    reference?: string;
    fee?: number;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Request Interfaces
// ============================================

export interface TransferRequest {
    senderId: string;
    recipientIdentifier: string;
    amount: number;
    walletType: WalletTypeLower;
    note?: string;
}

export interface SwapRequest {
    userId: string;
    fromWallet: WalletTypeLower;
    toWallet: WalletTypeLower;
    amount: number;
}

export interface DepositRequest {
    userId: string;
    amount: number;
    currency: Currency;
    walletType: WalletType;
    paymentMethodId: string;
}

// ============================================
// Response Interfaces
// ============================================

export interface WalletResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    code?: string;
}

export interface TransferResponse {
    success: boolean;
    transactionId?: string;
    amount: number;
    currency: Currency;
    recipient?: {
        id: string;
        name?: string;
        phone?: string;
    };
    fee?: number;
    message?: string;
    error?: string;
}

export interface SwapResponse {
    success: boolean;
    transactionId?: string;
    fromAmount: number;
    fromCurrency: Currency;
    toAmount: number;
    toCurrency: Currency;
    rate: number;
    message?: string;
    error?: string;
}

// ============================================
// Admin Interfaces
// ============================================

export interface AdminWalletView {
    id: string;
    publicId: number;
    userId: string;
    userName?: string;
    userPhone?: string;
    userEmail?: string;
    localBalance: number;
    globalBalance: number;
    cryptoBalance: number;
    totalBalance: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface WalletStats {
    totalBalance: number;
    totalLocalBalance: number;
    totalGlobalBalance: number;
    totalCryptoBalance: number;
    totalDeposits: number;
    totalWithdrawals: number;
    pendingWithdrawals: number;
    activeWallets: number;
    frozenWallets: number;
}

export interface WalletAuditEntry {
    id: string;
    walletId: string;
    userId: string;
    action: string;
    amount?: number;
    currency?: Currency;
    status: 'SUCCESS' | 'FAILED';
    ipAddress?: string;
    details?: Record<string, unknown>;
    createdAt: Date;
}
