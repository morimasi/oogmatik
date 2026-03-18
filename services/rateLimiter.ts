/**
 * OOGMATIK - Rate Limiting Service
 * Token Bucket Algorithm - Per-user request limits
 */

import { RateLimitError } from '../utils/AppError';

/**
 * Token Bucket: Her user'ın belirli süre içinde yapabileceği request sayısı
 */
interface TokenBucket {
    tokens: number;           // Mevcut token sayısı
    lastRefill: number;       // Son refill zamanı (timestamp)
    createdAt: number;        // Bucket oluşturulma zamanı
}

/**
 * Rate Limit Konfigürasyonu
 */
export interface RateLimitConfig {
    tokens: number;           // Başlangıç token sayısı
    windowMs: number;         // Zaman penceresi (ms)
    refillRate?: number;      // Token/ms (otomatik hesaplanırsa boş)
}

/**
 * User tier'larına göre limit
 */
const RATE_LIMIT_PRESETS = {
    free: {
        apiGeneration: { tokens: 20, windowMs: 3600000 },    // 20 req/hour
        apiQuery: { tokens: 100, windowMs: 3600000 },        // 100 req/hour
        worksheetSave: { tokens: 50, windowMs: 3600000 },    // 50/hour
        ocrScan: { tokens: 5, windowMs: 3600000 }            // 5/hour
    },
    pro: {
        apiGeneration: { tokens: 200, windowMs: 3600000 },   // 200 req/hour
        apiQuery: { tokens: 1000, windowMs: 3600000 },       // 1000 req/hour
        worksheetSave: { tokens: 500, windowMs: 3600000 },   // 500/hour
        ocrScan: { tokens: 50, windowMs: 3600000 }           // 50/hour
    },
    admin: {
        apiGeneration: { tokens: 10000, windowMs: 3600000 },
        apiQuery: { tokens: 10000, windowMs: 3600000 },
        worksheetSave: { tokens: 10000, windowMs: 3600000 },
        ocrScan: { tokens: 10000, windowMs: 3600000 }
    }
};

export type LimitKey = keyof typeof RATE_LIMIT_PRESETS['free'];
export type UserTier = 'free' | 'pro' | 'admin';

/**
 * Main Rate Limiter Service
 */
export class RateLimiter {
    // In-memory bucket storage
    private buckets = new Map<string, Map<LimitKey, TokenBucket>>();

    // Cleanup interval (1 saat başına eski bucket'ları temizle)
    private cleanupInterval: ReturnType<typeof setInterval> | null = null;

    constructor(cleanupIntervalMs: number = 3600000) {
        // Browser'da çalıştığımızı varsay (Node.js server'da da çalışır)
        this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
    }

    /**
     * Token var mı kontrol et ve harcayıp harcamadığını belirle
     */
    async checkLimit(
        userId: string,
        tier: UserTier,
        limitKey: LimitKey,
        cost: number = 1
    ): Promise<{ allowed: boolean; remaining: number; resetAfterMs: number }> {
        const config = RATE_LIMIT_PRESETS[tier][limitKey];
        const bucket = this.getOrCreateBucket(userId, limitKey, config);

        // Token'ları refill et
        this.refillTokens(bucket, config);

        // Token var mı?
        const allowed = bucket.tokens >= cost;

        if (allowed) {
            bucket.tokens -= cost;
        }

        // Kalan tokenleri ve reset zamanını hesapla
        const remaining = Math.floor(bucket.tokens);
        const timeSinceRefill = Date.now() - bucket.lastRefill;
        const resetAfterMs = Math.max(0, config.windowMs - timeSinceRefill);

        return {
            allowed,
            remaining,
            resetAfterMs
        };
    }

    /**
     * Hızlı kontrol (throw hatası döner)
     */
    async enforceLimit(
        userId: string,
        tier: UserTier,
        limitKey: LimitKey,
        cost: number = 1
    ): Promise<void> {
        const { allowed, resetAfterMs } = await this.checkLimit(userId, tier, limitKey, cost);

        if (!allowed) {
            const resetAfterSec = Math.ceil(resetAfterMs / 1000);
            throw new RateLimitError(resetAfterSec);
        }
    }

