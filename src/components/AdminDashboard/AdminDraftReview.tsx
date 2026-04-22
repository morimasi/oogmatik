import React, { useState, useEffect } from 'react';
import { ActivityDraft, DynamicActivity } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { ACTIVITY_CATEGORIES } from '../../constants';

const ICON_LIST = [
  'fa-wand-magic-sparkles',
  'fa-book-open',
  'fa-calculator',
  'fa-brain',
  'fa-eye',
  'fa-ear-listen',
  'fa-pen-nib',
  'fa-robot',
  'fa-rocket',
  'fa-star',
  'fa-shapes',
  'fa-bolt',
  'fa-puzzle-piece',
  'fa-layer-group',
  'fa-cube',
  'fa-flask',
  'fa-dna',
  'fa-microchip',
  'fa-gamepad',
];

export const AdminDraftReview = () => {
  const [drafts, setDrafts] = useState([] as ActivityDraft[]);
  const [loading, setLoading] = useState(true);
  const [selectedDraft, setSelectedDraft] = useState(null as ActivityDraft | null);
  const [isRefining, setIsRefining] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Publication & Refinement State
  const [refinedData, setRefinedData] = useState({} as Partial<DynamicActivity>);

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllDrafts();
      setDrafts(data);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDraft = (draft: ActivityDraft) => {
    setSelectedDraft(draft);
    setRefinedData({
      title: draft.title,
      description: draft.description,
      category: 'visual-perception',
      icon: 'fa-wand-magic-sparkles',
      targetSkills: [],
      learningObjectives: [],
    });
  };

  const handleRefine = async () => {
    if (!selectedDraft) return;
    setIsRefining(true);
    try {
      const rawContent = `Title: ${selectedDraft.title}\nDescription: ${selectedDraft.description}\nInstructions: ${selectedDraft.customInstructions}\nDraft Data: ${JSON.stringify((selectedDraft as any).draftData)}`;
      const refined = await adminService.refineActivityDraft(rawContent);
      setRefinedData((prev: any) => ({ ...prev, ...refined }));
    } catch (error) {
      console.error('Refinement failed:', error);
    } finally {
      setIsRefining(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedDraft || !selectedDraft.id) return;
    setIsPublishing(true);
    try {
      await adminService.publishDraft(selectedDraft, refinedData);
      setDrafts((prev: ActivityDraft[]) =>
        prev.filter((d: ActivityDraft) => !!d && d.id !== selectedDraft.id)
      );
      setSelectedDraft(null);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu taslağı tamamen silmek istediğinize emin misiniz?')) return;
    await adminService.deleteDraft(id);
    setDrafts((prev: ActivityDraft[]) => prev.filter((d: ActivityDraft) => d.id !== id));
    if (selectedDraft?.id === id) setSelectedDraft(null);
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-zinc-50 dark:bg-[#070708] rounded-[2.5rem] border border-zinc-200 dark:border-white/5 shadow-2xl overflow-hidden font-lexend">
      {/* Sidebar: Draft List */}
      <div className="w-80 border-r border-zinc-200 dark:border-white/5 flex flex-col bg-white dark:bg-black/20">
        <div className="p-8 border-b border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/10">
          <h3 className="font-black text-xl text-zinc-900 dark:text-white mb-1 uppercase tracking-tighter text-lexend">
            OCR HAVUZU
          </h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
            <i className="fa-solid fa-bolt text-indigo-500"></i> Bekleyen Analizler
          </p>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar-minimal px-4 py-6 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3 opacity-30">
              <i className="fa-solid fa-circle-notch fa-spin text-2xl"></i>
              <span className="text-[10px] font-black uppercase tracking-widest">
                Veriler Okunuyor
              </span>
            </div>
          ) : drafts.length === 0 ? (
            <div className="text-center p-12 opacity-20">
              <i className="fa-solid fa-inbox text-4xl mb-4"></i>
              <p className="text-[10px] font-black uppercase tracking-tight">TASLAK BULUNAMADI</p>
            </div>
          ) : (
            drafts
              .filter((d: ActivityDraft) => !!d && !!d.id)
              .map((item: ActivityDraft) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectDraft(item)}
                  className={`p-5 rounded-[1.5rem] cursor-pointer transition-all duration-300 group ${selectedDraft?.id === item.id ? 'bg-white dark:bg-zinc-800 shadow-xl scale-[1.02] border-2 border-indigo-500/20' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900/50 border-2 border-transparent opacity-60'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[8px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 uppercase tracking-widest border border-amber-500/20">
                      {item.baseType}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate group-hover:text-indigo-500 transition-colors uppercase leading-tight">
                    {item.title || 'İsimsiz Analiz'}
                  </h4>
                  <p className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1 font-bold italic">
                    <i className="fa-solid fa-user-circle"></i> {item.createdBy}
                  </p>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Main Content: Review & Refinement */}
      <div className="flex-1 flex flex-col bg-white/50 dark:bg-zinc-950/20 overflow-hidden">
        {selectedDraft ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header Actions */}
            <div className="p-8 border-b border-zinc-100 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-zinc-900/40 backdrop-blur-xl">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">
                  RAFINERİ İNCELEMESİ
                </h2>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.3em] ml-0.5">
                  Taslak Kimliği: {selectedDraft.id}
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(selectedDraft.id)}
                  className="w-14 h-14 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all transform active:scale-95"
                >
                  <i className="fa-solid fa-trash-can text-lg"></i>
                </button>
                <button
                  onClick={handleRefine}
                  disabled={isRefining}
                  className={`px-10 h-14 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 ${isRefining ? 'animate-pulse opacity-50' : 'hover:scale-105 active:scale-95 shadow-indigo-500/20'}`}
                >
                  {isRefining ? (
                    <i className="fa-solid fa-microchip fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  )}
                  AI İLE YAPILANDIR
                </button>
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || isRefining}
                  className={`px-12 h-14 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex items-center gap-3 ${isPublishing ? 'animate-pulse opacity-50' : 'hover:bg-emerald-500 hover:scale-105 active:scale-95 shadow-emerald-500/30'}`}
                >
                  {isPublishing ? (
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                  ) : (
                    <i className="fa-solid fa-rocket"></i>
                  )}
                  YAYINLA
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar-minimal">
              <div className="max-w-6xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Left Side: Original Raw Context */}
                <div className="space-y-8">
                  <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className="w-8 h-[1px] bg-zinc-400 opacity-20"></div> HAM OCR VERİSİ
                  </h4>

                  <div className="p-8 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-[2.5rem] border border-zinc-200 dark:border-white/5 relative group">
                    <div className="absolute top-6 right-6 opacity-20">
                      <i className="fa-solid fa-quote-right text-4xl"></i>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 font-mono text-xs leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto custom-scrollbar-minimal pr-4 italic">
                      {JSON.stringify((selectedDraft as any).draftData, null, 2)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                      Kullanıcı Notları / Talimatları
                    </h5>
                    <div className="p-6 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30">
                      <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300 italic leading-relaxed">
                        "{selectedDraft.customInstructions || 'Talimat verilmedi.'}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Refined Production Result */}
                <div className="space-y-8">
                  <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.3em] flex items-center gap-2">
                    <div className="w-8 h-[1px] bg-emerald-500 opacity-20"></div> RAFİNE EDİLMİŞ
                    MİMARİ
                  </h4>

                  <div className="space-y-6 bg-white dark:bg-zinc-900 p-10 rounded-[3rem] shadow-2xl border-2 border-zinc-100 dark:border-white/5 relative">
                    {isRefining && (
                      <div className="absolute inset-0 z-10 bg-white/60 dark:bg-black/80 backdrop-blur-sm rounded-[3rem] flex items-center justify-center flex-col gap-4 animate-in fade-in">
                        <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-500 animate-pulse">
                          Mimari Çekirdek Oluşturuluyor
                        </span>
                      </div>
                    )}

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                        EĞİTİM BAŞLIĞI
                      </label>
                      <input
                        type="text"
                        value={refinedData.title || ''}
                        onChange={(e: any) =>
                          setRefinedData({ ...refinedData, title: e.target.value })
                        }
                        className="w-full p-5 bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] text-sm font-black focus:border-indigo-500 outline-none transition-all uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                          KATEGORİ
                        </label>
                        <select
                          value={refinedData.category || ''}
                          onChange={(e: any) =>
                            setRefinedData({ ...refinedData, category: e.target.value })
                          }
                          className="w-full p-5 bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] text-xs font-black focus:border-indigo-500 outline-none transition-all appearance-none uppercase"
                        >
                          {ACTIVITY_CATEGORIES.map((c: any) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                          SİMGE
                        </label>
                        <div className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-lg text-indigo-500">
                            <i className={`fa-solid ${refinedData.icon || 'fa-star'}`}></i>
                          </div>
                          <select
                            value={refinedData.icon || ''}
                            onChange={(e: any) =>
                              setRefinedData({ ...refinedData, icon: e.target.value })
                            }
                            className="w-full pl-16 pr-5 py-5 bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] text-xs font-black focus:border-indigo-500 outline-none transition-all appearance-none uppercase"
                          >
                            {ICON_LIST.map((i: string) => (
                              <option key={i} value={i}>
                                {i.split('-')[1].toUpperCase()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                        KLİNİK AÇIKLAMA
                      </label>
                      <textarea
                        value={refinedData.description || ''}
                        onChange={(e: any) =>
                          setRefinedData({ ...refinedData, description: e.target.value })
                        }
                        className="w-full p-5 bg-zinc-50 dark:bg-black border-2 border-zinc-100 dark:border-zinc-800 rounded-[1.5rem] text-xs font-bold leading-relaxed focus:border-indigo-500 outline-none transition-all h-28 resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                          HEDEF BECERİLER
                        </label>
                        <div className="flex flex-wrap gap-2 p-4 bg-zinc-50 dark:bg-black rounded-2xl border dark:border-zinc-800 min-h-[4rem]">
                          {(refinedData.targetSkills || []).map((s: string, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-white dark:bg-zinc-800 text-[8px] font-black border dark:border-zinc-700 rounded-lg text-indigo-500 uppercase"
                            >
                              {s}
                            </span>
                          ))}
                          {isRefining && (
                            <span className="text-[8px] font-bold text-zinc-400 italic">
                              Analiz ediliyor...
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">
                          ÖĞRENME HEDEFLERİ
                        </label>
                        <div className="flex flex-wrap gap-2 p-4 bg-zinc-50 dark:bg-black rounded-2xl border dark:border-zinc-800 min-h-[4rem]">
                          {(refinedData.learningObjectives || []).map(
                            (obj: string, idx: number) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-white dark:bg-zinc-800 text-[8px] font-black border dark:border-zinc-700 rounded-lg text-emerald-500 uppercase leading-none"
                              >
                                {obj}
                              </span>
                            )
                          )}
                          {isRefining && (
                            <span className="text-[8px] font-bold text-zinc-400 italic">
                              Planlanıyor...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Preview Banner */}
                  <div className="p-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] shadow-xl text-white flex items-center justify-between group overflow-hidden relative">
                    <div className="absolute -right-8 -bottom-8 opacity-10 transform group-hover:scale-150 transition-transform duration-1000">
                      <i className={`fa-solid ${refinedData.icon || 'fa-rocket'} text-[12rem]`}></i>
                    </div>
                    <div className="relative z-10">
                      <h5 className="font-black text-lg uppercase tracking-tight mb-1">
                        MİMARİ HAZIR
                      </h5>
                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
                        Yayınla butonu ile sisteme entegre edilecektir.
                      </p>
                    </div>
                    <div className="text-4xl opacity-50 group-hover:scale-110 transition-transform">
                      <i className="fa-solid fa-check-double"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-24 text-center">
            <div className="w-32 h-32 bg-zinc-100 dark:bg-zinc-900 rounded-[3rem] flex items-center justify-center text-5xl text-zinc-300 dark:text-zinc-800 mb-8 border border-zinc-200 dark:border-white/5 shadow-inner">
              <i className="fa-solid fa-microscope text-lexend"></i>
            </div>
            <h3 className="font-black text-2xl text-zinc-900 dark:text-white uppercase tracking-tighter mb-4">
              İNCELEME MODÜLÜ
            </h3>
            <p className="text-sm text-zinc-500 font-bold max-w-sm leading-relaxed uppercase tracking-tight opacity-50">
              Lütfen bekleyen OCR taslaklarından birini seçerek analitik süreci başlatın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
