/**
 * MatProblemStudyosu — MEB Kazanım Seçici
 * Tema Uyumlu, Premium ve Kompakt Tasarım
 */

import React, { useMemo, useState } from 'react';
import { getMatMufredatBySinif } from '../../services/matProblemService';
import type { MebUnite } from '../../constants/mebMathCurriculum';

interface MatProblemKazanimPickerProps {
    sinif: number | null;
    secilenUniteler: string[];
    secilenKazanimlar: string[];
    onSinifChange: (sinif: number) => void;
    onUniteChange: (uniteler: string[]) => void;
    onKazanimChange: (kazanimlar: string[]) => void;
}

export const MatProblemKazanimPicker: React.FC<MatProblemKazanimPickerProps> = ({
    sinif, secilenUniteler, secilenKazanimlar,
    onSinifChange, onUniteChange, onKazanimChange,
}) => {
    const [expandedUnite, setExpandedUnite] = useState<string | null>(null);

    const uniteler: MebUnite[] = useMemo(() => {
        if (!sinif) return [];
        try {
            const mufredatObj = getMatMufredatBySinif(sinif);
            return (mufredatObj?.uniteler || []) as MebUnite[];
        } catch {
            return [];
        }
    }, [sinif]);

    const toggleUnite = (uniteId: string) => {
        const set = new Set(secilenUniteler);
        if (set.has(uniteId)) {
            set.delete(uniteId);
            const uniteKazanımKodları = uniteler.find(u => u.id === uniteId)?.kazanimlar.map(k => k.kod) || [];
            const yeniKazanimlar = secilenKazanimlar.filter(k => !uniteKazanımKodları.includes(k));
            onKazanimChange(yeniKazanimlar);
        } else {
            set.add(uniteId);
        }
        onUniteChange(Array.from(set));
    };

    const toggleKazanim = (kod: string) => {
        const set = new Set(secilenKazanimlar);
        if (set.has(kod)) set.delete(kod); else set.add(kod);
        onKazanimChange(Array.from(set));
    };

    const selectAllInUnite = (uniteId: string) => {
        const unite = uniteler.find(u => u.id === uniteId);
        if (!unite) return;
        const allKods = unite.kazanimlar.map(k => k.kod);
        const existing = new Set(secilenKazanimlar);
        const allSelected = allKods.every(k => existing.has(k));
        if (allSelected) {
            allKods.forEach(k => existing.delete(k));
        } else {
            allKods.forEach(k => existing.add(k));
        }
        onKazanimChange(Array.from(existing));
    };

    return (
        <div className="space-y-2.5">
            {/* Sınıf Seçimi */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Sınıf Seviyesi
                    </label>
                    {sinif && (
                        <span className="text-[10px] font-bold text-cyan-500">
                            {sinif}. Sınıf MEB Müfredatı
                        </span>
                    )}
                </div>
                <div className="grid grid-cols-8 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => {
                        const isSelected = sinif === s;
                        return (
                            <button
                                key={s}
                                onClick={() => onSinifChange(s)}
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border ${isSelected
                                        ? 'bg-cyan-600 border-cyan-500 text-white shadow-md shadow-cyan-600/30 scale-[1.03]'
                                        : 'bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-cyan-500/50'
                                    }`}
                            >
                                {s}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Ünite ve Kazanım Seçimi */}
            {sinif && uniteler.length > 0 && (
                <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                        Üniteler ve MEB Kazanımları ({uniteler.length} Ünite)
                    </label>
                    <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-700">
                        {uniteler.map((unite) => {
                            const isOpen = expandedUnite === unite.id;
                            const isUniteChecked = secilenUniteler.includes(unite.id);
                            const selectedCount = unite.kazanimlar.filter(k => secilenKazanimlar.includes(k.kod)).length;

                            return (
                                <div
                                    key={unite.id}
                                    className={`rounded-xl border transition-all ${isUniteChecked
                                            ? 'border-cyan-500/50 bg-cyan-950/20'
                                            : 'border-[var(--border-color)] bg-[var(--bg-secondary)]/50'
                                        }`}
                                >
                                    <div
                                        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none transition-colors hover:bg-[var(--bg-secondary)]"
                                        onClick={() => setExpandedUnite(isOpen ? null : unite.id)}
                                    >
                                        <div className="flex items-center gap-2 min-w-0 flex-1 pr-2">
                                            <input
                                                type="checkbox"
                                                checked={isUniteChecked}
                                                onChange={(e) => { e.stopPropagation(); toggleUnite(unite.id); }}
                                                className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer flex-shrink-0"
                                            />
                                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
                                                {unite.baslik}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            {selectedCount > 0 && (
                                                <span className="text-[9px] bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full font-bold">
                                                    {selectedCount}/{unite.kazanimlar.length}
                                                </span>
                                            )}
                                            <span className="text-[var(--text-muted)] text-xs font-mono">{isOpen ? '▾' : '▸'}</span>
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="px-3 py-2 bg-[var(--bg-paper)]/80 space-y-1.5 border-t border-[var(--border-color)] rounded-b-xl">
                                            <div className="flex justify-between items-center pb-1 border-b border-[var(--border-color)]/50">
                                                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Kazanım Listesi</span>
                                                <button
                                                    onClick={() => selectAllInUnite(unite.id)}
                                                    className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold transition-colors"
                                                >
                                                    Tümünü Seç / Kaldır
                                                </button>
                                            </div>
                                            {unite.kazanimlar.map((kaz) => {
                                                const isKazChecked = secilenKazanimlar.includes(kaz.kod);
                                                return (
                                                    <label
                                                        key={kaz.kod}
                                                        className={`flex items-start gap-2 cursor-pointer p-1.5 rounded-lg transition-colors border ${isKazChecked
                                                                ? 'bg-cyan-500/10 border-cyan-500/30 text-[var(--text-primary)]'
                                                                : 'border-transparent hover:bg-[var(--bg-secondary)]/70 text-[var(--text-secondary)]'
                                                            }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={isKazChecked}
                                                            onChange={() => toggleKazanim(kaz.kod)}
                                                            className="w-3.5 h-3.5 mt-0.5 rounded accent-cyan-500 flex-shrink-0 cursor-pointer"
                                                        />
                                                        <div className="text-[11px] leading-snug">
                                                            <span className="inline-block bg-cyan-500/20 text-cyan-300 px-1 rounded text-[9px] font-mono font-bold mr-1.5">
                                                                {kaz.kod}
                                                            </span>
                                                            <span className="font-medium text-[var(--text-primary)]">
                                                                {kaz.tanim}
                                                            </span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Seçim Özeti */}
            {secilenKazanimlar.length > 0 && (
                <div className="bg-cyan-500/10 rounded-xl p-2 border border-cyan-500/30 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                        {secilenKazanimlar.length} MEB kazanımı seçildi
                    </span>
                    <button
                        onClick={() => onKazanimChange([])}
                        className="text-[9px] font-bold text-cyan-300/70 hover:text-cyan-300 underline"
                    >
                        Temizle
                    </button>
                </div>
            )}
        </div>
    );
};
