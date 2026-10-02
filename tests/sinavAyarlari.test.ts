import { describe, it, expect } from 'vitest';
import {
  DEFAULT_PRINT_CONFIG,
  MIN_QUESTION_SPACING_MM,
  MAX_QUESTION_SPACING_MM,
  clampQuestionSpacingMm,
  clampColumns,
  normalizePrintConfig,
  isSoru,
  isSinav,
  isCevapAnahtariSorusu,
  normalizeDogruCevap,
} from '../src/types/sinav';
import { getCevapAnahtariStiller } from '../src/components/SinavStudyosu/CevapAnahtari';

describe('Sınav Stüdyosu — ayar varsayılanları (Elif Yıldız / ZPD)', () => {
  it('DEFAULT_PRINT_CONFIG disleksi dostu baskı varsayılanlarını taşır', () => {
    expect(DEFAULT_PRINT_CONFIG.columns).toBe(2);
    expect(DEFAULT_PRINT_CONFIG.questionSpacingMm).toBe(8);
    expect(DEFAULT_PRINT_CONFIG.fontSize).toBe(10);
    expect(DEFAULT_PRINT_CONFIG.lineHeight).toBe(1.6);
    expect(DEFAULT_PRINT_CONFIG.textAlign).toBe('left');
    expect(DEFAULT_PRINT_CONFIG.marginMm).toBe(18);
  });

  it('soru aralığı bandı 4–14mm olarak tanımlıdır', () => {
    expect(MIN_QUESTION_SPACING_MM).toBe(4);
    expect(MAX_QUESTION_SPACING_MM).toBe(14);
  });
});

describe('PrintConfig tipleri — normalize + clamp (Kaan Arslan / any yasak)', () => {
  it('clampQuestionSpacingMm bant dışını ve geçersiz girdiyi düzeltir', () => {
    expect(clampQuestionSpacingMm(4)).toBe(4);
    expect(clampQuestionSpacingMm(14)).toBe(14);
    expect(clampQuestionSpacingMm(2)).toBe(4);
    expect(clampQuestionSpacingMm(99)).toBe(14);
    expect(clampQuestionSpacingMm(undefined)).toBe(DEFAULT_PRINT_CONFIG.questionSpacingMm);
    expect(clampQuestionSpacingMm('8' as unknown)).toBe(DEFAULT_PRINT_CONFIG.questionSpacingMm);
    expect(clampQuestionSpacingMm(NaN)).toBe(DEFAULT_PRINT_CONFIG.questionSpacingMm);
  });

  it('clampColumns yalnızca 1|2 kabul eder', () => {
    expect(clampColumns(1)).toBe(1);
    expect(clampColumns(2)).toBe(2);
    expect(clampColumns(3 as unknown)).toBe(DEFAULT_PRINT_CONFIG.columns);
    expect(clampColumns('2' as unknown)).toBe(DEFAULT_PRINT_CONFIG.columns);
    expect(clampColumns(undefined)).toBe(DEFAULT_PRINT_CONFIG.columns);
  });

  it('normalizePrintConfig bozuk girdiden güvenli config üretir', () => {
    expect(normalizePrintConfig(undefined)).toEqual(DEFAULT_PRINT_CONFIG);
    expect(normalizePrintConfig(null)).toEqual(DEFAULT_PRINT_CONFIG);
    expect(normalizePrintConfig('x')).toEqual(DEFAULT_PRINT_CONFIG);

    const fixed = normalizePrintConfig({ columns: 5, questionSpacingMm: 1, fontFamily: 'comic' });
    expect(fixed.columns).toBe(DEFAULT_PRINT_CONFIG.columns);
    expect(fixed.questionSpacingMm).toBe(MIN_QUESTION_SPACING_MM);
    expect(fixed.fontFamily).toBe(DEFAULT_PRINT_CONFIG.fontFamily);
  });

  it('normalizePrintConfig geçerli değerleri korur', () => {
    const cfg = normalizePrintConfig({ ...DEFAULT_PRINT_CONFIG, columns: 1, questionSpacingMm: 12 });
    expect(cfg.columns).toBe(1);
    expect(cfg.questionSpacingMm).toBe(12);
  });
});

