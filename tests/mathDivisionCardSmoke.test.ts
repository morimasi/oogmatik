import { describe, it, expect } from 'vitest';
import { getDivisionCardLayout, estimateItemHeight } from '../src/components/MathStudio/utils';
import { DEFAULT_DRILL_CONFIG } from '../src/components/MathStudio/constants';

describe('Bölme kartı taşma koruması', () => {
  it('tek basamaklı bölme 4 sütun hücresine sığar (~179px @28px font)', () => {
    const { leftWidthEm, rightWidthEm, effFontSize } = getDivisionCardLayout(847, 7, 121, 28);
    const totalPx = (leftWidthEm + rightWidthEm) * effFontSize + 8; // +ayraç/padding
    expect(totalPx).toBeLessThan(179);
  });

  it('5 basamaklı sayılarda font küçülür ve genişlik sınırlı kalır', () => {
    const small = getDivisionCardLayout(99999, 99999, 1, 48);
    expect(small.effFontSize).toBeLessThan(48);
    expect(small.effFontSize).toBeGreaterThanOrEqual(12);
    // 4 sütunda bile tek sütun genişliğini aşmamalı (esnek ölçek sonrası ~260px altı)
    const totalPx = (small.leftWidthEm + small.rightWidthEm) * small.effFontSize;
    expect(totalPx).toBeLessThan(320);
  });

  it('çizgi genişliği içerikle orantılıdır (sabit 3em yok)', () => {
    const narrow = getDivisionCardLayout(8, 2, 4, 28);
    const wide = getDivisionCardLayout(8472, 12, 706, 28);
    expect(wide.rightWidthEm).toBeGreaterThan(narrow.rightWidthEm);
    expect(narrow.rightWidthEm).toBeLessThan(2.5); // eski min-w 3em'den dar
  });

  it('bölme kartı yükseklik tahmini kompakt (sayfa hesabı şişmez)', () => {
    const h = estimateItemHeight({ ...DEFAULT_DRILL_CONFIG, selectedOperations: ['div'], fontSize: 28 });
    // 5 satır + padding: 28*5 + 40 = ~180px; eski 7 satırlık ~240px'ten küçük olmalı
    expect(h).toBeLessThan(220);
  });
});
