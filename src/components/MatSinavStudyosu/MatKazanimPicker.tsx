/**
 * MatKazanimPicker — Matematik Müfredatı Kazanım Seçici
 * Sınıf → Ünite → Kazanım hiyerarşik seçim bileşeni
 */

import React, { useMemo } from 'react';
import { getMatUnitesBySinif } from '../../data/meb-matematik-kazanim';
import type { MatUnite } from '../../types/matSinav';

interface MatKazanimPickerProps {
    selectedGrade: number | null;
    selectedUnites: string[];
    selectedKazanimlar: string[];
    onUniteChange: (uniteler: string[]) => void;
    onKazanimChange: (kazanimlar: string[]) => void;
}

const OGRENME_ALANI_RENKLERI: Record<string, string> = {
    'Sayılar ve İşlemler': 'from-blue-500 to-blue-700',
    'Geometri': 'from-purple-500 to-purple-700',
    'Geometri ve Ölçme': 'from-purple-500 to-indigo-700',
    'Ölçme': 'from-emerald-500 to-emerald-700',
    'Veri İşleme': 'from-amber-500 to-amber-700',
    'Cebir': 'from-rose-500 to-rose-700',
    'Olasılık': 'from-cyan-500 to-cyan-700',
};

const OGRENME_ALANI_IKONLARI: Record<string, string> = {
    'Sayılar ve İşlemler': '🔢',
    'Geometri': '📐',
    'Geometri ve Ölçme': '📐',
    'Ölçme': '📏',
    'Veri İşleme': '📊',
    'Cebir': '🔤',
    'Olasılık': '🎲',
};

export const MatKazanimPicker: React.FC<MatKazanimPickerProps> = ({
    selectedGrade,
    selectedUnites,
    selectedKazanimlar,
    onUniteChange,
    onKazanimChange,
}) => {
    const uniteler = useMemo(() => {
        if (!selectedGrade) return [];
        return getMatUnitesBySinif(selectedGrade);
    }, [selectedGrade]);

    // Ünite toggle
    const toggleUnite = (uniteId: string, unite: MatUnite) => {
        const isSelected = selectedUnites.includes(uniteId);
        if (isSelected) {
            onUniteChange(selectedUnites.filter((u) => u !== uniteId));
            // İlgili kazanımları da kaldır
            const unitKazanimKodlari = unite.kazanimlar.map((k) => k.kod);
            onKazanimChange(selectedKazanimlar.filter((k) => !unitKazanimKodlari.includes(k)));
        } else {
            onUniteChange([...selectedUnites, uniteId]);
        }
    };

    // Kazanım toggle
    const toggleKazanim = (kod: string) => {
        if (selectedKazanimlar.includes(kod)) {
            onKazanimChange(selectedKazanimlar.filter((k) => k !== kod));
        } else {
            onKazanimChange([...selectedKazanimlar, kod]);
        }
    };

    // Ünitenin tüm kazanımlarını seç/kaldır
    const toggleAllKazanimlar = (unite: MatUnite) => {
        const kodlar = unite.kazanimlar.map((k) => k.kod);
        const allSelected = kodlar.every((k) => selectedKazanimlar.includes(k));
        if (allSelected) {
            onKazanimChange(selectedKazanimlar.filter((k) => !kodlar.includes(k)));
        } else {
            const yeniKazanimlar = [...new Set([...selectedKazanimlar, ...kodlar])];
            onKazanimChange(yeniKazanimlar);
        }
    };

    if (!selectedGrade) {
        return (
            <div className="text-center text-gray-400 text-xs py-4 border-2 border-dashed border-gray-200 rounded-xl">
                ↑ Önce sınıf seçin
            </div>
        );
    }

    if (uniteler.length === 0) {
        return (
            <div className="text-center text-gray-400 text-xs py-4">
                Bu sınıf için ünite bulunamadı.
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {uniteler.map((unite) => {
                const isUniteSelected = selectedUnites.includes(unite.id);
                const selectedCount = unite.kazanimlar.filter((k) => selectedKazanimlar.includes(k.kod)).length;
                const areaColor = OGRENME_ALANI_RENKLERI[unite.ogrenmeAlani] || 'from-slate-400 to-slate-500';
                const ikon = OGRENME_ALANI_IKONLARI[unite.ogrenmeAlani] || '📚';

                return (
                    <div key={unite.id} className="rounded-2xl border border-[var(--border-color)] overflow-hidden transition-all duration-300 bg-white">
                        {/* Ünite Başlığı */}
                        <button
                            onClick={() => toggleUnite(unite.id, unite)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-all duration-300 group ${isUniteSelected
                                ? 'bg-[var(--bg-secondary)]/80'
                                : 'hover:bg-[var(--bg-primary)]'
                                }`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <div className={`w-1 h-8 rounded-full bg-gradient-to-b ${areaColor} shadow-sm`}></div>
                                <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{ikon}</span>
                                        <span className={`text-[13px] font-bold truncate tracking-tight transition-colors ${isUniteSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}>{unite.baslik}</span>
                                    </div>
                                    <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5 opacity-80">
                                        {unite.ogrenmeAlani}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {selectedCount > 0 && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-accent/10 text-accent border border-accent/20">
                                        {selectedCount}
                                    </span>
                                )}
                                <span className={`text-[var(--text-muted)] opacity-70 transition-transform duration-300 ${isUniteSelected ? 'rotate-180' : ''}`}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                                </span>
                            </div>
                        </button>

                        {/* Kazanımlar */}
                        {isUniteSelected && (
                            <div className="bg-white border-t border-slate-50">
                                {/* Tümünü Seç */}
                                <button
                                    onClick={() => toggleAllKazanimlar(unite)}
                                    className="w-full px-5 py-2.5 text-[11px] font-bold text-accent hover:bg-accent/10 text-left border-b border-slate-50 flex items-center gap-2 transition-colors"
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${selectedCount === unite.kazanimlar.length ? 'bg-accent border-accent text-white' : 'bg-white border-[var(--border-color)]'}`}>
                                        {selectedCount === unite.kazanimlar.length && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                    <span>Tüm Kazanımları Seç</span>
                                </button>

                                <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                    {unite.kazanimlar.map((kazanim) => {
                                        const isSelected = selectedKazanimlar.includes(kazanim.kod);
                                        return (
                                            <button
                                                key={kazanim.kod}
                                                onClick={() => toggleKazanim(kazanim.kod)}
                                                className={`w-full text-left px-5 py-3 flex items-start gap-3 transition-all duration-150 border-b border-slate-50 last:border-0 group ${isSelected
                                                    ? 'bg-accent/5'
                                                    : 'hover:bg-[var(--bg-secondary)]/40'
                                                    }`}
                                            >
                                                <div className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border flex items-center justify-center transition-all ${isSelected
                                                    ? 'bg-accent border-accent text-white'
                                                    : 'bg-white border-[var(--border-color)] group-hover:border-[var(--border-color)]'
                                                    }`}>
                                                    {isSelected && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                                </div>
                                                <div className="min-w-0">
                                                    <span className="inline-block text-[9px] font-black font-mono tracking-tighter px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-muted)] mb-1.5 group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                                                        {kazanim.kod}
                                                    </span>
                                                    <span className="text-[11px] font-medium text-[var(--text-muted)] leading-relaxed block" style={{ fontFamily: 'Lexend, sans-serif' }}>
                                                        {kazanim.tanim}
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
