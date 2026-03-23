import { GenerationMode, SuperStudioDifficulty, GeneratedContentPayload } from '../../types/superStudio';
import { AppError } from '../../utils/AppError';
import { z } from 'zod';

// Pedagojik onaylı şablon çıktı şemaları
const ParagraphSchema = z.object({
    title: z.string(),
    text: z.string(),
    questions: z.array(z.object({
        question: z.string(),
        answer: z.string()
    })),
    pedagogicalNote: z.string()
});

interface GenerateParams {
    templates: string[];
    settings: Record<string, any>;
    mode: GenerationMode;
    grade: string | null;
    difficulty: SuperStudioDifficulty;
    studentId: string | null;
}

export const generateSuperStudioContent = async (
    params: GenerateParams
): Promise<GeneratedContentPayload[]> => {
    try {
        const { templates, mode, grade, difficulty } = params;

        if (!templates || templates.length === 0) {
            throw new AppError('En az bir şablon seçilmelidir.', 'NO_TEMPLATE_SELECTED', 400, undefined, false);
        }

        const results: GeneratedContentPayload[] = [];

        // Bu bir simülasyon/mock altyapısıdır (Gerçek Gemini çağrıları api/generate.ts üzerinden yapılacak)
        // Burada şablon özelinde batch iş akışı simüle ediliyor.
        for (const tpl of templates) {
            // Yapay Gecikme (UX için)
            await new Promise(resolve => setTimeout(resolve, mode === 'ai' ? 1500 : 500));

            results.push({
                id: `gen-${Date.now()}-${tpl}`,
                templateId: tpl,
                pages: [
                    {
                        title: `${tpl === 'okuma-anlama' ? '📚 Okuma Anlama Parçası' : tpl.toUpperCase()} Etkinliği`,
                        content: `${grade || 'Belirsiz'} Seviyesi / ${difficulty} Zorluk. \n\nMod: ${mode.toUpperCase()} \n\nBu alan gerçek üretimde API tarafından Zod şablonuyla döndürülecek ${tpl} verisini içerecektir. Öğrencide başarı hissi uyandıracak disleksi uyumlu minimal boşluk bırakılmış A4 metni burada yer alır.`,
                        pedagogicalNote: `Bu etkinlik, öğrencinin yakınsal gelişim alanına (ZPD) uygun biçimde '${tpl}' becerilerini geliştirmek için ${mode.toUpperCase()} modunda yapılandırılmıştır.`
                    }
                ],
                createdAt: Date.now()
            });
        }

        return results;
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        throw new AppError('Üretim sırasında beklenmeyen bir hata oluştu.', 'GENERATOR_ERROR', 500, error, true);
    }
};
