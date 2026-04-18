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
    <div className="w-full flex flex-col p-12 print:p-8 min-h-[297mm] bg-white font-['Lexend'] text-zinc-900 overflow-hidden relative">
      
      {/* 1. GÖRSEL ALANI */}
      <div className="w-full flex justify-center mb-6 mt-4">
        <div className="w-full h-[450px] print:h-[400px] border-[4px] border-black rounded-[2.5rem] overflow-hidden shadow-[8px_8px_0px_#e4e4e7]">
          <ImageDisplay
            prompt={imagePrompt}
            base64={imageBase64}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 2. KIRMIZI YÖNERGE METNİ */}
      <div className="w-full text-center mb-8">
        <h2 className="text-xl print:text-lg font-bold text-rose-600">
          <EditableText value={instructionText} tag="span" />
        </h2>
      </div>

      {/* 3. D/Y CÜMLE LİSTESİ */}
      <div className="flex flex-col gap-7 flex-1 px-4 mt-2">
        {questions.map((q: Record<string, unknown>, idx: number) => {
          const text = recursiveSafeText(q.q || q.questionText || q.text);
          return (
            <div key={idx} className="flex items-center gap-6 w-full">
              {/* Boş parantez alanı */}
              <div className="text-2xl font-black text-black shrink-0 whitespace-nowrap">
                ( <span className="w-8 inline-block"></span> )
              </div>
              
              {/* Cümle */}
              <div className="text-xl font-medium leading-relaxed pl-2 border-b-2 border-dotted border-zinc-300 flex-1 pb-1">
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

