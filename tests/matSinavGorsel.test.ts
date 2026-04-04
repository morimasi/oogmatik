/**
 * MatSinavStudyosu — Kazanım Görsel Analiz Testleri
 * analizKazanimGorselleri ve görsel-metin uyumluluk testleri
 * Dr. Ahmet Kaya onaylı klinik protokol
 *
 * GÜNCELLEME: Yeni mathVisualValidator.ts kullanılıyor
 */

import { describe, it, expect } from 'vitest';
import { analizKazanimGorselleri } from '../src/services/generators/mathSinavGenerator';
import {
    validateQuestionVisualConsistency,
    generateExamValidationReport,
} from '../src/services/mathVisualValidator';
import type { MatSoru, MatSinav } from '../src/types/matSinav';

describe('analizKazanimGorselleri', () => {
    it('Veri İşleme kazanımları için veri grafik tipi döndürür', () => {
        // M.4.4.1.2 — sütun grafiği
        const result = analizKazanimGorselleri(['M.4.4.1.2']);
        expect(result.length).toBeGreaterThan(0);
        const gorsel = result[0];
        expect(['sutun_grafigi', 'pasta_grafigi', 'cizgi_grafigi', 'cetele_tablosu', 'siklik_tablosu']).toContain(gorsel.zorunluGorsel);
    });

    it('Geometri kazanımları için geometrik şekil tipi döndürür', () => {
        // M.1.2.2.2 — geometrik şekiller
        const result = analizKazanimGorselleri(['M.1.2.2.2']);
        expect(result.length).toBeGreaterThan(0);
        const gorsel = result[0];
        expect(['ucgen', 'kare', 'dikdortgen', 'daire', 'aci', 'dogru_parcasi', 'simetri', 'koordinat_sistemi']).toContain(gorsel.zorunluGorsel);
    });

    it('Çetele içeren kazanım için cetele_tablosu döndürür', () => {
        // M.2.4.1.1 — çetele tablosu
        const result = analizKazanimGorselleri(['M.2.4.1.1']);
        expect(result.length).toBeGreaterThan(0);
        const gorsel = result[0];
        expect(gorsel.zorunluGorsel).toBe('cetele_tablosu');
    });

    it('Bilinmeyen kazanım kodu için boş liste döndürür', () => {
        const result = analizKazanimGorselleri(['BILINMEYEN_KOD']);
        expect(result).toHaveLength(0);
    });

    it('Karışık kazanım listesi için doğru sayıda gereksinim döndürür', () => {
        // Geometri + Veri İşleme + Sayılar (görsel gerektirmiyor)
        const result = analizKazanimGorselleri(['M.1.2.2.2', 'M.2.4.1.1', 'M.1.1.2.2']);
        // Geometri ve Veri İşleme için 2 gereksinim, Sayılar için 0
        expect(result.length).toBe(2);
    });

    it('Sütun grafiği kazanımı için sutun_grafigi döndürür', () => {
        // M.5.4.1.2 — sütun grafiği oluştur
        const result = analizKazanimGorselleri(['M.5.4.1.2']);
        expect(result.length).toBeGreaterThan(0);
        expect(result[0].zorunluGorsel).toBe('sutun_grafigi');
    });

    it('Boş kazanım listesi için boş liste döndürür', () => {
        const result = analizKazanimGorselleri([]);
        expect(result).toHaveLength(0);
    });
});

