import React from 'react';
import { A4FactorySheet } from '../shared/pdf/A4FactorySheet';
import { useSuperTurkceV2Store } from '../core/store';
import { ArchiveDrawer } from './components/ArchiveDrawer';
import { UniversalWorksheetViewer } from '../../../shared/components/UniversalWorksheetViewer';

import { CockpitPanel } from './components/CockpitPanel';

// ===============================================
// ANA LAYOUT (STUDIO)
// ===============================================
interface Props {
    onBack: () => void;
}

export const StudioLayout: React.FC<Props> = ({ onBack }: any) => {
    const activeStudioId = useSuperTurkceV2Store((state: any) => state.activeStudioId);
    const [isArchiveOpen, setIsArchiveOpen] = React.useState(false);

    if (!activeStudioId) {
        onBack();
        return null;
    }

    return (
        <div className="w-full h-full bg-slate-50 flex flex-col overflow-hidden">
            {/* Stüdyo Header */}
            <div className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center px-6 relative z-10 shadow-sm">
                <button onClick={onBack} className="w-10 h-10 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors mr-4">
                    <i className="fa-solid fa-arrow-left"></i>
                </button>
                <div className="flex flex-col">
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Üretim Bandı</h2>
                    <span className="text-xs text-slate-500 font-medium">Stüdyo: {activeStudioId.replace('-', ' ')}</span>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={() => setIsArchiveOpen(true)}
                        className="px-4 py-2 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-indigo-600 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                    >
                        <i className="fa-solid fa-box-archive"></i> Üretim Arşivi
                    </button>
                </div>
            </div>

            {/* İçerik Bölümü: Sol ve Sağ */}
            <div className="flex-1 flex overflow-hidden">
                <CockpitPanel />
                <UniversalWorksheetViewer 
                    isReady={true}
                    DocumentComponent={<A4FactorySheet />}
                    fileName={`Oogmatik_${activeStudioId || 'Uretim'}.pdf`}
                    title={`${activeStudioId?.replace('-', ' ').toUpperCase() || 'ÇALIŞMA KAĞIDI'}`}
                />
            </div>

            {/* Arşiv Çekmecesi */}
            <ArchiveDrawer isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} />
        </div>
    );
};
