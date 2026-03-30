/**
 * MatSinavStudyosu — Ana Stüdyo Shell
 * Süper Matematik Sınav Stüdyosu ana bileşeni
 * Tamamen bağımsız modül — mevcut SinavStudyosu'na dokunmaz
 */

import React, { useState } from 'react';
import { useMatSinavStore } from '../../src/store/useMatSinavStore';
import { generateMatExam, refreshSingleQuestion } from '../../src/services/matSinavService';
import { MatKazanimPicker } from './MatKazanimPicker';
import { MatSoruAyarlari } from './MatSoruAyarlari';
import { MatSinavOnizleme } from './MatSinavOnizleme';
import { MatCevapAnahtariComponent } from './MatCevapAnahtari';
import { AppError } from '../../src/utils/AppError';
import type { MatSoru } from '../../src/types/matSinav';
import { renderToString } from 'react-dom/server';
import { GraphicRenderer } from './components/GraphicRenderer';
import { PrintConfig, DEFAULT_PRINT_CONFIG } from '../../src/utils/sinavPdfGenerator';

type TabType = 'onizleme' | 'cevap-anahtari' | 'gecmis';

// ─── Alt bileşenler ──────────────────────────────────────────
const FmtBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; icon?: string; title?: string; }> = ({ active, onClick, children, icon, title }) => (
    <button onClick={onClick} title={title} className={`px-2 py-1.5 rounded-md text-[10px] font-semibold border flex items-center justify-center gap-1 transition-colors ${active ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'}`}>
        {icon && <span className="opacity-90">{icon}</span>}
        {children}
    </button>
);

