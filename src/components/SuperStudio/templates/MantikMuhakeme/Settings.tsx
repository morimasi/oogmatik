import React from 'react';
import { TemplateSettingsProps } from '../registry';
import { MantikMuhakemeSettings } from './types';

export const MantikMuhakemeSettingsPanel: React.FC<TemplateSettingsProps<MantikMuhakemeSettings>> = ({ settings, onChange }) => {
    return (
        <div className="space-y-6">
            <h3 className="text-lg font-medium text-slate-100 border-b border-slate-700 pb-2">Mantık & Muhakeme (Sıralama) Ayarları</h3>
            
            <div className="space-y-4">
                {/* Sequence Steps */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Olay Sıralama Aşama Sayısı: {settings.sequenceSteps}</label>
                    <input 
                        type="range" min="3" max="6" 
                        value={settings.sequenceSteps}
                        onChange={(e) => onChange({ sequenceSteps: parseInt(e.target.value) })}
                        className="w-full accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 px-1">
                        <span>3 Adım (Basit)</span>
                        <span>6 Adım (Karmaşık)</span>
                    </div>
                </div>

                {/* Matrix Size */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-slate-300">Mantık Matrisi Boyutu</label>
                    <select 
                        value={settings.matrixSize} 
                        onChange={(e) => onChange({ matrixSize: e.target.value as any })}
                        disabled={!settings.logicMatrix}
                        className={`bg-slate-800 border border-slate-700 text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none ${!settings.logicMatrix ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <option value="3x3">3x3 (Küçük Matris)</option>
                        <option value="3x4">3x4 (Orta Matris)</option>
                        <option value="4x4">4x4 (Büyük Matris)</option>
                    </select>
                </div>

                {/* Toggles */}
                <div className="grid grid-cols-1 gap-3">
                    <label className="flex items-center space-x-3 cursor-pointer p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:bg-slate-700/40 transition-all group">
                        <input 
                            type="checkbox" 
                            checked={settings.logicMatrix} 
                            onChange={(e) => onChange({ logicMatrix: e.target.checked })} 
                            className="form-checkbox text-indigo-500 rounded-md h-5 w-5 bg-slate-900 border-slate-700" 
                        />
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-200 font-semibold group-hover:text-indigo-300 transition-colors">Sözel Sudoku / Matris Modu</span>
                            <span className="text-xs text-slate-500">Mantıksal ipuçlarıyla doldurulan tablo bulmacası.</span>
                        </div>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer p-4 bg-slate-800/40 rounded-2xl border border-slate-700/50 hover:bg-slate-700/40 transition-all group">
                        <input 
                            type="checkbox" 
                            checked={settings.detailDetective} 
                            onChange={(e) => onChange({ detailDetective: e.target.checked })} 
                            className="form-checkbox text-indigo-500 rounded-md h-5 w-5 bg-slate-900 border-slate-700" 
                        />
                        <div className="flex flex-col">
                            <span className="text-sm text-slate-200 font-semibold group-hover:text-indigo-300 transition-colors">Mantık Hatası (Dedektif Modu)</span>
                            <span className="text-xs text-slate-500">Hikayeye gizlenmiş tutarsızlıkları bulma oyunu.</span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
};

export default MantikMuhakemeSettingsPanel;
