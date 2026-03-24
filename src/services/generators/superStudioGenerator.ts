import { GenerationMode, SuperStudioDifficulty, GeneratedContentPayload } from '../../types/superStudio';
import { AppError } from '../../utils/AppError';
import { generateWithSchema } from '../geminiClient.js';

interface GenerateParams {
    templates: string[];
    settings: Record<string, any>;
    mode: GenerationMode;
    grade: string | null;
    difficulty: SuperStudioDifficulty;
    studentId: string | null;
}

/**
 * Browser-compatible basit hash fonksiyonu
 * SHA-256 alternatifi olarak FNV-1a hash algoritması kullanır
 */
const simpleHash = (str: string): string => {
    let hash = 2166136261; // FNV offset basis
    for (let i = 0; i < str.length; i++) {
        hash ^= str.charCodeAt(i);
        hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return (hash >>> 0).toString(16).padStart(8, '0');
};

/**
 * Cache key oluşturur (hash tabanlı)
 */
const generateCacheKey = (
    templateId: string,
    settings: any,
    grade: string | null,
    difficulty: SuperStudioDifficulty
): string => {
    const data = JSON.stringify({
        templateId,
        settings,
        grade,
        difficulty
    });
    const hash = simpleHash(data);
    return `super-turkce:${hash}`;
};

/**
 * Şablon tipine göre prompt oluşturur
 */
const buildPromptForTemplate = (
    templateId: string,
    settings: any,
    grade: string | null,
    difficulty: SuperStudioDifficulty
): string => {
    const gradeInfo = grade || 'Orta düzey';

    switch (templateId) {
        case 'okuma-anlama':
            const length = settings.length || 'kisa';
            const questionCount = settings.questionCount || 3;
            const lengthMap = {
                'kisa': '100-150 kelime',
                'orta': '150-250 kelime',
                'uzun': '250-350 kelime'
            };

            return `
[ROL: UZMAN ÖZEL EĞİTİM İÇERİK TASARIMCISI - TÜRKÇE DİL BECERİLERİ]

GÖREV: ${gradeInfo} seviyesinde, "${difficulty}" zorluk derecesinde OKUMA ANLAMA ETKİNLİĞİ üret.

GEREKSINIMLER:
1. Metin Özellikleri:
   - Uzunluk: ${lengthMap[length as keyof typeof lengthMap]}
   - Disleksi dostu: Kısa cümleler (max 12-15 kelime), net anlatım
   - Lexend font kullanımına uygun (1.8+ satır aralığı)
   - İlgi çekici, güncel ve öğrencinin yaşantısına yakın tema

2. Soru Özellikleri:
   - ${questionCount} adet soru (5N1K dağılımlı)
   - İlk soru KOLAY (metin içinde açıkça yazılı bilgi)
   - Orta sorular: çıkarım ve anlam kurma
   - Son soru: metni bütüncül değerlendirme
   - Her sorunun cevabı kısa ve net olmalı

3. Pedagojik Özellikler:
   - ZPD (Yakınsal Gelişim Alanı) uyumlu
   - Başarı odaklı: Öğrenci ilk soruyu mutlaka yapabilmeli
   - Kelime dağarcığı geliştirici

4. Disleksi Tasarım Standartları:
   - Yönerge tek cümle, maksimum 2 cümle
   - Negatif dil YASAK ("yapma", "etme" gibi)
   - Görsel yük minimal

Sınıf: ${gradeInfo}
Zorluk: ${difficulty}

ÇIKTI: Tek bir metin ve ${questionCount} soru içeren etkinlik.
            `;

        case 'dilbilgisi':
            return `
[ROL: UZMAN ÖZEL EĞİTİM İÇERİK TASARIMCISI - DİLBİLGİSİ]

GÖREV: ${gradeInfo} seviyesinde, "${difficulty}" zorluk derecesinde DİLBİLGİSİ ETKİNLİĞİ üret.

GEREKSINIMLER:
1. Konu Seçimi:
   - ${gradeInfo} müfredatına uygun dilbilgisi konusu (isim, fiil, sıfat, zarf, cümle öğeleri, noktalama vb.)
   - Somut örneklerle açıklama

2. Etkinlik Yapısı:
   - Kısa kural hatırlatıcı (2-3 madde)
   - 5-8 adet uygulama sorusu
   - Disleksi dostu: Görsel destek, renkli vurgular önerileri

3. Pedagojik Özellikler:
   - Sarmal öğrenme: Önceki bilgileri pekiştir
   - Adım adım zorluk artışı
   - Başarı hissi uyandıracak ilk örnek

Sınıf: ${gradeInfo}
Zorluk: ${difficulty}

ÇIKTI: Dilbilgisi kuralı + uygulamalı sorular.
            `;

        case 'mantik-muhakeme':
            return `
[ROL: UZMAN ÖZEL EĞİTİM İÇERİK TASARIMCISI - MANTIK VE MUHAKEME]

GÖREV: ${gradeInfo} seviyesinde, "${difficulty}" zorluk derecesinde MANTIK-MUHAKEME ETKİNLİĞİ üret.

GEREKSINIMLER:
1. Aktivite Türü:
   - Mantık problemleri, örüntü tamamlama, sebep-sonuç ilişkileri
   - Sözel ve görsel mantık soruları karışımı

2. Etkinlik Yapısı:
   - 4-6 adet problem
   - Her problemde adım adım düşünme ipuçları
   - Disleksi dostu sunum

3. Pedagojik Özellikler:
   - Bilişsel yük dengelemesi
   - Eleştirel düşünme becerisini geliştirici
   - ZPD uyumlu zorluk

Sınıf: ${gradeInfo}
Zorluk: ${difficulty}

ÇIKTI: Mantık ve muhakeme problemleri seti.
            `;

        case 'yazim-kurallari':
            return `
[ROL: KIDEMLİ TÜRKÇE ÖĞRETMENİ - YAZIM VE NOKTALAMA UZMANI]
MEB 2024-2025 ${gradeInfo} müfredatına tam hakimsin.

[ÖĞRENCİ PROFİLİ]
Tanı: Disleksi desteğine ihtiyaç duyan öğrenci
Yaş Grubu: ${gradeInfo}

[GÖREV]
"${difficulty}" zorluk derecesinde YAZIM KURALLARI VE NOKTALAMA etkinliği üret.

[KISITLAR]
1. Sorular YALNIZCA Türkçe yazım kurallarına odaklanmalı:
   - Büyük-küçük harf kuralları
   - Kesme işareti kullanımı
   - Bitişik-ayrı yazılan kelimeler
   - Noktalama işaretleri (nokta, virgül, soru işareti, ünlem)
2. Her soru için örnek cümle içerisinde uygulama
3. Disleksi dostu: Kısa cümleler (max 12 kelime), net yönergeler
4. Görsel ipuçları önerisi (renk kodlama, vurgulama)
5. İLK 2 SORU MUTLAKA KOLAY (başarı garantisi)
6. Yönergeler max 2 cümle

[ÇIKTI]
8-10 adet yazım/noktalama sorusu, her soru için cevap anahtarı ve kısa kural hatırlatıcı.

Sınıf: ${gradeInfo}
Zorluk: ${difficulty}
            `;

        case 'soz-varligi':
            return `
[ROL: KIDEMLİ TÜRKÇE ÖĞRETMENİ - SÖZ VARLIĞI UZMANI]
MEB 2024-2025 ${gradeInfo} müfredatına tam hakimsin.

[ÖĞRENCİ PROFİLİ]
Tanı: Disleksi desteğine ihtiyaç duyan öğrenci

[GÖREV]
"${difficulty}" zorluk derecesinde SÖZ VARLIĞI (deyim, atasözü, mecaz) etkinliği üret.

[KISITLAR]
1. ${gradeInfo} seviyesine uygun deyimler ve atasözleri seç
2. Her deyim/atasözü için ZORUNLU:
   - Anlamı (kısa, net - max 1 cümle)
   - Örnek cümle (bağlamsal öğrenme)
   - Görsel çağrışım önerisi
3. Disleksi dostu: Somut anlamlar, güncel örnekler
4. Karmaşık mecazlardan kaçın (soyut düşünme yükünü azalt)
5. İLK 2 DEYIM günlük yaşamdan (okul, aile, oyun)

[ÇIKTI]
10-12 adet deyim/atasözü etkinliği, her biri anlam + örnek cümle + görsel ipucu ile.

Sınıf: ${gradeInfo}
Zorluk: ${difficulty}
            `;

        case 'hece-ses':
            return `
[ROL: KIDEMLİ TÜRKÇE ÖĞRETMENİ - FONOLOJİK FARKINDALIK UZMANI]
Disleksi alanında uzmanlaşmış, hece ve ses olaylarına hakim.

[ÖĞRENCİ PROFİLİ]
Tanı: Disleksi - fonolojik farkındalık desteği gerekli

[GÖREV]
"${difficulty}" zorluk derecesinde HECE VE SES OLAYLARI etkinliği üret.

[KISITLAR]
1. Hece ayrıştırma egzersizleri (örn: ka-lem, o-kul)
2. Ses olayları (yumuşama, sertleşme, ses düşmesi, ünlü daralması)
3. Renkli hece vurgulama önerileri (örn: kalEM - vurgulu hece büyük)
4. Multisensory yaklaşım: işitsel + görsel destekli
5. ZPD uyumlu: Basit hecelemeden karmaşık ses olaylarına
6. İLK 3 KELİME 2 heceli, kolay (ma-sa, e-le-ma gibi)

[ÇIKTI]
8-10 adet hece/ses olayları aktivitesi, her kelime için hece ayrımı + ses olayı açıklaması.

Sınıf: ${gradeInfo}
Zorluk: ${difficulty}
            `;

        default:
            return `
[ROL: UZMAN ÖZEL EĞİTİM İÇERİK TASARIMCISI]

GÖREV: ${gradeInfo} seviyesinde, "${difficulty}" zorluk derecesinde "${templateId}" ETKİNLİĞİ üret.

GEREKSINIMLER:
1. MEB müfredatı uyumu
2. Disleksi dostu tasarım (kısa cümleler, net yönergeler)
3. ZPD uyumlu zorluk
4. Pedagojik değer taşıyan içerik

Sınıf: ${gradeInfo}
Zorluk: ${difficulty}

ÇIKTI: ${templateId} etkinliği.
            `;
    }
};

/**
 * Şablon tipine göre Gemini API şeması oluşturur
 */
const buildSchemaForTemplate = (templateId: string): any => {
    // Ortak base şema - tüm şablonlar için geçerli
    const baseSchema = {
        type: 'OBJECT',
        properties: {
            title: { type: 'STRING' },
            content: { type: 'STRING' },
            pedagogicalNote: { type: 'STRING' }
        },
        required: ['title', 'content', 'pedagogicalNote']
    };

    switch (templateId) {
        case 'okuma-anlama':
            return {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING' },
                    text: { type: 'STRING' },
                    questions: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                question: { type: 'STRING' },
                                answer: { type: 'STRING' }
                            },
                            required: ['question', 'answer']
                        }
                    },
                    pedagogicalNote: { type: 'STRING' }
                },
                required: ['title', 'text', 'questions', 'pedagogicalNote']
            };

        case 'dilbilgisi':
            return {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING' },
                    topic: { type: 'STRING' },
                    rules: {
                        type: 'ARRAY',
                        items: { type: 'STRING' }
                    },
                    exercises: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                question: { type: 'STRING' },
                                answer: { type: 'STRING' }
                            },
                            required: ['question', 'answer']
                        }
                    },
                    pedagogicalNote: { type: 'STRING' }
                },
                required: ['title', 'topic', 'rules', 'exercises', 'pedagogicalNote']
            };

        case 'mantik-muhakeme':
            return {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING' },
                    problems: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                question: { type: 'STRING' },
                                hint: { type: 'STRING' },
                                answer: { type: 'STRING' }
                            },
                            required: ['question', 'answer']
                        }
                    },
                    pedagogicalNote: { type: 'STRING' }
                },
                required: ['title', 'problems', 'pedagogicalNote']
            };

        case 'yazim-kurallari':
            return {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING' },
                    topic: { type: 'STRING' },
                    exercises: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                sentence: { type: 'STRING' },
                                question: { type: 'STRING' },
                                correctAnswer: { type: 'STRING' },
                                rule: { type: 'STRING' }
                            },
                            required: ['sentence', 'question', 'correctAnswer']
                        }
                    },
                    pedagogicalNote: { type: 'STRING' },
                    visualHints: {
                        type: 'ARRAY',
                        items: { type: 'STRING' }
                    }
                },
                required: ['title', 'topic', 'exercises', 'pedagogicalNote']
            };

        case 'soz-varligi':
            return {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING' },
                    items: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                phrase: { type: 'STRING' },
                                meaning: { type: 'STRING' },
                                exampleSentence: { type: 'STRING' },
                                visualHint: { type: 'STRING' }
                            },
                            required: ['phrase', 'meaning', 'exampleSentence']
                        }
                    },
                    pedagogicalNote: { type: 'STRING' }
                },
                required: ['title', 'items', 'pedagogicalNote']
            };

        case 'hece-ses':
            return {
                type: 'OBJECT',
                properties: {
                    title: { type: 'STRING' },
                    activities: {
                        type: 'ARRAY',
                        items: {
                            type: 'OBJECT',
                            properties: {
                                word: { type: 'STRING' },
                                syllables: {
                                    type: 'ARRAY',
                                    items: { type: 'STRING' }
                                },
                                soundEvent: { type: 'STRING' },
                                colorHint: { type: 'STRING' }
                            },
                            required: ['word', 'syllables']
                        }
                    },
                    pedagogicalNote: { type: 'STRING' }
                },
                required: ['title', 'activities', 'pedagogicalNote']
            };

        default:
            return baseSchema;
    }
};

