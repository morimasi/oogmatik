/**
 * MatSoruCard — Tek Soru Kartı (Inline Edit + Yenile)
 */

import React, { useState } from 'react';
import type { MatSoru } from '../../../src/types/matSinav';

interface MatSoruCardProps {
    soru: MatSoru;
    index: number;
    onUpdate: (index: number, updated: MatSoru) => void;
    onRefresh: (index: number) => void;
    isRefreshing?: boolean;
}

const ZORLUK_RENKLERI: Record<string, string> = {
    'Kolay': 'bg-green-100 text-green-700',
    'Orta': 'bg-amber-100 text-amber-700',
    'Zor': 'bg-red-100 text-red-700',
};

const TIP_ETIKETLERI: Record<string, string> = {
    'coktan_secmeli': 'Çoktan Seçmeli',
    'dogru_yanlis': 'Doğru/Yanlış',
    'bosluk_doldurma': 'Boşluk Doldurma',
    'acik_uclu': 'Açık Uçlu',
};

export const MatSoruCard: React.FC<MatSoruCardProps> = ({
    soru,
    index,
    onUpdate,
    onRefresh,
    isRefreshing = false,
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(soru.soruMetni);
    const labels = ['A', 'B', 'C', 'D'];

    const handleSaveEdit = () => {
        onUpdate(index, { ...soru, soruMetni: editText, isDuzenlenmisMi: true });
        setIsEditing(false);
    };

    const handleCancelEdit = () => {
        setEditText(soru.soruMetni);
        setIsEditing(false);
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all duration-200 group relative">
            {/* Üst Bar */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center text-xs font-extrabold shadow-sm">
                        {index + 1}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${ZORLUK_RENKLERI[soru.zorluk] || 'bg-gray-100 text-gray-600'}`}>
                        {soru.zorluk}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-indigo-50 text-indigo-600">
                        {TIP_ETIKETLERI[soru.tip] || soru.tip}
                    </span>
                    <span className="text-[9px] text-gray-400">{soru.puan} puan · ~{Math.ceil(soru.tahminiSure / 60)} dk</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-indigo-600 transition-all"
                        title="Düzenle"
                    >
                        ✏️
                    </button>
                    <button
                        onClick={() => onRefresh(index)}
                        disabled={isRefreshing}
                        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-600 transition-all disabled:opacity-50"
                        title="Yeni soru üret"
                    >
                        {isRefreshing ? (
                            <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : '🔄'}
                    </button>
                </div>
            </div>

            {/* Soru Metni */}
            {isEditing ? (
                <div className="mb-3">
                    <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border-2 border-indigo-300 text-sm focus:border-indigo-500 outline-none resize-none"
                        rows={3}
                        autoFocus
                    />
                    <div className="flex gap-1.5 mt-1.5">
                        <button onClick={handleSaveEdit} className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-bold hover:bg-indigo-700">
                            Kaydet
                        </button>
                        <button onClick={handleCancelEdit} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-600 text-[10px] font-bold hover:bg-gray-200">
                            İptal
                        </button>
                    </div>
                </div>
            ) : (
                <p
                    className="text-sm text-gray-800 leading-relaxed mb-3 cursor-pointer hover:bg-indigo-50 rounded-lg px-2 py-1 -mx-2 transition-all"
                    onClick={() => { setEditText(soru.soruMetni); setIsEditing(true); }}
                    title="Düzenlemek için tıklayın"
                >
                    {soru.soruMetni}
                    {soru.isDuzenlenmisMi && <span className="text-[9px] text-amber-500 ml-1">(düzenlendi)</span>}
                </p>
            )}

            {/* Seçenekler — Çoktan Seçmeli */}
            {soru.tip === 'coktan_secmeli' && soru.secenekler && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
                    {Object.entries(soru.secenekler).map(([key, value], si) => (
                        <div
                            key={key}
                            className={`flex items-start gap-2 px-3 py-2 rounded-lg text-xs ${String(soru.dogruCevap) === key
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-gray-50 border border-gray-100 text-gray-600'
                                }`}
                        >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${String(soru.dogruCevap) === key
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-500'
                                }`}>
                                {labels[si]}
                            </span>
                            <span className="leading-tight">{value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Doğru/Yanlış */}
            {soru.tip === 'dogru_yanlis' && (
                <div className="flex gap-2 mb-3">
                    <span className="px-3 py-1.5 rounded-lg bg-gray-50 border text-xs font-bold text-gray-500">( ) Doğru</span>
                    <span className="px-3 py-1.5 rounded-lg bg-gray-50 border text-xs font-bold text-gray-500">( ) Yanlış</span>
                    <span className="text-[10px] text-green-600 self-center ml-2">Cevap: {soru.dogruCevap}</span>
                </div>
            )}

            {/* Boşluk Doldurma */}
            {soru.tip === 'bosluk_doldurma' && (
                <div className="mb-3 flex items-center gap-2">
                    <span className="text-xs text-gray-500">Cevap:</span>
                    <span className="border-b-2 border-gray-300 px-4 py-0.5 text-xs text-gray-300 min-w-[120px]">&nbsp;</span>
                    <span className="text-[10px] text-green-600 ml-2">({soru.dogruCevap})</span>
                </div>
            )}

            {/* Açık Uçlu */}
            {soru.tip === 'acik_uclu' && (
                <div className="mb-3 space-y-1.5">
                    {[0, 1, 2].map((i) => (
                        <div key={i} className="border-b border-gray-200 py-2"></div>
                    ))}
                </div>
            )}

            {/* Kazanım */}
            <div className="text-right">
                <span className="text-[9px] text-gray-400 italic">[{soru.kazanimKodu}]</span>
            </div>
        </div>
    );
};
