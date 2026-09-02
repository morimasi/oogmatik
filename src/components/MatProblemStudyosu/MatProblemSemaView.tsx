import React from 'react';
import type { MatProblem } from '../../types/matProblem';

interface Props { problem: MatProblem; }

/**
 * Akıllı Metin Temizleyici — SVG içine uzun paragraf girmesini engeller.
 * Sadece sayı, birim, kısa sembol veya açı değerlerini ayıklar.
 */
const cleanLabel = (val?: unknown, fallback = '?'): string => {
    if (!val || typeof val !== 'string') return fallback;
    const str = val.trim();
    if (str.length === 0) return fallback;

    // Eğer zaten kısa bir etiket ise (örn: "15 m", "70°", "x", "a", "12 TL") direkt dön
    if (str.length <= 12 && !str.includes('\n')) return str;

    const angleMatch = str.match(/(\d+)\s*(°|derece)/i);
    if (angleMatch) return `${angleMatch[1]}°`;

    const unitMatch = str.match(/(\d+(?:[.,]\d+)?)\s*(m|cm|mm|km|kg|g|tl|l|dk|saat)/i);
    if (unitMatch) return `${unitMatch[1]} ${unitMatch[2]}`;

    const numMatch = str.match(/\b\d+(?:[.,]\d+)?\b/);
    if (numMatch) return numMatch[0];

    const words = str.split(/\s+/);
    if (words.length <= 2 && str.length <= 15) return str;

    return fallback;
};

/**
 * Çetele Çizgisi Komponenti — 5'li dikey ve yatay çetele grupları çizer
 */
const RenderCeteleGroup: React.FC<{ count: number }> = ({ count }) => {
    const fullGroups = Math.floor(count / 5);
    const remainder = count % 5;

    return (
        <div className="flex items-center gap-2">
            {Array.from({ length: fullGroups }).map((_, gi) => (
                <svg key={gi} viewBox="0 0 28 22" className="w-7 h-5">
                    <line x1="4" y1="3" x2="4" y2="19" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                    <line x1="9" y1="3" x2="9" y2="19" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                    <line x1="14" y1="3" x2="14" y2="19" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                    <line x1="19" y1="3" x2="19" y2="19" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
                    <line x1="2" y1="18" x2="22" y2="4" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            ))}
            {remainder > 0 && (
                <svg viewBox="0 0 28 22" className="w-7 h-5">
                    {Array.from({ length: remainder }).map((_, ri) => (
                        <line
                            key={ri}
                            x1={4 + ri * 5}
                            y1="3"
                            x2={4 + ri * 5}
                            y2="19"
                            stroke="#1e293b"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    ))}
                </svg>
            )}
        </div>
    );
};

/**
 * SVG Arka Plan Rozetli Metin — Çizgilerin veya şekillerin üstünde metnin okunmasını sağlar
 */
const SvgBadgeText: React.FC<{
    x: number;
    y: number;
    text: string;
    fill?: string;
    bgFill?: string;
    fontSize?: number;
    fontWeight?: string;
    textAnchor?: 'start' | 'middle' | 'end';
}> = ({ x, y, text, fill = '#0f172a', bgFill = '#ffffff', fontSize = 9, fontWeight = 'bold', textAnchor = 'middle' }) => {
    const charWidth = fontSize * 0.6;
    const width = Math.max(text.length * charWidth + 8, 16);
    const height = fontSize + 6;
    let rx = x - width / 2;
    if (textAnchor === 'start') rx = x - 2;
    if (textAnchor === 'end') rx = x - width + 2;

    return (
        <g className="select-none">
            <rect
                x={rx}
                y={y - height / 2 - 1}
                width={width}
                height={height}
                fill={bgFill}
                fillOpacity={0.92}
                stroke="#cbd5e1"
                strokeWidth={0.75}
                rx={4}
            />
            <text
                x={x}
                y={y + fontSize / 3}
                fontSize={fontSize}
                fontWeight={fontWeight}
                fill={fill}
                textAnchor={textAnchor}
                fontFamily="system-ui, -apple-system, sans-serif"
            >
                {text}
            </text>
        </g>
    );
};

/**
 * Akıllı Metin Veri Ayrıştırıcısı — Soru metni ve verilenlerden kategorileri, sayıları ve emojileri çıkarır.
 * Artık kod tabanında Kiraz/Armut gibi sabit mock veri kullanılmaz!
 */
const getEmojiForWord = (word: string): string => {
    const w = word.toLowerCase();
    if (w.includes('elma')) return '🍎';
    if (w.includes('armut')) return '🍐';
    if (w.includes('çilek') || w.includes('cilek')) return '🍓';
    if (w.includes('kiraz')) return '🍒';
    if (w.includes('muz')) return '🍌';
    if (w.includes('portakal')) return '🍊';
    if (w.includes('karpuz')) return '🍉';
    if (w.includes('erik') || w.includes('üzüm')) return '🍇';
    if (w.includes('kitap') || w.includes('roman') || w.includes('hikaye') || w.includes('masal')) return '📚';
    if (w.includes('kalem')) return '✏️';
    if (w.includes('silgi')) return '🧼';
    if (w.includes('defter')) return '📓';
    if (w.includes('balık') || w.includes('balik')) return '🐟';
    if (w.includes('kuş') || w.includes('kus')) return '🐦';
    if (w.includes('kedi')) return '🐱';
    if (w.includes('köpek') || w.includes('kopek')) return '🐶';
    if (w.includes('tavşan')) return '🐰';
    if (w.includes('top') || w.includes('futbol') || w.includes('basket')) return '⚽';
    if (w.includes('araba') || w.includes('otobüs') || w.includes('taşıt')) return '🚗';
    if (w.includes('uçak')) return '✈️';
    if (w.includes('oyuncak') || w.includes('ayı') || w.includes('ayıcık')) return '🧸';
    if (w.includes('robot')) return '🤖';
    if (w.includes('bebek')) return '🪆';
    if (w.includes('ağaç') || w.includes('fidan') || w.includes('çiçek')) return '🌳';
    if (w.includes('öğrenci') || w.includes('kız') || w.includes('erkek')) return '🧑‍🎓';
    return '📊';
};

