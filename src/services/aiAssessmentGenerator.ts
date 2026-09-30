import { generateWithSchema } from './geminiClient.js';
import { CognitiveProfileMetrics, DomainAdaptiveParameters, difficultyForProfile } from '../components/assessment/services/cognitiveAdaptiveService.js';

export interface AIGeneratedTestItems {
    domain: string;
    studentName: string;
    adaptiveDifficultyLabel: string;
    pedagogicalGuidance: string;
    items: any[];
}

/**
 * AI destekli içerik üretiminin anlamlı katma değer sağladığı alanlar.
 *
 * Algısal/parametrik testler (görsel bellek, dikkat ızgarası, çalışma belleği, planlama...)
 * deterministik yerel motor tarafından, profile göre ölçeklenerek üretilir; LLM'in
 * ızgara hücresi seçmesi bilimsel bir katkı sağlamaz. Anlamsal içerik gerektiren
 * alanlarda ise her uygulamada özgün, öğrenciye özel madde üretilir.
 */
const AI_SUPPORTED_DOMAINS = new Set([
    'verbal_comprehension',
    'logical_reasoning',
    'phonological_loop',
    'auditory_processing',
]);

export const isAiSupportedDomain = (domain: string): boolean => AI_SUPPORTED_DOMAINS.has(domain);

const buildStudentInfo = (profile: CognitiveProfileMetrics): string => `
ÖĞRENCİ BİLGİLERİ VE KLİNİK PROFİL:
• Adı: ${profile.studentName}
• Yaş: ${profile.age} | Sınıf Seviyesi: ${profile.grade}
• Tanı/Özel Eğitim Bağlamı: ${(profile.diagnosis || []).join(', ') || 'Özel eğitim tanısı yok (Standart gelişim takibi)'}
• Güçlü Yönler: ${(profile.strengths || []).join(', ') || 'Genel bilişsel beceriler'}
• İhtiyaç Duyulan Destek/Zayıf Alanlar: ${(profile.weaknesses || []).join(', ') || 'Belirtilmedi'}
• Ek Notlar/Gözlem: ${profile.notes || 'Yok'}
`;

const buildDifficultyDirective = (params?: DomainAdaptiveParameters): string => {
    if (!params) return '';
    const band = difficultyForProfile(params.complexityScore);
    return `
ZORUNLU ZORLUK SEVİYESİ: ${band} (${params.complexityScore}/5)
- Destek notu: ${params.supportNote}
- Toplam madde sayısı yaklaşık ${params.targetItemsCount} olmalıdır.
- Zamanlama çarpanı: ${params.timeLimitMultiplier.toFixed(2)}x (öğrencinin tempösuna göre sadeleştir).
`;
};

interface DomainSpec {
    task: string;
    schemaProps: Record<string, unknown>;
    itemsKey: string;
}