/**
 * AI yanıtını A4 içeriğine dönüştürür
 * Defensive coding: Tüm alanların varlığını kontrol eder
 */
const formatContentForA4 = (templateId: string, aiResponse: any): string => {
    // Null/undefined check
    if (!aiResponse || typeof aiResponse !== 'object') {
        console.error('AI yanıtı geçersiz:', aiResponse);
        return '[HATA] AI yanıtı beklenmeyen formatta döndü.';
    }

    switch (templateId) {
        case 'okuma-anlama':
            // Defensive: questions array kontrolü
            if (!Array.isArray(aiResponse.questions) || aiResponse.questions.length === 0) {
                console.error('okuma-anlama: questions dizisi bulunamadı veya boş', aiResponse);
                return `${aiResponse.text || '[Metin eksik]'}\n\n📝 SORULAR:\n\n[Sorular üretilemedi - AI yanıtında 'questions' alanı bulunamadı]`;
            }

            const questions = aiResponse.questions
                .map((q: any, i: number) => {
                    const question = q?.question || '[Soru metni eksik]';
                    const answer = q?.answer || '[Cevap eksik]';
                    return `${i + 1}. ${question}\n   Cevap: ${answer}`;
                })
                .join('\n\n');
            return `${aiResponse.text || '[Metin eksik]'}\n\n📝 SORULAR:\n\n${questions}`;

        case 'dilbilgisi':
            // Defensive: rules ve exercises array kontrolü
            if (!Array.isArray(aiResponse.rules) || aiResponse.rules.length === 0) {
                console.error('dilbilgisi: rules dizisi bulunamadı veya boş', aiResponse);
            }
            if (!Array.isArray(aiResponse.exercises) || aiResponse.exercises.length === 0) {
                console.error('dilbilgisi: exercises dizisi bulunamadı veya boş', aiResponse);
            }

            const rules = Array.isArray(aiResponse.rules)
                ? aiResponse.rules.map((r: string, i: number) => `${i + 1}. ${r || '[Kural eksik]'}`).join('\n')
                : '[Kurallar üretilemedi]';

            const exercises = Array.isArray(aiResponse.exercises)
                ? aiResponse.exercises.map((e: any, i: number) => {
                    const question = e?.question || '[Soru metni eksik]';
                    const answer = e?.answer || '[Cevap eksik]';
                    return `${i + 1}. ${question}\n   Cevap: ${answer}`;
                }).join('\n\n')
                : '[Alıştırmalar üretilemedi]';

            return `📌 ${aiResponse.topic || '[Konu belirtilmedi]'}\n\n✅ KURALLAR:\n${rules}\n\n📝 ALIŞTIRMALAR:\n\n${exercises}`;

        case 'mantik-muhakeme':
            // Defensive: problems array kontrolü
            if (!Array.isArray(aiResponse.problems) || aiResponse.problems.length === 0) {
                console.error('mantik-muhakeme: problems dizisi bulunamadı veya boş', aiResponse);
                return `🧩 MANTIK VE MUHAKEME\n\n[Problemler üretilemedi - AI yanıtında 'problems' alanı bulunamadı]`;
            }

            const problems = aiResponse.problems
                .map((p: any, i: number) => {
                    const question = p?.question || '[Problem metni eksik]';
                    const answer = p?.answer || '[Cevap eksik]';
                    const hint = p?.hint ? `\n   💡 İpucu: ${p.hint}` : '';
                    return `${i + 1}. ${question}${hint}\n   Cevap: ${answer}`;
                })
                .join('\n\n');
            return `🧩 MANTIK VE MUHAKEME\n\n${problems}`;

        case 'yazim-kurallari':
            // Defensive: exercises array kontrolü
            if (!Array.isArray(aiResponse.exercises) || aiResponse.exercises.length === 0) {
                console.error('yazim-kurallari: exercises dizisi bulunamadı veya boş', aiResponse);
                return `📝 ${aiResponse.topic || '[Konu belirtilmedi]'}\n\n[Alıştırmalar üretilemedi - AI yanıtında 'exercises' alanı bulunamadı]`;
            }

            const visualHints = Array.isArray(aiResponse.visualHints) && aiResponse.visualHints.length > 0
                ? `\n\n🎨 Görsel İpuçları:\n${aiResponse.visualHints.map((h: string, i: number) => `${i + 1}. ${h || '[İpucu eksik]'}`).join('\n')}`
                : '';
            const yazimExercises = aiResponse.exercises
                .map((e: any, i: number) => {
                    const sentence = e?.sentence || '[Cümle eksik]';
                    const question = e?.question || '[Soru eksik]';
                    const correctAnswer = e?.correctAnswer || '[Cevap eksik]';
                    const rule = e?.rule || 'Yukarıdaki kurallara bak';
                    return `${i + 1}. ${sentence}\n   ❓ ${question}\n   ✅ ${correctAnswer}\n   📌 Kural: ${rule}`;
                })
                .join('\n\n');
            return `📝 ${aiResponse.topic || '[Konu belirtilmedi]'}\n\n✍️ ALIŞTIRMALAR:\n\n${yazimExercises}${visualHints}`;

        case 'soz-varligi':
            // Defensive: items array kontrolü
            if (!Array.isArray(aiResponse.items) || aiResponse.items.length === 0) {
                console.error('soz-varligi: items dizisi bulunamadı veya boş', aiResponse);
                return `🗣️ SÖZ VARLIĞI\n\n[İçerik üretilemedi - AI yanıtında 'items' alanı bulunamadı]`;
            }

            const phraseItems = aiResponse.items
                .map((item: any, i: number) => {
                    const phrase = item?.phrase || '[Deyim/Atasözü eksik]';
                    const meaning = item?.meaning || '[Anlam eksik]';
                    const exampleSentence = item?.exampleSentence || '[Örnek cümle eksik]';
                    const visual = item?.visualHint ? `\n   🎨 ${item.visualHint}` : '';
                    return `${i + 1}. "${phrase}"\n   💬 Anlamı: ${meaning}\n   📖 Örnek: ${exampleSentence}${visual}`;
                })
                .join('\n\n');
            return `🗣️ SÖZ VARLIĞI\n\n${phraseItems}`;

        case 'hece-ses':
            // Defensive: activities array kontrolü
            if (!Array.isArray(aiResponse.activities) || aiResponse.activities.length === 0) {
                console.error('hece-ses: activities dizisi bulunamadı veya boş', aiResponse);
                return `🔤 HECE VE SES OLAYLARI\n\n[Aktiviteler üretilemedi - AI yanıtında 'activities' alanı bulunamadı]`;
            }

            const heceActivities = aiResponse.activities
                .map((act: any, i: number) => {
                    const word = act?.word || '[Kelime eksik]';
                    const syllables = Array.isArray(act?.syllables) && act.syllables.length > 0
                        ? act.syllables.join('-')
                        : '[Hece ayrımı eksik]';
                    const soundEvent = act?.soundEvent ? `\n   🔊 Ses Olayı: ${act.soundEvent}` : '';
                    const colorHint = act?.colorHint ? `\n   🎨 Renk İpucu: ${act.colorHint}` : '';
                    return `${i + 1}. ${word} → ${syllables}${soundEvent}${colorHint}`;
                })
                .join('\n\n');
            return `🔤 HECE VE SES OLAYLARI\n\n${heceActivities}`;

        default:
            return aiResponse.content || JSON.stringify(aiResponse, null, 2);
    }
};

