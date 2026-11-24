/**
 * MatSinavStudyosu — GraphicRenderer Cebirsel İfade & Null Sanitizasyon Testleri
 * Ekran görüntüsündeki "null" / kırpılmış "nu" ve eksik iç şekil (Minder) hatasının regresyon testleri
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GraphicRenderer } from '../src/components/MatSinavStudyosu/components/GraphicRenderer';
import type { GrafikVerisi } from '../src/types/matSinav';

describe('GraphicRenderer - Cebirsel İfade ve Null Koruması', () => {
    it('ozellikler.kenarlar null içerdiğinde kesinlikle "null" yazmaz ve soruMetni üzerinden kenarları ile Minder planını çıkarır', () => {
        const grafik: GrafikVerisi = {
            tip: 'dikdortgen',
            baslik: 'Antrenman Sahası ve Minder Planı',
            veri: [],
            ozellikler: {
                // Gemini NUMBER şeması yüzünden eskiden [null, null] dönebiliyordu
                kenarlar: [null as unknown as number, null as unknown as number],
                birim: 'm',
            },
        };

        const soruMetni =
            'Bir spor salonu, dikdörtgen şeklindeki bir alanı antrenman sahası olarak kullanmaktadır. ' +
            'Bu sahanın uzun kenarı (4x + 8) metre, kısa kenarı ise (x + 2) metredir. ' +
            'Sahanın ortasına, kenarları sahanın kısa kenarına eşit olan kare şeklinde bir minder yerleştirilmiştir.';

        const html = renderToStaticMarkup(
            <GraphicRenderer grafik={grafik} soruMetni={soruMetni} />
        );

        expect(html).not.toContain('>null<');
        expect(html).not.toContain('null m');
        expect(html).toContain('(4x + 8) m');
        expect(html).toContain('(x + 2) m');
        expect(html).toContain('Minder');
        // Genişletilmiş viewBox kontrolü (etiket kırpılmasını önler)
        expect(html).toContain('viewBox="0 0 290 180"');
    });

    it('ozellikler.kenarlar cebirsel string geldiğinde birimi tekrarlamadan doğru render eder', () => {
        const grafik: GrafikVerisi = {
            tip: 'dikdortgen',
            baslik: 'Bahçe Planı',
            veri: [],
            ozellikler: {
                kenarlar: ['(4x + 8)', '(x + 2)'],
                birim: 'm',
                icSekil: {
                    tip: 'kare',
                    etiket: 'Havuz',
                    kenarlar: ['(x + 2)'],
                },
            },
        };

        const html = renderToStaticMarkup(<GraphicRenderer grafik={grafik} />);

        expect(html).toContain('(4x + 8) m');
        expect(html).toContain('(x + 2) m');
        expect(html).toContain('Havuz');
        expect(html).not.toContain('null');
    });

    it('veri dizisinde deger "null" veya null geldiğinde hiçbir şekil "null" metni üretmez', () => {
        const grafik: GrafikVerisi = {
            tip: 'kare',
            baslik: 'Kare Alan',
            veri: [
                { etiket: 'AB Kenarı', deger: 'null' as unknown as number },
                { etiket: 'BC Kenarı', deger: undefined },
            ],
        };

        const html = renderToStaticMarkup(<GraphicRenderer grafik={grafik} />);
        expect(html).not.toContain('null');
        expect(html).not.toContain('undefined');
    });

    it('daire yarıçapı null geldiğinde r = null yazmaz', () => {
        const grafik: GrafikVerisi = {
            tip: 'daire',
            baslik: 'Daire',
            veri: [],
            ozellikler: {
                yaricap: 'null' as unknown as number,
            },
        };

        const html = renderToStaticMarkup(<GraphicRenderer grafik={grafik} />);
        expect(html).not.toContain('null');
    });
});
