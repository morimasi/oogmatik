import { generateCreativeMultimodal } from '../geminiClient';
import { ActivityType } from '../../types/activity';
import { AnimationProps, AnimationActivityResult } from '../../types/animation';
import { AppError } from '../../utils/AppError';

/**
 * Animasyon Stüdyosu v1.0 — Merkezi AI Üretim Motoru
 */
export class AnimationService {
    private static instance: AnimationService;

    private constructor() { }

    public static getInstance(): AnimationService {
        if (!AnimationService.instance) {
            AnimationService.instance = new AnimationService();
        }
        return AnimationService.instance;
    }

    /**
     * Gemini 2.5 Flash kullanarak dinamik animasyon içeriği üretir.
     */
    public async generateAnimation(
        activityType: ActivityType,
        topic: string,
        params: any = {}
    ): Promise<AnimationActivityResult> {
        if (!topic) throw new AppError('Konu eksik.', 'VALIDATION_ERROR', 400);

        const systemPrompt = `
        Sen Oogmatik platformunun Kıdemli Animasyon Mimarı Selin Arslan'sın.
        Görevin, ${activityType} için pedagojik olarak yapılandırılmış, Remotion Player'da oynatılacak bir video senaryosu üretmektir.
        
        YAŞ GRUBU: ${params.ageGroup || '8-10'}
        PROFİL: ${params.profile || 'disleksi'}
        
        KURALLAR:
        1. "segments" alanı metnin akışını belirler.
        2. Disleksi için heceleme veya kritik harf vurgularını (isHighlight) kullan.
        3. Yanıtın mutlaka geçerli bir JSON olmalı.
        `;

        const userPrompt = `Konu: ${topic}. Bu konuyu bir eğitim animasyonuna dönüştür.`;

        const schema = {
            type: 'OBJECT',
            properties: {
                title: { type: 'STRING' },
                segments: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            text: { type: 'STRING' },
                            isHighlight: { type: 'BOOLEAN' },
                            color: { type: 'STRING' }
                        },
                        required: ['text']
                    }
                },
                pedagogicalNote: { type: 'STRING' },
                templateType: { type: 'STRING' }
            },
            required: ['title', 'segments', 'pedagogicalNote', 'templateType']
        };

        try {
            const response = await generateCreativeMultimodal({
                prompt: userPrompt,
                systemInstruction: systemPrompt,
                schema,
                temperature: 0.7
            });

            return {
                id: crypto.randomUUID(),
                activityType,
                props: {
                    ...response,
                    fps: 30,
                    durationInFrames: 300
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error('Animation Generation Error:', error);
            throw error;
        }
    }
}

export const animationService = AnimationService.getInstance();
