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
1. SÖZDİZİMİ (Syntax): "syntax" alanı, NativeInfographicRenderer tarafından işlenen özel bir XML-benzeri dildir.
   Her zaman en dışta tek bir ana etiket kullanmalı ve tüm içeriği içine almalısın.
   Şu ana etiketleri ve yapılarını kullanmalısın:

   - <five-w-one-h title="...">
       <who question="...">...</who>
       <what question="...">...</what>
       <where question="...">...</where>
       <when question="...">...</when>
       <why question="...">...</why>
       <how question="...">...</how>
     </five-w-one-h>

   - <venn-diagram title="...">
       <set-a label="..."> <item>...</item> </set-a>
       <set-b label="..."> <item>...</item> </set-b>
       <intersection> <item>...</item> </intersection>
     </venn-diagram>

   - <sequence-steps title="...">
       <step> <label>...</label> <desc>...</desc> </step>
     </sequence-steps>

   - <fishbone-diagram title="...">
       <problem>...</problem>
       <category label="..."> <cause>...</cause> </category>
     </fishbone-diagram>

   - <concept-map title="...">
       <root label="...">
          <node label="..."> <branch label="..." /> </node>
       </root>
     </concept-map>

   - <math-steps-visual title="...">
       <step> <expression>...</expression> <explanation>...</explanation> </step>
     </math-steps-visual>

   - <cycle-process title="...">
       <phase label="..."> <desc>...</desc> </phase>
     </cycle-process>

   - <matrix-grid title="...">
       <header>Başlık1, Başlık2, ...</header>
       <row label="..."> <cell>...</cell> </row>
     </matrix-grid>

   - <timeline-chart title="...">
       <event date="..."> <title>...</title> <desc>...</desc> </event>
     </timeline-chart>

2. PEDAGOJİK NOT: "pedagogicalNote" alanı Elif Yıldız standartlarına göre en az 100 kelime olmalı ve öğretmene bu infografiğin öğrenciye nasıl fayda sağlayacağını bilimsel (örneğin "bilişsel yük kuramı", "ZPD") terimlerle anlatmalıdır.

3. DİSLEKSİ DOSTU: Metinler kısa, net ve somut olmalıdır. Karmaşık cümlelerden kaçın. Lexend fontu kullanılacağını varsayarak metinleri yapılandır.

4. JSON FORMATI: Yanıtın her zaman geçerli bir JSON objesi olmalıdır. "syntax" alanı STRING olmalı ve XML etiketlerini içermelidir.
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
