// @ts-nocheck
/**
 * Enterprise Core Web Vitals Monitoring
 * مراقبة مقاييس الويب الأساسية
 */

// ============================================
// Types
// ============================================

export interface WebVitalsMetric {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
}

export interface PerformanceReport {
    timestamp: number;
    url: string;
    metrics: {
        fcp: number | null;
        lcp: number | null;
        fid: number | null;
        cls: number | null;
        ttfb: number | null;
        inp: number | null;
    };
    score: number;
    rating: 'good' | 'needs-improvement' | 'poor';
}

// ============================================
// Thresholds (based on Google's recommendations)
// ============================================

export const thresholds = {
    fcp: { good: 1800, poor: 3000 },
    lcp: { good: 2500, poor: 4000 },
    fid: { good: 100, poor: 300 },
    cls: { good: 0.1, poor: 0.25 },
    ttfb: { good: 800, poor: 1800 },
    inp: { good: 200, poor: 500 },
};

// ============================================
// Rating Calculator
// ============================================

export function getRating(
    metric: keyof typeof thresholds,
    value: number
): 'good' | 'needs-improvement' | 'poor' {
    const threshold = thresholds[metric];
    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
}

// ============================================
// Performance Score Calculator
// ============================================

export function calculateScore(metrics: PerformanceReport['metrics']): number {
    let totalScore = 0;
    let count = 0;

    const weights = {
        fcp: 0.15,
        lcp: 0.25,
        fid: 0.20,
        cls: 0.15,
        ttfb: 0.10,
        inp: 0.15,
    };

    Object.entries(metrics).forEach(([key, value]) => {
        if (value !== null) {
            const metric = key as keyof typeof thresholds;
            const threshold = thresholds[metric];
            const weight = weights[metric] || 0;

            // Normalize to 0-100 scale
            let score = 100;
            if (value > threshold.good) {
                score = value > threshold.poor
                    ? 0
                    : 100 - ((value - threshold.good) / (threshold.poor - threshold.good)) * 100;
            }

            totalScore += score * weight;
            count += weight;
        }
    });

    return count > 0 ? Math.round(totalScore / count) : 0;
}

// ============================================
// Web Vitals Collector
// ============================================

class WebVitalsCollector {
    private metrics: Map<string, number> = new Map();
    private observers: Array<(report: PerformanceReport) => void> = [];

    constructor() {
        if (typeof window !== 'undefined') {
            this.initializeObservers();
        }
    }

    private initializeObservers(): void {
        // First Contentful Paint
        this.observePaint('first-contentful-paint', 'fcp');

        // Largest Contentful Paint
        this.observeLCP();

        // First Input Delay
        this.observeFID();

        // Cumulative Layout Shift
        this.observeCLS();

        // Time to First Byte
        this.measureTTFB();
    }

    private observePaint(entryType: string, metricName: string): void {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const entry = entries[entries.length - 1];
                if (entry) {
                    this.metrics.set(metricName, entry.startTime);
                    this.notifyObservers();
                }
            });
            observer.observe({ entryTypes: ['paint'] });
        } catch (e) {
            console.warn(`[WebVitals] Unable to observe ${entryType}`);
        }
    }

    private observeLCP(): void {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const entry = entries[entries.length - 1] as PerformanceEntry & { startTime: number; };
                if (entry) {
                    this.metrics.set('lcp', entry.startTime);
                    this.notifyObservers();
                }
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (e) {
            console.warn('[WebVitals] Unable to observe LCP');
        }
    }

    private observeFID(): void {
        try {
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const entry = entries[0] as PerformanceEntry & { processingStart: number; startTime: number; };
                if (entry) {
                    this.metrics.set('fid', entry.processingStart - entry.startTime);
                    this.notifyObservers();
                }
            });
            observer.observe({ entryTypes: ['first-input'] });
        } catch (e) {
            console.warn('[WebVitals] Unable to observe FID');
        }
    }

    private observeCLS(): void {
        let clsValue = 0;
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries() as Array<PerformanceEntry & { hadRecentInput: boolean; value: number; }>) {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                        this.metrics.set('cls', clsValue);
                        this.notifyObservers();
                    }
                }
            });
            observer.observe({ entryTypes: ['layout-shift'] });
        } catch (e) {
            console.warn('[WebVitals] Unable to observe CLS');
        }
    }

    private measureTTFB(): void {
        try {
            const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            if (navEntry) {
                this.metrics.set('ttfb', navEntry.responseStart);
            }
        } catch (e) {
            console.warn('[WebVitals] Unable to measure TTFB');
        }
    }

    private notifyObservers(): void {
        const report = this.getReport();
        this.observers.forEach(callback => callback(report));
    }

    public getReport(): PerformanceReport {
        const metrics = {
            fcp: this.metrics.get('fcp') || null,
            lcp: this.metrics.get('lcp') || null,
            fid: this.metrics.get('fid') || null,
            cls: this.metrics.get('cls') || null,
            ttfb: this.metrics.get('ttfb') || null,
            inp: this.metrics.get('inp') || null,
        };

        const score = calculateScore(metrics);
        const rating: 'good' | 'needs-improvement' | 'poor' =
            score >= 90 ? 'good' : score >= 50 ? 'needs-improvement' : 'poor';

        return {
            timestamp: Date.now(),
            url: typeof window !== 'undefined' ? window.location.href : '',
            metrics,
            score,
            rating,
        };
    }

    public subscribe(callback: (report: PerformanceReport) => void): () => void {
        this.observers.push(callback);
        return () => {
            this.observers = this.observers.filter(cb => cb !== callback);
        };
    }

    public getMetric(name: string): number | null {
        return this.metrics.get(name) || null;
    }
}

// ============================================
// Singleton Instance
// ============================================

let collector: WebVitalsCollector | null = null;

export function getWebVitalsCollector(): WebVitalsCollector {
    if (!collector) {
        collector = new WebVitalsCollector();
    }
    return collector;
}

// ============================================
// Reporting Utilities
// ============================================

export async function sendToAnalytics(report: PerformanceReport): Promise<void> {
    try {
        // Send to analytics endpoint
        if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
            navigator.sendBeacon('/api/analytics/web-vitals', JSON.stringify(report));
        } else {
            await fetch('/api/analytics/web-vitals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(report),
                keepalive: true,
            });
        }
    } catch (error) {
        console.error('[WebVitals] Failed to send report:', error);
    }
}

// ============================================
// React Hook
// ============================================

export function useWebVitals(): PerformanceReport | null {
    if (typeof window === 'undefined') return null;

    const [report, setReport] = React.useState<PerformanceReport | null>(null);

    React.useEffect(() => {
        const collector = getWebVitalsCollector();
        const unsubscribe = collector.subscribe(setReport);
        setReport(collector.getReport());
        return unsubscribe;
    }, []);

    return report;
}

// Import React for the hook
import React from 'react';

// ============================================
// Export
// ============================================

export default {
    getWebVitalsCollector,
    calculateScore,
    getRating,
    sendToAnalytics,
    thresholds,
};
