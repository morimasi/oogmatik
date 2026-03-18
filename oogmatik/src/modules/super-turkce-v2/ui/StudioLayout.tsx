import React from 'react';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { A4FactorySheet } from '../shared/pdf/A4FactorySheet';
import { useSuperTurkceV2Store } from '../core/store';

// ===============================================
// 1. SOL PANEL (COCKPIT)
// ===============================================
const CockpitPanel: React.FC = () => {
    // Gelecekte SettingsPanel bileşenini buraya yedireceğiz
    return (
        <div className="w-1/3 min-w-[320px] max-w-[450px] bg-white border-r border-slate-200 h-full flex flex-col p-6 overflow-y-auto">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <i className="fa-solid fa-sliders text-brand-500"></i> Fabrika Ayarları
            </h2>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4 text-center">
                <i className="fa-solid fa-person-digging text-3xl mb-3 text-slate-400"></i>
                <p className="text-sm font-semibold text-slate-600">Ayarlar paneli dizgi aşamasında...</p>
                <p className="text-xs text-slate-400 mt-2">Daha sonra buraya sınıf, zorluk ve disleksi parametreleri eklenecek.</p>
            </div>

            <button className="mt-auto w-full py-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-bold shadow-lg shadow-brand-500/30 transition-all flex items-center justify-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles"></i> Matbaayı Çalıştır (Üret)
            </button>
        </div>
    );
};

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

export const StudioLayout: React.FC<Props> = ({ onBack }) => {
    const activeStudioId = useSuperTurkceV2Store(state => state.activeStudioId);

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
            </div>

            {/* İçerik Bölümü: Sol ve Sağ */}
            <div className="flex-1 flex overflow-hidden">
                <CockpitPanel />
                <PreviewCanvas />
            </div>
        </div>
    );
};