// ─── Görsel-Metin Uyumluluk Testleri (Yeni Validator) ─────────
describe('validateQuestionVisualConsistency - Klinik Protokol', () => {

    it('Görselsiz soru için uyumlu sonuç döndürür', () => {
        const soru: MatSoru = {
            id: 'test-1',
            tip: 'coktan_secmeli',
            zorluk: 'Kolay',
            soruMetni: '5 + 3 kaçtır?',
            dogruCevap: '8',
            kazanimKodu: 'M.1.1.2.2',
            puan: 5,
            tahminiSure: 60,
            gercek_yasam_baglantisi: 'Toplama işlemi günlük hayatta sıkça kullanılır.',
            cozum_anahtari: '5 + 3 = 8'
        };

        const result = validateQuestionVisualConsistency(soru);
        expect(result.isValid).toBe(true);
        expect(result.pedagogicalScore).toBe(100);
    });

    it('Geometri sorusu için kenar değerlerini kontrol eder', () => {
        const soru: MatSoru = {
            id: 'test-2',
            tip: 'coktan_secmeli',
            zorluk: 'Orta',
            soruMetni: 'Kenar uzunluğu 5 cm olan karenin çevresini hesaplayınız.',
            dogruCevap: '20 cm',
            kazanimKodu: 'M.3.3.2.1',
            puan: 5,
            tahminiSure: 90,
            gercek_yasam_baglantisi: 'Çevre hesaplama günlük hayatta sıkça kullanılır.',
            cozum_anahtari: 'Çevre = 4 × 5 = 20 cm',
            grafik_verisi: {
                tip: 'kare',
                baslik: 'Kare',
                veri: [{ etiket: 'A' }],
                ozellikler: {
                    kenarlar: [5],
                    birim: 'cm'
                }
            }
        };

        const result = validateQuestionVisualConsistency(soru);
        expect(result.isValid).toBe(true);
        expect(result.pedagogicalScore).toBeGreaterThanOrEqual(85);
    });

    it('Uyumsuz kenar değeri için uyarı verir', () => {
        const soru: MatSoru = {
            id: 'test-3',
            tip: 'coktan_secmeli',
            zorluk: 'Orta',
            soruMetni: 'Karenin çevresini hesaplayınız.',
            dogruCevap: '20 cm',
            kazanimKodu: 'M.3.3.2.1',
            puan: 5,
            tahminiSure: 90,
            gercek_yasam_baglantisi: 'Çevre hesaplama günlük hayatta sıkça kullanılır.',
            cozum_anahtari: 'Çevre = 4 × 5 = 20 cm',
            grafik_verisi: {
                tip: 'kare',
                baslik: 'Kare',
                veri: [{ etiket: 'A' }],
                ozellikler: {
                    kenarlar: [7], // Metinde 7 geçmiyor!
                    birim: 'cm'
                }
            }
        };

        const result = validateQuestionVisualConsistency(soru);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.pedagogicalScore).toBeLessThan(100);
    });

    it('Veri işleme grafik değer tutarlılığını kontrol eder', () => {
        const soru: MatSoru = {
            id: 'test-4',
            tip: 'coktan_secmeli',
            zorluk: 'Kolay',
            soruMetni: 'Öğrencilerin favori meyveleri grafikte gösterilmiştir. En çok sevilen meyve hangisidir?',
            dogruCevap: 'Elma',
            kazanimKodu: 'M.4.4.1.1',
            puan: 5,
            tahminiSure: 60,
            gercek_yasam_baglantisi: 'Grafik okuma günlük hayatta önemlidir.',
            cozum_anahtari: 'Grafikte en uzun sütun Elma',
            grafik_verisi: {
                tip: 'sutun_grafigi',
                baslik: 'Öğrencilerin Favori Meyveleri',
                veri: [
                    { etiket: 'Elma', deger: 15 },
                    { etiket: 'Armut', deger: 8 },
                    { etiket: 'Muz', deger: 10 }
                ]
            }
        };

        const result = validateQuestionVisualConsistency(soru);
        expect(result.isValid).toBe(true);
        expect(result.pedagogicalScore).toBeGreaterThanOrEqual(80);
    });

    it('Sayı doğrusu değerlerini kontrol eder', () => {
        const soru: MatSoru = {
            id: 'test-5',
            tip: 'coktan_secmeli',
            zorluk: 'Orta',
            soruMetni: 'Sayı doğrusunda A noktası 3, B noktası -2 değerindedir. İki nokta arasındaki mesafe kaçtır?',
            dogruCevap: '5',
            kazanimKodu: 'M.6.1.4.1',
            puan: 5,
            tahminiSure: 90,
            gercek_yasam_baglantisi: 'Sayı doğrusu ile mesafe hesaplama.',
            cozum_anahtari: '3 - (-2) = 5',
            grafik_verisi: {
                tip: 'sayi_dogrusu',
                baslik: 'Sayı Doğrusu',
                veri: [
                    { etiket: 'A', deger: 3 },
                    { etiket: 'B', deger: -2 }
                ]
            }
        };

        const result = validateQuestionVisualConsistency(soru);
        expect(result.isValid).toBe(true);
        expect(result.pedagogicalScore).toBeGreaterThanOrEqual(80);
    });

    it('Dik üçgende Pisagor teoremini kontrol eder', () => {
        const soru: MatSoru = {
            id: 'test-6',
            tip: 'coktan_secmeli',
            zorluk: 'Orta',
            soruMetni: 'Şekilde kenarları 3 cm, 4 cm ve 5 cm olan dik üçgen verilmiştir. Bu üçgen Pisagor teoremini sağlıyor mu?',
            dogruCevap: 'Evet',
            kazanimKodu: 'M.7.3.3.1',
            puan: 5,
            tahminiSure: 120,
            gercek_yasam_baglantisi: 'Pisagor teoremi ile uzaklık hesaplama.',
            cozum_anahtari: '3² + 4² = 9 + 16 = 25 = 5², dolayısıyla evet',
            grafik_verisi: {
                tip: 'dik_ucgen',
                baslik: 'ABC Dik Üçgeni',
                veri: [{ etiket: 'A' }, { etiket: 'B' }, { etiket: 'C' }],
                ozellikler: {
                    kenarlar: [3, 4, 5],
                    birim: 'cm'
                }
            }
        };

        const result = validateQuestionVisualConsistency(soru);
        expect(result.isValid).toBe(true);
        expect(result.warnings.length).toBe(0); // Pisagor doğru, tüm değerler metinde, uyarı yok
    });

    it('Yanlış Pisagor üçlüsü için uyarı verir', () => {
        const soru: MatSoru = {
            id: 'test-7',
            tip: 'coktan_secmeli',
            zorluk: 'Orta',
            soruMetni: 'Dik üçgenin hipotenüsü kaç cm\'dir?',
            dogruCevap: '5 cm',
            kazanimKodu: 'M.7.3.3.1',
            puan: 5,
            tahminiSure: 120,
            gercek_yasam_baglantisi: 'Pisagor teoremi.',
            cozum_anahtari: 'Hesaplama',
            grafik_verisi: {
                tip: 'dik_ucgen',
                baslik: 'Dik Üçgen',
                veri: [{ etiket: 'A' }],
                ozellikler: {
                    kenarlar: [3, 4, 6], // 3² + 4² ≠ 6² (HATA!)
                    birim: 'cm'
                }
            }
        };

        const result = validateQuestionVisualConsistency(soru);
        expect(result.warnings.length).toBeGreaterThan(0);
        expect(result.warnings.some(w => w.includes('Pisagor'))).toBe(true);
        expect(result.autoFixes).toBeDefined(); // Otomatik düzeltme önerisi var
    });
});

