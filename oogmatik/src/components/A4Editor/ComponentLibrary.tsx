import React from 'react';
import { WorksheetBlock } from '../../types';

interface ComponentDefinition {
  type: WorksheetBlock['type'];
  label: string;
  description: string;
  icon: string;
  defaultContent: any;
  defaultStyle?: any;
}

const COMPONENT_DEFINITIONS: ComponentDefinition[] = [
  {
    type: 'header',
    label: 'Başlık (Header)',
    icon: 'fa-heading',
    description: 'Ana başlık veya bölüm başlığı.',
    defaultContent: { text: 'YENİ BAŞLIK' },
  },
  {
    type: 'text',
    label: 'Metin Paragrafı',
    icon: 'fa-align-left',
    description: 'Normal okuma veya açıklama metni.',
    defaultContent: { text: 'Buraya yeni bir metin veya hikaye ekleyebilirsiniz...' },
  },
  {
    type: 'table',
    label: 'Tablo Matrisi',
    icon: 'fa-table',
    description: 'Satır ve sütunlardan oluşan tablo.',
    defaultContent: {
      headers: ['SÜTUN 1', 'SÜTUN 2'],
      rows: [
        ['Değer 1', 'Değer 2'],
        ['Değer 3', 'Değer 4'],
      ],
    },
  },
  {
    type: 'grid',
    label: 'Kutu Izgarası (Grid)',
    icon: 'fa-border-all',
    description: 'Kutu içinde harfler veya kelimeler.',
    defaultContent: { cols: 4, items: ['A', 'B', 'C', 'D'] },
  },
  {
    type: 'question',
    label: 'Çoktan Seçmeli Soru',
    icon: 'fa-list-check',
    description: 'Seçenekli A, B, C, D soru bloğu.',
    defaultContent: {
      text: 'Soru metni buraya gelecek...',
      options: ['Seçenek A', 'Seçenek B', 'Seçenek C', 'Seçenek D'],
      answer: 'A',
    },
  },
  {
    type: 'logic_card',
    label: 'Mantık / Bilgi Kartı',
    icon: 'fa-lightbulb',
    description: 'Dikkat çeken çerçeveli bilgi kartı.',
    defaultContent: { text: 'ÖNEMLİ BİLGİ:', detail: 'Bunu mutlaka okuyun.' },
  },
];

export const ComponentLibrary = ({
  onAdd,
}: {
  onAdd: (block: Partial<WorksheetBlock>) => void;
}) => {
  return (
    <div className="p-5 space-y-3 animate-in fade-in duration-300">
      <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-4">
        A4 Bileşen Kütüphanesi
      </h4>
      <div className="grid grid-cols-1 gap-2.5">
        {COMPONENT_DEFINITIONS.map((def, idx) => (
          <button
            key={idx}
            onClick={() =>
              onAdd({ type: def.type, content: def.defaultContent, style: def.defaultStyle })
            }
            className="group flex items-center gap-3 w-full p-3.5 bg-white border border-zinc-200 hover:border-indigo-400 rounded-2xl transition-all text-left overflow-hidden relative shadow-sm hover:shadow-md"
          >
            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <i className="fa-solid fa-plus text-[8px] text-indigo-500"></i>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 group-hover:bg-indigo-50 flex items-center justify-center text-zinc-400 group-hover:text-indigo-600 transition-colors shrink-0">
              <i className={`fa-solid ${def.icon}`}></i>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-zinc-700 group-hover:text-indigo-700 truncate">
                {def.label}
              </p>
              <p className="text-[9px] text-zinc-500 truncate leading-tight mt-0.5">
                {def.description}
              </p>
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl">
        <p className="text-[10px] text-indigo-700 leading-relaxed font-medium">
          <i className="fa-solid fa-circle-info mr-1"></i> Yeni bileşen, sayfada seçili olan bloğun
          hemen altına eklenir. Seçili blok yoksa sayfanın sonuna eklenir.
        </p>
      </div>
    </div>
  );
};
