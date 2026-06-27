import React from 'react';
import { ActivityType } from '../../../types/activity';
import { PedagogicalHeader } from '../common';
import * as LucideIcons from 'lucide-react';

interface ConceptNode {
  id: string;
  label: string;
  parentId?: string;
  type?: string;
  icon?: string;
  isMissing?: boolean;
  displayLabel?: string;
}

export const ConceptMapSheet: React.FC<{ data: any }> = ({ data }) => {
  const { content, title, instruction, pedagogicalNote } = data;
  const nodes: ConceptNode[] = content.nodes || [];
  const wordBank = content.wordBank || [];
  const matching = content.matching || [];
  const insight = content.insight || content.summary?.text;

  // Root ve dalları ayır
  const rootNode = nodes.find(n => n.type === 'root') || nodes[0];
  const branches = nodes.filter(n => n.parentId === rootNode?.id);
  
  const getChildren = (parentId: string) => nodes.filter(n => n.parentId === parentId);

  return (
    <div className="flex flex-col min-h-[297mm] h-full font-['Lexend'] text-zinc-900 bg-white p-8 print:p-4 overflow-hidden professional-worksheet relative">
      <PedagogicalHeader
        title={title || 'KAVRAM HARİTASI İNFOGRAFİĞİ'}
        instruction={instruction || 'Kavramlar arası hiyerarşiyi inceleyerek eksik kısımları tamamlayın.'}
        note={pedagogicalNote}
      />

      {/* ÜST BÖLÜM: KAVRAM HARİTASI (NETWORK) */}
      <div className="flex-1 flex flex-col items-center justify-center mt-6 print:mt-2 min-h-[400px] border-2 border-zinc-100 rounded-[3rem] bg-zinc-50/30 relative overflow-hidden">
         {/* Arkaplan Süsleri */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl"></div>
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-50/50 rounded-full -ml-32 -mb-32 blur-3xl"></div>

         <div className="relative z-10 w-full px-12 print:px-6">
            {/* Root Node */}
            <div className="flex justify-center mb-16 print:mb-8">
                <div className="bg-zinc-900 text-white p-6 print:p-4 rounded-[2rem] shadow-2xl border-4 border-white flex flex-col items-center gap-2 min-w-[200px]">
                    {rootNode?.icon && <IconRenderer name={rootNode.icon} size={24} color="#FFF" />}
                    <span className="text-sm font-black uppercase tracking-widest">{rootNode?.label}</span>
                </div>
            </div>

            {/* Branches (Dallar) */}
            <div className="grid grid-cols-3 gap-8 print:gap-4 relative">
                {/* SVG Bağ Çizgileri (CSS ile simüle edilmiş) */}
                <div className="absolute inset-x-0 -top-16 bottom-0 pointer-events-none opacity-20">
                    <svg className="w-full h-full" style={{ overflow: 'visible' }}>
                        {/* Çizim mantığı basitçe merkezden dallara */}
                    </svg>
                </div>

                {branches.map(branch => {
                    const leaves = getChildren(branch.id);
                    return (
                        <div key={branch.id} className="flex flex-col items-center gap-6 print:gap-3">
                            {/* Branch Node */}
                            <div className={`p-4 print:p-2 rounded-2xl border-2 shadow-sm min-w-[120px] text-center transition-all ${branch.isMissing ? 'border-dashed border-zinc-400 bg-white' : 'bg-white border-zinc-200'}`}>
                                <span className={`text-[10px] font-black uppercase ${branch.isMissing ? 'text-zinc-300' : 'text-zinc-800'}`}>
                                    {branch.isMissing ? '................' : branch.label}
                                </span>
                            </div>

                            {/* Leaf Nodes */}
                            <div className="flex flex-col gap-2 w-full">
                                {leaves.map(leaf => (
                                    <div key={leaf.id} className={`p-3 print:p-1.5 rounded-xl border border-zinc-100 bg-white/50 text-center shadow-sm ${leaf.isMissing ? 'border-dashed' : ''}`}>
                                        <span className={`text-[9px] font-bold ${leaf.isMissing ? 'text-zinc-300 italic' : 'text-zinc-600'}`}>
                                            {leaf.isMissing ? 'KAVRAM' : leaf.label}
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

      {/* ORTA BÖLÜM: WORD BANK (KELİME BANKASI) */}
      <div className="mt-6 print:mt-3 p-6 print:p-3 bg-zinc-900 rounded-[2.5rem] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
              <LucideIcons.LibraryBig className="text-white w-12 h-12" />
          </div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">KAVRAM HAVUZU</p>
          <div className="flex flex-wrap gap-2">
              {wordBank.map((word: string, i: number) => (
                  <div key={i} className="px-4 py-2 bg-white/10 border border-white/5 rounded-xl text-[10px] font-black text-white hover:bg-white/20 cursor-default transition-all">
                      {word.toUpperCase()}
                  </div>
              ))}
          </div>
      </div>

      {/* ALT BÖLÜM: 2 SÜTUN (MATCHING + INSIGHT) */}
      <div className="mt-6 print:mt-3 grid grid-cols-2 gap-6 print:gap-3 items-stretch">
          {/* Eşleştirme */}
          <div className="p-6 print:p-3 bg-white border-2 border-zinc-100 rounded-[2.5rem] shadow-sm">
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">KAVRAM DEDEKTİFİ</p>
              <div className="space-y-3">
                  {matching.map((m: any, i: number) => (
                      <div key={i} className="flex gap-2 items-center">
                          <div className="w-4 h-4 rounded-full border-2 border-zinc-200"></div>
                          <div className="flex-1 text-[9px] font-medium text-zinc-600 leading-tight">
                              {m.q} ➔ <span className="font-black text-zinc-300">................</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Insight Kartı */}
          <div className="p-6 print:p-3 bg-indigo-50 border-2 border-indigo-100 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between">
              <div className="absolute -top-4 -right-4 opacity-5 rotate-12">
                  <LucideIcons.Info className="w-16 h-16 text-indigo-900" />
              </div>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">INFOGRAPHIC INSIGHT</p>
              <p className="text-[9px] font-bold text-indigo-900/70 leading-relaxed indent-4">
                  {insight || "Konu özeti veri bekleniyor..."}
              </p>
              <div className="mt-4 pt-4 border-t border-indigo-200/50 flex justify-between items-center">
                  <span className="text-[8px] font-black text-indigo-600">ÖLÇEK: BİLİŞSEL ŞEMA</span>
                  <LucideIcons.Zap className="text-indigo-400 w-4 h-4 animate-pulse" />
              </div>
          </div>
      </div>

      {/* FOOTER: KLİNİK TAKİP */}
      <div className="mt-6 print:mt-3 border-t-2 border-zinc-100 pt-4 flex justify-between items-center px-4">
          <div className="flex gap-4 items-center">
              <LucideIcons.Network className="text-zinc-400 w-8 h-8" />
              <div className="flex flex-col">
                  <span className="text-[7px] font-black text-zinc-400 uppercase leading-none">VERİMLİLİK</span>
                  <span className="text-[10px] font-black text-zinc-800">HIERARCHY V3.2</span>
              </div>
          </div>
          <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-300 italic">{i}</div>
              ))}
          </div>
      </div>
    </div>
  );
};

const IconRenderer = ({ name, size, color }: { name: string; size: number; color: string }) => {
    const Icon = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
    return <Icon size={size} color={color} strokeWidth={2.5} />;
};
