/**
 * MatSinavStudyosu — Kazanım Görsel Analiz Testleri
 * analizKazanimGorselleri fonksiyonunun birim testleri
 */

import { describe, it, expect } from 'vitest';
import { analizKazanimGorselleri } from '../src/services/generators/mathSinavGenerator';

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
