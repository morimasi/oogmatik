import { generateWithSchema } from './geminiClient';
import { CognitiveProfileMetrics } from '../components/assessment/services/cognitiveAdaptiveService';

export interface AIGeneratedTestItems {
    domain: string;
    studentName: string;
    adaptiveDifficultyLabel: string;
    pedagogicalGuidance: string;
    items: any[];
}

/**
 * Gemini 2.5 Flash AI motoru ile öğrenciye özel %100 özgün, dinamik değerlendirme soruları/içeriği üretir.
 * TÜM 11 Bilişsel Değerlendirme Alanını destekler.
 */
export const generateAIAssessmentContent = async (
    domain: string,
    profile: CognitiveProfileMetrics
): Promise<AIGeneratedTestItems | null> => {
    const studentInfo = `
ÖĞRENCİ BİLGİLERİ VE KLİNİK PROFİL:
• Adı: ${profile.studentName}
• Yaş: ${profile.age} | Sınıf Seviyesi: ${profile.grade}
• Tanı/Özel Eğitim Bağlamı: ${profile.diagnosis?.join(', ') || 'Özel eğitim tanısı yok (Standart gelişim takibi)'}
• Güçlü Yönler: ${profile.strengths?.join(', ') || 'Genel bilişsel beceriler'}
• İhtiyaç Duyulan Destek/Zayıf Alanlar: ${profile.weaknesses?.join(', ') || 'Belirtilmedi'}
• Ek Notlar/Gözlem: ${profile.notes || 'Yok'}
`;

    let domainPrompt = '';
    let schemaProps: any = {};

    switch (domain) {
        case 'verbal_comprehension':
            domainPrompt = `
GÖREV: Bu öğrencinin yaşına, sınıfına ve klinik durumuna özel ZPD (Yakınsak Gelişim Alanı) seviyesinde 6 adet ÖZGÜN Türkçe Kelime Anlamı / Zıt Anlam Değerlendirme Sorusu üret.
- Disleksi/okuma güçlüğü varsa sözcüklerin uzunluğunu ve karmaşıklığını dengeli ayarla.
- Sorular tek kelime ve 4 seçenekli olmalıdır.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            word: { type: 'STRING', description: 'Hedef kelime' },
                            options: { type: 'ARRAY', items: { type: 'STRING' }, description: '4 seçenek' },
                            correct: { type: 'STRING', description: 'Doğru cevap' }
                        },
                        required: ['word', 'options', 'correct']
                    }
                }
            };
            break;

        case 'logic_reasoning':
            domainPrompt = `
GÖREV: Öğrencinin yaşına ve zeka/mantık seviyesine uygun 5 adet ÖZGÜN Mantıksal Örüntü/Dizileme Sorusu üret.
- Izgara biçiminde emoji/sembol/sayı matrisleri kullan (örn: [['🔴', '🔴'], ['🔴', '?']]).
- Her soru için ipucu ve mantık kuralı açıklaması yaz.
`;
            schemaProps = {
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
                            difficulty: { type: 'STRING' },
                            hint: { type: 'STRING' }
                        },
                        required: ['id', 'grid', 'options', 'answer', 'rule', 'difficulty', 'hint']
                    }
                }
            };
            break;

        case 'planning':
            domainPrompt = `
GÖREV: Öğrencinin yaşına, DEHB/Disleksi tanı durumuna ve ZPD seviyesine uygun 4 adet ÖZGÜN Londra Kulesi (Tower of London) Planlama Görevi üret.
- Renkler: red, blue, yellow.
- Çubuk kapasiteleri: [3, 2, 1] standardı.
- Hedef hamle sayılarını öğrenci yaşı ve tanı esnekliğine göre belirle (targetMoves: 2-6, maxAllowedMoves: 4-10).
`;
            schemaProps = {
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
                                        balls: { type: 'ARRAY', items: { type: 'STRING' } }
                                    },
                                    required: ['maxCapacity', 'balls']
                                }
                            },
                            targetPegs: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        maxCapacity: { type: 'INTEGER' },
                                        balls: { type: 'ARRAY', items: { type: 'STRING' } }
                                    },
                                    required: ['maxCapacity', 'balls']
                                }
                            }
                        },
                        required: ['id', 'title', 'description', 'targetMoves', 'maxAllowedMoves', 'initialPegs', 'targetPegs']
                    }
                }
            };
            break;

        case 'visual_spatial_memory':
            domainPrompt = `
GÖREV: Öğrenci için Görsel Uzamsal Hafıza Matrisi görev parametreleri üret.
- Matris boyutu (gridSize: 3, 4 veya 5), dizi uzunluğu (sequenceLength: 3-8), yanıp sönme hızı (flashIntervalMs: 600-1200).
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            level: { type: 'INTEGER' },
                            gridSize: { type: 'INTEGER' },
                            patternCount: { type: 'INTEGER' },
                            flashMs: { type: 'INTEGER' }
                        },
                        required: ['level', 'gridSize', 'patternCount', 'flashMs']
                    }
                }
            };
            break;

        case 'working_memory':
            domainPrompt = `
GÖREV: Öğrencinin yaşı ve kelime dağarcığına uygun 5 adet İşleyen Bellek Geri Çağırma Kelime/Sembol Seti oluştur.
- Her sette öğrencinin aklında tutması gereken kelimeler ve çeldirici sorular bulunsun.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            level: { type: 'INTEGER' },
                            words: { type: 'ARRAY', items: { type: 'STRING' } },
                            distractors: { type: 'ARRAY', items: { type: 'STRING' } },
                            question: { type: 'STRING' }
                        },
                        required: ['level', 'words', 'distractors', 'question']
                    }
                }
            };
            break;

        case 'phonological_loop':
            domainPrompt = `
