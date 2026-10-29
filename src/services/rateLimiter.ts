/**
 * BDMIND - Rate Limiting Service
 * Dual Mode: Local memory bucket with optional Firestore synchronization.
 * Guarantees zero latency and avoids race conditions via local token bucket while
 * syncing persistent quotas to Firestore.
 */

import { RateLimitError } from '../utils/AppError.js';
import { db, doc, runTransaction } from './firebaseClient.js';

interface TokenBucket {
    tokens: number;           // Mevcut token sayısı
    lastRefill: number;       // Son refill zamanı (timestamp)
    createdAt?: number;
}

export interface RateLimitConfig {
    tokens: number;           // Başlangıç token sayısı
    windowMs: number;         // Zaman penceresi (ms)
}

const RATE_LIMIT_PRESETS = {
    free: {
        apiGeneration: { tokens: 20, windowMs: 3600000 },    // 20 req/hour
        apiQuery: { tokens: 100, windowMs: 3600000 },        // 100 req/hour
        worksheetSave: { tokens: 50, windowMs: 3600000 },    // 50/hour
        ocrScan: { tokens: 5, windowMs: 3600000 },           // 5/hour
        apiFsProxy: { tokens: 20, windowMs: 3600000 }        // 20/hour
    },
    pro: {
        apiGeneration: { tokens: 200, windowMs: 3600000 },   // 200 req/hour
        apiQuery: { tokens: 1000, windowMs: 3600000 },       // 1000 req/hour
        worksheetSave: { tokens: 500, windowMs: 3600000 },   // 500/hour
        ocrScan: { tokens: 50, windowMs: 3600000 },          // 50/hour
        apiFsProxy: { tokens: 200, windowMs: 3600000 }       // 200/hour
    },
    admin: {
        apiGeneration: { tokens: 10000, windowMs: 3600000 },
        apiQuery: { tokens: 10000, windowMs: 3600000 },
        worksheetSave: { tokens: 10000, windowMs: 3600000 },
        ocrScan: { tokens: 10000, windowMs: 3600000 },
        apiFsProxy: { tokens: 10000, windowMs: 3600000 }
    }
};

export type LimitKey = keyof typeof RATE_LIMIT_PRESETS['free'];
export type UserTier = 'free' | 'pro' | 'admin';

const normalizeTier = (tier: string | undefined): UserTier => {
    if (!tier) return 'free';
    if (tier === 'admin') return 'admin';
    if (tier === 'pro' || tier === 'teacher' || tier === 'parent') return 'pro';
    if (tier === 'free') return 'free';
    return (tier in RATE_LIMIT_PRESETS) ? (tier as UserTier) : 'free';
};

export class UserQuotaService {
    private static instance: UserQuotaService;

    private constructor() { }

    public static getInstance(): UserQuotaService {
        if (!UserQuotaService.instance) {
            UserQuotaService.instance = new UserQuotaService();
        }
        return UserQuotaService.instance;
    }

    async checkAndConsume(
        userId: string,
        tier: UserTier,
        limitKey: LimitKey,
        cost: number = 1
    ): Promise<{ allowed: boolean; remaining: number; resetAfterMs: number }> {
        return rateLimiter.checkLimit(userId, tier, limitKey, cost);
    }

    async enforce(
        userId: string,
        tier: UserTier,
        limitKey: LimitKey,
        cost: number = 1
    ): Promise<void> {
        return rateLimiter.enforceLimit(userId, tier, limitKey, cost);
    }
}

export class RateLimiter {
    private buckets = new Map<string, Map<LimitKey, TokenBucket>>();

    async check(userId: string, tier: UserTier = 'free', limitKey: LimitKey = 'apiGeneration'): Promise<boolean> {
        const { allowed } = await this.checkLimit(userId, tier, limitKey);
        return allowed;
    }

