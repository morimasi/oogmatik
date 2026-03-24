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

        // AI mode: Gemini ile gerçek içerik üretimi
        for (const tpl of templates) {
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

                results.push({
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
                });
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
        }

        return results;
    } catch (error: any) {
        if (error instanceof AppError) throw error;
        throw new AppError('Üretim sırasında beklenmeyen bir hata oluştu.', 'GENERATOR_ERROR', 500, error, true);
    }
};
