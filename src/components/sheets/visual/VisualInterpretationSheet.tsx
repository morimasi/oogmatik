import React from 'react';
import { WorksheetData, StyleSettings } from '../../../types';
import { ImageDisplay } from '../common';
import { EditableText } from '../../Editable';

interface VisualInterpretationSheetProps {
  data: WorksheetData;
  settings: StyleSettings;
}

export const VisualInterpretationSheet: React.FC<VisualInterpretationSheetProps> = ({
  data,
  settings,
}) => {
  if (!data) return null;
  const activity = Array.isArray(data) ? data[0] : data;
  const blocks = activity.layoutArchitecture?.blocks || [];

  const imageBlock = blocks.find((b: any) => b.type === 'image');
  const questionsBlock = blocks.find((b: any) => b.type === 'question' || b.type === 'questions');

  const imagePrompt = (imageBlock?.content as Record<string, unknown>)?.prompt as string || 'Educational scene';
  const imageBase64 = (imageBlock?.content as Record<string, unknown>)?.base64 as string | undefined;
  const questions = (questionsBlock?.content as Record<string, unknown>)?.items as Record<string, unknown>[] || [];

  const instructionText = activity.instruction || "Aşağıdaki cümleleri resme göre okuyup cevapla. Cümle Doğruysa (D) yanlışsa (Y) harfi koy.";

  return (
    <div className="w-full flex flex-col p-4 print:p-3 min-h-[297mm] bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative">
      
      {/* 1. GÖRSEL ALANI */}
      <div className="w-full flex justify-center mb-3 mt-1">
        <div className="w-full h-[320px] print:h-[300px] border-2 border-zinc-900 rounded-2xl overflow-hidden shadow-lg">
          <ImageDisplay
            prompt={imagePrompt}
            base64={imageBase64}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 2. YÖNERGE METNİ */}
      <div className="w-full text-center mb-4">
        <h2 className="text-base print:text-sm font-bold text-rose-600">
          <EditableText value={instructionText} tag="span" />
        </h2>
      </div>

      {/* 3. D/Y CÜMLE LİSTESİ */}
      <div className="flex flex-col gap-3 flex-1 px-2 mt-1">
        {questions.map((q: Record<string, unknown>, idx: number) => {
          const text = recursiveSafeText(q.q || q.questionText || q.text);
          const qType = (q.type as string) || 'true_false';
          const options = Array.isArray(q.options) ? q.options : [];
          const isMultipleChoice = qType === 'multiple_choice' && options.length > 0;
          const isOpenEnded = qType === 'open_ended' || qType === '5n1k' || qType === 'mixed_open';
          return (
            <div key={idx} className="flex items-start gap-4 w-full">
              {/* Tip rozeti / parantez alanı */}
              {qType === 'true_false' ? (
                <div className="text-lg print:text-base font-black text-zinc-900 shrink-0 whitespace-nowrap">
                  ( <span className="w-6 inline-block"></span> )
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                  {idx + 1}
                </div>
              )}

              <div className="flex-1">
                {/* Cümle / Soru */}
                <div className="text-base print:text-sm font-medium leading-relaxed pl-1 border-b border-dotted border-zinc-300 flex-1 pb-0.5">
                  <EditableText value={text} tag="span" />
                </div>

                {/* Çoktan seçmeli şıklar */}
                {isMultipleChoice && (
                  <div className="grid grid-cols-1 gap-1 mt-2">
                    {options.map((opt: any, oIdx: number) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-zinc-300 flex items-center justify-center text-[8px] font-black text-zinc-500 bg-white shrink-0">
                          {String.fromCharCode(65 + oIdx)}
                        </div>
                        <span className="text-sm print:text-xs text-zinc-700 font-medium">{recursiveSafeText(opt)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Açık uçlu / 5N1K yazma alanı */}
                {isOpenEnded && (
                  <div className="mt-1.5 border-b-2 border-dashed border-zinc-200 h-8 w-full"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

const recursiveSafeText = (val: any): string => {
  if (val === null || val === undefined) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    if (Array.isArray(val)) return val.map(recursiveSafeText).join(', ');
    const keys = ['text', 'q', 'questionText', 'clue', 'content'];
    for (const key of keys) {
      if (val[key]) return recursiveSafeText(val[key]);
    }
  }
  return String(val);
};

