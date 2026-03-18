import React from 'react';
import { useA4EditorStore } from '../../store/useA4EditorStore';
import { ComponentLibrary } from './ComponentLibrary';
import { ContentPanel } from './ContentPanel';
import { StylePanel } from './StylePanel';
import { SingleWorksheetData } from '../../types';

export const A4EditorPanel = ({
  worksheetData,
  setWorksheetData,
}: {
  worksheetData: any;
  setWorksheetData: any;
}) => {
  const {
    isEditorOpen,
    editorTab,
    setEditorTab,
    setEditorOpen,
    selectedBlockId,
    setSelectedBlockId,
  } = useA4EditorStore();

  if (!isEditorOpen) return null;

  const dataArray: SingleWorksheetData[] = Array.isArray(worksheetData)
    ? worksheetData
    : worksheetData
      ? [worksheetData]
      : [];

  const updateBlock = (blockId: string, updates: any) => {
    if (!setWorksheetData || !dataArray.length) return;

    const newData = dataArray.map((ws) => {
      const blocks = ws.layoutArchitecture?.blocks || ws.blocks || [];
      const newBlocks = blocks.map((b: any) => (b.id === blockId ? { ...b, ...updates } : b));

      return {
        ...ws,
        layoutArchitecture: ws.layoutArchitecture
          ? { ...ws.layoutArchitecture, blocks: newBlocks }
          : undefined,
        blocks: ws.blocks ? newBlocks : undefined,
      };
    });

    setWorksheetData(Array.isArray(worksheetData) ? newData : newData[0]);
  };

  const addBlock = (block: any) => {
    if (!setWorksheetData || !dataArray.length) return;
    const newData = [...dataArray];
    const ws = newData[0]; // Add to first worksheet for simplicity

    const blocks = ws.layoutArchitecture?.blocks || ws.blocks || [];
    const newBlock = {
      ...block,
      id: `block_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };

    let newBlocks = [...blocks];
    // Insert after selected or at end
    if (selectedBlockId) {
      const idx = newBlocks.findIndex((b) => b.id === selectedBlockId);
      if (idx !== -1) {
        newBlocks.splice(idx + 1, 0, newBlock);
      } else {
        newBlocks.push(newBlock);
      }
    } else {
      newBlocks.push(newBlock);
    }

    ws.layoutArchitecture = ws.layoutArchitecture
      ? { ...ws.layoutArchitecture, blocks: newBlocks }
      : undefined;
    if (!ws.layoutArchitecture) ws.blocks = newBlocks;

    setWorksheetData(Array.isArray(worksheetData) ? newData : newData[0]);
    setSelectedBlockId(newBlock.id);
  };

  const deleteBlock = (blockId: string) => {
    if (!setWorksheetData || !dataArray.length) return;

    const newData = dataArray.map((ws) => {
      const blocks = ws.layoutArchitecture?.blocks || ws.blocks || [];
      const newBlocks = blocks.filter((b: any) => b.id !== blockId);
      return {
        ...ws,
        layoutArchitecture: ws.layoutArchitecture
          ? { ...ws.layoutArchitecture, blocks: newBlocks }
          : undefined,
        blocks: ws.blocks ? newBlocks : undefined,
      };
    });

    setWorksheetData(Array.isArray(worksheetData) ? newData : newData[0]);
    setSelectedBlockId(null);
  };

  const selectedBlock = dataArray
    .flatMap((ws) => ws.layoutArchitecture?.blocks || ws.blocks || [])
    .find((b) => b.id === selectedBlockId);

  return (
    <div
      className="shrink-0 w-[320px] bg-white border-l border-zinc-200 flex flex-col h-full shadow-[-10px_0_30px_rgba(0,0,0,0.05)] z-40 animate-in slide-in-from-right duration-300 no-print"
      style={{ colorScheme: 'light' }}
    >
      <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50">
        <div className="flex items-center gap-2 text-indigo-600 font-black uppercase tracking-widest text-xs">
          <i className="fa-solid fa-wand-magic-sparkles"></i>
          A4 Tasarımcısı
        </div>
        <button
          onClick={() => {
            setEditorOpen(false);
            setSelectedBlockId(null);
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <i className="fa-solid fa-times"></i>
        </button>
      </div>

      <div className="flex border-b border-zinc-200 bg-white">
        <button
          onClick={() => setEditorTab('library')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${editorTab === 'library' ? 'text-indigo-600 border-indigo-600 bg-indigo-50' : 'text-zinc-500 border-transparent hover:text-zinc-700 hover:bg-zinc-50'}`}
        >
          <i className="fa-solid fa-shapes mb-1 block text-xs"></i>
          Bileşen
        </button>
        <button
          onClick={() => setEditorTab('content')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${editorTab === 'content' ? 'text-emerald-600 border-emerald-600 bg-emerald-50' : 'text-zinc-500 border-transparent hover:text-zinc-700 hover:bg-zinc-50'}`}
        >
          <i className="fa-solid fa-pen-to-square mb-1 block text-xs"></i>
          İçerik
        </button>
        <button
          onClick={() => setEditorTab('styling')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${editorTab === 'styling' ? 'text-amber-600 border-amber-600 bg-amber-50' : 'text-zinc-500 border-transparent hover:text-zinc-700 hover:bg-zinc-50'}`}
        >
          <i className="fa-solid fa-palette mb-1 block text-xs"></i>
          Stil
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-50">
        {editorTab === 'library' && <ComponentLibrary onAdd={addBlock} />}
        {editorTab === 'content' && (
          <ContentPanel
            selectedBlock={selectedBlock}
            onUpdate={updateBlock}
            onDelete={deleteBlock}
          />
        )}
        {editorTab === 'styling' && (
          <StylePanel selectedBlock={selectedBlock} onUpdate={updateBlock} />
        )}
      </div>
    </div>
  );
};
