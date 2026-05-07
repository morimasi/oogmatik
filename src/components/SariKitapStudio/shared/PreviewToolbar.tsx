import React from 'react';
import { useSariKitapStore } from '../../../store/useSariKitapStore';

interface PreviewToolbarProps {
    onPrint: () => void;
    onExportPDF: () => void;
    onExportPNG: () => void;
    onSave: () => void;
    onShare: () => void;
    onAddToWorkbook?: () => void;
    isGenerating: boolean;
}

export const PreviewToolbar = ({
    onPrint,
    onExportPDF,
    onExportPNG,
    onSave,
    onShare,
    onAddToWorkbook,
    isGenerating,
}: PreviewToolbarProps) => {
    const { 
        previewScale, 
        setPreviewScale, 
        showGrid, 
        toggleGrid,
        generatedContent 
    } = useSariKitapStore();

    return (
        <div className="flex items-center justify-between w-full p-2 mb-6 rounded-2xl shadow-xl z-30" style={{ backgroundColor: 'var(--surface-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2 px-2">
                <button
                    className={`h-9 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider transition-all ${isGenerating || !generatedContent ? 'opacity-40 cursor-not-allowed bg-zinc-800/20 text-zinc-500 border border-zinc-700/50' : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10'}`}
                    onClick={onSave}
                    disabled={isGenerating || !generatedContent}
                    title="Çalışmayı Kaydet"
                >
                    <i className="fa-solid fa-floppy-disk"></i>
                    Kaydet
                </button>
                <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
                <button
                    className={`h-9 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider transition-all ${isGenerating || !generatedContent ? 'opacity-40 cursor-not-allowed bg-transparent text-zinc-500 border border-transparent' : 'bg-transparent hover:bg-zinc-800/50 text-zinc-300 border border-zinc-700/50'}`}
                    onClick={onPrint}
                    disabled={isGenerating || !generatedContent}
                    title="Yazdır"
                >
                    <i className="fa-solid fa-print"></i>
                    Yazdır
                </button>
                
                <div className="relative group">
                    <button 
                        className={`h-9 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider transition-all ${isGenerating || !generatedContent ? 'opacity-40 cursor-not-allowed bg-transparent text-zinc-500 border border-transparent' : 'bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30'}`}
                        disabled={isGenerating || !generatedContent}
                    >
                        <i className="fa-solid fa-download"></i>
                        İndir <i className="fa-solid fa-chevron-down text-[9px] opacity-70 ml-1"></i>
                    </button>
                    
                    {/* Dropdown Menu - Hover ile açılır */}
                    {generatedContent && !isGenerating && (
                        <div className="absolute top-full left-0 mt-2 w-48 rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden" 
                             style={{ backgroundColor: 'var(--bg-paper)', border: '1px solid var(--border-color)' }}>
                            <button onClick={onExportPDF} className="w-full h-10 px-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider hover:bg-zinc-800/50 text-zinc-300 transition-colors border-b border-zinc-800">
                                <i className="fa-solid fa-file-pdf text-rose-400"></i> PDF Aktar
                            </button>
                            <button onClick={onExportPNG} className="w-full h-10 px-4 flex items-center gap-3 text-[11px] font-bold uppercase tracking-wider hover:bg-zinc-800/50 text-zinc-300 transition-colors">
                                <i className="fa-solid fa-file-image text-emerald-400"></i> PNG Aktar
                            </button>
                        </div>
                    )}
                </div>

                <div className="w-px h-5 mx-1" style={{ backgroundColor: 'var(--border-color)' }}></div>
                <button
                    className={`h-9 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider transition-all ${isGenerating || !generatedContent ? 'opacity-40 cursor-not-allowed bg-transparent text-zinc-500 border border-transparent' : 'bg-transparent hover:bg-zinc-800/50 text-zinc-300 border border-zinc-700/50'}`}
                    onClick={onShare}
                    disabled={isGenerating || !generatedContent}
                    title="Paylaş"
                >
                    <i className="fa-solid fa-link"></i>
                    Paylaş
                </button>
                {onAddToWorkbook && (
                    <button
                        className={`h-9 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-[11px] uppercase tracking-wider transition-all ${isGenerating || !generatedContent ? 'opacity-40 cursor-not-allowed bg-transparent text-zinc-500 border border-transparent' : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}
                        onClick={onAddToWorkbook}
                        disabled={isGenerating || !generatedContent}
                        title="Kitapçığa Ekle"
                    >
                        <i className="fa-solid fa-book-open"></i>
                        Kitapçığa Ekle
                    </button>
                )}
            </div>

            {/* Sağ Taraftaki Scale ve Ayarlar */}
            <div className="flex items-center gap-4 pr-2">
                <div className="sk-toolbar-scale">
                    <span style={{ fontSize: '0.75rem', color: 'var(--sk-text-muted)', minWidth: '3ch' }}>
                        {Math.round(previewScale * 100)}%
                    </span>
                    <input
                        type="range"
                        min={0.3}
                        max={1.5}
                        step={0.1}
                        value={previewScale}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPreviewScale(Number(e.target.value))}
                        style={{ width: '80px' }}
                    />
                </div>
                <button
                    className={`sk-btn sk-btn-icon ${showGrid ? 'active' : ''}`}
                    onClick={toggleGrid}
                    title="Izgara Göster/Gizle"
                >
                    #
                </button>
            </div>

            {generatedContent && (generatedContent.pedagogicalNote || (generatedContent.targetSkills && generatedContent.targetSkills.length > 0)) && (
                <div className="sk-toolbar-info">
                    <div className="sk-info-trigger">💡 Bilgi</div>
                    <div className="sk-info-tooltip">
                        {generatedContent.pedagogicalNote && (
                            <>
                                <div className="sk-section-title">Pedagojik Not</div>
                                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)', marginBottom: '0.75rem' }}>
                                    {generatedContent.pedagogicalNote}
                                </p>
                            </>
                        )}
                        {generatedContent.targetSkills && generatedContent.targetSkills.length > 0 && (
                            <>
                                <div className="sk-section-title">Hedef Beceriler</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                                    {generatedContent.targetSkills.map((skill: string, i: number) => (
                                        <span key={i} className="sk-skill-badge">{skill}</span>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
