import React from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { Eye, Smartphone, Monitor } from 'lucide-react';

export const FasciclePreview: React.FC = () => {
  const { items, metadata } = useFascicleStore();

  return (
    <div className="w-full max-w-4xl h-full flex flex-col bg-slate-950">
      
      {/* Preview Toolbar */}
      <div className="flex justify-between items-center px-4 py-3 mb-6 bg-slate-900 border border-white/5 rounded-xl shadow-lg">
         <div className="flex items-center text-slate-300">
            <Eye size={18} className="mr-2" />
            <span className="text-sm font-medium">Canlı Önizleme Mode</span>
         </div>
         <div className="flex space-x-2">
            <button className="p-1.5 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 transition" title="Mobil Görünüm">
              <Smartphone size={16} />
            </button>
            <button className="p-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/30 transition" title="Baskı/Masaüstü Görünüm">
              <Monitor size={16} />
            </button>
         </div>
      </div>

      {/* A4 Paper Mockup */}
      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center pb-20">
         {/* Kapak Sayfası Placeholder */}
         <div className="w-[21cm] min-h-[29.7cm] bg-white shadow-2xl rounded-sm mb-8 flex flex-col relative overflow-hidden shrink-0">
             {/* Header Design */}
             <div className="h-40 bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center p-8">
                <h1 className="text-4xl font-black text-white text-center tracking-tight drop-shadow-md">
                   {metadata.title || 'Yeni Fasikül'}
                </h1>
             </div>
             
             {/* Metadata Info */}
             <div className="p-12 flex-1 flex flex-col justify-center items-center text-slate-800">
                <div className="w-full max-w-sm space-y-4">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                     <span className="text-slate-500 font-medium">Hedef Profil:</span>
                     <span className="font-bold text-slate-800 uppercase tracking-wider">{metadata.targetProfile === 'all' ? 'Genel' : metadata.targetProfile}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                     <span className="text-slate-500 font-medium">Hedef Yaş Grubu:</span>
                     <span className="font-bold text-slate-800">{metadata.targetAgeGroup} Yaş</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                     <span className="text-slate-500 font-medium">Tahmini Süre:</span>
                     <span className="font-bold text-slate-800">{metadata.estimatedDurationMin} Dakika</span>
                  </div>
                </div>
             </div>

             <div className="absolute bottom-8 w-full text-center text-slate-400 text-sm">
                bdmind Education Platform v2.5
             </div>
         </div>

         {/* İçerik Sayfaları (Items) */}
         {items.length > 0 ? items.map((item, index) => (
           <div key={item.id} className="w-[21cm] min-h-[29.7cm] bg-white shadow-md rounded-sm mb-8 p-12 shrink-0 border border-slate-200">
              <div className="flex justify-between items-end border-b-2 border-slate-800 pb-4 mb-8">
                 <h2 className="text-2xl font-bold text-slate-800">
                   Bölüm {index + 1}: {item.type === 'worksheet' ? 'Çalışma Yaprağı' : 'Teşhis / Okuma Parçası'}
                 </h2>
                 <span className="text-sm font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded">
                   Sayfa {index + 2}
                 </span>
              </div>
              
              <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center h-96">
                 <p className="text-slate-400 font-medium mb-2">İçerik Render Yeri ({item.type})</p>
                 <p className="text-xs text-slate-400 text-center max-w-xs">
                   (Bu alan @react-pdf/renderer veya HTML Canvas ile gerçek soru/grafik içeriğini basacaktır)
                 </p>
              </div>

              {item.pedagogicalNote && (
                <div className="mt-8 p-4 bg-indigo-50 border-l-4 border-indigo-500 rounded-r">
                   <h4 className="text-indigo-800 font-bold text-sm mb-1">Öğretmen / Veli Notu</h4>
                   <p className="text-indigo-900/80 text-sm">{item.pedagogicalNote}</p>
                </div>
              )}
           </div>
         )) : (
            <div className="text-slate-500 italic text-sm mt-8">
               Sol panelden sayfa ekledikçe A4 önizlemeleri belirecektir.
            </div>
         )}
      </div>
    </div>
  );
};
