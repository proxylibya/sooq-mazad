/**
 * Payment System Types
 * أنواع نظام الدفع الليبي
 */

// Bank types and providers
export type LibyanBank =
  | 'CENTRAL_BANK_LIBYA' // البنك المركزي الليبي
  | 'NATIONAL_COMMERCIAL_BANK' // البنك التجاري الوطني
  | 'SAHARA_BANK' // مصرف الصحراء
  | 'WAHDA_BANK' // بنك الوحدة
  | 'REPUBLIC_BANK' // مصرف الجمهورية
  | 'NORTH_AFRICA_BANK' // مصرف شمال أفريقيا
  | 'AL_IJMAA_AL_ARABI' // مصرف الإجماع العربي
  | 'LIBYAN_FOREIGN_BANK' // المصرف الليبي الخارجي
  | 'MEDITERRANEAN_BANK' // البنك المتوسطي
  | 'AFRICAN_INVESTMENT_BANK'; // المصرف الأفريقي للاستثمار

// Payment method types
export type PaymentMethod =
  | 'BANK_TRANSFER' // تحويل مصرفي
  | 'MOBILE_MONEY' // محفظة إلكترونية
  | 'CASH_ON_DELIVERY' // الدفع عند الاستلام
  | 'INSTALLMENTS' // تقسيط
  | 'CRYPTOCURRENCY' // عملة رقمية
  | 'BANK_CARD' // بطاقة مصرفية
  | 'E_WALLET'; // محفظة إلكترونية

// Currency types
export type Currency = 'LYD' | 'USD' | 'EUR';

// Payment status
export type PaymentStatus =
  | 'PENDING' // معلق
  | 'PROCESSING' // قيد المعالجة
  | 'COMPLETED' // مكتمل
  | 'FAILED' // فشل
  | 'CANCELLED' // ملغي
  | 'REFUNDED' // مسترد
  | 'EXPIRED' // منتهي الصلاحية
  | 'DISPUTED' // متنازع عليه
  | 'ON_HOLD'; // معلق

// Libyan mobile money providers
export type MobileMoneyProvider =
  | 'LIBYANA_MONEY' // ليبيانا موني
  | 'ALMADAR_MONEY' // المدار موني
  | 'HATEF_LIBYA' // هاتف ليبيا
  | 'LIBYA_TELECOM' // ليبيا تلكوم
  | 'TADAWUL_PAY' // تداول باي
  | 'AMAL_PAY' // أمل باي
  | 'SADAD_LIBYA'; // سداد ليبيا

// Payment request interface
export interface PaymentRequest {
  id: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  description: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
  returnUrl?: string;
  cancelUrl?: string;
  expiresAt?: Date;
  customerId?: string;
  auctionId?: string;
  reference?: string;
}

// Payment response interface
export interface PaymentResponse {
  id: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  transactionId?: string;
  providerTransactionId?: string;
  paymentUrl?: string;
  qrCode?: string;
  instructions?: string[];
  estimatedCompletionTime?: number;
  fees?: PaymentFee[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  errorCode?: string;
  errorMessage?: string;
}

// Payment fee structure
export interface PaymentFee {
  type: 'FIXED' | 'PERCENTAGE' | 'TIERED';
  amount: number;
  currency: Currency;
  description: string;
  paidBy: 'CUSTOMER' | 'MERCHANT' | 'SHARED';
}

// Bank transfer details
export interface BankTransferDetails {
  bank: LibyanBank;
  accountNumber: string;
  accountName: string;
  iban?: string;
  swiftCode?: string;
  branchCode?: string;
  branchName?: string;
  reference: string;
  instructions: string[];
}

// Mobile money details
export interface MobileMoneyDetails {
  provider: MobileMoneyProvider;
  phoneNumber: string;
  name: string;
  reference: string;
  pin?: string;
  otp?: string;
}

// Card payment details
export interface CardPaymentDetails {
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
  billingAddress?: Address;
}

// Address interface
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country: string;
}

// Installment plan
export interface InstallmentPlan {
  id: string;
  totalAmount: number;
  installmentAmount: number;
  numberOfInstallments: number;
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  interestRate?: number;
  startDate: Date;
  endDate: Date;
  payments: InstallmentPayment[];
}

// Individual installment payment
export interface InstallmentPayment {
  id: string;
  installmentPlanId: string;
  amount: number;
  dueDate: Date;
  status: PaymentStatus;
  paymentDate?: Date;
  lateFee?: number;
  paidAmount?: number;
}

// Payment provider configuration
export interface PaymentProviderConfig {
  provider: string;
  name: string;
  type: PaymentMethod;
  isActive: boolean;
  isTestMode: boolean;
  supportedCurrencies: Currency[];
  supportedCountries: string[];
  minimumAmount: number;
  maximumAmount: number;
  fees: PaymentFee[];
  apiKey?: string;
  secretKey?: string;
  merchantId?: string;
  webhookUrl?: string;
  settings?: Record<string, any>;
}

// Webhook payload
export interface PaymentWebhook {
  event: 'PAYMENT_COMPLETED' | 'PAYMENT_FAILED' | 'PAYMENT_CANCELLED' | 'PAYMENT_REFUNDED';
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  timestamp: Date;
  data?: Record<string, any>;
  signature?: string;
}

// Payment statistics
export interface PaymentStats {
  totalTransactions: number;
  totalAmount: number;
  successRate: number;
  averageTransactionAmount: number;
  topPaymentMethods: Array<{
    method: PaymentMethod;
    count: number;
    amount: number;
  }>;
  topBanks: Array<{
    bank: LibyanBank;
    count: number;
    amount: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    transactions: number;
    amount: number;
  }>;
}

// Payment error codes
export enum PaymentErrorCode {
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  INVALID_CARD = 'INVALID_CARD',
  CARD_EXPIRED = 'CARD_EXPIRED',
  PAYMENT_DECLINED = 'PAYMENT_DECLINED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  TIMEOUT = 'TIMEOUT',
  FRAUD_DETECTED = 'FRAUD_DETECTED',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  ACCOUNT_BLOCKED = 'ACCOUNT_BLOCKED',
  INVALID_PIN = 'INVALID_PIN',
  INVALID_OTP = 'INVALID_OTP',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
}

// Libyan banking regulations compliance
export interface ComplianceInfo {
  kycRequired: boolean;
  amlChecked: boolean;
  sanctionsChecked: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  complianceOfficer?: string;
  lastChecked: Date;
  notes?: string;
}

// Exchange rate info
export interface ExchangeRate {
  from: Currency;
  to: Currency;
  rate: number;
  lastUpdated: Date;
  source: string;
}

// Payment notification preferences
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  whatsapp?: boolean;
  language: 'ar' | 'en';
}
