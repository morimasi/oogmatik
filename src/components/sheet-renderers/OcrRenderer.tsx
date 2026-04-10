import React from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { GraphicRenderer } from '../../../components/MatSinavStudyosu/components/GraphicRenderer';

type OcrData = {
  content?: string;
  grafikVeri?: Record<string, unknown>;
  title?: string;
  pedagogicalNote?: string;
  targetSkills?: string[];
};

type Props = {
  data: OcrData;
};

const ALLOWED_TAGS = [
  'div', 'p', 'span', 'strong', 'em', 'u', 'b', 'i', 'br',
  'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'thead', 'tbody',
  'h1', 'h2', 'h3', 'h4',
] as const;

export const OcrRenderer: React.FC<Props> = ({ data }) => {
  const sanitizedContent = data.content
    ? DOMPurify.sanitize(String(data.content), {
        ALLOWED_TAGS: [...ALLOWED_TAGS],
        ALLOWED_ATTR: ['class'],
      })
    : '';

  return (
    <div className="ocr-content-sheet font-['Lexend'] p-4 print:p-2">
      {data.title && (
        <h2 className="text-xl font-black mb-3 text-center uppercase tracking-wide">
          {data.title}
        </h2>
      )}

      {data.grafikVeri && (
        <div className="visual-block flex justify-center my-4 print:my-2">
          <GraphicRenderer grafik={data.grafikVeri as any} />
        </div>
      )}

      {sanitizedContent && (
        <div
          className="content-block text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      )}

      {data.pedagogicalNote && (
        <div className="pedagogical-note mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg print:hidden">
          <p className="text-xs text-indigo-700">
            <strong>Öğretmen Notu:</strong> {data.pedagogicalNote}
          </p>
        </div>
      )}
    </div>
  );
};

export default OcrRenderer;
