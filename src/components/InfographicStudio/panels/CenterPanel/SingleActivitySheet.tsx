/**
 * @file src/components/InfographicStudio/panels/CenterPanel/SingleActivitySheet.tsx
 * @description InfographicGeneratorResult'u profesyonel A4 çalışma sayfası olarak gösterir.
 *
 * Elif Yıldız: pedagogicalNote, Lexend font, disleksi uyumlu satır aralığı.
 * Bora Demir: any yasak, forPrint modunda sabit renkler.
 * Tasarım: etkinlik.md §8 — 210×297mm, Lexend 11pt, satır aralığı 1.6
 */

import React from 'react';
import { InfographicGeneratorResult, InfographicActivityContent } from '../../../../types/infographic';
import { Clock, Target, Brain } from 'lucide-react';

interface SingleActivitySheetProps {
  result: InfographicGeneratorResult;
  activityTitle?: string;
}

// ── İçerik bölümü render ────────────────────────────────────────────────────

function renderContent(content: InfographicActivityContent): React.ReactNode {
  // Kavram haritası / küme
  if (content.concepts && Array.isArray(content.concepts)) {
    return (
      <div className="mt-4">
        <div className="flex flex-wrap gap-2">
          {(content.concepts as string[]).map((c, i) => (
            <span
              key={i}
              className="inline-block bg-blue-50 border border-blue-200 text-blue-800 rounded-full px-3 py-1 text-sm font-lexend"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // Karşılaştırma tablosu
  if (content.comparisons) {
    const c = content.comparisons as {
      leftTitle?: string;
      rightTitle?: string;
      leftItems?: string[];
      rightItems?: string[];
      commonGround?: string[];
    };
    return (
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="font-semibold text-blue-800 text-sm mb-2 font-lexend">
            {c.leftTitle ?? 'A'}
          </div>
          {(c.leftItems ?? []).map((item, i) => (
            <div key={i} className="text-xs text-blue-700 mb-1 font-lexend">
              • {item}
            </div>
          ))}
        </div>
        <div className="bg-emerald-50 rounded-lg p-3">
          <div className="font-semibold text-emerald-800 text-sm mb-2 font-lexend">Ortak</div>
          {(c.commonGround ?? []).map((item, i) => (
            <div key={i} className="text-xs text-emerald-700 mb-1 font-lexend">
              • {item}
            </div>
          ))}
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="font-semibold text-orange-800 text-sm mb-2 font-lexend">
            {c.rightTitle ?? 'B'}
          </div>
          {(c.rightItems ?? []).map((item, i) => (
            <div key={i} className="text-xs text-orange-700 mb-1 font-lexend">
              • {item}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Adımlı içerik (flowchart, math steps, vb.)
  if (content.steps && Array.isArray(content.steps)) {
    const steps = content.steps as Array<{
      stepNumber?: number;
      label?: string;
      description?: string;
      expression?: string;
      step?: string;
      explanation?: string;
      isCheckpoint?: boolean;
    }>;
    return (
      <div className="mt-4 space-y-2">
        {steps.map((s, i) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {s.stepNumber ?? i + 1}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-800 text-sm font-lexend">
                {s.label ?? s.expression ?? `Adım ${i + 1}`}
              </div>
              {(s.description ?? s.explanation ?? s.step) && (
                <div className="text-xs text-slate-600 mt-0.5 font-lexend leading-relaxed">
                  {s.description ?? s.explanation ?? s.step}
                </div>
              )}
              {s.isCheckpoint && (
                <span className="mt-1 inline-block text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-lexend">
                  ☐ Kontrol Noktası
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Venn şeması
  if (content.venn) {
    const v = content.venn as {
      setA?: { label?: string; items?: string[] };
      setB?: { label?: string; items?: string[] };
      intersection?: string[];
    };
    return (
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="font-semibold text-blue-800 text-sm mb-2 font-lexend">
            {v.setA?.label ?? 'A'}
          </div>
          {(v.setA?.items ?? []).map((it, i) => (
            <div key={i} className="text-xs text-blue-700 mb-1 font-lexend">• {it}</div>
          ))}
        </div>
        <div className="bg-violet-50 rounded-lg p-3">
          <div className="font-semibold text-violet-800 text-sm mb-2 font-lexend">Ortak</div>
          {(v.intersection ?? []).map((it, i) => (
            <div key={i} className="text-xs text-violet-700 mb-1 font-lexend">• {it}</div>
          ))}
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="font-semibold text-orange-800 text-sm mb-2 font-lexend">
            {v.setB?.label ?? 'B'}
          </div>
          {(v.setB?.items ?? []).map((it, i) => (
            <div key={i} className="text-xs text-orange-700 mb-1 font-lexend">• {it}</div>
          ))}
        </div>
      </div>
    );
  }

  // 5N1K
  if (content.questionsAnswers) {
    const qa = content.questionsAnswers as Array<{ question?: string; answer?: string; answerSpace?: number }>;
    return (
      <div className="mt-4 space-y-2">
        {qa.map((item, i) => (
          <div key={i} className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex-shrink-0 w-20 text-xs font-bold text-blue-700 font-lexend pt-0.5">
              {item.question ?? `Soru ${i + 1}`}
            </div>
            <div
              className="flex-1 min-h-[28px] border-b-2 border-dashed border-slate-300"
              style={{ minHeight: `${(item.answerSpace ?? 1) * 28}px` }}
            />
          </div>
        ))}
      </div>
    );
  }

  // Matris/tablo
  if (content.matrix) {
    const m = content.matrix as { headers?: string[]; rows?: Array<{ label?: string; values?: string[] }> };
    return (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs border-collapse font-lexend">
          <thead>
            <tr>
              <th className="border border-slate-300 p-2 bg-slate-100 text-left" />
              {(m.headers ?? []).map((h, i) => (
                <th key={i} className="border border-slate-300 p-2 bg-slate-100 text-center">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(m.rows ?? []).map((row, ri) => (
              <tr key={ri}>
                <td className="border border-slate-300 p-2 font-semibold bg-slate-50">
                  {row.label}
                </td>
                {(row.values ?? []).map((v, vi) => (
                  <td key={vi} className="border border-slate-300 p-2 text-center">
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Liste/genel içerik
  if (content.items && Array.isArray(content.items)) {
    const items = content.items as Array<string | { label?: string; description?: string; wordCount?: number }>;
    return (
      <div className="mt-4 space-y-2">
        {items.map((item, i) => {
          if (typeof item === 'string') {
            return (
              <div key={i} className="flex items-start gap-2 text-sm font-lexend text-slate-700">
                <span className="text-blue-500 font-bold">•</span>
                <span>{item}</span>
              </div>
            );
          }
          return (
            <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="font-semibold text-slate-800 text-sm font-lexend">
                {item.label}
              </div>
              {item.description && (
                <div className="text-xs text-slate-600 mt-1 font-lexend leading-relaxed">
                  {item.description}
                </div>
              )}
              {item.wordCount && (
                <div
                  className="mt-2 border-b border-dashed border-slate-300"
                  style={{ minHeight: `${item.wordCount * 1.5}px` }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Fallback: ham JSON
  return (
    <pre className="mt-4 text-[10px] text-slate-500 bg-slate-50 rounded p-3 overflow-auto max-h-40 font-mono">
      {JSON.stringify(content, null, 2)}
    </pre>
  );
}

// ── Ana bileşen ──────────────────────────────────────────────────────────────

export const SingleActivitySheet: React.FC<SingleActivitySheetProps> = ({
  result,
  activityTitle,
}) => {
  return (
    <div
      id="single-activity-a4"
      className="bg-white text-slate-900 shadow-2xl"
      style={{
        width: '210mm',
        minHeight: '297mm',
        padding: '15mm 15mm 15mm 20mm',
        fontFamily: 'Lexend, Inter, sans-serif',
        fontSize: '11pt',
        lineHeight: 1.6,
        boxSizing: 'border-box',
      }}
    >
      {/* ── Başlık Alanı ─────────────────────────────────────────────────── */}
      <div className="border-b-2 border-slate-200 pb-3 mb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="text-[9pt] font-semibold text-slate-400 uppercase tracking-widest mb-1 font-lexend">
              {activityTitle ?? 'Aktivite'}
            </div>
            <h1 className="text-[16pt] font-bold text-slate-800 leading-tight font-lexend">
              {result.title}
            </h1>
          </div>
          <div className="text-right text-[9pt] text-slate-400 font-lexend space-y-0.5">
            <div>Tarih: ____/____/________</div>
            <div>Ad: ______________________</div>
          </div>
        </div>

        {/* Meta bant */}
        <div className="flex items-center gap-4 mt-3 text-[9pt] text-slate-500 font-lexend">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {result.estimatedDuration} dk
          </span>
          <span className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            {result.difficultyLevel}
          </span>
          <span className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            {result.ageGroup} yaş
          </span>
          <div className="flex flex-wrap gap-1 ml-2">
            {result.targetSkills.slice(0, 3).map((skill, i) => (
              <span
                key={i}
                className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 text-[8pt] font-lexend"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Ana İçerik ──────────────────────────────────────────────────── */}
      <div className="flex-1">{renderContent(result.content)}</div>

      {/* ── Öğrenci Değerlendirme Alanı ──────────────────────────────────── */}
      <div className="mt-8 pt-4 border-t border-slate-200">
        <div className="grid grid-cols-2 gap-4 text-[9pt] text-slate-600 font-lexend">
          <div>
            <div className="font-semibold mb-1">Bugün ne öğrendim?</div>
            <div className="border-b border-dashed border-slate-300 pb-5" />
          </div>
          <div>
            <div className="font-semibold mb-1">Zorlandığım yer:</div>
            <div className="border-b border-dashed border-slate-300 pb-5" />
          </div>
        </div>
      </div>

      {/* ── Pedagojik Not (Öğretmene) ────────────────────────────────────── */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="text-[8pt] text-slate-400 font-lexend italic leading-relaxed">
          <span className="font-semibold not-italic text-slate-500">Öğretmene: </span>
          {result.pedagogicalNote}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-[7pt] text-slate-300 font-lexend">
        <span>Oogmatik Platform — Disleksi Dostu Eğitim Materyali</span>
        <span>Lexend · A4</span>
      </div>
    </div>
  );
};
