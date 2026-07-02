import React from 'react';
import { LetterConnectMode, LetterConnectCategory, LetterConnectDifficulty } from '../types';

interface LetterConnectConfigProps {
  value: Record<string, unknown>;
  onChange: (key: string, val: unknown) => void;
}

export const LetterConnectConfig: React.FC<LetterConnectConfigProps> = ({ value, onChange }) => {
  const mode = (value?.mode as LetterConnectMode) || 'standard';
  const category = (value?.category as LetterConnectCategory) || 'genel';
  const difficulty = (value?.difficulty as LetterConnectDifficulty) || 'Orta';
  const itemCount = Number(value?.itemCount) || 10;
  const fontSize = Number(value?.fontSize) || 10;
  const primaryColor = (value?.primaryColor as string) || '#4f46e5';
  const secondaryColor = (value?.secondaryColor as string) || '#ec4899';

  return (
    <div className="space-y-5 p-5 bg-zinc-900/40 backdrop-blur-xl rounded-3xl border border-zinc-800/50">
      <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
        <i className="fa-solid fa-link text-indigo-400" />
        Harf Bağlama Ayarları
      </h3>

      {/* Mod Seçimi (Kızlım / Standart) */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <i className="fa-solid fa-palette" />
          Etkinlik Modu
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onChange('mode', 'standard')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
              mode === 'standard'
                ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
                : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <i className="fa-solid fa-cube mr-1" />
            Standart
          </button>
          <button
            onClick={() => onChange('mode', 'girl')}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
              mode === 'girl'
                ? 'bg-pink-500/20 border-pink-500 text-pink-300'
                : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
            }`}
          >
            <i className="fa-solid fa-crown mr-1" />
            Kızlım
          </button>
        </div>
      </div>

      {/* Zorluk Seviyesi */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <i className="fa-solid fa-signal" />
          Zorluk Seviyesi
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['Kolay', 'Orta', 'Zor'] as LetterConnectDifficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => onChange('difficulty', level)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 border-2 ${
                difficulty === level
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                  : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Kategori Seçimi */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
          <i className="fa-solid fa-folder-open" />
          İçerik Kategorisi
        </label>
        <select
          value={category}
          onChange={(e) => onChange('category', e.target.value as LetterConnectCategory)}
          className="w-full px-3 py-2 rounded-xl bg-zinc-800/50 border border-zinc-700 text-zinc-300 text-xs font-medium focus:outline-none focus:border-indigo-500 transition-colors"
        >
          <option value="egitim">Eğitim</option>
          <option value="genel">Genel Kültür</option>
          <option value="mesleki">Mesleki</option>
          <option value="hayvanlar">Hayvanlar</option>
          <option value="meyveler">Meyveler</option>
          <option value="sebzeler">Sebzeler</option>
          <option value="oyuncaklar">Oyuncaklar</option>
        </select>
      </div>

      {/* Öğe Sayısı */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-list-ol" />
            Öğe Sayısı
          </label>
          <span className="text-[10px] font-black text-indigo-400">{itemCount}</span>
        </div>
        <input
          type="range"
          min="5"
          max="20"
          step="1"
          value={itemCount}
          onChange={(e) => onChange('itemCount', parseInt(e.target.value))}
          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Font Boyutu */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <i className="fa-solid fa-text-height" />
            Font Boyutu (pt)
          </label>
          <span className="text-[10px] font-black text-indigo-400">{fontSize}</span>
        </div>
        <input
          type="range"
          min="8"
          max="14"
          step="0.5"
          value={fontSize}
          onChange={(e) => onChange('fontSize', parseFloat(e.target.value))}
          className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
        />
      </div>

      {/* Renk Ayarları */}
      <div className="space-y-3 pt-3 border-t border-zinc-800/50">
        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <i className="fa-solid fa-paint-roller" />
          Görsel Ayarlar
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500">Ana Renk</label>
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => onChange('primaryColor', e.target.value)}
              className="w-full h-8 rounded-xl cursor-pointer border-0 p-0"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-zinc-500">İkincil Renk</label>
            <input
              type="color"
              value={secondaryColor}
              onChange={(e) => onChange('secondaryColor', e.target.value)}
              className="w-full h-8 rounded-xl cursor-pointer border-0 p-0"
            />
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-zinc-800/50">
        <p className="text-[9px] text-zinc-600 italic">
          Zorluk ve içerik ayarları üretim kalitesini doğrudan etkiler.
        </p>
      </div>
    </div>
  );
};
