import React, { useMemo } from 'react';
import { PedagogicalHeader } from '../common';
import * as LucideIcons from 'lucide-react';
import { Library, Info, BarChart3, Cpu } from 'lucide-react';

interface ConceptNode {
  id: string;
  label: string;
  parentId?: string;
  type?: string;
  icon?: string;
  isMissing?: boolean;
  displayLabel?: string;
  color?: string;
}

export const ConceptMapSheet: React.FC<{ data: any }> = React.memo(({ data }) => {
  const content = data.content || (data as any);
  const nodes: ConceptNode[] = useMemo(() => content.nodes || [], [content.nodes]);
  const settings = data.settings || {};
  
  const layoutType = settings.layoutType || 'tree';
  const nodeStyle = settings.nodeStyle || 'rounded';
  const colorPalette = settings.colorPalette || 'pastel';

  const wordBank = content.wordBank || [];
  const matching = content.matching || [];
  const insight = content.insight || content.summary?.text;

  // Hiyerarşiyi güvenli şekilde hesapla (Sonsuz Döngü Koruması)
  const rootNode = useMemo(() => nodes.find(n => n.type === 'root') || nodes[0], [nodes]);
  
  const getChildren = (parentId: string) => {
    // Kendi kendine parent olma durumunu engelle
    return nodes.filter(n => n.parentId === parentId && n.id !== parentId);
  };

  const branches = useMemo(() => rootNode ? getChildren(rootNode.id) : [], [nodes, rootNode]);

  return (
    <div className="flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white p-8 print:p-4 overflow-hidden professional-worksheet relative">
      <PedagogicalHeader
        title={data.title || 'KAVRAM HARİTASI İNFOGRAFİĞİ'}
        instruction={data.instruction || 'Hiyerarşiyi takip ederek eksik kavramları tamamlayın.'}
        note={data.pedagogicalNote}
      />

      {/* ANA ŞEMA BÖLÜMÜ */}
      <div className={`flex-1 flex flex-col items-center justify-center mt-6 border-2 border-zinc-100 rounded-[3.5rem] bg-zinc-50/20 relative overflow-hidden`}>
         {/* Dekoratif Arkaplan */}
         <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]"></div>
         </div>

         <div className="relative z-10 w-full px-12 print:px-6 py-10">
            {/* Root Node */}
            <div className="flex justify-center mb-16 print:mb-8">
                <div className={`
                    ${nodeStyle === 'circle' ? 'rounded-full w-40 h-40' : nodeStyle === 'sharp' ? 'rounded-none' : 'rounded-[2.5rem]'}
                    bg-zinc-900 text-white p-8 shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-white flex flex-col items-center justify-center gap-3 min-w-[220px] transition-all
                `}>
                    {rootNode?.icon && <IconRenderer name={rootNode.icon} size={32} color="#FFF" />}
                    <span className="text-sm font-black uppercase tracking-[0.2em] text-center leading-tight">{rootNode?.label}</span>
                    <div className="w-12 h-1 bg-indigo-500 rounded-full"></div>
                </div>
            </div>

            {/* Dallar (Branches) */}
            <div className={`grid ${layoutType === 'horizontal' ? 'grid-cols-1 gap-4' : 'grid-cols-3 gap-10 print:gap-4'} relative`}>
                {branches.map((branch, bIdx) => {
                    const leaves = getChildren(branch.id);
                    const branchColor = colorPalette === 'pastel' ? ['#EEF2FF', '#F0FDF4', '#FFFBEB'][bIdx % 3] : '#FFF';

                    return (
                        <div key={branch.id} className="flex flex-col items-center gap-8 print:gap-4 group">
                            {/* Branch Card */}
                            <div 
                                style={{ backgroundColor: branchColor }}
                                className={`
                                    p-6 print:p-3 w-full border-2 shadow-lg relative transition-all hover:scale-105
                                    ${nodeStyle === 'circle' ? 'rounded-full aspect-square flex items-center justify-center' : nodeStyle === 'sharp' ? 'rounded-none' : 'rounded-3xl'}
                                    ${branch.isMissing ? 'border-dashed border-zinc-300' : 'border-zinc-200'}
                                `}
                            >
                                {branch.isMissing && <div className="absolute -top-2 -right-2 bg-zinc-900 text-white text-[8px] px-2 py-0.5 rounded-full font-black">?</div>}
                                <span className={`text-xs font-black uppercase tracking-tight text-center block ${branch.isMissing ? 'text-zinc-300' : 'text-zinc-800'}`}>
                                    {branch.isMissing ? '................' : branch.label}
                                </span>
                            </div>

                            {/* Leaf Nodes */}
                            <div className="flex flex-col gap-3 w-full px-4">
                                {leaves.map(leaf => (
                                    <div 
                                        key={leaf.id} 
                                        className={`
                                            p-3 print:p-2 bg-white/80 backdrop-blur-sm border border-zinc-100 shadow-sm flex items-center gap-3
                                            ${nodeStyle === 'circle' ? 'rounded-full' : nodeStyle === 'sharp' ? 'rounded-none' : 'rounded-xl'}
                                            ${leaf.isMissing ? 'border-dashed border-zinc-300' : ''}
                                        `}
                                    >
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                                        <span className={`text-[10px] font-bold ${leaf.isMissing ? 'text-zinc-200' : 'text-zinc-600'}`}>
                                            {leaf.isMissing ? 'ESER/KAVRAM' : leaf.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
         </div>
      </div>

      {/* ALT PANEL: KOMPAKT BİLGİ VE ANALİZ */}
      <div className="mt-6 flex gap-6 print:gap-3 h-48 print:h-40">
          {/* Kelime Bankası */}
          <div className="flex-[2] bg-zinc-900 rounded-[3rem] p-6 print:p-3 relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500 flex items-center justify-center"><Library size={12} color="#FFF" /></div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">KAVRAM HAVUZU</span>
              </div>
              <div className="flex flex-wrap gap-2">
                  {wordBank.map((word: string, i: number) => (
                      <div key={i} className="px-3 py-1.5 bg-white/10 rounded-xl text-[10px] font-bold text-white border border-white/5 uppercase">
                          {word}
                      </div>
                  ))}
              </div>
          </div>

          {/* İnfografik Özet */}
          <div className="flex-[3] bg-indigo-600 rounded-[3.5rem] p-6 print:p-3 text-white flex flex-col justify-between relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-6 opacity-10 rotate-12"><Info size={80} /></div>
              <div className="relative z-10">
                  <h5 className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-80">INSIGHT REPORT</h5>
                  <p className="text-xs print:text-[10px] font-medium leading-relaxed italic opacity-95">
                      {insight || "Hiyerarşik veri analizi yapılıyor..."}
                  </p>
              </div>
              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                  <div className="flex flex-col">
                      <span className="text-[7px] font-black opacity-50 uppercase">VERİ SETİ</span>
                      <span className="text-[10px] font-black uppercase tracking-tighter">{content.topic || 'GENEL'}</span>
                  </div>
                  <BarChart3 className="opacity-50" size={20} />
              </div>
          </div>
      </div>

      {/* KLİNİK FOOTER */}
      <div className="mt-6 pt-4 border-t-2 border-zinc-100 flex justify-between items-center px-6">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center"><Cpu className="text-zinc-400" size={18} /></div>
              <div>
                  <p className="text-[7px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">PROGRAMLANMIŞ İNFOGRAFİK</p>
                  <p className="text-sm font-black text-zinc-800 tracking-tight">SEMANTİK HARİTALAMA V5.0</p>
              </div>
          </div>
          <div className="flex gap-2">
              {['A1', 'B2', 'C3', 'D4'].map(code => (
                  <div key={code} className="px-3 py-1.5 rounded-lg bg-zinc-50 border border-zinc-100 text-[8px] font-black text-zinc-300">{code}</div>
              ))}
          </div>
      </div>
    </div>
  );
});

const IconRenderer = ({ name, size, color }: { name: string; size: number; color: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <Icon size={size} color={color} strokeWidth={2.5} />;
};
