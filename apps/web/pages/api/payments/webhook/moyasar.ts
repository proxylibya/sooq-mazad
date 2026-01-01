import { NextApiRequest, NextApiResponse } from 'next';
import { paymentService } from '../../../../lib/payments/paymentManager';
import { PaymentGateway } from '../../../../lib/payments/paymentGateways';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // الحصول على التوقيع من الهيدر
    const signature = req.headers['x-moyasar-signature'] as string;

    // معالجة webhook
    const result = await paymentService.handleWebhook(PaymentGateway.MOYASAR, req.body, signature);

    if (result.success) {
      res.status(200).json({ received: true });
    } else {
      console.error('فشل في معالجة webhook ميسار:', result.error);
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('خطأ في webhook ميسار:', error);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
}
