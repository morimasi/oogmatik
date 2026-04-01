import React from 'react';
import { MainSettingsPanel } from './components/MainSettingsPanel';
import { TemplateMenu } from './components/TemplateMenu';
import { ConfiguratorCascade } from './components/ConfiguratorCascade';
import { A4PreviewPanel } from './components/A4PreviewPanel';

export const SuperStudio: React.FC = () => {
    return (
        <div className="flex h-full w-full bg-slate-900 text-slate-100 overflow-hidden font-inter">
            {/* Sol Panel: Ayarlar ve Düzenleme */}
            <div className="w-[450px] flex-shrink-0 flex flex-col border-r border-slate-700/50 bg-slate-800/80 backdrop-blur-md shadow-xl relative z-10">
                <div className="p-6 border-b border-slate-700/50 bg-slate-800">
                    <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                        Super Türkçe Stüdyosu
                    </h1>
                    <p className="text-sm text-slate-400 mt-1">Premium İçerik Üretim Merkezi</p>
                </div>

                <div className="flex-1 min-h-0 overflow-y-auto w-full custom-scrollbar">
                    <div className="p-4 space-y-8">
                        {/* Ana Ayarlar */}
                        <MainSettingsPanel />

                        {/* Şablon Seçimi */}
                        <div className="border-t border-slate-700/50 pt-8">
                            <TemplateMenu />
                        </div>

                        {/* Seçilen Şablonların Ayarları */}
                        <div className="border-t border-slate-700/50 pt-8">
                            <ConfiguratorCascade />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sağ Panel: A4 Önizleme ve Operasyonlar */}
            <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
                <A4PreviewPanel />
            </div>
        </div>
    );
};

export default SuperStudio;
