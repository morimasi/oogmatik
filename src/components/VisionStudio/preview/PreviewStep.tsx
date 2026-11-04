// ============================================================
// VisionStudio — A4 Canlı Önizleme + Tıkla-Düzenle (Inline Edit) + react-to-print
// Önizleme, PDF ve yazdırma AYNI render bileşeninden çıkar.
// ============================================================
import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Download, Pencil, Check, Eye, Sparkles } from 'lucide-react';
import type { GeneratedActivity, ActivitySection } from '../../../types/visionStudio';
import { useVisionStudioStore } from '../../../store/useVisionStudioStore';

interface PreviewStepProps {
  activity: GeneratedActivity;
  onSendForApproval: () => void;
  isSending: boolean;
}

function safeDateLabel(value: unknown): string {
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('tr-TR');
  }
  if (value && typeof value === 'object' && 'toDate' in value) {
    const toDate = (value as { toDate?: () => Date }).toDate;
    if (typeof toDate === 'function') return toDate.call(value).toLocaleDateString('tr-TR');
  }
  return '';
}

function safePdfFileName(title: string): string {
  const cleaned = title
    .replace(/[^\p{L}\p{N}\- _]/gu, '')
    .trim()
    .replace(/\s+/g, '-');
  return `${cleaned || 'vision-etkinlik'}.pdf`;
}

/**
 * A4 önizleme düğümünü gerçek bir PDF dosyasına çevirir.
 * html2canvas + jsPDF yalnızca gerektiğinde dinamik yüklenir.
 */
interface PdfDocument {
  addImage: (data: string, format: string, x: number, y: number, w: number, h: number) => void;
  addPage: () => void;
  save: (name: string) => void;
}

interface PdfConstructor {
  new (options: { orientation: 'portrait'; unit: 'mm'; format: 'a4' }): PdfDocument;
}

async function exportNodeToPdf(node: HTMLElement, title: string): Promise<void> {
  const [{ default: html2canvas }, jsPdfModule] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  // jspdf paketinin tip tanımı named export'u bildirmiyor; runtime'da "jsPDF" sınıfı mevcut.
  const JsPDF = (jsPdfModule as unknown as { jsPDF: PdfConstructor }).jsPDF;

  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.92);
  const pdf = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * pageWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(safePdfFileName(title));
}

