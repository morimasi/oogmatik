import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { YaraticiYazarlikSettings } from './types';

export const YaraticiYazarlikSettingsPanel: React.FC<TemplateSettingsProps<YaraticiYazarlikSettings>> = ({ settings, onChange }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-100 border-b border-slate-700 pb-2">Yaratıcı Yazarlık (Oyunlaştırılmış) Ayarları</h3>
            
            <div className="space-y-4">
                {/* Story Dice Count */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Hikaye Zarı Sayısı (SVG İkon): {settings.storyDiceCount}</label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((num) => (
                            <button
                                key={num}
                                onClick={() => onChange({ storyDiceCount: num })}
                                className={`flex-1 p-2 rounded-xl border transition-all ${
                                    settings.storyDiceCount === num 
                                    ? 'bg-amber-600 border-amber-400 text-white' 
                                    : 'bg-slate-800 border-slate-700 text-slate-400'
                                }`}
                            >
                                {num} <i className="fa-solid fa-dice ml-1"></i>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cloze Format */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Boşluk Doldurma Modu (Cloze)</label>
                    <select 
                        value={settings.clozeFormat} 
                        onChange={(e) => onChange({ clozeFormat: e.target.value as any })}
                        className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                        <option value="none">Yok (Düz Yazma)</option>
                        <option value="fiil">Sadece Fiiller (Boş)</option>
                        <option value="sifat">Sadece Sıfatlar (Boş)</option>
                        <option value="rastgele">Rastgele (Her 5 kelime)</option>
                    </select>
                </div>

                {/* Min Sentences */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Hedef Cümle Sayısı: {settings.minSentences}</label>
                    <input 
                        type="range" min="1" max="10" 
                        value={settings.minSentences}
                        onChange={(e) => onChange({ minSentences: parseInt(e.target.value) })}
                        className="w-full accent-amber-500"
                    />
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:bg-slate-700/40 transition-all group">
                        <input 
                            type="checkbox" 
                            checked={settings.emotionRadar} 
                            onChange={(e) => onChange({ emotionRadar: e.target.checked })} 
                            className="form-checkbox text-amber-500 rounded-md h-5 w-5 bg-slate-900 border-slate-700" 
                        />
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-200 font-semibold group-hover:text-amber-300 transition-colors">Duygu Radarı / Eşleştirme</span>
                            <span className="text-xs text-slate-500">Paragraf yanlarına karakter duygusu eşleştirme kutuları ekler.</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default YaraticiYazarlikSettingsPanel;
