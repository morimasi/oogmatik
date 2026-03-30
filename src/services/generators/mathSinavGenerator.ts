/**
 * MatSinavStudyosu — AI Matematik Sınav Generator
 * MEB 1-8. sınıf matematik sınavı üretimi
 * Mevcut sinavGenerator.ts'ye dokunmaz — tamamen bağımsız
 *
 * Selin Arslan: İlkokul/Ortaokul prompt ayrımı, grafik_verisi desteği,
 * Başarı Anı Mimarisi korunacak.
 */

import type {
    MatSinavAyarlari,
    MatSoru,
    MatSinav,
    MatCevapAnahtari,
} from '../../types/matSinav';
import { getMatKazanimByCode } from '../../data/meb-matematik-kazanim';
import { AppError } from '../../utils/AppError';

const MASTER_MODEL = 'gemini-2.5-flash';

// ─── Gemini REST API çağrısı ──────────────────────────────────
const callGeminiDirect = async (prompt: string, schema: object): Promise<unknown> => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        throw new AppError(
            'API anahtarı bulunamadı. Lütfen yönetici ile iletişime geçin.',
            'CONFIG_ERROR',
            500,
            undefined,
            false
        );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MASTER_MODEL}:generateContent?key=${apiKey}`;

    const body = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: schema,
            temperature: 0.45,
        },
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        const msg = (errData as Record<string, unknown>)?.error
            ? String((errData as Record<string, Record<string, string>>).error.message)
            : response.statusText;
        throw new AppError(
            `Gemini API hatası: ${msg}`,
            'GEMINI_API_ERROR',
            502,
            { status: response.status },
            true
        );
    }

    const data = await response.json();
    const text = (data as Record<string, unknown[]>)?.candidates?.[0] as Record<string, unknown> | undefined;
    const textContent = text?.content as Record<string, unknown[]> | undefined;
    const rawText = (textContent?.parts?.[0] as Record<string, string> | undefined)?.text;

    if (!rawText) {
        throw new AppError('Gemini boş yanıt döndürdü.', 'GEMINI_EMPTY_RESPONSE', 502, undefined, true);
    }

    try {
        return JSON.parse(rawText);
    } catch {
        const cleaned = rawText
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/^```json[\s\S]*?\n/, '')
            .replace(/^```\s*/m, '')
            .replace(/```\s*$/m, '')
            .trim();
        return JSON.parse(cleaned);
    }
};

