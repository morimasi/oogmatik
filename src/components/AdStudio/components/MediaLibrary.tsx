import React, { useState } from 'react';
import { MediaAsset } from '../../../types/adStudio';

const STORAGE_KEY = 'oogmatik_media_assets';
const MAX_ASSETS = 10;
const MAX_SIZE = 100 * 1024; // 100KB

function loadAssets(): MediaAsset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as MediaAsset[];
  } catch { /* ignore */ }
  return [];
}

function saveAssets(assets: MediaAsset[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

export const MediaLibrary: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>(loadAssets);

  React.useEffect(() => { saveAssets(assets); }, [assets]);

  const addAsset = (file: File) => {
    if (assets.length >= MAX_ASSETS) return;
    if (file.size > MAX_SIZE) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = event.target?.result as string;
      const asset: MediaAsset = {
        id: crypto.randomUUID(),
        name: file.name,
        data,
        type: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
      };
      setAssets(prev => [...prev, asset]);
    };
    reader.readAsDataURL(file);
  };

  const deleteAsset = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) addAsset(file);
    e.target.value = '';
  };

  return (
    <div className="rounded-[2rem] bg-white/40 dark:bg-black/20 border border-zinc-200 dark:border-white/5 backdrop-blur-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
          <i className="fa-solid fa-photo-film text-indigo-500" />
          Medya Kütüphanesi
          <span className="text-zinc-600 font-mono normal-case tracking-normal">({assets.length}/{MAX_ASSETS})</span>
        </h3>
        {assets.length < MAX_ASSETS && (
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 text-[9px] font-bold hover:bg-indigo-500/30 cursor-pointer transition-all">
            <i className="fa-solid fa-upload" /> Yükle
            <input type="file" accept="image/*,.png,.jpg,.svg,.gif" onChange={handleFileInput} className="hidden" />
          </label>
        )}
      </div>

      {assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 gap-2 text-zinc-500">
          <i className="fa-solid fa-photo-film text-2xl" />
          <p className="text-[11px] font-medium">Henüz medya yüklenmedi</p>
          <p className="text-[9px] text-zinc-600">PNG, JPG, SVG, GIF · max 100KB</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {assets.map(asset => (
            <div key={asset.id} className="group relative rounded-xl overflow-hidden bg-white/5 border border-white/5 aspect-square">
              {asset.type.startsWith('image/') ? (
                <img src={asset.data} alt={asset.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                  <i className="fa-solid fa-file text-2xl" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button onClick={() => deleteAsset(asset.id)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 text-[9px] hover:bg-red-500/30 transition-all">
                  <i className="fa-solid fa-trash-can" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                <p className="text-[7px] text-zinc-400 truncate">{asset.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
