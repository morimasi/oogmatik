import React from 'react';
import { useSariKitapStore } from '../../../store/useSariKitapStore';

interface RightPanelProps {
  onSave?: (name: string, activityType: any, data: any) => Promise<any>;
  onAddToWorkbook?: (item: any) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onSave, onAddToWorkbook }) => {
  const { result, selectedActivity, isGenerating } = useSariKitapStore();

  const handleAction = (action: string) => {
    if (!result) return;
    alert(`${action} işlemi başlatılıyor...`);
  };

  return (
    <div className="w-80 h-full bg-[#0B1120] border-l border-white/5 flex flex-col p-6">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6 block px-1">
        Dışa Aktar ve Paylaş
      </label>

      <div className="space-y-4">
        {/* PDF İndir */}
        <button
          onClick={() => handleAction('PDF')}
          disabled={!result || isGenerating}
          className={`w-full py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
            !result || isGenerating
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white shadow-xl shadow-red-500/20'
          }`}
        >
          <i className="fa-solid fa-file-pdf"></i>
          PREMIUM PDF
        </button>

        <div className="grid grid-cols-2 gap-3">
          {/* PNG İndir */}
          <button
            onClick={() => handleAction('PNG')}
            disabled={!result || isGenerating}
            className="py-3 px-2 bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl text-[10px] font-bold text-slate-300 flex items-center justify-center gap-2 transition-all disabled:opacity-30"
          >
            <i className="fa-solid fa-image text-blue-400"></i>
            PNG
          </button>
          
          {/* DOCX İndir */}
          <button
            onClick={() => handleAction('DOCX')}
            disabled={!result || isGenerating}
            className="py-3 px-2 bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl text-[10px] font-bold text-slate-300 flex items-center justify-center gap-2 transition-all disabled:opacity-30"
          >
            <i className="fa-solid fa-file-word text-blue-500"></i>
            DOCX
          </button>
        </div>

        <div className="h-px bg-white/5 my-4"></div>

        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block px-1">
          Koleksiyon Yönetimi
        </label>

        {/* Kaydet */}
        <button
          onClick={() => onSave && result && onSave(result.title || 'Sarı Kitap', selectedActivity, result)}
          disabled={!result || isGenerating}
          className="w-full py-3 bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-3 transition-all disabled:opacity-30"
        >
          <i className="fa-solid fa-cloud-arrow-up text-emerald-500"></i>
          BULUTA KAYDET
        </button>

        {/* Kitapçığa Ekle */}
        <button
          onClick={() => onAddToWorkbook && result && onAddToWorkbook(result)}
          disabled={!result || isGenerating}
          className="w-full py-3 bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl text-xs font-bold text-slate-200 flex items-center justify-center gap-3 transition-all disabled:opacity-30"
        >
          <i className="fa-solid fa-plus-circle text-yellow-500"></i>
          KİTAPÇIĞA EKLE
        </div>

        <div className="h-px bg-white/5 my-4"></div>

        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block px-1">
          Hızlı Erişim
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* Yazdır */}
          <button
            onClick={() => handleAction('PRINT')}
            disabled={!result || isGenerating}
            className="py-3 bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl text-[10px] font-bold text-slate-300 flex items-center justify-center gap-2 transition-all disabled:opacity-30"
          >
            <i className="fa-solid fa-print"></i>
            YAZDIR
          </button>

          {/* Paylaş */}
          <button
            onClick={() => handleAction('SHARE')}
            disabled={!result || isGenerating}
            className="py-3 bg-slate-900 border border-white/5 hover:border-white/10 rounded-2xl text-[10px] font-bold text-slate-300 flex items-center justify-center gap-2 transition-all disabled:opacity-30"
          >
            <i className="fa-solid fa-share-nodes"></i>
            PAYLAŞ
          </button>
        </div>
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-slate-900/50 border border-white/5">
        <p className="text-[9px] text-slate-500 font-medium leading-relaxed">
          <i className="fa-solid fa-circle-info mr-1 text-yellow-500/50"></i>
          Sarı Kitap serisi, klinik olarak onaylanmış görsel-dikkat protokollerini temel alır.
        </p>
      </div>
    </div>
  );
};
