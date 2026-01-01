// Payment Gateways - Shared Types and Enums

export enum PaymentGateway {
  MOYASAR = 'MOYASAR',
  STC_PAY = 'STC_PAY',
  TABBY = 'TABBY',
  CRYPTO = 'CRYPTO',
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  BID = 'BID',
  PURCHASE = 'PURCHASE',
  WITHDRAWAL = 'WITHDRAWAL',
}

export interface PaymentData {
  amount: number;
  currency: string;
  orderId: string;
  userId: string;
  auctionId?: string;
  transactionType: TransactionType;
  gateway: PaymentGateway;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status?: 'PENDING' | 'REQUIRES_ACTION' | 'COMPLETED' | 'FAILED';
  message?: string;
  error?: string;
  errorCode?: string;
  redirectUrl?: string;
  paymentUrl?: string;
  processingFee?: number;
  exchangeRate?: number;
  estimatedTime?: string;
  gatewayTransactionId?: string;
}

export default { PaymentGateway, TransactionType };
