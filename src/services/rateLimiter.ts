/**
 * BDMIND - Rate Limiting Service
 * Token Bucket Algorithm - Per-user request limits
 */

import { RateLimitError, toAppError } from '../utils/AppError.js';
import { logError } from '../utils/logger.js';
import { db, doc, getDoc, setDoc, updateDoc } from './firebaseClient.js';

/**
 * Token Bucket: Her user'ın belirli süre içinde yapabileceği request sayısı
 */
interface TokenBucket {
    tokens: number;           // Mevcut token sayısı
    lastRefill: number;       // Son refill zamanı (timestamp)
}

/**
 * Rate Limit Konfigürasyonu
 */
export interface RateLimitConfig {
    tokens: number;           // Başlangıç token sayısı
    windowMs: number;         // Zaman penceresi (ms)
}

/**
 * User tier'larına göre limit - ARTIRILDI (production için)
 */
const RATE_LIMIT_PRESETS = {
    free: {
        apiGeneration: { tokens: 50, windowMs: 3600000 },    // 50 req/hour (was 20)
        apiQuery: { tokens: 200, windowMs: 3600000 },        // 200 req/hour (was 100)
        worksheetSave: { tokens: 100, windowMs: 3600000 },   // 100/hour (was 50)
        ocrScan: { tokens: 10, windowMs: 3600000 },          // 10/hour (was 5)
        apiFsProxy: { tokens: 50, windowMs: 3600000 }        // 50/hour (was 20)
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

/**
 * In-memory token bucket cache (Vercel/Node instance ömrü boyunca)
 * Firestore round-trip'leri azaltır
 */
const memoryBucketCache = new Map<string, TokenBucket>();
const CACHE_TTL_MS = 30000; // 30 saniye

function getCacheKey(userId: string, limitKey: string): string {
    return `${userId}_${limitKey}`;
}

function getCachedBucket(userId: string, limitKey: LimitKey): TokenBucket | null {
    const key = getCacheKey(userId, limitKey);
    const cached = memoryBucketCache.get(key);
    if (!cached) return null;
    // TTL kontrolü (basitçe timestamp ile)
    // Bucket'ın lastRefill'i eskiyse cache'ten sil
    if (Date.now() - cached.lastRefill > CACHE_TTL_MS) {
        memoryBucketCache.delete(key);
        return null;
    }
    return cached;
}

function setCachedBucket(userId: string, limitKey: LimitKey, bucket: TokenBucket): void {
    const key = getCacheKey(userId, limitKey);
    memoryBucketCache.set(key, bucket);
}

/**
 * UserQuota Service (Persistent Rate Limiting)
 * Firestore tabanlı, sayfa yenilense de korunan kota yönetimi.
 */
export class UserQuotaService {
    private static instance: UserQuotaService;

    private constructor() {}

    public static getInstance(): UserQuotaService {
        if (!UserQuotaService.instance) {
            UserQuotaService.instance = new UserQuotaService();
        }
        return UserQuotaService.instance;
    }

    /**
     * Kota kontrolü yap ve harca
     */
    async checkAndConsume(
        userId: string,
        tier: UserTier,
        limitKey: LimitKey,
        cost: number = 1
    ): Promise<{ allowed: boolean; remaining: number; resetAfterMs: number }> {
        if (!userId) return { allowed: true, remaining: 999, resetAfterMs: 0 };

        const config = RATE_LIMIT_PRESETS[tier][limitKey];
        const now = Date.now();

        // 1. Memory cache'ten oku (hızlı path)
        let bucket = getCachedBucket(userId, limitKey);
        let isNewBucket = false;

        if (!bucket) {
            // Cache miss: Firestore'dan oku
            const quotaRef = doc(db, 'user_quotas', `${userId}_${limitKey}`);
            try {
                const docSnap = await getDoc(quotaRef);

                if (!docSnap.exists()) {
                    // Yeni bucket oluştur
                    bucket = {
                        tokens: config.tokens,
                        lastRefill: now
                    };
                    isNewBucket = true;
                    await setDoc(quotaRef, bucket);
                } else {
                    bucket = docSnap.data() as TokenBucket;
                }
            } catch (error) {
                logError(toAppError(error), { context: 'Quota check failed' });
                // Hata durumunda fallback: izin ver
                return { allowed: true, remaining: 0, resetAfterMs: 0 };
            }
        }

        // Refill tokens
        this.refillTokens(bucket, config, now);

        // Check if allowed
        const allowed = bucket.tokens >= cost;

        if (allowed) {
            bucket.tokens -= cost;
            // Memory cache'e yaz (hızlı)
            setCachedBucket(userId, limitKey, bucket);
            // Firestore'a async yaz (blocking değil)
            updateDoc(doc(db, 'user_quotas', `${userId}_${limitKey}`), {
                tokens: bucket.tokens,
                lastRefill: bucket.lastRefill
            }).catch(() => {}); // Sessizce başarısız olsun
        }

        const remaining = Math.floor(bucket.tokens);
        const timeSinceRefill = now - bucket.lastRefill;
        const resetAfterMs = Math.max(0, config.windowMs - timeSinceRefill);

        return { allowed, remaining, resetAfterMs };
    }

    /**
     * Hızlı kontrol (throw hatası döner)
     */
    async enforce(
        userId: string,
        tier: UserTier,
        limitKey: LimitKey,
        cost: number = 1
    ): Promise<void> {
        const { allowed, resetAfterMs } = await this.checkAndConsume(userId, tier, limitKey, cost);

        if (!allowed) {
            const resetAfterSec = Math.ceil(resetAfterMs / 1000);
            throw new RateLimitError(undefined, { retryAfter: resetAfterSec });
        }
    }

    private refillTokens(bucket: TokenBucket, config: RateLimitConfig, now: number): void {
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

/**
 * Legacy support for RateLimiter class name
 * Enhanced with all required methods for test compatibility
 */
export class RateLimiter {
    /**
     * Check if user is allowed to make request
     */
    async check(userId: string, tier: UserTier = 'free', limitKey: LimitKey = 'apiGeneration'): Promise<boolean> {
        const { allowed } = await quotaService.checkAndConsume(userId, tier, limitKey);
        return allowed;
    }

    /**
     * Check limit with detailed response
     */
    async checkLimit(userId: string, tier: UserTier = 'free', limitKey: LimitKey = 'apiGeneration', cost: number = 1): Promise<{ allowed: boolean; remaining: number; resetAfterMs: number }> {
        return await quotaService.checkAndConsume(userId, tier, limitKey, cost);
    }

    /**
     * Enforce rate limit (throws error if exceeded)
     */
    async enforceLimit(userId: string, tier: UserTier = 'free', limitKey: LimitKey = 'apiGeneration', cost: number = 1): Promise<void> {
        await quotaService.enforce(userId, tier, limitKey, cost);
    }

    /**
     * Get current status of user's quota
     */
    async getStatus(userId: string, tier: UserTier = 'free', limitKey: LimitKey = 'apiGeneration'): Promise<{ remaining: number; total: number; resetAfterMs: number; allowed: boolean }> {
        const config = RATE_LIMIT_PRESETS[tier][limitKey];
        const result = await quotaService.checkAndConsume(userId, tier, limitKey, 0); // cost=0 for check only
        return {
            remaining: result.remaining,
            total: config.tokens,
            resetAfterMs: result.resetAfterMs,
            allowed: result.allowed
        };
    }

    /**
     * Reset user's quota (admin function)
     */
    async reset(userId: string, limitKey: LimitKey = 'apiGeneration'): Promise<void> {
        // For admin use - reset quota to full
        const config = RATE_LIMIT_PRESETS.admin[limitKey];
        const quotaRef = doc(db, 'user_quotas', `${userId}_${limitKey}`);
        const bucket = {
            tokens: config.tokens,
            lastRefill: Date.now()
        };
        await setDoc(quotaRef, bucket);
        // Memory cache'i de güncelle
        setCachedBucket(userId, limitKey, bucket);
    }
}

export const quotaService = UserQuotaService.getInstance();
export const rateLimiter = new RateLimiter();
export const enforceRateLimit = (userId: string, tier: UserTier, limitKey: LimitKey, cost: number = 1) => 
    quotaService.enforce(userId, tier, limitKey, cost);