// ─── Prompt Builder ───────────────────────────────────────────
const buildMathExamPrompt = (settings: MatSinavAyarlari): string => {
    const sinif = settings.sinif ?? 5;
    const isIlkokul = sinif <= 5;

    const kazanimBilgileri = settings.secilenKazanimlar
        .map((kod) => {
            const kazanim = getMatKazanimByCode(kod);
            return kazanim ? `${kod}: ${kazanim.tanim} (${kazanim.ogrenmeAlani})` : kod;
        })
        .join('\n');

    const toplamSoru =
        settings.soruDagilimi.coktan_secmeli +
        settings.soruDagilimi.dogru_yanlis +
        settings.soruDagilimi.bosluk_doldurma +
        settings.soruDagilimi.acik_uclu;

    const zorlukTalimat = settings.zorlukSeviyesi === 'Otomatik'
        ? `[BAŞARI ANI MİMARİSİ]
- İlk 2 soru MUTLAKA KOLAY (öğrenciye güven ver)
- 3-4. sorular ORTA
- 5+ soru varsa son sorular ORTA-ZOR`
        : `Tüm sorular "${settings.zorlukSeviyesi}" seviyesinde olmalı.`;

    const stilTalimat = isIlkokul
        ? `[İLKOKUL SORU STİLİ]
- Beceri temelli, ezbere dayalı olmayan sorular
- Günlük hayat senaryoları içeren bağlamlar (market alışverişi, oyun, park,gerçek hayat)
- Basit ve net ifadeler, kısa cümleler
- Görsel destek (şekil, tablo, sayı doğrusu,grafik ) sık kullanılmalı`
        : `[ORTAOKUL / LGS TARZI SORU STİLİ]
- Yeni Nesil sorular: okuduğunu anlama, mantıksal akıl yürütme
- Analitik düşünme gerektiren, çok adımlı problemler
- Gerçek yaşam bağlamları (istatistik, mühendislik, finans, toplum,)
- Çeldirici seçenekler mantıklı ama net yanlış olmalı`;

    return `
[ROL: MEB MATEMATİK SINAV UZMANI + DİSLEKSİ UZMAN ÖĞRETMENİ]

GÖREV: ${sinif}. sınıf MATEMATİK dersi için ${toplamSoru} soruluk sınav hazırla.

[MEB KAZANIM HEDEFLEME]
Aşağıdaki MEB 2024-2025 Matematik kazanımlarını ölç:
${kazanimBilgileri}

${zorlukTalimat}

${stilTalimat}

[SORU DAĞILIMI]
- Çoktan Seçmeli (4 seçenekli A/B/C/D): ${settings.soruDagilimi.coktan_secmeli} adet
- Doğru/Yanlış: ${settings.soruDagilimi.dogru_yanlis} adet
- Boşluk Doldurma: ${settings.soruDagilimi.bosluk_doldurma} adet
- Açık Uçlu: ${settings.soruDagilimi.acik_uclu} adet

${settings.islemSayisi ? `[İŞLEM SAYISI]\nHer soru en fazla ${settings.islemSayisi} işlemle çözülebilmeli.\n` : ''}
${settings.gorselVeriEklensinMi ? `[KRİTİK: GÖRSEL VERİ ZORUNLULUĞU]
🚨 DİKKAT: Kullanıcı görsel veri (grafik/şekil) ZORUNLULUĞU getirdi! 
- Soruların EN AZ %70'inde "grafik_verisi" nesnesini ZORUNLU olarak doldur.
- Koordinat sistemi ise 'veri' içine mutlaka x ve y değerlerini ekle.
- Geometrik şekiller (ucgen, kare, dikdortgen, daire) ise "ozellikler" nesnesini (kenarlar, acilar veya yaricap) mutlaka doldur.
- Sütun ve pasta grafikleri için 'deger' alanını sayısal olarak belirt.
Bu kurala uymamak sınavın geçersiz sayılmasına neden olur!` : ''}
${settings.ozelKonu ? `[TEMA]\nTüm sorular "${settings.ozelKonu}" teması etrafında olmalı.\n` : ''}
${settings.ozelTalimatlar ? `[ÖZEL TALİMATLAR]\n${settings.ozelTalimatlar}\n` : ''}

[DİSLEKSİ UYUMLULUK]
- Sade, net dil, kısa cümleler
- Karmaşık alt alta işlemlerden kaçın
- Hataları bulabileceği ipuçları ver (ama cevabı verme)
- Boşluk doldurmada hepsi aynı uzunlukta "___" kullan

[PUAN VE SÜRE]
- Çoktan seçmeli: 5 puan, ~90 saniye
- Doğru/Yanlış: 5 puan, ~60 saniye
- Boşluk doldurma: 5 puan, ~60 saniye
- Açık uçlu: 10 puan, ~300 saniye

[ÇÖZÜM VE BAĞLAM]
Her soru için:
- gercek_yasam_baglantisi: "Bu soru neden önemli?" kısa açıklama
- cozum_anahtari: Çözümün adımları
- yanlis_secenek_tipleri: Çeldirici mantıkları (çoktan seçmeli için)

UYARI: pedagogicalNote alanı ZORUNLU, en az 100 karakter olmalı.
`;
};

