import React from 'react';
import { useSariKitapStore } from '../../../store/useSariKitapStore';
import { printService } from '../../../utils/printService';
import { snapshotService } from '../../../utils/snapshotService';
import { useToastStore } from '../../../store/useToastStore';

interface RightPanelProps {
  onSave?: (name: string, activityType: any, data: any) => Promise<any>;
  onAddToWorkbook?: (item: any) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ onSave, onAddToWorkbook }) => {
  const { result, selectedActivity, isGenerating, setIsGenerating } = useSariKitapStore();
  const showToast = useToastStore((state) => state.showToast);

  const handleAction = async (action: 'PDF' | 'PNG' | 'DOCX' | 'PRINT' | 'SHARE') => {
    if (!result) return;
    
    const targetSelector = '#sari-kitap-preview';
    const title = result.title || 'Sarı Kitap Etkinliği';

    try {
      setIsGenerating(true);

      switch (action) {
        case 'PDF':
          showToast('PDF Hazırlanıyor...', 'info');
          await printService.generateRealPdf(targetSelector, title, {
            quality: 'print',
            paperSize: 'Extreme_Dikey',
          });
          showToast('PDF Başarıyla İndirildi', 'success');
          break;

        case 'PRINT':
          await printService.generatePdf(targetSelector, title, {
            action: 'print',
            paperSize: 'Extreme_Dikey',
          });
          break;

        case 'PNG':
          showToast('Görüntü Hazırlanıyor...', 'info');
          await snapshotService.takeSnapshot(targetSelector, title, 'download_png', 2);
          showToast('PNG Başarıyla İndirildi', 'success');
          break;

        case 'DOCX':
          showToast('DOCX formatı şu an hazırlık aşamasında.', 'info');
          break;

        case 'SHARE':
          // Basit paylaşım simülasyonu
          const shareUrl = window.location.href;
          await navigator.clipboard.writeText(shareUrl);
          showToast('Paylaşım linki kopyalandı!', 'success');
          break;

        default:
          break;
      }
    } catch (err) {
      console.error(`${action} hatası:`, err);
      showToast(`${action} işlemi başarısız oldu.`, 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-80 h-full bg-[var(--bg-default)] border-l border-[var(--border-color)] flex flex-col p-6">
      <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-6 block px-1">
        Dışa Aktar ve Paylaş
      </label>

      <div className="space-y-4">
        {/* PDF İndir */}
        <button
          onClick={() => handleAction('PDF')}
          disabled={!result || isGenerating}
          className={`w-full py-4 rounded-[2rem] text-sm font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
            !result || isGenerating
              ? 'bg-[var(--bg-paper)] text-[var(--text-muted)] cursor-not-allowed'
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
            className="py-3 px-2 bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-2xl text-[10px] font-bold text-[var(--text-primary)] flex items-center justify-center gap-2 transition-all disabled:opacity-30"
          >
            <i className="fa-solid fa-image text-blue-400"></i>
            PNG
          </button>
          
          {/* DOCX İndir */}
          <button
            onClick={() => handleAction('DOCX')}
            disabled={!result || isGenerating}
            className="py-3 px-2 bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-2xl text-[10px] font-bold text-[var(--text-primary)] flex items-center justify-center gap-2 transition-all disabled:opacity-30"
          >
            <i className="fa-solid fa-file-word text-blue-500"></i>
            DOCX
          </button>
        </div>

        <div className="h-px bg-[var(--border-color)] my-4"></div>

        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block px-1">
          Koleksiyon Yönetimi
        </label>

        {/* Kaydet */}
        <button
          onClick={async () => {
            if (onSave && result) {
              try {
                setIsGenerating(true);
                await onSave(result.title || 'Sarı Kitap', selectedActivity, result);
                showToast('Etkinlik koleksiyona kaydedildi', 'success');
              } catch (e) {
                showToast('Kaydetme hatası', 'error');
              } finally {
                setIsGenerating(false);
              }
            }
          }}
          disabled={!result || isGenerating}
          className="w-full py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-2xl text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-3 transition-all disabled:opacity-30"
        >
          <i className="fa-solid fa-cloud-arrow-up text-emerald-500"></i>
          BULUTA KAYDET
        </button>

        {/* Kitapçığa Ekle */}
        <button
          onClick={() => {
            if (onAddToWorkbook && result) {
              onAddToWorkbook(result);
              showToast('Kitapçığa eklendi', 'success');
            }
          }}
          disabled={!result || isGenerating}
          className="w-full py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-2xl text-xs font-bold text-[var(--text-primary)] flex items-center justify-center gap-3 transition-all disabled:opacity-30"
        >
          <i className="fa-solid fa-plus-circle text-yellow-500"></i>
          KİTAPÇIĞA EKLE
        </button>

        <div className="h-px bg-[var(--border-color)] my-4"></div>

        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2 block px-1">
          Hızlı Erişim
        </label>

        <div className="grid grid-cols-2 gap-3">
          {/* Yazdır */}
          <button
            onClick={() => handleAction('PRINT')}
            disabled={!result || isGenerating}
            className="py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-2xl text-[10px] font-bold text-[var(--text-primary)] flex items-center justify-center gap-2 transition-all disabled:opacity-30"
          >
            <i className="fa-solid fa-print"></i>
            YAZDIR
          </button>

          {/* Paylaş */}
          <button
            onClick={() => handleAction('SHARE')}
            disabled={!result || isGenerating}
            className="py-3 bg-[var(--bg-paper)] border border-[var(--border-color)] hover:border-[var(--accent-color)]/30 rounded-2xl text-[10px] font-bold text-[var(--text-primary)] flex items-center justify-center gap-2 transition-all disabled:opacity-30"
          >
            <i className="fa-solid fa-share-nodes"></i>
            PAYLAŞ
          </button>
        </div>
      </div>

      <div className="mt-auto p-4 rounded-2xl bg-[var(--bg-paper)]/50 border border-[var(--border-color)]">
        <p className="text-[9px] text-[var(--text-muted)] font-medium leading-relaxed">
          <i className="fa-solid fa-circle-info mr-1 text-yellow-500/50"></i>
          Sarı Kitap serisi, klinik olarak onaylanmış görsel-dikkat protokollerini temel alır.
        </p>
      </div>
    </div>
  );
};
