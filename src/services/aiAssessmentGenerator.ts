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
 * Gemini destekli dinamik değerlendirme içeriği üretir.
 *
 * TÜM 11 bilişsel alan için madde/şema desteği vardır. Ancak tüketici testler
 * içeriği `useAdaptiveContent` hook'u üzerinden `mapAi` ile talep eder: anlamsal
 * içerik gerektiren alanlarda (sözel, mantık, fonoloji, işitsel) AI öne çıkar;
 * algısal/parametrik alanlarda (ızgara, dizi, dikkat) ise seed'li yerel motor
 * anında ve profile ölçekli içerik üretir. AI çıktısı yoksa/yetmezse yerel
 * içerik her zaman geçerli kalır.
 */
const AI_SUPPORTED_DOMAINS = new Set([
    'verbal_comprehension',
    'logical_reasoning',
    'phonological_loop',
    'auditory_processing',
    'planning',
    'visual_spatial_memory',
    'working_memory',
    'selective_attention',
    'processing_speed',
    'visual_search',
    'visual_motor_integration',
]);

export const isAiSupportedDomain = (domain: string): boolean => AI_SUPPORTED_DOMAINS.has(domain);

const buildStudentInfo = (profile: CognitiveProfileMetrics): string => `
ÖĞRENCİ BİLGİLERİ VE KLİNİK PROFİL:
• Adı: ${profile.studentName}
• Yaş: ${profile.age} | Sınıf Seviyesi: ${profile.grade}
• Tanı/Özel Eğitim Bağlamı: ${profile.diagnosis?.join(', ') || 'Özel eğitim tanısı yok (Standart gelişim takibi)'}
• Güçlü Yönler: ${profile.strengths?.join(', ') || 'Genel bilişsel beceriler'}
• İhtiyaç Duyulan Destek/Zayıf Alanlar: ${profile.weaknesses?.join(', ') || 'Belirtilmedi'}
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
}

const buildDomainSpec = (domain: string): DomainSpec | null => {
    switch (domain) {
        case 'verbal_comprehension':
            return {
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

        case 'planning':
            return {
                task: `
GÖREV: Öğrencinin yaşına, DEHB/Disleksi tanı durumuna ve ZPD seviyesine uygun ÖZGÜN Londra Kulesi (Tower of London) planlama görevleri üret.
- Renkler: red, blue, yellow.
- Çubuk kapasiteleri: [3, 2, 1] standardı.
- Hedef hamle sayılarını öğrenci yaşı ve tanı esnekliğine göre belirle (targetMoves: 2-6, maxAllowedMoves: 4-10).
- initialPegs ve targetPegs dizileri üç çubuk için maxCapacity + balls alanlarını içermelidir.
`,
                schemaProps: {
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                id: { type: 'INTEGER' },
                                title: { type: 'STRING' },
                                description: { type: 'STRING' },
                                targetMoves: { type: 'INTEGER' },
                                maxAllowedMoves: { type: 'INTEGER' },
                                initialPegs: {
                                    type: 'ARRAY',
                                    items: {
                                        type: 'OBJECT',
                                        properties: {
                                            maxCapacity: { type: 'INTEGER' },
                                            balls: { type: 'ARRAY', items: { type: 'STRING' } },
                                        },
                                        required: ['maxCapacity', 'balls'],
                                    },
                                },
                                targetPegs: {
                                    type: 'ARRAY',
                                    items: {
                                        type: 'OBJECT',
                                        properties: {
                                            maxCapacity: { type: 'INTEGER' },
                                            balls: { type: 'ARRAY', items: { type: 'STRING' } },
                                        },
                                        required: ['maxCapacity', 'balls'],
                                    },
                                },
                            },
                            required: ['id', 'title', 'description', 'targetMoves', 'maxAllowedMoves', 'initialPegs', 'targetPegs'],
                        },
                    },
                },
            };

        case 'visual_spatial_memory':
            return {
                task: `
