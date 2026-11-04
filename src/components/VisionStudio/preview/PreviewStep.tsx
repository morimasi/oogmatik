// ============================================================
// VisionStudio — A4 Önizleme + Yazdırma Bileşeni
// Önizleme, PDF ve yazdırma AYNI render bileşeninden çıkar.
// ============================================================
import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, Download } from 'lucide-react';
import type { GeneratedActivity, ActivitySection } from '../../../types/visionStudio';

interface A4PreviewProps {
  activity: GeneratedActivity;
  showAnswerKey?: boolean;
}

// ---- A4 Sayfa bileşeni (hem ekran hem yazdırma) ----
const A4Page = React.forwardRef<HTMLDivElement, { activity: GeneratedActivity; showAnswerKey: boolean }>(
  ({ activity, showAnswerKey }, ref) => {
    return (
      <div
        ref={ref}
        className="
          bg-white text-slate-900 font-[Lexend]
          w-[210mm] min-h-[297mm]
          px-[15mm] py-[15mm]
          print:shadow-none print:m-0 print:p-[15mm]
        "
        style={{ fontFamily: 'Lexend, sans-serif' }}
      >
        {/* Üst Bilgi */}
        <div className="border-b-2 border-slate-200 pb-4 mb-6">
          <h1 className="text-xl font-bold text-slate-800 leading-tight">{activity.title}</h1>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-500">
            <span>📚 {activity.subject}</span>
            <span>🎓 {activity.grade}</span>
            <span>⏱ {activity.durationMinutes} dk</span>
            <span>
              {activity.difficulty === 'kolay' ? '🟢' : activity.difficulty === 'orta' ? '🟡' : '🔴'}{' '}
              {activity.difficulty.charAt(0).toUpperCase() + activity.difficulty.slice(1)}
            </span>
          </div>
          {activity.instructions && (
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">{activity.instructions}</p>
          )}
        </div>

        {/* Bölümler */}
        <div className="space-y-6">
          {activity.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
        </div>

        {/* Cevap Anahtarı (öğrenci çıktısında gizli) */}
        {showAnswerKey && activity.answerKey.length > 0 && (
          <div className="mt-10 border-t-2 border-dashed border-slate-200 pt-6 print:break-before-page">
            <h2 className="text-base font-bold text-slate-700 mb-4">Cevap Anahtarı</h2>
            <div className="space-y-2">
              {activity.answerKey.map((ak, i) => (
                <div key={ak.sectionId} className="text-sm">
                  <span className="font-semibold text-slate-700">{i + 1}.</span>{' '}
                  <span className="text-slate-800">{ak.answer}</span>
                  {ak.explanation && (
                    <span className="text-slate-500"> — {ak.explanation}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pedagojik Not (yalnızca öğretmen çıktısında) */}
        {showAnswerKey && activity.pedagogicalNote && (
          <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4 print:break-inside-avoid">
            <p className="text-xs font-semibold text-indigo-700 mb-1">📋 Öğretmen Notu</p>
            <p className="text-xs text-indigo-600 leading-relaxed">{activity.pedagogicalNote}</p>
          </div>
        )}

        {/* Alt Bilgi */}
        <div className="mt-auto pt-10 text-center text-xs text-slate-300 print:fixed print:bottom-[8mm] print:w-full">
          bdmind • {activity.grade} • {new Date(activity.createdAt).toLocaleDateString('tr-TR')}
        </div>
      </div>
    );
  }
);
A4Page.displayName = 'A4Page';

// ---- Bölüm render yönlendirici ----
function SectionRenderer({ section }: { section: ActivitySection }) {
  switch (section.content.type) {
    case 'text':
    case 'instruction':
      return (
        <div className="break-inside-avoid">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-2">{section.title}</h3>
          )}
          <p className="text-sm text-slate-700 leading-relaxed">{section.content.text}</p>
        </div>
      );

    case 'question':
      return (
        <div className="break-inside-avoid">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-2">{section.title}</h3>
          )}
          <p className="text-sm text-slate-700 mb-3">{section.content.questionText}</p>
          {section.content.options && (
            <ul className="space-y-1 ml-2">
              {section.content.options.map((opt, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full border border-slate-300 text-xs font-bold text-slate-500 flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </li>
              ))}
            </ul>
          )}
        </div>
      );

    case 'fillInTheBlank':
      return (
        <div className="break-inside-avoid">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-2">{section.title}</h3>
          )}
          <p className="text-sm text-slate-700 leading-loose">{section.content.sentence}</p>
        </div>
      );

    case 'matching':
      return (
        <div className="break-inside-avoid">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-2">{section.title}</h3>
          )}
          <div className="grid grid-cols-2 gap-x-8 gap-y-1">
            <div className="space-y-1">
              {section.content.pairs.map((p, i) => (
                <p key={i} className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-500 mr-2">{i + 1}.</span>
                  {p.left}
                </p>
              ))}
            </div>
            <div className="space-y-1">
              {[...section.content.pairs].sort(() => Math.random() - 0.5).map((p, i) => (
                <p key={i} className="text-sm text-slate-700">
                  <span className="font-semibold text-slate-500 mr-2">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {p.right}
                </p>
              ))}
            </div>
          </div>
        </div>
      );

    case 'table':
      return (
        <div className="break-inside-avoid overflow-x-auto">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-2">{section.title}</h3>
          )}
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {section.content.headers.map((h, i) => (
                  <th key={i} className="border border-slate-300 bg-slate-50 px-3 py-1.5 text-left text-xs font-bold text-slate-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.content.rows.map((row, ri) => (
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

    case 'image':
      return (
        <div className="break-inside-avoid text-center">
          {section.title && (
            <h3 className="text-sm font-bold text-slate-700 mb-2">{section.title}</h3>
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

    case 'pageBreak':
      return <div className="print:break-before-page" aria-hidden="true" />;

    default:
      return null;
  }
}

// ---- Ana PreviewStep bileşeni ----
interface PreviewStepProps {
  activity: GeneratedActivity;
  onSendForApproval: () => void;
  isSending: boolean;
}

export default function PreviewStep({ activity, onSendForApproval, isSending }: PreviewStepProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [showAnswerKey, setShowAnswerKey] = React.useState(false);

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

  return (
    <div className="flex gap-6 h-full">
      {/* Sol: Araç çubuğu */}
      <aside className="w-56 flex-shrink-0 flex flex-col gap-3">
        <h2 className="font-bold text-slate-700 dark:text-slate-200 text-sm uppercase tracking-wide mb-2">
          Araçlar
        </h2>

        {/* Cevap anahtarı toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showAnswerKey}
            onChange={(e) => setShowAnswerKey(e.target.checked)}
            className="rounded border-slate-300"
          />
          Cevap Anahtarı
        </label>

        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          aria-label="Yazdır"
        >
          <Printer className="h-4 w-4" />
          Yazdır
        </button>

        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          aria-label="PDF indir"
        >
          <Download className="h-4 w-4" />
          PDF İndir
        </button>

        <div className="border-t border-slate-200 dark:border-slate-700 my-2" />

        <button
          onClick={onSendForApproval}
          disabled={isSending}
          className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors"
          aria-label="Onaya gönder"
        >
          {isSending ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Gönderiliyor…
            </>
          ) : (
            '✅ Onaya Gönder'
          )}
        </button>

        {/* Etkinlik meta bilgi */}
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p><strong>Kategori:</strong> {activity.category}</p>
          <p><strong>Zorluk:</strong> {activity.difficulty}</p>
          <p><strong>Süre:</strong> {activity.durationMinutes} dk</p>
          <p><strong>Bölüm sayısı:</strong> {activity.sections.length}</p>
        </div>
      </aside>

      {/* Sağ: A4 önizleme */}
      <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-900 rounded-2xl p-6">
        <div className="shadow-lg rounded-sm mx-auto" style={{ width: 'fit-content' }}>
          <A4Page ref={printRef} activity={activity} showAnswerKey={showAnswerKey} />
        </div>
      </div>
    </div>
  );
}