const SectionHeader: React.FC<{
    icon: string;
    title: string;
    badge?: string;
    isOpen: boolean;
    onToggle: () => void;
    gradient?: string;
}> = ({ icon, title, badge, isOpen, onToggle }) => (
    <button onClick={onToggle} className="w-full flex items-center justify-between px-3 py-2.5 bg-white/40 hover:bg-white/60 transition-colors">
        <div className="flex items-center gap-2">
            <span className="text-sm">{icon}</span>
            <span className="text-xs font-semibold text-slate-700 leading-none">{title}</span>
            {badge && <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-600 leading-none">{badge}</span>}
        </div>
        <span className={`text-slate-400 text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
    </button>
);

export const MatSinavStudyosu: React.FC = () => {
    const {
        ayarlar,
        setSinif,
        setSecilenUniteler,
        setSecilenKazanimlar,
        setSoruDagilimi,
        setAyarlar,
        aktifSinav,
        setAktifSinav,
        isGenerating,
        setIsGenerating,
        addSinavGecmisi,
        sinavGecmisi,
        removeSinavGecmisi,
    } = useMatSinavStore();

    const [activeTab, setActiveTab] = useState<TabType>('onizleme');
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [refreshingIndex, setRefreshingIndex] = useState<number | null>(null);
    const [printConfig, setPrintConfig] = useState<PrintConfig>(DEFAULT_PRINT_CONFIG);

    const updateConfig = <K extends keyof PrintConfig>(key: K, val: PrintConfig[K]) => setPrintConfig(c => ({ ...c, [key]: val }));

    // Accordion state
    const [openSections, setOpenSections] = useState({
        sinif: true,
        kazanim: true,
        ayarlar: true,
    });
    const toggleSection = (key: keyof typeof openSections) =>
        setOpenSections((p) => ({ ...p, [key]: !p[key] }));

    const toplamSoru =
        ayarlar.soruDagilimi.coktan_secmeli +
        ayarlar.soruDagilimi.dogru_yanlis +
        ayarlar.soruDagilimi.bosluk_doldurma +
        ayarlar.soruDagilimi.acik_uclu;
    const kazanimCount = ayarlar.secilenKazanimlar.length;

    const canGenerate = () =>
        ayarlar.sinif !== null && kazanimCount > 0 && toplamSoru >= 1;

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // ─── Sınav Oluştur ───────────────────────────────────────────
    const handleGenerate = async () => {
        setError(null);
        setSuccessMessage(null);
        try {
            setIsGenerating(true);
            const sinav = await generateMatExam(ayarlar);
            setAktifSinav(sinav);
            addSinavGecmisi(sinav);
            setActiveTab('onizleme');
            showSuccess('Sınav başarıyla oluşturuldu!');
        } catch (err: unknown) {
            if (err instanceof AppError) setError(err.userMessage);
            else setError('Sınav oluşturulurken beklenmeyen bir hata oluştu.');
        } finally {
            setIsGenerating(false);
        }
    };

    // ─── Tek Soru Yenileme ────────────────────────────────────────
    const handleRefreshSoru = async (index: number) => {
        if (!aktifSinav) return;
        setRefreshingIndex(index);
        try {
            const yeniSoru = await refreshSingleQuestion(index, ayarlar, aktifSinav.sorular[index]);
            const yeniSorular = [...aktifSinav.sorular];
            yeniSorular[index] = yeniSoru;
            setAktifSinav({ ...aktifSinav, sorular: yeniSorular });
        } catch (err: unknown) {
            if (err instanceof AppError) setError(err.userMessage);
            else setError('Soru yenilenirken bir hata oluştu.');
        } finally {
            setRefreshingIndex(null);
        }
    };

    // ─── Soru Güncelle (inline edit) ──────────────────────────────
    const handleUpdateSoru = (index: number, updated: MatSoru) => {
        if (!aktifSinav) return;
        const yeniSorular = [...aktifSinav.sorular];
        yeniSorular[index] = updated;
        setAktifSinav({ ...aktifSinav, sorular: yeniSorular });
    };

    // ─── Yazdır ───────────────────────────────────────────────────
    const handlePrint = () => {
        if (!aktifSinav) return;

        const fs = printConfig.fontSize + 2;
        const ff = printConfig.fontFamily === 'times' ? 'Times New Roman, serif' : 'Lexend, Inter, sans-serif';
        const mg = printConfig.marginMm;
        const qs = printConfig.questionSpacingMm;
        const lh = printConfig.lineHeight;
        const ta = printConfig.textAlign;

        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>${aktifSinav.baslik}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:${ff}; font-size:${fs}pt; color:#111; margin:${mg}mm; text-align:${ta}; line-height:${lh}; }
  h1 { font-size:${fs + 4}pt; font-weight:800; color:#3730a3; margin-bottom:4pt; text-align:left; }
  .meta { font-size:${fs - 2}pt; color:#555; margin-bottom:8pt; text-align:left; }
  .student-row { border-bottom:1px solid #ccc; padding-bottom:4pt; margin-bottom:10pt; font-size:${fs - 1}pt; color:#444; text-align:left; }
  .sorula-kapsayici { ${printConfig.columns === 2 ? `column-count: 2; column-gap: 12mm;` : ''} }
  .soru-wrap { margin-bottom:${qs}mm; break-inside:avoid; }
  .soru-no { font-weight:700; color:#3730a3; }
  .soru-text { margin-top:3pt; }
  .secenekler { margin-top:4pt; margin-left:12pt; text-align:left; }
  .secenek { margin-bottom:2pt; }
  .kazanim { font-size:7pt; color:#999; font-style:italic; text-align:right; margin-top:3pt; }
  .hr { border:0; border-top:0.5pt solid #ddd; margin:8pt 0; column-span: all; }
  .baslik-kutu { border:1.5pt solid #4f46e5; border-radius:4pt; padding:8pt 10pt; margin-bottom:10pt; column-span: all; }
  .cevap-baslik { font-size:${fs + 1}pt; font-weight:700; color:#064e3b; page-break-before:always; margin-bottom:8pt; text-align:left; }
  .cevap-tablo { width:100%; border-collapse:collapse; margin-bottom:12pt; text-align:left; }
  .cevap-tablo th { background:#e0e7ff; padding:3pt 5pt; font-size:${fs - 1}pt; text-align:left; }
  .cevap-tablo td { padding:2.5pt 5pt; font-size:${fs - 1}pt; border-bottom:0.3pt solid #e5e7eb; }
  .cevap-tablo tr:nth-child(even) td { background:#f8f9fa; }
  .pedanot { font-size:${fs - 1}pt; color:#1e3a5f; background:#eff6ff; border:0.5pt solid #93c5fd; border-radius:3pt; padding:6pt; margin-top:10pt; text-align:left; }
  .footer { font-size:7pt; color:#bbb; text-align:center; margin-top:20pt; column-span: all; }
  @media print { @page { size:A4; margin:${mg}mm; } body { margin:0; } }
</style></head><body>
<div class="baslik-kutu">
  <h1>${aktifSinav.baslik}</h1>
  <div class="meta">${aktifSinav.sinif}. Sınıf | ${aktifSinav.sorular.length} Soru | ${aktifSinav.toplamPuan} Puan | ~${Math.ceil(aktifSinav.tahminiSure / 60)} dakika</div>
</div>
<div class="student-row">Ad Soyad: _________________________________ &nbsp;&nbsp; Sınıf/Şube: _________ &nbsp;&nbsp; Tarih: _________</div>
<div class="sorula-kapsayici">
${aktifSinav.sorular.map((s, i) => {
            const labels = ['A', 'B', 'C', 'D'];
            let sec = '';
            if (s.tip === 'coktan_secmeli' && s.secenekler) {
                sec = `<div class="secenekler">${Object.entries(s.secenekler).map(([k, v], si) => `<div class="secenek">${labels[si]}) ${v}</div>`).join('')}</div>`;
            } else if (s.tip === 'dogru_yanlis') {
                sec = '<div class="secenekler">( ) Doğru &nbsp;&nbsp; ( ) Yanlış</div>';
            } else if (s.tip === 'bosluk_doldurma') {
                sec = '<div class="secenekler">Cevap: <span style="border-bottom:1px solid #999;display:inline-block;width:180pt;">&nbsp;</span></div>';
            } else if (s.tip === 'acik_uclu') {
                sec = '<div style="margin-top:4pt">' + [0, 1, 2, 3].map(() => '<div style="border-bottom:1px solid #bbb;margin-bottom:6pt">&nbsp;</div>').join('') + '</div>';
            }

            let grafikHtml = '';
            if (s.grafik_verisi) {
                grafikHtml = `<div class="grafik-wrap" style="margin-top:8pt; margin-bottom:8pt; display:flex; justify-content:center;">${renderToString(<GraphicRenderer grafik={s.grafik_verisi} />)}</div>`;
            }

            return `<div class="soru-wrap"><span class="soru-no">${i + 1}.</span> <span class="soru-text">${s.soruMetni}</span>${grafikHtml}${sec}<div class="kazanim">[${s.kazanimKodu}]</div></div>`;
        }).join(printConfig.columns === 2 ? '' : '<hr class="hr"/>')}
</div>
<div class="cevap-baslik">CEVAP ANAHTARI</div>
<table class="cevap-tablo"><thead><tr><th>No</th><th>Doğru Cevap</th><th>Puan</th><th>Kazanım</th></tr></thead><tbody>
${aktifSinav.cevapAnahtari.sorular.map(c =>
            `<tr><td>${c.soruNo}.</td><td>${c.dogruCevap}</td><td>${c.puan} puan</td><td>${c.kazanimKodu}</td></tr>`
        ).join('')}
</tbody></table>
<div class="pedanot"><strong>Öğretmenin Dikkatine:</strong><br/><br/>${aktifSinav.pedagogicalNote}</div>
<div class="footer">Oogmatik Süper Matematik Sınav Stüdyosu — MEB 2024-2025</div>
</body></html>`;

        const w = window.open('', '_blank', 'width=900,height=700');
        if (!w) { setError('Pop-up engelleyiciyi devre dışı bırakın.'); return; }
        w.document.write(html);
        w.document.close();
        w.onload = () => { w.focus(); w.print(); };
    };

    // ─── Geçmişten Yükle ─────────────────────────────────────────
    const handleLoadFromHistory = (sinav: typeof aktifSinav) => {
        if (!sinav) return;
        setAktifSinav(sinav);
        setActiveTab('onizleme');
    };

    return (
        <div className="h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-indigo-50 font-sans overflow-hidden">

            {/* Header */}
            <div className="flex-none px-5 py-2.5 border-b border-white/60 bg-white/50 backdrop-blur-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <span className="text-2xl">🧮</span>
                    <div>
                        <h1 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 leading-none">
                            Süper Matematik Sınav Stüdyosu
                        </h1>
                        <p className="text-[10px] text-gray-400 mt-0.5">MEB 2024-2025 · AI Destekli · 1-8. Sınıf</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold">
                    {ayarlar.sinif && <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{ayarlar.sinif}. Sınıf</span>}
                    {kazanimCount > 0 && <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">{kazanimCount} Kazanım</span>}
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{toplamSoru} Soru</span>
                </div>
            </div>

            {/* Ana Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden min-h-0">

                {/* SOL PANEL */}
                <div className="lg:col-span-4 overflow-y-auto mat-sol-panel" style={{ borderRight: '1px solid rgba(200,210,255,0.4)' }}>
                    <div className="flex flex-col gap-0 p-3 min-h-full">

                        {/* Sınıf */}
                        <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-xl mb-2 overflow-hidden shadow-sm transition-all duration-300">
                            <SectionHeader icon="🏫" title="Sınıf Seçimi" badge={ayarlar.sinif ? `${ayarlar.sinif}. Sınıf` : undefined} isOpen={openSections.sinif} onToggle={() => toggleSection('sinif')} />
                            <div className={`transition-all duration-300 ${openSections.sinif ? 'max-h-[500px] opacity-100 p-3 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div>
                                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                                            <button key={g} onClick={() => setSinif(g)}
                                                className={`py-1.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${ayarlar.sinif === g ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-100 hover:border-blue-300 hover:text-blue-600'}`}>
                                                {g}. Sınıf
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kazanımlar */}
                        <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-xl mb-2 overflow-hidden shadow-sm transition-all duration-300">
                            <SectionHeader icon="🎯" title="Kazanımlar" badge={kazanimCount > 0 ? `${kazanimCount} seçildi` : undefined} isOpen={openSections.kazanim} onToggle={() => toggleSection('kazanim')} />
                            <div className={`transition-all duration-300 ${openSections.kazanim ? 'max-h-[800px] opacity-100 p-3 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="pt-1">
                                    <MatKazanimPicker selectedGrade={ayarlar.sinif} selectedUnites={ayarlar.secilenUniteler} selectedKazanimlar={ayarlar.secilenKazanimlar} onUniteChange={setSecilenUniteler} onKazanimChange={setSecilenKazanimlar} />
                                </div>
                            </div>
                        </div>

                        {/* Soru Ayarları */}
                        <div className="bg-white/60 backdrop-blur-md border border-slate-200/60 rounded-xl mb-2 overflow-hidden shadow-sm transition-all duration-300">
                            <SectionHeader icon="⚙️" title="Soru Ayarları" badge={toplamSoru > 0 ? `${toplamSoru} soru` : undefined} isOpen={openSections.ayarlar} onToggle={() => toggleSection('ayarlar')} />
                            <div className={`transition-all duration-300 ${openSections.ayarlar ? 'max-h-[800px] opacity-100 p-3 pt-0' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                                <div className="pt-1">
                                    {kazanimCount > 0 ? (
                                        <MatSoruAyarlari ayarlar={ayarlar} onSoruDagilimiChange={setSoruDagilimi} onAyarlarChange={setAyarlar} />
                                    ) : (
                                        <div className="text-center text-slate-400 text-xs py-3 border border-dashed border-slate-200 rounded-lg">
                                            Önce kazanım seçin
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hata */}
                        {error && (
                            <div className="mb-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                                {error}
                                <button onClick={() => setError(null)} className="ml-2 text-red-400 hover:text-red-600">✕</button>
                            </div>
                        )}

                        {/* Oluştur Butonu */}
                        <div className="sticky bottom-0 pt-2 pb-1 mt-auto">
                            <div className="p-2.5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white">
                                <button
                                    onClick={handleGenerate}
                                    disabled={!canGenerate() || isGenerating}
                                    className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 flex items-center justify-center gap-2 ${canGenerate() && !isGenerating ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]' : 'bg-gray-200 cursor-not-allowed text-gray-400'}`}
                                >
                                    {isGenerating ? (
                                        <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>AI Sınavı Örüyor...</>
                                    ) : (
                                        <><span>✨</span>Sınav Oluştur</>
                                    )}
                                </button>
                                {!canGenerate() && !isGenerating && (
                                    <p className="text-[10px] text-gray-400 text-center mt-1.5">
                                        {ayarlar.sinif === null ? '↑ Sınıf seçin' : kazanimCount === 0 ? '↑ Kazanım seçin' : toplamSoru < 1 ? '↑ En az 1 soru' : ''}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SAĞ PANEL */}
                <div className="lg:col-span-8 flex flex-col overflow-hidden">

                    {/* Toolbar */}
                    <div className="flex-none bg-white/80 backdrop-blur-xl border-b border-white/60 px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-10">
                        <div className="flex bg-slate-100/70 p-0.5 rounded-lg">
                            {(['onizleme', 'cevap-anahtari', 'gecmis'] as TabType[]).map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab)} disabled={tab !== 'gecmis' && !aktifSinav}
                                    className={`px-3 py-1.5 rounded-md font-bold text-[11px] transition-all ${activeTab === tab ? 'bg-white text-blue-700 shadow-sm' : (tab === 'gecmis' || aktifSinav) ? 'text-slate-500 hover:text-blue-600' : 'text-slate-300 cursor-not-allowed'}`}>
                                    {tab === 'onizleme' ? '👁️ Önizleme' : tab === 'cevap-anahtari' ? '✓ Cevap Anahtarı' : `📋 Geçmiş (${sinavGecmisi.length})`}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                            <button onClick={handlePrint} disabled={!aktifSinav}
                                className="toolbar-btn bg-slate-800 text-white hover:bg-black border-0 shadow-md disabled:opacity-35 disabled:cursor-not-allowed">
                                <span className="text-sm">🖨️</span><span className="hidden sm:inline">Yazdır</span>
                            </button>
                        </div>
                    </div>

                    {/* Format Settings Sub-Toolbar */}
                    {aktifSinav && activeTab === 'onizleme' && (
                        <div className="flex-none bg-white/40 backdrop-blur-md border-b border-slate-100 px-4 py-2 flex flex-wrap items-center gap-x-5 gap-y-2 z-0 shadow-[inset_0_4px_6px_-4px_rgba(0,0,0,0.02)]">
                            <div className="flex items-center gap-1 bg-white/90 px-1.5 py-1 rounded-md border border-slate-100 shadow-sm">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mr-1 px-1">Tasarım</span>
                                <FmtBtn active={printConfig.fontFamily === 'helvetica'} onClick={() => updateConfig('fontFamily', 'helvetica')} title="Inter Fontu">Inter</FmtBtn>
                                <FmtBtn active={printConfig.fontFamily === 'times'} onClick={() => updateConfig('fontFamily', 'times')} title="Times New Roman">Times</FmtBtn>
                                <div className="w-px h-3 bg-slate-200 mx-1"></div>
                                {([9, 10, 11, 12] as const).map((s) => (
                                    <FmtBtn key={s} active={printConfig.fontSize === s} onClick={() => updateConfig('fontSize', s)} title={`${s} Punto`}>{s}pt</FmtBtn>
                                ))}
                            </div>
                            <div className="flex items-center gap-1 bg-white/90 px-1.5 py-1 rounded-md border border-slate-100 shadow-sm">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mr-1 px-1">Yerleşim</span>
                                <FmtBtn active={printConfig.marginMm === 10} onClick={() => updateConfig('marginMm', 10)} icon="⤢">Dar</FmtBtn>
                                <FmtBtn active={printConfig.marginMm === 18} onClick={() => updateConfig('marginMm', 18)} icon="◻️">Orta</FmtBtn>
                                <FmtBtn active={printConfig.marginMm === 25} onClick={() => updateConfig('marginMm', 25)} icon="⤡">Geniş</FmtBtn>
                                <div className="w-px h-3 bg-slate-200 mx-1"></div>
                                <FmtBtn active={printConfig.columns === 1} onClick={() => updateConfig('columns', 1)} icon="📄">Tek</FmtBtn>
                                <FmtBtn active={printConfig.columns === 2} onClick={() => updateConfig('columns', 2)} icon="📖">Çift</FmtBtn>
                            </div>
                            <div className="flex items-center gap-1 bg-white/90 px-1.5 py-1 rounded-md border border-slate-100 shadow-sm">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mr-1 px-1">Metin</span>
                                <FmtBtn active={printConfig.textAlign === 'left'} onClick={() => updateConfig('textAlign', 'left')} icon="⫷">Sola</FmtBtn>
                                <FmtBtn active={printConfig.textAlign === 'justify'} onClick={() => updateConfig('textAlign', 'justify')} icon="⫹">Yasla</FmtBtn>
                                <div className="w-px h-3 bg-slate-200 mx-1"></div>
                                <FmtBtn active={printConfig.lineHeight === 1.4} onClick={() => updateConfig('lineHeight', 1.4)}>Sıkı</FmtBtn>
                                <FmtBtn active={printConfig.lineHeight === 1.6} onClick={() => updateConfig('lineHeight', 1.6)}>Normal</FmtBtn>
                                <FmtBtn active={printConfig.lineHeight === 1.8} onClick={() => updateConfig('lineHeight', 1.8)}>Ayrık</FmtBtn>
                            </div>
                        </div>
                    )}

                    {/* Toast */}
                    {successMessage && (
                        <div className="absolute top-14 right-5 z-50 anim-slide-in bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 font-semibold text-sm">
                            ✅ {successMessage}
                        </div>
                    )}

                    {/* İçerik */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ backgroundColor: '#f8f9ff' }}>
                        <div className="p-5 lg:p-8 min-h-full" style={{ backgroundColor: '#f8f9ff' }}>
                            {activeTab === 'gecmis' ? (
                                /* Geçmiş */
                                <div className="max-w-[800px] mx-auto">
                                    <h2 className="text-lg font-extrabold text-gray-700 mb-4 flex items-center gap-2">📋 Sınav Geçmişi</h2>
                                    {sinavGecmisi.length === 0 ? (
                                        <div className="text-center text-gray-400 text-sm py-20">Henüz sınav oluşturmadınız.</div>
                                    ) : (
                                        <div className="space-y-2">
                                            {sinavGecmisi.map((sinav) => (
                                                <div key={sinav.id} className="bg-white rounded-xl border border-gray-100 p-3 flex items-center justify-between hover:shadow-md transition-all">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-700">{sinav.baslik}</p>
                                                        <p className="text-[10px] text-gray-400">
                                                            {sinav.sinif}. Sınıf · {sinav.sorular.length} soru · {new Date(sinav.olusturmaTarihi).toLocaleDateString('tr-TR')}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <button onClick={() => handleLoadFromHistory(sinav)} className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100">Görüntüle</button>
                                                        <button onClick={() => removeSinavGecmisi(sinav.id)} className="px-2 py-1.5 rounded-lg bg-red-50 text-red-500 text-xs hover:bg-red-100">🗑</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : aktifSinav ? (
                                <div className="anim-fade-in">
                                    {activeTab === 'onizleme' ? (
                                        <MatSinavOnizleme
                                            sinav={aktifSinav}
                                            onUpdateSoru={handleUpdateSoru}
                                            onRefreshSoru={handleRefreshSoru}
                                            refreshingIndex={refreshingIndex}
                                        />
                                    ) : (
                                        <MatCevapAnahtariComponent
                                            cevapAnahtari={aktifSinav.cevapAnahtari}
                                            sinavBaslik={aktifSinav.baslik}
                                            pedagogicalNote={aktifSinav.pedagogicalNote}
                                        />
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-gray-400 space-y-4">
                                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center shadow-inner">
                                        <span className="text-5xl opacity-30">🧮</span>
                                    </div>
                                    <p className="text-base font-semibold text-gray-300">Önizleme Alanı</p>
                                    <p className="text-sm text-gray-400 text-center max-w-xs">
                                        Sol panelden ayarları yapın ve <strong className="text-indigo-400">Sınav Oluştur</strong>'a basın.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        .mat-sol-panel { background: rgba(245,248,255,0.6); }
        .toolbar-btn {
          display:flex; align-items:center; gap:0.3rem;
          padding:0.35rem 0.7rem; border-radius:0.4rem;
          font-weight:600; font-size:0.75rem; transition:all 0.18s;
        }
        .custom-scrollbar::-webkit-scrollbar { width:5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background:rgba(59,130,246,0.2); border-radius:4px; }
        .mat-sol-panel::-webkit-scrollbar { width:4px; }
        .mat-sol-panel::-webkit-scrollbar-thumb { background:rgba(59,130,246,0.15); border-radius:4px; }
        .anim-fade-in { animation:matFadeIn 0.3s ease-out forwards; }
        .anim-slide-in { animation:matSlideIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes matFadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes matSlideIn { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
        </div>
    );
};
