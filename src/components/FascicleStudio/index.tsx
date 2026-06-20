import React, { useEffect, useState } from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { FascicleSidebar } from './FascicleSidebar';
import { FasciclePreview } from './FasciclePreview';
import { FascicleTemplatesModal } from './FascicleTemplatesModal';
import { ShareModal } from '../ShareModal';
import { FileDown, Undo, Redo, LayoutTemplate, Save, Share2, UserPlus } from 'lucide-react';
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
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 font-inter">
      {/* Top Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/50 backdrop-blur-md">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-white tracking-wide">{metadata.title || 'İsimsiz Fasikül'}</h2>
          <span className="text-xs text-slate-400">Ultra-Premium Fasikül Oluşturucu v2.5</span>
        </div>

        <div className="flex items-center space-x-2 xl:space-x-3">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-white/5 mr-1">
            <button 
              onClick={undo} 
              disabled={past.length === 0}
              className={`p-1.5 rounded-md transition-colors ${past.length > 0 ? 'hover:bg-slate-700 text-slate-300' : 'text-slate-600 cursor-not-allowed'}`}
              title="Geri Al"
            >
              <Undo size={16} />
            </button>
            <button 
              onClick={redo} 
              disabled={future.length === 0}
              className={`p-1.5 rounded-md transition-colors ${future.length > 0 ? 'hover:bg-slate-700 text-slate-300' : 'text-slate-600 cursor-not-allowed'}`}
              title="İleri Sar"
            >
              <Redo size={16} />
            </button>
          </div>
          
          <button 
             onClick={() => handleSaveArchive(false)}
             disabled={isSaving || items.length === 0}
             className="flex items-center px-3 py-2 bg-slate-800 text-slate-200 border border-white/5 rounded-xl hover:bg-slate-700 transition disabled:opacity-50 text-sm font-medium">
             <Save size={16} className="mr-2 text-emerald-400" /> {isSaving ? 'Kaydediliyor...' : 'Arşive Kaydet'}
          </button>
          
          <button 
             onClick={handleAssignStudent}
             disabled={items.length === 0 || isSaving}
             className="flex items-center px-3 py-2 bg-slate-800 text-slate-200 border border-white/5 rounded-xl hover:bg-slate-700 transition disabled:opacity-50 text-sm font-medium">
             <UserPlus size={16} className="mr-2 text-blue-400" /> Öğrenciye Ata
          </button>

          <button 
             onClick={handleShareBtnClick}
             disabled={items.length === 0 || isSaving}
             className="flex items-center px-3 py-2 bg-slate-800 text-slate-200 border border-white/5 rounded-xl hover:bg-slate-700 transition disabled:opacity-50 text-sm font-medium">
             <Share2 size={16} className="mr-2 text-purple-400" /> Paylaş
          </button>

          <div className="w-px h-6 bg-slate-700 mx-1"></div>

          <button 
             onClick={() => setIsTemplatesModalOpen(true)}
             className="flex items-center px-3 py-2 bg-slate-800 text-white border border-white/10 rounded-xl hover:bg-slate-700 transition text-sm font-medium">
             <LayoutTemplate size={16} className="mr-2" /> Şablonlar
          </button>
          
          <button 
             onClick={handleDownloadPdf}
             disabled={items.length === 0 || isPrinting}
             className="flex items-center px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-900/50 hover:shadow-blue-900/80 transition-all font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
             <FileDown size={18} className="mr-2" /> {isPrinting ? 'Hazırlanıyor...' : 'PDF İndir'}
          </button>
        </div>
      </div>

      {/* Split View Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Content Organizer (Drag & Drop) */}
        <div className="w-1/3 max-w-sm border-r border-white/10 bg-slate-900 overflow-y-auto custom-scrollbar">
           <FascicleSidebar />
        </div>

        {/* Right Panel: Live PDF Preview */}
        <div className="flex-1 overflow-auto bg-slate-950 flex justify-center p-8 custom-scrollbar relative">
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
