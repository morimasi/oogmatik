import React, { Suspense, useState } from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { Eye, Smartphone, Monitor, Info, LayoutTemplate } from 'lucide-react';
import { SheetRenderer } from '../SheetRenderer';
import { ActivityType, SingleWorksheetData, StyleSettings } from '../../types';
import { FascicleCoverPage } from './FascicleCoverPage';
import { useStudentStore } from '../../store/useStudentStore';

export const FasciclePreview: React.FC = () => {
  const { items, metadata } = useFascicleStore();
  const { activeStudent } = useStudentStore();
  const [viewState, setViewState] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="w-full max-w-4xl h-full flex flex-col">
      
      {/* Preview Toolbar */}
      <div className="glass-layer-2 flex justify-between items-center px-4 py-3 mb-6 rounded-[var(--radius-premium)] no-print">
         <div className="flex items-center text-[var(--text-secondary)]">
            <Eye size={18} className="mr-2" />
            <span className="text-sm font-medium">Canlı Önizleme Modu ({viewState === 'desktop' ? 'Baskı Ebatı' : 'Mobil/Tablet'})</span>
         </div>
         <div className="flex space-x-2">
            <button 
               onClick={() => setViewState('mobile')}
               className={`studio-icon-btn p-1.5 rounded-lg ${viewState === 'mobile' ? 'text-[var(--accent-color)] border border-[var(--accent-muted)]' : ''}`}
               title="Mobil/Tablet Küçültülmüş Görünüm">
              <Smartphone size={16} />
            </button>
            <button 
               onClick={() => setViewState('desktop')}
               className={`studio-icon-btn p-1.5 rounded-lg ${viewState === 'desktop' ? 'text-[var(--accent-color)] border border-[var(--accent-muted)]' : ''}`}
               title="Gerçek Baskı Görünümü">
              <Monitor size={16} />
            </button>
         </div>
      </div>

      {/* A4 Paper Mockup Scroll Area */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center pb-20 transition-transform duration-300 origin-top ${viewState === 'mobile' ? 'scale-[0.85]' : 'scale-100'}`}>
         <div id="fascicle-print-container" className="w-full flex flex-col items-center">
             {/* Kapak Sayfası */}
             {metadata.coverPageSettings && (
               <FascicleCoverPage settings={metadata.coverPageSettings} student={activeStudent} fascicleTitle={metadata.title} />
             )}

             {/* İçerik Sayfaları (Items) */}
             {items.length > 0 ? items.map((item, index) => {
               // İçerikten dinamik ayarları çek (Sınav stüdyosunun 2 sütun gibi ayarlarını korumak için)
               const contentObj = (item.content as any) || {};
               const isExam = item.type === ActivityType.SINAV || item.type === ActivityType.MAT_SINAV;
               const defaultColumns = isExam ? 2 : 1;
               
               // Hedef ayarlar genelde printConfig, settings veya config adıyla content içine paketlenir
               const dynamicSettings = {
                 columns: defaultColumns, // Fallback default based on type
                 ...(contentObj.settings || {}),
                 ...(contentObj.printConfig || {}),
                 ...(contentObj.config || {}),
                 ...(contentObj.styleSettings || {})
               };

               return (
                 <div key={item.id} className="relative group/page">
                    {/* Page Header Info (Floating) */}
                    <div className="absolute -left-48 top-0 w-40 h-full no-print hidden xl:flex flex-col gap-4 py-4 pointer-events-none">
                       <div className="glass-layer-3 p-4 rounded-2xl pointer-events-auto">
                          <span className="text-[9px] font-black uppercase tracking-widest block mb-1" style={{ color: 'var(--accent-color)' }}>Sayfa {index + 2}</span>
                          <h4 className="text-xs font-bold text-[var(--text-primary)] leading-tight">{item.type.replace(/-/g, ' ').toUpperCase()}</h4>
                          <div className="mt-2 flex items-center gap-1.5">
                             <span className={`w-1.5 h-1.5 rounded-full ${item.difficulty === 'Zor' ? 'bg-red-500' : item.difficulty === 'Orta' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                             <span className="text-[10px] text-[var(--text-muted)]">{item.difficulty} Seviye</span>
                          </div>
                       </div>
                    </div>

                    {/* Gerçek Render Alanı */}
                    <div className="w-[210mm] min-h-[297mm] mx-auto shrink-0 shadow-2xl mb-12 bg-white relative print-exact border border-[var(--border-color)]">
                      <Suspense fallback={
                        <div className="w-[21cm] h-[29.7cm] flex items-center justify-center bg-white">
                          <div className="animate-spin rounded-full h-12 w-12" style={{ borderBottomColor: 'var(--accent-color)', borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: 'transparent', borderWidth: '3px' }}></div>
                        </div>
                      }>
                         <SheetRenderer 
                           data={item.content as SingleWorksheetData} 
                           activityType={item.type as ActivityType} 
                           settings={{
                             fontSize: '1rem',
                             lineHeight: 1.6,
                             scale: 1,
                             borderColor: '#e2e8f0',
                             borderWidth: 1,
                             margin: 10,
                             columns: defaultColumns,
                             gap: 20,
                             orientation: 'portrait',
                             themeBorder: 'none',
                             contentAlign: 'left',
                             fontWeight: 'normal',
                             fontStyle: 'normal',
                             visualStyle: 'minimal',
                             showPedagogicalNote: false,
                             showMascot: false,
                             showStudentInfo: false,
                             showTitle: true,
                             showInstruction: true,
                             showImage: true,
                             showFooter: true,
                             showAnswers: false,
                             showClues: false,
                             footerText: `Fasikül Sayfası • bdmind Education`,
                             smartPagination: true,
                             fontFamily: 'Lexend',
                             letterSpacing: 0,
                             wordSpacing: 0,
                             paragraphSpacing: 0,
                             focusMode: false,
                             rulerColor: '#e2e8f0',
                             rulerHeight: 0,
                             maskOpacity: 0,
                             ...dynamicSettings // STÜDYO'NUN KENDİ AYARLARINI (İKİ SÜTUN VS) KULLAN!
                           } as StyleSettings}
                         />
                      </Suspense>
                    </div>

                    {/* Pedagogical Note */}
                    {item.pedagogicalNote && (
                      <div className="w-[21cm] -mt-10 mb-20 p-6 glass-layer-2 rounded-2xl flex gap-4 no-print mx-auto">
                         <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-lg" style={{ backgroundColor: 'var(--accent-color)', color: '#ffffff', boxShadow: '0 4px 12px var(--accent-muted)' }}>
                            <Info size={20} />
                         </div>
                         <div>
                            <h4 className="font-black text-xs uppercase tracking-widest mb-1" style={{ color: 'var(--accent-color)' }}>Pedagojik Not</h4>
                            <p className="text-[var(--text-secondary)] text-sm leading-relaxed">{item.pedagogicalNote}</p>
                         </div>
                      </div>
                    )}
                 </div>
               );
             }) : (
                <div className="glass-layer-3 p-12 rounded-[var(--radius-premium)] text-center max-w-md mt-12 no-print">
                   <div className="w-20 h-20 bg-[var(--bg-paper)] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)]">
                      <LayoutTemplate size={40} />
                   </div>
                   <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">Fasikülünüz Henüz Boş</h3>
                   <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
                      Matematik, Okuma veya Sınav stüdyolarından içerik ekleyerek disleksi dostu bir fasikül oluşturmaya başlayın.
                   </p>
                </div>
             )}
         </div>
      </div>
    </div>
  );
};