const parseDataFromProblemText = (text: string, verilenler?: string[]): Record<string, number> => {
    const result: Record<string, number> = {};
    const fullText = [text, ...(verilenler || [])].join(' ');

    const colonRegex = /([A-Za-zÇĞİÖŞÜa-zçğıöşü\s]+):\s*(\d+)/g;
    let match;
    while ((match = colonRegex.exec(fullText)) !== null) {
        const cat = match[1].trim();
        const val = parseInt(match[2], 10);
        if (cat.length > 1 && !isNaN(val) && val > 0 && cat.length < 25) {
            result[cat] = val;
        }
    }

    if (Object.keys(result).length >= 2) return result;

    const numWordRegex = /(\d+)\s*(?:adet|tane|kg|m|cm|litre|sayısı|kutu)?\s*([A-Za-zÇĞİÖŞÜa-zçğıöşü]{3,20})/gi;
    while ((match = numWordRegex.exec(fullText)) !== null) {
        const val = parseInt(match[1], 10);
        const cat = match[2].trim();
        const ignoreWords = ['gün', 'saat', 'dakika', 'lira', 'tl', 'adım', 'soru', 'sayı', 'fark', 'toplam', 'tane', 'adet'];
        if (!ignoreWords.includes(cat.toLowerCase()) && !isNaN(val) && val > 0 && val < 500) {
            const formattedCat = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
            if (!result[formattedCat]) {
                result[formattedCat] = val;
            }
        }
    }

    if (Object.keys(result).length >= 2) return result;

    if (verilenler && verilenler.length > 0) {
        verilenler.forEach((v, idx) => {
            const nums = v.match(/\d+/g);
            if (nums && nums.length > 0) {
                const cleanName = v.replace(/\d+/g, '').replace(/[^\w\sÇĞİÖŞÜçğıöşü]/gi, '').trim() || `Öğe ${idx + 1}`;
                result[cleanName.slice(0, 15)] = parseInt(nums[0], 10);
            }
        });
    }

    if (Object.keys(result).length === 0) {
        result['1. Veri Grubu'] = 8;
        result['2. Veri Grubu'] = 12;
    }

    return result;
};