// ─── Response Schema ──────────────────────────────────────────
const MATH_EXAM_SCHEMA = {
    type: 'OBJECT',
    properties: {
        baslik: { type: 'STRING' },
        sorular: {
            type: 'ARRAY',
            items: {
                type: 'OBJECT',
                properties: {
                    id: { type: 'STRING' },
                    tip: {
                        type: 'STRING',
                        enum: ['coktan_secmeli', 'dogru_yanlis', 'bosluk_doldurma', 'acik_uclu'],
                    },
                    zorluk: { type: 'STRING', enum: ['Kolay', 'Orta', 'Zor'] },
                    soruMetni: { type: 'STRING' },
                    secenekler: {
                        type: 'OBJECT',
                        properties: {
                            A: { type: 'STRING' },
                            B: { type: 'STRING' },
                            C: { type: 'STRING' },
                            D: { type: 'STRING' },
                        },
                        nullable: true,
                    },
                    dogruCevap: { type: 'STRING' },
                    kazanimKodu: { type: 'STRING' },
                    puan: { type: 'INTEGER' },
                    tahminiSure: { type: 'INTEGER' },
                    gercek_yasam_baglantisi: { type: 'STRING' },
                    cozum_anahtari: { type: 'STRING' },
                    yanlis_secenek_tipleri: {
                        type: 'ARRAY',
                        items: { type: 'STRING' },
                        nullable: true,
                    },
                    grafik_verisi: {
                        type: 'OBJECT',
                        properties: {
                            tip: { type: 'STRING' },
                            baslik: { type: 'STRING' },
                            veri: {
                                type: 'ARRAY',
                                items: {
                                    type: 'OBJECT',
                                    properties: {
                                        etiket: { type: 'STRING' },
                                        deger: { type: 'NUMBER', nullable: true },
                                        nesne: { type: 'STRING', nullable: true },
                                        birim: { type: 'STRING', nullable: true },
                                        x: { type: 'NUMBER', nullable: true },
                                        y: { type: 'NUMBER', nullable: true },
                                    },
                                    required: ['etiket'],
                                },
                            },
                            not: { type: 'STRING', nullable: true },
                            ozellikler: {
                                type: 'OBJECT',
                                properties: {
                                    kenarlar: { type: 'ARRAY', items: { type: 'NUMBER' }, nullable: true },
                                    acilar: { type: 'ARRAY', items: { type: 'NUMBER' }, nullable: true },
                                    yaricap: { type: 'NUMBER', nullable: true },
                                    renk: { type: 'STRING', nullable: true },
                                },
                                nullable: true
                            }
                        },
                        required: ['tip', 'baslik', 'veri'],
                        nullable: true,
                    },
                },
                required: [
                    'id', 'tip', 'zorluk', 'soruMetni', 'dogruCevap',
                    'kazanimKodu', 'puan', 'tahminiSure',
                    'gercek_yasam_baglantisi', 'cozum_anahtari',
                ],
            },
        },
        pedagogicalNote: { type: 'STRING' },
    },
    required: ['baslik', 'sorular', 'pedagogicalNote'],
};

