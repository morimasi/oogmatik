/**
 * MatProblemStudyosu — Offline Generator Smoke Test (v2 — Sema-Free)
 *
 * v2 değişiklikler:
 *  - `MatProblemSemaView` artık yok; sema render testleri kaldırıldı.
 *  - `semaTipi` tipi olmadığı için tip uyumu testi kaldırıldı.
 *  - Problemler artık **tamamen metin tabanlı** (sema/görsel yok).
 *  - `gorselVeriEklensinMi` / `semaTipiTercihi` ayar alanları kaldırıldığı
 *    için yeni ayar imzası kullanılıyor.
 *
 * @vitest-environment jsdom
 */

import { describe, it, expect } from 'vitest';
import { generateOfflineMatProblemSeti } from '../src/services/offlineGenerators/mathProblemOffline';

describe('MatProblem Offline Generator (sema-free)', () => {
    const baseAyarlar = {
        secilenUniteler: [],
        secilenKazanimlar: [],
        zorlukSeviyesi: 'Otomatik' as const,
        kategori: 'gercek-yasam' as const,
        verilenlerGosterilsinMi: true,
        cozumKutusuGosterilsinMi: true,
    };

    it('1-8. sınıf için en az 3 problem üretir (default 5)', () => {
        for (const sinif of [1, 2, 3, 4, 5, 6, 7, 8]) {
            const set = generateOfflineMatProblemSeti({
                ...baseAyarlar,
                sinif,
                problemSayisi: 5,
            });

            expect(set.problemler.length).toBeGreaterThanOrEqual(3);
            expect(set.sinif).toBe(sinif);
            expect(set.problemler.every((p) => p.sinif === sinif)).toBe(true);
            expect(set.problemler.every((p) => p.kazanimKodu.startsWith('M.'))).toBe(true);
            expect(set.problemler.every((p) => p.kazanimMetni && p.kazanimMetni.length > 5)).toBe(true);
            expect(set.problemler.every((p) => p.dogruCevap.length > 0)).toBe(true);
            expect(set.toplamPuan).toBe(set.problemler.length * 10);
        }
    });

    it('Problem metinleri "yukarıdaki tabloya/grafiğe/şemaya bakınız" gibi görsel atıf içermez', () => {
        const set = generateOfflineMatProblemSeti({
            ...baseAyarlar,
            sinif: 5,
            problemSayisi: 10,
        });
        for (const p of set.problemler) {
            const text = (p.soruMetni || '').toLocaleLowerCase('tr-TR');
            expect(text, `soruMetni görsel atıf içeriyor: "${p.soruMetni}"`).not.toMatch(
                /yukarıdaki (tablo|grafik|şema|şekil|çizim|nesne)/
            );
            expect(text, `soruMetni görsel atıf içeriyor: "${p.soruMetni}"`).not.toMatch(
                /aşağıdaki (tablo|grafik|şema|şekil|çizim)/
            );
        }
    });

    it('Cevap anahtarı her problem için doldurulmuş', () => {
        const set = generateOfflineMatProblemSeti({
            ...baseAyarlar,
            sinif: 3,
            problemSayisi: 5,
        });
        expect(set.cevapAnahtari.problemler.length).toBe(set.problemler.length);
        for (let i = 0; i < set.problemler.length; i++) {
            const k = set.cevapAnahtari.problemler[i];
            expect(k.problemNo).toBe(i + 1);
            expect(k.dogruCevap).toBe(set.problemler[i].dogruCevap);
            expect(k.kazanimKodu).toBe(set.problemler[i].kazanimKodu);
        }
    });

    it('Kullanıcı zorluk seviyesi seçtiyse onu uygular', () => {
        const set = generateOfflineMatProblemSeti({
            ...baseAyarlar,
            sinif: 4,
            problemSayisi: 5,
            zorlukSeviyesi: 'Zor',
        });
        // En az bir problem Zor olmalı (rotasyon)
        const zorSayisi = set.problemler.filter((p) => p.zorluk === 'Zor').length;
        expect(zorSayisi).toBeGreaterThan(0);
    });

    it('Problemler MatProblem tipine uyumlu (sema alanları yok)', () => {
        const set = generateOfflineMatProblemSeti({
            ...baseAyarlar,
            sinif: 5,
            problemSayisi: 3,
        });
        for (const p of set.problemler) {
            // sema-related alanlar kaldırıldı; type guard ile kontrol
            expect(p).not.toHaveProperty('semaTipi');
            expect(p).not.toHaveProperty('semaVerisi');
            expect(p).not.toHaveProperty('tabloVerisi');
            expect(p).not.toHaveProperty('grafikVerisi');
            // Zorunlu alanlar hâlâ yerinde
            expect(typeof p.soruMetni).toBe('string');
            expect(Array.isArray(p.verilenler)).toBe(true);
            expect(typeof p.istenenler).toBe('string');
            expect(Array.isArray(p.cozumAdimlari)).toBe(true);
            expect(typeof p.dogruCevap).toBe('string');
            expect(typeof p.gercekYasamBaglantisi).toBe('string');
            expect(typeof p.kazanimKodu).toBe('string');
            expect(typeof p.kategori).toBe('string');
            expect(typeof p.puan).toBe('number');
        }
    });
});
