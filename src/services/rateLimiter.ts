/**
 * OOGMATIK - Rate Limiting Service
 * Token Bucket Algorithm - Per-user request limits
 */

import { RateLimitError } from '../utils/AppError.js';
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
        const quotaRef = doc(db, 'user_quotas', `${userId}_${limitKey}`);
        const now = Date.now();

        try {
            const docSnap = await getDoc(quotaRef);
            let bucket: TokenBucket;

            if (!docSnap.exists()) {
                // Yeni bucket oluştur
                bucket = {
                    tokens: config.tokens,
                    lastRefill: now
                };
                await setDoc(quotaRef, bucket);
            } else {
                bucket = docSnap.data() as TokenBucket;
            }

            // Refill tokens
            this.refillTokens(bucket, config, now);

            // Check if allowed
            const allowed = bucket.tokens >= cost;

            if (allowed) {
                bucket.tokens -= cost;
                await updateDoc(quotaRef, {
                    tokens: bucket.tokens,
                    lastRefill: bucket.lastRefill
                });
            }

            const remaining = Math.floor(bucket.tokens);
            const timeSinceRefill = now - bucket.lastRefill;
            const resetAfterMs = Math.max(0, config.windowMs - timeSinceRefill);

            return { allowed, remaining, resetAfterMs };
        } catch (error) {
            console.error('Quota check failed:', error);
            // Hata durumunda (Firebase kapalı vb.) fallback olarak izin ver
            return { allowed: true, remaining: 0, resetAfterMs: 0 };
        }
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
            throw new RateLimitError(resetAfterSec);
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
 */
export class RateLimiter {
    async check(userId: string, tier: UserTier = 'free', limitKey: LimitKey = 'apiGeneration'): Promise<boolean> {
        const { allowed } = await quotaService.checkAndConsume(userId, tier, limitKey);
        return allowed;
    }
}

export const quotaService = UserQuotaService.getInstance();
export const enforceRateLimit = (userId: string, tier: UserTier, limitKey: LimitKey, cost: number = 1) => 
    quotaService.enforce(userId, tier, limitKey, cost);