// ---- Satır İçi Düzenleme (Inline Editable) Bileşeni ----
interface InlineEditableProps {
  value: string;
  onSave: (val: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  isEditMode: boolean;
}

function InlineEditable({
  value,
  onSave,
  className = '',
  multiline = false,
  placeholder = 'Metin girin…',
  isEditMode,
}: InlineEditableProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const handleCommit = () => {
    setIsEditing(false);
    if (draft.trim() !== value) {
      onSave(draft);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!multiline && e.key === 'Enter') {
      handleCommit();
    }
    if (e.key === 'Escape') {
      setDraft(value);
      setIsEditing(false);
    }
  };

  if (!isEditMode) {
    return <span className={className}>{value || placeholder}</span>;
  }

  if (isEditing) {
    return multiline ? (
      <textarea
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        className={`w-full p-2 border-2 border-indigo-500 rounded-lg bg-indigo-50/20 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-y ${className}`}
        rows={3}
      />
    ) : (
      <input
        autoFocus
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        className={`w-full px-2 py-1 border-2 border-indigo-500 rounded-md bg-indigo-50/20 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => {
        setDraft(value);
        setIsEditing(true);
      }}
      title="Düzenlemek için tıklayın"
      className={`group relative cursor-pointer hover:bg-indigo-50/60 rounded px-1 transition-colors ${className}`}
    >
      {value || <span className="text-slate-400 italic">{placeholder}</span>}
      <Pencil className="inline-block ml-1 h-3.5 w-3.5 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
    </span>
  );
}

// ---- A4 Sayfa Bileşeni (Hem ekran hem yazdırma motoru) ----
export interface A4PageProps {
  activity: GeneratedActivity;
  showAnswerKey: boolean;
  isEditMode: boolean;
  onUpdateTitle?: (title: string) => void;
  onUpdateInstructions?: (instructions: string) => void;
  onUpdateSection?: (sectionId: string, patch: Partial<ActivitySection>) => void;
  onUpdatePedagogicalNote?: (note: string) => void;
}

export const A4Page = React.forwardRef<HTMLDivElement, A4PageProps>(
  (
    {
      activity,
      showAnswerKey,
      isEditMode,
      onUpdateTitle,
      onUpdateInstructions,
      onUpdateSection,
      onUpdatePedagogicalNote,
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className="
          flex flex-col
          bg-white text-slate-900 font-[Lexend]
          w-[210mm] min-h-[297mm]
          px-[16mm] py-[16mm]
          print:shadow-none print:m-0 print:p-[16mm]
        "
        style={{ fontFamily: 'Lexend, sans-serif' }}
      >
        {/* Üst Bilgi Başlığı */}
        <div className="border-b-2 border-slate-200 pb-4 mb-6">
          <h1 className="text-xl font-bold text-slate-800 leading-tight">
            <InlineEditable
              value={activity.title}
              onSave={onUpdateTitle ?? (() => {})}
              isEditMode={isEditMode}
              className="text-xl font-bold text-slate-800"
            />
          </h1>

          <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
            <span>📚 {activity.subject}</span>
            <span>🎓 {activity.grade}</span>
            <span>⏱ {activity.durationMinutes} dk</span>
            <span>
              {activity.difficulty === 'kolay' ? '🟢' : activity.difficulty === 'orta' ? '🟡' : '🔴'}{' '}
              {activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
            </span>
            <span className="text-indigo-600 font-medium">🏷️ {activity.category}</span>
          </div>

          <div className="mt-3 text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
            <span className="font-semibold text-slate-700 mr-1">Yönerge:</span>
            <InlineEditable
              value={activity.instructions}
              onSave={onUpdateInstructions ?? (() => {})}
              multiline
              isEditMode={isEditMode}
              className="text-sm text-slate-600"
            />
          </div>
        </div>

        {/* Bölümler */}
        <div className="space-y-6">
          {(activity.sections ?? []).map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              isEditMode={isEditMode}
              onUpdateSection={(patch) => onUpdateSection?.(section.id, patch)}
            />
          ))}
        </div>

        {/* Cevap Anahtarı (Öğrenci çıktısında varsayılan olarak gizli) */}
        {showAnswerKey && (activity.answerKey ?? []).length > 0 && (
          <div className="mt-10 border-t-2 border-dashed border-slate-200 pt-6 print:break-before-page">
            <h2 className="text-base font-bold text-slate-700 mb-3">🔑 Cevap Anahtarı</h2>
            <div className="space-y-2">
              {(activity.answerKey ?? []).map((ak, i) => (
                <div key={ak.sectionId} className="text-sm">
                  <span className="font-semibold text-slate-700">{i + 1}.</span>{' '}
                  <span className="text-slate-800 font-medium">{ak.answer}</span>
                  {ak.explanation && (
                    <span className="text-slate-500"> — {ak.explanation}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedagojik Öğretmen Notu */}
        {showAnswerKey && (
          <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4 print:break-inside-avoid">
            <p className="text-xs font-bold text-indigo-700 mb-1">📋 Pedagojik Öğretmen Notu (ZPD & Disleksi Desteği)</p>
            <InlineEditable
              value={activity.pedagogicalNote}
              onSave={onUpdatePedagogicalNote ?? (() => {})}
              multiline
              isEditMode={isEditMode}
              className="text-xs text-indigo-600 leading-relaxed"
            />
          </div>
        )}

        {/* Alt Bilgi */}
        <div className="mt-auto pt-10 text-center text-xs text-slate-300 print:fixed print:bottom-[8mm] print:w-full">
          bdmind Ultra Etkinlik • {activity.grade} • {safeDateLabel(activity.createdAt)}
        </div>
      </div>
    );
  }
);
A4Page.displayName = 'A4Page';

// ---- Bölüm Render ve Düzenleme Yönlendiricisi ----
interface SectionRendererProps {
  section: ActivitySection;
  isEditMode: boolean;
  onUpdateSection: (patch: Partial<ActivitySection>) => void;
}

function SectionRenderer({ section, isEditMode, onUpdateSection }: SectionRendererProps) {
  const updateTitle = (title: string) => onUpdateSection({ title });

  switch (section.content.type) {
    case 'text': {
      const textVal = section.content.text;
      return (
        <div className="break-inside-avoid">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-1">
              <InlineEditable value={section.title} onSave={updateTitle} isEditMode={isEditMode} />
            </h3>
          )}
          <p className="text-sm text-slate-700 leading-relaxed">
            <InlineEditable
              value={textVal}
              multiline
              onSave={(newText) =>
                onUpdateSection({ content: { type: 'text', text: newText } })
              }
              isEditMode={isEditMode}
            />
          </p>
        </div>
      );
    }

    case 'instruction': {
      const textVal = section.content.text;
      return (
        <div className="break-inside-avoid">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-1">
              <InlineEditable value={section.title} onSave={updateTitle} isEditMode={isEditMode} />
            </h3>
          )}
          <p className="text-sm text-slate-700 leading-relaxed">
            <InlineEditable
              value={textVal}
              multiline
              onSave={(newText) =>
                onUpdateSection({ content: { type: 'instruction', text: newText } })
              }
              isEditMode={isEditMode}
            />
          </p>
        </div>
      );
    }

    case 'question': {
      const qContent = section.content;
      return (
        <div className="break-inside-avoid">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-1">
              <InlineEditable value={section.title} onSave={updateTitle} isEditMode={isEditMode} />
            </h3>
          )}
          <p className="text-sm text-slate-800 font-medium mb-3">
            <InlineEditable
              value={qContent.questionText}
              multiline
              onSave={(newQ) =>
                onUpdateSection({ content: { ...qContent, questionText: newQ } })
              }
              isEditMode={isEditMode}
            />
          </p>
          {qContent.options && (
            <ul className="space-y-1.5 ml-2">
              {qContent.options.map((opt, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full border border-slate-300 text-xs font-bold text-slate-500 flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <InlineEditable
                    value={opt}
                    onSave={(newOpt) => {
                      const nextOpts = [...(qContent.options ?? [])];
                      nextOpts[i] = newOpt;
                      onUpdateSection({ content: { ...qContent, options: nextOpts } });
                    }}
                    isEditMode={isEditMode}
                    className="flex-1"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }

    case 'fillInTheBlank': {
      const fbContent = section.content;
      return (
        <div className="break-inside-avoid">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-1">
              <InlineEditable value={section.title} onSave={updateTitle} isEditMode={isEditMode} />
            </h3>
          )}
          <p className="text-sm text-slate-700 leading-loose">
            <InlineEditable
              value={fbContent.sentence}
              multiline
              onSave={(newSentence) =>
                onUpdateSection({ content: { ...fbContent, sentence: newSentence } })
              }
              isEditMode={isEditMode}
            />
          </p>
        </div>
      );
    }

    case 'matching': {
      const mContent = section.content;
      return (
        <div className="break-inside-avoid">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-2">
              <InlineEditable value={section.title} onSave={updateTitle} isEditMode={isEditMode} />
            </h3>
          )}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            <div className="space-y-2">
              {mContent.pairs.map((p, i) => (
                <p key={i} className="text-sm text-slate-700 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-400 text-xs w-4">{i + 1}.</span>
                  <InlineEditable
                    value={p.left}
                    onSave={(val) => {
                      const nextPairs = [...mContent.pairs];
                      nextPairs[i] = { ...nextPairs[i], left: val };
                      onUpdateSection({ content: { ...mContent, pairs: nextPairs } });
                    }}
                    isEditMode={isEditMode}
                  />
                </p>
              ))}
            </div>
            <div className="space-y-2">
              {mContent.pairs.map((p, i) => (
                <p key={i} className="text-sm text-slate-700 flex items-center gap-1.5">
                  <span className="font-semibold text-slate-400 text-xs w-4">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <InlineEditable
                    value={p.right}
                    onSave={(val) => {
                      const nextPairs = [...mContent.pairs];
                      nextPairs[i] = { ...nextPairs[i], right: val };
                      onUpdateSection({ content: { ...mContent, pairs: nextPairs } });
                    }}
                    isEditMode={isEditMode}
                  />
                </p>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'table': {
      const tContent = section.content;
      return (
        <div className="break-inside-avoid overflow-x-auto">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-2">
              <InlineEditable value={section.title} onSave={updateTitle} isEditMode={isEditMode} />
            </h3>
          )}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {tContent.headers.map((h, i) => (
                  <th
                    key={i}
                    className="border border-slate-300 bg-slate-50 px-3 py-1.5 text-left text-xs font-bold text-slate-700"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tContent.rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-slate-50'}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-slate-200 px-3 py-1.5 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'image': {
      return (
        <div className="break-inside-avoid text-center">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-2">
              <InlineEditable value={section.title} onSave={updateTitle} isEditMode={isEditMode} />
            </h3>
          )}
          <img
            src={section.content.url}
            alt={section.content.alt}
            className="max-w-full max-h-64 object-contain mx-auto rounded"
            style={{ printColorAdjust: 'exact' } as React.CSSProperties}
          />
          {section.content.caption && (
            <p className="text-xs text-slate-400 mt-1">{section.content.caption}</p>
          )}
        </div>
      );
    }

    case 'pageBreak':
      return <div className="print:break-before-page" aria-hidden="true" />;

    default:
      return null;
  }
}

// ---- Ana PreviewStep Bileşeni ----
export default function PreviewStep({ activity, onSendForApproval, isSending }: PreviewStepProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const { generatedActivities, selectedActivityId, selectActivity, updateActivity } =
    useVisionStudioStore();

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: activity.title,
    pageStyle: `
      @page { size: A4; margin: 0; }
      @media print {
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `,
  });

  const handleDownloadPdf = async () => {
    const node = printRef.current;
    if (!node || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    setPdfError(null);
    try {
      await exportNodeToPdf(node, activity.title);
    } catch (err: unknown) {
      setPdfError(
        err instanceof Error
          ? `PDF olusturulamadi: ${err.message}`
          : 'PDF olusturulamadi. Lutfen tekrar deneyin.'
      );
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleUpdateTitle = (title: string) => {
    updateActivity(activity.id, { title });
  };

  const handleUpdateInstructions = (instructions: string) => {
    updateActivity(activity.id, { instructions });
  };

  const handleUpdatePedagogicalNote = (pedagogicalNote: string) => {
    updateActivity(activity.id, { pedagogicalNote });
  };

  const handleUpdateSection = (sectionId: string, patch: Partial<ActivitySection>) => {
    const nextSections = activity.sections.map((s) =>
      s.id === sectionId ? { ...s, ...patch } : s
    );
    updateActivity(activity.id, { sections: nextSections });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Üst Varyasyon Değiştirici (Birden fazla üretildiyse) */}
      {generatedActivities.length > 1 && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Varyasyonlar:
            </span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {generatedActivities.map((act, idx) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => selectActivity(act.id)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    act.id === selectedActivityId
                      ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Varyasyon {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="text-xs text-slate-400">
            İstediğiniz varyasyonda düzenleme yapıp tek tıkla onaya gönderebilirsiniz.
          </div>
        </div>
      )}

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sol Araç Çubuğu */}
        <aside className="w-60 flex-shrink-0 flex flex-col gap-3">
          <h2 className="font-bold text-slate-700 dark:text-slate-200 text-xs uppercase tracking-wider">
            Düzenleme &amp; Çıktı
          </h2>

          {/* Tıkla-Düzenle Toggle Butonu */}
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
              isEditMode
                ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            <span className="flex items-center gap-2">
              {isEditMode ? <Pencil className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {isEditMode ? 'Düzenleme Açık' : 'Yalnızca Önizleme'}
            </span>
            <span
              className={`w-2 h-2 rounded-full ${
                isEditMode ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'
              }`}
            />
          </button>

          {isEditMode && (
            <p className="text-[11px] text-slate-400 px-1 leading-snug">
              💡 Sayfadaki başlık, yönerge ve sorulara doğrudan tıklayarak düzenleyebilirsiniz.
            </p>
          )}

          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          {/* Cevap Anahtarı Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300 px-1">
            <input
              type="checkbox"
              checked={showAnswerKey}
              onChange={(e) => setShowAnswerKey(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Cevap Anahtarı ve Notlar
          </label>

          <button
            type="button"
            onClick={() => handlePrint()}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors shadow-sm"
            aria-label="Yazdır"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            Yazdır (A4 Çıktı)
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors shadow-sm"
            aria-label="PDF indir"
          >
            {isDownloadingPdf ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                PDF Hazırlanıyor…
              </>
            ) : (
              <>
                <Download className="h-4 w-4 text-slate-500" />
                PDF Olarak Kaydet
              </>
            )}
          </button>

          {pdfError && (
            <p role="alert" className="text-[11px] text-red-600 dark:text-red-400 leading-snug px-1">
              {pdfError}
            </p>
          )}

          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          <button
            type="button"
            onClick={onSendForApproval}
            disabled={isSending}
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl px-4 py-3 text-xs font-bold transition-colors shadow-md shadow-indigo-600/20"
            aria-label="Onaya gönder"
          >
            {isSending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Gönderiliyor…
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Yönetici Onayına Gönder
              </>
            )}
          </button>

          {/* Etkinlik Meta Özeti */}
          <div className="mt-auto p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
            <p><strong>Ders:</strong> {activity.subject}</p>
            <p><strong>Sınıf:</strong> {activity.grade}</p>
            <p><strong>Zorluk:</strong> {activity.difficulty}</p>
            <p><strong>Süre:</strong> {activity.durationMinutes} dk</p>
            <p><strong>Bölüm Sayısı:</strong> {activity.sections.length}</p>
          </div>
        </aside>

        {/* Sağ A4 Canlı Önizleme Tuvali */}
        <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800">
          <div className="shadow-2xl rounded-sm mx-auto" style={{ width: 'fit-content' }}>
            <A4Page
              ref={printRef}
              activity={activity}
              showAnswerKey={showAnswerKey}
              isEditMode={isEditMode}
              onUpdateTitle={handleUpdateTitle}
              onUpdateInstructions={handleUpdateInstructions}
              onUpdateSection={handleUpdateSection}
              onUpdatePedagogicalNote={handleUpdatePedagogicalNote}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
