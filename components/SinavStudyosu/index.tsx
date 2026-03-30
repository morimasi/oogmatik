/**
 * Sınav Stüdyosu — Format Toolbar + Bağımsız Scroll + Accordion Sol Blok
 */

import React, { useState, useRef } from 'react';
import { useSinavStore } from '../../src/store/useSinavStore';
import { generateExamViaAPI } from '../../src/services/sinavService';
import { generateExamPDF, PrintConfig, DEFAULT_PRINT_CONFIG } from '../../src/utils/sinavPdfGenerator';
import { KazanimPicker } from './KazanimPicker';
import { SoruAyarlari } from './SoruAyarlari';
import { SinavOnizleme } from './SinavOnizleme';
import { CevapAnahtariComponent } from './CevapAnahtari';
import { AppError } from '../../src/utils/AppError';
import { worksheetService } from '../../src/services/worksheetService';
import { useAuthStore } from '../../src/store/useAuthStore';
import { ActivityType } from '../../src/types';

type TabType = 'onizleme' | 'cevap-anahtari';

const SectionHeader: React.FC<{ icon: string; title: string; badge?: string; isOpen: boolean; onToggle: () => void; }> = ({ icon, title, badge, isOpen, onToggle }) => (
  <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 bg-transparent hover:bg-slate-50 transition-colors group">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${isOpen ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'}`}>
        <span className="text-base">{icon}</span>
      </div>
      <span className={`text-[13px] font-semibold tracking-wide transition-colors ${isOpen ? 'text-indigo-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{title}</span>
      {badge && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">{badge}</span>}
    </div>
    <span className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  </button>
);

// Format kontrol satırı (label + seçenek butonları)
const FmtRow: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide min-w-[52px]">{label}</span>
    <div className="flex gap-1 flex-wrap">{children}</div>
  </div>
);

const FmtBtn: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  icon?: string;
  title?: string;
}> = ({ active, onClick, children, icon, title }) => (
  <button
    onClick={onClick}
    title={title}
    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border flex items-center justify-center gap-1.5 hover:-translate-y-0.5 transition-all duration-200 ${active
      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/30'
      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm'
      }`}
  >
    {icon && <span className="opacity-90">{icon}</span>}
    {children}
  </button>
);

