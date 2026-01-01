// Payment Manager - Minimal service for API pages
import logger from '../logger';
import { PaymentGateway, PaymentResult, PaymentData } from './paymentGateways';

type Tx = {
  id: string;
  gatewayId?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: number;
};

const txStore = new Map<string, Tx>();

function createTx(): string {
  return `TX_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const paymentService = {
  async processPayment(data: PaymentData): Promise<PaymentResult> {
    try {
      const transactionId = createTx();
      txStore.set(transactionId, {
        id: transactionId,
        status: 'PENDING',
        createdAt: Date.now(),
      });

      const paymentUrl =
        data.gateway === PaymentGateway.CRYPTO
          ? `/payments/crypto/${transactionId}`
          : `/payments/${data.gateway.toLowerCase()}/${transactionId}`;

      return {
        success: true,
        transactionId,
        paymentUrl,
        gatewayTransactionId: undefined,
        status: 'PENDING',
        message: 'تم تهيئة معاملة الدفع',
      };
    } catch (error) {
      logger.error('processPayment error', { error });
      return {
        success: false,
        error: 'PAYMENT_INIT_FAILED',
        status: 'FAILED',
      };
    }
  },

  async verifyPayment(transactionId: string): Promise<PaymentResult> {
    const tx = txStore.get(transactionId);
    if (!tx) {
      return { success: false, error: 'TRANSACTION_NOT_FOUND', status: 'FAILED' };
    }
    // بعد فترة قصيرة نفترض اكتمال الدفع (محاكاة)
    if (Date.now() - tx.createdAt > 1500) {
      tx.status = 'COMPLETED';
      txStore.set(transactionId, tx);
    }
    return {
      success: tx.status === 'COMPLETED',
      transactionId,
      status: tx.status,
      message: tx.status === 'COMPLETED' ? 'تم تأكيد الدفع' : 'بانتظار التأكيد',
    };
  },

  async handleWebhook(
    gateway: PaymentGateway,
    body: any,
    signature?: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      logger.info('Webhook received', { gateway, signature });
      // تحقق التوقيع - محاكاة
      const ok = typeof signature === 'string' ? true : true;
      if (!ok) return { success: false, error: 'INVALID_SIGNATURE' };

      const transactionId = body?.transactionId as string | undefined;
      if (transactionId && txStore.has(transactionId)) {
        const tx = txStore.get(transactionId)!;
        tx.status = 'COMPLETED';
        tx.gatewayId = body?.id || body?.reference || undefined;
        txStore.set(transactionId, tx);
      }
      return { success: true };
    } catch (error) {
      logger.error('Webhook error', { error });
      return { success: false, error: 'WEBHOOK_ERROR' };
    }
  },
};

export default { paymentService };
