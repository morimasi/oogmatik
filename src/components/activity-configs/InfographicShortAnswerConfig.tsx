// InfographicShortAnswerConfig: Premium configuration for short answer infographic activities
import React from 'react';
import { GeneratorOptions } from '../../types';

interface Props {
  options: GeneratorOptions;
  onChange: (key: keyof GeneratorOptions, value: any) => void;
}

export const InfographicShortAnswerConfig: React.FC<Props> = ({ options, onChange }) => {
  const questionCount = options.questionCount || 15;
  const lineCount = options.lineCount || 2;
  const colorMode = options.colorMode || 'Karma Renkli';
  const showStudentInfo = options.showStudentInfo !== false;
  const gridDensity = options.gridDensity || 'Kompakt';
  const pedagogicalFocus = options.pedagogicalFocus || 'Genel Kavrama';

  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-3 rounded-lg border border-purple-200 dark:border-purple-700">
        <h4 className="font-bold text-purple-700 dark:text-purple-300 text-xs mb-1">📝 KıSA CEVAPLI SORULAR</h4>
        <p className="text-[8px] text-purple-600 dark:text-purple-400">Premium kalitede, pedagojik olarak tasarlanmış kısa cevaplı soru etkinlikleri</p>
      </div>

      {/* Soru Sayısı */}
      <div>
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Soru Sayısı</label>
        <select
          value={questionCount}
          onChange={(e) => onChange('questionCount', parseInt(e.target.value))}
          className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        >
          <option value={6}>6 Soru</option>
          <option value={8}>8 Soru</option>
          <option value={9}>9 Soru</option>
          <option value={12}>12 Soru</option>
          <option value={15}>15 Soru</option>
          <option value={18}>18 Soru</option>
          <option value={21}>21 Soru</option>
          <option value={24}>24 Soru</option>
          <option value={30}>30 Soru</option>
        </select>
      </div>

      {/* Cevap Satırı */}
      <div>
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Cevap Satırı</label>
        <input
          type="range"
          min="0"
          max="4"
          value={lineCount}
          onChange={(e) => onChange('lineCount', parseInt(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-[8px] text-zinc-500 dark:text-zinc-400">
          <span>0</span>
          <span>1</span>
          <span>2</span>
          <span>3</span>
          <span>4</span>
        </div>
      </div>

      {/* Renk Modu */}
      <div>
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Renk Modu</label>
        <select
          value={colorMode}
          onChange={(e) => onChange('colorMode', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        >
          <option value="Karma Renkli">Karma Renkli</option>
          <option value="Tek Renk (Vurgulu)">Tek Renk (Vurgulu)</option>
          <option value="Siyah-Beyaz (Print Dostu)">Siyah-Beyaz (Print Dostu)</option>
          <option value="Soft Pastel">Soft Pastel</option>
        </select>
      </div>

      {/* Öğrenci Bilgi Alanı */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={showStudentInfo}
            onChange={(e) => onChange('showStudentInfo', e.target.checked)}
            className="rounded border-zinc-300 dark:border-zinc-600"
          />
          <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase">Öğrenci Bilgi Alanı</span>
        </label>
        <p className="text-[8px] text-zinc-500 dark:text-zinc-400 mt-1">İsim, Soyisim ve Tarih alanını en üste ekler</p>
      </div>

      {/* Izgara Sıklığı */}
      <div>
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Izgara Sıklığı</label>
        <select
          value={gridDensity}
          onChange={(e) => onChange('gridDensity', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        >
          <option value="Kompakt">Kompakt</option>
          <option value="Normal">Normal</option>
          <option value="Geniş">Geniş</option>
          <option value="Ultra Sıkışık">Ultra Sıkışık</option>
        </select>
      </div>

      {/* Pedagojik Odak */}
      <div>
        <label className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase block mb-1">Pedagojik Odak</label>
        <select
          value={pedagogicalFocus}
          onChange={(e) => onChange('pedagogicalFocus', e.target.value)}
          className="w-full px-2 py-1 text-xs border border-zinc-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
        >
          <option value="Genel Kavrama">Genel Kavrama</option>
          <option value="Detay Odaklı">Detay Odaklı</option>
          <option value="Neden-Sonuç">Neden-Sonuç</option>
          <option value="Hafıza Çalışması">Hafıza Çalışması</option>
          <option value="Yaratıcı Düşünme">Yaratıcı Düşünme</option>
        </select>
      </div>

      {/* Premium Özellikler */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-700">
        <h4 className="font-bold text-amber-700 dark:text-amber-300 text-xs mb-2">✨ PREMIUM ÖZELLİKLER</h4>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-[8px] text-amber-700 dark:text-amber-300">Pedagojik olarak tasarlanmış soru kalitesi</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-[8px] text-amber-700 dark:text-amber-300">Disleksi dostu görsel tasarım</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
            <span className="text-[8px] text-amber-700 dark:text-amber-300">ZPD uyumlu zorluk seviyeleri</span>
          </div>
        </div>
      </div>
    </div>
  );
};