GÖREV: Öğrenci için görsel-uzamsal hafıza matrisi görev parametreleri üret.
- Matris boyutu (gridSize: 3, 4 veya 5), desen uzunluğu (patternCount: 3-8), yanıp sönme hızı (flashMs: 600-1200).
- Seviyeler kolaydan zora artan sırada olsun.
`,
                schemaProps: {
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                level: { type: 'INTEGER' },
                                gridSize: { type: 'INTEGER' },
                                patternCount: { type: 'INTEGER' },
                                flashMs: { type: 'INTEGER' },
                            },
                            required: ['level', 'gridSize', 'patternCount', 'flashMs'],
                        },
                    },
                },
            };

        case 'working_memory':
            return {
                task: `
GÖREV: Öğrencinin yaşı ve kelime dağarcığına uygun işleyen bellek geri çağırma kelime/sembol setleri oluştur.
- Her sette öğrencinin aklında tutması gereken kelimeler ve çeldirici sorular bulunsun.
`,
                schemaProps: {
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                level: { type: 'INTEGER' },
                                words: { type: 'ARRAY', items: { type: 'STRING' } },
                                distractors: { type: 'ARRAY', items: { type: 'STRING' } },
                                question: { type: 'STRING' },
                            },
                            required: ['level', 'words', 'distractors', 'question'],
                        },
                    },
                },
            };

        case 'selective_attention':
            return {
                task: `
GÖREV: Öğrencinin yaşına uygun seçici dikkat (Stroop / çeldirici engelleme) kelime-renk çatışma maddeleri üret.
- Renkler: Kırmızı, Mavi, Yeşil, Sarı, Mor.
- 'color' alanı yazının rengi, 'correctAnswer' ise yazının renginin adı olmalıdır.
`,
                schemaProps: {
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                text: { type: 'STRING' },
                                color: { type: 'STRING' },
                                correctAnswer: { type: 'STRING' },
                            },
                            required: ['text', 'color', 'correctAnswer'],
                        },
                    },
                },
            };

        case 'processing_speed':
            return {
                task: `
GÖREV: Öğrencinin sınıf seviyesine uygun hızlı isimlendirme (RAN) sembol ve görsel dizileri üret.
- Her maddede sıralı semboller ve hedef sayısı belirtilsin.
`,
                schemaProps: {
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                symbols: { type: 'ARRAY', items: { type: 'STRING' } },
                                targetCount: { type: 'INTEGER' },
                            },
                            required: ['symbols', 'targetCount'],
                        },
                    },
                },
            };

        case 'visual_search':
            return {
                task: `
GÖREV: Görsel arama / iptal görevi için seviyeli hedef sembol ve çeldirici matrisi üret.
- Hedef ile çeldiriciler görsel olarak benzer/karıştırılabilir olmalıdır.
`,
                schemaProps: {
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                targetSymbol: { type: 'STRING' },
                                gridSymbols: { type: 'ARRAY', items: { type: 'STRING' } },
                                targetCount: { type: 'INTEGER' },
                            },
                            required: ['targetSymbol', 'gridSymbols', 'targetCount'],
                        },
                    },
                },
            };

        case 'visual_motor_integration':
            return {
                task: `
GÖREV: Görsel-motor bütünleme için öğrenci yaşına uygun şekil/çizgi takip görevleri üret.
- Görev karmaşıklığı seviyeye göre artsın.
`,
                schemaProps: {
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                shapeType: { type: 'STRING' },
                                instructions: { type: 'STRING' },
                                complexity: { type: 'INTEGER' },
                            },
                            required: ['shapeType', 'instructions', 'complexity'],
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
 * Desteklenmeyen alanlarda null döner (tüketici yerel içerikte kalır).
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
1. Öğrencinin tanısını, yaşını ve gelişimsel ihtiyaçlarını doğrudan dikkate alarak zorluk derecesini ve ZPD seviyesini belirle.
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
