/**
 * 🚀 Performance Monitoring System - نظام مراقبة الأداء
 */

interface PerformanceMetrics {
    pageLoad: number;
    ttfb: number; // Time to First Byte
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    fid: number; // First Input Delay
    cls: number; // Cumulative Layout Shift
    tti: number; // Time to Interactive
}

interface ResourceTiming {
    name: string;
    duration: number;
    size: number;
    type: string;
}

export class PerformanceMonitor {
    private metrics: Partial<PerformanceMetrics> = {};
    private resources: ResourceTiming[] = [];
    private observers: Map<string, PerformanceObserver> = new Map();
    
    constructor() {
        if (typeof window !== 'undefined') {
            this.initialize();
        }
    }

    private initialize() {
        // Observe navigation timing
        this.observeNavigation();
        
        // Observe paint timing
        this.observePaint();
        
        // Observe layout shifts
        this.observeLayoutShift();
        
        // Observe first input delay
        this.observeFirstInputDelay();
        
        // Observe resources
        this.observeResources();
        
        // Listen to page visibility changes
        this.observeVisibilityChange();
    }

    private observeNavigation() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            
            if (navigationTiming) {
                this.metrics.ttfb = navigationTiming.responseStart - navigationTiming.requestStart;
                this.metrics.pageLoad = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
            }
        }
    }

    private observePaint() {
        if ('PerformanceObserver' in window) {
            try {
                const paintObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.name === 'first-contentful-paint') {
                            this.metrics.fcp = entry.startTime;
                        }
                        if (entry.name === 'largest-contentful-paint') {
                            this.metrics.lcp = entry.startTime;
                        }
                    }
                });
                
                paintObserver.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });
                this.observers.set('paint', paintObserver);
            } catch (e) {
                console.warn('Paint observer not supported');
            }
        }
    }

    private observeLayoutShift() {
        if ('PerformanceObserver' in window) {
            try {
                let clsValue = 0;
                let clsEntries: PerformanceEntry[] = [];
                
                const layoutShiftObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (!(entry as any).hadRecentInput) {
                            clsValue += (entry as any).value;
                            clsEntries.push(entry);
                        }
                    }
                    this.metrics.cls = clsValue;
                });
                
                layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.set('layout-shift', layoutShiftObserver);
            } catch (e) {
                console.warn('Layout shift observer not supported');
            }
        }
    }

    private observeFirstInputDelay() {
        if ('PerformanceObserver' in window) {
            try {
                const fidObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        this.metrics.fid = (entry as any).processingStart - entry.startTime;
                    }
                });
                
                fidObserver.observe({ entryTypes: ['first-input'] });
                this.observers.set('first-input', fidObserver);
            } catch (e) {
                console.warn('First input delay observer not supported');
            }
        }
    }

    private observeResources() {
        if ('performance' in window && 'getEntriesByType' in performance) {
            const resourceTimings = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
            
            this.resources = resourceTimings.map(resource => ({
                name: resource.name,
                duration: resource.duration,
                size: resource.transferSize || 0,
                type: this.getResourceType(resource.name)
            }));
        }
    }

    private observeVisibilityChange() {
        if ('document' in window) {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'hidden') {
                    this.sendMetrics();
                }
            });
        }
    }

    private getResourceType(url: string): string {
        const extension = url.split('.').pop()?.toLowerCase();
        
        const typeMap: Record<string, string> = {
            js: 'script',
            css: 'style',
            jpg: 'image',
            jpeg: 'image',
            png: 'image',
            gif: 'image',
            svg: 'image',
            webp: 'image',
            woff: 'font',
            woff2: 'font',
            ttf: 'font',
            otf: 'font',
        };
        
        return typeMap[extension || ''] || 'other';
    }

    /**
     * Get current metrics
     */
    public getMetrics(): PerformanceMetrics {
        // Calculate Time to Interactive
        if (this.metrics.fcp && !this.metrics.tti) {
            this.metrics.tti = this.metrics.fcp + (this.metrics.fid || 0);
        }
        
        return this.metrics as PerformanceMetrics;
    }

    /**
     * Get resource breakdown
     */
    public getResourceBreakdown() {
        const breakdown: Record<string, { count: number; size: number; duration: number }> = {};
        
        for (const resource of this.resources) {
            if (!breakdown[resource.type]) {
                breakdown[resource.type] = { count: 0, size: 0, duration: 0 };
            }
            
            breakdown[resource.type].count++;
            breakdown[resource.type].size += resource.size;
            breakdown[resource.type].duration += resource.duration;
        }
        
        return breakdown;
    }

    /**
     * Get performance score
     */
    public getPerformanceScore(): number {
        const weights = {
            ttfb: 0.1,
            fcp: 0.15,
            lcp: 0.25,
            fid: 0.25,
            cls: 0.15,
            tti: 0.1,
        };
        
        const thresholds = {
            ttfb: { good: 800, poor: 1800 },
            fcp: { good: 1800, poor: 3000 },
            lcp: { good: 2500, poor: 4000 },
            fid: { good: 100, poor: 300 },
            cls: { good: 0.1, poor: 0.25 },
            tti: { good: 3800, poor: 7300 },
        };
        
        let score = 0;
        let totalWeight = 0;
        
        for (const [metric, weight] of Object.entries(weights)) {
            const value = this.metrics[metric as keyof PerformanceMetrics];
            
            if (value !== undefined) {
                const threshold = thresholds[metric as keyof typeof thresholds];
                let metricScore = 0;
                
                if (metric === 'cls') {
                    // CLS is scored differently (lower is better)
                    if (value <= threshold.good) {
                        metricScore = 100;
                    } else if (value >= threshold.poor) {
                        metricScore = 0;
                    } else {
                        metricScore = 100 * (1 - (value - threshold.good) / (threshold.poor - threshold.good));
                    }
                } else {
                    // Other metrics (lower is better)
                    if (value <= threshold.good) {
                        metricScore = 100;
                    } else if (value >= threshold.poor) {
                        metricScore = 0;
                    } else {
                        metricScore = 100 * (1 - (value - threshold.good) / (threshold.poor - threshold.good));
                    }
                }
                
                score += metricScore * weight;
                totalWeight += weight;
            }
        }
        
        return totalWeight > 0 ? Math.round(score / totalWeight) : 0;
    }

    /**
     * Send metrics to analytics
     */
    private sendMetrics() {
        const metrics = this.getMetrics();
        const score = this.getPerformanceScore();
        
        // Send to analytics service
        if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as any).gtag('event', 'performance', {
                event_category: 'Web Vitals',
                event_label: 'Page Load',
                value: score,
                ttfb: metrics.ttfb,
                fcp: metrics.fcp,
                lcp: metrics.lcp,
                fid: metrics.fid,
                cls: metrics.cls,
                tti: metrics.tti,
            });
        }
        
        // Send to custom endpoint
        if (process.env.NEXT_PUBLIC_ANALYTICS_URL) {
            fetch(`${process.env.NEXT_PUBLIC_ANALYTICS_URL}/performance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    metrics,
                    score,
                    url: window.location.href,
                    timestamp: Date.now(),
                    userAgent: navigator.userAgent,
                }),
            }).catch(() => {
                // Silently fail
            });
        }
    }

    /**
     * Log performance to console (for development)
     */
    public logPerformance() {
        const metrics = this.getMetrics();
        const score = this.getPerformanceScore();
        const breakdown = this.getResourceBreakdown();
        
        console.group('📊 Performance Metrics');
        console.log(`Score: ${score}/100`);
        console.table(metrics);
        console.log('Resource Breakdown:');
        console.table(breakdown);
        console.groupEnd();
    }

    /**
     * Clean up observers
     */
    public destroy() {
        for (const observer of this.observers.values()) {
            observer.disconnect();
        }
        this.observers.clear();
    }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize on page load
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (process.env.NODE_ENV === 'development') {
                performanceMonitor.logPerformance();
            }
        }, 2000);
    });
}

export default performanceMonitor;
