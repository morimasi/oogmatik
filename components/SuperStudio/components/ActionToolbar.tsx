import React from 'react';

export const ActionToolbar: React.FC = () => {

    const handleSave = () => {
        console.log("Kaydediliyor (Firestore)...");
    };

    const handlePrint = () => {
        window.print();
    };

    const handleScreenshot = () => {
        console.log("Çoklu sayfa ekran görüntüsü alınıyor (html2canvas)...");
    };

    const handleAddToWorkbook = () => {
        console.log("Kitapçığa ekleniyor (Workbook API)...");
    };

    const handleShare = () => {
        console.log("Uygulama içi paylaşım / Link oluşturuluyor...");
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleSave}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700 flex items-center gap-1"
                title="Sisteme Kaydet veya Arşivle"
            >
                💾 <span className="hidden sm:inline">Kaydet</span>
            </button>
            <button
                onClick={handleAddToWorkbook}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700 flex items-center gap-1"
                title="Kayıtlı Bir Kitapçığa Ekle"
            >
                📚 <span className="hidden sm:inline">Kitapçığa Ekle</span>
            </button>
            <button
                onClick={handleShare}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700 flex items-center gap-1"
                title="Öğrenci veya Veli ile Paylaş"
            >
                🔗 <span className="hidden sm:inline">Paylaş</span>
            </button>
            <button
                onClick={handleScreenshot}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors border border-slate-700 flex items-center gap-1"
                title="Tüm Sayfaları PNG Yap"
            >
                📸 <span className="hidden lg:inline">Ekran Görüntüsü</span>
            </button>
            <button
                onClick={handlePrint}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded text-xs transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-1"
                title="A4 Olarak Yazdır veya PDF İndir"
            >
                🖨️ <span className="hidden sm:inline">Yazdır / PDF</span>
            </button>
        </div>
    );
};
