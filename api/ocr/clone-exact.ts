/**
 * POST /api/ocr/clone-exact
 * Mod 3: Birebir klonlama + içerik yenileme
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { exactCloneService } from '../src/../services/exactCloneService.js';
import { activityApprovalService } from '../src/../services/activityApprovalService.js';
import type { ExactCloneRequest } from '../src/../types/ocr-activity.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') return res.status(200).end();

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: { message: 'Sadece POST metodu desteklenir.', code: 'METHOD_NOT_ALLOWED' },
            timestamp: new Date().toISOString(),
        });
    }

    try {
        const { image, cloneMode, preserveStyle, targetProfile, ageGroup, difficulty, userId } =
            req.body as ExactCloneRequest & { userId: string };

        // Validasyon
        if (!image || typeof image !== 'string') {
            return res.status(400).json({
                success: false,
                error: { message: 'Görsel verisi eksik veya geçersiz.', code: 'VALIDATION_ERROR' },
                timestamp: new Date().toISOString(),
            });
        }

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: { message: 'Kullanıcı ID eksik.', code: 'VALIDATION_ERROR' },
                timestamp: new Date().toISOString(),
            });
        }

        const validCloneModes = ['minor_variation', 'full_content_refresh'];
        if (!validCloneModes.includes(cloneMode)) {
            return res.status(400).json({
                success: false,
                error: { message: 'Geçersiz klonlama modu.', code: 'VALIDATION_ERROR' },
                timestamp: new Date().toISOString(),
            });
        }

        // Klonlama işlemi
        const template = await exactCloneService.cloneWithNewContent({
            image,
            cloneMode,
            preserveStyle: preserveStyle ?? true,
            targetProfile,
            ageGroup,
            difficulty,
        });

        // Onay kuyruğuna ekle
        const draft = await activityApprovalService.submitForReview(template, userId);

        return res.status(200).json({
            success: true,
            data: { template, draft },
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Bilinmeyen hata.';
        console.error('[API] clone-exact hatası:', error);

        return res.status(500).json({
            success: false,
            error: { message, code: 'INTERNAL_ERROR' },
            timestamp: new Date().toISOString(),
        });
    }
}
