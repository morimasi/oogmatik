/**
 * Cevap Anahtarı — %100 Dynamic Theme Token Uyumlu
 */

import React from 'react';
import { CevapAnahtari } from '../../types/sinav';

interface CevapAnahtariProps {
  cevapAnahtari: CevapAnahtari;
  sinavBaslik: string;
}

export const CevapAnahtariComponent: React.FC<CevapAnahtariProps> = ({
  cevapAnahtari,
  sinavBaslik
}) => {
  return (
    <div className="bg-[var(--bg-paper)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-2xl p-6 shadow-md">
      <div className="border-b border-[var(--border-color)] pb-4 mb-4">
        <h2 className="text-xl font-black text-[var(--text-primary)] flex items-center gap-2">
          <span className="text-emerald-500">✓</span>
          Cevap Anahtarı
        </h2>
        <p className="text-xs text-[var(--text-muted)] font-medium mt-1">{sinavBaslik}</p>
      </div>

      <div className="space-y-2">
        {cevapAnahtari.sorular.map((cevap) => (
          <div
            key={cevap.soruNo}
            className="flex items-center justify-between p-3 bg-[var(--bg-secondary)]/50 border border-[var(--border-color)]/60 rounded-xl hover:border-emerald-500/40 transition-colors"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm font-black text-[var(--text-primary)] w-10">
                {cevap.soruNo}.
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
