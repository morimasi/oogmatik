import React from 'react';
import { useSuperStudioStore } from '../../../store/useSuperStudioStore';
import { SuperStudioDifficulty, _GenerationMode } from '../../../types/superStudio';

export const MainSettingsPanel: React.FC = () => {
    const { grade, difficulty, generationMode, setGrade, setDifficulty, setGenerationMode } = useSuperStudioStore();

    return (
        <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 shadow-sm relative w-full">
            <h2 className="text-lg font-medium text-slate-200 mb-4 flex items-center">
                <span className="w-1.5 h-5 bg-blue-500 rounded-full mr-2"></span>
                Ana Ayarlar
            </h2>

            <div className="space-y-4">
                {/* Öğrenci ve Sınıf Seçimi */}
                <div className="flex space-x-3">
                    <div className="flex-1">
                        <label className="block text-xs text-slate-400 mb-1">Sınıf Seviyesi</label>
                        <select
                            value={grade || ''}
                            onChange={(e) => setGrade(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="">Seçiniz...</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(g => (
                                <option key={g} value={`${g}. Sınıf`}>{g}. Sınıf</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-slate-400 mb-1">Düzey</label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as SuperStudioDifficulty)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="Kolay">Kolay</option>
                            <option value="Orta">Orta</option>
                            <option value="Zor">Zor</option>
                        </select>
                    </div>
                </div>

                {/* Üretim Modu */}
                <div>
                    <label className="block text-xs text-slate-400 mb-1">Üretim Modu (Motor)</label>
                    <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                        <button
                            onClick={() => setGenerationMode('fast')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${generationMode === 'fast' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            ⚡ Hızlı Mod
                        </button>
                        <button
                            onClick={() => setGenerationMode('ai')}
                            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${generationMode === 'ai' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            ✨ AI Mod (Gemini)
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
