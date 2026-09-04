/**
 * MatSoruAyarlari — Ultra-Premium SaaS Soru Dağılımı & Gelişmiş Filtreler
 */

import React from 'react';
import type { MatSinavAyarlari } from '../../types/matSinav';

interface MatSoruAyarlariProps {
    ayarlar: MatSinavAyarlari;
    onSoruDagilimiChange: (tip: keyof MatSinavAyarlari['soruDagilimi'], sayi: number) => void;
    onAyarlarChange: (partial: Partial<MatSinavAyarlari>) => void;
}

const SORU_TIPLERI: { key: keyof MatSinavAyarlari['soruDagilimi']; label: string; icon: string; desc: string }[] = [
    { key: 'coktan_secmeli', label: 'Çoktan Seçmeli', icon: '🔘', desc: '4 Seçenekli Test' },
    { key: 'dogru_yanlis', label: 'Doğru / Yanlış', icon: '✅', desc: 'D/Y Mantık Sorgusu' },
    { key: 'bosluk_doldurma', label: 'Boşluk Doldurma', icon: '✍️', desc: 'Eksik İfade/Hesap' },
    { key: 'acik_uclu', label: 'Açık Uçlu', icon: '📝', desc: 'Çözümlü Klasik Soru' },
];

const ZORLUK_SEVIYELERI = ['Otomatik', 'Kolay', 'Orta', 'Zor'] as const;

