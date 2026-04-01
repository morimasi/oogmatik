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
            {/* LGS DENEME MODU BUTONU */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-[2px] rounded-2xl shadow-sm hover:shadow-md transition-all">
                <button
                    onClick={() => {
                        const isLgs = !ayarlar.isLgsMode;
                        onAyarlarChange({
                            isLgsMode: isLgs,
                            ...(isLgs ? {
                                sinif: 8,
                                soruDagilimi: { coktan_secmeli: 20, dogru_yanlis: 0, bosluk_doldurma: 0, acik_uclu: 0 },
                                zorlukSeviyesi: 'Zor',
                                gorselVeriEklensinMi: true,
                                islemSayisi: 3
                            } : {})
                        });
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-[14px] transition-all ${ayarlar.isLgsMode ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'bg-white text-slate-700 hover:bg-orange-50'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${ayarlar.isLgsMode ? 'bg-white/20' : 'bg-orange-100'}`}>
                            🔥
                        </div>
                        <div className="text-left">
                            <span className={`text-[13px] font-black block tracking-tight ${ayarlar.isLgsMode ? 'text-white' : 'text-slate-800'}`}>LGS Yeni Nesil Denemesi</span>
                            <span className={`text-[10px] font-medium ${ayarlar.isLgsMode ? 'text-white/80' : 'text-slate-500'}`}>8. Sınıf • 20 Soru • Zor Seviye</span>
                        </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${ayarlar.isLgsMode ? 'border-white bg-white text-orange-500' : 'border-slate-300'}`}>
                        {ayarlar.isLgsMode && <span className="text-[10px] font-black">✓</span>}
                    </div>
                </button>
            </div>

            {/* Soru Tip Dağılımı */}
            <div className="space-y-2">
                {SORU_TIPLERI.map(({ key, label, icon, desc }) => (
                    <div key={key} className="group flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-slate-100 transition-all duration-200 hover:border-accent/20 hover:shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl transition-colors group-hover:bg-accent/10">
                                {icon}
                            </div>
                            <div className="truncate">
                                <span className="text-[13px] font-bold text-slate-700 block tracking-tight">{label}</span>
                                <span className="text-[10px] text-slate-400 font-medium">{desc}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                            <button
                                onClick={() => onSoruDagilimiChange(key, Math.max(0, ayarlar.soruDagilimi[key] - 1))}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold transition-all ${ayarlar.soruDagilimi[key] === 0 ? 'text-slate-300' : 'text-slate-600 hover:bg-white hover:text-accent shadow-sm'}`}
                                disabled={ayarlar.soruDagilimi[key] === 0}
                            >
                                −
                            </button>
                            <span className="w-7 text-center text-[13px] font-black text-slate-700">
                                {ayarlar.soruDagilimi[key]}
                            </span>
                            <button
                                onClick={() => onSoruDagilimiChange(key, Math.min(50, ayarlar.soruDagilimi[key] + 1))}
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 font-bold hover:bg-white hover:text-accent shadow-sm transition-all"
                            >
                                +
                            </button>
                        </div>
                    </div>
                ))}

                {/* Toplam Gösterge */}
                <div className={`mt-4 p-4 rounded-2xl border transition-all duration-300 ${toplamSoru >= 1 ? 'bg-slate-50 border-slate-100' : 'bg-rose-50 border-rose-100'}`}>
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${toplamSoru >= 1 ? 'text-slate-400' : 'text-rose-600'}`}>Toplam Soru</span>
                            <span className="text-lg font-black text-slate-900">{toplamSoru} Soru</span>
                        </div>
                        {toplamSoru >= 1 ? (
                            <span className="text-2xl opacity-40">📈</span>
                        ) : (
                            <span className="text-2xl animate-pulse">⚠️</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Zorluk Seviyesi */}
            <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Zorluk Prerogatifleri</span>
                    <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {ZORLUK_SEVIYELERI.map((sev) => (
                        <button
                            key={sev}
                            onClick={() => onAyarlarChange({ zorlukSeviyesi: sev })}
                            className={`py-2 rounded-lg text-[10px] font-black transition-all duration-300 ${ayarlar.zorlukSeviyesi === sev
                                ? 'bg-white text-accent shadow-sm scale-[1.02] ring-1 ring-slate-100'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                }`}
                        >
                            {sev === 'Otomatik' ? 'OTO' : sev.toUpperCase()}
                        </button>
                    ))}
                </div>
                {ayarlar.zorlukSeviyesi === 'Otomatik' && (
                    <div className="mt-2 p-3 bg-accent/10 border border-accent/20 rounded-xl flex gap-2 items-start">
                        <span className="text-sm">💎</span>
                        <p className="text-[10px] text-accent font-medium leading-tight">
                            <strong>ZPD Başarı Mimarisi:</strong> İlk 2 soru kolay kurgulanarak özgüven inşası sağlanır.
                        </p>
                    </div>
                )}
            </div>

            {/* İşlem Sayısı */}
            <div>
                <div className="flex items-center gap-2 mb-3 px-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">İşlem Filtresi</span>
                    <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <div className="grid grid-cols-4 gap-1 p-1 bg-slate-50 rounded-xl border border-slate-100">
                    {[undefined, 1, 2, 3].map((val) => (
                        <button
                            key={val ?? 'auto'}
                            onClick={() => onAyarlarChange({ islemSayisi: val })}
                            className={`py-2 rounded-lg text-[10px] font-black transition-all duration-300 ${ayarlar.islemSayisi === val
                                ? 'bg-white text-purple-600 shadow-sm scale-[1.02] ring-1 ring-slate-100'
                                : 'text-slate-400 hover:text-slate-600 hover:bg-white/50'
                                }`}
                        >
                            {val === undefined ? 'OFF' : `${val}${val === 3 ? '+' : ''}`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Görsel Veri Toggle */}
            <div className="group flex items-center justify-between bg-white rounded-2xl px-4 py-3 border border-slate-100 transition-all duration-200 hover:border-accent/20 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl transition-colors group-hover:bg-accent/10">📊</div>
                    <div>
                        <span className="text-xs font-bold text-gray-700 block">Ek Görsel Veri</span>
                        <span className="text-[10px] text-gray-400">Geometri/Veri İşleme: otomatik. Bu seçenek: tüm sorulara ek görsel ekler</span>
                    </div>
                </div>
                <button
                    onClick={() => onAyarlarChange({ gorselVeriEklensinMi: !ayarlar.gorselVeriEklensinMi })}
                    className={`relative w-11 h-6 rounded-full transition-all duration-300 ${ayarlar.gorselVeriEklensinMi ? 'bg-accent shadow-[0_0_12px_hsl(var(--accent-h)_var(--accent-s)_var(--accent-l)_/_0.3)]' : 'bg-slate-200'
                        }`}
                >
                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${ayarlar.gorselVeriEklensinMi ? 'left-6 scale-110' : 'left-1 scale-90'
                        }`} />
                </button>
            </div>

            {/* Özel Konu */}
            <div className="space-y-3">
                <div className="flex items-center gap-2 mb-1 px-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">İçerik Teması</span>
                    <div className="h-px flex-1 bg-slate-100"></div>
                </div>
                <div className="relative group">
                    <input
                        type="text"
                        value={ayarlar.ozelKonu || ''}
                        onChange={(e) => onAyarlarChange({ ozelKonu: e.target.value || undefined })}
                        placeholder="Örn: Uzay, Market, Mevsimler..."
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-medium outline-none transition-all duration-200 focus:border-accent focus:ring-4 focus:ring-accent/5 placeholder:text-slate-300"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-lg pointer-events-none transition-transform group-focus-within:scale-110">📐</div>
                </div>

                <div className="relative group pt-2">
                    <textarea
                        value={ayarlar.ozelTalimatlar || ''}
                        onChange={(e) => onAyarlarChange({ ozelTalimatlar: e.target.value || undefined })}
                        placeholder="Yapay zekaya ek notunuz..."
                        rows={2}
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-medium outline-none transition-all duration-200 focus:border-accent focus:ring-4 focus:ring-accent/5 placeholder:text-slate-300 resize-none"
                    />
                    <div className="absolute right-4 top-6 text-lg pointer-events-none opacity-40">✍️</div>
                </div>
            </div>
        </div>
    );
};
