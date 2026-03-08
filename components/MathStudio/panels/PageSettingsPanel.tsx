// Math Studio — Page Settings Panel (Paper type, title, date, name)

import React from 'react';
import { MathPageConfig } from '../../../types/math';

interface PageSettingsPanelProps {
    pageConfig: MathPageConfig;
    setPageConfig: (config: MathPageConfig) => void;
}

export const PageSettingsPanel: React.FC<PageSettingsPanelProps> = ({ pageConfig, setPageConfig }) => (
    <div className="p-5 border-b border-zinc-800">
        <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-3">Sayfa Ayarları</h4>
        <div className="space-y-4">
            <div>
                <label className="block text-[10px] font-bold text-zinc-400 mb-1.5 uppercase">Başlık</label>
                <input
                    type="text"
                    value={pageConfig.title}
                    onChange={e => setPageConfig({ ...pageConfig, title: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none font-bold"
                />
            </div>
            <div className="flex gap-2 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                {(['blank', 'grid', 'dot'] as const).map(type => (
                    <button
                        key={type}
                        onClick={() => setPageConfig({ ...pageConfig, paperType: type })}
                        className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-colors ${pageConfig.paperType === type ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        {type === 'blank' ? 'Boş' : type === 'grid' ? 'Kareli' : 'Noktalı'}
                    </button>
                ))}
            </div>
            <div className="flex gap-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 font-bold hover:text-zinc-200 transition-colors">
                    <input
                        type="checkbox"
                        checked={pageConfig.showDate}
                        onChange={e => setPageConfig({ ...pageConfig, showDate: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-black border-zinc-700"
                    />
                    Tarih
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-400 font-bold hover:text-zinc-200 transition-colors">
                    <input
                        type="checkbox"
                        checked={pageConfig.showName}
                        onChange={e => setPageConfig({ ...pageConfig, showName: e.target.checked })}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-black border-zinc-700"
                    />
                    Ad Soyad
                </label>
            </div>
        </div>
    </div>
);
