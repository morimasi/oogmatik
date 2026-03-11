import React from 'react';
import { GeneratorOptions } from '../../types';

interface VisualInterpretationConfigProps {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: any) => void;
}

export const VisualInterpretationConfig: React.FC<VisualInterpretationConfigProps> = ({
  options,
  onChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Konu Seçimi */}
        <div className="col-span-2">
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Görsel Konusu / Tema
          </label>
          <select
            value={options.topic || 'daily_life'}
            onChange={(e) => onChange('topic', e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="daily_life">Günlük Yaşam (Ev, Okul, Park)</option>
            <option value="nature">Doğa ve Hayvanlar</option>
            <option value="city">Şehir ve Trafik</option>
            <option value="fantasy">Masal ve Fantastik</option>
            <option value="sports">Spor ve Hareket</option>
            <option value="emotions">Duygular ve İfadeler</option>
            <option value="jobs">Meslekler ve İş Yerleri</option>
            <option value="abstract">Soyut ve Desenler</option>
          </select>
        </div>

        {/* Görsel Stili */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Görsel Stili
          </label>
          <select
            value={options.visualStyle || 'illustration'}
            onChange={(e) => onChange('visualStyle', e.target.value)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="illustration">Renkli İllüstrasyon</option>
            <option value="cartoon">Karikatür / Çizgi Film</option>
            <option value="realistic">Gerçekçi Çizim</option>
            <option value="minimalist">Minimalist / Vektörel</option>
            <option value="sketch">Karakalem / Eskiz</option>
            <option value="photo">Fotoğraf (Stok)</option>
          </select>
        </div>

        {/* Soru Tipi */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Soru Tipi
          </label>
          <select
            value={options.questionStyle || 'mixed'}
            onChange={(e) => onChange('questionStyle', e.target.value as any)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="mixed">Karışık (Önerilen)</option>
            <option value="5n1k">5N 1K Soruları</option>
            <option value="detail">Detay Fark Etme</option>
            <option value="inference">Mantıksal Çıkarım</option>
            <option value="true_false">Doğru / Yanlış</option>
            <option value="open_ended">Açık Uçlu Yorum</option>
          </select>
        </div>

        {/* Zorluk Seviyesi */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Zorluk Seviyesi
          </label>
          <select
            value={options.difficulty || 'Orta'}
            onChange={(e) => onChange('difficulty', e.target.value as any)}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          >
            <option value="Başlangıç">Başlangıç (Az Detay)</option>
            <option value="Orta">Orta (Standart)</option>
            <option value="Zor">Zor (Çok Detaylı)</option>
            <option value="Uzman">Uzman (Karmaşık İlişkiler)</option>
          </select>
        </div>

        {/* Soru Sayısı */}
        <div>
          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
            Soru Sayısı
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={options.itemCount || 5}
            onChange={(e) => onChange('itemCount', parseInt(e.target.value))}
            className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Ekstra Seçenekler */}
      <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <input
            type="checkbox"
            checked={options.includeClinicalNotes}
            onChange={(e) => onChange('includeClinicalNotes', e.target.checked)}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Klinik Gözlem Notları Ekle
            <span className="block text-xs text-zinc-400 font-normal">
              Öğrencinin dikkat ve algı performansını not almak için alan bırakır.
            </span>
          </span>
        </label>

        <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
          <input
            type="checkbox"
            checked={options.syllableColoring}
            onChange={(e) => onChange('syllableColoring', e.target.checked)}
            className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
          />
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Soruları Renkli Heceyle Yaz
            <span className="block text-xs text-zinc-400 font-normal">
              Disleksi dostu okuma desteği sağlar.
            </span>
          </span>
        </label>
      </div>
    </div>
  );
};
