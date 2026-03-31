import { ActivityType, GeneratorOptions } from '../../types';
import { generateCreativeMultimodal } from '../geminiClient';
import { InfographicActivityResult } from '../../types/infographic';
import { AppError } from '../../utils/AppError';

/**
 * İnfografik Stüdyosu v3 — Merkezi AI Üretim Motoru
 * 96 farklı aktivite türü için özelleştirilmiş promptlar üretir.
 */
export async function generateInfographic(
    activityType: ActivityType,
    options: GeneratorOptions
): Promise<InfographicActivityResult> {
    const { topic, studentAge, difficulty, profile, mode } = options;

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
1. SÖZDİZİMİ (Syntax): "syntax" alanı, NativeInfographicRenderer tarafından işlenen özel bir deklaratif dildir.
   Şu ana etiketleri kullanmalısın:
   - <concept-map title="...">...</concept-map>
   - <sequence-steps title="...">...</sequence-steps>
   - <venn-diagram left="..." right="...">...</venn-diagram>
   - <fishbone-diagram title="...">...</fishbone-diagram>
   - <five-w-one-h title="...">...</five-w-one-h>
   - <math-steps-visual title="...">...</math-steps-visual>
   - <cycle-process title="...">...</cycle-process>
   - <matrix-grid title="...">...</matrix-grid>

2. PEDAGOJİK NOT: "pedagogicalNote" alanı Elif Yıldız standartlarına göre en az 100 kelime olmalı ve öğretmene bu infografiğin öğrenciye nasıl fayda sağlayacağını bilimsel (örneğin "bilişsel yük kuramı", "ZPD") terimlerle anlatmalıdır.

3. DİSLEKSİ DOSTU: Metinler kısa, net ve somut olmalıdır. Karmaşık cümlelerden kaçın.

4. JSON FORMATI: Yanıtın her zaman geçerli bir JSON objesi olmalıdır.
`;

    const USER_PROMPT = `
Konu: ${topic}
Lütfen yukarıdaki konuyu ${activityType} aktivite türüne uygun olarak görselleştir.
Senaryo: ${activityType} bir ${difficulty} seviye ${studentAge} yaş ${profile} öğrencisi için hazırlanmalıdır.

ÖNEMLİ: "syntax" alanında mutlaka NativeInfographicRenderer etiketlerini kullan. 
Örnek: "<activity-venn title='Karşılaştırma'>...</activity-venn>" veya "<activity-fishbone title='Neden-Sonuç'>...</activity-fishbone>"
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
        console.error('Infographic Generation Error:', error);
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
