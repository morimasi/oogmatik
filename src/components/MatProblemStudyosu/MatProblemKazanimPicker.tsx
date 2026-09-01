/**
 * MatProblemStudyosu — MEB Kazanım Seçici
 * Mevcut MatKazanimPicker klonu — bağımsız bileşen
 */

import React, { useMemo, useState } from 'react';
import { getMatMufredatBySinif } from '../../services/matProblemService';
import type { MatUnite } from '../../types/matProblem';

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

    const uniteler: MatUnite[] = useMemo(() => {
        if (!sinif) return [];
        try {
            const mufredatObj = getMatMufredatBySinif(sinif);
            return (mufredatObj?.uniteler || []) as any;
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
        <div className="space-y-3">
            {/* Sınıf Seçimi */}
            <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Sınıf Seviyesi</label>
                <div className="grid grid-cols-8 gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <button
                            key={s}
                            onClick={() => onSinifChange(s)}
                            className={`py-2 rounded-lg text-xs font-bold transition-all ${sinif === s ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/20' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ünite ve Kazanım Seçimi */}
            {sinif && uniteler.length > 0 && (
                <div>
                    <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Üniteler & Kazanımlar</label>
                    <div className="space-y-1 max-h-[250px] overflow-y-auto pr-1">
                        {uniteler.map((unite) => {
                            const isOpen = expandedUnite === unite.id;
                            const selectedCount = unite.kazanimlar.filter(k => secilenKazanimlar.includes(k.kod)).length;

                            return (
                                <div key={unite.id} className="rounded-lg border border-zinc-700/50 overflow-hidden">
                                    <div
                                        className={`flex items-center justify-between px-3 py-2 cursor-pointer transition-all ${secilenUniteler.includes(unite.id) ? 'bg-cyan-900/30' : 'bg-zinc-800/50 hover:bg-zinc-700/50'}`}
                                        onClick={() => setExpandedUnite(isOpen ? null : unite.id)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                checked={secilenUniteler.includes(unite.id)}
                                                onChange={(e) => { e.stopPropagation(); toggleUnite(unite.id); }}
                                                className="w-3.5 h-3.5 rounded accent-cyan-500"
                                            />
                                            <span className="text-xs font-semibold text-white">{unite.baslik}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            {selectedCount > 0 && (
                                                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-bold">{selectedCount}/{unite.kazanimlar.length}</span>
                                            )}
                                            <span className="text-zinc-500 text-xs">{isOpen ? '▾' : '▸'}</span>
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div className="px-3 py-2 bg-zinc-900/50 space-y-1 border-t border-zinc-700/30">
                                            <button
                                                onClick={() => selectAllInUnite(unite.id)}
                                                className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold mb-1"
                                            >
                                                Tümünü Seç/Kaldır
                                            </button>
                                            {unite.kazanimlar.map((kaz) => (
                                                <label key={kaz.kod} className="flex items-start gap-2 cursor-pointer py-0.5">
                                                    <input
                                                        type="checkbox"
                                                        checked={secilenKazanimlar.includes(kaz.kod)}
                                                        onChange={() => toggleKazanim(kaz.kod)}
                                                        className="w-3 h-3 mt-0.5 rounded accent-cyan-500 flex-shrink-0"
                                                    />
                                                    <span className="text-[10px] text-zinc-300 leading-tight">
                                                        <span className="text-cyan-400 font-bold mr-1">{kaz.kod}</span>
                                                        {kaz.tanim}
                                                    </span>
                                                </label>
                                            ))}
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
                <div className="bg-cyan-900/20 rounded-lg p-2 border border-cyan-800/30">
                    <span className="text-[10px] font-bold text-cyan-300">
                        ✓ {secilenKazanimlar.length} kazanım seçildi
                    </span>
                </div>
            )}
        </div>
    );
};
