/**
 * Kazanım Picker - MEB kazanım seçici component
 * Cascading multi-select: Sınıf → Üniteler → Kazanımlar
 */

import React, { useState, useEffect } from 'react';
import { getUnitesByGrade, getKazanimByUniteId } from '../../src/data/meb-turkce-kazanim';
import { MEBUnite, MEBKazanim } from '../../src/types/sinav';

interface KazanimPickerProps {
  selectedGrade: number | null;
  selectedUnites: string[];
  selectedKazanimlar: string[];
  onUniteChange: (uniteIds: string[]) => void;
  onKazanimChange: (kazanimCodes: string[]) => void;
}

export const KazanimPicker: React.FC<KazanimPickerProps> = ({
  selectedGrade,
  selectedUnites,
  selectedKazanimlar,
  onUniteChange,
  onKazanimChange
}) => {
  const [uniteler, setUniteler] = useState<MEBUnite[]>([]);
  const [kazanimlar, setKazanimlar] = useState<MEBKazanim[]>([]);

  // Sınıf değiştiğinde üniteleri yükle
  useEffect(() => {
    if (selectedGrade) {
      const unites = getUnitesByGrade(selectedGrade);
      setUniteler(unites);
      // Sınıf değişince seçimleri sıfırla
      onUniteChange([]);
      onKazanimChange([]);
      setKazanimlar([]);
    }
  }, [selectedGrade, onUniteChange, onKazanimChange]);

  // Ünite seçimi değiştiğinde kazanımları yükle
  useEffect(() => {
    if (selectedUnites.length > 0) {
      const allKazanim: MEBKazanim[] = [];
      selectedUnites.forEach(uniteId => {
        const uniteKazanim = getKazanimByUniteId(uniteId);
        allKazanim.push(...uniteKazanim);
      });
      setKazanimlar(allKazanim);
    } else {
      setKazanimlar([]);
      onKazanimChange([]);
    }
  }, [selectedUnites, onKazanimChange]);

  const handleUniteToggle = (uniteId: string): void => {
    const newSelection = selectedUnites.includes(uniteId)
      ? selectedUnites.filter(id => id !== uniteId)
      : [...selectedUnites, uniteId];
    onUniteChange(newSelection);
  };

  const handleKazanimToggle = (kazanimCode: string): void => {
    const newSelection = selectedKazanimlar.includes(kazanimCode)
      ? selectedKazanimlar.filter(code => code !== kazanimCode)
      : [...selectedKazanimlar, kazanimCode];
    onKazanimChange(newSelection);
  };

  const handleSelectAllKazanim = (): void => {
    const allCodes = kazanimlar.map(k => k.kod);
    onKazanimChange(allCodes);
  };

  const handleClearAllKazanim = (): void => {
    onKazanimChange([]);
  };

  if (!selectedGrade) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 font-medium">📚 Önce bir sınıf seçin.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Ünite Seçimi */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">İçerik Havuzu</span>
          <div className="h-px flex-1 bg-[var(--bg-secondary)]"></div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {uniteler.map(unite => (
            <button
              key={unite.id}
              onClick={() => handleUniteToggle(unite.id)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all duration-200 group ${selectedUnites.includes(unite.id)
                ? 'bg-accent/5 border-accent/30 shadow-sm'
                : 'bg-white border-[var(--border-color)] hover:border-[var(--border-color)] hover:bg-[var(--bg-primary)]'
                }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-1.5 h-6 rounded-full transition-colors ${selectedUnites.includes(unite.id) ? 'bg-accent' : 'bg-[var(--bg-secondary)] group-hover:bg-slate-300'}`}></div>
                <div className="truncate">
                  <div className={`text-[13px] font-semibold transition-colors ${selectedUnites.includes(unite.id) ? 'text-accent' : 'text-[var(--text-primary)]'}`}>
                    Ünite {unite.uniteNo}: {unite.baslik}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] font-medium">{unite.kazanimlar.length} kazanım mevcut</div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${selectedUnites.includes(unite.id) ? 'bg-accent border-accent text-white' : 'bg-white border-[var(--border-color)] group-hover:border-[var(--border-color)]'
                }`}>
                {selectedUnites.includes(unite.id) && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Kazanım Seçimi */}
      {selectedUnites.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Kazanım Detayları</span>
            <div className="flex gap-4">
              <button onClick={handleSelectAllKazanim} className="text-[10px] font-bold text-accent hover:text-accent/70 transition">Hepsini Seç</button>
              <button onClick={handleClearAllKazanim} className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-muted)] transition">Sıfırla</button>
            </div>
          </div>

          <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
            {kazanimlar.map(kazanim => (
              <button
                key={kazanim.kod}
                onClick={() => handleKazanimToggle(kazanim.kod)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all duration-200 group ${selectedKazanimlar.includes(kazanim.kod)
                  ? 'bg-emerald-50/40 border-emerald-100'
                  : 'bg-white border-slate-50 hover:bg-[var(--bg-primary)] hover:border-[var(--border-color)]'
                  }`}
              >
                <div className={`mt-0.5 w-4 h-4 rounded-md border flex-shrink-0 flex items-center justify-center transition-all ${selectedKazanimlar.includes(kazanim.kod) ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-[var(--border-color)] group-hover:border-[var(--border-color)]'
                  }`}>
                  {selectedKazanimlar.includes(kazanim.kod) && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[9px] font-black font-mono tracking-tighter px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                      {kazanim.kod}
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-[var(--text-muted)] leading-relaxed" style={{ fontFamily: 'Lexend, sans-serif' }}>
                    {kazanim.tanim}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Seçim Özeti */}
      {selectedKazanimlar.length > 0 && (
        <div className="p-4 bg-accent rounded-2xl shadow-accent/20 shadow-lg border border-accent/70 overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="white"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM16.0303 10.5303L11.0303 15.5303C10.8897 15.671 10.6989 15.75 10.5 15.75C10.3011 15.75 10.1103 15.671 9.96967 15.5303L7.96967 13.5303C7.67678 13.2374 7.67678 12.7626 7.96967 12.4697C8.26256 12.1768 8.73744 12.1768 9.03033 12.4697L10.5 13.9393L14.9697 9.46967C15.2626 9.17678 15.7374 9.17678 16.0303 9.46967C16.3232 9.76256 16.3232 10.2374 16.0303 10.5303Z" /></svg>
          </div>
          <div className="relative z-10 flex flex-col gap-1">
            <span className="text-[10px] text-white/70 font-bold uppercase tracking-[0.2em]">Yapılandırma Tamam</span>
            <div className="text-xl font-black text-white">{selectedKazanimlar.length} Hedef Kazanım</div>
            <p className="text-[11px] text-white/80 font-medium">Sistem bu kazanımlara odaklı sorular üretecek.</p>
          </div>
        </div>
      )}
    </div>
  );
};
