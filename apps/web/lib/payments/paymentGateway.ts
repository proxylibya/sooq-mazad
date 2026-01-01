// Payment Gateway - Minimal runtime for API pages

export enum PaymentMethod {
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  CASH = 'CASH',
}

export enum PaymentGateway {
  MOYASAR = 'MOYASAR',
  STC_PAY = 'STC_PAY',
  TABBY = 'TABBY',
  CRYPTO = 'CRYPTO',
}

export enum Currency {
  LYD = 'LYD', // الدينار الليبي - العملة الأساسية
  USD = 'USD', // دولار أمريكي
  EUR = 'EUR', // يورو
  SAR = 'SAR', // ريال سعودي (للمرجعية فقط)
}

type ProcessRequest = {
  id: string;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  gateway: PaymentGateway;
  customerId: string;
  orderId: string;
  description?: string;
  metadata?: Record<string, unknown>;
  country: string;
};

const memoryTx = new Map<string, { status: string }>();

function fakeTxn(id: string) {
  memoryTx.set(id, { status: 'PENDING' });
  setTimeout(() => memoryTx.set(id, { status: 'COMPLETED' }), 2000);
}

export const paymentGateway = {
  getAvailablePaymentMethods(country: string): PaymentMethod[] {
    // Simplified by country
    return country === 'LY'
      ? [PaymentMethod.BANK_TRANSFER, PaymentMethod.CARD]
      : [PaymentMethod.CARD, PaymentMethod.BANK_TRANSFER, PaymentMethod.WALLET];
  },

  getAvailableGateways(country: string): PaymentGateway[] {
    const common = [PaymentGateway.MOYASAR, PaymentGateway.STC_PAY, PaymentGateway.TABBY];
    return country === 'LY' ? [...common, PaymentGateway.CRYPTO] : common;
  },

  getExchangeRates(): Map<string, number> {
    // العملة الأساسية: الدينار الليبي (LYD)
    // Base currency: Libyan Dinar (LYD)
    return new Map<string, number>([
      ['LYD', 1],      // العملة الأساسية
      ['USD', 4.80],   // دولار أمريكي
      ['EUR', 5.20],   // يورو
      ['SAR', 1.28],   // ريال سعودي (للمرجعية)
    ]);
  },

  getCountryPaymentConfig(country: string) {
    if (country === 'LY') {
      return {
        localBanks: ['Jamahiriya Bank', 'National Commercial Bank'],
        regulations: ['KYC Required', 'Local transfer only'],
        features: ['Installments', 'Local Wallet Top-up'],
      };
    }
    return {
      localBanks: [],
      regulations: [],
      features: ['Cards'],
    };
  },

  async processPayment(request: ProcessRequest) {
    const { id } = request;
    fakeTxn(id);
    return {
      success: true,
      transactionId: id,
      status: 'PENDING' as const,
      message: 'تم إنشاء معاملة الدفع',
      redirectUrl: undefined,
      processingFee: 0,
      exchangeRate: 1,
      estimatedTime: '1-3m',
    };
  },

  getTransactionStatus(transactionId: string) {
    const tx = memoryTx.get(transactionId);
    return tx?.status || 'UNKNOWN';
  },
};

export default { paymentGateway, PaymentMethod, PaymentGateway, Currency };
