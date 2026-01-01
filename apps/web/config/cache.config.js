// config/cache.config.js
// Cache Configuration

const getCacheService = () => {
    const useKeyDB = process.env.KEYDB_ENABLED === 'true';
    
    if (useKeyDB) {
        try {
            const Redis = require('ioredis');
            const redis = new Redis({
                host: 'localhost',
                port: 6379,
                maxRetriesPerRequest: 3,
                retryStrategy: (times) => {
                    if (times > 3) {
                        console.log('[Cache] Falling back to memory cache');
                        return null;
                    }
                    return Math.min(times * 50, 2000);
                }
            });
            
            redis.on('connect', () => {
                console.log('[Cache] Connected to KeyDB/Redis');
            });
            
            redis.on('error', (err) => {
                console.log('[Cache] KeyDB error, using memory cache:', err.message);
            });
            
            return redis;
        } catch (error) {
            console.log('[Cache] KeyDB not available, using memory cache');
        }
    }
    
    // Fallback to memory cache
    const { redis } = require('../packages/cache');
    return redis;
};

module.exports = getCacheService();
