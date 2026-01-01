/**
 * أنواع نظام المحفظة الموحدة
 * Unified Wallet Types
 *
 * @description جميع الأنواع والواجهات المستخدمة في نظام المحفظة
 */

// ============================================
// Enums & Basic Types
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

export interface WalletData {
    id: string;
    walletId: string;
    balance: number;
    currency: Currency;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface MultiWalletData {
    local: WalletBalance;
    global: WalletBalance;
    crypto: WalletBalance & {
        address?: string;
        network?: string;
    };
}

export interface FullWalletData {
    id: string;
    userId: string;
    isActive: boolean;
    publicId: number;
    createdAt: Date;
    updatedAt: Date;
    local: WalletData | null;
    global: WalletData | null;
    crypto: (WalletData & {
        address?: string;
        network?: string;
        publicKey?: string;
    }) | null;
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
    netAmount?: number;
    relatedTransactionId?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Request Interfaces
// ============================================

export interface TransferRequest {
    senderId: string;
    recipientId?: string;
    recipientIdentifier: string; // phone, username, or publicId
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
    reference?: string;
    metadata?: Record<string, unknown>;
}

export interface WithdrawalRequest {
    userId: string;
    amount: number;
    walletType: WalletTypeLower;
    destinationAddress?: string;
    bankAccountId?: string;
    note?: string;
}

// ============================================
// Financial Interfaces
// ============================================

export interface WalletLimits {
    min: number;
    max: number;
    daily: number;
    monthly: number;
}

export interface FeeCalculation {
    amount: number;
    feeRate: number;
    feeAmount: number;
    netAmount: number;
    currency: Currency;
    breakdown?: {
        baseFee: number;
        networkFee: number;
        serviceFee: number;
    };
}

export interface ExchangeRate {
    from: Currency;
    to: Currency;
    rate: number;
    inverseRate: number;
    timestamp: Date;
    source: string;
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
    fee?: number;
    message?: string;
    error?: string;
}

// ============================================
// Database Mapping Types
// ============================================

export interface PrismaWallet {
    id: string;
    userId: string;
    isActive: boolean;
    publicId: number;
    createdAt: Date;
    updatedAt: Date;
    local_wallets?: PrismaLocalWallet | null;
    global_wallets?: PrismaGlobalWallet | null;
    crypto_wallets?: PrismaCryptoWallet | null;
}

export interface PrismaLocalWallet {
    id: string;
    walletId: string;
    balance: number;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PrismaGlobalWallet {
    id: string;
    walletId: string;
    balance: number;
    currency: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface PrismaCryptoWallet {
    id: string;
    walletId: string;
    balance: number;
    currency: string;
    address?: string | null;
    network: string;
    publicKey?: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Configuration Types
// ============================================

export interface WalletConfig {
    type: WalletType;
    currency: Currency;
    field: 'local_wallets' | 'global_wallets' | 'crypto_wallets';
    balanceField: 'balance';
    limits: WalletLimits;
    fees: {
        deposit: number;
        withdrawal: number;
        transfer: number;
    };
}

export const WALLET_CONFIG: Record<WalletTypeLower, WalletConfig> = {
    local: {
        type: 'LOCAL',
        currency: 'LYD',
        field: 'local_wallets',
        balanceField: 'balance',
        limits: { min: 10, max: 50000, daily: 10000, monthly: 100000 },
        fees: { deposit: 0.02, withdrawal: 0.025, transfer: 0.01 },
    },
    global: {
        type: 'GLOBAL',
        currency: 'USD',
        field: 'global_wallets',
        balanceField: 'balance',
        limits: { min: 5, max: 10000, daily: 5000, monthly: 50000 },
        fees: { deposit: 0.034, withdrawal: 0.04, transfer: 0.025 },
    },
    crypto: {
        type: 'CRYPTO',
        currency: 'USDT',
        field: 'crypto_wallets',
        balanceField: 'balance',
        limits: { min: 10, max: 100000, daily: 50000, monthly: 500000 },
        fees: { deposit: 0.01, withdrawal: 0.015, transfer: 0.01 },
    },
};
