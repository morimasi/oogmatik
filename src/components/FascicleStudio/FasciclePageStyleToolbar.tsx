import React from 'react';
import { useFascicleStore } from '../../store/useFascicleStore';
import { FasciclePageSettings } from '../../types/fascicle';
import { FilePlus, Maximize2, Palette, Type, Sliders, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const FasciclePageStyleToolbar: React.FC = () => {
  const { metadata, updateMetadata, addBlankPage } = useFascicleStore();

  const pageSettings: FasciclePageSettings = metadata.pageSettings || {
    margin: 'normal',
    paperColor: 'white',
    fontScale: 100,
    orientation: 'portrait',
  };

  const handleUpdate = (updates: Partial<FasciclePageSettings>) => {
    updateMetadata({
      pageSettings: {
        ...pageSettings,
        ...updates,
      },
    });
  };

  const handleAddBlank = () => {
    addBlankPage();
    toast.success('Fasiküle boş A4 not sayfası eklendi!');
  };

  return (
    <div className="w-full glass-layer-2 p-3 mb-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 no-print border border-[var(--border-color)] bg-[var(--bg-paper)]/70 shadow-sm">
      {/* LEFT: Margin & Orientation */}
      <div className="flex items-center gap-3">
        {/* Margin Selector */}
        <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)] text-xs">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase px-2">Kenar:</span>
          {[
            { id: 'narrow', label: 'Dar (4mm)' },
            { id: 'normal', label: 'Normal (8mm)' },
            { id: 'wide', label: 'Geniş (15mm)' },
          ].map((m) => (
            <button
              key={m.id}
              onClick={() => handleUpdate({ margin: m.id as any })}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                pageSettings.margin === m.id
                  ? 'bg-[var(--accent-color)] text-white shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Paper Theme / Color */}
        <div className="flex items-center gap-1.5 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-color)] text-xs">
          <Palette size={14} className="ml-1.5 text-[var(--accent-color)]" />
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase pr-1">Kâğıt:</span>
          {[
            { id: 'white', bg: '#ffffff', name: 'Beyaz' },
            { id: 'sepia', bg: '#fbf0d9', name: 'Sepya' },
            { id: 'yellow', bg: '#fffde7', name: 'Disleksi Sarı' },
            { id: 'cream', bg: '#fdfbf7', name: 'Krem' },
          ].map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleUpdate({ paperColor: theme.id as any })}
              className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${
                pageSettings.paperColor === theme.id ? 'border-[var(--accent-color)] scale-110 shadow-sm' : 'border-zinc-300 opacity-70 hover:opacity-100'
              }`}
              style={{ backgroundColor: theme.bg }}
              title={theme.name}
            />
          ))}
        </div>
      </div>

      {/* RIGHT: Font Scale & Add Blank Page */}
      <div className="flex items-center gap-3">
        {/* Font Scale */}
        <div className="flex items-center gap-2 bg-[var(--bg-secondary)] px-3 py-1.5 rounded-xl border border-[var(--border-color)] text-xs">
          <Type size={14} className="text-[var(--accent-color)]" />
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Yazı Ölçeği:</span>
          <select
            value={pageSettings.fontScale || 100}
            onChange={(e) => handleUpdate({ fontScale: Number(e.target.value) })}
            className="bg-transparent text-[var(--text-primary)] font-bold outline-none cursor-pointer"
          >
            <option value={80}>%80 (Sıkışık)</option>
            <option value={90}>%90 (Kompakt)</option>
            <option value={100}>%100 (Standart)</option>
            <option value={110}>%110 (Büyük)</option>
            <option value={120}>%120 (Disleksi)</option>
          </select>
        </div>

        {/* Add Blank Page Button */}
        <button
          onClick={handleAddBlank}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[var(--accent-color)] text-white font-bold rounded-xl text-xs shadow-sm hover:opacity-90 transition-all"
        >
          <FilePlus size={15} />
          <span>Boş A4 Sayfa Ekle</span>
        </button>
      </div>
    </div>
  );
};
