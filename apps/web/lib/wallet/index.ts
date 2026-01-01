/**
 * نظام المحفظة الموحد - Enterprise Grade
 * Unified Wallet System
 *
 * @description نقطة الدخول الرئيسية لجميع عمليات المحفظة
 * @author Sooq Mazad Team
 * @version 2.0.0
 */

// Services
export { WalletService } from './wallet-service';

// Types
export type {
    Currency, DepositRequest, ExchangeRate, FeeCalculation, MultiWalletData, SwapRequest, TransactionRecord, TransactionStatus, TransactionType, TransferRequest, WalletBalance,
    WalletData, WalletLimits, WalletType, WithdrawalRequest
} from './wallet-types';

// Utils
export {
    calculateFees, formatCurrency,
    formatWalletBalance, generateTransactionReference, validateTransactionLimits, validateWalletAddress
} from './wallet-utils';

// Validation
export {
    validateDepositRequest, validateSwapRequest, validateTransferRequest, validateWithdrawalRequest
} from './wallet-validation';

// Cache
export { CACHE_KEYS, CACHE_TTL, WalletCache } from './wallet-cache';

// Constants
export {
    EXCHANGE_RATE_API, FEE_RATES, SECURITY_CONFIG, SUPPORTED_CURRENCIES, WALLET_ERROR_CODES,
    WALLET_ERROR_MESSAGES, WALLET_LIMITS
} from './wallet-constants';

// Exchange Rates
export {
    convertAmount, exchangeRateService, getAllRates, getExchangeRate
} from './exchange-rates';

