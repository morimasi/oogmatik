import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { A4FactorySheet } from '../shared/pdf/A4FactorySheet';
import { useSuperTurkceV2Store } from '../core/store';
import { ArchiveDrawer } from './components/ArchiveDrawer';

import { CockpitPanel } from './components/CockpitPanel';

// ===============================================
// 2. SAĞ PANEL (PREVIEW CANVAS)
// ===============================================
const PreviewCanvas: React.FC = () => {
    return (
        <div className="flex-1 bg-slate-200/50 h-full relative flex flex-col items-center p-8 overflow-hidden">

            {/* Araç Çubuğu */}
            <div className="absolute top-6 right-8 flex items-center bg-white rounded-xl shadow-sm border border-slate-200 p-1 z-10">
                <button className="px-4 py-2 hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-bold transition-colors">
                    <i className="fa-solid fa-magnifying-glass-plus mr-1"></i> Yaklaş
                </button>
                <div className="w-px h-6 bg-slate-200 mx-1"></div>

                <PDFDownloadLink
                    document={<A4FactorySheet />}
                    fileName="SuperTurkce_V2_Uretim.pdf"
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold transition-colors flex items-center gap-2"
                >
                    {({ loading }: any) => (
                        <>
                            <i className={`fa-solid ${loading ? 'fa-spinner fa-spin' : 'fa-download'}`}></i>
                            {loading ? 'Dizgi Yapılıyor...' : 'PDF İndir'}
                        </>
                    )}
                </PDFDownloadLink>
            </div>

            {/* A4 Kağıt Gösterimi */}
            <div className="w-full h-full max-w-4xl bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col mt-12">
                {/* 
                    NOT: PDFViewer componenti React-PDF'te web ortamı için native bir tag'dir. 
                    Iframe gibi davranarak canlı PDF mockup'ı oluşturur. 
                */}
                <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={false}>
                    <A4FactorySheet />
                </PDFViewer>
            </div>

        </div>
    );
};

// ===============================================
// 3. ANA LAYOUT (STUDIO)
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
                <PreviewCanvas />
            </div>

            {/* Arşiv Çekmecesi */}
            <ArchiveDrawer isOpen={isArchiveOpen} onClose={() => setIsArchiveOpen(false)} />
        </div>
    );
};
