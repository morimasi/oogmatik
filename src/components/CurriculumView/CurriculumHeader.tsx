import React from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { ActivityType, Curriculum } from '../../types';

interface CurriculumHeaderProps {
    onBack: () => void;
    step: number;
    setStep: (s: number) => void;
    curriculum: Curriculum | null;
    isSaved: boolean;
    isSaving: boolean;
    isPrinting: boolean;
    handleSave: () => Promise<void>;
    handlePrint: (action: 'print' | 'download') => Promise<void>;
    onOpenShareModal: () => void;
}

export const CurriculumHeader: React.FC<CurriculumHeaderProps> = ({ onBack, step, setStep, curriculum, isSaved, isSaving, isPrinting, handleSave, handlePrint, onOpenShareModal }) => {
    return (
        <div className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-paper)] flex justify-between items-center px-6 shadow-sm shrink-0 z-20 print:hidden">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-colors text-[var(--text-muted)] border border-[var(--border-color)]" title="Çıkış">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                {step >= 1 && (
                    <button onClick={() => setStep(0)} className="px-3 h-10 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-xs font-bold uppercase tracking-wider border border-[var(--border-color)]">
                        <i className="fa-solid fa-map-location-dot"></i> Plan Listesi
                    </button>
                )}
                <h2 className="text-lg font-black text-[var(--text-primary)] flex items-center gap-2 italic uppercase tracking-tighter">
                    <i className="fa-solid fa-calendar-check text-[var(--accent-color)]"></i> Akıllı Müfredat Stüdyosu
                </h2>
            </div>
            <div className="flex gap-3">
                {step === 4 && curriculum && (
                    <>
                        <button onClick={onOpenShareModal} className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] transition-colors border border-[var(--border-color)]" title="Paylaş"><i className="fa-solid fa-share-nodes"></i></button>
                        <button onClick={() => handlePrint('download')} disabled={isPrinting} className="w-10 h-10 rounded-xl bg-[var(--text-primary)] text-[var(--bg-paper)] hover:opacity-90 flex items-center justify-center transition-colors">{isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}</button>
                        <button onClick={() => handlePrint('print')} disabled={isPrinting} className="w-10 h-10 rounded-xl bg-[var(--text-primary)] text-[var(--bg-paper)] hover:opacity-90 flex items-center justify-center transition-colors"><i className="fa-solid fa-print"></i></button>
                        <button
                            onClick={() => {
                                const { addItem, items } = useFascicleStore.getState();
                                addItem({
                                    id: crypto.randomUUID(),
                                    type: ActivityType.CURRICULUM,
                                    difficulty: 'Orta',
                                    pageCount: curriculum ? curriculum.schedule.length : 1,
                                    order: items.length,
                                    content: { curriculum },

                                });
                            }}
                            className="w-10 h-10 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-white flex items-center justify-center transition-colors shadow-sm"
                            title="Fasiküle Ekle"
                        ><i className="fa-solid fa-layer-group"></i></button>
                        <button onClick={handleSave} disabled={isSaved || isSaving} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${isSaved ? 'bg-emerald-600 text-white cursor-default' : 'bg-[var(--accent-color)] text-white hover:bg-[var(--accent-hover)]'}`}>
                            {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : isSaved ? <><i className="fa-solid fa-check"></i> Plan Kaydedildi</> : <><i className="fa-solid fa-save"></i> Planı Arşivle</>}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
