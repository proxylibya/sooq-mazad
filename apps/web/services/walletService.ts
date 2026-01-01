/**
 * Wallet Service
 * خدمة المحفظة
 */

import { prisma } from '@/lib/prisma';

export interface WalletBalance {
    total: number;
    available: number;
    frozen: number;
    currency: string;
}

export const walletService = {
    async getWalletByUserId(userId: string) {
        return prisma.wallet.findFirst({
            where: { userId }
        });
    },

    async getBalance(walletId: string): Promise<WalletBalance> {
        const wallet = await prisma.wallet.findUnique({
            where: { id: walletId }
        });

        if (!wallet) {
            throw new Error('المحفظة غير موجودة');
        }

        return {
            total: wallet.balance || 0,
            available: wallet.balance || 0,
            frozen: 0,
            currency: wallet.currency || 'LYD'
        };
    },

    async freezeFunds(walletId: string, amount: number, reference: string, expiresAt: Date) {
        // Placeholder
        return {
            id: `FREEZE_${Date.now()}`,
            walletId,
            amount,
            reference,
            expiresAt
        };
    },

    async releaseFunds(frozenFundsId: string) {
        return { success: true };
    },

    async deductFunds(walletId: string, amount: number, description: string) {
        // Placeholder
        return { success: true };
    }
};

export default walletService;
