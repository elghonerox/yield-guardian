/**
 * In-memory cache implementation using node-cache
 * Provides TTL-based caching for protocol data without external dependencies
 */
import NodeCache from 'node-cache';

export interface CacheOptions {
    stdTTL: number; // Default TTL in seconds
    checkperiod: number; // Cleanup check interval in seconds
    useClones: boolean; // Clone data on get/set
}

export class MemoryCache {
    private cache: NodeCache;
    private hits: number = 0;
    private misses: number = 0;

    constructor(options?: Partial<CacheOptions>) {
        const defaultOptions: CacheOptions = {
            stdTTL: 300, // 5 minutes default
            checkperiod: 60, // Check every minute
            useClones: true, // Clone to prevent mutations
        };

        this.cache = new NodeCache({ ...defaultOptions, ...options });

        // Log cache stats periodically
        setInterval(() => this.logStats(), 60000); // Every minute
    }

    /**
     * Get value from cache
     */
    get<T>(key: string): T | undefined {
        const value = this.cache.get<T>(key);

        if (value !== undefined) {
            this.hits++;
            return value;
        }

        this.misses++;
        return undefined;
    }

    /**
     * Set value in cache with optional custom TTL
     */
    set<T>(key: string, value: T, ttl?: number): boolean {
        if (ttl) {
            return this.cache.set(key, value, ttl);
        }
        return this.cache.set(key, value);
    }

    /**
     * Delete key from cache
     */
    delete(key: string): number {
        return this.cache.del(key);
    }

    /**
     * Delete multiple keys matching pattern
     */
    deletePattern(pattern: string): number {
        const keys = this.cache.keys().filter(k => k.includes(pattern));
        return this.cache.del(keys);
    }

    /**
     * Clear entire cache
     */
    clear(): void {
        this.cache.flushAll();
    }

    /**
     * Get cache statistics
     */
    getStats() {
        const stats = this.cache.getStats();
        const total = this.hits + this.misses;
        const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

        return {
            hits: this.hits,
            misses: this.misses,
            keys: stats.keys,
            hitRate: hitRate.toFixed(2) + '%',
        };
    }

    /**
     * Log cache statistics
     */
    private logStats(): void {
        const stats = this.getStats();
        if (this.hits + this.misses > 0) {
            console.log(`[MemoryCache] Stats: ${JSON.stringify(stats)}`);
        }
    }

    /**
     * Check if key exists
     */
    has(key: string): boolean {
        return this.cache.has(key);
    }

    /**
     * Get remaining TTL for key (in seconds)
     */
    getTtl(key: string): number | undefined {
        return this.cache.getTtl(key);
    }

    /**
     * Get all keys
     */
    keys(): string[] {
        return this.cache.keys();
    }
}

// Singleton instance for application-wide use
export const memoryCache = new MemoryCache({
    stdTTL: 300, // 5 minutes for protocol data
    checkperiod: 120, // Check every 2 minutes
});
