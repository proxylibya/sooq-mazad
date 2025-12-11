/**
 * خدمة أسعار الصرف الديناميكية
 * Dynamic Exchange Rate Service
 *
 * @description خدمة للحصول على أسعار صرف محدثة من مصادر خارجية
 */

import { walletCache } from './wallet-cache';
import { EXCHANGE_RATE_API } from './wallet-constants';
import type { Currency, ExchangeRate } from './wallet-types';

// ============================================
// Types
// ============================================

interface RateCache {
    rates: Record<string, number>;
    lastUpdated: Date;
}

// ============================================
// Exchange Rate Service
// ============================================

class ExchangeRateService {
    private static instance: ExchangeRateService;
    private ratesCache: RateCache | null = null;
    private updatePromise: Promise<void> | null = null;

    private constructor() { }

    static getInstance(): ExchangeRateService {
        if (!ExchangeRateService.instance) {
            ExchangeRateService.instance = new ExchangeRateService();
        }
        return ExchangeRateService.instance;
    }

    /**
     * الحصول على سعر الصرف بين عملتين
     */
    async getRate(from: Currency, to: Currency): Promise<number> {
        if (from === to) return 1;

        // Normalize currency codes
        const normalizedFrom = this.normalizeCurrency(from);
        const normalizedTo = this.normalizeCurrency(to);

        // Try to get from cache first
        const rates = await this.getRates();
        const rateKey = `${normalizedFrom}_${normalizedTo}`;

        if (rates[rateKey]) {
            return rates[rateKey];
        }

        // Try inverse rate
        const inverseKey = `${normalizedTo}_${normalizedFrom}`;
        if (rates[inverseKey]) {
            return 1 / rates[inverseKey];
        }

        // Fall back to default rates
        return this.getFallbackRate(from, to);
    }

    /**
     * الحصول على جميع أسعار الصرف
     */
    async getRates(): Promise<Record<string, number>> {
        // Check if we need to update
        if (this.shouldUpdate()) {
            await this.updateRates();
        }

        return this.ratesCache?.rates || this.getDefaultRates();
    }

    /**
     * تحويل مبلغ من عملة إلى أخرى
     */
    async convert(
        amount: number,
        from: Currency,
        to: Currency
    ): Promise<{ amount: number; rate: number; }> {
        const rate = await this.getRate(from, to);
        return {
            amount: amount * rate,
            rate,
        };
    }

    /**
     * الحصول على معلومات سعر الصرف
     */
    async getExchangeRateInfo(
        from: Currency,
        to: Currency
    ): Promise<ExchangeRate> {
        const rate = await this.getRate(from, to);
        return {
            from,
            to,
            rate,
            inverseRate: 1 / rate,
            timestamp: this.ratesCache?.lastUpdated || new Date(),
            source: 'sooq-mazad',
        };
    }

    // ============================================
    // Private Methods
    // ============================================

    /**
     * تحديث أسعار الصرف من المصادر الخارجية
     */
    private async updateRates(): Promise<void> {
        // Prevent multiple simultaneous updates
        if (this.updatePromise) {
            return this.updatePromise;
        }

        this.updatePromise = this.fetchAndUpdateRates();

        try {
            await this.updatePromise;
        } finally {
            this.updatePromise = null;
        }
    }