export const MatSoruAyarlari: React.FC<MatSoruAyarlariProps> = ({
    ayarlar,
    onSoruDagilimiChange,
    onAyarlarChange,
}) => {
    const toplamSoru = (Object.values(ayarlar.soruDagilimi) as number[]).reduce((a: number, b: number) => a + b, 0);

    return (
        <div className="space-y-3 text-[var(--text-primary)]">

            {/* LGS DENEME MODU BUTONU (Ultra-Compact SaaS Badge Card) */}
            <div className="relative group overflow-hidden rounded-xl p-[1px] bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 shadow-xs hover:shadow-md transition-all duration-300">
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[11px] transition-all duration-300 ${ayarlar.isLgsMode ? 'bg-gradient-to-r from-amber-600 to-rose-600 text-white' : 'bg-[var(--bg-paper)]/90 backdrop-blur-md hover:bg-amber-500/5'}`}
                >
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-black transition-all ${ayarlar.isLgsMode ? 'bg-white/20 text-white' : 'bg-amber-500/10 text-amber-600'}`}>
                            🔥
                        </div>
                        <div className="text-left truncate">
                            <span className={`text-xs font-black tracking-tight block ${ayarlar.isLgsMode ? 'text-white' : 'text-[var(--text-primary)]'}`}>LGS Yeni Nesil Modu</span>
                            <span className={`text-[9px] font-bold block ${ayarlar.isLgsMode ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>8. Sınıf • 20 Soru • Beceri Temelli</span>
                        </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border border-current flex items-center justify-center transition-transform ${ayarlar.isLgsMode ? 'bg-white text-rose-600 scale-110' : 'opacity-40'}`}>
                        {ayarlar.isLgsMode ? <span className="text-[10px] font-black">✓</span> : <span className="text-[9px]">⚡</span>}
                    </div>
                </button>
            </div>

            {/* Soru Tipi Dağılımı (Compact SaaS Grid) */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] opacity-80">Soru Tipleri & Sayıları</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${toplamSoru >= 1 ? 'bg-accent/10 text-accent border border-accent/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                        Toplam: {toplamSoru} Soru
                    </span>
                </div>

                <div className="grid grid-cols-1 gap-1.5">
                    {SORU_TIPLERI.map(({ key, label, icon, desc }) => (
                        <div key={key} className="flex items-center justify-between bg-[var(--bg-paper)]/80 backdrop-blur-md rounded-xl px-3 py-2 border border-[var(--border-color)]/60 hover:border-accent/30 hover:bg-[var(--bg-paper)] transition-all duration-200 shadow-2xs">
                            <div className="flex items-center gap-2 min-w-0">
                                <span className="text-base">{icon}</span>
                                <div className="truncate">
                                    <span className="text-[11px] font-bold text-[var(--text-primary)] block leading-none">{label}</span>
                                    <span className="text-[9px] text-[var(--text-muted)] font-medium">{desc}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-0.5 rounded-lg border border-[var(--border-color)]/40">
                                <button
                                    onClick={() => onSoruDagilimiChange(key, Math.max(0, ayarlar.soruDagilimi[key] - 1))}
                                    disabled={ayarlar.soruDagilimi[key] === 0}
                                    className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-black text-[var(--text-muted)] hover:text-accent hover:bg-[var(--bg-paper)] transition-all disabled:opacity-30"
                                >
                                    -
                                </button>
                                <span className="w-5 text-center text-xs font-black text-[var(--text-primary)]">
                                    {ayarlar.soruDagilimi[key]}
                                </span>
                                <button
                                    onClick={() => onSoruDagilimiChange(key, Math.min(50, ayarlar.soruDagilimi[key] + 1))}
                                    className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-black text-[var(--text-muted)] hover:text-accent hover:bg-[var(--bg-paper)] transition-all"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Zorluk Seviyesi (Compact Segmented Control) */}
            <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] opacity-80 px-1">Zorluk Seviyesi</span>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-secondary)]/80 backdrop-blur-md rounded-xl border border-[var(--border-color)]/60">
                    {ZORLUK_SEVIYELERI.map((sev) => (
                        <button
                            key={sev}
                            onClick={() => onAyarlarChange({ zorlukSeviyesi: sev })}
                            className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${ayarlar.zorlukSeviyesi === sev
                                ? 'bg-accent text-white shadow-xs scale-[1.02]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-paper)]/50'
                                }`}
                        >
                            {sev === 'Otomatik' ? 'ZPD OTO' : sev}
                        </button>
                    ))}
                </div>
            </div>

            {/* İşlem Sayısı Filtresi */}
            <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] opacity-80 px-1">Adım / İşlem Karmaşıklığı</span>
                <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-secondary)]/80 backdrop-blur-md rounded-xl border border-[var(--border-color)]/60">
                    {[undefined, 1, 2, 3].map((val) => (
                        <button
                            key={val ?? 'auto'}
                            onClick={() => onAyarlarChange({ islemSayisi: val })}
                            className={`py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-300 ${ayarlar.islemSayisi === val
                                ? 'bg-purple-600 text-white shadow-xs scale-[1.02]'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-paper)]/50'
                                }`}
                        >
                            {val === undefined ? 'Serbest' : `${val} Adım`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Ek Görsel Veri Switch */}
            <div className="flex items-center justify-between bg-[var(--bg-paper)]/80 backdrop-blur-md rounded-xl px-3 py-2 border border-[var(--border-color)]/60 shadow-2xs">
                <div className="flex items-center gap-2">
                    <span className="text-base">📊</span>
                    <div>
                        <span className="text-[11px] font-bold text-[var(--text-primary)] block leading-none">Her Soruya Grafik / Görsel</span>
                        <span className="text-[9px] text-[var(--text-muted)] font-medium">Tüm sorulara SVG şekil / tablo üret</span>
                    </div>
                </div>
                <button
                    onClick={() => onAyarlarChange({ gorselVeriEklensinMi: !ayarlar.gorselVeriEklensinMi })}
                    className={`relative w-9 h-5 rounded-full transition-all duration-300 ${ayarlar.gorselVeriEklensinMi ? 'bg-accent shadow-xs' : 'bg-[var(--bg-secondary)]'}`}
                >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${ayarlar.gorselVeriEklensinMi ? 'left-4.5' : 'left-0.5'}`} />
                </button>
            </div>

            {/* Özel Konu & Talimat (Compact Input) */}
            <div className="space-y-1.5 pt-1">
                <div className="relative">
                    <input
                        type="text"
                        value={ayarlar.ozelKonu || ''}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onAyarlarChange({ ozelKonu: e.target.value || undefined })}
                        placeholder="İçerik Teması (Örn: Uzay, Market, Spor...)"
                        className="w-full px-3 py-2 bg-[var(--bg-paper)]/90 border border-[var(--border-color)]/60 rounded-xl text-xs font-medium text-[var(--text-primary)] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-[var(--text-muted)] placeholder:text-[10px]"
                    />
                </div>

                <div className="relative">
                    <textarea
                        value={ayarlar.ozelTalimatlar || ''}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onAyarlarChange({ ozelTalimatlar: e.target.value || undefined })}
                        placeholder="AI Motoruna Özel Pedagojik Talimat..."
                        rows={2}
                        className="w-full px-3 py-2 bg-[var(--bg-paper)]/90 border border-[var(--border-color)]/60 rounded-xl text-xs font-medium text-[var(--text-primary)] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 placeholder:text-[var(--text-muted)] placeholder:text-[10px] resize-none"
                    />
                </div>
            </div>

        </div>
    );
};
