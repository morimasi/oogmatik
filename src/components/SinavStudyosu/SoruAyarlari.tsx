/**
 * Soru Ayarları - Ultra-Premium SaaS Question Distribution & Settings
 */

import React from 'react';
import { SinavAyarlari } from '../../types/sinav';

interface SoruAyarlariProps {
  ayarlar: SinavAyarlari;
  onSoruDagilimiChange: (tip: keyof SinavAyarlari['soruDagilimi'], sayi: number) => void;
  onOzelKonuChange: (konu: string) => void;
}

export const SoruAyarlari: React.FC<SoruAyarlariProps> = ({
  ayarlar,
  onSoruDagilimiChange,
  onOzelKonuChange
}) => {
  const toplamSoru =
    ayarlar.soruDagilimi['coktan-secmeli'] +
    ayarlar.soruDagilimi['dogru-yanlis-duzeltme'] +
    ayarlar.soruDagilimi['bosluk-doldurma'] +
    ayarlar.soruDagilimi['acik-uclu'];

  const soruTipleri: Array<{
    key: keyof SinavAyarlari['soruDagilimi'];
    label: string;
    icon: string;
    description: string;
  }> = [
      {
        key: 'coktan-secmeli',
        label: 'Çoktan Seçmeli',
        icon: '📝',
        description: '4 Seçenekli Test'
      },
      {
        key: 'dogru-yanlis-duzeltme',
        label: 'Doğru-Yanlış',
        icon: '✓✗',
        description: 'D/Y ve Düzeltmeli Metin'
      },
      {
        key: 'bosluk-doldurma',
        label: 'Boşluk Doldurma',
        icon: '📄',
        description: 'Eksik Kelimeleri Tamamlama'
      },
      {
        key: 'acik-uclu',
        label: 'Açık Uçlu',
        icon: '✍️',
        description: 'Serbest Yanıtlı Okuma-Anlama'
      }
    ];

  return (
    <div className="space-y-3 text-[var(--text-primary)]">

      {/* Soru Dağılımı (Compact SaaS Grid) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] opacity-80">Soru Tipleri & Dağılımı</span>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${toplamSoru >= 4 ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
            Kapasite: {toplamSoru} Soru {toplamSoru < 4 ? '(Min 4)' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {soruTipleri.map(({ key, label, icon, description }) => (
            <div
              key={key}
              className="flex items-center justify-between bg-[var(--bg-paper)]/80 backdrop-blur-md rounded-xl px-3 py-2 border border-[var(--border-color)]/60 hover:border-accent/30 hover:bg-[var(--bg-paper)] transition-all duration-200 shadow-2xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base">{icon}</span>
                <div className="truncate">
                  <span className="text-[11px] font-bold text-[var(--text-primary)] block leading-none">{label}</span>
                  <span className="text-[9px] text-[var(--text-muted)] font-medium">{description}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-0.5 rounded-lg border border-[var(--border-color)]/40">
                <button
                  onClick={() => {
                    const newValue = Math.max(0, ayarlar.soruDagilimi[key] - 1);
                    onSoruDagilimiChange(key, newValue);
                  }}
                  disabled={ayarlar.soruDagilimi[key] === 0}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-black text-[var(--text-muted)] hover:text-accent hover:bg-[var(--bg-paper)] transition-all disabled:opacity-30"
                >
                  -
                </button>

                <span className="w-5 text-center text-xs font-black text-[var(--text-primary)]">
                  {ayarlar.soruDagilimi[key]}
                </span>

                <button
                  onClick={() => {
                    const newValue = Math.min(50, ayarlar.soruDagilimi[key] + 1);
                    onSoruDagilimiChange(key, newValue);
                  }}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-black text-[var(--text-muted)] hover:text-accent hover:bg-[var(--bg-paper)] transition-all"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Özel Konu/Tema (Compact Input) */}
      <div className="space-y-1 pt-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] opacity-80 px-1">Metin / İçerik Teması</span>
        <div className="relative">
          <input
            type="text"
            value={ayarlar.ozelKonu || ''}
            onChange={(e) => onOzelKonuChange(e.target.value)}
            placeholder="Örn: Doğa Sevgisi, Uzay Macerası, Dostluk..."
            maxLength={500}
            className="w-full px-3 py-2 bg-[var(--bg-paper)]/90 border border-[var(--border-color)]/60 rounded-xl text-xs font-medium text-[var(--text-primary)] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-[var(--text-muted)] placeholder:text-[10px]"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          />
        </div>
      </div>

      {/* ZPD Başarı Mimarisi Bilgilendirmesi (Minimal SaaS Card) */}
      <div className="p-2.5 bg-accent/5 border border-accent/10 rounded-xl flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-accent/20 flex items-center justify-center text-xs text-accent">🎓</div>
        <div className="text-[9.5px] font-semibold text-accent/80 leading-tight">
          <strong className="text-accent">ZPD Başarı Mimarisi:</strong> İlk 2 soru kolay kurgulanarak özgüven inşası otomatik sağlanır.
        </div>
      </div>

    </div>
  );
};