/**
 * Super Türkçe Stüdyosu için AI destekli içerik üretici
 */
export const generateSuperStudioContent = async (
    params: GenerateParams
): Promise<GeneratedContentPayload[]> => {
    try {
        const { templates, settings, mode, grade, difficulty } = params;

        if (!templates || templates.length === 0) {
            throw new AppError('En az bir şablon seçilmelidir.', 'NO_TEMPLATE_SELECTED', 400, undefined, false);
        }

        const results: GeneratedContentPayload[] = [];

        // Fast mode: Offline/mock üretim (maliyet sıfır, hızlı)
        if (mode === 'fast') {
            for (const tpl of templates) {
                await new Promise(resolve => setTimeout(resolve, 300));

                results.push({
                    id: `gen-${Date.now()}-${tpl}`,
                    templateId: tpl,
                    pages: [
                        {
                            title: `${tpl === 'okuma-anlama' ? '📚 Okuma Anlama Parçası' : tpl.replace('-', ' ').toUpperCase()} Etkinliği`,
                            content: `[HIZLI MOD - ÖRNEKLENDİRME]\n\n${grade || 'Orta Düzey'} / ${difficulty} Zorluk\n\nBu içerik, hızlı mod için örnek içeriktir. Gerçek içerik üretimi için "AI Mod (Gemini)" seçeneğini kullanın.\n\nHızlı modda deterministik şablonlar kullanılır ve maliyet sıfırdır. Öğretmen tarafından manuel düzenleme yapılabilir.`,
                            pedagogicalNote: `Hızlı mod: ${tpl} aktivitesi için temel şablon üretildi. AI Mod ile pedagojik açıdan optimize edilmiş içerik alabilirsiniz.`
                        }
                    ],
                    createdAt: Date.now()
                });
            }
            return results;
        }

        // AI mode: Gemini ile gerçek içerik üretimi (paralel batch optimizasyonu + cache)

        // Cache kontrolü (IndexedDB - opsiyonel, hata durumunda devam et)
        let cacheService: any = null;

        // Browser environment kontrolü
        const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

        if (isBrowser) {
            try {
                // Dynamic import ile cacheService'i al
                const { default: CacheService } = await import('../cacheService.js');
                cacheService = CacheService;
            } catch (e) {
                console.warn('[Super Türkçe] Cache servisi yüklenemedi, cache atlanıyor.', e);
            }
        }

        // Cache'ten kontrol et
        const cachedResults: GeneratedContentPayload[] = [];
        let remainingTemplates = [...templates];

        if (cacheService) {
            for (const tpl of templates) {
                const templateSettings = settings[tpl] || {};
                const cacheKey = generateCacheKey(tpl, templateSettings, grade, difficulty);

                try {
                    const cached = await cacheService.get(cacheKey);
                    if (cached) {
                        cachedResults.push({
                            ...cached,
                            id: `cache-${Date.now()}-${tpl}`,
                            fromCache: true
                        });
                        remainingTemplates = remainingTemplates.filter(t => t !== tpl);
                        console.log(`[Super Türkçe] Cache hit: ${tpl}`);
                    }
                } catch (e) {
                    console.warn(`[Super Türkçe] Cache okuma hatası (${tpl}):`, e);
                }
            }
        }

        // Cache'te olmayanlar için API çağrısı yap
        const promises = remainingTemplates.map(async (tpl) => {
            const templateSettings = settings[tpl] || {};
            const prompt = buildPromptForTemplate(tpl, templateSettings, grade, difficulty);
            const schema = buildSchemaForTemplate(tpl);

            try {
                const aiResponse = await generateWithSchema(prompt, schema);

                // Validate AI response structure
                if (!aiResponse) {
                    throw new Error('AI yanıtı boş döndü');
                }

                // Log response for debugging if validation fails later
                console.log(`AI yanıtı alındı (${tpl}):`, {
                    hasTitle: !!aiResponse.title,
                    hasPedagogicalNote: !!aiResponse.pedagogicalNote,
                    keys: Object.keys(aiResponse)
                });

                const content = formatContentForA4(tpl, aiResponse);

                // Ensure pedagogicalNote exists (critical requirement)
                const pedagogicalNote = aiResponse.pedagogicalNote ||
                    `${tpl} etkinliği üretildi. Öğretmen tarafından gözden geçirilmesi önerilir.`;

                const payload: GeneratedContentPayload = {
                    id: `gen-${Date.now()}-${tpl}`,
                    templateId: tpl,
                    pages: [
                        {
                            title: aiResponse.title || `${tpl.replace('-', ' ').toUpperCase()} Etkinliği`,
                            content: content,
                            pedagogicalNote: pedagogicalNote
                        }
                    ],
                    createdAt: Date.now()
                };

                // Cache'e kaydet (async, bekleme)
                if (cacheService) {
                    const cacheKey = generateCacheKey(tpl, templateSettings, grade, difficulty);
                    try {
                        await cacheService.set(cacheKey, payload);
                        console.log(`[Super Türkçe] Cache yazıldı: ${tpl}`);
                    } catch (e) {
                        console.warn(`[Super Türkçe] Cache yazma hatası (${tpl}):`, e);
                    }
                }

                return {
                    success: true,
                    templateId: tpl,
                    data: payload
                };
            } catch (apiError: any) {
                // AI hatası durumunda daha detaylı hata mesajı
                const errorDetails = apiError?.message || 'Bilinmeyen hata';
                console.error(`AI üretim hatası (${tpl}):`, {
                    error: errorDetails,
                    stack: apiError?.stack,
                    response: apiError?.response
                });

                throw new AppError(
                    `${tpl} şablonu için AI üretimi başarısız: ${errorDetails}`,
                    'AI_GENERATION_FAILED',
                    500,
                    apiError,
                    true
                );
            }
        });

        // Promise.allSettled ile tüm sonuçları bekle (partial success)
        const settled = await Promise.allSettled(promises);

        // Başarılı sonuçları topla
        const successes = settled
            .filter((r): r is PromiseFulfilledResult<{success: true, data: any}> =>
                r.status === 'fulfilled' && r.value.success
            )
            .map(r => r.value.data);

        // Cache'ten gelenleri ekle
        const allResults = [...cachedResults, ...successes];

        // Başarısız olanları logla
        const failures = settled.filter((r): boolean =>
            r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success)
        );

        if (failures.length > 0) {
            console.error(`[Super Türkçe] ${failures.length}/${templates.length} şablon başarısız oldu.`, failures);
        }

        // Hiç başarılı olmazsa hata fırlat
        if (allResults.length === 0) {
            throw new AppError(
                'Tüm şablonlar için üretim başarısız oldu. Lütfen tekrar deneyin.',
                'BATCH_GENERATION_FAILED',
                500,
                { failures },
                true
            );
        }

        return allResults;
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        throw new AppError('Üretim sırasında beklenmeyen bir hata oluştu.', 'GENERATOR_ERROR', 500, error, true);
    }
};