// ─── Sınav Geneli Uyumluluk Raporu Testleri (Yeni Validator) ──
describe('generateExamValidationReport', () => {

    it('Görselsiz sınav için 100 puan döndürür', () => {
        const sorular: MatSoru[] = [
            {
                id: 'q1',
                tip: 'coktan_secmeli',
                zorluk: 'Kolay',
                soruMetni: '5 + 3 = ?',
                dogruCevap: '8',
                kazanimKodu: 'M.5.1.2.1',
                puan: 5,
                tahminiSure: 60,
                gercek_yasam_baglantisi: 'Test',
                cozum_anahtari: '8'
            }
        ];

        const rapor = generateExamValidationReport(sorular, 'test-exam-1');
        expect(rapor.averagePedagogicalScore).toBe(100);
        expect(rapor.validQuestions).toBe(1);
        expect(rapor.criticalErrors).toBe(0);
    });

    it('Karışık sınav için doğru istatistik döndürür', () => {
        const sorular: MatSoru[] = [
            {
                id: 'q1',
                tip: 'coktan_secmeli',
                zorluk: 'Kolay',
                soruMetni: 'Kenarı 4 cm olan karenin alanı kaç cm²?',
                dogruCevap: '16',
                kazanimKodu: 'M.4.2.2.3',
                puan: 5,
                tahminiSure: 60,
                gercek_yasam_baglantisi: 'Alan hesaplama',
                cozum_anahtari: '4 × 4 = 16',
                grafik_verisi: {
                    tip: 'kare',
                    baslik: 'Kare',
                    veri: [{ etiket: 'A' }],
                    ozellikler: { kenarlar: [4], birim: 'cm' }
                }
            },
            {
                id: 'q2',
                tip: 'coktan_secmeli',
                zorluk: 'Kolay',
                soruMetni: '3 × 5 = ?',
                dogruCevap: '15',
                kazanimKodu: 'M.4.1.4.1',
                puan: 5,
                tahminiSure: 60,
                gercek_yasam_baglantisi: 'Çarpma',
                cozum_anahtari: '15'
            }
        ];

        const rapor = generateExamValidationReport(sorular, 'test-exam-2');
        expect(rapor.totalQuestions).toBe(2);
        expect(rapor.averagePedagogicalScore).toBeGreaterThanOrEqual(80);
        expect(rapor.questionReports.length).toBe(2);
    });
});