const buildDomainSpec = (domain: string): DomainSpec | null => {
    switch (domain) {
        case 'verbal_comprehension':
            return {
                itemsKey: 'items',
                task: `
GÖREV: Bu öğrencinin yaşına, sınıfına ve klinik durumuna özel ZPD (Yakınsal Gelişim Alanı) seviyesinde ÖZGÜN Türkçe kelime anlamı / zıt anlam değerlendirme soruları üret.
- Disleksi/okuma güçlüğü varsa sözcüklerin uzunluğunu ve karmaşıklığını dengeli ayarla.
- Her soru tek bir hedef kelime ve 4 seçenekten oluşmalı, seçenekler birbirinden farklı olmalıdır.
`,
                schemaProps: {
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                word: { type: 'STRING', description: 'Hedef kelime' },
                                options: { type: 'ARRAY', items: { type: 'STRING' }, description: '4 farklı seçenek' },
                                correct: { type: 'STRING', description: 'Doğru cevap (seçeneklerden biri)' },
                            },
                            required: ['word', 'options', 'correct'],
                        },
                    },
                },
            };

        case 'logical_reasoning':
            return {
                itemsKey: 'items',
                task: `
GÖREV: Öğrencinin yaşına ve akıl yürütme seviyesine uygun ÖZGÜN mantıksal örüntü/dizileme soruları üret.
- Izgara (grid) biçiminde emoji/sembol/sayı matrisleri kullan; örn: [["🔴","🔴"],["🔴","?"]].
- Her matriste tam olarak bir '?' hücresi olsun ve 'answer' o hücrenin doğru değeri olsun.
- 'options' 3 farklı seçenek içersin ve mutlaka 'answer' değerini barındırsın.
- 'difficulty' değeri yalnızca "easy", "medium" veya "hard" olabilir.
- Her soru için kısa bir 'hint' (Türkçe) yaz.
`,
                schemaProps: {
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                id: { type: 'INTEGER' },
                                grid: { type: 'ARRAY', items: { type: 'ARRAY', items: { type: 'STRING' } } },
                                options: { type: 'ARRAY', items: { type: 'STRING' } },
                                answer: { type: 'STRING' },
                                rule: { type: 'STRING' },
                                difficulty: { type: 'STRING', enum: ['easy', 'medium', 'hard'] },
                                hint: { type: 'STRING' },
                            },
                            required: ['id', 'grid', 'options', 'answer', 'rule', 'difficulty', 'hint'],
                        },
                    },
                },
            };

        case 'phonological_loop':
            return {
                itemsKey: 'items',
                task: `
GÖREV: Öğrenciye özel, kolaydan zora ilerleyen fonolojik bellek dizileri üret.
- 'type' alanı yalnızca: syllable | word | digit | reverse | letter | mixed olabilir.
- Disleksik/destek ihtiyacı olan öğrenciler için ritmik hece ve kısa sözcük dizileri oluştur.
- Her dizideki öğeler birbirinden farklı olsun; 'reverse' tipinde öğrencinin TERSTEN sıralaması beklenecektir.
- 'level' alanı 1'den başlayarak artan sırada olsun.
`,
                schemaProps: {
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                level: { type: 'INTEGER' },
                                type: { type: 'STRING', description: 'syllable | word | digit | reverse | letter | mixed' },
                                items: { type: 'ARRAY', items: { type: 'STRING' } },
                            },
                            required: ['level', 'type', 'items'],
                        },
                    },
                },
            };

        case 'auditory_processing':
            return {
                itemsKey: 'items',
                task: `
GÖREV: Öğrencinin yaşına uygun, sesle okunacak işitsel işleme / dinlediğini ayırt etme maddeleri oluştur.
- Hedef kelimeler net ve sesletimi belirgin nesne/kavram isimleri olmalıdır.
- Her maddede 4 farklı seçenek olsun ve 'targetWord' mutlaka seçeneklerden biri olarak yer alsın.
- Çeldiriciler aynı anlam kategorisinden (ör. meyve-hayvan-eşya) ve benzer uzunlukta seçilsin.
`,
                schemaProps: {
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                targetWord: { type: 'STRING' },
                                options: { type: 'ARRAY', items: { type: 'STRING' } },
                            },
                            required: ['targetWord', 'options'],
                        },
                    },
                },
            };

        default:
            return null;
    }
};

/**
 * Gemini ile öğrenciye özel, %100 özgün değerlendirme içeriği üretir.
 * Sadece anlamsal içerik gerektiren alanlarda çalışır; diğer alanlarda null döner.
 */
export const generateAIAssessmentContent = async (
    domain: string,
    profile: CognitiveProfileMetrics,
    params?: DomainAdaptiveParameters
): Promise<AIGeneratedTestItems | null> => {
    const spec = buildDomainSpec(domain);
    if (!spec) return null;

    const studentInfo = buildStudentInfo(profile);
    const difficultyDirective = buildDifficultyDirective(params);

    const fullPrompt = `
[ROL: Baş Nöropsikolog ve Uzman Bilişsel Değerlendirme AI Motoru]
${studentInfo}

BİLİŞSEL ALAN: ${domain}
${spec.task}
${difficultyDirective}

TALİMATLAR:
1. Öğrencinin tanısını, yaşını ve gelişimsel ihtiyaçlarını doğrudan dikkate alarak zorluk derecesini belirle.
2. Çıktı strict JSON olmalıdır; markdown veya açıklama ekleme.
3. adaptiveDifficultyLabel alanında belirlenen zorluk ve nedenini özetle (örn: "Disleksi profili nedeniyle 2. sınıf sade hece dizilimi").
4. pedagogicalGuidance alanında öğretmene kısa ve uygulanabilir bir tavsiye notu yaz.
5. Bu üretim öğrenciye özel ve TEK OLMAK ZORUNDA; kalıplaşmış, tekrar eden sorulardan kaçın.
`;

    const schema = {
        type: 'OBJECT',
        properties: {
            domain: { type: 'STRING' },
            studentName: { type: 'STRING' },
            adaptiveDifficultyLabel: { type: 'STRING' },
            pedagogicalGuidance: { type: 'STRING' },
            ...spec.schemaProps,
        },
        required: ['domain', 'studentName', 'adaptiveDifficultyLabel', 'pedagogicalGuidance', 'items'],
    };

    try {
        const result = await generateWithSchema(fullPrompt, schema);
        return result as unknown as AIGeneratedTestItems;
    } catch (err) {
        console.error('AI Test Generation Error:', err);
        return null;
    }
};
