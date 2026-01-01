/**
 * API: تبديل العملات بين المحافظ
 * Wallet Swap API
 *
 * @description نقطة نهاية آمنة لتبديل العملات بين المحافظ المختلفة
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../../../lib/auth';
import { walletCache } from '../../../lib/wallet/wallet-cache';
import { SECURITY_CONFIG, WALLET_ERROR_MESSAGES } from '../../../lib/wallet/wallet-constants';
import { walletService } from '../../../lib/wallet/wallet-service';
import type { WalletTypeLower } from '../../../lib/wallet/wallet-types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'الطريقة غير مسموحة' });
    }

    try {
        // التحقق من المصادقة
        const token = req.cookies['auth-token'] || req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, message: WALLET_ERROR_MESSAGES.AUTH_REQUIRED });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ success: false, message: WALLET_ERROR_MESSAGES.INVALID_TOKEN });
        }

        // التحقق من Rate Limiting
        const rateLimitConfig = SECURITY_CONFIG.RATE_LIMIT.SWAP;
        const rateLimit = await walletCache.checkRateLimit(
            decoded.userId,
            'swap',
            rateLimitConfig.max,
            rateLimitConfig.windowMs / 1000
        );

        if (!rateLimit.allowed) {
            return res.status(429).json({
                success: false,
                message: WALLET_ERROR_MESSAGES.RATE_LIMIT_EXCEEDED,
                retryAfter: rateLimit.resetIn,
            });
        }

        const { fromWallet, toWallet, amount } = req.body;

        // التحقق من البيانات الأساسية
        if (!fromWallet || !toWallet || !amount) {
            return res.status(400).json({ success: false, message: 'بيانات ناقصة' });
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({ success: false, message: WALLET_ERROR_MESSAGES.INVALID_AMOUNT });
        }

        // تنفيذ التبديل باستخدام الخدمة الموحدة
        const result = await walletService.swap({
            userId: decoded.userId,
            fromWallet: fromWallet as WalletTypeLower,
            toWallet: toWallet as WalletTypeLower,
            amount: amountNum,
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'فشل في إتمام التبديل',
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                transactionId: result.transactionId,
                fromAmount: result.fromAmount,
                fromCurrency: result.fromCurrency,
                toAmount: result.toAmount,
                toCurrency: result.toCurrency,
                rate: result.rate,
                fee: result.fee,
            },
        });
    } catch (error: unknown) {
        console.error('Error swapping currencies:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'حدث خطأ أثناء التبديل',
        });
    }
}
