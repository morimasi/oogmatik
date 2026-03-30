/**
 * MatSinavStudyosu — Frontend API Client
 * Matematik sınav üretimi için servis katmanı
 * Mevcut sinavService.ts'ye dokunmaz — tamamen bağımsız
 */

import type { MatSinavAyarlari, MatSinav, MatSoru } from '../types/matSinav';
import { generateMathExam, regenerateSingleQuestion } from './generators/mathSinavGenerator';
import { AppError } from '../utils/AppError';

/**
 * Matematik sınavı oluştur
 * Not: Şu an doğrudan generator'ı çağırıyor (client-side).
 * Serverless endpoint oluşturulduğunda API çağrısına dönüştürülebilir.
 */
export const generateMatExam = async (settings: MatSinavAyarlari): Promise<MatSinav> => {
    try {
        return await generateMathExam(settings);
    } catch (error: unknown) {
        if (error instanceof AppError) throw error;
        const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
        throw new AppError(
            'Matematik sınavı oluşturulurken hata oluştu.',
            'MAT_SINAV_SERVICE_ERROR',
            500,
            { originalError: msg },
            true
        );
    }
};

/**
 * Tek soru yenileme
 */
export const refreshSingleQuestion = async (
    soruIndex: number,
    settings: MatSinavAyarlari,
    mevcutSoru: MatSoru
): Promise<MatSoru> => {
    try {
        return await regenerateSingleQuestion(soruIndex, settings, mevcutSoru);
    } catch (error: unknown) {
        if (error instanceof AppError) throw error;
        const msg = error instanceof Error ? error.message : 'Bilinmeyen hata';
        throw new AppError(
            'Soru yenilenirken hata oluştu.',
            'QUESTION_REFRESH_ERROR',
            500,
            { originalError: msg },
            true
        );
    }
};
