import React from 'react';
import { WorksheetBlock } from '../../types';

export const StylePanel = ({
  selectedBlock,
  onUpdate,
}: {
  selectedBlock?: WorksheetBlock;
  onUpdate: (id: string, updates: any) => void;
}) => {
  if (!selectedBlock) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center text-zinc-300 mb-4 shadow-sm">
          <i className="fa-solid fa-palette text-2xl"></i>
        </div>
        <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          Bileşen Seçilmedi
        </p>
        <p className="text-[10px] text-zinc-400 mt-2">
          Stilini değiştirmek istediğiniz bloğa tıklayın.
        </p>
      </div>
    );
  }

  const { id, style = {} } = selectedBlock as any;

  const updateStyle = (newStyle: any) => {
    onUpdate(id, { style: { ...style, ...newStyle } });
  };

  return (
    <div className="p-5 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 border border-amber-100">
          <i className="fa-solid fa-paintbrush text-xs"></i>
        </div>
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-800">
          A4 Blok Stili
        </h3>
      </div>

      {/* Typography Section */}
      <div className="space-y-4">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-font"></i> Tipografi
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Boyut (px)</label>
            <input
              type="number"
              value={style.fontSize || ''}
              placeholder="Varsayılan"
              onChange={(e: any) =>
                updateStyle({ fontSize: e.target.value ? parseInt(e.target.value) : undefined })
              }
              className="bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Kalınlık</label>
            <select
              value={style.fontWeight || 'normal'}
              onChange={(e: any) => updateStyle({ fontWeight: e.target.value })}
              className="bg-white border border-zinc-200 rounded-xl p-2.5 text-xs text-zinc-800"
            >
              <option value="normal">Normal</option>
              <option value="bold">Kalın (Bold)</option>
              <option value="black">Ekstra Kalın</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Hizalama</label>
          <div className="flex bg-zinc-100 border border-zinc-200 rounded-xl overflow-hidden p-0.5">
            {['left', 'center', 'right', 'justify'].map((align: any) => (
              <button
                key={align}
                onClick={() => updateStyle({ textAlign: align })}
                className={`flex-1 py-1.5 text-[10px] rounded-lg transition-all ${style.textAlign === align || (!style.textAlign && align === 'left') ? 'bg-white shadow-sm text-amber-600 font-bold' : 'text-zinc-500 hover:text-zinc-800'}`}
              >
                <i className={`fa-solid fa-align-${align}`}></i>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Colors Section */}
      <div className="space-y-4 pt-4 border-t border-zinc-200">
        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
          <i className="fa-solid fa-droplet"></i> Renkler & Sınırlar
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Yazı Rengi</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={style.color || '#000000'}
                onChange={(e: any) => updateStyle({ color: e.target.value })}
                className="w-10 h-10 rounded-xl bg-white border border-zinc-200 overflow-hidden cursor-pointer"
              />
              <input
                type="text"
                value={style.color || ''}
                placeholder="#000"
                onChange={(e: any) => updateStyle({ color: e.target.value })}
                className="flex-1 bg-white border border-zinc-200 rounded-xl p-2 text-[10px] text-zinc-500 font-mono"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">Arka Plan</label>
            <input
              type="color"
              value={style.backgroundColor || '#ffffff'}
              onChange={(e: any) => updateStyle({ backgroundColor: e.target.value })}
              className="w-full h-10 rounded-xl bg-white border border-zinc-200 overflow-hidden cursor-pointer"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-bold text-zinc-500 uppercase px-1">
            Köşe Karakteri (Border Radius)
          </label>
          <input
            type="range"
            min="0"
            max="40"
            value={style.borderRadius || 0}
            onChange={(e: any) => updateStyle({ borderRadius: parseInt(e.target.value) })}
            className="w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer mt-2"
          />
          <div className="text-[10px] text-zinc-400 text-right">{style.borderRadius || 0}px</div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
        <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
          <i className="fa-solid fa-circle-info mr-1"></i> A4 akış düzeni (flow layout) sebebiyle
          rotasyon (döndürme) ve Z-index gibi özellikler kağıt bütünlüğünü korumak adına
          gizlenmiştir.
        </p>
      </div>
    </div>
  );
};
