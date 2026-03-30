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
