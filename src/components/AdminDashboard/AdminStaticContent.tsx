import React, { useState, useEffect, useMemo } from 'react';
import { StaticContentItem, ContentSnapshot } from '../../types/admin';
import { adminService } from '../../services/adminService';
import { useToastStore } from '../../store/useToastStore';

export const AdminStaticContent = () => {
  const toast = useToastStore();
  const [contents, setContents] = useState<StaticContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<StaticContentItem | null>(null);
  const [editData, setEditData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDiff, setShowDiff] = useState<ContentSnapshot | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminService.getAllStaticContent();
      setContents(data);
      if (data && data.length > 0 && data[0]) selectItem(data[0]);
    } catch {
      toast.error('Veri kaynakları yüklenemedi');
    } finally { setLoading(false); }
  };

  const filteredContents = useMemo(() => {
    if (!searchQuery) return contents;
    return contents.filter(item =>
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contents, searchQuery]);

  const selectItem = (item: StaticContentItem) => {
    if (!item) return;
    setSelectedContent(item);
    if (Array.isArray(item.data)) {
      setEditData(item.data.join('\n'));
    } else {
      setEditData(JSON.stringify(item.data, null, 2));
    }
    setHasChanges(false);
    setShowHistory(false);
    setShowDiff(null);
  };

  const handleSave = async (note?: string) => {
    if (!selectedContent) return;
    setIsSaving(true);
    try {
      let parsedData: unknown;
      if (selectedContent.type === 'list') {
        parsedData = editData.split('\n').filter(line => line.trim() !== '');
      } else {
        parsedData = JSON.parse(editData);
      }

      const updatedItem = { ...selectedContent, data: parsedData };
      await adminService.saveStaticContent(updatedItem, note || 'Manuel güncelleme');

      const freshData = await adminService.getAllStaticContent();
      setContents(freshData);
      const freshItem = freshData.find(d => d.id === updatedItem.id);
      if (freshItem) setSelectedContent(freshItem);
      setHasChanges(false);

      toast.success('Versiyon başarıyla kaydedildi.');
    } catch {
      toast.error('Hata: Veri formatını kontrol edin.');
    } finally { setIsSaving(false); }
  };

  const handleRestore = (snapshot: ContentSnapshot) => {
    if (Array.isArray(snapshot.data)) {
      setEditData(snapshot.data.join('\n'));
    } else {
      setEditData(JSON.stringify(snapshot.data, null, 2));
    }
    setShowHistory(false);
    setShowDiff(null);
    setHasChanges(true);
    toast.info('Versiyon editore yuklendi. Kaydetmeniz gerekecek.');
  };

  const handleExport = () => {
    if (!selectedContent) return;
    const blob = new Blob([editData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedContent.id}_backup.json`;
    a.click();
    toast.success('Dosya disa aktarildi');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setEditData(content);
      setHasChanges(true);
      toast.info('Veri import edildi. Kaydetmeyi unutmayin.');
    };
    reader.readAsText(file);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length > 0) {
        setEditData(lines.join('\n'));
        setHasChanges(true);
        toast.success(`${lines.length} satir CSV'den import edildi`);
      } else {
        toast.error('CSV dosyasi bos');
      }
    };
    reader.readAsText(file);
  };

  const getDiffLines = (oldData: unknown): { line: string; type: 'same' | 'added' | 'removed' }[] => {
    const oldStr = Array.isArray(oldData) ? oldData.join('\n') : JSON.stringify(oldData, null, 2);
    const oldLines = oldStr.split('\n');
    const newLines = editData.split('\n');
    const maxLen = Math.max(oldLines.length, newLines.length);
    const result: { line: string; type: 'same' | 'added' | 'removed' }[] = [];

    for (let i = 0; i < maxLen; i++) {
      if (i >= oldLines.length) {
        result.push({ line: newLines[i], type: 'added' });
      } else if (i >= newLines.length) {
        result.push({ line: oldLines[i], type: 'removed' });
      } else if (oldLines[i] !== newLines[i]) {
        result.push({ line: newLines[i], type: 'added' });
        result.push({ line: oldLines[i], type: 'removed' });
      } else {
        result.push({ line: newLines[i], type: 'same' });
      }
    }
    return result;
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-[#0d0d0e] rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl font-lexend relative">
      {/* Sidebar */}
      <div className="w-80 bg-black/40 border-r border-white/5 flex flex-col">
        <div className="p-8 border-b border-white/5 bg-white/5 backdrop-blur-md">
          <h3 className="font-black text-xl text-white mb-1 uppercase tracking-tighter">VERI KAYNAKLARI</h3>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Statik Konfigurasyon</p>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-xs"></i>
            <input
              type="text"
              placeholder="Kaynak ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-black/60 border border-white/5 rounded-xl text-xs text-zinc-300 outline-none focus:border-indigo-500/50 transition-all placeholder:text-zinc-700"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 custom-scrollbar-minimal">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <i className="fa-solid fa-spinner fa-spin text-xl text-zinc-500"></i>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-12 text-zinc-700 text-[10px] font-black uppercase tracking-widest">
              {searchQuery ? 'Eslesen kaynak yok' : 'Kaynak bulunamadi'}
            </div>
          ) : (
            filteredContents.map(item => (
              <button
                key={item.id}
                onClick={() => selectItem(item)}
                className={`w-full text-left p-5 rounded-[1.5rem] transition-all duration-300 group ${
                  selectedContent?.id === item.id
                    ? 'bg-white dark:bg-zinc-800 shadow-xl border-l-[6px] border-indigo-500'
                    : 'hover:bg-white/5 border-l-[6px] border-transparent opacity-60'
                }`}
              >
                <div className={`text-sm font-black uppercase tracking-tight truncate ${
                  selectedContent?.id === item.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 group-hover:text-zinc-200'
                }`}>{item.title}</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[8px] font-black px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase tracking-widest">{item.type}</span>
                  <span className="text-[9px] font-bold text-zinc-500 italic">{new Date(item.updatedAt).toLocaleDateString()}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-6 border-t border-white/5 space-y-2">
          <label className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all border border-white/5">
            <i className="fa-solid fa-file-import"></i> JSON Ice Aktar
            <input type="file" className="hidden" onChange={handleImportJSON} accept=".json,.txt" />
          </label>
          <label className="w-full flex items-center justify-center gap-2 py-4 bg-zinc-900 hover:bg-emerald-900/50 text-zinc-400 hover:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-2xl cursor-pointer transition-all border border-white/5">
            <i className="fa-solid fa-table"></i> CSV Ice Aktar
            <input type="file" className="hidden" onChange={handleImportCSV} accept=".csv" />
          </label>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col bg-zinc-950/40 relative">
        {selectedContent ? (
          <>
            <div className="p-8 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-2xl px-12">
              <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-500 text-xl border border-indigo-500/20 shadow-lg shadow-indigo-500/10">
                  <i className={`fa-solid ${selectedContent.type === 'list' ? 'fa-list-check' : 'fa-code'}`}></i>
                </div>
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{selectedContent.title}</h2>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="text-indigo-400">ID: {selectedContent.id}</span>
                    <span className="w-1 h-1 bg-zinc-700 rounded-full"></span>
                    <span>SON SURUM: {new Date(selectedContent.updatedAt).toLocaleString()}</span>
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                {hasChanges && (
                  <span className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 text-amber-500 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-amber-500/20 animate-pulse">
                    <i className="fa-solid fa-circle text-[6px]"></i> Kaydedilmemis Degisiklik
                  </span>
                )}
                <button onClick={() => setShowHistory(!showHistory)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg transition-all ${
                    showHistory ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/40' : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'
                  }`}>
                  <i className="fa-solid fa-clock-rotate-left"></i>
                </button>
                <button onClick={handleExport} className="w-14 h-14 bg-white/5 text-zinc-400 hover:text-white rounded-2xl flex items-center justify-center text-lg border border-white/5 transition-all">
                  <i className="fa-solid fa-download"></i>
                </button>
                <button
                  onClick={() => handleSave()}
                  disabled={isSaving}
                  className="px-12 h-14 bg-white text-black font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  {isSaving ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-shield-check"></i>}
                  VERSIYON KAYDET
                </button>
              </div>
            </div>

            {/* Editor */}
            <div className="flex-1 py-12 px-12 relative flex flex-col font-mono text-xs">
              <div className="flex-1 bg-black/60 rounded-[2.5rem] border border-white/5 shadow-2xl overflow-hidden relative group">
                <div className="absolute top-0 left-0 w-full h-8 bg-white/5 flex items-center px-6 gap-2 border-b border-white/5">
                  <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500/50"></div>
                  <div className="ml-4 text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{selectedContent.id}.{selectedContent.type === 'list' ? 'txt' : 'json'}</div>
                </div>
                <textarea
                  className="w-full h-full p-12 pt-16 resize-none outline-none bg-transparent text-emerald-500/80 selection:bg-indigo-500/30 custom-scrollbar-minimal"
                  value={editData}
                  onChange={(e) => { setEditData(e.target.value); setHasChanges(true); }}
                  placeholder={selectedContent.type === 'list' ? '// Her satira bir veri ekleyin' : '{ "data": [] }'}
                  spellCheck={false}
                />
                <div className="absolute bottom-8 right-8 px-4 py-2 bg-black/80 rounded-xl border border-white/10 text-[10px] font-black text-zinc-500 tracking-widest">
                  {selectedContent.type === 'list'
                    ? `${editData.split('\n').filter(l => l.trim()).length} SATIR`
                    : `${editData.length} KARAKTER`}
                </div>
              </div>
            </div>

            {/* Version History Drawer with Diff */}
            {showHistory && (
              <div className="absolute top-0 right-0 w-[450px] h-full bg-black/90 backdrop-blur-3xl border-l border-white/10 z-20 flex flex-col shadow-2xl">
                <div className="p-8 border-b border-white/10 flex justify-between items-center">
                  <h4 className="font-black text-white uppercase tracking-tighter">
                    <i className="fa-solid fa-code-compare mr-2 text-indigo-500"></i>
                    VERSIYON GECMISI
                  </h4>
                  <button onClick={() => { setShowHistory(false); setShowDiff(null); }} className="text-zinc-500 hover:text-white">
                    <i className="fa-solid fa-xmark text-xl"></i>
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar-minimal">
                  {selectedContent.history?.length ? (
                    selectedContent.history.map((snap, i) => (
                      <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/50 transition-all">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-black text-white uppercase tracking-widest opacity-40">
                            v{selectedContent.history!.length - i}
                          </span>
                          <span className="text-[9px] font-bold text-zinc-500">{new Date(snap.updatedAt).toLocaleString()}</span>
                        </div>
                        <p className="text-[11px] font-bold text-zinc-400 mb-3 italic">"{snap.note || 'Otomatik yedek'}"</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const oldData = snap.data;
                              if (showDiff === snap) {
                                setShowDiff(null);
                              } else {
                                setShowDiff(snap);
                              }
                            }}
                            className="flex-1 py-2 bg-sky-500/10 text-sky-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-sky-500 hover:text-white transition-all"
                          >
                            <i className="fa-solid fa-code-compare mr-1"></i> {showDiff === snap ? 'Gizle' : 'Karsilastir'}
                          </button>
                          <button
                            onClick={() => handleRestore(snap)}
                            className="flex-1 py-2 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-500 hover:text-white transition-all"
                          >
                            <i className="fa-solid fa-upload mr-1"></i> Yukle
                          </button>
                        </div>

                        {/* Diff View */}
                        {showDiff === snap && (
                          <div className="mt-4 p-3 bg-black/60 rounded-xl border border-white/5 max-h-48 overflow-y-auto custom-scrollbar-minimal">
                            {getDiffLines(snap.data).map((line, li) => (
                              <div key={li} className={`text-[9px] font-mono leading-5 px-2 ${
                                line.type === 'added' ? 'bg-emerald-500/10 text-emerald-400' :
                                line.type === 'removed' ? 'bg-red-500/10 text-red-400 line-through' :
                                'text-zinc-600'
                              }`}>
                                {line.type === 'added' && '+ '}
                                {line.type === 'removed' && '- '}
                                {line.type === 'same' && '  '}
                                {line.line}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-24 opacity-20">
                      <i className="fa-solid fa-history text-4xl mb-4"></i>
                      <p className="text-[10px] font-black uppercase tracking-widest">Gecmis bulunamadi</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-24">
            <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-4xl text-white/10 mb-8 border border-white/5">
              <i className="fa-solid fa-database"></i>
            </div>
            <h4 className="text-xl font-black text-white uppercase tracking-tighter opacity-20">DATA ENGINE</h4>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mt-2">Duzenlemek icin kaynak secin</p>
          </div>
        )}
      </div>
    </div>
  );
};