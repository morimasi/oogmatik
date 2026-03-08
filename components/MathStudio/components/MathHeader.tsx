// Math Studio — Top Header Bar

import React from 'react';
import { MathMode } from '../../../types/math';

interface MathHeaderProps {
    mode: MathMode;
    setMode: (mode: MathMode) => void;
    onBack: () => void;
    onPrint: (action: 'print' | 'download') => void;
    onSave: () => void;
    onShare: () => void;
    onAddToWorkbook?: () => void;
    onRegenerate: () => void;
    onToggleSidebar: () => void;
    isPrinting: boolean;
    isSaving: boolean;
    isSidebarOpen: boolean;
}

export const MathHeader: React.FC<MathHeaderProps> = ({
    mode, setMode, onBack, onPrint, onSave, onShare, onAddToWorkbook,
    onRegenerate, onToggleSidebar, isPrinting, isSaving, isSidebarOpen,
}) => (
    <div className="h-14 bg-[#18181b] border-b border-zinc-800 flex justify-between items-center px-4 shrink-0 z-50">
        {/* LEFT */}
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors">
                <i className="fa-solid fa-arrow-left"></i>
            </button>

            {/* Sidebar toggle (mobile) */}
            <button
                onClick={onToggleSidebar}
                className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 transition-colors lg:hidden"
                title={isSidebarOpen ? 'Paneli Kapat' : 'Paneli Aç'}
            >
                <i className={`fa-solid ${isSidebarOpen ? 'fa-xmark' : 'fa-bars'}`}></i>
            </button>

            <div>
                <h1 className="font-black text-lg tracking-tight text-white flex items-center gap-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">MATH STUDIO</span>
                    <span className="bg-zinc-800 text-zinc-500 px-1.5 rounded text-[9px] border border-zinc-700 font-bold uppercase tracking-widest">PRO</span>
                </h1>
            </div>
        </div>

        {/* CENTER — Mode Switch */}
        <div className="flex bg-zinc-800 border border-zinc-700 rounded-xl p-1 gap-1">
            <button onClick={() => setMode('drill')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'drill' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>
                <i className="fa-solid fa-calculator"></i>
                <span className="hidden sm:inline">İşlem Atölyesi</span>
            </button>
            <button onClick={() => setMode('problem_ai')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${mode === 'problem_ai' ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-white'}`}>
                <i className="fa-solid fa-robot"></i>
                <span className="hidden sm:inline">AI Problemleri</span>
            </button>
        </div>

        {/* RIGHT — Actions */}
        <div className="flex items-center gap-1.5">
            {/* Regenerate */}
            <button onClick={onRegenerate} className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-indigo-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Yeniden Üret">
                <i className="fa-solid fa-rotate"></i>
            </button>

            <div className="h-6 w-px bg-zinc-800 mx-1 hidden sm:block"></div>

            <button onClick={() => onPrint('download')} disabled={isPrinting} className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="PDF İndir">
                {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
            </button>
            <button onClick={() => onPrint('print')} disabled={isPrinting} className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors hidden sm:flex" title="Yazdır">
                <i className="fa-solid fa-print"></i>
            </button>
            <button onClick={onShare} className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Paylaş">
                <i className="fa-solid fa-share-nodes"></i>
            </button>

            {onAddToWorkbook && (
                <button onClick={onAddToWorkbook} className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-emerald-600 flex items-center justify-center text-zinc-400 hover:text-white transition-colors" title="Kitapçığa Ekle">
                    <i className="fa-solid fa-plus-circle"></i>
                </button>
            )}

            <button
                onClick={onSave}
                disabled={isSaving}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${isSaving ? 'bg-zinc-700 text-zinc-400' : 'bg-white text-black hover:bg-zinc-200'}`}
            >
                {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-save"></i>}
                <span className="hidden sm:inline">Kaydet</span>
            </button>
        </div>
    </div>
);
