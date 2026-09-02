/**
 * MatProblemStudyosu — Problem Ayar Paneli
 * Tema Uyumlu, Premium, Kompakt ve Tam İşlevsel Tasarım
 */

import React from 'react';
import type { MatProblemAyarlari, ProblemKategorisi, ProblemSemaTipi } from '../../types/matProblem';

interface MatProblemSoruAyarlariProps {
    ayarlar: MatProblemAyarlari;
    onAyarlarChange: (partial: Partial<MatProblemAyarlari>) => void;
}

const kategoriler: { value: ProblemKategorisi; label: string; icon: string }[] = [
    { value: 'gercek-yasam', label: 'Gerçek Yaşam Senaryosu', icon: '🛒' },
    { value: 'beceri-temelli', label: 'Beceri Temelli (LGS/PISA)', icon: '🧠' },
    { value: 'sema-destekli', label: 'Şema & Model Destekli', icon: '📊' },
    { value: 'lgs-pisa', label: 'LGS/PISA Standart', icon: '🎯' },
    { value: 'cok-adimli', label: 'Çok Adımlı Mantık', icon: '🔗' },
];

const semaSecenekleri: { value: ProblemSemaTipi; label: string; desc: string; icon: string }[] = [
    { value: 'otomatik', label: '🤖 Otomatik (AI Akıllı Seçim)', desc: 'AI, problem türüne göre en uygun şema/görseli otomatik belirler', icon: '✨' },
    { value: 'kutu-modeli', label: 'Singapur Kutu Modeli', desc: 'Parça-bütün ve kat ilişkisi kutu şeması', icon: '📦' },
    { value: 'sayı-doğrusu', label: 'Sayı Doğrusu Modeli', desc: 'Adımlı ve yönlü sayı çizgisi', icon: '📏' },
    { value: 'kesir-blokları', label: 'Kesir Şeriti & Blok Şeması', desc: 'Bütün, yarım, çeyrek kesir alanı', icon: '🧩' },
    { value: 'geometrik-sekil', label: 'Geometri & Koordinat Şeması', desc: 'Çevre, alan, açı ve şekil çizimi', icon: '📐' },
    { value: 'zaman-tüneli', label: 'Zaman Çizelgesi & Kadran', desc: 'Saat, süre ve kronolojik zaman akışı', icon: '⏳' },
    { value: 'para-matrisi', label: 'Bütçe & Banknot Şeması', desc: 'TL, kuruş ve para üstü matrisi', icon: '🪙' },
    { value: 'tablo', label: 'Veri & Karşılaştırma Tablosu', desc: 'Çetele ve sıklık tablosu', icon: '📊' },
    { value: 'grafik', label: 'Sütun / Çizgi Grafiği', desc: 'Görsel istatistik grafiği', icon: '📈' },
    { value: 'denklem-şeması', label: 'Bilinmeyenli Denge Terazisi', desc: 'Denklem ve eşitlik terazisi', icon: '⚖️' },
    { value: 'çizim-alanı', label: 'Öğrenci Kareli Çizim Alanı', desc: 'Çözüm ve modelleme ızgarası', icon: '🎨' },
    { value: 'parça-bütün', label: 'Venn & Küme Ağacı', desc: 'Kümeler ve ilişki şeması', icon: '⭕' },
    { value: 'oran-orantı', label: 'Oran Çarkı & Kat Şeması', desc: 'Doğru ve ters orantı tablosu', icon: '🔄' },
    { value: 'yok', label: 'Şema Yok', desc: 'Metin tabanlı açık uçlu problem', icon: '📝' },
];

