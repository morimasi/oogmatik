/**
 * MatProblemStudyosu — Problem Ayar Paneli
 * Açık uçlu problem parametreleri (kategori, zorluk, sayı, şema, LGS modu)
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
        <div className="space-y-4 mt-4">
            {/* Problem Sayısı */}
            <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Problem Sayısı</label>
                <div className="flex items-center gap-2">
                    {[3, 5, 7, 10].map((n) => (
                        <button key={n} onClick={() => onAyarlarChange({ problemSayisi: n })} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${ayarlar.problemSayisi === n ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                            {n}
                        </button>
                    ))}
                </div>
            </div>

            {/* Zorluk Seviyesi */}
            <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Zorluk Seviyesi</label>
                <div className="flex items-center gap-1">
                    {(['Otomatik', 'Kolay', 'Orta', 'Zor'] as const).map((z) => (
                        <button key={z} onClick={() => onAyarlarChange({ zorlukSeviyesi: z })} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${ayarlar.zorlukSeviyesi === z ? 'bg-cyan-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                            {z}
                        </button>
                    ))}
                </div>
            </div>

            {/* Problem Kategorisi */}
            <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Problem Kategorisi</label>
                <div className="space-y-1">
                    {kategoriler.map((k) => (
                        <button key={k.value} onClick={() => onAyarlarChange({ kategori: k.value })} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${ayarlar.kategori === k.value ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-600/50' : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700/70 border border-transparent'}`}>
                            <span>{k.icon}</span>
                            {k.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Şema Tipi */}
            <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Şema Tipi Tercihi</label>
                <select
                    value={ayarlar.semaTipiTercihi}
                    onChange={(e) => onAyarlarChange({ semaTipiTercihi: e.target.value as ProblemSemaTipi })}
                    className="w-full bg-zinc-800 text-white text-xs rounded-lg px-3 py-2 border border-zinc-700 focus:border-cyan-500 outline-none"
                >
                    {semaSecenekleri.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                </select>
            </div>

            {/* Seçenekler */}
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={ayarlar.verilenlerGosterilsinMi} onChange={(e) => onAyarlarChange({ verilenlerGosterilsinMi: e.target.checked })} className="w-4 h-4 rounded accent-cyan-500" />
                    Verilenler/İstenenler Kutusu
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={ayarlar.cozumKutusuGosterilsinMi} onChange={(e) => onAyarlarChange({ cozumKutusuGosterilsinMi: e.target.checked })} className="w-4 h-4 rounded accent-cyan-500" />
                    Çözüm Yazma Kutusu
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={ayarlar.gorselVeriEklensinMi} onChange={(e) => onAyarlarChange({ gorselVeriEklensinMi: e.target.checked })} className="w-4 h-4 rounded accent-cyan-500" />
                    Görsel Veri Ekle (Grafik/Tablo)
                </label>
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                    <input type="checkbox" checked={ayarlar.isLgsMode ?? false} onChange={(e) => onAyarlarChange({ isLgsMode: e.target.checked })} className="w-4 h-4 rounded accent-cyan-500" />
                    🚨 LGS Yeni Nesil Modu
                </label>
            </div>

            {/* Özel Konu */}
            <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Özel Konu (İsteğe Bağlı)</label>
                <input
                    type="text"
                    value={ayarlar.ozelKonu || ''}
                    onChange={(e) => onAyarlarChange({ ozelKonu: e.target.value || undefined })}
                    placeholder="Ör: Kesirlerle İşlemler"
                    className="w-full bg-zinc-800 text-white text-xs rounded-lg px-3 py-2 border border-zinc-700 focus:border-cyan-500 outline-none placeholder:text-zinc-600"
                />
            </div>

            {/* Özel Talimatlar */}
            <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Özel Talimatlar (İsteğe Bağlı)</label>
                <textarea
                    value={ayarlar.ozelTalimatlar || ''}
                    onChange={(e) => onAyarlarChange({ ozelTalimatlar: e.target.value || undefined })}
                    placeholder="Ör: Problemler alışveriş konulu olsun..."
                    rows={2}
                    className="w-full bg-zinc-800 text-white text-xs rounded-lg px-3 py-2 border border-zinc-700 focus:border-cyan-500 outline-none placeholder:text-zinc-600 resize-none"
                />
            </div>
        </div>
    );
};
