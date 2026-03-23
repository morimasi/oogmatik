/**
 * POST /api/ocr/generate-from-prompt
 * Mod 2: Prompt'tan sıfırdan etkinlik üretimi
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { promptActivityService } from '../src/../services/promptActivityService.js';
import { activityApprovalService } from '../src/../services/activityApprovalService.js';
import type { PromptGenerationRequest } from '../src/../types/ocr-activity.js';

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
        const {
            prompt,
            gradeLevel,
            subject,
            difficulty,
            questionTypes,
            questionCount,
            estimatedDuration,
            includeAnswerKey,
            includeImages,
            mode,
            userId,
            profile,
        } = req.body as PromptGenerationRequest & { userId: string };

        // Validasyon
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 5) {
            return res.status(400).json({
                success: false,
                error: { message: 'Prompt en az 5 karakter olmalıdır.', code: 'VALIDATION_ERROR' },
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

        let template;

        if (mode === 'fast') {
            // Hızlı mod
            template = await promptActivityService.quickGenerate(prompt, gradeLevel || 4);
        } else {
            // Gelişmiş mod
            template = await promptActivityService.generateFromPrompt({
                prompt,
                gradeLevel: gradeLevel || 4,
                subject: subject || 'Genel',
                difficulty: difficulty || 'Orta',
                questionTypes: questionTypes || ['fill_in_the_blank', 'multiple_choice'],
                questionCount: questionCount ?? 10,
                estimatedDuration: estimatedDuration ?? 20,
                includeAnswerKey: includeAnswerKey ?? true,
                includeImages: includeImages ?? false,
                mode: 'advanced',
                profile,
            });
        }

        // Otomatik onay kuyruğuna ekle
        const draft = await activityApprovalService.submitForReview(template, userId);

        return res.status(200).json({
            success: true,
            data: { template, draft },
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Bilinmeyen hata.';
        console.error('[API] generate-from-prompt hatası:', error);

        return res.status(500).json({
            success: false,
            error: { message, code: 'INTERNAL_ERROR' },
            timestamp: new Date().toISOString(),
        });
    }
}
