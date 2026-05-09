import React from 'react';
import { HiddenPicturesData, HiddenItem } from '../types';

interface WorksheetUIProps {
  data: HiddenPicturesData;
}

export const WorksheetUI = ({ data }: WorksheetUIProps) => {
  // SVG için rastgele konum oluşturucu (simülasyon)
  const getRandomPos = () => ({
    x: 10 + Math.random() * 80,
    y: 10 + Math.random() * 80
  });

  return (
    <div className="w-full h-full bg-[#66b2b2] p-4 flex flex-col font-[Lexend] text-slate-900 border-8 border-[#66b2b2]">
      {/* BAŞLIK */}
      <div className="bg-slate-300 py-3 text-center rounded-t-xl border-x-4 border-t-4 border-slate-900">
        <h1 className="text-3xl font-black text-white drop-shadow-md tracking-wider uppercase">
          {data.title}
        </h1>
      </div>

      <div className="flex-1 flex bg-white border-4 border-slate-900 relative">
        
        {/* SOL PANEL (Aranacak Nesneler - Tipik "Highlights" Dergisi Formati) */}
        <div className="w-32 bg-[#a3d2d2] border-r-4 border-slate-900 flex flex-col items-center py-4 gap-6 px-2 overflow-hidden shrink-0">
          {data.content.itemsToFind.slice(0, Math.ceil(data.content.itemsToFind.length / 2)).map(item => (
            <div key={item.id} className="flex flex-col items-center text-center">
               <span className="text-3xl mb-1 filter drop-shadow-sm grayscale contrast-200">{item.icon}</span>
               <span className="text-[10px] font-black leading-tight text-slate-800 uppercase">{item.name}</span>
               <span className="text-[8px] font-bold text-slate-600 block">item</span>
            </div>
          ))}
        </div>

        {/* ORTA PANEL (Gizli Nesne Görsel Alanı - Simülasyon) */}
        <div className="flex-1 relative overflow-hidden bg-white flex items-center justify-center p-2">
           <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="opacity-20 absolute inset-0">
              {/* Kaotik Arkaplan Çizgileri Simülasyonu */}
              {Array.from({length: 40}).map((_, i) => (
                <path 
                  key={i} 
                  d={`M${Math.random()*100},${Math.random()*100} Q${Math.random()*100},${Math.random()*100} ${Math.random()*100},${Math.random()*100} T${Math.random()*100},${Math.random()*100}`} 
                  stroke="black" strokeWidth="0.5" fill="none" opacity="0.6"
                />
              ))}
              {Array.from({length: 30}).map((_, i) => (
                <circle key={`c${i}`} cx={Math.random()*100} cy={Math.random()*100} r={Math.random()*10} stroke="black" strokeWidth="0.5" fill="none" />
              ))}
           </svg>

           {/* Gizlenmiş Objeler */}
           <div className="absolute inset-0">
             {data.content.itemsToFind.map((item, idx) => {
               const pos = getRandomPos();
               // Öğeleri SVG'nin rastgele yerlerine (kamuflaj ile) yerleştiriyoruz
               return (
                 <div
                   key={`hidden_${item.id}`}
                   className="absolute text-2xl filter grayscale opacity-80"
                   style={{ left: \`\${pos.x}%\`, top: \`\${pos.y}%\`, transform: \`rotate(\${Math.random()*360}deg)\` }}
                 >
                   {item.icon}
                 </div>
               );
             })}
           </div>

           <div className="absolute bottom-2 right-2 text-[8px] text-slate-400 font-bold">
             AI Prompt: {data.content.mainImagePrompt}
           </div>
        </div>

        {/* SAĞ YADA ALT PANEL KALAN NESNELER İÇİN */}
        <div className="w-32 bg-[#a3d2d2] border-l-4 border-slate-900 flex flex-col items-center py-4 gap-6 px-2 overflow-hidden shrink-0">
          {data.content.itemsToFind.slice(Math.ceil(data.content.itemsToFind.length / 2)).map(item => (
            <div key={item.id} className="flex flex-col items-center text-center">
               <span className="text-3xl mb-1 filter drop-shadow-sm grayscale contrast-200">{item.icon}</span>
               <span className="text-[10px] font-black leading-tight text-slate-800 uppercase">{item.name}</span>
               <span className="text-[8px] font-bold text-slate-600 block">item</span>
            </div>
          ))}
        </div>
        
      </div>

      <div className="mt-2 text-[10px] text-slate-800 font-bold bg-white p-2 border-2 border-slate-900 rounded-lg shadow-sm">
        <span className="uppercase badge bg-black text-white px-2 py-0.5 rounded mr-2">Oogmatik AI</span> {data.instruction}
        <span className="block mt-1 italic opacity-70">Uzman Notu: {data.content.pedagogicalNote}</span>
      </div>
    </div>
  );
};
