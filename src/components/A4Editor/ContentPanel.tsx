import React from 'react';
import { WorksheetBlock } from '../../types';

export const ContentPanel = ({
  selectedBlock,
  onUpdate,
  onDelete,
}: {
  selectedBlock?: WorksheetBlock;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}) => {
  if (!selectedBlock) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center text-zinc-300 mb-4 shadow-sm">
          <i className="fa-solid fa-align-left text-2xl"></i>
        </div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          Bileşen Seçilmedi
        </p>
        <p className="text-[10px] text-zinc-400 mt-2">
          Çalışma kağıdı üzerinden düzenlemek istediğiniz içeriğe tıklayın.
        </p>
      </div>
    );
  }

  const { type, content, id } = selectedBlock as any;

  const updateContent = (newContent: any) => {
    onUpdate(id, { content: { ...content, ...newContent } });
  };

  return (
    <div className="p-5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
            <i className="fa-solid fa-pen-to-square text-xs"></i>
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-800">
            İçerik Düzenleme
          </h3>
        </div>
        <button
          onClick={() => onDelete(id)}
          className="w-7 h-7 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded flex items-center justify-center transition-colors"
          title="Bloğu Sil"
        >
          <i className="fa-solid fa-trash-can text-xs"></i>
        </button>
      </div>

      {(type === 'header' || type === 'text') && (
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">
              Metin İçeriği
            </label>
            {type === 'header' ? (
              <input
                type="text"
                value={content.text || content || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                className="bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
              />
            ) : (
              <textarea
                value={content.text || content || ''}
                onChange={(e) => updateContent({ text: e.target.value })}
                rows={10}
                className="bg-white border border-zinc-200 rounded-xl p-3 text-xs text-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none custom-scrollbar"
              />
            )}
          </div>
        </div>
      )}

      {type === 'question' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Soru Metni</label>
            <textarea
              value={content.text || ''}
              onChange={(e) => updateContent({ text: e.target.value })}
              rows={3}
              className="bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Seçenekler</label>
            {(content.options || []).map((opt: string, i: number) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-[10px] font-bold text-zinc-400 w-4">
                  {String.fromCharCode(65 + i)}
                </span>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOpts = [...(content.options || [])];
                    newOpts[i] = e.target.value;
                    updateContent({ options: newOpts });
                  }}
                  className="flex-1 bg-white border border-zinc-200 rounded-lg p-2 text-xs text-zinc-800"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {type === 'grid' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">
              Sütun Sayısı
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={content.cols || content.columns || 4}
              onChange={(e) => updateContent({ cols: parseInt(e.target.value) || 1 })}
              className="bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">
              Hücreler (Virgülle ayırın)
            </label>
            <textarea
              value={(content.items || content.data || content.cells || []).join(', ')}
              onChange={(e) => {
                const newItems = e.target.value.split(',').map((s: unknown) => s.trim());
                updateContent({ items: newItems });
              }}
              rows={4}
              className="bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800 resize-none"
            />
          </div>
        </div>
      )}

      {!['header', 'text', 'question', 'grid'].includes(type) && (
        <div className="p-4 bg-white border border-zinc-200 rounded-xl">
          <p className="text-xs text-zinc-500">
            Gelişmiş '{type}' bileşeni için özel form bulunmuyor. Düzenleme için blok üzerine çift
            tıklayarak hızlı düzenleyiciyi kullanabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
};
