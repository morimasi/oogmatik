/**
 * Matematik Görsel-Metin Tutarlılık Doğrulayıcı
 *
 * AI tarafından üretilen soru metinleri ile grafik verilerinin
 * tutarlılığını kontrol eder ve otomatik düzeltme önerileri sunar.
 *
 * Bora Demir — Yazılım Mühendisi: TypeScript strict, AppError standardı
 * Dr. Elif Yıldız — Pedagoji: ZPD uyumu doğrulama
 * Dr. Ahmet Kaya — Klinik: MEB standartları doğrulama
 */

import type { MatSoru, GrafikVerisi, GrafikVeriTipi } from '../types/matSinav';
import { AppError } from '../utils/AppError';

// ─── Doğrulama Sonucu Tipi ───────────────────────────────────────

export interface ValidationResult {
    /** Görsel-metin tutarlılığı geçerli mi? */
    isValid: boolean;
    /** Kritik hatalar (düzeltilmezse soru kullanılamaz) */
    errors: string[];
    /** Uyarılar (düzeltilebilir sorunlar) */
    warnings: string[];
    /** Otomatik düzeltme önerileri */
    autoFixes?: Partial<GrafikVerisi>;
    /** Pedagojik uygunluk skoru (0-100) */
    pedagogicalScore?: number;
}

// ─── Ana Doğrulama Fonksiyonu ────────────────────────────────────

/**
 * Tek bir soru için görsel-metin tutarlılığını doğrular.
 *
 * Kontroller:
 * 1. Geometrik şekillerde ölçü tutarlılığı
 * 2. Veri grafiklerinde değer tutarlılığı
 * 3. Koordinat sisteminde nokta tutarlılığı
 * 4. Pisagor teoremi tutarlılığı (dik üçgen)
 * 5. Sınıf seviyesi limitleri
 */
