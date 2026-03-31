import React, { useState } from 'react';
import { EmptyState } from './EmptyState';
import { A4PrintableSheetV2 } from './A4PrintableSheetV2';
import { CompositeWorksheet } from '../../../../types/worksheet';
import { Layout, Monitor, Moon, Sun, MonitorSmartphone } from 'lucide-react';
import { cn } from '../../../../utils/tailwindUtils';

interface CenterPanelProps {
    result: CompositeWorksheet | null;
    isGenerating: boolean;
}

type ViewMode = 'a4' | 'presentation' | 'dark' | 'mobile';

export const CenterPanel: React.FC<CenterPanelProps> = ({ result, isGenerating }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('a4');

    return (
        <div className="flex-1 h-full bg-slate-950/40 relative flex flex-col">
            {/* Üst Araç Çubuğu (Görünüm Formatları) */}
            {result && !isGenerating && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-full p-1.5 shadow-2xl">
                    <button
                        onClick={() => setViewMode('a4')}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                            viewMode === 'a4' ? "bg-indigo-500 text-white shadow-md" : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Layout className="w-3.5 h-3.5" />
                        <span>A4 / PDF Görünümü</span>
                    </button>
                    <button
                        onClick={() => setViewMode('presentation')}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                            viewMode === 'presentation' ? "bg-indigo-500 text-white shadow-md" : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Sunum (Tam Ekran)</span>
                    </button>
                    <button
                        onClick={() => setViewMode('dark')}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                            viewMode === 'dark' ? "bg-indigo-500 text-white shadow-md" : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <Moon className="w-3.5 h-3.5" />
                        <span>Karanlık (Disleksi)</span>
                    </button>
                    <button
                        onClick={() => setViewMode('mobile')}
                        className={cn(
                            "flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                            viewMode === 'mobile' ? "bg-indigo-500 text-white shadow-md" : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <MonitorSmartphone className="w-3.5 h-3.5" />
                        <span>Mobil Önizleme</span>
                    </button>
                </div>
            )}

            <div className={cn(
                "flex-1 flex items-center justify-center overflow-auto",
                viewMode === 'dark' ? 'bg-slate-900' : 'bg-slate-200/5'
            )}>
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center p-8 text-white/50 space-y-4">
                        <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                        <p className="font-medium animate-pulse">Composite Worksheet AI ile Üretiliyor...</p>
                    </div>
                ) : result ? (
                    <div className={cn(
                        "transition-all duration-500 w-full h-full flex justify-center items-start pt-20 pb-12",
                        viewMode === 'a4' && "px-6",
                        viewMode === 'presentation' && "px-0 max-w-[1200px] w-full pt-16",
                        viewMode === 'dark' && "px-6 invert hue-rotate-180",
                        viewMode === 'mobile' && "px-6"
                    )}>
                        <div className={cn(
                            "transition-all duration-500 shadow-2xl overflow-hidden relative",
                            viewMode === 'a4' ? "w-[210mm] min-h-[297mm] bg-white border border-slate-300" :
                            viewMode === 'presentation' ? "w-full min-h-[80vh] bg-white rounded-2xl" :
                            viewMode === 'dark' ? "w-[210mm] min-h-[297mm] bg-white border border-slate-300" :
                            viewMode === 'mobile' ? "w-[375px] min-h-[812px] bg-white rounded-[3rem] border-[12px] border-slate-800" : ""
                        )}>
                            <A4PrintableSheetV2 worksheet={result} />
                        </div>
                    </div>
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
};
