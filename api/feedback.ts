
// @ts-ignore - Vercel types optional
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AppError, ValidationError, RateLimitError, toAppError } from '../src/utils/AppError.js';
import { validateFeedbackRequest } from '../src/utils/schemas.js';
import { RateLimiter } from '../src/services/rateLimiter.js';
import { logError } from '../src/utils/errorHandler.js';
import { corsMiddleware } from '../src/utils/cors.js';
import { logger } from '../src/utils/logger.js';

// Fallback types for non-Vercel environments
export type VercelRequest = any;
export type VercelResponse = any;

// Rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Enhanced Feedback API with validation and rate limiting
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS Security - NO WILDCARD
    if (!corsMiddleware(req, res)) {
        return;
    }

    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (req.method !== 'POST') {
        return handleError(
            res,
            new AppError(
                'Bu endpoint sadece POST isteklerini kabul eder.',
                'METHOD_NOT_ALLOWED',
                405
            )
        );
    }

    try {
        // Extract request body
        const { activityType, activityTitle, rating, message, email, timestamp, userId } = req.body;

        // ===== 1. INPUT VALIDATION =====
        try {
            validateFeedbackRequest({
                activityType,
                activityTitle,
                rating,
                message,
                email,
                timestamp
            });
        } catch (error) {
            const appError = toAppError(error);
            return handleError(res, appError);
        }

        // ===== 2. RATE LIMITING =====
        const actualUserId = userId || email || 'anonymous';
        const userTier = (req.headers['x-user-tier'] as string) || 'free';

        try {
            // Allow 5 feedback submissions per hour per user
            await rateLimiter.enforceLimit(
                actualUserId,
                userTier as 'free' | 'pro' | 'admin',
                'apiQuery',
                1
            );
        } catch (error) {
            if (error instanceof RateLimitError) {
                res.setHeader('Retry-After', '60');
                return handleError(res, error);
            }
            throw error;
        }

        // ===== 3. LOG FEEDBACK =====
        // KVKK UYARI: Kisisel veri (email, mesaj icerigi) ASLA production'da loglanmamali
        // Logger servisi otomatik olarak production'da hassas veri loglamaz
        logger.audit('feedback_received', actualUserId, 'submit_feedback', {
            activityType,
            activityTitle,
            rating,
            // email ve message KASITLI OLARAK loglanmiyor (KVKK)
        });

        // ===== 4. SEND RESPONSE =====
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        return res.status(200).json({
            success: true,
            message: "Geri bildirim günlüğe kaydedildi.",
            timestamp: new Date().toISOString()
        });

    } catch (error: unknown) {
        const appError = toAppError(error);
        logError(appError, {
            context: 'Feedback API Handler Unhandled Error',
            path: req.url,
            method: req.method,
        });
        return handleError(res, appError);
    }
}

/**
 * Standardized error response handler
 */
function handleError(res: VercelResponse, error: AppError | Error): VercelResponse {
    const appError = error instanceof AppError ? error : toAppError(error);

    // Log error for monitoring
    logError(appError, { context: 'Feedback API Response Error' });

    // Send error response
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    return res.status(appError.httpStatus).json({
        success: false,
        error: {
            message: appError.userMessage,
            code: appError.code,
            retryable: appError.isRetryable,
            timestamp: new Date().toISOString(),
        }
    });
}
