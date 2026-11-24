import { useState, useCallback } from 'react';
import { KelimeCumleConfig, KelimeCumleGeneratedContent, KelimeCumleActivityType } from '../../../types/kelimeCumle';
import { KELIME_CUMLE_SOURCES } from '../../../kaynak/kelimeCumle';
import { generateWithSchema } from '../../../services/geminiClient';
import { logError, logWarn } from '../../../utils/logger.js';

export function generateKelimeCumleOffline(config: KelimeCumleConfig): KelimeCumleGeneratedContent {
    const sourcePool = KELIME_CUMLE_SOURCES[config.type];
    
    if (!sourcePool || sourcePool.length === 0) {
        throw new Error(`Belirtilen tip için veri kaynağı bulunamadı: ${config.type}`);
    }

    // İstenen adet kadar soru üret: Tüm havuzu karıştır ve istenen adet kadar benzersiz öğe seç
    const shuffled = [...sourcePool].sort(() => Math.random() - 0.5);
    const selectedItems = shuffled.slice(0, Math.min(config.itemCount, shuffled.length));

    if (selectedItems.length < config.itemCount) {
        logWarn(`Kaynak yetersiz: İstenen ${config.itemCount}, mevcut ${selectedItems.length} soru`);
    }

    // Nöro-pedagojik profile özel öğretmen/veli notu (Kural #0)
    const profile = config.learningProfile || 'dyslexia';
    let pedagogicalNote = 'Bu çalışma, dil ve okuma becerilerini pekiştirmek ve sözcük dağarcığını zenginleştirmek üzere ZPD prensipleriyle yapılandırılmıştır.';
    if (profile === 'dyslexia') {
        pedagogicalNote = 'Disleksi Desteği: Geniş satır/kelime aralığı, Lexend fontu ve fonolojik ayrıştırma kurallarına göre yapılandırılmıştır. b-d ve p-q harf karışıklıklarını azaltıcı belirgin sözcük sınırları içerir.';
    } else if (profile === 'adhd') {
        pedagogicalNote = 'DEHB Desteği: 5-7 dakikalık mikro-döngüye uygun, odak dağılmasını önleyen kısa ve net maddelerle yapılandırılmıştır.';
    } else if (profile === 'mixed') {
        pedagogicalNote = 'Bütüncül Destek: Hem morfolojik sözcük tamamlama hem de semantik cümle bağlama adımlarında dengeli nöro-pedagojik yaklaşım sunar.';
    }

    return {
        title: config.title || "Kelime-Cümle Çalışması",
        instructions: getInstructions(config.type),
        pedagogicalNote,
        targetSkills: ['Sözcük Dağarcığı', 'Okuduğunu Anlama', 'Morfolojik Farkındalık', 'Cümle Kurgusu', 'Disleksi Desteği'],
        items: selectedItems,
        activityType: config.type,
        difficulty: config.difficulty,
        settings: {
            showPredicate: config.showPredicate || false,
            showAnswers: config.showAnswers || false
        }
    };
}

export const useKelimeCumleGenerator = () => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateOffline = useCallback((config: KelimeCumleConfig): KelimeCumleGeneratedContent => {
        return generateKelimeCumleOffline(config);
    }, []);

    const generateAI = useCallback(async (config: KelimeCumleConfig): Promise<KelimeCumleGeneratedContent> => {
        setIsGenerating(true);
        setError(null);
        try {
            const prompt = buildPrompt(config);
            const schema = {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING', description: 'Çalışma kağıdı başlığı' },
                    instructions: { type: 'STRING', description: 'Öğrenciye yönelik açık yönerge' },
                    pedagogicalNote: { type: 'STRING', description: 'Öğretmen ve veli için klinik ve pedagojik not' },
                    items: {
                        type: 'ARRAY',
                        description: 'Etkinlik soruları veya maddeleri',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                sentence: { type: 'STRING' },
                                answer: { type: 'STRING' },
                                question: { type: 'STRING' },
                                options: { type: 'ARRAY', items: { type: 'STRING' } },
                                word: { type: 'STRING' },
                                fullWord: { type: 'STRING' },
                                clue: { type: 'STRING' },
                                words: { type: 'ARRAY', items: { type: 'STRING' } },
                                correctSentence: { type: 'STRING' },
                                antonym: { type: 'STRING' }
                            }
                        }
                    }
                },
                required: ['title', 'instructions', 'items', 'pedagogicalNote']
            };

            const response = await generateWithSchema(prompt, schema) as {
                title?: string;
                instructions?: string;
                pedagogicalNote?: string;
                items?: Array<Record<string, unknown>>;
            };

            if (response && Array.isArray(response.items) && response.items.length > 0) {
                return {
                    title: response.title || config.title || 'Kelime-Cümle Çalışması',
                    instructions: response.instructions || getInstructions(config.type),
                    pedagogicalNote: response.pedagogicalNote || 'Özel eğitim ve dil gelişimi desteği amaçlı nöro-pedagojik çalışma.',
                    targetSkills: ['Sözcük Dağarcığı', 'Okuduğunu Anlama', 'Disleksi Desteği'],
                    items: response.items,
                    activityType: config.type,
                    difficulty: config.difficulty,
                    settings: {
                        showPredicate: config.showPredicate || false,
                        showAnswers: config.showAnswers || false
                    }
                };
            }

            // Fallback to offline
            logWarn('AI yanıtı eksik geldi, offline havuza geçiliyor.');
            return generateOffline(config);
        } catch (err) {
            logError('AI içerik üretirken hata oluştu, otomatik offline fallback devreye girdi:', {
                error: err instanceof Error ? err.message : String(err)
            });
            // Kesintisiz kullanıcı deneyimi: Asla boş ekranda bırakma
            return generateOffline(config);
        } finally {
            setIsGenerating(false);
        }
    }, [generateOffline]);

    return {
        generateOffline,
        generateAI,
        isGenerating,
        error
    };
};

