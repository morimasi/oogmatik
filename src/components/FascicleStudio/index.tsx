import React, { useEffect, useState } from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { FascicleSidebar } from './FascicleSidebar';
import { FasciclePreview } from './FasciclePreview';
import { FascicleTemplatesModal } from './FascicleTemplatesModal';
import { ShareModal } from '../ShareModal';
import { FileDown, Undo, Redo, LayoutTemplate, Save, Share2, UserPlus, Printer } from 'lucide-react';
import { fascicleService } from '../../services/fascicleService';
import { worksheetService } from '../../services/worksheetService';
import { printService } from '../../utils/printService';
import { logError } from '../../utils/logger.js';
import { ActivityType } from '../../types';
import toast from 'react-hot-toast';

interface FascicleStudioProps {
  onBack?: () => void;
}

export const FascicleStudio: React.FC<FascicleStudioProps> = ({ onBack }) => {
  const { currentFascicleId, metadata, items, undo, redo, past, future } = useFascicleStore();
  const { user } = useAuthStore();
  const { setIsAssignModalOpen } = useAssignmentStore();
  
  const [isPrinting, setIsPrinting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFascicleId, setSavedFascicleId] = useState<string | null>(null);
  
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    if (currentFascicleId) {
       fascicleService.autoSaveDraft(currentFascicleId, { metadata, items }).catch(err => logError('AutoSave failed', err));
    }
  }, [items, metadata, currentFascicleId]);

  const handleDownloadPdf = async () => {
    try {
        setIsPrinting(true);
        toast.loading('PDF dosyası hazırlanıyor ve indiriliyor...', { id: 'print-toast' });
        await printService.generatePdf('#fascicle-print-container', metadata.title || 'Ozel_Egitim_Fasikulu', {
            action: 'download',
            quality: 'high'
        });
        toast.success('PDF indirme işlemi tamamlandı!', { id: 'print-toast' });
    } catch (error) {
        logError(error as Error, { context: 'Fasikül PDF olarak indirilemedi' });
        toast.error('PDF işlemi başlatılamadı. Lütfen tekrar deneyin.', { id: 'print-toast' });
    } finally {
        setIsPrinting(false);
    }
  };

  const handlePrint = async () => {
    try {
        setIsPrinting(true);
        toast.loading('Yazdırma modülü hazırlanıyor...', { id: 'print-toast' });
        await printService.generatePdf('#fascicle-print-container', metadata.title || 'Ozel_Egitim_Fasikulu', {
            action: 'print',
            quality: 'high'
        });
        toast.success('Yazdırma sırasına eklendi!', { id: 'print-toast' });
    } catch (error) {
        logError(error as Error, { context: 'Fasikül yazdırılamadı' });
        toast.error('Yazdırma işlemi başlatılamadı. Lütfen tekrar deneyin.', { id: 'print-toast' });
    } finally {
        setIsPrinting(false);
    }
  };

  const handleSaveArchive = async (silent = false): Promise<string | null> => {
    if (!user) {
        if (!silent) toast.error('Kaydetmek için giriş yapmalısınız.');
        return null;
    }
    
    // Zaten kaydedilmiş ise tekrar tekrar kaydetmemek için önceki id'yi dönebiliriz.
    // Ancak güncellemeleri de kaydetmek istiyorsak yeni kayıt atar.
    // Şimdilik yeniden kaybediyoruz.
    try {
        setIsSaving(true);
        if (!silent) toast.loading('Dijital Arşive kaydediliyor...', { id: 'save-toast' });
        
        const saved = await worksheetService.saveWorksheet(
            user.id,
            metadata.title || 'İsimsiz Fasikül',
            ActivityType.FASCICLE,
            [{ metadata, items }] as any,
            'fa-solid fa-layer-group',
            { id: 'fascicles', title: 'Fasiküller' }
        );
        
        setSavedFascicleId(saved.id);
        
        if (!silent) toast.success('Fasikül başarıyla Arşive kaydedildi!', { id: 'save-toast' });
        return saved.id;
    } catch (error) {
        logError(error as Error, { context: 'Fasikül arşive kaydedilemedi' });
        if (!silent) toast.error('Kaydetme işlemi başarısız oldu.', { id: 'save-toast' });
        return null;
    } finally {
        setIsSaving(false);
    }
  };

  const handleAssignStudent = async () => {
    let id = savedFascicleId;
    if (!id) {
       id = await handleSaveArchive(true);
    }
    if (id) {
       setIsAssignModalOpen(true, id);
    } else {
       toast.error("Öğrenciye atamadan önce doküman oluşturulamadı.");
    }
  };

  const handleShareBtnClick = async () => {
    let id = savedFascicleId;
    if (!id) {
       id = await handleSaveArchive(true);
    }
    if (id) {
       setIsShareModalOpen(true);
    } else {
       toast.error("Paylaşımdan önce doküman oluşturulamadı.");
    }
  };

  const onConfirmShare = async (receiverIds: string[], permission?: unknown, message?: string) => {
    if (!savedFascicleId || !user) return;
    setIsSharing(true);
    try {
        await worksheetService.shareWorksheet(
            savedFascicleId,
            user.id,
            (user as { displayName?: string }).displayName || user.name || '',
            receiverIds
        );
        
        // Gerekirse message / not özelliğini entegre etmek için bir toast gösterebiliriz.
        if (message && message.trim().length > 0) {
           toast.success("Paylaşım ve ilişikli notunuz başarıyla gönderildi!");
        } else {
           toast.success("Fasikül başarıyla paylaşıldı!");
        }
        setIsShareModalOpen(false);
    } catch (error) {
        toast.error("Paylaşım gönderilirken bir hata oluştu.");
    } finally {
        setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
      {/* Top Header */}
      <div className="glass-layer-2 flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]/80">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-wide">Fasikül Stüdyosu</h2>
          <span className="text-xs text-[var(--text-muted)]">Ultra-Premium Fasikül Oluşturucu v2.5</span>
        </div>

        <div className="flex items-center space-x-2 xl:space-x-3">
          <div className="flex items-center bg-[var(--bg-paper)] rounded-[var(--radius-premium)] p-1 border border-[var(--border-color)] mr-1">
            <button 
              onClick={undo} 
              disabled={past.length === 0}
              className={`p-1.5 rounded-md transition-colors ${past.length > 0 ? 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] cursor-not-allowed'}`}
              title="Geri Al"
            >
              <Undo size={16} />
            </button>
            <button 
              onClick={redo} 
              disabled={future.length === 0}
              className={`p-1.5 rounded-md transition-colors ${future.length > 0 ? 'hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]' : 'text-[var(--text-muted)] cursor-not-allowed'}`}
              title="İleri Sar"
            >
              <Redo size={16} />
            </button>
          </div>
          
          <button 
             onClick={() => handleSaveArchive(false)}
             disabled={isSaving || items.length === 0}
             className="btn-accent-glow flex items-center px-3 py-2 bg-[var(--bg-paper)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-[var(--radius-premium)] hover:bg-[var(--bg-secondary)] transition disabled:opacity-50 text-sm font-medium">
             <Save size={16} className="mr-2 text-emerald-500" /> {isSaving ? 'Kaydediliyor...' : 'Arşive Kaydet'}
          </button>
          
          <button 
             onClick={handleAssignStudent}
             disabled={items.length === 0 || isSaving}
             className="btn-accent-glow flex items-center px-3 py-2 bg-[var(--bg-paper)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-[var(--radius-premium)] hover:bg-[var(--bg-secondary)] transition disabled:opacity-50 text-sm font-medium">
             <UserPlus size={16} className="mr-2 text-[var(--accent-color)]" /> Öğrenciye Ata
          </button>

          <button 
             onClick={handleShareBtnClick}
             disabled={items.length === 0 || isSaving}
             className="btn-accent-glow flex items-center px-3 py-2 bg-[var(--bg-paper)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-[var(--radius-premium)] hover:bg-[var(--bg-secondary)] transition disabled:opacity-50 text-sm font-medium">
             <Share2 size={16} className="mr-2" style={{ color: 'var(--accent-color)' }} /> Paylaş
          </button>

          <div className="w-px h-6 bg-[var(--border-color)] mx-1"></div>

          <button 
             onClick={() => setIsTemplatesModalOpen(true)}
             className="btn-accent-glow flex items-center px-3 py-2 bg-[var(--bg-paper)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-[var(--radius-premium)] hover:bg-[var(--bg-secondary)] transition text-sm font-medium">
             <LayoutTemplate size={16} className="mr-2" /> Şablonlar
          </button>
          
          <button 
             onClick={handlePrint}
             disabled={items.length === 0 || isPrinting}
             className="btn-accent-glow flex items-center px-4 py-2 bg-[var(--bg-paper)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-[var(--radius-premium)] hover:bg-[var(--bg-secondary)] transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed">
             <Printer size={16} className="mr-2 text-[var(--text-secondary)]" /> Yazdır
          </button>
          
          <button 
             onClick={handleDownloadPdf}
             disabled={items.length === 0 || isPrinting}
             className="flex items-center px-5 py-2 rounded-[var(--radius-premium)] font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
             style={{
               background: 'linear-gradient(135deg, var(--accent-color), var(--accent-hover))',
               color: '#ffffff',
               boxShadow: '0 4px 16px var(--accent-muted)'
             }}
             onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px var(--accent-muted)'}
             onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px var(--accent-muted)'}
          >
             <FileDown size={18} className="mr-2" /> {isPrinting ? 'Hazırlanıyor...' : 'PDF İndir'}
          </button>
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Content Organizer (Drag & Drop) */}
        <div className="w-1/3 max-w-sm border-r border-[var(--border-color)] bg-[var(--bg-secondary)] overflow-y-auto custom-scrollbar">
           <FascicleSidebar />
        </div>

        {/* Right Panel: Live PDF Preview */}
        <div className="flex-1 overflow-auto viewport-surface flex justify-center p-8 custom-scrollbar relative">
           <FasciclePreview />
        </div>
      </div>
      
      <FascicleTemplatesModal 
        isOpen={isTemplatesModalOpen} 
        onClose={() => setIsTemplatesModalOpen(false)} 
      />

      {/* Paylaşım Modalı */}
      <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          onShare={onConfirmShare}
          worksheetId={savedFascicleId || undefined}
          worksheetTitle={metadata.title || 'Fasikül'}
          isSending={isSharing}
          showPermissionSelector={true}
      />
    </div>
  );
};


export default FascicleStudio;
