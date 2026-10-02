/**
 * Cevap Anahtarı — %100 Dynamic Theme Token Uyumlu
 * Akışkan multi-column düzen: soru kartları bölünmez (break-inside avoid),
 * sütun sayısı ve kart aralığı PrintConfig'ten akar.
 * KVKK: tanı bilgisi ASLA eklenemez — yalnızca cevap + kazanım kodu + puan.
 */

import React from 'react';
import type { CSSProperties } from 'react';
import {
  CevapAnahtari,
  PrintConfig,
  DEFAULT_PRINT_CONFIG,
  clampQuestionSpacingMm,
} from '../../types/sinav';

interface CevapAnahtariProps {
  cevapAnahtari: CevapAnahtari;
  sinavBaslik: string;
  config?: PrintConfig;
}

/**
 * Cevap anahtarı kapsayıcı + kart stilleri (saf fonksiyon — test edilebilir).
 * CSS multi-column akışı kullanır: kartlar sütunlar arasında doğal dolar,
 * grid yüzünden oluşan büyük boşluklar kalmaz.
 */
export function getCevapAnahtariStiller(config?: PrintConfig): {
  kapsayici: CSSProperties;
  kart: CSSProperties;
} {
  const columns = config?.columns ?? DEFAULT_PRINT_CONFIG.columns;
  const spacingMm = clampQuestionSpacingMm(config?.questionSpacingMm ?? DEFAULT_PRINT_CONFIG.questionSpacingMm);
  return {
    kapsayici: {
      columnCount: columns,
      columnGap: `${spacingMm}mm`,
    },
    kart: {
      breakInside: 'avoid',
      pageBreakInside: 'avoid',
      marginBottom: `${spacingMm}mm`,
    },
  };
}

export const CevapAnahtariComponent: React.FC<CevapAnahtariProps> = ({
  cevapAnahtari,
  sinavBaslik,
  config
}) => {
  const stiller = getCevapAnahtariStiller(config);

  return (
    <div
      className="bg-[var(--bg-paper)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-md"
      style={{ fontFamily: 'Lexend, sans-serif', lineHeight: 1.6 }}
    >
      <div className="border-b border-[var(--border-color)] pb-4 mb-4">
        <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
          <span className="text-emerald-500">✓</span>
          Cevap Anahtarı
        </h2>
        <p className="text-xs text-[var(--text-muted)] font-medium mt-1">{sinavBaslik}</p>
      </div>

      <div style={stiller.kapsayici}>
        {cevapAnahtari.sorular.map((cevap) => (
          <div
            key={cevap.soruNo}
            style={stiller.kart}
            className="flex items-center justify-between p-3 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]/60 rounded-xl hover:border-emerald-500/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span
                aria-label={`Soru ${cevap.soruNo}`}
                className="w-8 h-8 shrink-0 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 text-sm font-black flex items-center justify-center"
              >
                {cevap.soruNo}
              </span>
              <div className="flex-1">
                <div className="font-bold text-xs text-[var(--text-primary)] mb-1">
                  Cevap: <span className="text-emerald-500 font-extrabold">{cevap.dogruCevap}</span>
                </div>
                <div className="text-[10px] text-accent font-mono bg-accent/10 inline-block px-2 py-0.5 rounded">
                  {cevap.kazanimKodu}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-purple-500 bg-purple-500/10 px-2 py-1 rounded-lg">
                {cevap.puan} puan
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Toplam */}
      <div className="mt-6 pt-4 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-wider">Toplam Puan:</span>
          <span className="text-xl font-black text-accent">
            {cevapAnahtari.sorular.reduce((sum, c) => sum + c.puan, 0)} puan
          </span>
        </div>
      </div>
    </div>
  );
};