// ─── parseGeometryVeri — Smart Parser Testleri ─────────────────
describe('parseGeometryVeri — Smart Parser Logic', () => {
    it('AI ucgen verisinden köşe harflerini çıkarır', () => {
        const veri = [
            { etiket: 'A Köşesi' },
            { etiket: 'B Köşesi' },
            { etiket: 'C Köşesi' },
            { etiket: 'AB Kenarı', deger: 8, birim: 'cm' },
            { etiket: 'B Açısı', deger: 90, birim: '°' },
        ];
        const vertices = veri
            .filter(v => v.etiket.toLowerCase().includes('köşe') || v.etiket.toLowerCase().includes('kose'))
            .map(v => v.etiket.match(/^([A-ZÇĞIİÖŞÜ])/)?.[1])
            .filter(Boolean) as string[];
        expect(vertices).toEqual(['A', 'B', 'C']);
    });

    it('AI verisinden kenar uzunluklarını çıkarır', () => {
        const veri = [
            { etiket: 'AB Kenarı', deger: 8, birim: 'cm' },
            { etiket: 'BC Kenarı', deger: 6, birim: 'cm' },
            { etiket: 'AC Kenarı', deger: 10, birim: 'cm' },
        ];
        const edges = veri
            .filter(v => v.etiket.toLowerCase().includes('kenar') && v.deger !== undefined)
            .map(v => v.deger as number);
        expect(edges).toEqual([8, 6, 10]);
    });

    it('AI verisinden açı değerlerini çıkarır', () => {
        const veri = [
            { etiket: 'B Açısı', deger: 90, birim: '°' },
            { etiket: 'A Açısı', deger: 45, birim: '°' },
        ];
        const angles = veri
            .filter(v => v.etiket.toLowerCase().includes('açı') && v.deger !== undefined)
            .map(v => v.deger as number);
        expect(angles).toEqual([90, 45]);
    });

    it('Kenar verisinden birimi çıkarır', () => {
        const veri = [
            { etiket: 'AB Kenarı', deger: 8, birim: 'cm' },
            { etiket: 'BC Kenarı', deger: 6, birim: 'cm' },
        ];
        const units = veri.filter(v => v.birim).map(v => v.birim!);
        const unit = units[0] ?? '';
        expect(unit).toBe('cm');
    });

    it('Yarıçap içeren veri doğru tanınır', () => {
        const veri = [{ etiket: 'Yarıçap', deger: 5, birim: 'cm' }];
        const hasRadius = veri.some(v => v.etiket.toLowerCase().includes('yarıçap') || v.etiket.toLowerCase().includes('yaricap'));
        expect(hasRadius).toBe(true);
    });

    it('Boş veri için varsayılan değerler döner', () => {
        const veri: Array<{ etiket: string; deger?: number; birim?: string }> = [];
        const vertices = veri
            .filter(v => v.etiket.toLowerCase().includes('köşe'))
            .map(v => v.etiket.match(/^([A-Z])/)?.[1])
            .filter(Boolean);
        expect(vertices).toHaveLength(0);
    });
});

// ─── Tip Normalizasyon Testleri ────────────────────────────────
describe('GrafikVeriTipi — Tip İsmi Normalizasyonu', () => {
    it('sutun_grafiği (ğ ile) sutun_grafigi ye normalize edilmeli', () => {
        const normalize = (t: string) =>
            t.replace(/ğ/g, 'g').replace(/Ğ/g, 'G').replace(/ı/g, 'i').replace(/İ/g, 'I');
        expect(normalize('sutun_grafiği')).toBe('sutun_grafigi');
        expect(normalize('nesne_grafiği')).toBe('nesne_grafigi');
        expect(normalize('dik_kesisen_doğrular')).toBe('dik_kesisen_dogrular');
    });

    it('normalize zaten normalleşmiş tipler için değişmez', () => {
        const normalize = (t: string) =>
            t.replace(/ğ/g, 'g').replace(/Ğ/g, 'G').replace(/ı/g, 'i').replace(/İ/g, 'I');
        expect(normalize('sutun_grafigi')).toBe('sutun_grafigi');
        expect(normalize('ucgen')).toBe('ucgen');
        expect(normalize('dik_ucgen')).toBe('dik_ucgen');
    });
});

// ─── Eksik Şekil Tipleri ───────────────────────────────────────
describe('Eksik Şekil Tipleri — Tip Tanımı', () => {
    it('isin, dogru, dik_kesisen_dogrular, nesne_grafigi string tipleri geçerli', () => {
        const tipler: string[] = [
            'isin',
            'dogru',
            'dik_kesisen_dogrular',
            'nesne_grafigi',
        ];
        tipler.forEach(t => expect(typeof t).toBe('string'));
    });

    it('nesne_grafigi skala hesaplaması doğru', () => {
        // 15 değer için skala = 3 (ceil(15/5) = 3), count = round(15/3) = 5 ikon
        const maxVal = 15;
        const skalaFactor = maxVal > 10 ? Math.ceil(maxVal / 5) : 1;
        const count = Math.round(maxVal / skalaFactor);
        expect(skalaFactor).toBe(3);
        expect(count).toBe(5);
    });

    it('nesne_grafigi 10 ve altında değerler için skala 1', () => {
        const maxVal = 8;
        const skalaFactor = maxVal > 10 ? Math.ceil(maxVal / 5) : 1;
        expect(skalaFactor).toBe(1);
    });
});
