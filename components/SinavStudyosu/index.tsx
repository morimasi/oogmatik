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

type TabType = 'onizleme' | 'cevap-anahtari';

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
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-2 py-1 rounded-md text-xs font-semibold border transition-all ${active
      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
      : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
      }`}
  >
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

  // Accordion state
  const [openSections, setOpenSections] = useState({
    sinif: true,
    kazanim: true,
    ayarlar: true,
    format: false,
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
  const handleAddToWorkbook = () => showSuccess('Çalışma kitabına ekleme yakında!');

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

        {/* SOL PANEL */}
        <div
          className="lg:col-span-4 overflow-y-auto sinav-sol-panel"
          style={{ borderRight: '1px solid rgba(200,210,255,0.4)' }}
        >
          <div className="flex flex-col gap-0 p-3 min-h-full">

            {/* Sınıf */}
            <div className="accordion-card mb-2.5">
              <SectionHeader icon="🏫" title="Sınıf" badge={ayarlar.sinif ? `${ayarlar.sinif}. Sınıf` : undefined} isOpen={openSections.sinif} onToggle={() => toggleSection('sinif')} gradient="from-blue-500 to-indigo-600" />
              <div className={`accordion-body ${openSections.sinif ? 'open' : ''}`}>
                <div className="accordion-content">
                  <div className="grid grid-cols-4 gap-1.5 pt-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                      <button key={g} onClick={() => setSinif(g)}
                        className={`py-2 rounded-xl text-sm font-bold transition-all duration-200 ${ayarlar.sinif === g ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md scale-105' : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-300 hover:text-indigo-600'}`}>
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
                  <KazanimPicker selectedGrade={ayarlar.sinif} selectedUnites={ayarlar.secilenUniteler} selectedKazanimlar={ayarlar.secilenKazanimlar} onUniteChange={setSecilenUniteler} onKazanimChange={setSecilenKazanimlar} />
                </div>
              </div>
            </div>

            {/* Soru Ayarları */}
            <div className="accordion-card mb-2.5">
              <SectionHeader icon="⚙️" title="Soru Ayarları" badge={toplamSoru > 0 ? `${toplamSoru} soru` : undefined} isOpen={openSections.ayarlar} onToggle={() => toggleSection('ayarlar')} gradient="from-purple-500 to-pink-500" />
              <div className={`accordion-body ${openSections.ayarlar ? 'open' : ''}`}>
                <div className="accordion-content pt-3">
                  {ayarlar.secilenKazanimlar.length > 0 ? (
                    <SoruAyarlari ayarlar={ayarlar} onSoruDagilimiChange={setSoruDagilimi} onOzelKonuChange={(k) => setAyarlar({ ozelKonu: k })} />
                  ) : (
                    <div className="text-center text-gray-400 text-xs py-3 border-2 border-dashed border-gray-200 rounded-xl">
                      Önce kazanım seçin
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Format Ayarları */}
            <div className="accordion-card mb-2.5">
              <SectionHeader icon="🎨" title="Format Ayarları" isOpen={openSections.format} onToggle={() => toggleSection('format')} gradient="from-rose-500 to-orange-500" />
              <div className={`accordion-body ${openSections.format ? 'open' : ''}`}>
                <div className="accordion-content pt-3 space-y-3">
                  <FmtRow label="Font">
                    <FmtBtn active={printConfig.fontFamily === 'helvetica'} onClick={() => updateConfig('fontFamily', 'helvetica')}>Inter</FmtBtn>
                    <FmtBtn active={printConfig.fontFamily === 'times'} onClick={() => updateConfig('fontFamily', 'times')}>Times</FmtBtn>
                  </FmtRow>
                  <FmtRow label="Punto">
                    {([9, 10, 11, 12] as const).map((s) => (
                      <FmtBtn key={s} active={printConfig.fontSize === s} onClick={() => updateConfig('fontSize', s)}>{s}pt</FmtBtn>
                    ))}
                  </FmtRow>
                  <FmtRow label="Sütun">
                    <FmtBtn active={printConfig.columns === 1} onClick={() => updateConfig('columns', 1)}>1 Sütun</FmtBtn>
                    <FmtBtn active={printConfig.columns === 2} onClick={() => updateConfig('columns', 2)}>2 Sütun</FmtBtn>
                  </FmtRow>
                  <FmtRow label="Kenar">
                    {([10, 15, 18, 22, 25] as const).map((m) => (
                      <FmtBtn key={m} active={printConfig.marginMm === m} onClick={() => updateConfig('marginMm', m)}>{m}mm</FmtBtn>
                    ))}
                  </FmtRow>
                  <FmtRow label="Aralık">
                    {([6, 8, 10, 14] as const).map((s) => (
                      <FmtBtn key={s} active={printConfig.questionSpacingMm === s} onClick={() => updateConfig('questionSpacingMm', s)}>{s}mm</FmtBtn>
                    ))}
                  </FmtRow>
                </div>
              </div>
            </div>

            {/* Başarı Anı */}
            <div className="accordion-card mb-2.5">
              <SectionHeader icon="🌟" title="Başarı Anı Mimarisi" isOpen={openSections.basariMimarisi} onToggle={() => toggleSection('basariMimarisi')} gradient="from-amber-500 to-orange-500" />
              <div className={`accordion-body ${openSections.basariMimarisi ? 'open' : ''}`}>
                <div className="accordion-content pt-3 space-y-1.5 text-xs text-gray-600">
                  {[['🟢', 'İlk 2 soru — Kolay'], ['🟡', '3-4. soru — Orta'], ['🔴', '5+ — Orta-Zor']].map(([ic, tx]) => (
                    <div key={tx} className="flex items-center gap-2"><span>{ic}</span><span>{tx}</span></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Hata */}
            {error && (
              <div className="mb-2.5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Sticky Oluştur Butonu */}
            <div className="sticky bottom-0 pt-2 pb-1 mt-auto">
              <div className="p-2.5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white">
                <button
                  onClick={handleGenerateExam}
                  disabled={!canGenerate() || isGenerating}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300 flex items-center justify-center gap-2 ${canGenerate() && !isGenerating ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]' : 'bg-gray-200 cursor-not-allowed text-gray-400'}`}
                >
                  {isGenerating ? (
                    <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>AI Sınavı Örüyor...</>
                  ) : (
                    <><span>✨</span>Sınav Oluştur</>
                  )}
                </button>
                {!canGenerate() && !isGenerating && (
                  <p className="text-[10px] text-gray-400 text-center mt-1.5">
                    {ayarlar.sinif === null ? '↑ Sınıf seçin' : kazanimCount === 0 ? '↑ Kazanım seçin' : toplamSoru < 4 ? '↑ En az 4 soru' : ''}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="lg:col-span-8 flex flex-col overflow-hidden">

          {/* Toolbar */}
          <div className="flex-none bg-white/80 backdrop-blur-xl border-b border-white/60 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
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
                { label: 'Kaydet', icon: '💾', fn: handleSaveExam },
                { label: 'Paylaş', icon: '🔗', fn: handleShareExam },
                { label: 'Kitapçık', icon: '📚', fn: handleAddToWorkbook },
              ].map(({ label, icon, fn }) => (
                <button key={label} onClick={fn} disabled={!aktifSinav}
                  className="toolbar-btn bg-gray-50 text-gray-600 hover:bg-indigo-600 hover:text-white border border-gray-200">
                  <span>{icon}</span><span className="hidden sm:inline">{label}</span>
                </button>
              ))}
              <button onClick={handlePrint} disabled={!aktifSinav}
                className="toolbar-btn bg-gray-800 text-white hover:bg-black border-0">
                <span>🖨️</span><span className="hidden sm:inline">Yazdır</span>
              </button>
              <button onClick={handleDownloadPDF} disabled={!aktifSinav}
                className="toolbar-btn bg-gradient-to-r from-red-500 to-red-600 text-white shadow hover:shadow-lg border-0">
                <span>📄</span>İndir
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
        .sinav-sol-panel { background: rgba(248,250,255,0.6); }
        .accordion-card {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(230,235,255,0.8);
          border-radius: 0.875rem;
          padding: 0.75rem 0.875rem;
          transition: box-shadow 0.2s;
        }
        .accordion-card:hover { box-shadow: 0 3px 16px rgba(79,70,229,0.07); }
        .accordion-body {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.28s cubic-bezier(0.4,0,0.2,1);
        }
        .accordion-body.open { grid-template-rows: 1fr; }
        .accordion-content { overflow: hidden; }
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