export function validateQuestionVisualConsistency(soru: MatSoru): ValidationResult {
    const { soruMetni, grafik_verisi, zorluk } = soru;
    const errors: string[] = [];
    const warnings: string[] = [];
    let autoFixes: Partial<GrafikVerisi> | undefined;
    let pedagogicalScore = 100;

    // Görsel yoksa kontrol et: Gerekli mi?
    if (!grafik_verisi) {
        return {
            isValid: true,
            errors: [],
            warnings: [],
            pedagogicalScore: 100,
        };
    }

    const { tip, veri, ozellikler } = grafik_verisi;

    // ─── 1. GEOMETRİK ŞEKİLLER: Ölçü Tutarlılığı ─────────────────

    if (['ucgen', 'dik_ucgen', 'kare', 'dikdortgen', 'paralel_kenar', 'daire', 'aci'].includes(tip)) {
        const soruSayilari = extractNumbersFromText(soruMetni);

        // Kenar uzunlukları kontrolü
        if (ozellikler?.kenarlar && Array.isArray(ozellikler.kenarlar)) {
            const gorselKenarlar = ozellikler.kenarlar;

            // Soru metnindeki sayıların görselde olup olmadığını kontrol et
            for (const kenar of gorselKenarlar) {
                if (!soruSayilari.includes(kenar)) {
                    warnings.push(
                        `Görselde kenar değeri ${kenar} var ama soru metninde geçmiyor. ` +
                            `Soru metni: "${soruMetni.substring(0, 100)}..."`
                    );
                    pedagogicalScore -= 10;
                }
            }

            // Kare: Tüm kenarlar eşit olmalı
            if (tip === 'kare') {
                const ilkKenar = gorselKenarlar[0];
                const tumEsit = gorselKenarlar.every((k) => k === ilkKenar);
                if (!tumEsit) {
                    errors.push(`Kare görseli için tüm kenarlar eşit olmalı. Mevcut: [${gorselKenarlar.join(', ')}]`);
                    autoFixes = {
                        ...grafik_verisi,
                        ozellikler: {
                            ...ozellikler,
                            kenarlar: Array(4).fill(ilkKenar),
                        },
                    };
                }
            }

            // Dikdörtgen: Karşılıklı kenarlar eşit olmalı
            if (tip === 'dikdortgen' && gorselKenarlar.length === 4) {
                if (gorselKenarlar[0] !== gorselKenarlar[2] || gorselKenarlar[1] !== gorselKenarlar[3]) {
                    warnings.push(
                        `Dikdörtgende karşılıklı kenarlar eşit olmalı. Mevcut: [${gorselKenarlar.join(', ')}]`
                    );
                    pedagogicalScore -= 5;
                }
            }
        }

        // Açı ölçüleri kontrolü
        if (ozellikler?.acilar && Array.isArray(ozellikler.acilar)) {
            const gorselAcilar = ozellikler.acilar;

            // Üçgen: İç açılar toplamı 180°
            if ((tip === 'ucgen' || tip === 'dik_ucgen') && gorselAcilar.length === 3) {
                const toplam = gorselAcilar.reduce((sum, aci) => sum + aci, 0);
                if (Math.abs(toplam - 180) > 1) {
                    errors.push(`Üçgen iç açıları toplamı 180° olmalı. Mevcut toplam: ${toplam}°`);
                    pedagogicalScore -= 20;
                }
            }

            // Dik üçgen: Bir açı 90° olmalı
            if (tip === 'dik_ucgen') {
                const dikAciVar = gorselAcilar.some((aci) => Math.abs(aci - 90) < 1);
                if (!dikAciVar) {
                    errors.push(`Dik üçgende bir açı 90° olmalı. Mevcut açılar: [${gorselAcilar.join('°, ')}°]`);
                }
            }
        }

        // Daire: Yarıçap kontrolü
        if (tip === 'daire' && ozellikler?.yaricap) {
            if (!soruSayilari.includes(ozellikler.yaricap)) {
                // Çap belirtilmiş olabilir (çap = 2r)
                const cap = ozellikler.yaricap * 2;
                if (!soruSayilari.includes(cap)) {
                    warnings.push(
                        `Dairede yarıçap ${ozellikler.yaricap} veya çap ${cap} soru metninde bulunamadı.`
                    );
                    pedagogicalScore -= 10;
                }
            }
        }
    }

    // ─── 2. DİK ÜÇGEN: Pisagor Teoremi Tutarlılığı ────────────────

    if (tip === 'dik_ucgen' && ozellikler?.kenarlar && ozellikler.kenarlar.length === 3) {
        const kenarlar = [...ozellikler.kenarlar].sort((a, b) => a - b);
        const [a, b, c] = kenarlar; // c en büyük (hipotenüs)
        const pisagorHatasi = Math.abs(a * a + b * b - c * c);

        if (pisagorHatasi > 0.1) {
            warnings.push(
                `Dik üçgen Pisagor teoremini sağlamıyor: ${a}² + ${b}² ≠ ${c}² ` +
                    `(${a * a} + ${b * b} = ${a * a + b * b}, ${c}² = ${c * c})`
            );
            pedagogicalScore -= 15;

            // Otomatik düzeltme: En yakın Pisagor üçlüsünü öner
            const pisagorUcluleri = [
                [3, 4, 5],
                [5, 12, 13],
                [6, 8, 10],
                [7, 24, 25],
                [8, 15, 17],
                [9, 12, 15],
            ];
            const enYakin = pisagorUcluleri.reduce((prev, curr) => {
                const prevFark = Math.abs(prev[2] - c);
                const currFark = Math.abs(curr[2] - c);
                return currFark < prevFark ? curr : prev;
            });

            autoFixes = {
                ...grafik_verisi,
                ozellikler: {
                    ...ozellikler,
                    kenarlar: enYakin,
                },
            };
        }
    }

    // ─── 3. VERİ GRAFİKLERİ: Değer Tutarlılığı ───────────────────

    if (['sutun_grafigi', 'pasta_grafigi', 'cizgi_grafigi', 'siklik_tablosu', 'cetele_tablosu'].includes(tip)) {
        const veriDegerleri = veri.map((v) => v.deger).filter((d): d is number => typeof d === 'number');

        if (veriDegerleri.length === 0) {
            errors.push(`${tip} için veri değerleri eksik. Her veri noktasında "deger" alanı olmalı.`);
            pedagogicalScore -= 30;
        } else {
            // Toplam kontrolü
            const veriToplam = veriDegerleri.reduce((s, v) => s + v, 0);
            const toplamMatch = soruMetni.match(/toplam[ıi]?\s*(\d+)/i);

            if (toplamMatch) {
                const beklenenToplam = parseInt(toplamMatch[1], 10);
                if (Math.abs(veriToplam - beklenenToplam) > 0.01) {
                    errors.push(
                        `Soru metninde toplam ${beklenenToplam} belirtilmiş ama grafik verileri toplamı ${veriToplam}.`
                    );
                    pedagogicalScore -= 25;
                }
            }

            // En az bir veri değerinin soru/seçeneklerde olması
            const soruSayilari = extractNumbersFromText(soruMetni);
            const enAzBirEsleme = veriDegerleri.some((d) => soruSayilari.includes(d));

            if (!enAzBirEsleme) {
                warnings.push(
                    `Grafik değerleri [${veriDegerleri.join(', ')}] soru metninde hiç referans edilmiyor. ` +
                        `Görsel ile soru metni arasında bağlantı kurulamıyor.`
                );
                pedagogicalScore -= 20;
            }

            // Pasta grafiği: Yüzde toplamı kontrolü (eğer yüzde sorusu ise)
            if (tip === 'pasta_grafigi') {
                const yuzdeMatch = soruMetni.match(/%\s*(\d+)/g);
                if (yuzdeMatch && yuzdeMatch.length > 0) {
                    // Veri değerlerinin toplamı 100 olmalı (yüzde sorusunda)
                    if (Math.abs(veriToplam - 100) < 0.01) {
                        // OK - yüzde değerleri toplamı 100
                    } else {
                        warnings.push(
                            `Pasta grafiği yüzde sorusunda veri toplamı 100 olmalı. Mevcut toplam: ${veriToplam}`
                        );
                        pedagogicalScore -= 10;
                    }
                }
            }

            // Çizgi grafiği: Trend kontrolü
            if (tip === 'cizgi_grafigi') {
                const trendMatch = soruMetni.match(/(artı[şs]|azal[ışs]|yükseli[şs]|düşü[şs])/i);
                if (trendMatch) {
                    const trendTip = trendMatch[1].toLowerCase();
                    const artiyorMu = veriDegerleri.every((v, i) => i === 0 || v >= veriDegerleri[i - 1]);
                    const azaliyorMu = veriDegerleri.every((v, i) => i === 0 || v <= veriDegerleri[i - 1]);

                    if ((trendTip.includes('art') || trendTip.includes('yüksel')) && !artiyorMu) {
                        warnings.push(`Soru metninde "artış" deniyor ama grafik değerleri artan sırada değil.`);
                        pedagogicalScore -= 15;
                    }

                    if ((trendTip.includes('azal') || trendTip.includes('düş')) && !azaliyorMu) {
                        warnings.push(`Soru metninde "azalış" deniyor ama grafik değerleri azalan sırada değil.`);
                        pedagogicalScore -= 15;
                    }
                }
            }
        }

        // Kategori sayısı kontrolü (sınıf seviyesi uyumu)
        const kategoriSayisi = veri.length;
        if (kategoriSayisi > 8) {
            warnings.push(
                `Grafik ${kategoriSayisi} kategoriye sahip. ` +
                    `Bilişsel yük açısından maksimum 8 kategori önerilir (disleksi/diskalkuli desteği).`
            );
            pedagogicalScore -= 5;
        }
    }

    // ─── 4. KOORDİNAT SİSTEMİ: Nokta Tutarlılığı ─────────────────

    if (tip === 'koordinat_sistemi' || tip === 'koordinat_grafigi') {
        const noktaPattern = /([A-Z])\s*\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g;
        const soruNoktalar = Array.from(soruMetni.matchAll(noktaPattern));

        for (const match of soruNoktalar) {
            const [, etiket, xStr, yStr] = match;
            const x = parseInt(xStr, 10);
            const y = parseInt(yStr, 10);

            const noktaVar = veri.some(
                (v) => v.etiket === etiket && v.x === x && v.y === y
            );

            if (!noktaVar) {
                errors.push(`Soru metninde ${etiket}(${x},${y}) noktası belirtilmiş ama görselde yok.`);
                pedagogicalScore -= 15;
            }
        }

        // Fonksiyon grafiği: Denklem tutarlılığı
        if (tip === 'koordinat_grafigi') {
            const denklemMatch = soruMetni.match(/y\s*=\s*(-?\d+)x\s*([+\-]\s*\d+)?/i);
            if (denklemMatch) {
                const m = parseInt(denklemMatch[1], 10);
                const b = denklemMatch[2] ? parseInt(denklemMatch[2].replace(/\s/g, ''), 10) : 0;

                // Her nokta denklemi sağlamalı: y = mx + b
                for (const nokta of veri) {
                    if (typeof nokta.x === 'number' && typeof nokta.y === 'number') {
                        const beklenenY = m * nokta.x + b;
                        if (Math.abs(nokta.y - beklenenY) > 0.01) {
                            errors.push(
                                `Nokta ${nokta.etiket || ''}(${nokta.x}, ${nokta.y}) denklemi y=${m}x${b >= 0 ? '+' : ''}${b} sağlamıyor. ` +
                                    `Beklenen y: ${beklenenY}`
                            );
                            pedagogicalScore -= 10;
                        }
                    }
                }
            }
        }
    }

    // ─── 5. SAYI DOĞRUSU: Sıralama Tutarlılığı ────────────────────

    if (tip === 'sayi_dogrusu') {
        const sayilar = veri
            .filter((v) => typeof v.deger === 'number')
            .map((v) => ({ etiket: v.etiket, deger: v.deger as number }));

        // Sayılar soldan sağa ARTAN sırada olmalı
        for (let i = 1; i < sayilar.length; i++) {
            if (sayilar[i].deger < sayilar[i - 1].deger) {
                warnings.push(
                    `Sayı doğrusunda ${sayilar[i - 1].etiket}=${sayilar[i - 1].deger} ve ` +
                        `${sayilar[i].etiket}=${sayilar[i].deger} sıralaması yanlış. ` +
                        `Soldan sağa artan sırada olmalı.`
                );
                pedagogicalScore -= 10;
            }
        }
    }

    // ─── 6. KESİR MODELİ: Payda/Pay Tutarlılığı ──────────────────

    if (tip === 'kesir_modeli') {
        if (ozellikler?.kenarlar && ozellikler.kenarlar.length === 2) {
            const [payda, pay] = ozellikler.kenarlar;

            // Kesir soru metninde geçiyor mu?
            const kesirPattern = /(\d+)\s*\/\s*(\d+)/g;
            const kesirler = Array.from(soruMetni.matchAll(kesirPattern));

            if (kesirler.length > 0) {
                const ilkKesir = kesirler[0];
                const soruPay = parseInt(ilkKesir[1], 10);
                const soruPayda = parseInt(ilkKesir[2], 10);

                if (soruPay !== pay || soruPayda !== payda) {
                    warnings.push(
                        `Soru metninde ${soruPay}/${soruPayda} kesri var ama görselde ${pay}/${payda} gösteriliyor.`
                    );
                    pedagogicalScore -= 20;

                    autoFixes = {
                        ...grafik_verisi,
                        ozellikler: {
                            ...ozellikler,
                            kenarlar: [soruPayda, soruPay],
                        },
                    };
                }
            }
        }
    }

    // ─── 7. ZORLUK-GÖRSEL KARMAŞIKLIĞI UYUMU ─────────────────────

    if (zorluk === 'Kolay') {
        // Kolay sorularda max 4-5 veri noktası olmalı
        if (veri.length > 5) {
            warnings.push(
                `"Kolay" zorlukta ${veri.length} veri noktası çok fazla. ` +
                    `Başarı Anı Mimarisi için maksimum 4-5 önerilir.`
            );
            pedagogicalScore -= 10;
        }
    }

    // ─── SONUÇ ────────────────────────────────────────────────────

    return {
        isValid: errors.length === 0,
        errors,
        warnings,
        autoFixes,
        pedagogicalScore: Math.max(0, pedagogicalScore),
    };
}

