import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { DilBilgisiSettings } from './types';

export const DilBilgisiSettingsPanel: React.FC<TemplateSettingsProps<DilBilgisiSettings>> = ({ settings, onChange }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-100 border-b border-slate-700 pb-2">Dil Bilgisi & Harf Algısı Ayarları</h3>
            
            <div className="space-y-4">
                {/* Target Distractors (Ayna Harfler) */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Hedef Çeldirici Harfler (Ayna Etkisi)</label>
                    <div className="grid grid-cols-2 gap-2">
                        {['b-d', 'p-q', 'm-n', 'none'].map((pair) => (
                            <button
                                key={pair}
                                onClick={() => onChange({ targetDistractors: pair as any })}
                                className={`p-2 rounded-lg border transition-all ${
                                    settings.targetDistractors === pair 
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-900/20' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                                }`}
                            >
                                {pair === 'none' ? 'Yok' : pair.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid Size */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Harf Avı Izgara (Grid) Boyutu</label>
                    <select 
                        value={settings.gridSize} 
                        onChange={(e) => onChange({ gridSize: e.target.value as any })}
                        className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="none">Tablo Oluşturma</option>
                        <option value="3x3">3x3 Küçük Matris</option>
                        <option value="4x4">4x4 Orta Matris</option>
                        <option value="5x5">5x5 Büyük Matris</option>
                    </select>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input 
                            type="checkbox" 
                            checked={settings.syllableSimulation} 
                            onChange={(e) => onChange({ syllableSimulation: e.target.checked })} 
                            className="form-checkbox text-blue-500 rounded h-5 w-5 bg-slate-900 border-slate-700" 
                        />
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-300 font-medium">[He-ce-le-me] Modu</span>
                            <span className="text-xs text-slate-500">Kelimeleri hecelerine ayırarak yazdırır.</span>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input 
                            type="checkbox" 
                            checked={settings.camouflageGrid} 
                            onChange={(e) => onChange({ camouflageGrid: e.target.checked })} 
                            className="form-checkbox text-blue-500 rounded h-5 w-5 bg-slate-900 border-slate-700" 
                        />
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-300 font-medium">Kamuflajlı Tablo Sistemi</span>
                            <span className="text-xs text-slate-500">Hedef harfleri benzerleri arasına gizler.</span>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:bg-slate-700/50 transition">
                        <input 
                            type="checkbox" 
                            checked={settings.hintBox} 
                            onChange={(e) => onChange({ hintBox: e.target.checked })} 
                            className="form-checkbox text-blue-500 rounded h-5 w-5 bg-slate-900 border-slate-700" 
                        />
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-300 font-medium">Öğretmen İpucu Kutusu</span>
                            <span className="text-xs text-slate-500">Sayfa başına kural hatırlatıcı ekler.</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default DilBilgisiSettingsPanel;
