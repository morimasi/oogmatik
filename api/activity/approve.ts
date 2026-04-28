/**
 * POST /api/activity/approve
 * Etkinlik onay/red endpoint'i
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { activityApprovalService } from '../../src/services/activityApprovalService.js';
import { corsMiddleware } from '../../src/utils/cors.js';
import { logError } from '../../src/utils/logger.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    if (!corsMiddleware(req, res)) return;

    try {
        // GET — Onay bekleyen taslakları listele
        if (req.method === 'GET') {
            const filter = {
                status: (req.query['status'] as string) || undefined,
                mode: (req.query['mode'] as string) || undefined,
            };

            const drafts = await activityApprovalService.getPendingReviews(filter as Record<string, unknown> as Parameters<typeof activityApprovalService.getPendingReviews>[0]);

            return res.status(200).json({
                success: true,
                data: drafts,
                timestamp: new Date().toISOString(),
            });
        }

        // POST — Onay/Red işlemi
        if (req.method === 'POST') {
            const { draftId, action, reason, adminId } = req.body as {
                draftId: string;
                action: 'approve' | 'reject';
                reason?: string;
                adminId: string;
            };

            if (!draftId || !action || !adminId) {
                return res.status(400).json({
                    success: false,
                    error: { message: 'draftId, action ve adminId zorunludur.', code: 'VALIDATION_ERROR' },
                    timestamp: new Date().toISOString(),
                });
            }

            let result;

            if (action === 'approve') {
                result = await activityApprovalService.approve(draftId, adminId);
            } else if (action === 'reject') {
                if (!reason) {
                    return res.status(400).json({
                        success: false,
                        error: { message: 'Red gerekçesi zorunludur.', code: 'VALIDATION_ERROR' },
                        timestamp: new Date().toISOString(),
                    });
                }
                result = await activityApprovalService.reject(draftId, adminId, reason);
            } else {
                return res.status(400).json({
                    success: false,
                    error: { message: 'Geçersiz action. approve veya reject olmalı.', code: 'VALIDATION_ERROR' },
                    timestamp: new Date().toISOString(),
                });
            }

            // Otomatik ayarları oluştur (onay durumunda)
            let autoSettings;
            if (action === 'approve') {
                autoSettings = activityApprovalService.generateAutoSettings(result);
            }

            return res.status(200).json({
                success: true,
                data: { draft: result, autoSettings },
                timestamp: new Date().toISOString(),
            });
        }

        return res.status(405).json({
            success: false,
            error: { message: 'Desteklenmeyen metod.', code: 'METHOD_NOT_ALLOWED' },
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Bilinmeyen hata.';
        logError(error instanceof Error ? error : new Error(String(error)), { context: '[API] approve hatası' });

        return res.status(500).json({
            success: false,
            error: { message, code: 'INTERNAL_ERROR' },
            timestamp: new Date().toISOString(),
        });
    }
}
