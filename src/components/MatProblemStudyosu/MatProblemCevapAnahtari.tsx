/**
 * MatProblemStudyosu — Cevap Anahtarı Modal
 * Adım adım çözüm ve açık uçlu cevap anahtarı görünümü
 */

import React from 'react';
import type { MatProblemSeti } from '../../types/matProblem';

interface MatProblemCevapAnahtariProps {
    problemSeti: MatProblemSeti;
    onClose: () => void;
}

export const MatProblemCevapAnahtari: React.FC<MatProblemCevapAnahtariProps> = ({ problemSeti, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-zinc-900 rounded-2xl w-[700px] max-h-[85vh] flex flex-col border border-cyan-800/40 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Başlık */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                    <div>
                        <h2 className="text-sm font-bold text-white flex items-center gap-2">
                            ✓ Cevap Anahtarı
                        </h2>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                            {problemSeti.baslik} • {problemSeti.cevapAnahtari.problemler.length} Problem
                        </p>
                    </div>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white text-lg font-bold">✕</button>
                </div>

                {/* İçerik */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                    {problemSeti.cevapAnahtari.problemler.map((item, index) => {
                        const problem = problemSeti.problemler[index];
                        return (
                            <div key={index} className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50">
                                {/* Problem Başlığı */}
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-cyan-600 text-white text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center">
                                        {item.problemNo}
                                    </span>
                                    <div className="flex-1">
                                        <span className="text-[10px] bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full font-bold">
                                            {item.kazanimKodu} • {item.seviye} • {item.puan} Puan
                                        </span>
                                    </div>
                                </div>

                                {/* Problem Metni */}
                                {problem && (
                                    <p className="text-xs text-zinc-300 mb-3 italic">
                                        {problem.soruMetni}
                                    </p>
                                )}

                                {/* Çözüm Adımları */}
                                <div className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-800/30 mb-2">
                                    <h4 className="text-[10px] font-bold text-emerald-400 uppercase mb-2">📋 Çözüm Adımları</h4>
                                    <div className="space-y-1.5">
                                        {item.cozumAdimlari.map((adim, ai) => (
                                            <div key={ai} className="flex items-start gap-2 text-xs text-emerald-200">
                                                <span className="text-emerald-500 font-bold flex-shrink-0">{ai + 1}.</span>
                                                <span>{adim}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Doğru Cevap */}
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-cyan-400">✓ Doğru Cevap:</span>
                                    <span className="text-xs font-bold text-white bg-cyan-600/20 px-2 py-0.5 rounded-md">
                                        {item.dogruCevap}
                                    </span>
                                </div>

                                {/* Gerçek Yaşam Bağlantısı */}
                                {item.gercekYasamBaglantisi && (
                                    <p className="text-[10px] text-zinc-500 mt-2 italic">
                                        💡 {item.gercekYasamBaglantisi}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Alt Bar */}
                <div className="flex items-center justify-between px-6 py-3 border-t border-zinc-800">
                    <span className="text-[10px] text-zinc-500">
                        Toplam Puan: {problemSeti.toplamPuan} • Tahmini Süre: {Math.round(problemSeti.tahminiSure / 60)} dk
                    </span>
                    <button onClick={onClose} className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500">
                        Kapat
                    </button>
                </div>
            </div>
        </div>
    );
};