    /**
     * جلب أسعار الصرف من API خارجي
     */
    private async fetchAndUpdateRates(): Promise<void> {
        try {
            // Try to get USDT rate from CoinGecko
            const usdtRate = await this.fetchUSDTRate();

            // Get LYD rate (Libya uses fixed unofficial rates)
            // These should be updated based on local market rates
            const lydRate = await this.fetchLYDRate();

            const rates: Record<string, number> = {
                // USD base rates
                USD_USDT: usdtRate,
                USDT_USD: 1 / usdtRate,
                USD_LYD: lydRate,
                LYD_USD: 1 / lydRate,

                // USDT to LYD
                USDT_LYD: lydRate * usdtRate,
                LYD_USDT: 1 / (lydRate * usdtRate),

                // Add aliases for USDT-TRC20
                'USD_USDT-TRC20': usdtRate,
                'USDT-TRC20_USD': 1 / usdtRate,
                'USDT-TRC20_LYD': lydRate * usdtRate,
                'LYD_USDT-TRC20': 1 / (lydRate * usdtRate),
            };

            // Update cache
            this.ratesCache = {
                rates,
                lastUpdated: new Date(),
            };

            // Also save to KeyDB cache
            await walletCache.setExchangeRates(rates);
        } catch (error) {
            console.error('Failed to update exchange rates:', error);
            // Use default rates on error
            this.ratesCache = {
                rates: this.getDefaultRates(),
                lastUpdated: new Date(),
            };
        }
    }

    /**
     * جلب سعر USDT من CoinGecko
     */
    private async fetchUSDTRate(): Promise<number> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(
                `${EXCHANGE_RATE_API.COINGECKO_URL}/simple/price?ids=tether&vs_currencies=usd`,
                {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                }
            );

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`CoinGecko API error: ${response.status}`);
            }

            const data = await response.json();
            return data.tether?.usd || 1.0;
        } catch (error) {
            console.warn('Failed to fetch USDT rate, using default:', error);
            return 1.0; // USDT is pegged to USD
        }
    }

    /**
     * جلب سعر الدينار الليبي
     * ملاحظة: ليبيا ليس لديها سوق صرف رسمي، لذا نستخدم سعر السوق الموازي
     */
    private async fetchLYDRate(): Promise<number> {
        // In production, this should be fetched from a reliable local source
        // For now, we use a reasonable market rate
        // 1 USD = ~5 LYD (parallel market rate)
        return EXCHANGE_RATE_API.FALLBACK_RATES.USD_LYD;
    }

    /**
     * التحقق من الحاجة لتحديث الأسعار
     */
    private shouldUpdate(): boolean {
        if (!this.ratesCache) return true;

        const now = Date.now();
        const lastUpdate = this.ratesCache.lastUpdated.getTime();
        return now - lastUpdate > EXCHANGE_RATE_API.CACHE_TTL;
    }

    /**
     * تطبيع رمز العملة
     */
    private normalizeCurrency(currency: Currency): string {
        // Normalize USDT-TRC20 to USDT for rate lookup
        if (currency === 'USDT-TRC20') return 'USDT';
        return currency;
    }

    /**
     * الحصول على السعر الاحتياطي
     */
    private getFallbackRate(from: Currency, to: Currency): number {
        const key = `${this.normalizeCurrency(from)}_${this.normalizeCurrency(to)}`;
        const fallbackRates = EXCHANGE_RATE_API.FALLBACK_RATES as Record<string, number>;
        return fallbackRates[key] || 1;
    }

    /**
     * الحصول على الأسعار الافتراضية
     */
    private getDefaultRates(): Record<string, number> {
        return {
            USD_USDT: 1.0,
            USDT_USD: 1.0,
            USD_LYD: 5.0,
            LYD_USD: 0.2,
            USDT_LYD: 5.0,
            LYD_USDT: 0.2,
            'USD_USDT-TRC20': 1.0,
            'USDT-TRC20_USD': 1.0,
            'USDT-TRC20_LYD': 5.0,
            'LYD_USDT-TRC20': 0.2,
        };
    }
}

// Export singleton instance
export const exchangeRateService = ExchangeRateService.getInstance();

// Export convenience functions
export async function getExchangeRate(
    from: Currency,
    to: Currency
): Promise<number> {
    return exchangeRateService.getRate(from, to);
}

export async function convertAmount(
    amount: number,
    from: Currency,
    to: Currency
): Promise<{ amount: number; rate: number; }> {
    return exchangeRateService.convert(amount, from, to);
}

export async function getAllRates(): Promise<Record<string, number>> {
    return exchangeRateService.getRates();
}
