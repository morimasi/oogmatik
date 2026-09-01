import React from 'react';
import type { MatProblem } from '../../types/matProblem';

interface Props { problem: MatProblem; }

export const MatProblemSemaView: React.FC<Props> = ({ problem }) => {
    const text = problem.soruMetni || '';
    const given = problem.verilenler || [];
    const lw = text.toLowerCase();
    const kaz = problem.kazanimKodu || '';
    const sinif = problem.sinif || 5;

    // ─── Akıllı Otomatik Şema Seçimi ─────────────────
    let mode = '';
    const st = (problem.semaTipi || '').toString().toLowerCase();

    if (st.includes('tablo')) mode = 'tablo';
    else if (st.includes('geometrik') || st.includes('sekil')) mode = 'geometrik';
    else if (st.includes('zaman')) mode = 'saat';
    else if (st.includes('kesir')) mode = 'kesir-serit';
    else if (st.includes('oranti') || st.includes('oran')) mode = 'orant';
    else if (st.includes('grafik')) mode = 'ikili-grafik';
    else if (st.includes('pisagor')) mode = 'pisagor';
    else if (st.includes('cebir')) mode = 'cebir-karo';
    else if (st.includes('venn')) mode = 'venn';
    else if (st.includes('asal')) mode = 'asal-agac';
    else if (st.includes('yuzde')) mode = 'yuzde';
    else if (st.includes('oruntu')) mode = 'oruntu';
    else if (st.includes('taban')) mode = 'taban-blok';
    else if (st.includes('dogru') || st.includes('esitsizlik')) mode = 'sayi-dogru';
    else if (lw.includes('daire grafiği') || (lw.includes('grafik') && lw.includes('açı'))) mode = 'ikili-grafik';
    else if (lw.includes('pisagor') || (lw.includes('dik üçgen') && lw.includes('hipotenüs'))) mode = 'pisagor';
    else if (lw.includes('eşitsizlik') || lw.includes('küçüktür') || lw.includes('büyüktür')) mode = 'esitsizlik';
    else if (lw.includes('eğim') || lw.includes('rampa') || lw.includes('koordinat düzlemi')) mode = 'egim';
    else if (lw.includes('silindir') || lw.includes('açınım') || lw.includes('piramit')) mode = 'acinim';
    else if (lw.includes('cebirsel') && (lw.includes('özdeşlik') || lw.includes('(a') || lw.includes('kare'))) mode = 'cebir-karo';
    else if (lw.includes('benzerlik') || lw.includes('eşlik') && lw.includes('üçgen')) mode = 'benzerlik';
    else if (lw.includes('paralel') && (lw.includes('kesen') || lw.includes('iç ters'))) mode = 'paralel-acilar';
    else if (lw.includes('daire dilimi') || lw.includes('yay uzunluğu')) mode = 'daire-dilim';
    else if (lw.includes('terazi') || lw.includes('kefe') || lw.includes('dengede')) mode = 'terazi';
    else if (lw.includes('olasılık') || lw.includes('bilye') || lw.includes('çark')) mode = 'olasilik';
    else if (lw.includes('venn') || lw.includes('küme') || lw.includes('kesişim')) mode = 'venn';
    else if (lw.includes('asal çarpan') || lw.includes('çarpan ağacı') || lw.includes('ebob') || lw.includes('ekok')) mode = 'asal-agac';
    else if (lw.includes('yüzde') || lw.includes('%')) mode = 'yuzde';
    else if (lw.includes('örüntü') || lw.includes('adım')) mode = 'oruntu';
    else if (lw.includes('onluk') && lw.includes('birlik')) mode = 'taban-blok';
    else if (lw.includes('birim kesir') || (lw.includes('kesir') && sinif <= 4)) mode = 'kesir-serit';
    else if (lw.includes('ondalık') || lw.includes('yüzde')) mode = 'ondalik';
    else if (lw.includes('orantı') || lw.includes('doğru orantı') || lw.includes('ters orantı')) mode = 'orant';
    else if (lw.includes('rasyonel') || lw.includes('tam sayı') || lw.includes('mutlak değer')) mode = 'sayi-dogru';
    else if (lw.includes('ışın') || lw.includes('doğru parçası') || lw.includes('ışın çizgisi')) mode = 'dogru-isin';
    else if (lw.includes('prizma') || lw.includes('hacim') || lw.includes('yüzey alanı')) mode = 'prizma';
    else if (lw.includes('tablo') || lw.includes('çetele') || lw.includes('sıklık')) mode = 'tablo';
    else if (lw.includes('dikdörtgen') || lw.includes('kare') || lw.includes('üçgen') || lw.includes('çember') || lw.includes('daire') || lw.includes('yamuk') || lw.includes('paralelkenar')) mode = 'geometrik';
    else if (lw.includes('saat') || lw.includes('zaman')) mode = 'saat';
    else if (sinif === 1) mode = 'nesne-say';
    else if (sinif === 2) mode = 'taban-blok';
    else if (sinif >= 6 && sinif <= 8) mode = 'sayi-dogru';
    else mode = 'geometrik';

    const sv = (problem.semaVerisi || {}) as Record<string, unknown>;
    const tv = (problem as unknown as Record<string, unknown>).tabloVerisi as Record<string, unknown> | undefined;

    // Etiketler
    const etiket = (sv.etiketler || {}) as Record<string, string>;
    const tabanL = etiket.taban || given[0] || '?';
    const yuksL = etiket.yukseklik || given[1] || '?';

    const wrap = (title: string, children: React.ReactNode) => (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 my-2 shadow-sm print:break-inside-avoid">
            <div className="text-[9px] font-extrabold text-blue-700 uppercase tracking-wider mb-2">📐 {title}</div>
            <div className="flex flex-wrap items-center justify-center gap-3 bg-white p-3 rounded-lg border border-blue-100">
                {children}
            </div>
        </div>
    );

    // ── RENDER ────────────────────────────────────────

    if (mode === 'ikili-grafik') return wrap('Veri Analizi — Sütun & Daire Grafiği', (
        <div className="grid grid-cols-2 gap-4 w-full">
            <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-slate-600 mb-1">Grafik 1: Satış Miktarları</span>
                <svg width="130" height="90" viewBox="0 0 130 90">
                    <line x1="20" y1="8" x2="20" y2="76" stroke="#94a3b8" strokeWidth="1.5" />
                    <line x1="20" y1="76" x2="120" y2="76" stroke="#94a3b8" strokeWidth="1.5" />
                    <rect x="30" y="30" width="18" height="46" fill="#0284c7" rx="2" /><text x="39" y="26" fontSize="7" fontWeight="bold" fill="#0369a1" textAnchor="middle">{given[0]?.split(':')[1]?.trim() || '120'}</text>
                    <rect x="58" y="20" width="18" height="56" fill="#0d9488" rx="2" /><text x="67" y="16" fontSize="7" fontWeight="bold" fill="#0f766e" textAnchor="middle">{given[1]?.split(':')[1]?.trim() || '150'}</text>
                    <rect x="86" y="45" width="18" height="31" fill="#f59e0b" rx="2" /><text x="95" y="41" fontSize="7" fontWeight="bold" fill="#b45309" textAnchor="middle">{given[2]?.split(':')[1]?.trim() || '80'}</text>
                    <text x="39" y="84" fontSize="6" fill="#475569" textAnchor="middle">A</text>
                    <text x="67" y="84" fontSize="6" fill="#475569" textAnchor="middle">B</text>
                    <text x="95" y="84" fontSize="6" fill="#475569" textAnchor="middle">C</text>
                </svg>
            </div>
            <div className="flex flex-col items-center">
                <span className="text-[8px] font-bold text-slate-600 mb-1">Grafik 2: Daire Grafiği (%)</span>
                <svg width="100" height="90" viewBox="0 0 100 90">
                    <path d="M 50,45 L 50,5 A 40 40 0 0 1 84.6,65 Z" fill="#0284c7" />
                    <path d="M 50,45 L 84.6,65 A 40 40 0 0 1 15.4,65 Z" fill="#0d9488" />
                    <path d="M 50,45 L 15.4,65 A 40 40 0 0 1 50,5 Z" fill="#f59e0b" />
                    <text x="64" y="35" fontSize="7" fontWeight="bold" fill="#fff" textAnchor="middle">120°</text>
                    <text x="50" y="70" fontSize="7" fontWeight="bold" fill="#fff" textAnchor="middle">150°</text>
                    <text x="32" y="48" fontSize="7" fontWeight="bold" fill="#fff" textAnchor="middle">90°</text>
                </svg>
            </div>
        </div>
    ));

    if (mode === 'pisagor') return wrap(`Pisagor Bağıntısı: a² + b² = c²`, (
        <svg width="200" height="110" viewBox="0 0 200 110">
            <polygon points="20,95 160,95 160,20" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
            <path d="M 148,95 L 148,83 L 160,83" fill="none" stroke="#0369a1" strokeWidth="2" />
            <circle cx="153" cy="89" r="2.5" fill="#0369a1" />
            <text x="90" y="108" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">a = {tabanL}</text>
            <text x="170" y="60" fontSize="9" fontWeight="bold" fill="#0f172a">b = {yuksL}</text>
            <text x="80" y="50" fontSize="8" fontWeight="bold" fill="#0284c7" textAnchor="end">c = ? (Hipotenüs)</text>
            <text x="10" y="95" fontSize="9" fontWeight="bold" fill="#0369a1">A</text>
            <text x="165" y="95" fontSize="9" fontWeight="bold" fill="#0369a1">B</text>
            <text x="165" y="18" fontSize="9" fontWeight="bold" fill="#0369a1">C</text>
        </svg>
    ));

    if (mode === 'esitsizlik') return wrap('Eşitsizlik Çözüm Kümesi (Sayı Doğrusu)', (
        <svg width="280" height="50" viewBox="0 0 280 50">
            <line x1="15" y1="25" x2="265" y2="25" stroke="#94a3b8" strokeWidth="2" />
            <polygon points="265,25 259,21 259,29" fill="#94a3b8" />
            {[-2, -1, 0, 1, 2, 3, 4, 5, 6].map((n, i) => (
                <g key={n}>
                    <line x1={25 + i * 27} y1="20" x2={25 + i * 27} y2="30" stroke="#94a3b8" strokeWidth="1.5" />
                    <text x={25 + i * 27} y="42" fontSize="8" fontWeight="bold" fill="#475569" textAnchor="middle">{n}</text>
                </g>
            ))}
            <line x1="106" y1="25" x2="250" y2="25" stroke="#e11d48" strokeWidth="4" />
            <circle cx="106" cy="25" r="5.5" fill="#e11d48" stroke="#fff" strokeWidth="1.5" />
            <text x="106" y="14" fontSize="7" fontWeight="bold" fill="#e11d48" textAnchor="middle">x ≥ 3</text>
        </svg>
    ));

    if (mode === 'egim') return wrap('Eğim & Koordinat Düzlemi: m = Dikey / Yatay', (
        <svg width="210" height="120" viewBox="0 0 210 120">
            <line x1="20" y1="8" x2="20" y2="108" stroke="#64748b" strokeWidth="2" /><polygon points="20,4 16,11 24,11" fill="#64748b" />
            <line x1="20" y1="108" x2="195" y2="108" stroke="#64748b" strokeWidth="2" /><polygon points="199,108 192,104 192,112" fill="#64748b" />
            <text x="12" y="14" fontSize="9" fontWeight="bold" fill="#475569">y</text>
            <text x="198" y="116" fontSize="9" fontWeight="bold" fill="#475569">x</text>
            {[1, 2, 3, 4].map(i => <line key={i} x1={20 + i * 40} y1="104" x2={20 + i * 40} y2="112" stroke="#94a3b8" strokeWidth="1.5" />)}
            {[1, 2, 3].map(i => <line key={i} x1="15" y1={108 - i * 30} x2="25" y2={108 - i * 30} stroke="#94a3b8" strokeWidth="1.5" />)}
            <line x1="20" y1="108" x2="160" y2="18" stroke="#0284c7" strokeWidth="2.5" />
            <line x1="160" y1="18" x2="160" y2="108" stroke="#e11d48" strokeWidth="2" strokeDasharray="4,3" />
            <path d="M 148,108 L 148,96 L 160,96" fill="none" stroke="#e11d48" strokeWidth="1.5" />
            <text x="90" y="118" fontSize="8" fontWeight="bold" fill="#0369a1" textAnchor="middle">Yatay: {tabanL}</text>
            <text x="168" y="65" fontSize="8" fontWeight="bold" fill="#e11d48">Dikey: {yuksL}</text>
            <text x="75" y="55" fontSize="8" fontWeight="bold" fill="#0284c7" textAnchor="end">m = ?</text>
        </svg>
    ));

    if (mode === 'acinim') {
        const isSil = lw.includes('silindir');
        return wrap(isSil ? 'Silindir Açınımı' : 'Kare Dik Piramit Açınımı', (
            isSil ? (
                <svg width="220" height="130" viewBox="0 0 220 130">
                    <circle cx="110" cy="22" r="18" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                    <text x="110" y="26" fontSize="8" fontWeight="bold" fill="#0369a1" textAnchor="middle">r</text>
                    <rect x="35" y="42" width="150" height="46" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2" />
                    <text x="110" y="68" fontSize="8" fontWeight="bold" fill="#0369a1" textAnchor="middle">2·π·r × h</text>
                    <circle cx="110" cy="106" r="18" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                </svg>
            ) : (
                <svg width="160" height="150" viewBox="0 0 160 150">
                    <rect x="50" y="45" width="60" height="60" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                    <polygon points="50,45 110,45 80,5" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
                    <polygon points="110,45 110,105 150,75" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
                    <polygon points="50,105 110,105 80,145" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
                    <polygon points="50,45 50,105 10,75" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
                    <text x="80" y="78" fontSize="8" fontWeight="bold" fill="#0369a1" textAnchor="middle">a²</text>
                </svg>
            )
        ));
    }

    if (mode === 'cebir-karo') return wrap('Cebirsel Karo Alan Modeli: (a + b)² = a² + 2ab + b²', (
        <svg width="160" height="160" viewBox="0 0 160 160">
            <rect x="12" y="12" width="88" height="88" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
            <text x="56" y="62" fontSize="11" fontWeight="bold" fill="#ffffff" textAnchor="middle">a²</text>
            <rect x="100" y="12" width="42" height="88" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
            <text x="121" y="62" fontSize="9" fontWeight="bold" fill="#047857" textAnchor="middle">a·b</text>
            <rect x="12" y="100" width="88" height="42" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
            <text x="56" y="126" fontSize="9" fontWeight="bold" fill="#047857" textAnchor="middle">a·b</text>
            <rect x="100" y="100" width="42" height="42" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
            <text x="121" y="126" fontSize="9" fontWeight="bold" fill="#854d0e" textAnchor="middle">b²</text>
            <text x="56" y="8" fontSize="8" fontWeight="bold" fill="#0369a1" textAnchor="middle">a</text>
            <text x="121" y="8" fontSize="8" fontWeight="bold" fill="#047857" textAnchor="middle">b</text>
        </svg>
    ));

    if (mode === 'benzerlik') return wrap('Üçgen Benzerliği (ABC ~ DEF)', (
        <>
            <svg width="110" height="90" viewBox="0 0 110 90">
                <polygon points="10,80 100,80 55,10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
                <text x="55" y="92" fontSize="8" fontWeight="bold" fill="#0f172a" textAnchor="middle">{tabanL}</text>
                <text x="22" y="45" fontSize="8" fontWeight="bold" fill="#0f172a">{given[0]?.split(':')[1] || '?'}</text>
                <text x="55" y="45" fontSize="8" fontWeight="extrabold" fill="#0369a1" textAnchor="middle">△ ABC</text>
            </svg>
            <span className="text-2xl font-black text-blue-600">~</span>
            <svg width="70" height="60" viewBox="0 0 70 60">
                <polygon points="8,50 62,50 35,10" fill="#dcfce7" stroke="#166534" strokeWidth="2" />
                <text x="35" y="58" fontSize="7" fontWeight="bold" fill="#0f172a" textAnchor="middle">{yuksL}</text>
                <text x="35" y="35" fontSize="8" fontWeight="extrabold" fill="#15803d" textAnchor="middle">△ DEF</text>
            </svg>
        </>
    ));

    if (mode === 'paralel-acilar') return wrap('Paralel Doğrular ve Kesen (d₁ // d₂)', (
        <svg width="230" height="110" viewBox="0 0 230 110">
            <line x1="15" y1="28" x2="210" y2="28" stroke="#0284c7" strokeWidth="2.5" />
            <line x1="15" y1="78" x2="210" y2="78" stroke="#0284c7" strokeWidth="2.5" />
            <line x1="45" y1="100" x2="175" y2="8" stroke="#e11d48" strokeWidth="2" />
            <text x="215" y="32" fontSize="8" fontWeight="bold" fill="#0284c7">d₁</text>
            <text x="215" y="82" fontSize="8" fontWeight="bold" fill="#0284c7">d₂</text>
            <text x="125" y="22" fontSize="8" fontWeight="bold" fill="#e11d48">α (Yöndeş)</text>
            <text x="68" y="73" fontSize="8" fontWeight="bold" fill="#e11d48">β (İç Ters)</text>
        </svg>
    ));

    if (mode === 'daire-dilim') return wrap('Daire Dilimi — Merkez Açı & Yay Uzunluğu', (
        <svg width="140" height="130" viewBox="0 0 140 130">
            <circle cx="70" cy="65" r="48" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <path d="M 70,65 L 70,17 A 48 48 0 0 1 115.6,89 Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
            <circle cx="70" cy="65" r="3.5" fill="#0369a1" />
            <text x="62" y="59" fontSize="8" fontWeight="bold" fill="#0369a1">O</text>
            <line x1="70" y1="65" x2="70" y2="17" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3,2" />
            <line x1="70" y1="65" x2="115.6" y2="89" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3,2" />
            <text x="92" y="48" fontSize="8" fontWeight="bold" fill="#0284c7">α = 120°</text>
            <text x="92" y="82" fontSize="8" fontWeight="bold" fill="#0284c7">r = {tabanL}</text>
        </svg>
    ));

    if (mode === 'terazi') return wrap('Denklem — İki Kefeli Terazi Dengesi', (
        <svg width="240" height="95" viewBox="0 0 240 95">
            <polygon points="120,55 105,85 135,85" fill="#475569" />
            <line x1="28" y1="55" x2="212" y2="55" stroke="#334155" strokeWidth="3" />
            <path d="M 28,55 L 13,75 L 73,75 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
            <path d="M 212,55 L 177,75 L 237,75 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
            <text x="43" y="70" fontSize="9" fontWeight="bold" fill="#0369a1" textAnchor="middle">{given[0] || '2x + 5'}</text>
            <text x="207" y="70" fontSize="9" fontWeight="bold" fill="#0369a1" textAnchor="middle">{given[1] || '25 kg'}</text>
        </svg>
    ));

    if (mode === 'olasilik') return wrap('Olasılık — Şans Çarkı', (
        <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r="52" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
            <path d="M 65,65 L 65,13 A 52 52 0 0 1 117,65 Z" fill="#ef4444" />
            <path d="M 65,65 L 117,65 A 52 52 0 0 1 65,117 Z" fill="#3b82f6" />
            <path d="M 65,65 L 65,117 A 52 52 0 0 1 13,65 Z" fill="#10b981" />
            <path d="M 65,65 L 13,65 A 52 52 0 0 1 65,13 Z" fill="#f59e0b" />
            <circle cx="65" cy="65" r="7" fill="#0f172a" />
            <polygon points="65,65 61,20 69,20" fill="#0f172a" />
        </svg>
    ));

    if (mode === 'venn') return wrap('Kümeler — Venn Şeması (A ∩ B)', (
        <svg width="210" height="100" viewBox="0 0 210 100">
            <circle cx="78" cy="50" r="44" fill="#38bdf8" fillOpacity="0.35" stroke="#0284c7" strokeWidth="2" />
            <circle cx="132" cy="50" r="44" fill="#a7f3d0" fillOpacity="0.35" stroke="#059669" strokeWidth="2" />
            <text x="52" y="54" fontSize="9" fontWeight="bold" fill="#0369a1">A</text>
            <text x="105" y="54" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">A∩B</text>
            <text x="148" y="54" fontSize="9" fontWeight="bold" fill="#047857">B</text>
        </svg>
    ));

    if (mode === 'asal-agac') return wrap('Asal Çarpan Ağacı', (
        <svg width="200" height="120" viewBox="0 0 200 120">
            <circle cx="100" cy="20" r="16" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" />
            <text x="100" y="25" fontSize="11" fontWeight="bold" fill="#fff" textAnchor="middle">{given[0]?.match(/\d+/)?.[0] || '36'}</text>
            <line x1="88" y1="33" x2="58" y2="58" stroke="#94a3b8" strokeWidth="2" />
            <line x1="112" y1="33" x2="142" y2="58" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="58" cy="68" r="14" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
            <text x="58" y="73" fontSize="10" fontWeight="bold" fill="#047857" textAnchor="middle">2</text>
            <circle cx="142" cy="68" r="14" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
            <text x="142" y="73" fontSize="10" fontWeight="bold" fill="#0369a1" textAnchor="middle">18</text>
            <line x1="142" y1="82" x2="118" y2="104" stroke="#94a3b8" strokeWidth="2" />
            <line x1="142" y1="82" x2="162" y2="104" stroke="#94a3b8" strokeWidth="2" />
            <circle cx="118" cy="112" r="11" fill="#a7f3d0" stroke="#059669" strokeWidth="2" />
            <text x="118" y="116" fontSize="9" fontWeight="bold" fill="#047857" textAnchor="middle">2</text>
            <circle cx="162" cy="112" r="11" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
            <text x="162" y="116" fontSize="9" fontWeight="bold" fill="#854d0e" textAnchor="middle">9</text>
        </svg>
    ));

    if (mode === 'yuzde') return wrap('Yüzde (%) Modeli', (
        <div className="flex flex-col items-center gap-2">
            <div className="grid grid-cols-10 gap-0.5 w-48">
                {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className={`w-4 h-4 rounded-sm border ${i < 35 ? 'bg-cyan-400 border-cyan-600' : 'bg-slate-100 border-slate-300'}`} />
                ))}
            </div>
            <span className="text-xs font-extrabold text-cyan-700">%35 = 35/100</span>
        </div>
    ));

    if (mode === 'oruntu') return wrap('Şekil Örüntüsü — Adım Adım', (
        <>
            {[1, 2, 3].map(step => (
                <div key={step} className="flex flex-col items-center gap-1">
                    <span className="text-[8px] font-bold text-slate-500">{step}. Adım</span>
                    <div className="flex flex-wrap gap-0.5 max-w-[60px]">
                        {Array.from({ length: step === 1 ? 1 : step === 2 ? 3 : 6 }).map((_, j) => (
                            <div key={j} className="w-5 h-5 bg-cyan-500 border border-cyan-700 rounded-sm" />
                        ))}
                    </div>
                </div>
            ))}
            <div className="flex flex-col items-center gap-1">
                <span className="text-[8px] font-bold text-slate-500">4. Adım?</span>
                <div className="w-14 h-12 border-2 border-dashed border-amber-400 rounded flex items-center justify-center text-xs font-bold text-amber-600">?</div>
            </div>
        </>
    ));

    if (mode === 'taban-blok') return wrap('Onluk Taban Blokları', (
        <>
            <div className="flex gap-1.5">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-3 h-14 bg-cyan-400 border border-cyan-700 rounded-sm flex flex-col justify-evenly px-px">
                        {Array.from({ length: 8 }).map((_, j) => <div key={j} className="border-b border-cyan-600" />)}
                    </div>
                ))}
            </div>
            <span className="font-bold text-slate-400">+</span>
            <div className="grid grid-cols-2 gap-0.5">
                {[1, 2, 3, 4].map(i => <div key={i} className="w-4 h-4 bg-amber-400 border border-amber-600 rounded-sm" />)}
            </div>
            <span className="text-xs font-extrabold text-cyan-800 bg-cyan-50 px-2 py-1 rounded border">= {given[0]?.match(/\d+/)?.[0] || '34'}</span>
        </>
    ));

    if (mode === 'kesir-serit') {
        const pay = Number(sv.kesirOrani?.toString()?.split('/')[0]) || 3;
        const payda = Number(sv.kesirOrani?.toString()?.split('/')[1]) || 5;
        return wrap(`Kesir Modeli — ${pay}/${payda}`, (
            <div className="flex border-2 border-cyan-600 rounded-lg overflow-hidden w-48 h-8">
                {Array.from({ length: payda }).map((_, i) => (
                    <div key={i} className={`flex-1 flex items-center justify-center text-[8px] font-bold border-r border-cyan-400 last:border-r-0 ${i < pay ? 'bg-cyan-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {i < pay ? '●' : '○'}
                    </div>
                ))}
            </div>
        ));
    }

    if (mode === 'ondalik') return wrap('Ondalık Gösterim — 100\'lük Izgara', (
        <div className="flex flex-col items-center gap-1">
            <div className="grid grid-cols-10 gap-px border-2 border-blue-400 p-0.5 rounded">
                {Array.from({ length: 100 }).map((_, i) => (
                    <div key={i} className={`w-3.5 h-3.5 rounded-sm ${i < 47 ? 'bg-blue-400' : 'bg-slate-100'}`} />
                ))}
            </div>
            <div className="flex gap-4 text-[9px] font-bold">
                <span className="text-blue-600">0.47 = 47/100</span>
                <span className="text-slate-400">0.53 kalan</span>
            </div>
        </div>
    ));

    if (mode === 'orant') return wrap('Orantı Grafiği — Doğru Orantılı İlişki', (
        <svg width="180" height="110" viewBox="0 0 180 110">
            <line x1="20" y1="8" x2="20" y2="102" stroke="#64748b" strokeWidth="2" />
            <line x1="20" y1="102" x2="170" y2="102" stroke="#64748b" strokeWidth="2" />
            {[1, 2, 3, 4].map(i => <line key={i} x1={20 + i * 35} y1="97" x2={20 + i * 35} y2="107" stroke="#94a3b8" strokeWidth="1.5" />)}
            {[1, 2, 3].map(i => <line key={i} x1="15" y1={102 - i * 28} x2="25" y2={102 - i * 28} stroke="#94a3b8" strokeWidth="1.5" />)}
            <line x1="20" y1="102" x2="160" y2="18" stroke="#0284c7" strokeWidth="2.5" />
            {[[0, 102], [35, 74], [70, 46], [105, 18]].map(([x, y], i) => <circle key={i} cx={20 + x / 3.5 * 35 / 30} cy={y} r="4" fill="#0284c7" />)}
            <circle cx="20" cy="102" r="4" fill="#0284c7" />
            <circle cx="55" cy="74" r="4" fill="#0284c7" />
            <circle cx="90" cy="46" r="4" fill="#0284c7" />
            <circle cx="125" cy="18" r="4" fill="#0284c7" />
            <text x="100" y="118" fontSize="8" fontWeight="bold" fill="#0369a1" textAnchor="middle">Doğru Orantı: y = k·x</text>
        </svg>
    ));

    if (mode === 'sayi-dogru') {
        const hasMutlak = lw.includes('mutlak değer');
        return wrap(hasMutlak ? 'Sayı Doğrusu & Mutlak Değer' : 'Tam Sayı / Rasyonel Sayı Doğrusu', (
            <svg width="280" height="55" viewBox="0 0 280 55">
                <line x1="15" y1="28" x2="265" y2="28" stroke="#94a3b8" strokeWidth="2" />
                <polygon points="265,28 259,24 259,32" fill="#94a3b8" />
                {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((n, i) => (
                    <g key={n}>
                        <line x1={25 + i * 27} y1="23" x2={25 + i * 27} y2="33" stroke="#94a3b8" strokeWidth="1.5" />
                        <text x={25 + i * 27} y="44" fontSize="8" fontWeight="bold" fill={n === 0 ? '#0369a1' : '#475569'} textAnchor="middle">{n}</text>
                        {hasMutlak && n === -3 && <circle cx={25 + i * 27} cy="28" r="5" fill="none" stroke="#e11d48" strokeWidth="2" />}
                        {hasMutlak && n === 3 && <circle cx={25 + i * 27} cy="28" r="5" fill="none" stroke="#e11d48" strokeWidth="2" />}
                    </g>
                ))}
                {hasMutlak && <path d="M 52,20 Q 78,8 104,20" fill="none" stroke="#e11d48" strokeWidth="2" strokeDasharray="3,2" />}
                {hasMutlak && <text x="78" y="8" fontSize="7" fontWeight="bold" fill="#e11d48" textAnchor="middle">|-3| = 3</text>}
            </svg>
        ));
    }

    if (mode === 'dogru-isin') return wrap('Doğru, Işın ve Doğru Parçası', (
        <svg width="220" height="85" viewBox="0 0 220 85">
            <line x1="10" y1="20" x2="210" y2="20" stroke="#0284c7" strokeWidth="2" />
            <text x="110" y="14" fontSize="8" fontWeight="bold" fill="#0369a1" textAnchor="middle">Doğru (AB)</text>
            <polygon points="210,20 204,16 204,24" fill="#0284c7" />
            <polygon points="10,20 16,16 16,24" fill="#0284c7" />
            <line x1="40" y1="45" x2="210" y2="45" stroke="#059669" strokeWidth="2" />
            <text x="125" y="39" fontSize="8" fontWeight="bold" fill="#047857" textAnchor="middle">Işın (BA→)</text>
            <polygon points="210,45 204,41 204,49" fill="#059669" />
            <circle cx="40" cy="45" r="3.5" fill="#059669" />
            <line x1="40" y1="70" x2="180" y2="70" stroke="#f59e0b" strokeWidth="2.5" />
            <text x="110" y="64" fontSize="8" fontWeight="bold" fill="#b45309" textAnchor="middle">Doğru Parçası [AB]</text>
            <circle cx="40" cy="70" r="3.5" fill="#f59e0b" />
            <circle cx="180" cy="70" r="3.5" fill="#f59e0b" />
        </svg>
    ));

    if (mode === 'prizma') return wrap('Dikdörtgenler Prizması — Yüzey Alanı & Hacim', (
        <svg width="180" height="120" viewBox="0 0 180 120">
            <polygon points="35,80 115,80 115,25 35,25" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
            <polygon points="115,25 155,5 155,60 115,80" fill="#bae6fd" stroke="#0284c7" strokeWidth="2" />
            <polygon points="35,25 75,5 155,5 115,25" fill="#93c5fd" stroke="#0284c7" strokeWidth="2" />
            <text x="75" y="58" fontSize="8" fontWeight="bold" fill="#0369a1" textAnchor="middle">a = {tabanL}</text>
            <text x="130" y="42" fontSize="8" fontWeight="bold" fill="#0369a1" textAnchor="middle">b = {yuksL}</text>
            <text x="20" y="55" fontSize="8" fontWeight="bold" fill="#0369a1">c = ?</text>
        </svg>
    ));

    if (mode === 'tablo') {
        const cols = (tv?.sutunlar as string[]) || ['Ürün', 'Miktar', 'Fiyat', 'Toplam'];
        const rows = (tv?.satirData as string[][]) || [
            [given[0] || 'A Ürünü', '5', '20 TL', '100 TL'],
            [given[1] || 'B Ürünü', '3', '35 TL', '105 TL'],
            ['Toplam', '_', '_', '?'],
        ];
        return wrap('Veri Tablosu', (
            <table className="text-[9px] border-collapse w-full">
                <thead><tr className="bg-cyan-700 text-white">{cols.map((c: string, i: number) => <th key={i} className="p-1.5 border border-cyan-800">{c}</th>)}</tr></thead>
                <tbody>{rows.map((row: string[], ri: number) => (
                    <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        {row.map((cell: string, ci: number) => <td key={ci} className="p-1.5 border border-slate-100 font-medium">{cell}</td>)}
                    </tr>
                ))}</tbody>
            </table>
        ));
    }

    if (mode === 'geometrik') {
        const hasKare = lw.includes('kare') && !lw.includes('dikdörtgen');
        const hasCember = lw.includes('çember') || lw.includes('daire');
        const hasYamuk = lw.includes('yamuk');
        const hasUcgen = lw.includes('üçgen');
        return wrap('Geometrik Şekil Modeli', (
            <svg width="200" height="110" viewBox="0 0 200 110">
                {hasCember && <>
                    <circle cx="100" cy="55" r="45" fill="#f0f9ff" stroke="#0284c7" strokeWidth="2.5" />
                    <circle cx="100" cy="55" r="3" fill="#0369a1" />
                    <line x1="100" y1="55" x2="145" y2="55" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="3,2" />
                    <text x="122" y="51" fontSize="9" fontWeight="bold" fill="#0284c7">r = {tabanL}</text>
                </>}
                {hasKare && <>
                    <rect x="40" y="15" width="80" height="80" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                    <text x="80" y="60" fontSize="10" fontWeight="bold" fill="#0369a1" textAnchor="middle">{tabanL}</text>
                    <line x1="48" y1="15" x2="48" y2="23" stroke="#0369a1" strokeWidth="2" />
                    <line x1="40" y1="23" x2="48" y2="23" stroke="#0369a1" strokeWidth="2" />
                </>}
                {hasYamuk && <>
                    <polygon points="40,80 160,80 130,20 70,20" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                    <text x="100" y="58" fontSize="9" fontWeight="bold" fill="#0369a1" textAnchor="middle">h = {yuksL}</text>
                    <text x="100" y="95" fontSize="9" fontWeight="bold" fill="#0369a1" textAnchor="middle">a = {tabanL}</text>
                </>}
                {hasUcgen && !hasCember && !hasKare && !hasYamuk && <>
                    <polygon points="20,95 180,95 100,10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                    <text x="100" y="108" fontSize="9" fontWeight="bold" fill="#0f172a" textAnchor="middle">{tabanL}</text>
                    <text x="46" y="56" fontSize="9" fontWeight="bold" fill="#0f172a">?</text>
                    <text x="155" y="56" fontSize="9" fontWeight="bold" fill="#0f172a">?</text>
                    <text x="100" y="55" fontSize="9" fontWeight="bold" fill="#0284c7" textAnchor="middle">h = {yuksL}</text>
                </>}
                {!hasCember && !hasKare && !hasYamuk && !hasUcgen && <>
                    <rect x="20" y="20" width="160" height="70" rx="3" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" />
                    <text x="100" y="60" fontSize="9" fontWeight="bold" fill="#0369a1" textAnchor="middle">{tabanL} × {yuksL}</text>
                </>}
            </svg>
        ));
    }

    if (mode === 'saat') return wrap('Zaman Modeli — Analog Saat', (
        <svg width="110" height="110" viewBox="0 0 110 110">
            <circle cx="55" cy="55" r="48" fill="#f8fafc" stroke="#334155" strokeWidth="3" />
            {[...Array(12)].map((_, i) => {
                const a = (i * 30 - 90) * Math.PI / 180;
                return <line key={i} x1={55 + 40 * Math.cos(a)} y1={55 + 40 * Math.sin(a)} x2={55 + 46 * Math.cos(a)} y2={55 + 46 * Math.sin(a)} stroke="#334155" strokeWidth={i % 3 === 0 ? 3 : 1.5} />;
            })}
            <line x1="55" y1="55" x2="55" y2="22" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
            <line x1="55" y1="55" x2="80" y2="55" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
            <circle cx="55" cy="55" r="4" fill="#0f172a" />
        </svg>
    ));

    if (mode === 'nesne-say') return wrap('Nesne Sayma Modeli', (
        <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: Number(given[0]?.match(/\d+/)?.[0]) || 7 }).map((_, i) => (
                <span key={i} className="text-2xl text-center">🍎</span>
            ))}
        </div>
    ));

    // --- GENİŞ KAPSAMLI VARSAYILAN KUTU MODELİ ---
    return wrap('Problem Çözüm Modeli', (
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-bold">
            {given.slice(0, 2).map((g, i) => (
                <div key={i} className="bg-cyan-50 text-cyan-800 border border-cyan-200 px-3 py-2 rounded-lg max-w-[120px] text-center">{g}</div>
            ))}
            {given.length > 0 && <span className="text-slate-400 font-black">→</span>}
            <div className="bg-amber-50 text-amber-800 border-2 border-dashed border-amber-400 px-4 py-2 rounded-lg">{problem.istenenler || '?'}</div>
        </div>
    ));
};
