
import React from 'react';
import { GeneratorOptions } from '../../types';

interface BrainTeasersConfigProps {
    options: GeneratorOptions;
    setOptions: (options: GeneratorOptions) => void;
}

export const BrainTeasersConfig: React.FC<BrainTeasersConfigProps> = ({ options, setOptions }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                {/* Soru Türü */}
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                        Zeka Sorusu Türü
                    </label>
                    <select
                        value={options.topic || 'mixed'}
                        onChange={(e) => setOptions({ ...options, topic: e.target.value })}
                        className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="mixed">Karışık (Önerilen)</option>
                        <option value="riddles">Bilmeceler ve Kelime Oyunları</option>
                        <option value="logic_grid">Mantık Kareleri ve Çıkarım</option>
                        <option value="pattern">Görsel Desen Tamamlama</option>
                        <option value="math_trick">Matematik Hileleri</option>
                        <option value="lateral_thinking">Yanal Düşünme (Lateral Thinking)</option>
                    </select>
                </div>

                {/* Zorluk Seviyesi */}
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                        Zorluk Seviyesi
                    </label>
                    <select
                        value={options.difficulty || 'Orta'}
                        onChange={(e) => setOptions({ ...options, difficulty: e.target.value as any })}
                        className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="Başlangıç">Başlangıç (Kolay)</option>
                        <option value="Orta">Orta (Düşündürücü)</option>
                        <option value="Zor">Zor (Zihin Zorlayıcı)</option>
                        <option value="Uzman">Uzman (Dahi Seviyesi)</option>
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
                        value={options.itemCount || 3}
                        onChange={(e) => setOptions({ ...options, itemCount: parseInt(e.target.value) })}
                        className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* İpucu Seviyesi */}
                <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">
                        İpucu Desteği
                    </label>
                    <select
                        value={options.hintLevel || 'low'}
                        onChange={(e) => setOptions({ ...options, hintLevel: e.target.value as any })}
                        className="w-full bg-zinc-100 dark:bg-zinc-800 border-none rounded-xl p-3 text-sm font-medium focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="none">İpucu Yok</option>
                        <option value="low">Az İpucu (Ters Yazı)</option>
                        <option value="medium">Orta (İlk Harf)</option>
                        <option value="high">Çok (Görsel Destek)</option>
                    </select>
                </div>
            </div>

            {/* Ekstra Seçenekler */}
            <div className="space-y-3 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <label className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <input
                        type="checkbox"
                        checked={options.includeCreativeTask}
                        onChange={(e) => setOptions({ ...options, includeCreativeTask: e.target.checked })}
                        className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-zinc-300"
                    />
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Yaratıcı Düşünme Görevi Ekle
                        <span className="block text-xs text-zinc-400 font-normal">Çocuğun kendi sorusunu üretmesi için alan bırakır.</span>
                    </span>
                </label>
            </div>
        </div>
    );
};