function getInstructions(type: KelimeCumleActivityType): string {
    switch (type) {
        case 'bosluk_doldurma': return 'Cümlelerdeki boşluklara uygun kelimeleri yazınız ve cümleleri yüksek sesle okuyunuz.';
        case 'test': return 'Soruları dikkatlice okuyup doğru seçeneği işaretleyiniz.';
        case 'kelime_tamamlama': return 'Verilen ipuçlarından yararlanarak eksik harfleri tamamlayıp kelimeleri bulunuz.';
        case 'karisik_cumle': return 'Karışık olarak verilen kelimeleri anlamlı ve kurallı cümleler haline getiriniz.';
        case 'zit_anlam': return 'Verilen kelimelerin zıt (karşıt) anlamlılarını yanlarındaki boşluklara yazınız.';
        default: return '';
    }
}

function buildPrompt(config: KelimeCumleConfig): string {
    const difficultyRules = {
        'Başlangıç': '~60 kelime, kısa ve basit cümleler.',
        'Orta': '3x Başlangıç yoğunluğu, ~180 kelime, birleşik cümleler.',
        'İleri': '3x Orta yoğunluğu, ~500+ kelime, kompleks yapılar, tam dolu A4.',
        'Uzman': 'Maksimum A4 yoğunluğu, akademik/teknik dil.'
    };

    const sources = KELIME_CUMLE_SOURCES[config.type] || [];
    const randomSamples = [...sources].sort(() => Math.random() - 0.5).slice(0, 3);
    const exampleStr = JSON.stringify(randomSamples, null, 2);

    return `Sen bir özel eğitim ve disleksi dil terapisi uzmanısın. bdmind "Kelime-Cümle Stüdyosu" için özgün ve yüksek kaliteli çalışma kağıdı içeriği üretiyorsun.

GÖREV: "${config.type}" türünde etkinlik üret.
HEDEF ÖĞRENCİ: ${config.studentName || 'Öğrenci'}
YAŞ GRUBU: ${config.ageGroup}
ÖZEL EĞİTİM PROFİLİ: ${config.learningProfile || 'Disleksi Desteği'}
ZORLUK SEVİYESİ: ${config.difficulty} (${difficultyRules[config.difficulty] || 'Orta'})
ADET: ${config.itemCount}
KONULAR: ${config.topics && config.topics.length > 0 ? config.topics.join(', ') : 'Günlük Yaşam'}

REFERANS ÖRNEKLER (Yapı ve kalite referansı):
${exampleStr}

PEDAGOJİK VE DİL KURALLARI:
1. Kesinlikle disleksi dostu, açık, devrik olmayan ve net cümleler kullan.
2. Tanı koyucu ifadeler ("disleksisi var" vb.) asla kullanma. "pedagogicalNote" alanına öğretmene yönelik eğitsel hedefleri yaz.
3. b-d, p-q harf karışıklıklarını tetiklemeyecek net sözcükler seç.
4. ZPD (Yakınsal Gelişim Alanı) uyumunu koru: İlk 2 soru öz güven inşası için kolay, son sorular hedeflenen seviyede olsun.

ETKİNLİK TÜRÜNE GÖRE ITEM YAPISI:
- bosluk_doldurma: { "sentence": "string (boşluk için ……… kullan)", "answer": "string" }
- test: { "question": "string", "options": ["string", "string", "string", "string"], "answer": "string" }
- kelime_tamamlama: { "word": "string (eksik harf için ... kullan)", "fullWord": "string", "clue": "string" }
- karisik_cumle: { "words": ["string", ...], "correctSentence": "string" }
- zit_anlam: { "word": "string", "antonym": "string" }
`;
}
