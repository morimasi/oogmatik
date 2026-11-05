// ============================================================
// VisionStudio — A4 Canlı Önizleme + Ordinaryüs A4 Düzenleyici
// - Çok modlu baskı motoru (Öğrenci çıktısı, Öğretmen/Çözümlü, Eko S/B)
// - Öğrenci Sınav/Ödev Başlık Bloğu (Ad, Soyad, Sınıf, Tarih, Puan)
// - Dinamik Bölüm Yönetimi (Bölüm Ekle, Sil, Sırala, Puanla)
// - Uygulama İçi Yayınla & Paylaş Merkezi (Topluluk, Öğrenciye Ata, WhatsApp)
// ============================================================
import React, { useRef, useState, useMemo } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  Printer,
  Download,
  Pencil,
  Check,
  Eye,
  Sparkles,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Share2,
  FileCheck2,
  UserCheck,
  Award,
} from 'lucide-react';
import { v4 as uuid } from 'uuid';
import type { GeneratedActivity, ActivitySection, SectionType } from '../../../types/visionStudio';
import { useVisionStudioStore } from '../../../store/useVisionStudioStore';
import { SharePublishModal } from './SharePublishModal';

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
  showStudentHeader?: boolean;
  ecoPrint?: boolean;
  onUpdateTitle?: (title: string) => void;
  onUpdateInstructions?: (instructions: string) => void;
  onUpdateSection?: (sectionId: string, patch: Partial<ActivitySection>) => void;
  onDeleteSection?: (sectionId: string) => void;
  onMoveSectionUp?: (index: number) => void;
  onMoveSectionDown?: (index: number) => void;
  onAddSection?: (type: SectionType) => void;
  onUpdatePedagogicalNote?: (note: string) => void;
}