// ─── Sınav Geneli Doğrulama ──────────────────────────────────────

export interface ExamValidationReport {
    examId: string;
    totalQuestions: number;
    validQuestions: number;
    invalidQuestions: number;
    averagePedagogicalScore: number;
    criticalErrors: number;
    warnings: number;
    questionReports: Array<{
        soruNo: number;
        soruId: string;
        validation: ValidationResult;
    }>;
}

/**
 * Tüm sınav için görsel-metin tutarlılık raporu oluşturur.
 */
export function generateExamValidationReport(sorular: MatSoru[], examId: string): ExamValidationReport {
    const questionReports = sorular.map((soru, index) => ({
        soruNo: index + 1,
        soruId: soru.id,
        validation: validateQuestionVisualConsistency(soru),
    }));

    const validQuestions = questionReports.filter((r) => r.validation.isValid).length;
    const criticalErrors = questionReports.reduce((sum, r) => sum + r.validation.errors.length, 0);
    const warnings = questionReports.reduce((sum, r) => sum + r.validation.warnings.length, 0);

    const scores = questionReports
        .map((r) => r.validation.pedagogicalScore)
        .filter((s): s is number => typeof s === 'number');
    const averagePedagogicalScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 100;

    return {
        examId,
        totalQuestions: sorular.length,
        validQuestions,
        invalidQuestions: sorular.length - validQuestions,
        averagePedagogicalScore: Math.round(averagePedagogicalScore),
        criticalErrors,
        warnings,
        questionReports,
    };
}

