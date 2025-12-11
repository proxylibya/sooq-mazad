/**
 * ═══════════════════════════════════════════════════════════════
 * 🔧 MODULE SHIMS
 * تعريفات للـ modules المفقودة
 * ═══════════════════════════════════════════════════════════════
 */

// === Relative path modules ===
declare module '../contexts/AdminContext' {
    export interface AdminUser {
        id: string;
        name: string;
        email: string;
        role: string;
        permissions: string[];
    }
    export interface AdminContextType {
        admin: AdminUser | null;
        isLoading: boolean;
        isAuthenticated: boolean;
    }
    export function useAdmin(): AdminContextType;
    export function AdminProvider(props: { children: React.ReactNode; }): JSX.Element;
}

declare module '../lib/error-handling/client-error-handler' {
    export interface ClientError {
        message: string;
        code?: string;
        timestamp: Date;
    }
    export function handleClientError(error: unknown): void;
    export function captureError(error: ClientError): void;
    export const clientErrorHandler: {
        captureError: (error: ClientError) => void;
        getErrors: () => ClientError[];
        clearErrors: () => void;
    };
    export default clientErrorHandler;
}

declare module '../../lib/error-handling/client-error-handler' {
    export * from '../lib/error-handling/client-error-handler';
}

declare module '../../../lib/error-handling/client-error-handler' {
    export * from '../lib/error-handling/client-error-handler';
}

declare module '../../lib/core/logging/UnifiedLogger' {
    export const logger: {
        debug: (message: string, context?: Record<string, unknown>) => void;
        info: (message: string, context?: Record<string, unknown>) => void;
        warn: (message: string, context?: Record<string, unknown>) => void;
        error: (message: string, context?: Record<string, unknown>) => void;
    };
    export default logger;
}

declare module '../contexts/SimpleLocalizationContext' {
    export interface LocalizationContextType {
        locale: string;
        direction: 'rtl' | 'ltr';
        t: (key: string) => string;
    }
    export function useSimpleLocalization(): LocalizationContextType;
    export function usePriceFormatter(): (amount: number) => string;
    export function SimpleLocalizationProvider(props: { children: React.ReactNode; }): JSX.Element;
}

// === Wallet feature modules ===
declare module '../features/wallet/utils/numberUtils' {
    export function formatCurrency(amount: number, currency?: string): string;
    export function formatNumber(num: number): string;
    export function parseNumber(value: string): number;
}

declare module '../features/wallet/contexts/SimpleLocalizationContext' {
    export * from '../contexts/SimpleLocalizationContext';
}

// === Component modules ===
declare module '../components/common/layout/OpensooqNavbar' {
    const OpensooqNavbar: React.FC<Record<string, unknown>>;
    export default OpensooqNavbar;
}

declare module './common/layout/OpensooqNavbar' {
    const OpensooqNavbar: React.FC<Record<string, unknown>>;
    export default OpensooqNavbar;
}

// === Utility modules ===
declare module '../utils/rateLimiter' {
    export interface RateLimiterOptions {
        windowMs?: number;
        max?: number;
    }
    export function createRateLimiter(options?: RateLimiterOptions): {
        check: (key: string) => Promise<boolean>;
        reset: (key: string) => void;
    };
    export function rateLimit(key: string): Promise<boolean>;
    export default { createRateLimiter, rateLimit };
}

// === Socket modules ===
declare module '../lib/socket/types' {
    export interface SocketUser {
        id: string;
        name?: string;
        socketId?: string;
    }
    export interface BidData {
        auctionId: string;
        amount: number;
        bidderId: string;
        timestamp: Date;
    }
    export interface AuctionState {
        id: string;
        status: string;
        currentPrice: number;
        participants: SocketUser[];
    }
}

declare module '@/lib/socket/types' {
    export * from '../lib/socket/types';
}

// === Fix common component paths ===
declare module './common/icons/Flag' {
    const Flag: React.FC<{ code: string; className?: string; }>;
    export default Flag;
}

// === Heroicons missing exports ===
declare module '@heroicons/react/24/outline' {
    export const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>>;
    export const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>>;
}

declare module '@heroicons/react/24/solid' {
    export const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>>;
    export const PaintBrushIcon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export { };