// ─── Ana Generasyon Fonksiyonu ────────────────────────────────
export const generateMathExam = async (settings: MatSinavAyarlari): Promise<MatSinav> => {
    // Validation
    if (!settings.sinif) {
        throw new AppError('Sınıf seçimi zorunludur.', 'VALIDATION_ERROR', 400, undefined, false);
    }

    if (!Array.isArray(settings.secilenKazanimlar) || settings.secilenKazanimlar.length === 0) {
        throw new AppError(
            'En az bir MEB kazanımı seçilmelidir.',
            'NO_KAZANIM_SELECTED',
            400,
            undefined,
            false
        );
    }

    const toplamSoru =
        settings.soruDagilimi.coktan_secmeli +
        settings.soruDagilimi.dogru_yanlis +
        settings.soruDagilimi.bosluk_doldurma +
        settings.soruDagilimi.acik_uclu;

    if (toplamSoru < 1) {
        throw new AppError('En az 1 soru seçilmelidir.', 'VALIDATION_ERROR', 400, undefined, false);
    }

    const prompt = buildMathExamPrompt(settings);

    try {
        const aiResponse = (await callGeminiDirect(prompt, MATH_EXAM_SCHEMA)) as Record<string, unknown>;

        // pedagogicalNote kontrolü
        if (
            !aiResponse.pedagogicalNote ||
            typeof aiResponse.pedagogicalNote !== 'string' ||
            (aiResponse.pedagogicalNote as string).length < 100
        ) {
            aiResponse.pedagogicalNote =
                `Bu sınav ${settings.sinif}. sınıf Matematik dersi için ${settings.secilenKazanimlar.join(', ')} ` +
                `kazanımlarını ölçmektedir. Başarı Anı Mimarisi ile ilk iki soru öğrencinin motivasyonunu artırmak için ` +
                `kolay tutulmuştur. Öğretmen geri bildiriminde öğrencinin güçlü yönlerini vurgulaması önerilir.`;
        }

        const sorular = aiResponse.sorular as MatSoru[];
        if (!Array.isArray(sorular)) {
            throw new AppError('AI yanıtında soru dizisi bulunamadı.', 'INVALID_AI_RESPONSE', 500, undefined, true);
        }

        // Başarı Anı Mimarisi
        if (settings.zorlukSeviyesi === 'Otomatik' && sorular.length >= 2) {
            sorular[0].zorluk = 'Kolay';
            sorular[1].zorluk = 'Kolay';
        }

        // Cevap anahtarı
        const cevapAnahtari: MatCevapAnahtari = {
            sorular: sorular.map((soru, index) => ({
                soruNo: index + 1,
                dogruCevap: String(soru.dogruCevap),
                puan: soru.puan,
                kazanimKodu: soru.kazanimKodu,
                cozumAciklamasi: soru.cozum_anahtari,
                gercekYasamBaglantisi: soru.gercek_yasam_baglantisi,
                seviye: soru.zorluk,
            })),
        };

        const toplamPuan = sorular.reduce((s, q) => s + (q.puan || 5), 0);
        const tahminiSure = sorular.reduce((s, q) => s + (q.tahminiSure || 90), 0);

        const sinav: MatSinav = {
            id: `mat-exam-${Date.now()}`,
            baslik: (aiResponse.baslik as string) || `${settings.sinif}. Sınıf Matematik Değerlendirme Sınavı`,
            sinif: settings.sinif,
            secilenKazanimlar: settings.secilenKazanimlar,
            sorular,
            toplamPuan,
            tahminiSure,
            olusturmaTarihi: new Date().toISOString(),
            olusturanKullanici: 'system',
            pedagogicalNote: aiResponse.pedagogicalNote as string,
            cevapAnahtari,
        };

        return sinav;
    } catch (error: unknown) {
        if (error instanceof AppError) throw error;

        const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
        throw new AppError(
            'Matematik sınavı oluşturulurken beklenmeyen bir hata oluştu.',
            'MATH_EXAM_GENERATION_ERROR',
            500,
            { originalError: errorMessage },
            true
        );
    }
};

// ─── Tek Soru Yenileme ────────────────────────────────────────
export const regenerateSingleQuestion = async (
    soruIndex: number,
    settings: MatSinavAyarlari,
    mevcutSoru: MatSoru
): Promise<MatSoru> => {
    const kazanim = getMatKazanimByCode(mevcutSoru.kazanimKodu);
    const sinif = settings.sinif ?? 5;

    const prompt = `
[ROL: MEB MATEMATİK SINAV UZMANI]

${sinif}. sınıf için TEK BİR yeni matematik sorusu üret.
Kazanım: ${mevcutSoru.kazanimKodu}: ${kazanim?.tanim ?? ''}
Soru tipi: ${mevcutSoru.tip}
Zorluk: ${mevcutSoru.zorluk}

Önceki sorudan FARKLI bir soru oluştur. Aynı soru veya benzer soru üretme.
Önceki soru: "${mevcutSoru.soruMetni}"

${settings.gorselVeriEklensinMi ? '[GÖRSEL VERİ ZORUNLULUĞU]\n🚨 BU SORUDA MUTLAKA "grafik_verisi" (şekil, tablo veya grafik) nesnesini dolu olarak üret.' : ''}
`;

    const singleSchema = {
        type: 'OBJECT',
        properties: MATH_EXAM_SCHEMA.properties.sorular.items.properties,
        required: MATH_EXAM_SCHEMA.properties.sorular.items.required,
    };

    const result = (await callGeminiDirect(prompt, singleSchema)) as MatSoru;
    result.id = `mat-q-${Date.now()}-${soruIndex}`;
    return result;
};
