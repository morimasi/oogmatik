/**
 * MatProblemStudyosu — Offline Generator & Auto-Answer Merger Smoke Test
 */

import { describe, it, expect } from 'vitest';
import { generateOfflineMatProblemSeti } from '../src/services/offlineGenerators/mathProblemOffline';

describe('MatProblem Offline Generator', () => {
    it('1-8. sınıf için en az 3 problem üretir (default 5)', () => {
        for (const sinif of [1, 2, 3, 4, 5, 6, 7, 8]) {
            const set = generateOfflineMatProblemSeti({
                sinif,
                secilenUniteler: [],
                secilenKazanimlar: [],
                problemSayisi: 5,
                zorlukSeviyesi: 'Otomatik',
                gorselVeriEklensinMi: false,
                kategori: 'gercek-yasam',
                semaTipiTercihi: 'otomatik',
                verilenlerGosterilsinMi: true,
                cozumKutusuGosterilsinMi: true,
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

    it('Sema tipleri MatProblemSemaView renderer listesiyle uyumlu', () => {
        const supportedTypes = new Set([
            'yok',
            'cetele-tablosu', 'siklik-tablosu', 'nesne-grafigi', 'nesne-izgarasi',
            'kutu-modeli', 'sayı-doğrusu', 'kesir-pastasi', 'saat-zaman', 'abakus-basamak',
            'cetvel-olcme', 'oruntu-blok', 'birim-kareli-zemin', 'paralelkenar-yamuk',
            'terazi-denklem', 'iletki-aciolcer', 'lgs-ikili-grafik', 'lgs-alan-modeli',
            'lgs-egim-koordinat', 'lgs-3d-acinim', 'lgs-ebob-ekok', 'lgs-karekok-uslu',
            'lgs-pisagor-ucgen', 'grafik',
        ]);
        const set = generateOfflineMatProblemSeti({
            sinif: 5,
            secilenUniteler: [],
            secilenKazanimlar: [],
            problemSayisi: 10,
            zorlukSeviyesi: 'Otomatik',
            gorselVeriEklensinMi: false,
            kategori: 'gercek-yasam',
            semaTipiTercihi: 'otomatik',
            verilenlerGosterilsinMi: true,
            cozumKutusuGosterilsinMi: true,
        });
        for (const p of set.problemler) {
            expect(supportedTypes.has(p.semaTipi)).toBe(true);
        }
    });

    it('Cevap anahtarı her problem için doldurulmuş', () => {
        const set = generateOfflineMatProblemSeti({
            sinif: 3,
            secilenUniteler: [],
            secilenKazanimlar: [],
            problemSayisi: 5,
            zorlukSeviyesi: 'Otomatik',
            gorselVeriEklensinMi: false,
            kategori: 'gercek-yasam',
            semaTipiTercihi: 'otomatik',
            verilenlerGosterilsinMi: true,
            cozumKutusuGosterilsinMi: true,
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
            sinif: 4,
            secilenUniteler: [],
            secilenKazanimlar: [],
            problemSayisi: 5,
            zorlukSeviyesi: 'Zor',
            gorselVeriEklensinMi: false,
            kategori: 'gercek-yasam',
            semaTipiTercihi: 'otomatik',
            verilenlerGosterilsinMi: true,
            cozumKutusuGosterilsinMi: true,
        });
        // En az bir problem Zor olmalı (rotasyon)
        const zorSayisi = set.problemler.filter((p) => p.zorluk === 'Zor').length;
        expect(zorSayisi).toBeGreaterThan(0);
    });
});