GÖREV: Öğrenciye özel, artan zorluk seviyelerinde 5 adet Fonolojik Bellek Dizisi (hece, kelime, rakam karışımı) üret.
- Disleksik öğrenciler için ritmik hece ve kısa sözcük dizileri oluştur.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            level: { type: 'INTEGER' },
                            type: { type: 'STRING', description: 'syllable | word | digit | reverse | letter | mixed' },
                            items: { type: 'ARRAY', items: { type: 'STRING' } }
                        },
                        required: ['level', 'type', 'items']
                    }
                }
            };
            break;

        case 'selective_attention':
            domainPrompt = `
GÖREV: Öğrencinin yaşına uygun Seçici Dikkat (Stroop / Çeldirici Engelleme) kelime-renk çatışma maddeleri üret.
- Renkler: Kırmızı, Mavi, Yeşil, Sarı, Mor.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            text: { type: 'STRING' },
                            color: { type: 'STRING' },
                            correctAnswer: { type: 'STRING' }
                        },
                        required: ['text', 'color', 'correctAnswer']
                    }
                }
            };
            break;

        case 'processing_speed':
            domainPrompt = `
GÖREV: Öğrencinin sınıf seviyesine uygun Hızlı İsimlendirme (RAN) sembol ve görsel dizileri üret.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            symbols: { type: 'ARRAY', items: { type: 'STRING' } },
                            targetCount: { type: 'INTEGER' }
                        },
                        required: ['symbols', 'targetCount']
                    }
                }
            };
            break;

        case 'auditory_processing':
            domainPrompt = `
GÖREV: Öğrencinin yaşına uygun, sesle okunacak 6 adet İşitsel İşleme / Dinlediğini Anlama kelime seti oluştur.
- Hedef kelimeler net, sesletimi belirgin nesne/kavramlar olmalıdır.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            targetWord: { type: 'STRING' },
                            options: { type: 'ARRAY', items: { type: 'STRING' } }
                        },
                        required: ['targetWord', 'options']
                    }
                }
            };
            break;

        case 'visual_search':
            domainPrompt = `
GÖREV: Görsel Arama / İptal Testi için 5 seviyeli hedef sembol ve çeldirici matrisi üret.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            targetSymbol: { type: 'STRING' },
                            gridSymbols: { type: 'ARRAY', items: { type: 'STRING' } },
                            targetCount: { type: 'INTEGER' }
                        },
                        required: ['targetSymbol', 'gridSymbols', 'targetCount']
                    }
                }
            };
            break;

        case 'visual_motor_integration':
            domainPrompt = `
GÖREV: Görsel Motor Bütünleme için öğrenci yaşına uygun 4 adet şekil/çizgi takip görevi üret.
`;
            schemaProps = {
                items: {
                    type: 'ARRAY',
                    items: {
                        type: 'OBJECT',
                        properties: {
                            shapeType: { type: 'STRING' },
                            instructions: { type: 'STRING' },
                            complexity: { type: 'INTEGER' }
                        },
                        required: ['shapeType', 'instructions', 'complexity']
                    }
                }
            };
            break;

        default:
            return null;
    }

    const fullPrompt = `
[ROL: Baş Nöropsikolog ve Uzman Bilişsel Değerlendirme AI Motoru]
${studentInfo}

BİLİŞSEL ALAN: ${domain}
${domainPrompt}

TALİMATLAR:
1. Öğrencinin tanısını, yaşını ve gelişimsel ihtiyaçlarını doğrudan dikkate alarak zorluk derecesini ve ZPD seviyesini belirle.
2. Çıktı strict JSON olmalıdır.
3. adaptiveDifficultyLabel alanında belirlenen zorluk ve nedenini özetle (örn: "Disleksi profili nedeniyle 2. Sınıf sade hece dizilimi").
4. pedagogicalGuidance alanında öğretmene tavsiye notu yaz.
`;

    const schema = {
        type: 'OBJECT',
        properties: {
            domain: { type: 'STRING' },
            studentName: { type: 'STRING' },
            adaptiveDifficultyLabel: { type: 'STRING' },
            pedagogicalGuidance: { type: 'STRING' },
            ...schemaProps
        },
        required: ['domain', 'studentName', 'adaptiveDifficultyLabel', 'pedagogicalGuidance', 'items']
    };

    try {
        const result = await generateWithSchema(fullPrompt, schema);
        return result as unknown as AIGeneratedTestItems;
    } catch (err) {
        console.error('AI Test Generation Error:', err);
        return null;
    }
};
