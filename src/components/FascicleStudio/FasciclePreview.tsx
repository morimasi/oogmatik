import React, { Suspense, useState } from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { Eye, Smartphone, Monitor, Info, LayoutTemplate } from 'lucide-react';
import { SheetRenderer } from '../SheetRenderer';
import { ActivityType, SingleWorksheetData, StyleSettings } from '../../types';

export const FasciclePreview: React.FC = () => {
  const { items, metadata } = useFascicleStore();
  const [viewState, setViewState] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="w-full max-w-4xl h-full flex flex-col bg-slate-950">
      
      {/* Preview Toolbar */}
      <div className="flex justify-between items-center px-4 py-3 mb-6 bg-slate-900 border border-white/5 rounded-xl shadow-lg no-print">
         <div className="flex items-center text-slate-300">
            <Eye size={18} className="mr-2" />
            <span className="text-sm font-medium">Canlı Önizleme Modu ({viewState === 'desktop' ? 'Baskı Ebatı' : 'Mobil/Tablet'})</span>
         </div>
         <div className="flex space-x-2">
            <button 
               onClick={() => setViewState('mobile')}
               className={`p-1.5 rounded transition ${viewState === 'mobile' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`} 
               title="Mobil/Tablet Küçültülmüş Görünüm">
              <Smartphone size={16} />
            </button>
            <button 
               onClick={() => setViewState('desktop')}
               className={`p-1.5 rounded transition ${viewState === 'desktop' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`} 
               title="Gerçek Baskı Görünümü">
              <Monitor size={16} />
            </button>
         </div>
      </div>

      {/* A4 Paper Mockup Scroll Area */}
      <div className={`flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center pb-20 transition-transform duration-300 origin-top ${viewState === 'mobile' ? 'scale-[0.85]' : 'scale-100'}`}>
         <div id="fascicle-print-container" className="w-full flex flex-col items-center">
             {/* Kapak Sayfası */}
             <div className="worksheet-page print-page w-[21cm] min-h-[29.7cm] bg-white shadow-2xl rounded-sm mb-8 flex flex-col relative overflow-hidden shrink-0">
                 {/* Header Design */}
                 <div className="h-64 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-800 flex flex-col items-center justify-center p-12 text-center print-exact">
                    <div className="bg-white/20 backdrop-blur-md px-4 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-[0.3em] mb-4 border border-white/20 print-exact">
                       Eğitim Fasikülü
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl leading-none print-text-black">
                       {metadata.title || 'Yeni Fasikül'}
                    </h1>
                    <div className="mt-6 w-24 h-1 bg-white/40 rounded-full print-exact" />
                 </div>
                 
                 {/* Metadata Info */}
                 <div className="p-16 flex-1 flex flex-col justify-between items-center text-slate-800">
                    <div className="w-full max-w-md space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                         <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Öğrenci Profili</span>
                         <span className="font-black text-lg text-indigo-600 uppercase tracking-tight">
                            {metadata.targetProfile === 'all' ? 'Genel Gelişim' : 
                             metadata.targetProfile === 'dyslexia' ? 'Disleksi Desteği' : 
                             metadata.targetProfile === 'dyscalculia' ? 'Diskalkuli Desteği' : metadata.targetProfile}
                         </span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                         <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Yaş Grubu</span>
                         <span className="font-black text-lg text-slate-800">{metadata.targetAgeGroup} Yaş Seviyesi</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                         <span className="text-slate-400 text-xs font-black uppercase tracking-widest">Tahmini Süre</span>
                         <span className="font-black text-lg text-slate-800">{metadata.estimatedDurationMin} Dakika</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                       <div className="w-24 h-24 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-4 opacity-50">
                          <i className="fa-solid fa-qrcode text-4xl text-slate-300"></i>
                       </div>
                       <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.5em]">bdmind AI Engine v2.5</p>
                    </div>
                 </div>

                 <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600 print-exact" />
             </div>

             {/* İçerik Sayfaları (Items) */}
             {items.length > 0 ? items.map((item, index) => {
               // İçerikten dinamik ayarları çek (Sınav stüdyosunun 2 sütun gibi ayarlarını korumak için)
               const contentObj = (item.content as any) || {};
               // Hedef ayarlar genelde printConfig, settings veya config adıyla content içine paketlenir
               const dynamicSettings = contentObj.settings || contentObj.printConfig || contentObj.config || contentObj.styleSettings || {};

               return (
                 <div key={item.id} className="relative group/page">
                    {/* Page Header Info (Floating) */}
                    <div className="absolute -left-48 top-0 w-40 h-full no-print hidden xl:flex flex-col gap-4 py-4 pointer-events-none">
                       <div className="bg-slate-900/80 backdrop-blur-sm border border-white/10 p-4 rounded-2xl pointer-events-auto">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest block mb-1">Sayfa {index + 2}</span>
                          <h4 className="text-xs font-bold text-white leading-tight">{item.type.replace(/-/g, ' ').toUpperCase()}</h4>
                          <div className="mt-2 flex items-center gap-1.5">
                             <span className={`w-1.5 h-1.5 rounded-full ${item.difficulty === 'Zor' ? 'bg-red-500' : item.difficulty === 'Orta' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                             <span className="text-[10px] text-slate-400">{item.difficulty} Seviye</span>
                          </div>
                       </div>
                    </div>

                    {/* Gerçek Render Alanı */}
                    <div className="overflow-hidden shadow-2xl mb-12 bg-white">
                      <Suspense fallback={
                        <div className="w-[21cm] h-[29.7cm] flex items-center justify-center bg-white">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
                             columns: 1,
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
                      <div className="w-[21cm] -mt-10 mb-20 p-6 bg-blue-50/80 backdrop-blur-sm border border-blue-100 rounded-2xl flex gap-4 no-print mx-auto">
                         <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shrink-0 text-white shadow-lg shadow-blue-500/20">
                            <Info size={20} />
                         </div>
                         <div>
                            <h4 className="text-blue-900 font-black text-xs uppercase tracking-widest mb-1">Pedagojik Not</h4>
                            <p className="text-blue-800/80 text-sm leading-relaxed">{item.pedagogicalNote}</p>
                         </div>
                      </div>
                    )}
                 </div>
               );
             }) : (
                <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-12 rounded-3xl text-center max-w-md mt-12 no-print">
                   <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-500">
                      <LayoutTemplate size={40} />
                   </div>
                   <h3 className="text-xl font-bold text-white mb-2">Fasikülünüz Henüz Boş</h3>
                   <p className="text-slate-400 text-sm leading-relaxed">
                      Matematik, Okuma veya Sınav stüdyolarından içerik ekleyerek disleksi dostu bir fasikül oluşturmaya başlayın.
                   </p>
                </div>
             )}
         </div>
      </div>
    </div>
  );
};
