import { NextApiRequest, NextApiResponse } from 'next';
import { paymentGateway } from '../../../lib/payments/paymentGateway';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // إعداد رؤوس CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await handleGetConfig(req, res);
      default:
        return res.status(405).json({
          success: false,
          message: 'الطريقة غير مدعومة',
        });
    }
  } catch (error) {
    console.error('خطأ في API إعدادات الدفع:', error);
    return res.status(500).json({
      success: false,
      message: 'خطأ داخلي في الخادم',
    });
  }
}

// الحصول على إعدادات الدفع - ليبيا فقط
async function handleGetConfig(req: NextApiRequest, res: NextApiResponse) {
  // إعدادات الدفع الثابتة لليبيا
  const config = paymentGateway.getCountryPaymentConfig('LY');

  if (!config) {
    return res.status(500).json({
      success: false,
      message: 'خطأ في إعدادات الدفع',
    });
  }

  const availableMethods = paymentGateway.getAvailablePaymentMethods('LY');
  const availableGateways = paymentGateway.getAvailableGateways('LY');
  const exchangeRates = Object.fromEntries(paymentGateway.getExchangeRates());

  return res.status(200).json({
    success: true,
    data: {
      country: 'ليبيا',
      countryCode: 'LY',
      currency: 'LYD',
      availableMethods,
      availableGateways,
      localBanks: config.localBanks,
      regulations: config.regulations,
      features: config.features,
      exchangeRates,
    },
  });
}
