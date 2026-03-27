import React from 'react';
import { useSuperStudioStore } from '../../../store/useSuperStudioStore';
import { worksheetService } from '../../../services/worksheetService';
import { useAuthStore } from '../../../store/useAuthStore';
import { useToastStore } from '../../../store/useToastStore';

export const ActionToolbar: React.FC = () => {
    const { generatedContents, isGenerating } = useSuperStudioStore();
    const { user } = useAuthStore();
    const { addToast } = useToastStore();

    const handleSave = async () => {
        if (!user) {
            addToast("Kaydetmek için giriş yapmalısınız.", "error");
            return;
        }
        if (generatedContents.length === 0) return;

        try {
            // İlk sayfa baz alınarak kaydediliyor
            const content = generatedContents[0];
            
            // SingleWorksheetData formatına dönüştür
            const worksheetData: any[] = [{
                id: content.id,
                type: content.templateId,
                title: content.pages[0].title,
                content: content.pages[0].content,
                pedagogicalNote: content.pages[0].pedagogicalNote
            }];

            await worksheetService.saveWorksheet(
                user.uid,
                content.pages[0].title,
                content.templateId as any,
                worksheetData,
                'fa-solid fa-wand-magic-sparkles',
                { id: 'super-turkce', title: 'Süper Türkçe' },
                undefined,
                undefined,
                'default-student'
            );
            addToast("Çalışma başarıyla buluta kaydedildi.", "success");
        } catch (error) {
            console.error("Kaydetme hatası:", error);
            addToast("Kaydedilirken bir hata oluştu.", "error");
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="flex gap-3">
            <button
                onClick={handleSave}
                disabled={isGenerating || generatedContents.length === 0}
                className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700/50 flex items-center gap-2 backdrop-blur-md hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                title="Sisteme Kaydet veya Arşivle"
            >
                <i className="fa-solid fa-cloud-arrow-up text-teal-400"></i>
                <span className="hidden sm:inline">Kaydet</span>
            </button>
            <button
                className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700/50 flex items-center gap-2 backdrop-blur-md hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-sm"
                title="Kayıtlı Bir Kitapçığa Ekle"
                disabled={generatedContents.length === 0}
            >
                <i className="fa-solid fa-book-medical text-amber-400"></i>
                <span className="hidden sm:inline">Kitapçığa Ekle</span>
            </button>
            <button
                onClick={handlePrint}
                disabled={isGenerating || generatedContents.length === 0}
                className="px-5 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-teal-500/20 flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
                title="A4 Olarak Yazdır veya PDF İndir"
            >
                <i className="fa-solid fa-file-pdf"></i>
                <span className="hidden sm:inline uppercase tracking-tight">PDF Olarak İndir</span>
            </button>
        </div>
    );
};
