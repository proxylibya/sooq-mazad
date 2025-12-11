// Wallet and payment related types

export type SecurityLevel = 'low' | 'medium' | 'high' | 'maximum';

export type VerificationType =
  | 'phone'
  | 'email'
  | 'identity'
  | 'payment'
  | 'two_factor'
  | 'twoFactor';

export interface SecurityCheck {
  id: string;
  type: VerificationType;
  status: 'pending' | 'verified' | 'failed';
  description: string;
  required: boolean;
  completedAt?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  nameEn: string;
  type: 'bank' | 'crypto' | 'wallet' | 'card';
  icon: string;
  description: string;
  fees: {
    deposit: number;
  };
  limits: {
    min: number;
    max: number;
    daily: number;
    monthly: number;
  };
  processingTime: {
    deposit: string;
  };
  securityLevel: SecurityLevel;
  requiredVerifications: VerificationType[];
  supportedCurrencies: string[];
  available: boolean;
  popular: boolean;
}

export interface PaymentMethodConfig {
  id: string;
  name: string;
  nameEn: string;
  type: 'bank' | 'crypto' | 'wallet' | 'card';
  icon: string;
  description: string;
  fees: {
    deposit: number;
  };
  limits: {
    min: number;
    max: number;
    daily: number;
    monthly: number;
  };
  processingTime: {
    deposit: string;
  };
  securityLevel: SecurityLevel;
  requiredVerifications: VerificationType[];
  supportedCurrencies: string[];
  available: boolean;
  popular: boolean;
}

export interface WalletBalance {
  currency: string;
  amount: number;
  frozen: number;
  available: number;
}

export interface Transaction {
  id: string;
  type: 'deposit';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description: string;
  createdAt: string;
  completedAt?: string;
  fee: number;
  from?: string;
  to?: string;
  reference?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  iban?: string;
  swiftCode?: string;
  verified: boolean;
  primary: boolean;
  createdAt: string;
}

export interface CryptoWallet {
  id: string;
  currency: string;
  address: string;
  network: string;
  balance: number;
  verified: boolean;
  createdAt: string;
}

export interface PaymentCard {
  id: string;
  type: 'visa' | 'mastercard' | 'amex';
  lastFour: string;
  expiryMonth: number;
  expiryYear: number;
  holderName: string;
  verified: boolean;
  primary: boolean;
  createdAt: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
}

export interface VerificationRequest {
  id: string;
  type: VerificationType;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  documents: string[];
  notes?: string;
  expiresAt: string;
}

export interface WalletNotification {
  id: string;
  type: 'transaction' | 'security' | 'verification' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  lastUpdated: string;
}

export interface WalletSettings {
  notifications: {
    transactions: boolean;
    security: boolean;
    marketing: boolean;
  };
  security: {
    twoFactor: boolean;
    loginNotifications: boolean;
    transactionLimits: {
      daily: number;
      monthly: number;
    };
  };
  preferences: {
    defaultCurrency: string;
    language: 'ar' | 'en' | 'fr';
    timezone: string;
  };
}

export interface WalletStats {
  totalBalance: number;
  totalDeposits: number;
  totalTransactions: number;
  monthlyVolume: number;
  profitLoss: number;
}

export interface PaymentGatewayResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  data?: any;
}

export interface QRCodeData {
  address: string;
  amount?: number;
  currency: string;
  network: string;
  memo?: string;
}

export interface FeeCalculation {
  amount: number;
  fee: number;
  total: number;
  currency: string;
  breakdown: {
    baseFee: number;
    networkFee: number;
    serviceFee: number;
  };
}

export interface DepositRequest {
  amount: number;
  currency: string;
  method: string;
  reference?: string;
}
