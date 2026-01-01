/**
 * Performance Middleware
 */

import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

export function withPerformance(handler: NextApiHandler) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const start = Date.now();

        try {
            await handler(req, res);
        } finally {
            const duration = Date.now() - start;
            console.log(`[Performance] ${req.method} ${req.url} - ${duration}ms`);
        }
    };
}

export function withCache(ttl: number = 60) {
    return (handler: NextApiHandler) => {
        return async (req: NextApiRequest, res: any) => {
            res.setHeader('Cache-Control', `s-maxage=${ttl}, stale-while-revalidate`);
            return handler(req, res);
        };
    };
}

// Combined optimizations middleware
export function withOptimizations(options: { cache?: number; compress?: boolean; } = {}) {
    return (handler: NextApiHandler) => {
        return async (req: NextApiRequest, res: any) => {
            const start = Date.now();

            // Set cache headers if specified
            if (options.cache) {
                res.setHeader('Cache-Control', `s-maxage=${options.cache}, stale-while-revalidate`);
            }

            try {
                await handler(req, res);
            } finally {
                const duration = Date.now() - start;
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Optimized] ${req.method} ${req.url} - ${duration}ms`);
                }
            }
        };
    };
}

export default { withPerformance, withCache, withOptimizations };
