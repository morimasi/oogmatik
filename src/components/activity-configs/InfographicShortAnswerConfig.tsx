// InfographicShortAnswerConfig: Premium configuration for short answer infographic activities
import React from 'react';
import { GeneratorOptions } from '../../types';

interface Props {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: any) => void;
}

export const InfographicShortAnswerConfig: React.FC<Props> = ({ options, onChange }) => {
  const questionCount = (options.itemCount as number) || 12;
  const lineCount = (options.params?.lineCount as number) || 2;
  const fontSize = (options.fontSize as number) || 14;
  const fontFamily = (options.fontFamily as string) || 'Lexend';
  const gridDensity = (options.compact as boolean) !== false;
  const topic = (options.topic as string) || 'Genel Kültür';

  const fonts = [
    { label: 'Lexend (Disleksi Dostu)', value: 'Lexend' },
    { label: 'Inter (Modern)', value: 'Inter' },
    { label: 'Roboto', value: 'Roboto' },
    { label: 'Open Sans', value: 'Open Sans' },
    { label: 'Comic Sans MS (Okuma Kolaylığı)', value: 'Comic Sans MS' }
  ];

  const topics = [
    'Genel Kültür', 'Bilim & Teknoloji', 'Türk Tarihi', 'Doğa & Çevre', 'Edebiyat', 'Spor'
  ];

  return (
    <div className="space-y-3">
      <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-2.5 rounded-xl border border-indigo-500/20">
        <h4 className="font-bold text-indigo-700 dark:text-indigo-300 text-[10px] mb-0.5">📝 PREMIUM KISA CEVAP</h4>
        <p className="text-[8px] text-[var(--text-muted)] italic">Hızlı modda profesyonel, gerçek bilgi temelli soru üretimi.</p>
      </div>

      {/* Konu Seçimi */}
      <div>
        <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">Konu Başlığı</label>
        <select
          value={topic}
          onChange={(e) => onChange('topic', e.target.value)}
          className="w-full px-2 py-1.5 text-[11px] font-bold border border-[var(--border-color)] rounded-lg bg-[var(--bg-paper)] text-[var(--text-primary)]"
        >
          {topics.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Soru Sayısı */}
        <div>
          <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">Soru Sayısı</label>
          <input
            type="number"
            min={1}
            max={40}
            value={questionCount}
            onChange={(e) => onChange('itemCount', parseInt(e.target.value))}
            className="w-full px-2 py-1.5 text-[11px] font-bold border border-[var(--border-color)] rounded-lg bg-[var(--bg-paper)] text-[var(--text-primary)]"
          />
        </div>

        {/* Cevap Satırı */}
        <div>
          <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">Cevap Satırı</label>
          <select
            value={lineCount}
            onChange={(e) => onChange('params', { ...options.params, lineCount: parseInt(e.target.value) })}
            className="w-full px-2 py-1.5 text-[11px] font-bold border border-[var(--border-color)] rounded-lg bg-[var(--bg-paper)] text-[var(--text-primary)]"
          >
            {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} Satır</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
         {/* Font Ailesi */}
         <div>
          <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">Yazı Tipi</label>
          <select
            value={fontFamily}
            onChange={(e) => onChange('fontFamily', e.target.value)}
            className="w-full px-2 py-1.5 text-[11px] font-bold border border-[var(--border-color)] rounded-lg bg-[var(--bg-paper)] text-[var(--text-primary)]"
          >
            {fonts.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        {/* Font Boyutu */}
        <div>
          <label className="text-[9px] font-black text-zinc-500 uppercase block mb-1 tracking-widest">Yazı Boyutu (px)</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={10}
              max={32}
              value={fontSize}
              onChange={(e) => onChange('fontSize', parseInt(e.target.value))}
              className="w-full px-2 py-1.5 text-[11px] font-bold border border-[var(--border-color)] rounded-lg bg-[var(--bg-paper)] text-[var(--text-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Görsel Düzen */}
      <div className="flex items-center justify-between p-2 bg-[var(--surface-glass)] rounded-lg border border-[var(--border-color)]">
        <span className="text-[10px] font-bold text-[var(--text-primary)]">Kompakt Görünüm</span>
        <button
          onClick={() => onChange('compact', !gridDensity)}
          className={`w-10 h-5 rounded-full transition-colors relative ${gridDensity ? 'bg-indigo-600' : 'bg-zinc-400'}`}
        >
          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${gridDensity ? 'right-1' : 'left-1'}`} />
        </button>
      </div>
    </div>
  );
};
