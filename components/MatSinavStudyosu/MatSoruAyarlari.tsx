/**
 * MatSoruAyarlari — Soru Dağılımı & Gelişmiş Filtreler
 */

import React from 'react';
import type { MatSinavAyarlari } from '../../src/types/matSinav';

interface MatSoruAyarlariProps {
    ayarlar: MatSinavAyarlari;
    onSoruDagilimiChange: (tip: keyof MatSinavAyarlari['soruDagilimi'], sayi: number) => void;
    onAyarlarChange: (partial: Partial<MatSinavAyarlari>) => void;
}

const SORU_TIPLERI: { key: keyof MatSinavAyarlari['soruDagilimi']; label: string; icon: string; desc: string }[] = [
    { key: 'coktan_secmeli', label: 'Çoktan Seçmeli', icon: '🔘', desc: '4 seçenekli (A-B-C-D)' },
    { key: 'dogru_yanlis', label: 'Doğru / Yanlış', icon: '✅', desc: 'İfade doğruluğu' },
    { key: 'bosluk_doldurma', label: 'Boşluk Doldurma', icon: '✍️', desc: 'Eksik değeri bul' },
    { key: 'acik_uclu', label: 'Açık Uçlu', icon: '📝', desc: 'Çözüm göster' },
];

const ZORLUK_SEVIYELERI = ['Otomatik', 'Kolay', 'Orta', 'Zor'] as const;

export const MatSoruAyarlari: React.FC<MatSoruAyarlariProps> = ({
    ayarlar,
    onSoruDagilimiChange,
    onAyarlarChange,
}) => {
    const toplamSoru = Object.values(ayarlar.soruDagilimi).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-4">
            {/* Soru Tip Dağılımı */}
            <div className="space-y-2">
                {SORU_TIPLERI.map(({ key, label, icon, desc }) => (
                    <div key={key} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                        <div className="flex items-center gap-2 min-w-0">
                            <span className="text-base">{icon}</span>
                            <div>
                                <span className="text-xs font-bold text-gray-700 block">{label}</span>
                                <span className="text-[10px] text-gray-400">{desc}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => onSoruDagilimiChange(key, Math.max(0, ayarlar.soruDagilimi[key] - 1))}
                                className="w-6 h-6 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold transition-all"
                            >
                                −
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-indigo-700">
                                {ayarlar.soruDagilimi[key]}
                            </span>
                            <button
                                onClick={() => onSoruDagilimiChange(key, Math.min(50, ayarlar.soruDagilimi[key] + 1))}
                                className="w-6 h-6 rounded-md bg-indigo-100 hover:bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold transition-all"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}

                {/* Toplam Gösterge */}
                <div className="flex items-center justify-between px-3 py-1.5 bg-indigo-50 rounded-lg">
                    <span className="text-xs font-bold text-indigo-700">Toplam Soru</span>
                    <span className={`text-sm font-extrabold ${toplamSoru >= 1 ? 'text-indigo-700' : 'text-red-500'}`}>
                        {toplamSoru}
                    </span>
                </div>
            </div>

            {/* Zorluk Seviyesi */}
            <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">
                    Zorluk Seviyesi
                </label>
                <div className="grid grid-cols-4 gap-1">
                    {ZORLUK_SEVIYELERI.map((sev) => (
                        <button
                            key={sev}
                            onClick={() => onAyarlarChange({ zorlukSeviyesi: sev })}
                            className={`py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${ayarlar.zorlukSeviyesi === sev
                                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md'
                                    : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-300'
                                }`}
                        >
                            {sev === 'Otomatik' ? '🎯 Oto' : sev}
                        </button>
                    ))}
                </div>
                {ayarlar.zorlukSeviyesi === 'Otomatik' && (
                    <p className="text-[9px] text-indigo-400 mt-1">
                        Başarı Anı Mimarisi: İlk 2 soru kolay → güven inşası
                    </p>
                )}
            </div>

            {/* İşlem Sayısı */}
            <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">
                    İşlem Sayısı (Opsiyonel)
                </label>
                <div className="grid grid-cols-4 gap-1">
                    {[undefined, 1, 2, 3].map((val) => (
                        <button
                            key={val ?? 'auto'}
                            onClick={() => onAyarlarChange({ islemSayisi: val })}
                            className={`py-1.5 rounded-lg text-[11px] font-bold transition-all ${ayarlar.islemSayisi === val
                                    ? 'bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-md'
                                    : 'bg-white text-gray-500 border border-gray-100 hover:border-purple-300'
                                }`}
                        >
                            {val === undefined ? 'Serbest' : `${val}${val === 3 ? '+' : ''}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Görsel Veri Toggle */}
            <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2.5 border border-gray-100">
                <div className="flex items-center gap-2">
                    <span className="text-base">📊</span>
                    <div>
                        <span className="text-xs font-bold text-gray-700 block">Görsel Veri</span>
                        <span className="text-[10px] text-gray-400">Tablo, grafik, geometri şekilleri</span>
                    </div>
                </div>
                <button
                    onClick={() => onAyarlarChange({ gorselVeriEklensinMi: !ayarlar.gorselVeriEklensinMi })}
                    className={`relative w-10 h-5 rounded-full transition-all duration-300 ${ayarlar.gorselVeriEklensinMi ? 'bg-indigo-500' : 'bg-gray-300'
                        }`}
                >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-300 ${ayarlar.gorselVeriEklensinMi ? 'left-5.5' : 'left-0.5'
                        }`} style={{ left: ayarlar.gorselVeriEklensinMi ? '22px' : '2px' }} />
                </button>
            </div>

            {/* Özel Konu */}
            <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">
                    Tema (Opsiyonel)
                </label>
                <input
                    type="text"
                    value={ayarlar.ozelKonu || ''}
                    onChange={(e) => onAyarlarChange({ ozelKonu: e.target.value || undefined })}
                    placeholder="Örn: Uzay keşfi, Market alışverişi..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none transition-all"
                />
            </div>

            {/* Özel Talimatlar */}
            <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1.5 block">
                    Özel Talimatlar (Opsiyonel)
                </label>
                <textarea
                    value={ayarlar.ozelTalimatlar || ''}
                    onChange={(e) => onAyarlarChange({ ozelTalimatlar: e.target.value || undefined })}
                    placeholder="AI'a eklemek istediğiniz özel notlar..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 outline-none transition-all resize-none"
                />
            </div>
        </div>
    );
};
