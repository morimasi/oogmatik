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
          return (
            <div key={idx} className="flex items-center gap-4 w-full">
              {/* Boş parantez alanı */}
              <div className="text-lg print:text-base font-black text-zinc-900 shrink-0 whitespace-nowrap">
                ( <span className="w-6 inline-block"></span> )
              </div>
              
              {/* Cümle */}
              <div className="text-base print:text-sm font-medium leading-relaxed pl-1 border-b border-dotted border-zinc-300 flex-1 pb-0.5">
                <EditableText value={text} tag="span" />
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

