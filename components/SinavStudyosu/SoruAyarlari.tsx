/**
 * Soru Ayarları - Question distribution and difficulty settings
 */

import React from 'react';
import { SinavAyarlari } from '../../src/types/sinav';

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
        description: '4 seçenekli sorular'
      },
      {
        key: 'dogru-yanlis-duzeltme',
        label: 'Doğru-Yanlış',
        icon: '✓✗',
        description: 'Doğru/Yanlış ve düzeltme'
      },
      {
        key: 'bosluk-doldurma',
        label: 'Boşluk Doldurma',
        icon: '📄',
        description: 'Eksik kelimeleri tamamlama'
      },
      {
        key: 'acik-uclu',
        label: 'Açık Uçlu',
        icon: '✍️',
        description: 'Serbest yanıt soruları'
      }
    ];

  return (
    <div className="space-y-5">
      {/* Soru Dağılımı */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Soru Dağılımı</span>
          <div className="h-px flex-1 bg-slate-100"></div>
        </div>

        <div className="space-y-2">
          {soruTipleri.map(({ key, label, icon, description }) => (
            <div
              key={key}
              className="group bg-white border border-slate-100 rounded-2xl p-3.5 transition-all duration-200 hover:border-indigo-100 hover:shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl transition-colors group-hover:bg-indigo-50">
                    {icon}
                  </div>
                  <div className="truncate">
                    <div className="text-[13px] font-bold text-slate-700 tracking-tight">{label}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{description}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    onClick={() => {
                      const newValue = Math.max(0, ayarlar.soruDagilimi[key] - 1);
                      onSoruDagilimiChange(key, newValue);
                    }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all ${ayarlar.soruDagilimi[key] === 0 ? 'text-slate-300' : 'text-slate-600 hover:bg-white hover:text-indigo-600 shadow-sm'}`}
                    disabled={ayarlar.soruDagilimi[key] === 0}
                  >
                    −
                  </button>

                  <div className="w-8 text-center text-[13px] font-black text-slate-700">
                    {ayarlar.soruDagilimi[key]}
                  </div>

                  <button
                    onClick={() => {
                      const newValue = Math.min(20, ayarlar.soruDagilimi[key] + 1);
                      onSoruDagilimiChange(key, newValue);
                    }}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 font-bold hover:bg-white hover:text-indigo-600 shadow-sm transition-all"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toplam Soru Bilgisi */}
        <div className={`mt-4 p-4 rounded-2xl border transition-all duration-300 ${toplamSoru < 4 ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${toplamSoru < 4 ? 'text-amber-600' : 'text-slate-400'}`}>Toplam Kapasite</span>
              <span className={`text-lg font-black ${toplamSoru < 4 ? 'text-amber-900' : 'text-slate-900'}`}>{toplamSoru} Soru</span>
            </div>
            {toplamSoru < 4 ? (
              <span className="text-2xl animate-pulse">⚠️</span>
            ) : (
              <span className="text-2xl opacity-40">📊</span>
            )}
          </div>
          {toplamSoru < 4 && (
            <p className="text-[10px] text-amber-700 mt-2 font-bold leading-tight">
              Kritik: En az 4 soru seçilmelidir.
            </p>
          )}
        </div>
      </div>

      {/* Özel Konu/Tema */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Özel Tema (Opsiyonel)</span>
          <div className="h-px flex-1 bg-slate-100"></div>
        </div>

        <div className="relative group">
          <input
            type="text"
            value={ayarlar.ozelKonu || ''}
            onChange={(e) => onOzelKonuChange(e.target.value)}
            placeholder="Örn: Uzay seyahati, çevre koruma..."
            maxLength={500}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-medium outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-300"
            style={{ fontFamily: 'Lexend, sans-serif' }}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none transition-transform group-focus-within:scale-110">💡</div>
        </div>
      </div>

      {/* Başarı Anı Mimarisi Bilgilendirmesi */}
      <div className="p-4 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-base">🎓</div>
          <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-tight">ZPD Başarı Mimarisi</span>
        </div>
        <div className="text-[10px] font-medium text-indigo-700/70 leading-relaxed pl-1">
          İlk 2 soru otomatik olarak düşük zorlukta kurgulanarak öğrencinin özgüveni desteklenir.
        </div>
      </div>
    </div>
  );
};