export const MatProblemSemaView: React.FC<Props> = ({ problem }) => {
    const text = problem.soruMetni || '';
    const given = problem.verilenler || [];
    const lw = text.toLowerCase();
    const sinif = problem.sinif || 5;

    const st = (problem.semaTipi || '').toString().toLowerCase();

    // 🚨 Şema Yoksa Hiçbir Şey Render Etme! (Görsel Zorunluluğu Yoktur)
    if (st === 'yok' || st === 'yoktur' || st === 'none') {
        return null;
    }

    // ─── Akıllı Otomatik Şema ve Mod Tespiti (MEB & LGS Taksonomisi) ─────────────────
    let mode = '';
    if (st.includes('cetele') || st.includes('çetele')) mode = 'cetele-tablosu';
    else if (st.includes('siklik') || st.includes('sıklık')) mode = 'siklik-tablosu';
    else if (st.includes('nesne-grafigi') || st.includes('nesne_grafigi') || st.includes('sekil-grafigi')) mode = 'nesne-grafigi';
    else if (st.includes('nesne-izgarasi') || st.includes('izgara') || st.includes('kutu-modeli')) mode = 'nesne-izgarasi';
    else if (st.includes('terazi') || st.includes('denklem-semasi')) mode = 'terazi';
    else if (st.includes('abakus') || st.includes('basamak')) mode = 'abakus-basamak';
    else if (st.includes('cetvel') || st.includes('olcme')) mode = 'cetvel-olcme';
    else if (st.includes('birim-kare') || st.includes('kareli-zemin') || st.includes('grid')) mode = 'birim-kareli-zemin';
    else if (st.includes('iletki') || st.includes('aciolcer')) mode = 'iletki-aciolcer';
    else if (st.includes('paralelkenar') || st.includes('yamuk')) mode = 'paralelkenar-yamuk';
    else if (st.includes('egim') || st.includes('koordinat') || st.includes('lgs-egim')) mode = 'egim';
    else if (st.includes('acinim') || st.includes('3d') || st.includes('prizma-acinim')) mode = 'acinim';
    else if (st.includes('cebir') || st.includes('karo') || st.includes('alan-modeli') || st.includes('lgs-alan')) mode = 'cebir-karo';
    else if (st.includes('benzerlik') || st.includes('eslik')) mode = 'benzerlik';
    else if (st.includes('paralel')) mode = 'paralel-acilar';
    else if (st.includes('dilim') || st.includes('daire-dilim')) mode = 'daire-dilim';
    else if (st.includes('olasilik') || st.includes('cark')) mode = 'olasilik';
    else if (st.includes('venn') || st.includes('kume')) mode = 'venn';
    else if (st.includes('asal') || st.includes('ebob') || st.includes('ekok') || st.includes('lgs-ebob')) mode = 'asal-agac';
    else if (st.includes('yuzde') || st.includes('lgs-karekok')) mode = 'yuzde';
    else if (st.includes('oruntu') || st.includes('oruntu-blok')) mode = 'oruntu';
    else if (st.includes('taban-blok') || st.includes('onluk')) mode = 'taban-blok';
    else if (st.includes('dogru') || st.includes('esitsizlik') || st.includes('sayı-doğrusu')) mode = 'sayi-dogru';
    else if (st.includes('kesir-bloklari') || st.includes('kesir-pastasi') || st.includes('kesir')) mode = 'kesir-serit';
    else if (st.includes('prizma') || st.includes('hacim')) mode = 'prizma';
    else if (st.includes('para') || st.includes('para-matrisi')) mode = 'para-matrisi';
    else if (st.includes('tablo')) mode = 'tablo';
    else if (st.includes('geometrik') || st.includes('sekil') || st.includes('geometrik-sekil')) mode = 'geometrik';
    else if (st.includes('zaman') || st.includes('saat') || st.includes('zaman-tuneli')) mode = 'saat';
    else if (st.includes('oranti') || st.includes('oran') || st.includes('oran-oranti')) mode = 'orant';
    else if (st.includes('grafik') || st.includes('lgs-ikili-grafik')) mode = 'ikili-grafik';
    else if (st.includes('pisagor') || st.includes('lgs-pisagor-ucgen')) mode = 'pisagor';
    else if (lw.includes('çetele tablosu')) mode = 'cetele-tablosu';
    else if (lw.includes('sıklık tablosu')) mode = 'siklik-tablosu';
    else if (lw.includes('nesne grafiği') || lw.includes('şekil grafiği')) mode = 'nesne-grafigi';
    else if (lw.includes('daire grafiği') || (lw.includes('grafik') && lw.includes('açı'))) mode = 'ikili-grafik';
    else if (lw.includes('pisagor') || (lw.includes('dik üçgen') && lw.includes('hipotenüs'))) mode = 'pisagor';
    else if (lw.includes('eşitsizlik') || lw.includes('küçüktür') || lw.includes('büyüktür')) mode = 'sayi-dogru';
    else if (lw.includes('eğim') || lw.includes('rampa') || lw.includes('koordinat düzlemi')) mode = 'egim';
    else if (lw.includes('silindir') || lw.includes('açınım') || lw.includes('piramit')) mode = 'acinim';
    else if (lw.includes('cebirsel') && (lw.includes('özdeşlik') || lw.includes('(a') || lw.includes('kare'))) mode = 'cebir-karo';
    else if (lw.includes('benzerlik') || (lw.includes('eşlik') && lw.includes('üçgen'))) mode = 'benzerlik';
    else if (lw.includes('paralel') && (lw.includes('kesen') || lw.includes('iç ters') || lw.includes('açı'))) mode = 'paralel-acilar';
    else if (lw.includes('daire dilimi') || lw.includes('yay uzunluğu')) mode = 'daire-dilim';
    else if (lw.includes('terazi') || lw.includes('kefe') || lw.includes('dengede')) mode = 'terazi';
    else if (lw.includes('olasılık') || lw.includes('bilye') || lw.includes('çark')) mode = 'olasilik';
    else if (lw.includes('venn') || lw.includes('küme') || lw.includes('kesişim')) mode = 'venn';
    else if (lw.includes('asal çarpan') || lw.includes('çarpan ağacı') || lw.includes('ebob') || lw.includes('ekok')) mode = 'asal-agac';
    else if (lw.includes('yüzde') || lw.includes('%')) mode = 'yuzde';
    else if (lw.includes('örüntü') || lw.includes('adım')) mode = 'oruntu';
    else if (lw.includes('onluk') && lw.includes('birlik')) mode = 'taban-blok';
    else if (lw.includes('birim kesir') || (lw.includes('kesir') && sinif <= 4)) mode = 'kesir-serit';
    else if (lw.includes('ondalık')) mode = 'ondalik';
    else if (lw.includes('orantı') || lw.includes('doğru orantı') || lw.includes('ters orantı')) mode = 'orant';
    else if (lw.includes('rasyonel') || lw.includes('tam sayı') || lw.includes('mutlak değer')) mode = 'sayi-dogru';
    else if (lw.includes('dikdörtgen') || lw.includes('kare') || lw.includes('üçgen') || lw.includes('çember') || lw.includes('daire') || lw.includes('yamuk') || lw.includes('paralelkenar')) mode = 'geometrik';
    else if (lw.includes('saat') || lw.includes('zaman')) mode = 'saat';
    else {
        // Belirgin bir şema isteği veya kazanımı yoksa şema çizme!
        return null;
    }

    const sv = (problem.semaVerisi || {}) as Record<string, unknown>;
    const tv = (problem as unknown as Record<string, unknown>).tabloVerisi as Record<string, unknown> | undefined;

    // Metinden dinamik ayrıştırılan veri (Artık kod tabanında sabit Kiraz/Armut kullanılmaz!)
    const parsedTextData = parseDataFromProblemText(text, problem.verilenler);

    // Etiketlerin Akıllı Temizliği
    const etiket = (sv.etiketler || {}) as Record<string, string>;
    const tabanL = cleanLabel(etiket.taban || given[0], 'a');
    const yuksL = cleanLabel(etiket.yukseklik || given[1], 'h');
    const aciL = cleanLabel(etiket.aci || given[2], '70°');

    const getBadgeTitle = (m: string): string => {
        if (m.startsWith('lgs-') || m === 'pisagor' || m === 'egim' || m === 'acinim' || m === 'ikili-grafik') return 'LGS / PISA Yeni Nesil Görsel';
        if (m === 'terazi' || m === 'cebir-karo' || m === 'asal-agac' || m === 'venn' || m === 'sayi-dogru') return 'Cebir & Mantık Modeli';
        if (m === 'cetele-tablosu' || m === 'siklik-tablosu' || m === 'nesne-grafigi' || m === 'nesne-izgarasi') return 'MEB Veri Toplama Tablosu';
        if (m === 'abakus-basamak' || m === 'kesir-pastasi' || m === 'kesir-serit' || m === 'saat' || m === 'cetvel-olcme' || m === 'taban-blok') return 'İlkokul Kavramsal Şema';
        return 'MEB 2024-2025 Standart Görsel';
    };

    const wrap = (title: string, children: React.ReactNode) => (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 my-2 shadow-sm print:break-inside-avoid w-full max-w-full overflow-hidden">
            <div className="text-[9px] font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>📐 {title}</span>
                <span className="text-[8px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">{getBadgeTitle(mode)}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white p-2 rounded-lg border border-slate-100 w-full overflow-hidden">
                {children}
            </div>
        </div>
    );

    // ─── 1. MEB ÇETELE TABLOSU ──────────────────────────────────
    if (mode === 'cetele-tablosu') {
        const ceteleData = (sv.ceteleData as Record<string, number>) || parsedTextData;

        return wrap('MEB Çetele Tablosu', (
            <div className="w-full max-w-[260px]">
                <div className="bg-amber-400 text-slate-900 font-extrabold text-[10px] text-center py-1 rounded-t-lg border border-amber-500">
                    Çetele Tablosu: Problem Verileri
                </div>
                <table className="w-full text-[9px] border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-amber-100 text-amber-900 font-bold border-b border-slate-300">
                            <th className="p-1 border-r border-slate-300 text-left pl-2">Kategori</th>
                            <th className="p-1 text-center">Çetele Sayısı</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(ceteleData).map(([kat, val], idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-1.5 font-extrabold text-slate-700 border-r border-b border-slate-200 pl-2">
                                    {kat}
                                </td>
                                <td className="p-1.5 border-b border-slate-200 flex justify-center">
                                    <RenderCeteleGroup count={val} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ));
    }

    // ─── 2. MEB SIKLIK TABLOSU ──────────────────────────────────
    if (mode === 'siklik-tablosu') {
        const siklikData = (sv.ceteleData as Record<string, number>) || parsedTextData;

        return wrap('MEB Sıklık Tablosu', (
            <div className="w-full max-w-[260px]">
                <div className="bg-emerald-500 text-white font-extrabold text-[10px] text-center py-1 rounded-t-lg border border-emerald-600">
                    Sıklık Tablosu: Problem Verileri
                </div>
                <table className="w-full text-[9px] border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-emerald-100 text-emerald-950 font-bold border-b border-slate-300">
                            <th className="p-1 border-r border-slate-300 text-left pl-2">Tür / Eleman</th>
                            <th className="p-1 text-center">Sayı</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(siklikData).map(([kat, val], idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <td className="p-1.5 font-bold text-slate-700 border-r border-b border-slate-200 pl-2">
                                    {kat}
                                </td>
                                <td className="p-1.5 border-b border-slate-200 text-center font-extrabold text-emerald-700 text-xs">
                                    {val}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ));
    }

    // ─── 3. MEB NESNE VE ŞEKİL GRAFİĞİ ─────────────────────────
    if (mode === 'nesne-grafigi') {
        const rawNesneData = (sv.nesneGrafikData as { kategori: string; adet: number; simge?: string }[]) ||
            Object.entries(parsedTextData).map(([kat, val]) => ({
                kategori: kat,
                adet: val,
                simge: getEmojiForWord(kat),
            }));
        const lejant = (sv.lejantNotu as string) || 'Not: Her nesne 1 adet ögeyi belirtmektedir.';

        return wrap('MEB Nesne & Şekil Grafiği', (
            <div className="w-full max-w-[270px] flex flex-col items-center">
                <div className="w-full border-2 border-emerald-500 rounded-lg overflow-hidden bg-emerald-50/40">
                    <div className="bg-emerald-600 text-white font-extrabold text-[9px] text-center py-1">
                        Sınıftaki Nesne Dağılımı Grafiği
                    </div>
                    <table className="w-full text-[9px] border-collapse">
                        <tbody>
                            {rawNesneData.map((item, idx) => (
                                <tr key={idx} className="border-b border-emerald-100 last:border-b-0">
                                    <td className="p-1.5 font-extrabold text-slate-700 border-r border-emerald-200 w-1/3 bg-white pl-2">
                                        {item.kategori}
                                    </td>
                                    <td className="p-1.5 bg-white">
                                        <div className="flex flex-wrap gap-1 items-center">
                                            {Array.from({ length: item.adet }).map((_, iconIdx) => (
                                                <span key={iconIdx} className="text-sm select-none">
                                                    {item.simge || '🧸'}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="bg-rose-50 border-t border-rose-200 text-rose-800 text-[8px] font-bold p-1 text-center">
                        📌 {lejant}
                    </div>
                </div>
            </div>
        ));
    }

    // ─── 4. MEB KARMA NESNE IZGARASI (SAYMA KUTUSU) ──────────────
    if (mode === 'nesne-izgarasi') {
        const shapes = ['▲', '■', '●', '▬'];
        const colors = ['text-amber-500', 'text-cyan-600', 'text-emerald-500', 'text-rose-500'];

        return wrap('Geometrik Şekil Izgarası (Sayma Kümesi)', (
            <div className="w-full max-w-[250px] border-2 border-dashed border-amber-300 bg-amber-50/50 p-2 rounded-lg flex flex-col items-center">
                <div className="grid grid-cols-6 gap-2 my-1">
                    {Array.from({ length: 24 }).map((_, idx) => (
                        <span key={idx} className={`text-base font-black ${colors[idx % colors.length]}`}>
                            {shapes[idx % shapes.length]}
                        </span>
                    ))}
                </div>
                <span className="text-[8px] font-bold text-amber-800 mt-1">
                    Yukarıdaki şekilleri sayarak tablonuzu doldurunuz.
                </span>
            </div>
        ));
    }

    // ─── RENDER DİĞER LGS & MEB ŞEMALARI ──────────────────────────

    if (mode === 'ikili-grafik') return wrap('Veri Analizi — Sütun & Daire Grafiği', (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-[260px]">
            <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-slate-500 mb-1">Satış Miktarları</span>
                <svg viewBox="0 0 120 85" className="w-full h-auto">
                    <line x1="18" y1="8" x2="18" y2="72" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="18" y1="72" x2="115" y2="72" stroke="#94a3b8" strokeWidth="1.5" />
                    <rect x="26" y="28" width="16" height="44" fill="#0284c7" rx="2" />
                    <rect x="54" y="18" width="16" height="54" fill="#0d9488" rx="2" />
                    <rect x="82" y="42" width="16" height="30" fill="#f59e0b" rx="2" />
                    <SvgBadgeText x={34} y={22} text={cleanLabel(given[0], '120')} fontSize={7} fill="#0284c7" />
                    <SvgBadgeText x={62} y={12} text={cleanLabel(given[1], '150')} fontSize={7} fill="#0d9488" />
                    <SvgBadgeText x={90} y={36} text={cleanLabel(given[2], '80')} fontSize={7} fill="#b45309" />
                    <text x="34" y="81" fontSize="7" fontWeight="bold" fill="#475569" textAnchor="middle">A</text>
                    <text x="62" y="81" fontSize="7" fontWeight="bold" fill="#475569" textAnchor="middle">B</text>
                    <text x="90" y="81" fontSize="7" fontWeight="bold" fill="#475569" textAnchor="middle">C</text>
                </svg>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-slate-500 mb-1">Düzey Dağılımı</span>
                <svg viewBox="0 0 90 85" className="w-full h-auto">
                    <circle cx="45" cy="42" r="34" fill="#e2e8f0" />
                    <path d="M 45,42 L 45,8 A 34 34 0 0 1 74.4,59 Z" fill="#0284c7" />
                    <path d="M 45,42 L 74.4,59 A 34 34 0 0 1 15.6,59 Z" fill="#0d9488" />
                    <path d="M 45,42 L 15.6,59 A 34 34 0 0 1 45,8 Z" fill="#f59e0b" />
                    <circle cx="45" cy="42" r="3" fill="#ffffff" />
                    <text x="56" y="34" fontSize="7" fontWeight="extrabold" fill="#ffffff" textAnchor="middle">120°</text>
                    <text x="45" y="64" fontSize="7" fontWeight="extrabold" fill="#ffffff" textAnchor="middle">150°</text>
                    <text x="30" y="44" fontSize="7" fontWeight="extrabold" fill="#ffffff" textAnchor="middle">90°</text>
                </svg>
            </div>
        </div>
    ));

    if (mode === 'pisagor') return wrap(`Pisagor Bağıntısı: a² + b² = c²`, (
        <svg viewBox="0 0 190 100" className="w-full max-w-[230px] h-auto">
            <polygon points="25,85 155,85 155,18" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2.5" />
            <path d="M 143,85 L 143,73 L 155,73" fill="none" stroke="#0369a1" strokeWidth="1.5" />
            <circle cx="148" cy="79" r="2" fill="#0369a1" />
            <SvgBadgeText x={90} y={94} text={`a = ${tabanL}`} fill="#0f172a" />
            <SvgBadgeText x={170} y={51} text={`b = ${yuksL}`} fill="#0f172a" />
            <SvgBadgeText x={75} y={42} text="c = ?" fill="#0284c7" />
            <text x="14" y="88" fontSize="9" fontWeight="extrabold" fill="#0369a1">A</text>
            <text x="162" y="88" fontSize="9" fontWeight="extrabold" fill="#0369a1">B</text>
            <text x="162" y="15" fontSize="9" fontWeight="extrabold" fill="#0369a1">C</text>
        </svg>
    ));

    if (mode === 'esitsizlik') return wrap('Eşitsizlik Çözüm Kümesi (Sayı Doğrusu)', (
        <svg viewBox="0 0 240 45" className="w-full max-w-[250px] h-auto">
            <line x1="10" y1="22" x2="230" y2="22" stroke="#64748b" strokeWidth="2" />
            <polygon points="230,22 223,18 223,26" fill="#64748b" />
            {[-2, -1, 0, 1, 2, 3, 4, 5].map((n, i) => (
                <g key={n}>
                    <line x1={20 + i * 28} y1="17" x2={20 + i * 28} y2="27" stroke="#94a3b8" strokeWidth="1.5" />
                    <text x={20 + i * 28} y="38" fontSize="7" fontWeight="bold" fill="#475569" textAnchor="middle">{n}</text>
                </g>
            ))}
            <line x1="104" y1="22" x2="216" y2="22" stroke="#e11d48" strokeWidth="3.5" />
            <circle cx="104" cy="22" r="5" fill="#e11d48" stroke="#ffffff" strokeWidth="1.5" />
            <SvgBadgeText x={104} y={10} text="x ≥ 3" fill="#e11d48" bgFill="#fff1f2" />
        </svg>
    ));

    if (mode === 'egim') return wrap('Eğim & Koordinat Düzlemi: m = Dikey / Yatay', (
        <svg viewBox="0 0 190 105" className="w-full max-w-[220px] h-auto">
            <line x1="20" y1="8" x2="20" y2="92" stroke="#64748b" strokeWidth="2" /><polygon points="20,4 16,10 24,10" fill="#64748b" />
            <line x1="20" y1="92" x2="180" y2="92" stroke="#64748b" strokeWidth="2" /><polygon points="184,92 178,88 178,96" fill="#64748b" />
            <text x="10" y="12" fontSize="8" fontWeight="bold" fill="#475569">y</text>
            <text x="183" y="101" fontSize="8" fontWeight="bold" fill="#475569">x</text>
            <line x1="20" y1="92" x2="150" y2="18" stroke="#0284c7" strokeWidth="2.5" />
            <line x1="150" y1="18" x2="150" y2="92" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="3,2" />
            <SvgBadgeText x={85} y={98} text={`Yatay: ${tabanL}`} fill="#0369a1" />
            <SvgBadgeText x={160} y={55} text={`Dikey: ${yuksL}`} fill="#e11d48" />
            <SvgBadgeText x={75} y={45} text="m = ?" fill="#0284c7" />
        </svg>
    ));

    if (mode === 'acinim') {
        const isSil = lw.includes('silindir');
        return wrap(isSil ? 'Silindir Açınımı' : 'Kare Dik Piramit Açınımı', (
            isSil ? (
                <svg viewBox="0 0 180 110" className="w-full max-w-[210px] h-auto">
                    <circle cx="90" cy="18" r="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                    <text x="90" y="21" fontSize="7" fontWeight="bold" fill="#0369a1" textAnchor="middle">r</text>
                    <rect x="25" y="34" width="130" height="42" fill="#f0f9ff" stroke="#0284c7" strokeWidth="1.5" />
                    <text x="90" y="58" fontSize="8" fontWeight="bold" fill="#0369a1" textAnchor="middle">2·π·r × h</text>
                    <circle cx="90" cy="92" r="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                </svg>
            ) : (
                <svg viewBox="0 0 140 130" className="w-full max-w-[170px] h-auto">
                    <rect x="45" y="40" width="50" height="50" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                    <polygon points="45,40 95,40 70,8" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
                    <polygon points="95,40 95,90 127,65" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
                    <polygon points="50,90 95,90 70,122" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
                    <polygon points="45,40 45,90 13,65" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
                    <text x="70" y="68" fontSize="8" fontWeight="bold" fill="#0369a1" textAnchor="middle">a²</text>
                </svg>
            )
        ));
    }

    if (mode === 'cebir-karo') return wrap('Cebirsel Karo Alan Modeli: (a + b)² = a² + 2ab + b²', (
        <svg viewBox="0 0 140 140" className="w-full max-w-[170px] h-auto">
            <rect x="10" y="10" width="75" height="75" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
            <text x="47" y="52" fontSize="10" fontWeight="extrabold" fill="#ffffff" textAnchor="middle">a²</text>
            <rect x="85" y="10" width="40" height="75" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" />
            <text x="105" y="52" fontSize="8" fontWeight="bold" fill="#047857" textAnchor="middle">a·b</text>
            <rect x="10" y="85" width="75" height="40" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" />
            <text x="47" y="108" fontSize="8" fontWeight="bold" fill="#047857" textAnchor="middle">a·b</text>
            <rect x="85" y="85" width="40" height="40" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
            <text x="105" y="108" fontSize="8" fontWeight="bold" fill="#854d0e" textAnchor="middle">b²</text>
        </svg>
    ));

    if (mode === 'benzerlik') return wrap('Üçgen Benzerliği (ABC ~ DEF)', (
        <div className="flex items-center justify-center gap-3 w-full max-w-[220px]">
            <svg viewBox="0 0 90 75" className="w-1/2 h-auto">
                <polygon points="10,65 80,65 45,10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                <SvgBadgeText x={45} y={70} text={tabanL} fontSize={7} />
                <text x="45" y="42" fontSize="8" fontWeight="extrabold" fill="#0369a1" textAnchor="middle">△ ABC</text>
            </svg>
            <span className="text-xl font-black text-slate-400">~</span>
            <svg viewBox="0 0 65 55" className="w-1/3 h-auto">
                <polygon points="8,45 57,45 32,10" fill="#dcfce7" stroke="#166534" strokeWidth="2" />
                <SvgBadgeText x={32} y={50} text={yuksL} fontSize={7} fill="#166534" />
                <text x="32" y="32" fontSize="7" fontWeight="extrabold" fill="#15803d" textAnchor="middle">△ DEF</text>
            </svg>
        </div>
    ));

    if (mode === 'paralel-acilar') return wrap(`Paralel Doğrular ve Kesen (d₁ // d₂)`, (
        <svg viewBox="0 0 200 90" className="w-full max-w-[230px] h-auto">
            <line x1="15" y1="26" x2="185" y2="26" stroke="#0284c7" strokeWidth="2.5" />
            <line x1="15" y1="68" x2="185" y2="68" stroke="#0284c7" strokeWidth="2.5" />
            <line x1="45" y1="84" x2="155" y2="10" stroke="#e11d48" strokeWidth="2" />
            <text x="190" y="29" fontSize="8" fontWeight="bold" fill="#0284c7">d₁</text>
            <text x="190" y="71" fontSize="8" fontWeight="bold" fill="#0284c7">d₂</text>
            <path d="M 125,26 A 14 14 0 0 0 135,16" fill="none" stroke="#e11d48" strokeWidth="1.5" />
            <SvgBadgeText x={144} y={15} text={`α (${aciL})`} fill="#e11d48" bgFill="#fff1f2" />
            <path d="M 75,68 A 14 14 0 0 0 85,58" fill="none" stroke="#e11d48" strokeWidth="1.5" />
            <SvgBadgeText x={96} y={57} text={`β (${aciL})`} fill="#e11d48" bgFill="#fff1f2" />
        </svg>
    ));

    if (mode === 'daire-dilim') return wrap('Daire Dilimi — Merkez Açı & Yay', (
        <svg viewBox="0 0 130 115" className="w-full max-w-[150px] h-auto">
            <circle cx="65" cy="60" r="42" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M 65,60 L 65,18 A 42 42 0 0 1 104,77 Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
            <circle cx="65" cy="60" r="3" fill="#0369a1" />
            <text x="56" y="56" fontSize="8" fontWeight="bold" fill="#0369a1">O</text>
            <SvgBadgeText x={85} y={42} text="120°" fill="#0284c7" />
            <SvgBadgeText x={85} y={75} text={`r = ${tabanL}`} fill="#0284c7" />
        </svg>
    ));

    if (mode === 'terazi') {
        const leftExpr = given[0] || (Object.keys(parsedTextData)[0] ? `${Object.keys(parsedTextData)[0]}: ${Object.values(parsedTextData)[0]}` : 'Sol Kefe');
        const rightExpr = given[1] || (Object.keys(parsedTextData)[1] ? `${Object.keys(parsedTextData)[1]}: ${Object.values(parsedTextData)[1]}` : 'Sağ Kefe');
        return wrap('Denklem — İki Kefeli Terazi Dengesi', (
            <svg viewBox="0 0 210 85" className="w-full max-w-[240px] h-auto">
                <polygon points="105,48 92,75 118,75" fill="#475569" />
                <line x1="20" y1="48" x2="190" y2="48" stroke="#334155" strokeWidth="3" />
                <path d="M 20,48 L 10,65 L 60,65 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                <path d="M 190,48 L 160,65 L 210,65 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                <SvgBadgeText x={35} y={60} text={cleanLabel(leftExpr, 'Sol Kefe')} fill="#0369a1" />
                <SvgBadgeText x={185} y={60} text={cleanLabel(rightExpr, 'Sağ Kefe')} fill="#0369a1" />
            </svg>
        ));
    }

    if (mode === 'olasilik') return wrap('Olasılık — Şans Çarkı', (
        <svg viewBox="0 0 110 110" className="w-full max-w-[130px] h-auto">
            <circle cx="55" cy="55" r="44" fill="#f8fafc" stroke="#334155" strokeWidth="2.5" />
            <path d="M 55,55 L 55,11 A 44 44 0 0 1 99,55 Z" fill="#ef4444" />
            <path d="M 55,55 L 99,55 A 44 44 0 0 1 55,99 Z" fill="#3b82f6" />
            <path d="M 55,55 L 55,99 A 44 44 0 0 1 11,55 Z" fill="#10b981" />
            <path d="M 55,55 L 11,55 A 44 44 0 0 1 55,11 Z" fill="#f59e0b" />
            <circle cx="55" cy="55" r="6" fill="#0f172a" />
            <polygon points="55,55 51,18 59,18" fill="#0f172a" />
        </svg>
    ));

    if (mode === 'venn') return wrap('Kümeler — Venn Şeması (A ∩ B)', (
        <svg viewBox="0 0 180 85" className="w-full max-w-[210px] h-auto">
            <circle cx="68" cy="42" r="38" fill="#38bdf8" fillOpacity="0.3" stroke="#0284c7" strokeWidth="2" />
            <circle cx="112" cy="42" r="38" fill="#a7f3d0" fillOpacity="0.3" stroke="#059669" strokeWidth="2" />
            <text x="45" y="46" fontSize="9" fontWeight="extrabold" fill="#0369a1">A</text>
            <text x="90" y="46" fontSize="8" fontWeight="extrabold" fill="#0f172a" textAnchor="middle">A∩B</text>
            <text x="125" y="46" fontSize="9" fontWeight="extrabold" fill="#047857">B</text>
        </svg>
    ));

    if (mode === 'asal-agac') {
        const targetNum = Object.values(parsedTextData)[0] || 36;
        return wrap(`Asal Çarpan Ağacı (${targetNum})`, (
            <svg viewBox="0 0 170 105" className="w-full max-w-[190px] h-auto">
                <circle cx="85" cy="18" r="14" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
                <text x="85" y="22" fontSize="9" fontWeight="bold" fill="#ffffff" textAnchor="middle">{targetNum}</text>
                <line x1="75" y1="28" x2="48" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="95" y1="28" x2="122" y2="50" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="48" cy="58" r="12" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" />
                <text x="48" y="62" fontSize="9" fontWeight="bold" fill="#047857" textAnchor="middle">2</text>
                <circle cx="122" cy="58" r="12" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
                <text x="122" y="62" fontSize="9" fontWeight="bold" fill="#0369a1" textAnchor="middle">{Math.round(targetNum / 2)}</text>
                <line x1="122" y1="70" x2="102" y2="90" stroke="#94a3b8" strokeWidth="1.5" />
                <line x1="122" y1="70" x2="142" y2="90" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="102" cy="96" r="9" fill="#a7f3d0" stroke="#059669" strokeWidth="1.5" />
                <text x="102" y="99" fontSize="8" fontWeight="bold" fill="#047857" textAnchor="middle">2</text>
                <circle cx="142" cy="96" r="9" fill="#fef08a" stroke="#ca8a04" strokeWidth="1.5" />
                <text x="142" y="99" fontSize="8" fontWeight="bold" fill="#854d0e" textAnchor="middle">{Math.round(targetNum / 4)}</text>
            </svg>
        ));
    }

    if (mode === 'yuzde') {
        const yuzdeMatch = text.match(/%\s*(\d+)/) || text.match(/(\d+)\s*%/);
        const val = yuzdeMatch ? Math.min(parseInt(yuzdeMatch[1], 10), 100) : (Object.values(parsedTextData)[0] || 35);
        return wrap(`Yüzde (%) Modeli — %${val}`, (
            <div className="flex flex-col items-center gap-1 w-full max-w-[200px]">
                <div className="grid grid-cols-10 gap-0.5 w-full max-w-[160px]">
                    {Array.from({ length: 100 }).map((_, i) => (
                        <div key={i} className={`aspect-square rounded-px border ${i < val ? 'bg-cyan-500 border-cyan-700' : 'bg-slate-100 border-slate-200'}`} />
                    ))}
                </div>
                <span className="text-[9px] font-extrabold text-cyan-700">%{val} = {val}/100</span>
            </div>
        ));
    }

    if (mode === 'oruntu') return wrap('Şekil Örüntüsü — Adım Adım', (
        <div className="flex items-center justify-around w-full max-w-[220px]">
            {[1, 2, 3].map(step => (
                <div key={step} className="flex flex-col items-center gap-1">
                    <span className="text-[7px] font-bold text-slate-400">{step}. Adım</span>
                    <div className="flex flex-wrap gap-0.5 max-w-[45px] justify-center">
                        {Array.from({ length: step === 1 ? 1 : step === 2 ? 3 : 5 }).map((_, j) => (
                            <div key={j} className="w-3.5 h-3.5 bg-cyan-500 border border-cyan-700 rounded-sm" />
                        ))}
                    </div>
                </div>
            ))}
            <div className="flex flex-col items-center gap-1">
                <span className="text-[7px] font-bold text-slate-400">4. Adım?</span>
                <div className="w-9 h-9 border-2 border-dashed border-amber-400 rounded flex items-center justify-center text-xs font-bold text-amber-600">?</div>
            </div>
        </div>
    ));

    if (mode === 'taban-blok') return wrap('Onluk Taban Blokları', (
        <div className="flex items-center justify-center gap-2 w-full max-w-[200px]">
            <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-2.5 h-11 bg-cyan-400 border border-cyan-700 rounded-sm flex flex-col justify-evenly px-px">
                        {Array.from({ length: 7 }).map((_, j) => <div key={j} className="border-b border-cyan-600" />)}
                    </div>
                ))}
            </div>
            <span className="font-bold text-slate-400">+</span>
            <div className="grid grid-cols-2 gap-0.5">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-3 h-3 bg-amber-400 border border-amber-600 rounded-sm" />)}
            </div>
            <span className="text-[10px] font-extrabold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">= 34</span>
        </div>
    ));

    if (mode === 'kesir-serit') {
        const kesirMatch = text.match(/(\d+)\/(\d+)/) || text.match(/(\d+)\s*bölü\s*(\d+)/i);
        const rawPay = kesirMatch ? parseInt(kesirMatch[1], 10) : 3;
        const rawPayda = kesirMatch ? parseInt(kesirMatch[2], 10) : 5;
        const payda = Math.max(rawPayda, rawPay, 1);
        const pay = Math.min(rawPay, payda);

        return wrap(`Kesir Modeli — ${pay}/${payda}`, (
            <div className="flex border-2 border-cyan-600 rounded-lg overflow-hidden w-full max-w-[180px] h-7">
                {Array.from({ length: payda }).map((_, i) => (
                    <div key={i} className={`flex-1 flex items-center justify-center text-[9px] font-bold border-r border-cyan-400 last:border-r-0 ${i < pay ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {i < pay ? '●' : '○'}
                    </div>
                ))}
            </div>
        ));
    }

    if (mode === 'ondalik') {
        const floatMatch = text.match(/\b\d+[,.]\d+\b/);
        const rawVal = floatMatch ? floatMatch[0].replace(',', '.') : '0.47';
        const num = parseFloat(rawVal) || 0.47;
        const squareCount = Math.min(Math.round(num * 100), 100);

        return wrap(`Ondalık Gösterim — ${rawVal}`, (
            <div className="flex flex-col items-center gap-1 w-full max-w-[190px]">
                <div className="grid grid-cols-10 gap-0.5 border-2 border-blue-400 p-0.5 rounded w-full max-w-[150px]">
                    {Array.from({ length: 100 }).map((_, i) => (
                        <div key={i} className={`aspect-square rounded-px ${i < squareCount ? 'bg-blue-500' : 'bg-slate-100'}`} />
                    ))}
                </div>
                <span className="text-[9px] font-bold text-blue-600">{rawVal}</span>
            </div>
        ));
    }

    if (mode === 'orant') return wrap('Orantı Grafiği — Doğru Orantı (y = k·x)', (
        <svg viewBox="0 0 170 95" className="w-full max-w-[210px] h-auto">
            <line x1="20" y1="8" x2="20" y2="85" stroke="#64748b" strokeWidth="2" />
            <line x1="20" y1="85" x2="160" y2="85" stroke="#64748b" strokeWidth="2" />
            <line x1="20" y1="85" x2="150" y2="15" stroke="#0284c7" strokeWidth="2.5" />
            {[0, 35, 70, 105].map((x, i) => (
                <circle key={i} cx={20 + x * 1.2} cy={85 - x * 0.66} r="3" fill="#0284c7" />
            ))}
            <text x="90" y="93" fontSize="7" fontWeight="bold" fill="#0369a1" textAnchor="middle">Doğru Orantı</text>
        </svg>
    ));

    if (mode === 'sayi-dogru') return wrap('Sayı Doğrusu Modeli', (
        <svg viewBox="0 0 240 45" className="w-full max-w-[250px] h-auto">
            <line x1="12" y1="22" x2="228" y2="22" stroke="#64748b" strokeWidth="2" />
            <polygon points="228,22 221,18 221,26" fill="#64748b" />
            {[-3, -2, -1, 0, 1, 2, 3].map((n, i) => (
                <g key={n}>
                    <line x1={20 + i * 32} y1="17" x2={20 + i * 32} y2="27" stroke="#94a3b8" strokeWidth="1.5" />
                    <text x={20 + i * 32} y="38" fontSize="8" fontWeight="bold" fill={n === 0 ? '#0369a1' : '#475569'} textAnchor="middle">{n}</text>
                </g>
            ))}
        </svg>
    ));

    if (mode === 'abakus-basamak') {
        const numMatch = text.match(/\b\d{3}\b/) || Object.values(parsedTextData)[0]?.toString().match(/\b\d{3}\b/);
        const val = numMatch ? parseInt(numMatch[0], 10) : (Object.values(parsedTextData)[0] || 345);
        const yuzluk = Math.floor(val / 100) % 10 || 3;
        const onluk = Math.floor((val % 100) / 10) || 4;
        const birlik = val % 10 || 5;

        return wrap(`Abaküs & Basamak Değeri (${val})`, (
            <svg viewBox="0 0 170 95" className="w-full max-w-[200px] h-auto">
                <rect x="15" y="70" width="140" height="15" fill="#475569" rx="3" />
                <line x1="45" y1="20" x2="45" y2="70" stroke="#94a3b8" strokeWidth="2.5" />
                <line x1="85" y1="20" x2="85" y2="70" stroke="#94a3b8" strokeWidth="2.5" />
                <line x1="125" y1="20" x2="125" y2="70" stroke="#94a3b8" strokeWidth="2.5" />
                <text x="45" y="81" fontSize="8" fontWeight="extrabold" fill="#ffffff" textAnchor="middle">Yüzlük</text>
                <text x="85" y="81" fontSize="8" fontWeight="extrabold" fill="#ffffff" textAnchor="middle">Onluk</text>
                <text x="125" y="81" fontSize="8" fontWeight="extrabold" fill="#ffffff" textAnchor="middle">Birlik</text>
                {Array.from({ length: yuzluk }).map((_, i) => <circle key={i} cx="45" cy={70 - (i + 1) * 10} r="4.5" fill="#0284c7" />)}
                {Array.from({ length: onluk }).map((_, i) => <circle key={i} cx="85" cy={70 - (i + 1) * 10} r="4.5" fill="#e11d48" />)}
                {Array.from({ length: birlik }).map((_, i) => <circle key={i} cx="125" cy={70 - (i + 1) * 10} r="4.5" fill="#10b981" />)}
                <SvgBadgeText x={85} y={10} text={`Sayı: ${val}`} fill="#0369a1" />
            </svg>
        ));
    }

    if (mode === 'cetvel-olcme') return wrap('Ölçekli Cetvel & Uzunluk Ölçümü', (
        <svg viewBox="0 0 210 65" className="w-full max-w-[240px] h-auto">
            <rect x="10" y="20" width="190" height="35" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" rx="3" />
            {Array.from({ length: 11 }).map((_, i) => (
                <g key={i}>
                    <line x1={15 + i * 18} y1="20" x2={15 + i * 18} y2="34" stroke="#854d0e" strokeWidth="1.5" />
                    <text x={15 + i * 18} y="47" fontSize="7" fontWeight="bold" fill="#854d0e" textAnchor="middle">{i}</text>
                </g>
            ))}
            <rect x="15" y="8" width="108" height="10" fill="#0284c7" rx="2" />
            <SvgBadgeText x={69} y={4} text={`Kalem = ${cleanLabel(given[0], '6 cm')}`} fill="#0284c7" fontSize={7} />
        </svg>
    ));

    if (mode === 'birim-kareli-zemin') return wrap('Birim Kareli Zemin Üzerinde Alan', (
        <svg viewBox="0 0 160 110" className="w-full max-w-[200px] h-auto">
            <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                </pattern>
            </defs>
            <rect width="160" height="110" fill="url(#grid)" />
            <polygon points="20,20 120,20 100,80 40,80" fill="#0284c7" fillOpacity="0.3" stroke="#0284c7" strokeWidth="2.5" />
            <SvgBadgeText x={70} y={50} text="Alan: ? birimkare" fill="#0284c7" />
        </svg>
    ));

    if (mode === 'paralelkenar-yamuk') return wrap('Paralelkenar / Yamuk Yükseklik Şeması', (
        <svg viewBox="0 0 190 95" className="w-full max-w-[220px] h-auto">
            <polygon points="35,75 165,75 135,20 65,20" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
            <line x1="65" y1="20" x2="65" y2="75" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="3,2" />
            <SvgBadgeText x={100} y={85} text={`Taban a = ${tabanL}`} fill="#0369a1" />
            <SvgBadgeText x={100} y={12} text={`Üst Taban b = ${yuksL}`} fill="#0369a1" />
            <SvgBadgeText x={55} y={48} text="h" fill="#e11d48" textAnchor="end" />
        </svg>
    ));

    if (mode === 'iletki-aciolcer') return wrap('İletki / Açıölçer ile Açı Ölçümü', (
        <svg viewBox="0 0 180 100" className="w-full max-w-[210px] h-auto">
            <path d="M 20,80 A 70 70 0 0 1 160,80 Z" fill="#f1f5f9" stroke="#64748b" strokeWidth="2" />
            <line x1="90" y1="80" x2="160" y2="80" stroke="#0f172a" strokeWidth="2" />
            <line x1="90" y1="80" x2="139" y2="31" stroke="#e11d48" strokeWidth="2.5" />
            <circle cx="90" cy="80" r="3" fill="#0f172a" />
            <SvgBadgeText x={115} y={55} text={`Açı = ${aciL}`} fill="#e11d48" bgFill="#fff1f2" />
        </svg>
    ));

    if (mode === 'kesir-pastasi') return wrap('Kesir Modeli (Daire Dilimi Pastası)', (
        <svg viewBox="0 0 120 110" className="w-full max-w-[140px] h-auto">
            <circle cx="60" cy="55" r="42" fill="#e2e8f0" stroke="#475569" strokeWidth="2" />
            <path d="M 60,55 L 60,13 A 42 42 0 0 1 102,55 Z" fill="#0284c7" />
            <path d="M 60,55 L 102,55 A 42 42 0 0 1 60,97 Z" fill="#0284c7" />
            <circle cx="60" cy="55" r="3" fill="#ffffff" />
            <SvgBadgeText x={60} y={55} text="2/4" fill="#0284c7" />
        </svg>
    ));

    if (mode === 'prizma') return wrap('Dikdörtgenler Prizması — 3D Şematik Görünüm', (
        <svg viewBox="0 0 170 100" className="w-full max-w-[210px] h-auto">
            <polygon points="30,75 110,75 110,30 30,30" fill="#e0f2fe" fillOpacity="0.8" stroke="#0284c7" strokeWidth="2" />
            <polygon points="110,30 145,12 145,57 110,75" fill="#bae6fd" fillOpacity="0.8" stroke="#0284c7" strokeWidth="2" />
            <polygon points="30,30 65,12 145,12 110,30" fill="#93c5fd" fillOpacity="0.8" stroke="#0284c7" strokeWidth="2" />
            <line x1="30" y1="75" x2="65" y2="57" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
            <line x1="65" y1="57" x2="145" y2="57" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
            <line x1="65" y1="57" x2="65" y2="12" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,2" />
            <SvgBadgeText x={70} y={85} text={`En: ${tabanL}`} fill="#0369a1" />
            <SvgBadgeText x={152} y={35} text={`Boy: ${yuksL}`} fill="#0369a1" />
            <SvgBadgeText x={20} y={52} text="Yükseklik: h" fill="#0369a1" textAnchor="end" />
        </svg>
    ));

    if (mode === 'para-matrisi') return wrap('Para Matrisi & Alışveriş Hesabı', (
        <div className="flex flex-col items-center gap-1.5 w-full max-w-[210px] bg-amber-50/60 p-2 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between w-full text-[9px] font-bold text-amber-900 px-1">
                <span>💵 Verilen Para: {cleanLabel(given[0], '50 TL')}</span>
                <span>🏷️ Tutar: {cleanLabel(given[1], '32 TL')}</span>
            </div>
            <div className="w-full border-t border-dashed border-amber-300 my-0.5" />
            <div className="flex items-center justify-center gap-1 bg-amber-500 text-white font-extrabold text-[10px] px-3 py-1 rounded-md shadow-xs">
                <span>💰 Para Üstü: {cleanLabel(given[2], '18 TL')}</span>
            </div>
        </div>
    ));

    if (mode === 'tablo') {
        const cols = (tv?.sutunlar as string[]) || ['Ürün', 'Miktar', 'Fiyat'];
        const rows = (tv?.satirData as string[][]) || [
            [cleanLabel(given[0], 'A Ürünü'), '3 kg', '18 TL'],
            [cleanLabel(given[1], 'B Ürünü'), '2 kg', '12 TL'],
        ];
        return wrap('Veri Tablosu', (
            <div className="w-full overflow-x-auto">
                <table className="text-[9px] border-collapse w-full text-center">
                    <thead><tr className="bg-slate-800 text-white">{cols.map((c: string, i: number) => <th key={i} className="p-1 border border-slate-700 font-bold">{c}</th>)}</tr></thead>
                    <tbody>{rows.map((row: string[], ri: number) => (
                        <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            {row.map((cell: string, ci: number) => <td key={ci} className="p-1 border border-slate-200 font-medium text-slate-700">{cell}</td>)}
                        </tr>
                    ))}</tbody>
                </table>
            </div>
        ));
    }

    // ─── GEOMETRİK VARSAYILAN ŞEKİL ────────────────────────
    const hasCember = lw.includes('çember') || lw.includes('daire');
    const hasKare = lw.includes('kare') && !lw.includes('dikdörtgen');
    const hasYamuk = lw.includes('yamuk');

    return wrap('Geometrik Şekil Modeli', (
        <svg viewBox="0 0 180 95" className="w-full max-w-[210px] h-auto">
            {hasCember ? (
                <>
                    <circle cx="90" cy="48" r="38" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
                    <circle cx="90" cy="48" r="3" fill="#0369a1" />
                    <line x1="90" y1="48" x2="128" y2="48" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3,2" />
                    <SvgBadgeText x={109} y={40} text={`r = ${tabanL}`} fill="#0284c7" />
                </>
            ) : hasKare ? (
                <>
                    <rect x="55" y="15" width="70" height="70" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
                    <SvgBadgeText x={90} y={50} text={`a = ${tabanL}`} fill="#0369a1" />
                </>
            ) : hasYamuk ? (
                <>
                    <polygon points="35,75 145,75 120,20 60,20" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
                    <SvgBadgeText x={90} y={83} text={`Alt Taban = ${tabanL}`} fill="#0369a1" />
                    <SvgBadgeText x={90} y={14} text={`Üst Taban = ${yuksL}`} fill="#0369a1" />
                </>
            ) : (
                <>
                    <rect x="25" y="20" width="130" height="55" rx="3" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
                    <SvgBadgeText x={90} y={48} text={`${tabanL} × ${yuksL}`} fill="#0369a1" />
                </>
            )}
        </svg>
    ));
};
