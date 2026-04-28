import { ActivityType, GeneratorOptions } from '../../types';
import { generateCreativeMultimodal } from '../geminiClient';
import { InfographicActivityResult } from '../../types/infographic';
import { AppError } from '../../utils/AppError';

import { logInfo, logError, logWarn } from '../../utils/logger.js';
/**
 * İnfografik Stüdyosu v3 — Merkezi AI Üretim Motoru
 * 96 farklı aktivite türü için özelleştirilmiş promptlar üretir.
 */
export async function generateInfographic(
    activityType: ActivityType,
    options: GeneratorOptions
): Promise<InfographicActivityResult> {
    const { topic, studentAge, difficulty, profile } = options;

    if (!topic) {
        throw new AppError('Konu veya metin eksik.', 'VALIDATION_ERROR', 400);
    }

    const SYSTEM_PROMPT = `
Sen, Oogmatik platformunun kıdemli İnfografik ve Görsel Tasarım uzmanısın. 
Görevin, disleksi, DEHB ve özel öğrenme güçlüğü yaşayan çocuklar için yüksek kontrastlı, yapılandırılmış ve pedagojik olarak etkili infografik içerikleri üretmektir.

BAĞLAM:
- Yaş Grubu: ${studentAge}
- Zorluk: ${difficulty}
- Profil: ${profile}
- Aktivite Tipi: ${activityType}

ÜRETİM KURALLARI:
1. SÖZDİZİMİ (Syntax): "syntax" alanı, NativeInfographicRenderer tarafından işlenen özel bir XML-benzeri dildir.
   Her zaman en dışta tek bir ana etiket kullanmalı ve tüm içeriği içine almalısın.
   A4 sayfasını "dolu dolu" dolduracak zengin içerikli yapılar kur. 

2. PREMIUM İÇERİK: "activityContent" içerisinde sadece ana veriyi değil, aynı zamanda "supportingDrill" alanı altında 
   ana konuyla ilgili 3 adet hızlı pekiştirme sorusu veya kısa alıştırma (true/false, eşleştirme vb.) üret.

3. PEDAGOJİK NOT: "pedagogicalNote" alanı Elif Yıldız standartlarına göre detaylı olmalı. 
   Öğrencinin profilini (${profile}) ve zorluk seviyesini (${difficulty}) baz alarak 
   şu bilimsel kavramlara değin: "Bilişsel Yük", "Yapı iskelesi (Scaffolding)", "Görsel İşleme Hızı".

4. DİSLEKSİ DOSTU: Metinler kısa, net ve somut olmalıdır. Karmaşık cümlelerden kaçın.
`;

    const USER_PROMPT = `
Konu: ${topic}
Lütfen yukarıdaki konuyu ${activityType} aktivite türüne uygun olarak "Ultra Profesyonel" seviyede görselleştir.
Sayfa Düzeni: A4 boyutunda, kompakt, zengin (dolu dolu) ve estetik olmalıdır.

ÖNEMLİ: "syntax" alanında NativeInfographicRenderer etiketlerini kullan. 
Ayrıca "activityContent" içinde öğrencinin konuyu pekiştirmesi için 'supportingDrill' (3 kısa soru) eklemeyi unutma.
`;

    const schema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            syntax: { type: 'STRING' },
            templateType: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' },
            difficultyLevel: { type: 'STRING', enum: ['Kolay', 'Orta', 'Zor'] },
            targetSkills: { type: 'ARRAY', items: { type: 'STRING' } },
            ageGroup: { type: 'STRING', enum: ['5-7', '8-10', '11-13', '14+'] },
            profile: { type: 'STRING', enum: ['dyslexia', 'dyscalculia', 'adhd', 'mixed', 'general'] },
            estimatedDuration: { type: 'NUMBER' },
            activityContent: { type: 'OBJECT' }
        },
        required: ['title', 'syntax', 'templateType', 'pedagogicalNote', 'difficultyLevel', 'targetSkills', 'ageGroup', 'profile', 'estimatedDuration', 'activityContent']
    };

    try {
        const response = await generateCreativeMultimodal({
            prompt: USER_PROMPT,
            systemInstruction: SYSTEM_PROMPT,
            schema,
            temperature: 0.7
        });

        // Response'u InfographicActivityResult tipine zorla
        return {
            ...response,
            category: _inferCategory(activityType),
            generationMode: 'ai'
        } as InfographicActivityResult;
    } catch (error) {
        logError('Infographic Generation Error:', error);
        throw error;
    }
}

function _inferCategory(type: ActivityType): any {
    if (type.includes('READING')) return 'reading-comprehension';
    if (type.includes('MATH') || type.includes('NUMBER')) return 'math-logic';
    if (type.includes('SCIENCE')) return 'science';
    if (type.includes('SOCIAL')) return 'social-studies';
    if (type.includes('LANGUAGE')) return 'language-literacy';
    if (type.includes('STRATEGY')) return 'learning-strategies';
    if (type.includes('CLINICAL') || type.includes('BEP')) return 'clinical-bep';
    return 'visual-spatial';
}
