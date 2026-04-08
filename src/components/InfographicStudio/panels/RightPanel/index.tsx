import React from 'react';
import { PedagogicalNoteCard } from './PedagogicalNoteCard';
import { ExportActions } from './ExportActions';
import { TemplateInfoCard } from './TemplateInfoCard';
import { CompositeWorksheet } from '../../../../types/worksheet';

interface RightPanelProps {
    result: CompositeWorksheet | null;
    onExportWorksheet: () => void;
    onExportPDF: () => void;
    onPrint: () => void;
    onSaveToArchive: () => void;
    onAddToWorkbook: () => void;
    onSubmitForApproval: () => void;
    isGenerating: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = ({
    result,
    onExportWorksheet,
    onExportPDF,
    onPrint,
    onSaveToArchive,
    onAddToWorkbook,
    onSubmitForApproval,
    isGenerating
}) => {
    const hasResult = !!result && !isGenerating;

    return (
        <div className="w-80 h-full flex flex-col bg-slate-900/50 backdrop-blur-md border-l border-white/10 p-4">
            <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">

                {/* Eğer sonuç yoksa placeholder göster, varsa gerçek kartları göster */}
                {hasResult ? (
                    <>
                        <ExportActions
                            onExportWorksheet={onExportWorksheet}
                            onExportPDF={onExportPDF}
                            onPrint={onPrint}
                            onSaveToArchive={onSaveToArchive}
                            onAddToWorkbook={onAddToWorkbook}
                            onSubmitForApproval={onSubmitForApproval}
                            disabled={!hasResult}
                        />

                        <PedagogicalNoteCard note={result.pedagogicalNote} />

                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-white/40 space-y-4">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                            <span className="text-xl opacity-50">🧭</span>
                        </div>
                        <p className="text-sm">
                            Üretilen sayfaya ait yapısal ayarlar, pedagojik açıklamalar ve kayıt butonları üretim tamamlandığında burada görünecektir.
                        </p>
                    </div>
                )}

            </div>
        </div>
    );
};
