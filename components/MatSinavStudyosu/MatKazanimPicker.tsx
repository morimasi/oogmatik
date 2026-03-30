/**
 * MatKazanimPicker — Matematik Müfredatı Kazanım Seçici
 * Sınıf → Ünite → Kazanım hiyerarşik seçim bileşeni
 */

import React, { useMemo } from 'react';
import { getMatUnitesBySinif } from '../../src/data/meb-matematik-kazanim';
import type { MatUnite } from '../../src/types/matSinav';

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
                const gradient = OGRENME_ALANI_RENKLERI[unite.ogrenmeAlani] || 'from-gray-500 to-gray-700';
                const ikon = OGRENME_ALANI_IKONLARI[unite.ogrenmeAlani] || '📚';

                return (
                    <div key={unite.id} className="rounded-xl border border-gray-100 overflow-hidden transition-all duration-200 hover:shadow-md">
                        {/* Ünite Başlığı */}
                        <button
                            onClick={() => toggleUnite(unite.id, unite)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 text-left transition-all duration-200 ${isUniteSelected
                                    ? 'bg-gradient-to-r ' + gradient + ' text-white'
                                    : 'bg-white hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base flex-shrink-0">{ikon}</span>
                                <div className="min-w-0">
                                    <span className="text-xs font-bold block truncate">{unite.baslik}</span>
                                    <span className={`text-[10px] ${isUniteSelected ? 'text-white/70' : 'text-gray-400'}`}>
                                        {unite.ogrenmeAlani} · {unite.kazanimlar.length} kazanım
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                {selectedCount > 0 && (
                                    <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isUniteSelected ? 'bg-white/30 text-white' : 'bg-indigo-100 text-indigo-700'
                                        }`}>
                                        {selectedCount}/{unite.kazanimlar.length}
                                    </span>
                                )}
                                <span className={`text-[10px] transition-transform duration-200 ${isUniteSelected ? 'rotate-180' : ''}`}>
                                    ▼
                                </span>
                            </div>
                        </button>

                        {/* Kazanımlar */}
                        {isUniteSelected && (
                            <div className="bg-gray-50/80 border-t border-gray-100">
                                {/* Tümünü Seç */}
                                <button
                                    onClick={() => toggleAllKazanimlar(unite)}
                                    className="w-full px-3 py-1.5 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 text-left border-b border-gray-100 flex items-center gap-1"
                                >
                                    <span>{selectedCount === unite.kazanimlar.length ? '☑' : '☐'}</span>
                                    {selectedCount === unite.kazanimlar.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                                </button>

                                {unite.kazanimlar.map((kazanim) => {
                                    const isSelected = selectedKazanimlar.includes(kazanim.kod);
                                    return (
                                        <button
                                            key={kazanim.kod}
                                            onClick={() => toggleKazanim(kazanim.kod)}
                                            className={`w-full text-left px-3 py-2 flex items-start gap-2 transition-all duration-150 border-b border-gray-100 last:border-0 ${isSelected
                                                    ? 'bg-indigo-50 text-indigo-900'
                                                    : 'hover:bg-white text-gray-600'
                                                }`}
                                        >
                                            <span className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] ${isSelected
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : 'border-gray-300 bg-white'
                                                }`}>
                                                {isSelected && '✓'}
                                            </span>
                                            <div className="min-w-0">
                                                <span className="text-[10px] font-mono text-indigo-500 block">{kazanim.kod}</span>
                                                <span className="text-[11px] leading-tight block">{kazanim.tanim}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