export const MatProblemSoruAyarlari: React.FC<MatProblemSoruAyarlariProps> = ({ ayarlar, onAyarlarChange }) => {
    return (
        <div className="space-y-3 mt-3">
            {/* Problem Sayısı ve Zorluk Seviyesi (Yan Yana Kompakt Yapı) */}
            <div className="grid grid-cols-2 gap-2">
                {/* Problem Sayısı */}
                <div className="bg-[var(--bg-secondary)]/50 p-2 rounded-xl border border-[var(--border-color)]">
                    <label className="block text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                        Problem Sayısı
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                        {[3, 5, 7, 10].map((n) => {
                            const isSelected = ayarlar.problemSayisi === n;
                            return (
                                <button
                                    key={n}
                                    onClick={() => onAyarlarChange({ problemSayisi: n })}
                                    className={`py-1 rounded-lg text-xs font-bold transition-all border ${isSelected
                                        ? 'bg-cyan-600 border-cyan-500 text-white shadow-sm'
                                        : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    {n}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Zorluk Seviyesi */}
                <div className="bg-[var(--bg-secondary)]/50 p-2 rounded-xl border border-[var(--border-color)]">
                    <label className="block text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                        Zorluk Seviyesi
                    </label>
                    <div className="grid grid-cols-2 gap-1">
                        {(['Otomatik', 'Kolay', 'Orta', 'Zor'] as const).map((z) => {
                            const isSelected = ayarlar.zorlukSeviyesi === z;
                            return (
                                <button
                                    key={z}
                                    onClick={() => onAyarlarChange({ zorlukSeviyesi: z })}
                                    className={`py-0.5 px-1 rounded-lg text-[10px] font-bold transition-all border truncate ${isSelected
                                        ? 'bg-cyan-600 border-cyan-500 text-white shadow-sm'
                                        : 'bg-[var(--bg-paper)] border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    {z}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Problem Kategorisi */}
            <div className="bg-[var(--bg-secondary)]/50 p-2.5 rounded-xl border border-[var(--border-color)]">
                <label className="block text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1.5">
                    Problem Kategorisi
                </label>
                <div className="grid grid-cols-1 gap-1">
                    {kategoriler.map((k) => {
                        const isSelected = ayarlar.kategori === k.value;
                        return (
                            <button
                                key={k.value}
                                onClick={() => onAyarlarChange({ kategori: k.value })}
                                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-all border ${isSelected
                                    ? 'bg-cyan-600/20 border-cyan-500/60 text-cyan-400 font-bold shadow-sm'
                                    : 'bg-[var(--bg-paper)]/80 border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-cyan-500/30'
                                    }`}
                            >
                                <span className="flex items-center gap-2">
                                    <span className="text-sm">{k.icon}</span>
                                    <span>{k.label}</span>
                                </span>
                                {isSelected && <span className="text-[10px] text-cyan-400 font-bold">✓</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Şema Tipi Tercihi */}
            <div className="bg-[var(--bg-secondary)]/50 p-2.5 rounded-xl border border-[var(--border-color)]">
                <div className="flex justify-between items-center mb-1">
                    <label className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                        Şema & Görselleştirme Tercihi
                    </label>
                    <span className="text-[9px] font-semibold text-cyan-400">14 Profesyonel Şema</span>
                </div>
                <select
                    value={ayarlar.semaTipiTercihi}
                    onChange={(e) => onAyarlarChange({ semaTipiTercihi: e.target.value as ProblemSemaTipi })}
                    className="w-full bg-[var(--bg-paper)] text-[var(--text-primary)] text-xs font-medium rounded-lg px-2.5 py-2 border border-[var(--border-color)] focus:border-cyan-500 outline-none transition-colors"
                >
                    {semaSecenekleri.map((s) => (
                        <option key={s.value} value={s.value} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                            {s.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Sayfa Yapısı ve Mod Seçenekleri */}
            <div className="bg-[var(--bg-secondary)]/50 p-2.5 rounded-xl border border-[var(--border-color)] space-y-1.5">
                <label className="block text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                    Görünüm & Kutular
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--bg-paper)]/70 border border-[var(--border-color)] text-[11px] font-medium text-[var(--text-primary)] cursor-pointer hover:border-cyan-500/40 transition-colors">
                        <input
                            type="checkbox"
                            checked={ayarlar.verilenlerGosterilsinMi}
                            onChange={(e) => onAyarlarChange({ verilenlerGosterilsinMi: e.target.checked })}
                            className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
                        />
                        Verilen/İstenen
                    </label>
                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--bg-paper)]/70 border border-[var(--border-color)] text-[11px] font-medium text-[var(--text-primary)] cursor-pointer hover:border-cyan-500/40 transition-colors">
                        <input
                            type="checkbox"
                            checked={ayarlar.cozumKutusuGosterilsinMi}
                            onChange={(e) => onAyarlarChange({ cozumKutusuGosterilsinMi: e.target.checked })}
                            className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
                        />
                        Çözüm Kutusu
                    </label>
                    <label className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--bg-paper)]/70 border border-[var(--border-color)] text-[11px] font-medium text-[var(--text-primary)] cursor-pointer hover:border-cyan-500/40 transition-colors">
                        <input
                            type="checkbox"
                            checked={ayarlar.gorselVeriEklensinMi}
                            onChange={(e) => onAyarlarChange({ gorselVeriEklensinMi: e.target.checked })}
                            className="w-3.5 h-3.5 rounded accent-cyan-500 cursor-pointer"
                        />
                        Görsel Veri/Grafik
                    </label>
                    <label className={`flex items-center gap-2 p-1.5 rounded-lg border text-[11px] font-bold cursor-pointer transition-colors ${ayarlar.isLgsMode ? 'bg-amber-500/20 border-amber-500/60 text-amber-300' : 'bg-[var(--bg-paper)]/70 border-[var(--border-color)] text-[var(--text-primary)] hover:border-amber-500/40'}`}>
                        <input
                            type="checkbox"
                            checked={ayarlar.isLgsMode ?? false}
                            onChange={(e) => onAyarlarChange({ isLgsMode: e.target.checked })}
                            className="w-3.5 h-3.5 rounded accent-amber-500 cursor-pointer"
                        />
                        🚨 LGS Yeni Nesil
                    </label>
                </div>
            </div>

            {/* Özel Konu & Talimatlar */}
            <div className="bg-[var(--bg-secondary)]/50 p-2.5 rounded-xl border border-[var(--border-color)] space-y-2">
                <div>
                    <label className="block text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                        Özel Konu (İsteğe Bağlı)
                    </label>
                    <input
                        type="text"
                        value={ayarlar.ozelKonu || ''}
                        onChange={(e) => onAyarlarChange({ ozelKonu: e.target.value || undefined })}
                        placeholder="Ör: Kesirlerle İşlemler"
                        className="w-full bg-[var(--bg-paper)] text-[var(--text-primary)] text-xs rounded-lg px-2.5 py-1.5 border border-[var(--border-color)] focus:border-cyan-500 outline-none placeholder:text-[var(--text-muted)] transition-colors"
                    />
                </div>
                <div>
                    <label className="block text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                        Özel Talimatlar (İsteğe Bağlı)
                    </label>
                    <textarea
                        value={ayarlar.ozelTalimatlar || ''}
                        onChange={(e) => onAyarlarChange({ ozelTalimatlar: e.target.value || undefined })}
                        placeholder="Ör: Problemler alışveriş ve harçlık senaryolu olsun..."
                        rows={2}
                        className="w-full bg-[var(--bg-paper)] text-[var(--text-primary)] text-xs rounded-lg px-2.5 py-1.5 border border-[var(--border-color)] focus:border-cyan-500 outline-none placeholder:text-[var(--text-muted)] resize-none transition-colors"
                    />
                </div>
            </div>
        </div>
    );
};
