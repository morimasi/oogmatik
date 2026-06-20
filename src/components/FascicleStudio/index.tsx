import React, { useEffect, useState } from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { FascicleSidebar } from './FascicleSidebar';
import { FasciclePreview } from './FasciclePreview';
import { FileDown, RefreshCcw, Save, Undo, Redo, LayoutTemplate } from 'lucide-react';
import { fascicleService } from '../../services/fascicleService';
import { printService } from '../../utils/printService';
import { logError } from '../../utils/logger.js';
import toast from 'react-hot-toast';

interface FascicleStudioProps {
  onBack?: () => void;
}

export const FascicleStudio: React.FC<FascicleStudioProps> = ({ onBack }) => {
  const { currentFascicleId, metadata, items, undo, redo, past, future } = useFascicleStore();
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    // Auto-save logic triggers when items or metadata changes, if there is an ID (not just local draft)
    // For local drafts, we might generate a temp ID.
    if (currentFascicleId) {
       fascicleService.autoSaveDraft(currentFascicleId, { metadata, items }).catch(err => logError('AutoSave failed', err));
    }
  }, [items, metadata, currentFascicleId]);

  const handlePublish = async () => {
    try {
        setIsPrinting(true);
        toast.loading('Fasikül sayfaları hazırlanıyor...', { id: 'print-toast' });
        await printService.generatePdf('#fascicle-print-container', metadata.title || 'Ozel_Egitim_Fasikulu', {
            action: 'print'
        });
        toast.success('Baskı / PDF işlemi başlatıldı!', { id: 'print-toast' });
    } catch (error) {
        logError(error as Error, { context: 'Fasikül yazdırılamadı' });
        toast.error('Yazdırma işlemi başlatılamadı.', { id: 'print-toast' });
    } finally {
        setIsPrinting(false);
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

        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-white/5 mr-2">
            <button 
              onClick={undo} 
              disabled={past.length === 0}
              className={`p-2 rounded-md transition-colors ${past.length > 0 ? 'hover:bg-slate-700 text-slate-300' : 'text-slate-600 cursor-not-allowed'}`}
              title="Geri Al"
            >
              <Undo size={18} />
            </button>
            <button 
              onClick={redo} 
              disabled={future.length === 0}
              className={`p-2 rounded-md transition-colors ${future.length > 0 ? 'hover:bg-slate-700 text-slate-300' : 'text-slate-600 cursor-not-allowed'}`}
              title="İleri Sar"
            >
              <Redo size={18} />
            </button>
          </div>
          
          <button className="flex items-center px-4 py-2 bg-slate-800 text-white border border-white/10 rounded-xl hover:bg-slate-700 transition">
             <LayoutTemplate size={16} className="mr-2" /> Şablonlar
          </button>
          
          <button 
             onClick={handlePublish}
             className="flex items-center px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg shadow-blue-900/50 hover:shadow-blue-900/80 transition-all font-medium"
          >
             <FileDown size={18} className="mr-2" /> PDF Oluştur
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
    </div>
  );
};

export default FascicleStudio;
