import React from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { ActivityType, Curriculum } from '../../types';
import { useToastStore } from '../../store/useToastStore';

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

export const CurriculumHeader: React.FC<CurriculumHeaderProps> = ({
    onBack,
    step,
    setStep,
    curriculum,
    isSaved,
    isSaving,
    isPrinting,
    handleSave,
    handlePrint,
    onOpenShareModal
}) => {
    const toast = useToastStore();

    const handleAddToFascicle = () => {
        if (!curriculum) return;
        try {
            const { addItem, items } = useFascicleStore.getState();
            addItem({
                id: crypto.randomUUID(),
                type: ActivityType.CURRICULUM,
                difficulty: 'Orta',
                pageCount: curriculum.schedule.length,
                order: items.length,
                content: { curriculum },
            });
            toast.success(`"${curriculum.studentName}" eğitim planı fasiküle eklendi!`);
        } catch {
            toast.error('Fasiküle eklenirken bir sorun oluştu.');
        }
    };

    return (
        <div className="h-16 border-b border-[var(--border-color)] bg-[var(--bg-paper)]/90 backdrop-blur-md flex justify-between items-center px-4 md:px-6 shadow-sm shrink-0 z-20 print:hidden">
            <div className="flex items-center gap-3">
                <button
                    onClick={onBack}
                    className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center transition-colors text-[var(--text-muted)] border border-[var(--border-color)] active:scale-95"
                    title="Geri Dön"
                >
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                {step >= 1 && (
                    <button
                        onClick={() => setStep(0)}
                        className="px-3.5 h-10 rounded-xl bg-[var(--bg-secondary)] hover:bg-[var(--bg-secondary)]/80 flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-xs font-bold uppercase tracking-wider border border-[var(--border-color)]"
                    >
                        <i className="fa-solid fa-map-location-dot text-indigo-500"></i> Plan Kütüphanesi
                    </button>
                )}
                <h2 className="text-base md:text-lg font-black text-[var(--text-primary)] flex items-center gap-2.5 uppercase tracking-tight">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-sm shadow-sm">
                        <i className="fa-solid fa-calendar-check"></i>
                    </span>
                    <span>Akıllı Müfredat Stüdyosu</span>
                </h2>
            </div>
            
            <div className="flex items-center gap-2">
                {step === 4 && curriculum && (
                    <>
                        <button
                            onClick={onOpenShareModal}
                            className="w-10 h-10 rounded-xl hover:bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-600 transition-colors border border-[var(--border-color)]"
                            title="Planı Paylaş"
                        >
                            <i className="fa-solid fa-share-nodes"></i>
                        </button>
                        
                        <button
                            onClick={() => handlePrint('download')}
                            disabled={isPrinting}
                            className="w-10 h-10 rounded-xl bg-[var(--text-primary)] text-[var(--bg-paper)] hover:opacity-90 flex items-center justify-center transition-all disabled:opacity-50"
                            title="A4 PDF Olarak İndir"
                        >
                            {isPrinting ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-file-pdf"></i>}
                        </button>

                        <button
                            onClick={() => handlePrint('print')}
                            disabled={isPrinting}
                            className="w-10 h-10 rounded-xl bg-[var(--text-primary)] text-[var(--bg-paper)] hover:opacity-90 flex items-center justify-center transition-all disabled:opacity-50"
                            title="Doğrudan Yazdır"
                        >
                            <i className="fa-solid fa-print"></i>
                        </button>

                        <button
                            onClick={handleAddToFascicle}
                            className="w-10 h-10 rounded-xl bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 text-white flex items-center justify-center transition-all shadow-md shadow-fuchsia-500/20 active:scale-95"
                            title="Tüm Planı Fasiküle Ekle"
                        >
                            <i className="fa-solid fa-layer-group"></i>
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={isSaved || isSaving}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-md ${
                                isSaved
                                    ? 'bg-emerald-600 text-white cursor-default'
                                    : 'bg-[var(--accent-color)] text-white hover:bg-[var(--accent-hover)] shadow-indigo-500/20 active:scale-95'
                            }`}
                        >
                            {isSaving ? (
                                <i className="fa-solid fa-circle-notch fa-spin"></i>
                            ) : isSaved ? (
                                <>
                                    <i className="fa-solid fa-check"></i>
                                    <span>Plan Kaydedildi</span>
                                </>
                            ) : (
                                <>
                                    <i className="fa-solid fa-floppy-disk"></i>
                                    <span>Planı Arşivle</span>
                                </>
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};