    /**
     * Mevcut durumu kontrol et (consume etmeden)
     */
    getStatus(userId: string, tier: UserTier, limitKey: LimitKey): {
        remaining: number;
        total: number;
        resetsAt: Date;
    } {
        const config = RATE_LIMIT_PRESETS[tier][limitKey];
        const bucket = this.getOrCreateBucket(userId, limitKey, config);

        this.refillTokens(bucket, config);

        const resetsAt = new Date(bucket.lastRefill + config.windowMs);

        return {
            remaining: Math.floor(bucket.tokens),
            total: config.tokens,
            resetsAt
        };
    }

    /**
     * Token'ları manual olarak reset et (test/admin için)
     */
    reset(userId: string, limitKey?: LimitKey): void {
        if (limitKey) {
            const userBuckets = this.buckets.get(userId);
            if (userBuckets) {
                userBuckets.delete(limitKey);
            }
        } else {
            this.buckets.delete(userId);
        }
    }

    /**
     * Private: Bucket al veya oluştur
     */
    private getOrCreateBucket(
        userId: string,
        limitKey: LimitKey,
        config: RateLimitConfig
    ): TokenBucket {
        if (!this.buckets.has(userId)) {
            this.buckets.set(userId, new Map());
        }

        const userBuckets = this.buckets.get(userId)!;

        if (!userBuckets.has(limitKey)) {
            const now = Date.now();
            userBuckets.set(limitKey, {
                tokens: config.tokens,
                lastRefill: now,
                createdAt: now
            });
        }

        return userBuckets.get(limitKey)!;
    }

    /**
     * Private: Token'ları refill et (linear, zaman tabanlı)
     */
    private refillTokens(bucket: TokenBucket, config: RateLimitConfig): void {
        const now = Date.now();
        const timePassed = now - bucket.lastRefill;

        if (timePassed >= config.windowMs) {
            // Tam reset
            bucket.tokens = config.tokens;
            bucket.lastRefill = now;
        } else {
            // Partial refill: (timePassed / windowMs) * tokens
            const refillAmount = (timePassed / config.windowMs) * config.tokens;
            bucket.tokens = Math.min(bucket.tokens + refillAmount, config.tokens);
            bucket.lastRefill = now;
        }
    }

    /**
     * Private: Eski bucket'ları temizle (1 saat inactivity)
     */
    private cleanup(): void {
        const oneDayMs = 86400000;
        const now = Date.now();

        for (const [userId, limitBuckets] of this.buckets.entries()) {
            // User bucket'ı çok eski mi?
            let allOld = true;

            for (const [_, bucket] of limitBuckets.entries()) {
                if (now - bucket.createdAt < oneDayMs) {
                    allOld = false;
                    break;
                }
            }

            // Eğer tüm bucket'lar eski ise sil
            if (allOld && limitBuckets.size > 0) {
                this.buckets.delete(userId);
            }
        }
    }

    /**
     * Service'i kapat (cleanup interval'ı temizle)
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.buckets.clear();
    }

    /**
     * Debug: Tüm bucket'ları göster (geliştirme için)
     */
    debug(): Record<string, Record<string, any>> {
        const debug: Record<string, Record<string, any>> = {};

        for (const [userId, limitBuckets] of this.buckets.entries()) {
            debug[userId] = {};
            for (const [key, bucket] of limitBuckets.entries()) {
                debug[userId][key] = {
                    tokens: bucket.tokens.toFixed(2),
                    lastRefill: new Date(bucket.lastRefill).toISOString()
                };
            }
        }

        return debug;
    }
}

/**
 * Global instance
 */
export const rateLimiter = new RateLimiter();

/**
 * Convenience function: user ID + tier'dan directly enforce et
 */
export const enforceRateLimit = (
    userId: string,
    tier: UserTier,
    limitKey: LimitKey,
    cost: number = 1
) => rateLimiter.enforceLimit(userId, tier, limitKey, cost);