export const SinavStudyosu: React.FC = () => {
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
    addKaydedilmisSinav,
  } = useSinavStore();

  const [activeTab, setActiveTab] = useState<TabType>('onizleme');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [printConfig, setPrintConfig] = useState<PrintConfig>(DEFAULT_PRINT_CONFIG);
  const printRef = useRef<HTMLDivElement>(null);
  const [isSavingToWorkbook, setIsSavingToWorkbook] = useState(false);

  // Accordion state
  const [openSections, setOpenSections] = useState({
    sinif: true,
    kazanim: true,
    ayarlar: true,
    basariMimarisi: false,
  });
  const toggleSection = (key: keyof typeof openSections) =>
    setOpenSections((p) => ({ ...p, [key]: !p[key] }));

  const updateConfig = <K extends keyof PrintConfig>(key: K, val: PrintConfig[K]) =>
    setPrintConfig((c) => ({ ...c, [key]: val }));

  const handleGenerateExam = async (): Promise<void> => {
    setError(null);
    setSuccessMessage(null);
    try {
      setIsGenerating(true);
      const sinav = await generateExamViaAPI(ayarlar);
      setAktifSinav(sinav);
      addKaydedilmisSinav(sinav);
      setActiveTab('onizleme');
    } catch (err: unknown) {
      if (err instanceof AppError) setError(err.userMessage);
      else setError('Sınav oluşturulurken beklenmeyen bir hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canGenerate = () =>
    ayarlar.sinif !== null &&
    ayarlar.secilenKazanimlar.length > 0 &&
    (ayarlar.soruDagilimi['coktan-secmeli'] +
      ayarlar.soruDagilimi['dogru-yanlis-duzeltme'] +
      ayarlar.soruDagilimi['bosluk-doldurma'] +
      ayarlar.soruDagilimi['acik-uclu']) >= 4;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDownloadPDF = () => {
    if (!aktifSinav) return;
    try {
      generateExamPDF(aktifSinav, printConfig);
      showSuccess('PDF indirildi!');
    } catch {
      setError('PDF oluşturulurken bir hata oluştu.');
    }
  };

  const handlePrint = () => {
    if (!aktifSinav) return;
    const printEl = printRef.current;
    if (!printEl) return;

    const fs = printConfig.fontSize + 2;
    const ff = printConfig.fontFamily === 'times' ? 'Times New Roman, serif' : 'Lexend, Inter, sans-serif';
    const mg = printConfig.marginMm;
    const qs = printConfig.questionSpacingMm;

    const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<title>${aktifSinav.baslik}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Lexend:wght@400;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: ${ff};
    font-size: ${fs}pt;
    color: #111;
    background: #fff;
    margin: ${mg}mm;
  }
  h1 { font-size: ${fs + 4}pt; font-weight: 800; color: #3730a3; margin-bottom: 4pt; }
  .meta { font-size: ${fs - 2}pt; color: #555; margin-bottom: 8pt; }
  .student-row { border-bottom: 1px solid #ccc; padding-bottom: 4pt; margin-bottom: 10pt; font-size: ${fs - 1}pt; color: #444; }
  .soru-wrap { margin-bottom: ${qs}mm; break-inside: avoid; }
  .soru-no { font-weight: 700; color: #3730a3; }
  .soru-text { margin-top: 3pt; line-height: 1.6; }
  .secenekler { margin-top: 4pt; margin-left: 12pt; }
  .secenek { margin-bottom: 2pt; }
  .cevap-alani { border-bottom: 1px solid #999; margin-top: 4pt; min-height: 14pt; }
  .acik-alani { margin-top: 4pt; }
  .cizgi { border-bottom: 1px solid #bbb; margin-bottom: 6pt; }
  .kazanim { font-size: 7pt; color: #999; font-style: italic; text-align: right; margin-top: 3pt; }
  .hr { border: 0; border-top: 0.5pt solid #ddd; margin: 8pt 0; }
  .baslik-kutu { border: 1.5pt solid #4f46e5; border-radius: 4pt; padding: 8pt 10pt; margin-bottom: 10pt; }
  .cevap-baslik { font-size: ${fs + 1}pt; font-weight: 700; color: #064e3b; margin-bottom: 8pt; page-break-before: always; }
  .cevap-tablo { width: 100%; border-collapse: collapse; margin-bottom: 12pt; }
  .cevap-tablo th { background: #e0e7ff; padding: 3pt 5pt; font-size: ${fs - 1}pt; text-align: left; }
  .cevap-tablo td { padding: 2.5pt 5pt; font-size: ${fs - 1}pt; border-bottom: 0.3pt solid #e5e7eb; }
  .cevap-tablo tr:nth-child(even) td { background: #f8f9fa; }
  .pedanot { font-size: ${fs - 1}pt; color: #1e3a5f; background: #eff6ff; border: 0.5pt solid #93c5fd; border-radius: 3pt; padding: 6pt; margin-top: 10pt; page-break-before: always; }
  .footer { font-size: 7pt; color: #bbb; text-align: center; margin-top: 20pt; }
  @media print {
    @page { size: A4; margin: ${mg}mm; }
    body { margin: 0; }
  }
</style>
</head>
<body>
<div class="baslik-kutu">
  <h1>${aktifSinav.baslik}</h1>
  <div class="meta">${aktifSinav.sinif}. Sınıf &nbsp;|&nbsp; ${aktifSinav.sorular.length} Soru &nbsp;|&nbsp; ${aktifSinav.toplamPuan} Puan &nbsp;|&nbsp; ~${Math.ceil(aktifSinav.tahminiSure / 60)} dakika</div>
</div>
<div class="student-row">Ad Soyad: _________________________________ &nbsp;&nbsp; Sınıf/Şube: _________ &nbsp;&nbsp; Tarih: _________</div>

${aktifSinav.sorular.map((s, i) => {
      const lbl = ['A', 'B', 'C', 'D'];
      let secContent = '';
      if (s.tip === 'coktan-secmeli' && Array.isArray(s.secenekler)) {
        secContent = `<div class="secenekler">${s.secenekler.map((sec, si) => `<div class="secenek">${lbl[si]}) ${sec}</div>`).join('')}</div>`;
      } else if (s.tip === 'dogru-yanlis-duzeltme') {
        secContent = `<div class="secenekler">( ) Doğru &nbsp;&nbsp;&nbsp; ( ) Yanlış &nbsp;&nbsp;&nbsp; Düzeltme: ___________________________</div>`;
      } else if (s.tip === 'bosluk-doldurma') {
        secContent = `<div class="secenekler">Cevap: <span style="border-bottom:1px solid #999;display:inline-block;width:180pt;">&nbsp;</span></div>`;
      } else if (s.tip === 'acik-uclu') {
        secContent = `<div class="acik-alani">${[0, 1, 2, 3].map(() => '<div class="cizgi">&nbsp;</div>').join('')}</div>`;
      }
      return `<div class="soru-wrap">
  <span class="soru-no">${i + 1}.</span>
  <span class="soru-text">${s.soruMetni}</span>
  ${secContent}
  <div class="kazanim">[${s.kazanimKodu}]</div>
</div>`;
    }).join('<hr class="hr"/>')}

<div class="cevap-baslik">CEVAP ANAHTARI</div>
<table class="cevap-tablo">
<thead><tr><th>No</th><th>Doğru Cevap</th><th>Puan</th><th>Kazanım</th></tr></thead>
<tbody>
${aktifSinav.cevapAnahtari.sorular.map(c =>
      `<tr><td>${c.soruNo}.</td><td>${c.dogruCevap}</td><td>${c.puan} puan</td><td>${c.kazanimKodu}</td></tr>`
    ).join('')}
</tbody>
</table>

<div class="pedanot"><strong>Öğretmenin Dikkatine:</strong><br/><br/>${aktifSinav.pedagogicalNote}</div>
<div class="footer">Oogmatik Sınav Stüdyosu — MEB 2024-2025</div>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) { setError('Yazdırma penceresi açılamadı. Pop-up engelleyiciyi devre dışı bırakın.'); return; }
    w.document.write(html);
    w.document.close();
    w.onload = () => { w.focus(); w.print(); };
  };

  const handleSaveExam = () => showSuccess('Sınav kaydedildi! (Geliştirme aşamasında)');
  const handleShareExam = () => showSuccess('Paylaşım özelliği yakında!');

  // Workbook Integration — Tek Tıkla Kaydet
  const handleAddToWorkbook = async () => {
    if (!aktifSinav) {
      setError('Lütfen önce bir sınav oluşturun.');
      return;
    }

    try {
      const user = useAuthStore.getState().user;
      if (!user) {
        setError('Lütfen giriş yapın.');
        return;
      }

      setIsSavingToWorkbook(true);
      setError(null);

      // Sınav verisini SingleWorksheetData formatına dönüştür
      const worksheetData = {
        activityType: ActivityType.SINAV,
        data: [aktifSinav],
        settings: {
          fontSize: printConfig.fontSize,
          fontFamily: printConfig.fontFamily,
          marginMm: printConfig.marginMm,
          columns: printConfig.columns,
          lineHeight: printConfig.lineHeight,
          textAlign: printConfig.textAlign,
          questionSpacingMm: printConfig.questionSpacingMm,
          difficulty: 'Orta' as const
        }
      };

      // worksheetService.saveWorksheet ile kaydet
      await worksheetService.saveWorksheet(
        user.id,
        aktifSinav.baslik || 'Türkçe Sınavı',
        ActivityType.SINAV,
        [worksheetData],
        'fa-solid fa-file-lines',
        { id: 'turkce', title: 'Türkçe' }, // Kategori: Türkçe
        {
          fontSize: printConfig.fontSize,
          fontFamily: printConfig.fontFamily,
          marginMm: printConfig.marginMm,
          columns: printConfig.columns,
          lineHeight: printConfig.lineHeight,
          textAlign: printConfig.textAlign,
          difficulty: 'Orta' as const
        }
      );

      showSuccess('✅ Sınav "Çalışma Kitapçığı" veri tabanına kaydedildi!');
    } catch (err: any) {
      console.error('Workbook kayıt hatası:', err);
      setError(`Kaydetme hatası: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsSavingToWorkbook(false);
    }
  };

  const kazanimCount = ayarlar.secilenKazanimlar.length;
  const toplamSoru =
    ayarlar.soruDagilimi['coktan-secmeli'] +
    ayarlar.soruDagilimi['dogru-yanlis-duzeltme'] +
    ayarlar.soruDagilimi['bosluk-doldurma'] +
    ayarlar.soruDagilimi['acik-uclu'];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50 font-sans overflow-hidden">

      {/* Header */}
      <div className="flex-none px-5 py-2.5 border-b border-white/60 bg-white/50 backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📝</span>
          <div>
            <h1 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 leading-none">
              Sınav Stüdyosu
            </h1>
            <p className="text-[10px] text-gray-400 mt-0.5">MEB 2024-2025 · AI Destekli</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          {ayarlar.sinif && <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">{ayarlar.sinif}. Sınıf</span>}
          {kazanimCount > 0 && <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">{kazanimCount} Kazanım</span>}
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">{toplamSoru} Soru</span>
        </div>
      </div>

      {/* Ana Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden min-h-0">

        {/* SOL PANEL (SaaS Premium Sidebar) */}
        <div className="lg:col-span-3 flex flex-col bg-white border-r border-slate-200 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.06)] z-20 overflow-hidden">

          <div className="flex-1 overflow-y-auto custom-scrollbar">

            {/* Sınıf Seçimi */}
            <div className="border-b border-slate-100">
              <SectionHeader icon="🏫" title="Sınıf Seçimi" badge={ayarlar.sinif ? `${ayarlar.sinif}. Sınıf` : undefined} isOpen={openSections.sinif} onToggle={() => toggleSection('sinif')} />
              <div className={`transition-all duration-300 ease-in-out ${openSections.sinif ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-5 pb-5 pt-1">
                  <div className="bg-slate-50/50 p-1.5 rounded-2xl border border-slate-100">
                    <div className="grid grid-cols-4 gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                        <button key={g} onClick={() => setSinif(g)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all duration-200 ${ayarlar.sinif === g ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/60' : 'text-slate-500 hover:bg-white/60 hover:text-slate-700'}`}>
                          {g}.
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kazanımlar */}
            <div className="border-b border-slate-100">
              <SectionHeader icon="🎯" title="Kazanımlar" badge={kazanimCount > 0 ? `${kazanimCount} seçildi` : undefined} isOpen={openSections.kazanim} onToggle={() => toggleSection('kazanim')} />
              <div className={`transition-all duration-300 ease-in-out ${openSections.kazanim ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-5 pb-5 pt-1">
                  <KazanimPicker selectedGrade={ayarlar.sinif} selectedUnites={ayarlar.secilenUniteler} selectedKazanimlar={ayarlar.secilenKazanimlar} onUniteChange={setSecilenUniteler} onKazanimChange={setSecilenKazanimlar} />
                </div>
              </div>
            </div>

            {/* Soru Ayarları */}
            <div className="border-b border-slate-100">
              <SectionHeader icon="⚙️" title="Soru Ayarları" badge={toplamSoru > 0 ? `${toplamSoru} soru` : undefined} isOpen={openSections.ayarlar} onToggle={() => toggleSection('ayarlar')} />
              <div className={`transition-all duration-300 ease-in-out ${openSections.ayarlar ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-5 pb-5 pt-1">
                  {ayarlar.secilenKazanimlar.length > 0 ? (
                    <SoruAyarlari ayarlar={ayarlar} onSoruDagilimiChange={setSoruDagilimi} onOzelKonuChange={(k) => setAyarlar({ ozelKonu: k })} />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                      <span className="text-xl mb-2 opacity-40">🎯</span>
                      <span className="text-xs font-medium text-slate-400">Kazanım haritası bekleniyor</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Başarı Anı Mimarisi */}
            <div className="border-b border-slate-100">
              <SectionHeader icon="🌟" title="Başarı Anı Mimarisi" isOpen={openSections.basariMimarisi} onToggle={() => toggleSection('basariMimarisi')} />
              <div className={`transition-all duration-300 ease-in-out ${openSections.basariMimarisi ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                <div className="px-5 pb-5 pt-1 space-y-2.5 text-xs text-slate-600 font-medium tracking-wide">
                  {[['🟢', 'İlk 2 soru — Basit ZPD'], ['🟡', '3-4. soru — Kademeli Geçiş'], ['🔴', '5+ — Bağımsız Çalışma']].map(([ic, tx]) => (
                    <div key={tx} className="flex items-center gap-3 bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-100/50">
                      <span className="text-base leading-none">{ic}</span><span>{tx}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {error && (
              <div className="m-5 p-4 bg-red-50 border border-red-100 rounded-2xl text-[13px] text-red-600 font-medium flex items-start gap-3">
                <span className="text-lg leading-none">⚠️</span>
                <span>{error}</span>
              </div>
            )}

          </div>

          {/* Sticky Oluştur Butonu */}
          <div className="flex-none p-5 bg-white border-t border-slate-100 shadow-[0_-4px_24px_-12px_rgba(0,0,0,0.05)] z-30">
            <button
              onClick={handleGenerateExam}
              disabled={!canGenerate() || isGenerating}
              className={`relative w-full py-4 rounded-2xl font-bold text-[13px] tracking-wide text-white transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group ${canGenerate() && !isGenerating ? 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_8px_20px_-8px_rgba(79,70,229,0.5)] hover:-translate-y-0.5' : 'bg-slate-100 cursor-not-allowed text-slate-400'}`}
            >
              {canGenerate() && !isGenerating && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] skew-x-[-15deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-out" />
              )}
              {isGenerating ? (
                <><svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>AI Sınav Üretiyor...</>
              ) : (
                <>Sınav Oluştur <span className="opacity-80">→</span></>
              )}
            </button>
            {!canGenerate() && !isGenerating && (
              <p className="text-[11px] text-slate-400 text-center mt-3 font-medium">
                {ayarlar.sinif === null ? 'Sınıf seçimi bekleniyor' : kazanimCount === 0 ? 'Kazanım haritası boş' : toplamSoru < 4 ? 'Hedef: En az 4 soru' : ''}
              </p>
            )}
          </div>

        </div>

        {/* SAĞ PANEL */}
        <div className="lg:col-span-9 flex flex-col overflow-hidden">

          {/* Ana Actions Toolbar */}
          <div className="flex-none bg-white/80 backdrop-blur-xl border-b border-white/60 px-4 py-2 flex flex-wrap items-center justify-between gap-2 z-10">
            <div className="flex bg-gray-100/70 p-0.5 rounded-xl">
              {(['onizleme', 'cevap-anahtari'] as TabType[]).map((tab) => (
                <button key={tab} onClick={() => setActiveTab(tab)} disabled={!aktifSinav}
                  className={`px-4 py-2 rounded-lg font-bold text-xs transition-all ${activeTab === tab ? 'bg-white text-indigo-700 shadow-sm' : aktifSinav ? 'text-gray-500 hover:text-indigo-600' : 'text-gray-300 cursor-not-allowed'}`}>
                  {tab === 'onizleme' ? '👁️ Önizleme' : '✓ Cevap Anahtarı'}
                </button>
              ))}
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {[
                { label: 'Kaydet', icon: '💾', fn: handleSaveExam, loading: false },
                { label: 'Paylaş', icon: '🔗', fn: handleShareExam, loading: false },
              ].map(({ label, icon, fn, loading }) => (
                <button key={label} onClick={fn} disabled={!aktifSinav}
                  className="toolbar-btn bg-gray-50 text-gray-600 hover:bg-indigo-600 hover:text-white border border-gray-200 shadow-sm">
                  <span className="text-base">{icon}</span><span className="hidden sm:inline">{label}</span>
                </button>
              ))}
              <button
                onClick={handleAddToWorkbook}
                disabled={!aktifSinav || isSavingToWorkbook}
                className="toolbar-btn bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 border-0 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingToWorkbook ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span className="hidden sm:inline">Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <span className="text-base">📚</span><span className="hidden sm:inline">Kitapçık</span>
                  </>
                )}
              </button>
              <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>
              <button onClick={handlePrint} disabled={!aktifSinav}
                className="toolbar-btn bg-gray-800 text-white hover:bg-black border-0 shadow-md">
                <span className="text-base">🖨️</span><span className="hidden sm:inline">Yazdır</span>
              </button>
              <button onClick={handleDownloadPDF} disabled={!aktifSinav}
                className="toolbar-btn bg-gradient-to-r from-rose-500 to-red-600 text-white hover:from-rose-600 hover:to-red-700 border-0 shadow-md">
                <span className="text-base">📄</span>İndir
              </button>
            </div>
          </div>

          {/* Format Settings Sub-Toolbar */}
          {aktifSinav && activeTab === 'onizleme' && (
            <div className="flex-none bg-indigo-50/50 backdrop-blur-md border-b border-indigo-100 px-4 py-2 flex flex-wrap items-center gap-x-6 gap-y-2 z-0 anim-slide-in shadow-[inset_0_4px_6px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-lg border border-indigo-50">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mr-1">Tasarım</span>
                <FmtBtn active={printConfig.fontFamily === 'helvetica'} onClick={() => updateConfig('fontFamily', 'helvetica')} title="Inter Fontu">Inter</FmtBtn>
                <FmtBtn active={printConfig.fontFamily === 'times'} onClick={() => updateConfig('fontFamily', 'times')} title="Times New Roman">Times</FmtBtn>
                <div className="w-px h-4 bg-indigo-200 mx-1"></div>
                {([9, 10, 11, 12] as const).map((s) => (
                  <FmtBtn key={s} active={printConfig.fontSize === s} onClick={() => updateConfig('fontSize', s)} title={`${s} Punto`}>{s}pt</FmtBtn>
                ))}
              </div>

              <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-lg border border-indigo-50">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mr-1">Yerleşim</span>
                <FmtBtn active={printConfig.marginMm === 10} onClick={() => updateConfig('marginMm', 10)} title="Dar Kenar Boşluğu (10mm)" icon="⤢">Dar</FmtBtn>
                <FmtBtn active={printConfig.marginMm === 18} onClick={() => updateConfig('marginMm', 18)} title="Normal Kenar Boşluğu (18mm)" icon="◻️">Orta</FmtBtn>
                <FmtBtn active={printConfig.marginMm === 25} onClick={() => updateConfig('marginMm', 25)} title="Geniş Kenar Boşluğu (25mm)" icon="⤡">Geniş</FmtBtn>
                <div className="w-px h-4 bg-indigo-200 mx-1"></div>
                <FmtBtn active={printConfig.columns === 1} onClick={() => updateConfig('columns', 1)} icon="📄">Tek</FmtBtn>
                <FmtBtn active={printConfig.columns === 2} onClick={() => updateConfig('columns', 2)} icon="📖">Çift</FmtBtn>
              </div>

              <div className="flex items-center gap-1.5 bg-white/60 px-2 py-1 rounded-lg border border-indigo-50">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mr-1">Metin</span>
                <FmtBtn active={printConfig.textAlign === 'left'} onClick={() => updateConfig('textAlign', 'left')} title="Sola Dayalı" icon="⫷">Sola</FmtBtn>
                <FmtBtn active={printConfig.textAlign === 'justify'} onClick={() => updateConfig('textAlign', 'justify')} title="İki Yana Yasla" icon="⫹">Yasla</FmtBtn>
                <div className="w-px h-4 bg-indigo-200 mx-1"></div>
                <FmtBtn active={printConfig.lineHeight === 1.4} onClick={() => updateConfig('lineHeight', 1.4)} title="Sıkı Satır">1.4</FmtBtn>
                <FmtBtn active={printConfig.lineHeight === 1.6} onClick={() => updateConfig('lineHeight', 1.6)} title="Normal Satır">1.6</FmtBtn>
                <FmtBtn active={printConfig.lineHeight === 1.8} onClick={() => updateConfig('lineHeight', 1.8)} title="Ayrık Satır">1.8</FmtBtn>
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
          <div ref={printRef} className="flex-1 overflow-y-auto custom-scrollbar" style={{ backgroundColor: '#f8f9ff' }}>
            <div className="p-5 lg:p-8 min-h-full" style={{ backgroundColor: '#f8f9ff' }}>
              {aktifSinav ? (
                <div className="anim-fade-in">
                  {activeTab === 'onizleme' ? (
                    <SinavOnizleme sinav={aktifSinav} showAnswers={false} config={printConfig} />
                  ) : (
                    <CevapAnahtariComponent cevapAnahtari={aktifSinav.cevapAnahtari} sinavBaslik={aktifSinav.baslik} />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-gray-400 space-y-4">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner">
                    <span className="text-5xl opacity-30">📝</span>
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
        .toolbar-btn {
          display: flex; align-items: center; gap: 0.3rem;
          padding: 0.35rem 0.7rem; border-radius: 0.55rem;
          font-weight: 600; font-size: 0.72rem; transition: all 0.18s;
          border-width: 1px;
        }
        .toolbar-btn:disabled { opacity: 0.35; cursor: not-allowed; pointer-events: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.2); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.45); }
        .sinav-sol-panel::-webkit-scrollbar { width: 4px; }
        .sinav-sol-panel::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.15); border-radius: 4px; }
        .anim-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .anim-slide-in { animation: slideIn 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
};
