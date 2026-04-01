/**
 * Sınav Stüdyosu — Format Toolbar + Bağımsız Scroll + Accordion Sol Blok
 */

import React, { useState, useRef } from 'react';
import { useSinavStore } from '../../src/store/useSinavStore';
import { generateExamViaAPI } from '../../src/services/sinavService';
import {
  generateExamPDF,
  PrintConfig,
  DEFAULT_PRINT_CONFIG,
} from '../../src/utils/sinavPdfGenerator';
import { KazanimPicker } from './KazanimPicker';
import { SoruAyarlari } from './SoruAyarlari';
import { SinavOnizleme } from './SinavOnizleme';
import { CevapAnahtariComponent } from './CevapAnahtari';
import { AppError } from '../../src/utils/AppError';
import { worksheetService } from '../../src/services/worksheetService';
import { useAuthStore } from '../../src/store/useAuthStore';
import { ActivityType } from '../../src/types';
import { ShareModal } from '../../src/components/ShareModal';

type TabType = 'onizleme' | 'cevap-anahtari';

const SectionHeader: React.FC<{
  icon: string;
  title: string;
  badge?: string;
  isOpen: boolean;
  onToggle: () => void;
}> = ({ icon, title, badge, isOpen, onToggle }) => (
  <button
    onClick={onToggle}
    className="w-full flex items-center justify-between px-5 py-4 bg-transparent hover:bg-[var(--surface-glass)] transition-all duration-300 group rounded-xl"
  >
    <div className="flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-sm rotate-6' : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] group-hover:bg-[var(--accent-muted)] group-hover:text-[var(--accent-color)] group-hover:rotate-3'}`}
      >
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex flex-col items-start text-left">
        <span
          className={`text-[13px] font-bold tracking-tight transition-colors ${isOpen ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--accent-color)]'}`}
        >
          {title}
        </span>
        {badge && (
          <span className="text-[9px] font-bold text-[var(--accent-color)] uppercase tracking-widest mt-0.5">
            {badge}
          </span>
        )}
      </div>
    </div>
    <span
      className={`transition-all duration-500 ${isOpen ? 'rotate-180 text-[var(--accent-color)]' : 'text-[var(--text-muted)] group-hover:text-[var(--accent-color)]'}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-sm"
      >
        <path
          d="M6 9L12 15L18 9"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  </button>
);

// Format kontrol satırı (label + seçenek butonları)
const FmtRow: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div className="flex items-center gap-2 flex-wrap">
    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide min-w-[52px]">
      {label}
    </span>
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
    className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 flex items-center justify-center gap-2 transition-all duration-300 ${
      active
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200 scale-105 z-10'
        : 'bg-white/80 text-slate-600 border-slate-100 hover:border-indigo-200 hover:text-indigo-600 hover:bg-white hover:shadow-md'
    }`}
  >
    {icon && <span className="text-sm">{icon}</span>}
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
    ayarlar.soruDagilimi['coktan-secmeli'] +
      ayarlar.soruDagilimi['dogru-yanlis-duzeltme'] +
      ayarlar.soruDagilimi['bosluk-doldurma'] +
      ayarlar.soruDagilimi['acik-uclu'] >=
      4;

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
    const ff =
      printConfig.fontFamily === 'times' ? 'Times New Roman, serif' : 'Lexend, Inter, sans-serif';
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

${aktifSinav.sorular
  .map((s, i) => {
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
  })
  .join('<hr class="hr"/>')}

<div class="cevap-baslik">CEVAP ANAHTARI</div>
<table class="cevap-tablo">
<thead><tr><th>No</th><th>Doğru Cevap</th><th>Puan</th><th>Kazanım</th></tr></thead>
<tbody>
${aktifSinav.cevapAnahtari.sorular
  .map(
    (c) =>
      `<tr><td>${c.soruNo}.</td><td>${c.dogruCevap}</td><td>${c.puan} puan</td><td>${c.kazanimKodu}</td></tr>`
  )
  .join('')}
</tbody>
</table>

<div class="pedanot"><strong>Öğretmenin Dikkatine:</strong><br/><br/>${aktifSinav.pedagogicalNote}</div>
<div class="footer">Oogmatik Sınav Stüdyosu — MEB 2024-2025</div>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=900,height=700');
    if (!w) {
      setError('Yazdırma penceresi açılamadı. Pop-up engelleyiciyi devre dışı bırakın.');
      return;
    }
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      w.focus();
      w.print();
    };
  };

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // ─── Arşive Kaydet ────────────────────────────────────────────────────────
  const handleSaveExam = async () => {
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

      const worksheetData = {
        title: aktifSinav.baslik || 'Türkçe Sınavı',
        instruction: 'Soruları dikkatlice okuyunuz ve en doğru cevabı veriniz.',
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
          difficulty: 'Orta' as const,
        },
      };

      await worksheetService.saveWorksheet(
        user.id,
        aktifSinav.baslik || 'Türkçe Sınavı',
        ActivityType.SINAV,
        [worksheetData],
        'fa-solid fa-file-lines',
        { id: 'turkce', title: 'Türkçe' },
        {
          fontSize: printConfig.fontSize,
          fontFamily: printConfig.fontFamily,
          margin: printConfig.marginMm,
          columns: printConfig.columns,
          lineHeight: printConfig.lineHeight,
          contentAlign: printConfig.textAlign,
        } as any
      );

      showSuccess('✅ Sınav arşive kaydedildi!');
    } catch (err: any) {
      console.error('Arşiv kayıt hatası:', err);
      setError(`Kaydetme hatası: ${err.message || 'Bilinmeyen hata'}`);
    }
  };

  // ─── Paylaşım (Kişiler + Link + Sosyal Medya) ─────────────────────────────
  const handleShareExam = async (receiverIds: string[]) => {
    if (!aktifSinav) return;
    try {
      setIsSharing(true);
      const user = useAuthStore.getState().user;
      if (!user) {
        setError('Lütfen giriş yapın.');
        return;
      }

      if (receiverIds.length > 0) {
        const shareData = {
          examId: aktifSinav.id || Date.now().toString(),
          title: aktifSinav.baslik,
          senderId: user.id,
          senderName: user.name,
          data: aktifSinav,
          sharedAt: new Date().toISOString(),
        };

        for (const receiverId of receiverIds) {
          try {
            await fetch('/api/share/exam', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
              },
              body: JSON.stringify({ ...shareData, receiverId }),
            });
          } catch {
            const existingShares = JSON.parse(localStorage.getItem('shared_exams') || '[]');
            existingShares.push({ ...shareData, receiverId });
            localStorage.setItem('shared_exams', JSON.stringify(existingShares));
          }
        }
      }

      setIsShareModalOpen(false);
      showSuccess('✅ Paylaşım başarıyla gönderildi!');
    } catch (err: any) {
      setError(`Paylaşım hatası: ${err.message || 'Bilinmeyen hata'}`);
    } finally {
      setIsSharing(false);
    }
  };

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

      // Sınav verisini SingleWorksheetData formatına dönüştör
      const worksheetData = {
        title: aktifSinav.baslik || 'Türkçe Sınavı',
        instruction: 'Soruları dikkatlice okuyunuz ve en doğru cevabı veriniz.',
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
          difficulty: 'Orta' as const,
        },
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
          margin: printConfig.marginMm,
          columns: printConfig.columns,
          lineHeight: printConfig.lineHeight,
          contentAlign: printConfig.textAlign,
        } as any
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
    <div className="h-screen flex flex-col bg-[var(--bg-primary)] font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/20 blur-[120px] rounded-full animate-pulse" />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/20 blur-[120px] rounded-full animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      {/* Header */}
      <div className="flex-none px-6 py-3 border-b border-[var(--border-color)] bg-[var(--bg-paper)]/80 backdrop-blur-md flex items-center justify-between gap-4 z-[90]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--accent-color)] rounded-2xl flex items-center justify-center shadow-lg text-white">
            <span className="text-xl">📝</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-[var(--text-primary)] tracking-tight leading-none">
              Sınav Stüdyosu
            </h1>
            <p className="text-[10px] text-[var(--accent-color)] font-bold uppercase tracking-widest mt-1 opacity-80">
              MEB 2024-2025 · AI Destekli
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {ayarlar.sinif && (
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
              <span className="text-[11px] font-bold text-[var(--text-primary)]">
                {ayarlar.sinif}. Sınıf
              </span>
            </div>
          )}
          {kazanimCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-pulse" />
              <span className="text-[11px] font-bold text-[var(--text-primary)]">
                {kazanimCount} Kazanım
              </span>
            </div>
          )}
          <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center gap-2">
            <span className="text-[11px] font-bold text-[var(--text-secondary)]">
              {toplamSoru} Soru
            </span>
          </div>
        </div>
      </div>

      {/* Ana Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden min-h-0">
        {/* SOL PANEL (SaaS Premium Sidebar) */}
        <div className="lg:col-span-3 flex flex-col glass-panel border-r border-[var(--border-color)] z-20 overflow-hidden bg-[var(--bg-paper)]/40">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {/* Sınıf Seçimi */}
            <div className="bg-[var(--bg-paper)]/60 backdrop-blur-md rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <SectionHeader
                icon="🏫"
                title="Sınıf Seçimi"
                badge={ayarlar.sinif ? `${ayarlar.sinif}. Sınıf` : undefined}
                isOpen={openSections.sinif}
                onToggle={() => toggleSection('sinif')}
              />
              <div
                className={`transition-all duration-500 ease-in-out ${openSections.sinif ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
              >
                <div className="px-5 pb-5 pt-1">
                  <div className="bg-[var(--surface-elevated)] p-2 rounded-2xl border border-[var(--border-color)]">
                    <div className="grid grid-cols-4 gap-1.5">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((g) => (
                        <button
                          key={g}
                          onClick={() => setSinif(g)}
                          className={`py-3 rounded-xl text-xs font-black transition-all duration-300 ${ayarlar.sinif === g ? 'bg-[var(--accent-color)] text-[var(--bg-primary)] shadow-lg scale-105 z-10' : 'text-[var(--text-muted)] hover:bg-[var(--bg-paper)] hover:text-[var(--accent-color)] hover:shadow-sm'}`}
                        >
                          {g}.
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Kazanımlar */}
            <div className="bg-[var(--bg-paper)]/60 backdrop-blur-md rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <SectionHeader
                icon="🎯"
                title="Kazanımlar"
                badge={kazanimCount > 0 ? `${kazanimCount} seçildi` : undefined}
                isOpen={openSections.kazanim}
                onToggle={() => toggleSection('kazanim')}
              />
              <div
                className={`transition-all duration-500 ease-in-out ${openSections.kazanim ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
              >
                <div className="px-5 pb-5 pt-1">
                  <KazanimPicker
                    selectedGrade={ayarlar.sinif}
                    selectedUnites={ayarlar.secilenUniteler}
                    selectedKazanimlar={ayarlar.secilenKazanimlar}
                    onUniteChange={setSecilenUniteler}
                    onKazanimChange={setSecilenKazanimlar}
                  />
                </div>
              </div>
            </div>

            {/* Soru Ayarları */}
            <div className="bg-[var(--bg-paper)]/60 backdrop-blur-md rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <SectionHeader
                icon="⚙️"
                title="Soru Ayarları"
                badge={toplamSoru > 0 ? `${toplamSoru} soru` : undefined}
                isOpen={openSections.ayarlar}
                onToggle={() => toggleSection('ayarlar')}
              />
              <div
                className={`transition-all duration-500 ease-in-out ${openSections.ayarlar ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
              >
                <div className="px-5 pb-5 pt-1">
                  {ayarlar.secilenKazanimlar.length > 0 ? (
                    <SoruAyarlari
                      ayarlar={ayarlar}
                      onSoruDagilimiChange={setSoruDagilimi}
                      onOzelKonuChange={(k) => setAyarlar({ ozelKonu: k })}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-[var(--border-color)] rounded-2xl bg-[var(--surface-elevated)]">
                      <div className="w-12 h-12 rounded-full bg-[var(--bg-paper)] flex items-center justify-center mb-3 text-2xl opacity-40">
                        🎯
                      </div>
                      <span className="text-[11px] font-bold text-[var(--text-muted)] text-center px-4 uppercase tracking-wider leading-relaxed">
                        Kazanım haritası tamamlandıktan sonra açılır
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Başarı Anı Mimarisi */}
            <div className="border-b border-slate-100">
              <SectionHeader
                icon="🌟"
                title="Başarı Anı Mimarisi"
                isOpen={openSections.basariMimarisi}
                onToggle={() => toggleSection('basariMimarisi')}
              />
              <div
                className={`transition-all duration-300 ease-in-out ${openSections.basariMimarisi ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
              >
                <div className="px-5 pb-5 pt-1 space-y-2.5 text-xs text-slate-600 font-medium tracking-wide">
                  {[
                    ['🟢', 'İlk 2 soru — Basit ZPD'],
                    ['🟡', '3-4. soru — Kademeli Geçiş'],
                    ['🔴', '5+ — Bağımsız Çalışma'],
                  ].map(([ic, tx]) => (
                    <div
                      key={tx}
                      className="flex items-center gap-3 bg-slate-50/80 px-4 py-2.5 rounded-xl border border-slate-100/50"
                    >
                      <span className="text-base leading-none">{ic}</span>
                      <span>{tx}</span>
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

          {/* AI Sihirbazı & Oluştur Butonu - Oogmatik Premium Style */}
          <div className="flex-none p-5 bg-[var(--bg-paper)]/60 backdrop-blur-2xl border-t border-[var(--border-color)] z-30 relative">
            <button
              onClick={handleGenerateExam}
              disabled={!canGenerate() || isGenerating}
              className={`relative w-full py-5 rounded-2xl font-black text-sm tracking-tight transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden group shadow-2xl ${canGenerate() && !isGenerating ? 'bg-[var(--accent-color)] text-white hover:shadow-lg hover:translate-y-[-4px] active:scale-95 active:translate-y-0' : 'bg-[var(--surface-elevated)] cursor-not-allowed text-[var(--text-muted)] shadow-none'}`}
            >
              {/* Animated Shine Effect */}
              {canGenerate() && !isGenerating && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[150%] skew-x-[-20deg] group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </>
              )}

              {isGenerating ? (
                <div className="flex items-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span className="animate-pulse">AI Motoru Üretiyor...</span>
                </div>
              ) : (
                <>
                  <span className="text-lg">✨</span>
                  <span className="uppercase tracking-widest">Sınavı Oluştur</span>
                  <i className="fa-solid fa-chevron-right text-[10px] opacity-70 group-hover:translate-x-1 transition-transform"></i>
                </>
              )}
            </button>

            {/* Requirement Checklist Helper */}
            <div className="mt-4 grid grid-cols-2 gap-1.5">
              <div
                className={`flex items-center gap-1.5 text-[9px] font-bold px-2 py-1.5 rounded-lg border transition-all ${ayarlar.sinif !== null ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border-color)] opacity-50'}`}
              >
                <i
                  className={`fa-solid ${ayarlar.sinif !== null ? 'fa-check-circle' : 'fa-circle'}`}
                ></i>
                <span>SINIF SEÇİMİ</span>
              </div>
              <div
                className={`flex items-center gap-1.5 text-[9px] font-bold px-2 py-1.5 rounded-lg border transition-all ${kazanimCount > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border-color)] opacity-50'}`}
              >
                <i className={`fa-solid ${kazanimCount > 0 ? 'fa-check-circle' : 'fa-circle'}`}></i>
                <span>KAZANIMLAR</span>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ PANEL */}
        <div className="lg:col-span-9 flex flex-col overflow-hidden">
          {/* Ana Actions Toolbar */}
          <div className="flex-none bg-white/40 backdrop-blur-3xl border-b border-white/60 px-6 py-3 flex flex-wrap items-center justify-between gap-4 z-10 transition-all duration-300">
            <div className="flex bg-slate-200/50 p-1 rounded-2xl backdrop-blur-md">
              {(['onizleme', 'cevap-anahtari'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  disabled={!aktifSinav}
                  className={`px-5 py-2 rounded-xl font-bold text-xs transition-all duration-300 ${activeTab === tab ? 'bg-white text-indigo-700 shadow-lg shadow-indigo-100 scale-105' : aktifSinav ? 'text-slate-500 hover:text-indigo-600' : 'text-slate-300 cursor-not-allowed'}`}
                >
                  {tab === 'onizleme' ? (
                    <span className="flex items-center gap-2">
                      👁️ <span className="hidden sm:inline">Önizleme</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ✓ <span className="hidden sm:inline">Cevap Anahtarı</span>
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={handleSaveExam}
                disabled={!aktifSinav}
                className={`toolbar-btn bg-white/80 border-2 border-white text-slate-600 hover:bg-indigo-600 hover:text-white shadow-sm hover:shadow-lg backdrop-blur-md hover:translate-y-[-2px]`}
              >
                <span className="text-base">💾</span>
                <span className="hidden lg:inline">Kaydet</span>
              </button>
              <button
                onClick={() => aktifSinav && setIsShareModalOpen(true)}
                disabled={!aktifSinav}
                className={`toolbar-btn bg-white/80 border-2 border-white text-slate-600 hover:bg-purple-600 hover:text-white shadow-sm hover:shadow-lg backdrop-blur-md hover:translate-y-[-2px]`}
              >
                <span className="text-base">🔗</span>
                <span className="hidden lg:inline">Paylaş</span>
              </button>
              <button
                onClick={handleAddToWorkbook}
                disabled={!aktifSinav || isSavingToWorkbook}
                className="toolbar-btn bg-emerald-600 text-white border-none shadow-lg shadow-emerald-100 hover:bg-emerald-700 hover:translate-y-[-2px] active:scale-95"
              >
                {isSavingToWorkbook ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Kaydediliyor...</span>
                  </>
                ) : (
                  <>
                    <span className="text-base">📚</span>
                    <span className="hidden sm:inline">Kitapçık</span>
                  </>
                )}
              </button>
              <div className="w-px h-8 bg-slate-300 mx-2 self-center opacity-40"></div>
              <button
                onClick={handlePrint}
                disabled={!aktifSinav}
                className="toolbar-btn bg-slate-900 text-white border-none shadow-lg hover:bg-black hover:translate-y-[-2px]"
              >
                <span className="text-base">🖨️</span>
                <span className="hidden sm:inline">Yazdır</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={!aktifSinav}
                className="toolbar-btn bg-rose-600 text-white border-none shadow-lg shadow-rose-100 hover:bg-rose-700 hover:translate-y-[-2px]"
              >
                <span className="text-base">📄</span>İndir
              </button>
            </div>
          </div>

          {/* Format Settings Sub-Toolbar */}
          {aktifSinav && activeTab === 'onizleme' && (
            <div className="flex-none bg-indigo-50/40 backdrop-blur-3xl border-b border-indigo-100/50 px-6 py-2.5 flex flex-wrap items-center gap-x-8 gap-y-3 z-0 anim-slide-in shadow-[inset_0_8px_16px_-8px_rgba(0,0,0,0.05)]">
              <div className="flex items-center gap-2 bg-white/40 p-1 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
                <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest pl-2 pr-1">
                  Tasarım
                </span>
                <FmtBtn
                  active={printConfig.fontFamily === 'helvetica'}
                  onClick={() => updateConfig('fontFamily', 'helvetica')}
                  title="Inter Fontu"
                >
                  Inter
                </FmtBtn>
                <FmtBtn
                  active={printConfig.fontFamily === 'times'}
                  onClick={() => updateConfig('fontFamily', 'times')}
                  title="Times New Roman"
                >
                  Times
                </FmtBtn>
                <div className="w-px h-5 bg-indigo-200/50 mx-1"></div>
                {([9, 10, 11, 12] as const).map((s) => (
                  <FmtBtn
                    key={s}
                    active={printConfig.fontSize === s}
                    onClick={() => updateConfig('fontSize', s)}
                    title={`${s} Punto`}
                  >
                    {s}pt
                  </FmtBtn>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-white/40 p-1 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
                <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest pl-2 pr-1">
                  Yerleşim
                </span>
                <FmtBtn
                  active={printConfig.marginMm === 10}
                  onClick={() => updateConfig('marginMm', 10)}
                  title="Dar Kenar Boşluğu (10mm)"
                  icon="⤢"
                >
                  Dar
                </FmtBtn>
                <FmtBtn
                  active={printConfig.marginMm === 18}
                  onClick={() => updateConfig('marginMm', 18)}
                  title="Normal Kenar Boşluğu (18mm)"
                  icon="◻️"
                >
                  Orta
                </FmtBtn>
                <FmtBtn
                  active={printConfig.marginMm === 25}
                  onClick={() => updateConfig('marginMm', 25)}
                  title="Geniş Kenar Boşluğu (25mm)"
                  icon="⤡"
                >
                  Geniş
                </FmtBtn>
                <div className="w-px h-5 bg-indigo-200/50 mx-1"></div>
                <FmtBtn
                  active={printConfig.columns === 1}
                  onClick={() => updateConfig('columns', 1)}
                  icon="📄"
                >
                  Tek
                </FmtBtn>
                <FmtBtn
                  active={printConfig.columns === 2}
                  onClick={() => updateConfig('columns', 2)}
                  icon="📖"
                >
                  Çift
                </FmtBtn>
              </div>

              <div className="flex items-center gap-2 bg-white/40 p-1 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
                <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest pl-2 pr-1">
                  Metin
                </span>
                <FmtBtn
                  active={printConfig.textAlign === 'left'}
                  onClick={() => updateConfig('textAlign', 'left')}
                  title="Sola Dayalı"
                  icon="⫷"
                >
                  Sola
                </FmtBtn>
                <FmtBtn
                  active={printConfig.textAlign === 'justify'}
                  onClick={() => updateConfig('textAlign', 'justify')}
                  title="İki Yana Yasla"
                  icon="⫹"
                >
                  Yasla
                </FmtBtn>
                <div className="w-px h-5 bg-indigo-200/50 mx-1"></div>
                <FmtBtn
                  active={printConfig.lineHeight === 1.4}
                  onClick={() => updateConfig('lineHeight', 1.4)}
                  title="Sıkı Satır"
                >
                  1.4
                </FmtBtn>
                <FmtBtn
                  active={printConfig.lineHeight === 1.6}
                  onClick={() => updateConfig('lineHeight', 1.6)}
                  title="Normal Satır"
                >
                  1.6
                </FmtBtn>
                <FmtBtn
                  active={printConfig.lineHeight === 1.8}
                  onClick={() => updateConfig('lineHeight', 1.8)}
                  title="Ayrık Satır"
                >
                  1.8
                </FmtBtn>
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
          <div ref={printRef} className="flex-1 overflow-y-auto custom-scrollbar bg-slate-100/30">
            <div className="p-8 lg:p-12 min-h-full flex justify-center">
              {aktifSinav ? (
                <div className="anim-fade-in w-full max-w-[900px]">
                  {activeTab === 'onizleme' ? (
                    <div className="shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] rounded-2xl overflow-hidden ring-1 ring-white/60">
                      <SinavOnizleme sinav={aktifSinav} showAnswers={false} config={printConfig} />
                    </div>
                  ) : (
                    <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/60">
                      <CevapAnahtariComponent
                        cevapAnahtari={aktifSinav.cevapAnahtari}
                        sinavBaslik={aktifSinav.baslik}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-32 text-slate-300 space-y-6">
                  <div className="w-32 h-32 bg-white/40 backdrop-blur-xl rounded-full flex items-center justify-center shadow-xl border border-white/60 group">
                    <span className="text-6xl opacity-30 group-hover:scale-110 transition-transform duration-500">
                      📝
                    </span>
                  </div>
                  <div className="text-center group">
                    <p className="text-lg font-black text-slate-400 tracking-tight transition-colors group-hover:text-indigo-500">
                      Önizleme Alanı
                    </p>
                    <p className="text-sm text-slate-400 mt-2 font-medium max-w-xs mx-auto leading-relaxed">
                      Lütfen sol panelden sınıf ve kazanımları seçin, ardından sınavınızı üretin.
                    </p>

                    <div className="mt-8 flex flex-col items-center gap-4">
                      <button
                        onClick={handleGenerateExam}
                        disabled={!canGenerate() || isGenerating}
                        className={`px-8 py-4 rounded-2xl font-black text-sm tracking-tight text-white transition-all duration-500 flex items-center gap-3 shadow-2xl ${canGenerate() && !isGenerating ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 hover:shadow-indigo-300' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}
                      >
                        {isGenerating ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
                              viewBox="0 0 24 24"
                              fill="none"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            <span>AI Üretiyor...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-xl">✨</span>
                            <span>YAPAY ZEKA İLE ŞİMDİ ÜRET</span>
                          </>
                        )}
                      </button>

                      {!canGenerate() && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
                          <i className="fa-solid fa-circle-exclamation animate-pulse"></i>
                          <span>Henüz Sınıf/Kazanım Seçilmedi</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Paylaşım Modalı */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onShare={handleShareExam}
        worksheetId={aktifSinav?.id || ''}
        worksheetTitle={aktifSinav?.baslik || 'Türkçe Sınavı'}
        isSending={isSharing}
      />

      <style>{`
        .toolbar-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.5rem 1rem; border-radius: 1rem;
          font-weight: 800; font-size: 0.75rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .toolbar-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.3); }
        .anim-fade-in { animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        .anim-slide-in { animation: slideIn 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards; }
        @keyframes fadeIn { from { opacity:0; transform:scale(0.98) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateY(-20px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
};
