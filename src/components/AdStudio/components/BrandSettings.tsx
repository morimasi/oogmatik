import React, { useState } from 'react';
import { useBrandKit } from '../../../hooks/useBrandKit';
import { BrandKit } from '../../../types/adStudio';

export const BrandSettings: React.FC = () => {
  const { brandKits, activeBrandKit, addBrandKit, updateBrandKit, deleteBrandKit, setActiveBrandKit, duplicateBrandKit } = useBrandKit();
  const [isEditing, setIsEditing] = useState(false);
  const [editKit, setEditKit] = useState<BrandKit>(activeBrandKit);

  const handleSave = () => {
    if (editKit.id === 'default' || brandKits.some(k => k.id === editKit.id)) {
      updateBrandKit(editKit.id, editKit);
    } else {
      addBrandKit(editKit);
    }
    setIsEditing(false);
  };

  const handleNew = () => {
    const kit: BrandKit = {
      id: crypto.randomUUID(),
      name: 'Yeni Marka Kiti',
      logo: '',
      primaryColor: '#7c3aed',
      secondaryColor: '#4f46e5',
      font: 'Lexend',
      slogan: '',
      website: '',
      createdAt: new Date().toISOString(),
    };
    setEditKit(kit);
    setIsEditing(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Marka Kitleri</p>
        <button
          onClick={handleNew}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-[9px] font-bold hover:bg-indigo-500/30 transition-all"
        >
          <i className="fa-solid fa-plus text-[8px]" /> Yeni
        </button>
      </div>

      {/* Kit List */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[activeBrandKit, ...brandKits.filter(k => k.id !== activeBrandKit.id)].map(kit => (
          <button
            key={kit.id}
            onClick={() => { setActiveBrandKit(kit); setEditKit(kit); }}
            className={`flex-shrink-0 p-3 rounded-xl border transition-all text-left ${
              activeBrandKit.id === kit.id
                ? 'bg-indigo-500/15 border-indigo-500/30'
                : 'bg-white/5 border-white/5 hover:bg-white/10'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded" style={{ backgroundColor: kit.primaryColor }} />
              <span className="text-[11px] font-bold text-zinc-300">{kit.name}</span>
            </div>
            <p className="text-[8px] text-zinc-500">{kit.slogan || 'Slogan yok'}</p>
          </button>
        ))}
      </div>

      {/* Active Kit Details */}
      <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-[11px] font-bold text-zinc-300">Aktif Marka Kiti</h4>
          <div className="flex gap-1">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-2.5 py-1 rounded-lg bg-white/5 text-zinc-400 text-[9px] font-bold hover:bg-white/10 transition-all"
            >
              <i className={`fa-solid ${isEditing ? 'fa-xmark' : 'fa-pen'} mr-1`} />
              {isEditing ? 'İptal' : 'Düzenle'}
            </button>
            <button
              onClick={() => duplicateBrandKit(activeBrandKit.id)}
              className="px-2.5 py-1 rounded-lg bg-white/5 text-zinc-400 text-[9px] font-bold hover:bg-white/10 transition-all"
            >
              <i className="fa-solid fa-copy mr-1" />Kopyala
            </button>
            {activeBrandKit.id !== 'default' && (
              <button
                onClick={() => deleteBrandKit(activeBrandKit.id)}
                className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 text-[9px] font-bold hover:bg-red-500/20 transition-all"
              >
                <i className="fa-solid fa-trash-can mr-1" />Sil
              </button>
            )}
          </div>
        </div>

        {isEditing ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[8px] text-zinc-600 uppercase tracking-wider block mb-1">Kİt Adı</label>
              <input value={editKit.name} onChange={e => setEditKit(p => ({ ...p, name: e.target.value }))}
                className="w-full py-2 px-3 rounded-lg bg-black/30 border border-white/5 text-zinc-300 text-[11px] focus:outline-none focus:border-indigo-500/30" />
            </div>
            <div>
              <label className="text-[8px] text-zinc-600 uppercase tracking-wider block mb-1">Slogan</label>
              <input value={editKit.slogan} onChange={e => setEditKit(p => ({ ...p, slogan: e.target.value }))}
                className="w-full py-2 px-3 rounded-lg bg-black/30 border border-white/5 text-zinc-300 text-[11px] focus:outline-none focus:border-indigo-500/30" />
            </div>
            <div>
              <label className="text-[8px] text-zinc-600 uppercase tracking-wider block mb-1">Ana Renk</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={editKit.primaryColor} onChange={e => setEditKit(p => ({ ...p, primaryColor: e.target.value }))}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" />
                <span className="text-[9px] font-mono text-zinc-500">{editKit.primaryColor}</span>
              </div>
            </div>
            <div>
              <label className="text-[8px] text-zinc-600 uppercase tracking-wider block mb-1">İkinci Renk</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={editKit.secondaryColor} onChange={e => setEditKit(p => ({ ...p, secondaryColor: e.target.value }))}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0" />
                <span className="text-[9px] font-mono text-zinc-500">{editKit.secondaryColor}</span>
              </div>
            </div>
            <div>
              <label className="text-[8px] text-zinc-600 uppercase tracking-wider block mb-1">Font</label>
              <input value={editKit.font} onChange={e => setEditKit(p => ({ ...p, font: e.target.value }))}
                className="w-full py-2 px-3 rounded-lg bg-black/30 border border-white/5 text-zinc-300 text-[11px] focus:outline-none focus:border-indigo-500/30" />
            </div>
            <div>
              <label className="text-[8px] text-zinc-600 uppercase tracking-wider block mb-1">Web Sitesi</label>
              <input value={editKit.website} onChange={e => setEditKit(p => ({ ...p, website: e.target.value }))}
                className="w-full py-2 px-3 rounded-lg bg-black/30 border border-white/5 text-zinc-300 text-[11px] focus:outline-none focus:border-indigo-500/30" />
            </div>
            <div className="col-span-2">
              <button onClick={handleSave}
                className="w-full py-2 rounded-xl bg-indigo-500/20 text-indigo-400 text-[10px] font-bold border border-indigo-500/30 hover:bg-indigo-500/30 transition-all">
                <i className="fa-solid fa-floppy-disk mr-1" /> Kaydet
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 text-[10px]">
            <div><span className="text-zinc-600">Slogan:</span> <span className="text-zinc-300">{activeBrandKit.slogan || '-'}</span></div>
            <div><span className="text-zinc-600">Font:</span> <span className="text-zinc-300">{activeBrandKit.font}</span></div>
            <div><span className="text-zinc-600">Web:</span> <span className="text-zinc-300">{activeBrandKit.website || '-'}</span></div>
            <div className="flex gap-2 items-center">
              <span className="text-zinc-600">Renkler:</span>
              <div className="w-4 h-4 rounded" style={{ backgroundColor: activeBrandKit.primaryColor }} />
              <div className="w-4 h-4 rounded" style={{ backgroundColor: activeBrandKit.secondaryColor }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
