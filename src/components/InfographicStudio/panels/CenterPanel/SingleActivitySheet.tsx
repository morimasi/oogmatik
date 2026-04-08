/**
 * @file SingleActivitySheet.tsx
 * @description InfographicGeneratorResult'u A4 çalışma sayfası olarak gösterir.
 *
 * Elif Yıldız: pedagogicalNote, Lexend font, disleksi uyumlu satır aralığı.
 * Bora Demir: any yasak — content alanlarına tip güvenli erişim.
 */

import React from 'react';
import { InfographicGeneratorResult, InfographicActivityContent, InfographicStep } from '../../../../types/infographic';
import { Clock, Target, Brain } from 'lucide-react';

interface SingleActivitySheetProps {
  result: InfographicGeneratorResult;
  activityTitle?: string;
}

// ── İçerik render ────────────────────────────────────────────────────────────

function renderContent(content: InfographicActivityContent): React.ReactNode {
  // Adımlı içerik (flowchart, math steps, vb.)
  if (content.steps && content.steps.length > 0) {
    return (
      <div className="mt-4 space-y-2">
        {content.steps.map((s: InfographicStep, i: number) => (
          <div
            key={i}
            className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200"
          >
            <div className="flex-shrink-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
              {s.stepNumber}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-slate-800 text-sm font-lexend">{s.label}</div>
              {s.description && (
                <div className="text-xs text-slate-600 mt-0.5 font-lexend leading-relaxed">
                  {s.description}
                </div>
              )}
              {s.scaffoldHint && (
                <div className="text-[10px] text-amber-700 mt-1 font-lexend">
                  💡 {s.scaffoldHint}
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

  // Karşılaştırma (Venn / Compare)
  if (content.comparisons) {
    const c = content.comparisons;
    return (
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="font-semibold text-blue-800 text-sm mb-2 font-lexend">{c.leftTitle}</div>
          {c.leftItems.map((item, i) => (
            <div key={i} className="text-xs text-blue-700 mb-1 font-lexend">• {item}</div>
          ))}
        </div>
        <div className="bg-emerald-50 rounded-lg p-3">
          <div className="font-semibold text-emerald-800 text-sm mb-2 font-lexend">Ortak</div>
          {(c.commonGround ?? []).map((item, i) => (
            <div key={i} className="text-xs text-emerald-700 mb-1 font-lexend">• {item}</div>
          ))}
        </div>
        <div className="bg-orange-50 rounded-lg p-3">
          <div className="font-semibold text-orange-800 text-sm mb-2 font-lexend">{c.rightTitle}</div>
          {c.rightItems.map((item, i) => (
            <div key={i} className="text-xs text-orange-700 mb-1 font-lexend">• {item}</div>
          ))}
        </div>
      </div>
    );
  }

  // Soru listesi (5N1K, quizler, vb.)
  if (content.questions && content.questions.length > 0) {
    return (
      <div className="mt-4 space-y-3">
        {content.questions.map((q, i) => (
          <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="font-semibold text-slate-800 text-sm font-lexend mb-2">
              {i + 1}. {q.question}
            </div>
            {q.answer && (
              <div className="mt-2 border-b-2 border-dashed border-slate-300 min-h-[24px]" />
            )}
          </div>
        ))}
      </div>
    );
  }

  // Kelime dağarcığı (vocab tree, kelime ailesi, vb.)
  if (content.vocabulary && content.vocabulary.length > 0) {
    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        {content.vocabulary.map((v, i) => (
          <div key={i} className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-bold text-blue-800 text-sm font-lexend">{v.word}</div>
            {v.meaning && (
              <div className="text-xs text-blue-600 mt-1 font-lexend">{v.meaning}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Zaman çizelgesi
  if (content.timeline && content.timeline.length > 0) {
    return (
      <div className="mt-4 space-y-3">
        {content.timeline.map((t, i) => (
          <div key={i} className="flex gap-3 items-start">
            <div className="flex-shrink-0 text-xs font-bold text-blue-700 w-20 font-lexend pt-1">
              {t.date}
            </div>
            <div className="flex-1 p-2 bg-blue-50 rounded-lg border-l-2 border-blue-400">
              <div className="font-semibold text-slate-800 text-sm font-lexend">{t.title}</div>
              {t.description && (
                <div className="text-xs text-slate-600 mt-0.5 font-lexend">{t.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // BEP hedefleri
  if (content.bepGoals && content.bepGoals.length > 0) {
    return (
      <div className="mt-4 space-y-2">
        {content.bepGoals.map((g, i) => (
          <div key={i} className="p-3 bg-violet-50 rounded-lg border border-violet-200">
            <div className="font-semibold text-violet-800 text-sm font-lexend">{g.domain}</div>
            <div className="text-xs text-violet-700 mt-1 font-lexend">{g.objective}</div>
            {g.measurableIndicator && (
              <div className="text-xs text-violet-600 mt-1 font-lexend">Gösterge: {g.measurableIndicator}</div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Duygu/sosyal beceriler
  if (content.emotions && content.emotions.length > 0) {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {content.emotions.map((e, i) => (
          <div key={i} className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-xl">
            <div>
              <div className="font-semibold text-rose-800 text-xs font-lexend">{e.emotion}</div>
              {e.strategy && (
                <div className="text-[10px] text-rose-600 font-lexend">{e.strategy}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Hikâye haritası
  if (content.storyElements) {
    const s = content.storyElements;
    return (
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="p-3 bg-amber-50 rounded-lg">
          <div className="font-semibold text-amber-800 text-xs mb-1 font-lexend">Karakterler</div>
          {(s.characters ?? []).map((c, i) => (
            <div key={i} className="text-xs text-amber-700 font-lexend">• {c}</div>
          ))}
        </div>
        <div className="p-3 bg-teal-50 rounded-lg">
          <div className="font-semibold text-teal-800 text-xs mb-1 font-lexend">Mekan</div>
          <div className="text-xs text-teal-700 font-lexend">{s.setting}</div>
        </div>
        <div className="col-span-2 p-3 bg-red-50 rounded-lg">
          <div className="font-semibold text-red-800 text-xs mb-1 font-lexend">Problem</div>
          <div className="text-xs text-red-700 font-lexend">{s.problem}</div>
        </div>
        <div className="col-span-2 p-3 bg-green-50 rounded-lg">
          <div className="font-semibold text-green-800 text-xs mb-1 font-lexend">Çözüm</div>
          <div className="text-xs text-green-700 font-lexend">{s.resolution}</div>
        </div>
      </div>
    );
  }

  // Fallback: boş sayfa çizgileri
  return (
    <div className="mt-4 space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="border-b border-dashed border-slate-300 min-h-[28px]" />
      ))}
    </div>
  );
}

// ── Ana bileşen ───────────────────────────────────────────────────────────────

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
      {/* Başlık */}
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

      {/* Ana İçerik */}
      <div className="flex-1">{renderContent(result.content)}</div>

      {/* Öğrenci Değerlendirme */}
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

      {/* Pedagojik Not */}
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
