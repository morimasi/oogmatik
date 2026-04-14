import { describe, it, expect } from 'vitest';
import { hecelereAyir, metniHecele } from '../../src/utils/heceAyirici';

describe('heceAyirici — Türkçe hece ayırma motoru', () => {
    it('tekli hece kelime doğru ayırır', () => {
        const result = hecelereAyir('at');
        expect(result).toEqual(['at']);
    });

    it('iki heceli kelimeyi doğru ayırır', () => {
        const result = hecelereAyir('araba');
        expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('üç heceli kelimeyi doğru ayırır', () => {
        const result = hecelereAyir('kalem');
        expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('çok heceli kelimeyi doğru ayırır', () => {
        const result = hecelereAyir('bilgisayar');
        expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('boş string boş dizi döndürür', () => {
        const result = hecelereAyir('');
        expect(result).toEqual([]);
    });

    it('Türkçe karakterleri doğru işler', () => {
        const result = hecelereAyir('çiçek');
        expect(result.length).toBeGreaterThanOrEqual(2);
    });

    it('tek sesli kelime tek hece döndürür', () => {
        const result = hecelereAyir('o');
        expect(result).toEqual(['o']);
    });
});

describe('metniHecele — metin heceleme', () => {
    it('tek kelimeyi HeceRow formatında döndürür', () => {
        const rows = metniHecele('araba');
        expect(rows.length).toBeGreaterThan(0);
        expect(rows[0].syllables).toBeDefined();
        expect(rows[0].syllables.length).toBeGreaterThan(0);
    });

    it('boş metin boş dizi döndürür', () => {
        const rows = metniHecele('');
        expect(rows).toEqual([]);
    });

    it('çok satırlı metin birden fazla row döndürür', () => {
        const rows = metniHecele('Araba gidiyor.\nÇocuk okulda.');
        expect(rows.length).toBe(2);
    });

    it('her syllable objesinde syllable alanı var', () => {
        const rows = metniHecele('kedi');
        rows.forEach((row) => {
            row.syllables.forEach((s) => {
                expect(s).toHaveProperty('syllable');
                expect(typeof s.syllable).toBe('string');
            });
        });
    });
});
