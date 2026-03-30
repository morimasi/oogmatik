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

type TabType = 'onizleme' | 'cevap-anahtari' | 'gecmis';

// ─── Alt bileşenler ──────────────────────────────────────────
const SectionHeader: React.FC<{
    icon: string;
    title: string;
    badge?: string;
    isOpen: boolean;
    onToggle: () => void;
    gradient?: string;
}> = ({ icon, title, badge, isOpen, onToggle, gradient = 'from-indigo-500 to-indigo-700' }) => (
    <button onClick={onToggle} className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
            <span className="text-base">{icon}</span>
            <span className={`text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
                {title}
            </span>
            {badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                    {badge}
                </span>
            )}
        </div>
        <span className={`text-gray-400 text-[10px] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
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
        const fs = 12;
        const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/>
<title>${aktifSinav.baslik}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&display=swap');
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:Lexend,sans-serif; font-size:${fs}pt; color:#111; margin:18mm; }
  h1 { font-size:${fs + 4}pt; font-weight:800; color:#3730a3; margin-bottom:4pt; }
  .meta { font-size:${fs - 2}pt; color:#555; margin-bottom:8pt; }
  .student-row { border-bottom:1px solid #ccc; padding-bottom:4pt; margin-bottom:10pt; font-size:${fs - 1}pt; color:#444; }
  .soru-wrap { margin-bottom:10mm; break-inside:avoid; }
  .soru-no { font-weight:700; color:#3730a3; }
  .soru-text { margin-top:3pt; line-height:1.6; }
  .secenekler { margin-top:4pt; margin-left:12pt; }
  .secenek { margin-bottom:2pt; }
  .kazanim { font-size:7pt; color:#999; font-style:italic; text-align:right; margin-top:3pt; }
  .hr { border:0; border-top:0.5pt solid #ddd; margin:8pt 0; }
  .baslik-kutu { border:1.5pt solid #4f46e5; border-radius:4pt; padding:8pt 10pt; margin-bottom:10pt; }
  .cevap-baslik { font-size:${fs + 1}pt; font-weight:700; color:#064e3b; page-break-before:always; margin-bottom:8pt; }
  .cevap-tablo { width:100%; border-collapse:collapse; margin-bottom:12pt; }
  .cevap-tablo th { background:#e0e7ff; padding:3pt 5pt; font-size:${fs - 1}pt; text-align:left; }
  .cevap-tablo td { padding:2.5pt 5pt; font-size:${fs - 1}pt; border-bottom:0.3pt solid #e5e7eb; }
  .cevap-tablo tr:nth-child(even) td { background:#f8f9fa; }
  .pedanot { font-size:${fs - 1}pt; color:#1e3a5f; background:#eff6ff; border:0.5pt solid #93c5fd; border-radius:3pt; padding:6pt; margin-top:10pt; }
  .footer { font-size:7pt; color:#bbb; text-align:center; margin-top:20pt; }
  @media print { @page { size:A4; margin:18mm; } body { margin:0; } }
</style></head><body>
<div class="baslik-kutu">
  <h1>${aktifSinav.baslik}</h1>
  <div class="meta">${aktifSinav.sinif}. Sınıf | ${aktifSinav.sorular.length} Soru | ${aktifSinav.toplamPuan} Puan | ~${Math.ceil(aktifSinav.tahminiSure / 60)} dakika</div>
</div>
<div class="student-row">Ad Soyad: _________________________________ &nbsp;&nbsp; Sınıf/Şube: _________ &nbsp;&nbsp; Tarih: _________</div>
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
            return `<div class="soru-wrap"><span class="soru-no">${i + 1}.</span> <span class="soru-text">${s.soruMetni}</span>${sec}<div class="kazanim">[${s.kazanimKodu}]</div></div>`;
        }).join('<hr class="hr"/>')}
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
                        <div className="accordion-card mb-2.5">
                            <SectionHeader icon="🏫" title="Sınıf Seçimi" badge={ayarlar.sinif ? `${ayarlar.sinif}. Sınıf` : undefined} isOpen={openSections.sinif} onToggle={() => toggleSection('sinif')} gradient="from-blue-500 to-indigo-600" />
                            <div className={`accordion-body ${openSections.sinif ? 'open' : ''}`}>
                                <div className="accordion-content">
                                    <div className="grid grid-cols-4 gap-1.5 pt-3">
                                        {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                                            <button key={g} onClick={() => setSinif(g)}
                                                className={`py-2 rounded-xl text-sm font-bold transition-all duration-200 ${ayarlar.sinif === g ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md scale-105' : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-300 hover:text-indigo-600'}`}>
                                                {g}. Sınıf
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Kazanımlar */}
                        <div className="accordion-card mb-2.5">
                            <SectionHeader icon="🎯" title="Kazanımlar" badge={kazanimCount > 0 ? `${kazanimCount} seçildi` : undefined} isOpen={openSections.kazanim} onToggle={() => toggleSection('kazanim')} gradient="from-indigo-500 to-purple-600" />
                            <div className={`accordion-body ${openSections.kazanim ? 'open' : ''}`}>
                                <div className="accordion-content pt-3">
                                    <MatKazanimPicker selectedGrade={ayarlar.sinif} selectedUnites={ayarlar.secilenUniteler} selectedKazanimlar={ayarlar.secilenKazanimlar} onUniteChange={setSecilenUniteler} onKazanimChange={setSecilenKazanimlar} />
                                </div>
                            </div>
                        </div>

                        {/* Soru Ayarları */}
                        <div className="accordion-card mb-2.5">
                            <SectionHeader icon="⚙️" title="Soru Ayarları" badge={toplamSoru > 0 ? `${toplamSoru} soru` : undefined} isOpen={openSections.ayarlar} onToggle={() => toggleSection('ayarlar')} gradient="from-purple-500 to-pink-500" />
                            <div className={`accordion-body ${openSections.ayarlar ? 'open' : ''}`}>
                                <div className="accordion-content pt-3">
                                    {kazanimCount > 0 ? (
                                        <MatSoruAyarlari ayarlar={ayarlar} onSoruDagilimiChange={setSoruDagilimi} onAyarlarChange={setAyarlar} />
                                    ) : (
                                        <div className="text-center text-gray-400 text-xs py-3 border-2 border-dashed border-gray-200 rounded-xl">
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
                        <div className="flex bg-gray-100/70 p-0.5 rounded-xl">
                            {(['onizleme', 'cevap-anahtari', 'gecmis'] as TabType[]).map((tab) => (
                                <button key={tab} onClick={() => setActiveTab(tab)} disabled={tab !== 'gecmis' && !aktifSinav}
                                    className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === tab ? 'bg-white text-indigo-700 shadow-sm' : (tab === 'gecmis' || aktifSinav) ? 'text-gray-500 hover:text-indigo-600' : 'text-gray-300 cursor-not-allowed'}`}>
                                    {tab === 'onizleme' ? '👁️ Önizleme' : tab === 'cevap-anahtari' ? '✓ Cevap Anahtarı' : `📋 Geçmiş (${sinavGecmisi.length})`}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-1.5 flex-wrap">
                            <button onClick={handlePrint} disabled={!aktifSinav}
                                className="toolbar-btn bg-gray-800 text-white hover:bg-black border-0 shadow-md disabled:opacity-35 disabled:cursor-not-allowed">
                                <span className="text-base">🖨️</span><span className="hidden sm:inline">Yazdır</span>
                            </button>
                        </div>
                    </div>

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
        .accordion-card {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(220,230,255,0.8);
          border-radius: 0.875rem;
          padding: 0.75rem 0.875rem;
          transition: box-shadow 0.2s;
        }
        .accordion-card:hover { box-shadow: 0 3px 16px rgba(59,130,246,0.07); }
        .accordion-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .accordion-body.open { grid-template-rows: 1fr; }
        .accordion-content { overflow: hidden; }
        .toolbar-btn {
          display:flex; align-items:center; gap:0.3rem;
          padding:0.35rem 0.7rem; border-radius:0.55rem;
          font-weight:600; font-size:0.72rem; transition:all 0.18s;
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