// ─── Yardımcı Fonksiyonlar ───────────────────────────────────────

/**
 * Metin içinden sayıları çıkarır (tam sayı ve ondalık).
 */
function extractNumbersFromText(text: string): number[] {
    const matches = text.match(/\d+([.,]\d+)?/g) || [];
    return matches.map((m) => parseFloat(m.replace(',', '.')));
}

/**
 * Görsel tipi için insan-okunabilir Türkçe ad döndürür.
 */
export function getVisualTypeDisplayName(tip: GrafikVeriTipi): string {
    const names: Record<GrafikVeriTipi, string> = {
        siklik_tablosu: 'Sıklık Tablosu',
        cetele_tablosu: 'Çetele Tablosu',
        sutun_grafigi: 'Sütun Grafiği',
        pasta_grafigi: 'Pasta Grafiği',
        cizgi_grafigi: 'Çizgi Grafiği',
        ucgen: 'Üçgen',
        dik_ucgen: 'Dik Üçgen',
        kare: 'Kare',
        dikdortgen: 'Dikdörtgen',
        paralel_kenar: 'Paralelkenar',
        cokgen: 'Çokgen',
        daire: 'Daire/Çember',
        dogru_parcasi: 'Doğru Parçası',
        aci: 'Açı',
        koordinat_sistemi: 'Koordinat Sistemi',
        koordinat_grafigi: 'Koordinat Grafiği (Fonksiyon)',
        sayi_dogrusu: 'Sayı Doğrusu',
        kesir_modeli: 'Kesir Modeli',
        simetri: 'Simetri',
        venn_diyagrami: 'Venn Diyagramı',
        olaslik_cark: 'Olasılık Çarkı',
    };
    return names[tip] || tip;
}