export const A4Page = React.forwardRef<HTMLDivElement, A4PageProps>(
  (
    {
      activity,
      showAnswerKey,
      isEditMode,
      showStudentHeader = true,
      ecoPrint = false,
      onUpdateTitle,
      onUpdateInstructions,
      onUpdateSection,
      onDeleteSection,
      onMoveSectionUp,
      onMoveSectionDown,
      onAddSection,
      onUpdatePedagogicalNote,
    },
    ref
  ) => {
    const totalPoints = useMemo(() => {
      return (activity.sections ?? []).reduce((acc, s) => acc + (s.points || 0), 0);
    }, [activity.sections]);

    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);

    return (
      <div
        ref={ref}
        className={`
          flex flex-col
          bg-white text-slate-900 font-[Lexend]
          w-[210mm] min-h-[297mm]
          px-[16mm] py-[16mm]
          print:shadow-none print:m-0 print:p-[16mm]
          ${ecoPrint ? 'print:text-black print:bg-white' : ''}
        `}
        style={{ fontFamily: 'Lexend, sans-serif' }}
      >
        {/* 1. ÖĞRENCİ BAŞLIK BLOĞU (Sınav & Ödev Formatı) */}
        {showStudentHeader && (
          <div className="border border-slate-300 rounded-xl px-4 py-2.5 mb-5 grid grid-cols-4 gap-3 text-xs text-slate-700 bg-slate-50/70 print:bg-white print:border-slate-400">
            <div>
              <span className="font-bold text-slate-500">Adı Soyadı:</span>{' '}
              <span className="text-slate-400">___________________</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Sınıfı / No:</span>{' '}
              <span className="text-slate-400">_________</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Tarih:</span>{' '}
              <span className="text-slate-400">___/___/202_</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">Puan:</span>{' '}
              <span className="font-bold text-indigo-600">_____ / {totalPoints || 100}</span>
            </div>
          </div>
        )}

        {/* 2. ETKİNLİK BAŞLIĞI VE ÜST META */}
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
            {totalPoints > 0 && (
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ⭐ {totalPoints} Puan
              </span>
            )}
          </div>

          <div className="mt-3 text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 print:bg-transparent print:border-none print:p-0">
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

        {/* 3. BÖLÜMLER (MİMARİ DNA BİLEŞENLERİ) */}
        <div className="space-y-6">
          {(activity.sections ?? []).map((section, idx) => (
            <SectionRenderer
              key={section.id}
              section={section}
              index={idx}
              totalSections={activity.sections.length}
              showAnswerKey={showAnswerKey}
              isEditMode={isEditMode}
              onUpdateSection={(patch) => onUpdateSection?.(section.id, patch)}
              onDeleteSection={() => onDeleteSection?.(section.id)}
              onMoveUp={() => onMoveSectionUp?.(idx)}
              onMoveDown={() => onMoveSectionDown?.(idx)}
            />
          ))}
        </div>

        {/* DÜZENLEME MODUNDA YENİ BÖLÜM EKLE BUTONU */}
        {isEditMode && onAddSection && (
          <div className="mt-6 pt-4 border-t border-dashed border-slate-200 print:hidden relative">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-colors border border-indigo-200"
              >
                <Plus className="h-4 w-4" /> Yeni Bölüm Ekle
              </button>
              <span className="text-[11px] text-slate-400">
                Mevcut Bölüm Sayısı: {activity.sections.length}
              </span>
            </div>

            {isAddMenuOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-20 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onAddSection('question');
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                >
                  ❓ Çoktan Seçmeli Soru
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddSection('fillInTheBlank');
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                >
                  ✍️ Boşluk Doldurma
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddSection('matching');
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                >
                  🔗 Kavram Eşleştirme
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddSection('table');
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                >
                  📊 Bilgi / Sınıflandırma Tablosu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddSection('text');
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                >
                  📖 Okuma Metni / Hikaye
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddSection('instruction');
                    setIsAddMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg flex items-center gap-2"
                >
                  💡 Kural / İpucu Kutusu
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4. CEVAP ANAHTARI (ÖĞRETMEN BASKISINDA) */}
        {showAnswerKey && (activity.answerKey ?? []).length > 0 && (
          <div className="mt-10 border-t-2 border-dashed border-slate-200 pt-6 print:break-before-page">
            <h2 className="text-base font-bold text-slate-700 mb-3 flex items-center gap-2">
              <FileCheck2 className="h-4 w-4 text-emerald-600" /> Cevap Anahtarı & Çözüm İpuçları
            </h2>
            <div className="space-y-2">
              {(activity.answerKey ?? []).map((ak, i) => (
                <div key={ak.sectionId || i} className="text-sm">
                  <span className="font-semibold text-slate-700">{i + 1}.</span>{' '}
                  <span className="text-slate-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {ak.answer}
                  </span>
                  {ak.explanation && (
                    <span className="text-slate-500 text-xs ml-2"> — {ak.explanation}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. PEDAGOJİK ÖĞRETMEN NOTU */}
        {showAnswerKey && (
          <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl p-4 print:break-inside-avoid">
            <p className="text-xs font-bold text-indigo-700 mb-1 flex items-center gap-1.5">
              <Award className="h-4 w-4 text-indigo-600" />
              Pedagojik Öğretmen Notu (ZPD & Bilişsel Klonlama Gerekçesi)
            </p>
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
  index: number;
  totalSections: number;
  showAnswerKey?: boolean;
  isEditMode: boolean;
  onUpdateSection: (patch: Partial<ActivitySection>) => void;
  onDeleteSection?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

function SectionRenderer({
  section,
  index,
  totalSections,
  showAnswerKey = false,
  isEditMode,
  onUpdateSection,
  onDeleteSection,
  onMoveUp,
  onMoveDown,
}: SectionRendererProps) {
  const updateTitle = (title: string) => onUpdateSection({ title });
  const updatePoints = (pts: string) => {
    const num = parseInt(pts, 10);
    if (!Number.isNaN(num)) onUpdateSection({ points: Math.max(0, num) });
  };

  return (
    <div className="break-inside-avoid relative group rounded-xl p-1 transition-all">
      {/* Düzenleme Araçları (Bölüm Başı Butonlar) */}
      {isEditMode && (
        <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-100 print:hidden text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-400 text-[10px] uppercase">
              Bölüm {index + 1}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-500 font-medium">Puan:</span>
            <InlineEditable
              value={String(section.points || 0)}
              onSave={updatePoints}
              isEditMode={isEditMode}
              className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded"
            />
          </div>

          <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              disabled={index === 0}
              onClick={onMoveUp}
              className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20"
              title="Yukarı Taşı"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={index === totalSections - 1}
              onClick={onMoveDown}
              className="p-1 rounded text-slate-400 hover:text-indigo-600 disabled:opacity-20"
              title="Aşağı Taşı"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={onDeleteSection}
              className="p-1 rounded text-slate-400 hover:text-rose-600 ml-1"
              title="Bölümü Sil"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Başlık */}
      {section.title && (
        <h3 className="text-sm font-bold text-slate-700 mb-1 flex items-center justify-between">
          <InlineEditable value={section.title} onSave={updateTitle} isEditMode={isEditMode} />
          {section.points > 0 && !isEditMode && (
            <span className="text-xs font-semibold text-slate-400">({section.points} Puan)</span>
          )}
        </h3>
      )}

      {/* İçerik Türüne Göre Render */}
      {(() => {
        switch (section.content.type) {
          case 'text': {
            const textVal = section.content.text;
            return (
              <p className="text-sm text-slate-700 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100 print:bg-transparent print:border-none print:p-0">
                <InlineEditable
                  value={textVal}
                  multiline
                  onSave={(newText) =>
                    onUpdateSection({ content: { type: 'text', text: newText } })
                  }
                  isEditMode={isEditMode}
                />
              </p>
            );
          }

          case 'instruction': {
            const textVal = section.content.text;
            return (
              <div className="p-3 bg-amber-50/70 border-l-4 border-amber-400 rounded-r-lg text-sm text-amber-900 leading-relaxed print:bg-transparent print:border-slate-300">
                <InlineEditable
                  value={textVal}
                  multiline
                  onSave={(newText) =>
                    onUpdateSection({ content: { type: 'instruction', text: newText } })
                  }
                  isEditMode={isEditMode}
                />
              </div>
            );
          }

          case 'question': {
            const qContent = section.content;
            const hasOptions = qContent.options && qContent.options.length > 0;

            return (
              <div className="space-y-2">
                <p className="text-sm text-slate-800 font-medium">
                  <InlineEditable
                    value={qContent.questionText}
                    multiline
                    onSave={(newQ) =>
                      onUpdateSection({ content: { ...qContent, questionText: newQ } })
                    }
                    isEditMode={isEditMode}
                  />
                </p>

                {hasOptions ? (
                  <ul className="space-y-1.5 ml-2">
                    {qContent.options!.map((opt, i) => {
                      const letter = String.fromCharCode(65 + i);
                      const isCorrect = showAnswerKey && (
                        qContent.correctAnswer === letter ||
                        qContent.correctAnswer?.startsWith(letter)
                      );
                      return (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                          <span
                            className={`inline-flex items-center justify-center h-5 w-5 rounded-full border text-xs font-bold flex-shrink-0 mt-0.5 ${
                              isCorrect
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'border-slate-300 text-slate-500'
                            }`}
                          >
                            {letter}
                          </span>
                          <InlineEditable
                            value={opt}
                            onSave={(newOpt) => {
                              const nextOpts = [...(qContent.options ?? [])];
                              nextOpts[i] = newOpt;
                              onUpdateSection({ content: { ...qContent, options: nextOpts } });
                            }}
                            isEditMode={isEditMode}
                            className={`flex-1 ${isCorrect ? 'font-bold text-emerald-700' : ''}`}
                          />
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  /* Açık Uçlu Soru için Yazma Çizgileri */
                  <div className="space-y-3 pt-2">
                    <div className="border-b border-dashed border-slate-300 h-6" />
                    <div className="border-b border-dashed border-slate-300 h-6" />
                    <div className="border-b border-dashed border-slate-300 h-6" />
                  </div>
                )}
              </div>
            );
          }

          case 'fillInTheBlank': {
            const fbContent = section.content;
            return (
              <div className="space-y-2">
                {fbContent.blanks && fbContent.blanks.length > 0 && (
                  <div className="p-2 rounded-lg bg-indigo-50/60 border border-indigo-100 flex flex-wrap items-center gap-1.5 text-xs text-indigo-800 print:border-slate-300">
                    <span className="font-bold text-indigo-700 mr-1">Kelime Kutusu:</span>
                    {fbContent.blanks.map((b, bi) => (
                      <span key={bi} className="bg-white px-2 py-0.5 rounded border border-indigo-200 font-medium">
                        {b}
                      </span>
                    ))}
                  </div>
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
              <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-1">
                <div className="space-y-2">
                  {mContent.pairs.map((p, i) => (
                    <p key={i} className="text-sm text-slate-700 flex items-center gap-2">
                      <span className="font-bold text-slate-600 text-xs w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                        {i + 1}
                      </span>
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
                    <p key={i} className="text-sm text-slate-700 flex items-center gap-2">
                      <span className="font-bold text-indigo-600 text-xs w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center">
                        {String.fromCharCode(65 + i)}
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
            );
          }

          case 'table': {
            const tContent = section.content;
            return (
              <div className="overflow-x-auto pt-1">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr>
                      {tContent.headers.map((h, i) => (
                        <th
                          key={i}
                          className="border border-slate-300 bg-slate-100 px-3 py-1.5 text-left text-xs font-bold text-slate-700"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tContent.rows.map((row, ri) => (
                      <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                        {row.map((cell, ci) => (
                          <td key={ci} className="border border-slate-200 px-3 py-1.5 text-slate-700 text-xs">
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
              <div className="text-center">
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
            return <div className="print:break-before-page border-b-2 border-dashed border-slate-200 my-4" />;

          default:
            return null;
        }
      })()}
    </div>
  );
}

// ---- Ana PreviewStep Bileşeni ----
export default function PreviewStep({ activity, onSendForApproval, isSending }: PreviewStepProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [isEditMode, setIsEditMode] = useState(true);
  const [showStudentHeader, setShowStudentHeader] = useState(true);
  const [ecoPrint, setEcoPrint] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

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

  const handleDeleteSection = (sectionId: string) => {
    const nextSections = activity.sections.filter((s) => s.id !== sectionId);
    updateActivity(activity.id, { sections: nextSections });
  };

  const handleMoveSectionUp = (index: number) => {
    if (index <= 0) return;
    const nextSections = [...activity.sections];
    const temp = nextSections[index - 1];
    nextSections[index - 1] = nextSections[index];
    nextSections[index] = temp;
    updateActivity(activity.id, { sections: nextSections });
  };

  const handleMoveSectionDown = (index: number) => {
    if (index >= activity.sections.length - 1) return;
    const nextSections = [...activity.sections];
    const temp = nextSections[index + 1];
    nextSections[index + 1] = nextSections[index];
    nextSections[index] = temp;
    updateActivity(activity.id, { sections: nextSections });
  };

  const handleAddSection = (type: SectionType) => {
    const id = uuid();
    let content: any = { type: 'text', text: 'Yeni içerik...' };

    if (type === 'question') {
      content = {
        type: 'question',
        questionText: 'Yeni soru metnini buraya yazın...',
        options: ['A) Seçenek 1', 'B) Seçenek 2', 'C) Seçenek 3', 'D) Seçenek 4'],
        correctAnswer: 'A',
      };
    } else if (type === 'fillInTheBlank') {
      content = {
        type: 'fillInTheBlank',
        sentence: 'Bu cümlede yer alan ___ kelimesini uygun yere yerleştirin.',
        blanks: ['örnek'],
      };
    } else if (type === 'matching') {
      content = {
        type: 'matching',
        pairs: [
          { left: 'Kavram 1', right: 'Tanım A' },
          { left: 'Kavram 2', right: 'Tanım B' },
        ],
      };
    } else if (type === 'table') {
      content = {
        type: 'table',
        headers: ['Özellik', 'Açıklama'],
        rows: [
          ['Madde 1', 'Değer 1'],
          ['Madde 2', 'Değer 2'],
        ],
      };
    } else if (type === 'instruction') {
      content = {
        type: 'instruction',
        text: 'Lütfen soruları dikkatlice okuyup yanıtlayınız.',
      };
    }

    const newSec: ActivitySection = {
      id,
      order: activity.sections.length + 1,
      type,
      title: 'Yeni Bölüm',
      content,
      points: 10,
      objectiveRefs: [],
    };

    updateActivity(activity.id, { sections: [...activity.sections, newSec] });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Üst Varyasyon Değiştirici */}
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
            İstediğiniz varyasyonda düzenleme yapıp tek tıkla onaya gönderebilir veya paylaşabilirsiniz.
          </div>
        </div>
      )}

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Sol Araç Çubuğu */}
        <aside className="w-64 flex-shrink-0 flex flex-col gap-3">
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

          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          {/* Öğrenci Başlık Bloğu Toggle */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300 px-1">
            <input
              type="checkbox"
              checked={showStudentHeader}
              onChange={(e) => setShowStudentHeader(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Öğrenci Sınav/Ödev Başlığı
          </label>

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

          {/* Eko S/B Baskı */}
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300 px-1">
            <input
              type="checkbox"
              checked={ecoPrint}
              onChange={(e) => setEcoPrint(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Eko S/B Baskı Modu (WCAG AAA)
          </label>

          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          {/* Yazdır ve PDF İndir */}
          <button
            type="button"
            onClick={() => handlePrint()}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            Yazdır (A4 Çıktı)
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 text-slate-700 dark:text-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors shadow-sm"
          >
            {isDownloadingPdf ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
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

          {/* PAYLAŞ & YAYINLA MERKEZİ BUTONU */}
          <button
            type="button"
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
          >
            <Share2 className="h-4 w-4" />
            Paylaş &amp; Yayınla
          </button>

          <div className="border-t border-slate-200 dark:border-slate-700 my-1" />

          {/* Onaya Gönder Butonu */}
          <button
            type="button"
            onClick={onSendForApproval}
            disabled={isSending}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl px-4 py-3 text-xs font-bold transition-colors shadow-md shadow-emerald-600/20"
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

          {pdfError && (
            <p role="alert" className="text-[11px] text-red-600 dark:text-red-400 leading-snug px-1">
              {pdfError}
            </p>
          )}

          {/* Etkinlik Meta Özeti */}
          <div className="mt-auto p-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 rounded-2xl text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
            <p><strong>Ders:</strong> {activity.subject}</p>
            <p><strong>Sınıf:</strong> {activity.grade}</p>
            <p><strong>Zorluk:</strong> {activity.difficulty}</p>
            <p><strong>Bölüm Sayısı:</strong> {activity.sections.length}</p>
            {activity.isPublic && (
              <p className="text-emerald-600 font-bold flex items-center gap-1">
                🌐 Toplulukta Yayında
              </p>
            )}
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
              showStudentHeader={showStudentHeader}
              ecoPrint={ecoPrint}
              onUpdateTitle={handleUpdateTitle}
              onUpdateInstructions={handleUpdateInstructions}
              onUpdateSection={handleUpdateSection}
              onDeleteSection={handleDeleteSection}
              onMoveSectionUp={handleMoveSectionUp}
              onMoveSectionDown={handleMoveSectionDown}
              onAddSection={handleAddSection}
              onUpdatePedagogicalNote={handleUpdatePedagogicalNote}
            />
          </div>
        </div>
      </div>

      {/* Paylaş & Yayınla Modali */}
      <SharePublishModal
        activity={activity}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onActivityUpdated={(updated) => updateActivity(activity.id, updated)}
      />
    </div>
  );
}