    async checkLimit(
        userId: string,
        tier: UserTier = 'free',
        limitKey: LimitKey = 'apiGeneration',
        cost: number = 1
    ): Promise<{ allowed: boolean; remaining: number; resetAfterMs: number }> {
        if (!userId) return { allowed: true, remaining: 999, resetAfterMs: 0 };

        const safeTier = normalizeTier(tier);
        const config = RATE_LIMIT_PRESETS[safeTier]?.[limitKey] || RATE_LIMIT_PRESETS.free.apiQuery;
        const bucket = this.getOrCreateBucket(userId, limitKey, config);

        this.refillTokens(bucket, config);

        const allowed = bucket.tokens >= cost;
        if (allowed && cost > 0) {
            bucket.tokens -= cost;
        }

        const remaining = Math.floor(bucket.tokens);
        const timeSinceRefill = Date.now() - bucket.lastRefill;
        const resetAfterMs = Math.max(0, config.windowMs - timeSinceRefill);

        // Arka planda Firestore transaction sync (isteğe bağlı ve sessiz hata yakalamalı)
        if (db && typeof (db as any) === 'object' && Object.keys(db).length > 0) {
            const quotaRef = doc(db, 'user_quotas', `${userId}_${limitKey}`);
            runTransaction(db, async (transaction) => {
                transaction.set(quotaRef, {
                    tokens: remaining,
                    lastRefill: bucket.lastRefill
                });
            }).catch(() => {});
        }

        return { allowed, remaining, resetAfterMs };
    }

    async enforceLimit(
        userId: string,
        tier: UserTier = 'free',
        limitKey: LimitKey = 'apiGeneration',
        cost: number = 1
    ): Promise<void> {
        const { allowed, resetAfterMs } = await this.checkLimit(userId, tier, limitKey, cost);

        if (!allowed) {
            const resetAfterSec = Math.ceil(resetAfterMs / 1000);
            throw new RateLimitError(resetAfterSec, { retryAfter: resetAfterSec });
        }
    }

    getStatus(userId: string, tier: UserTier = 'free', limitKey: LimitKey = 'apiGeneration'): {
        remaining: number;
        total: number;
        resetAfterMs: number;
        resetsAt: Date;
        allowed: boolean;
    } {
        const safeTier = normalizeTier(tier);
        const config = RATE_LIMIT_PRESETS[safeTier]?.[limitKey] || RATE_LIMIT_PRESETS.free.apiGeneration;
        const bucket = this.getOrCreateBucket(userId, limitKey, config);

        this.refillTokens(bucket, config);

        const timeSinceRefill = Date.now() - bucket.lastRefill;
        const resetAfterMs = Math.max(0, config.windowMs - timeSinceRefill);
        const resetsAt = new Date(bucket.lastRefill + config.windowMs);

        return {
            remaining: Math.floor(bucket.tokens),
            total: config.tokens,
            resetAfterMs,
            resetsAt,
            allowed: bucket.tokens > 0
        };
    }

    reset(userId: string, limitKey?: LimitKey): void {
        if (limitKey) {
            const userBuckets = this.buckets.get(userId);
            if (userBuckets) {
                userBuckets.delete(limitKey);
            }
        } else {
            this.buckets.delete(userId);
        }

        if (db && typeof (db as any) === 'object' && Object.keys(db).length > 0) {
            const keysToReset: LimitKey[] = limitKey ? [limitKey] : ['apiGeneration', 'apiQuery', 'worksheetSave', 'ocrScan', 'apiFsProxy'];
            runTransaction(db, async (transaction) => {
                for (const key of keysToReset) {
                    const config = RATE_LIMIT_PRESETS.free[key];
                    const quotaRef = doc(db, 'user_quotas', `${userId}_${key}`);
                    transaction.set(quotaRef, {
                        tokens: config.tokens,
                        lastRefill: Date.now()
                    });
                }
            }).catch(() => {});
        }
    }

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

    private refillTokens(bucket: TokenBucket, config: RateLimitConfig): void {
        const now = Date.now();
        const timePassed = now - bucket.lastRefill;

        if (timePassed >= config.windowMs) {
            bucket.tokens = config.tokens;
            bucket.lastRefill = now;
        } else {
            const refillAmount = (timePassed / config.windowMs) * config.tokens;
            bucket.tokens = Math.min(bucket.tokens + refillAmount, config.tokens);
            bucket.lastRefill = now;
        }
    }
}

export const quotaService = UserQuotaService.getInstance();
export const rateLimiter = new RateLimiter();
export const enforceRateLimit = (userId: string, tier: UserTier, limitKey: LimitKey, cost: number = 1) =>
    rateLimiter.enforceLimit(userId, tier, limitKey, cost);
