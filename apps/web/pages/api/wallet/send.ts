/**
 * API: تحويل الأموال بين المستخدمين
 * Wallet Transfer API
 *
 * @description نقطة نهاية آمنة لتحويل الأموال بين المحافظ
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
        const rateLimitConfig = SECURITY_CONFIG.RATE_LIMIT.TRANSFER;
        const rateLimit = await walletCache.checkRateLimit(
            decoded.userId,
            'transfer',
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

        const { recipient, amount, walletType, note } = req.body;

        // التحقق من البيانات الأساسية
        if (!recipient || !amount || !walletType) {
            return res.status(400).json({ success: false, message: 'بيانات ناقصة' });
        }

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
            return res.status(400).json({ success: false, message: WALLET_ERROR_MESSAGES.INVALID_AMOUNT });
        }

        // تنفيذ التحويل باستخدام الخدمة الموحدة
        const result = await walletService.transfer({
            senderId: decoded.userId,
            recipientIdentifier: recipient,
            amount: amountNum,
            walletType: walletType as WalletTypeLower,
            note,
        });

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error || 'فشل في إتمام التحويل',
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                transactionId: result.transactionId,
                amount: result.amount,
                currency: result.currency,
                recipient: result.recipient?.name || result.recipient?.phone,
                fee: result.fee,
            },
        });
    } catch (error: unknown) {
        console.error('Error sending funds:', error);
        return res.status(500).json({
            success: false,
            message: error instanceof Error ? error.message : 'حدث خطأ أثناء الإرسال',
        });
    }
}