describe('Soru / Sınav / CevapAnahtari tip guardları (Dr. Ahmet Kaya / MEB)', () => {
  const gecerliSoru = {
    id: 's1',
    tip: 'coktan-secmeli',
    zorluk: 'Kolay',
    soruMetni: 'Ana fikir nedir?',
    secenekler: ['A', 'B', 'C', 'D'],
    dogruCevap: 'A',
    kazanimKodu: 'T.5.3.7',
    puan: 10,
    tahminiSure: 60,
  };

  it('isSoru geçerli soruyu kabul eder, secenekler opsiyoneldir', () => {
    expect(isSoru(gecerliSoru)).toBe(true);
    const { secenekler: _dropped, ...seceneksiz } = gecerliSoru;
    expect(isSoru(seceneksiz)).toBe(true);
    expect(isSoru({ ...gecerliSoru, soruMetni: 42 })).toBe(false);
    expect(isSoru(null)).toBe(false);
  });

  it('isSinav sınav bütünlüğünü denetler', () => {
    const sinav = {
      id: 'e1',
      baslik: 'Türkçe Sınavı',
      sinif: 5,
      secilenKazanimlar: ['T.5.3.7'],
      sorular: [gecerliSoru],
      toplamPuan: 10,
      tahminiSure: 60,
      olusturmaTarihi: '2026-01-01',
      olusturanKullanici: 'ogretmen-1',
      cevapAnahtari: { sorular: [] },
    };
    expect(isSinav(sinav)).toBe(true);
    expect(isSinav({ ...sinav, sorular: [{ ...gecerliSoru, puan: 'on' }] })).toBe(false);
    expect(isSinav(undefined)).toBe(false);
  });

  it('isCevapAnahtariSorusu satır şeklini denetler (tanı alanı yok)', () => {
    const satir = { soruNo: 1, dogruCevap: 'B', puan: 10, kazanimKodu: 'T.5.3.7' };
    expect(isCevapAnahtariSorusu(satir)).toBe(true);
    expect('tani' in satir).toBe(false);
    expect(isCevapAnahtariSorusu({ ...satir, dogruCevap: 3 })).toBe(false);
  });

  it('normalizeDogruCevap string|number dışını boş dizeye indirger', () => {
    expect(normalizeDogruCevap('C')).toBe('C');
    expect(normalizeDogruCevap(2)).toBe('2');
    expect(normalizeDogruCevap(undefined)).toBe('');
    expect(normalizeDogruCevap({})).toBe('');
  });
});

describe('Cevap anahtarı akışkan stil (grid boşluğu yok)', () => {
  it('varsayılan config 2 sütun + 8mm aralık üretir', () => {
    const s = getCevapAnahtariStiller(undefined);
    expect(s.kapsayici.columnCount).toBe(2);
    expect(s.kapsayici.columnGap).toBe('8mm');
    expect(s.kart.breakInside).toBe('avoid');
    expect(s.kart.marginBottom).toBe('8mm');
  });

  it('tek sütun + özel aralık aynen yansır', () => {
    const s = getCevapAnahtariStiller({ ...DEFAULT_PRINT_CONFIG, columns: 1, questionSpacingMm: 12 });
    expect(s.kapsayici.columnCount).toBe(1);
    expect(s.kapsayici.columnGap).toBe('12mm');
    expect(s.kart.marginBottom).toBe('12mm');
  });

  it('kartlar baskıda bölünmez (page-break-inside avoid)', () => {
    const s = getCevapAnahtariStiller(DEFAULT_PRINT_CONFIG);
    expect(s.kart.pageBreakInside).toBe('avoid');
  });
});
