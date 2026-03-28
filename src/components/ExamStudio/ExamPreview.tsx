import React from 'react';
import { ExamQuestion, ExamLayoutConfig } from '../../types/exam';
import { useA4EditorStore } from '../../store/useA4EditorStore';

interface ExamPreviewProps {
  questions: ExamQuestion[];
  layout: ExamLayoutConfig;
}

export const ExamPreview: React.FC<ExamPreviewProps> = ({ questions, layout }) => {
  const { grid, visibility } = layout;

  const handleExportToA4 = () => {
    const addBlock = useA4EditorStore.getState().addBlock;
    const setEditorOpen = useA4EditorStore.getState().setEditorOpen;

    questions.forEach((q, index) => {
      addBlock({
        type: 'text',
        content: `${index + 1}. ${q.questionText}`,
        style: { fontSize: 14, fontFamily: 'Lexend', fontWeight: 'bold' },
      });

      if (q.type === 'multiple-choice') {
        Object.entries(q.options).forEach(([key, value]) => {
          addBlock({
            type: 'text',
            content: `${key}) ${value}`,
            style: { fontSize: 12, fontFamily: 'Lexend', marginLeft: 20 },
          });
        });
      } else if (q.type === 'true-false') {
        addBlock({
          type: 'text',
          content: `( ) Doğru  ( ) Yanlış`,
          style: { fontSize: 12, fontFamily: 'Lexend', marginLeft: 20 },
        });
      } else if (q.type === 'fill-in-blanks') {
        addBlock({
          type: 'text',
          content: q.blankedText,
          style: { fontSize: 12, fontFamily: 'Lexend', marginLeft: 20 },
        });
      } else if (q.type === 'open-ended') {
        addBlock({
          type: 'text',
          content: `\n\n\n`,
          style: { fontSize: 12, fontFamily: 'Lexend', marginLeft: 20 },
        });
      }
    });

    setEditorOpen(true);
  };

  const getGridColsClass = (cols: number) => {
    switch (cols) {
      case 1:
        return 'grid-cols-1';
      case 2:
        return 'grid-cols-2';
      case 3:
        return 'grid-cols-3';
      case 4:
        return 'grid-cols-4';
      default:
        return 'grid-cols-1';
    }
  };

  const borderClass =
    {
      solid: 'border-solid border border-gray-300 dark:border-gray-600',
      dashed: 'border-dashed border-2 border-gray-300 dark:border-gray-600',
      dotted: 'border-dotted border-2 border-gray-300 dark:border-gray-600',
      none: 'border-none',
    }[grid.borderStyle] || 'border-none';

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden font-lexend">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/80">
        <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200">Sınav Önizlemesi</h2>
        <button
          onClick={handleExportToA4}
          disabled={questions.length === 0}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
        >
          A4'e Aktar
        </button>
      </div>

      <div className="p-8 overflow-y-auto flex-1">
        <div className="max-w-[210mm] mx-auto bg-white min-h-[297mm] shadow-lg border border-gray-200 p-12 print:shadow-none print:border-none print:p-0">
          {/* Header Metadata */}
          <div className="border-b-2 border-gray-800 pb-4 mb-6 grid grid-cols-2 gap-4 text-sm text-black">
            <div>
              {visibility.showStudentName && (
                <div className="mb-2">
                  <strong>Adı Soyadı:</strong> ........................................
                </div>
              )}
              {visibility.showUnit && (
                <div className="mb-2">
                  <strong>Ünite/Konu:</strong> ........................................
                </div>
              )}
            </div>
            <div className="text-right">
              {visibility.showDate && (
                <div className="mb-2">
                  <strong>Tarih:</strong> ..../..../20...
                </div>
              )}
              {visibility.showTitle && (
                <div className="mb-2">
                  <strong>Sınav:</strong> Türkçe Bilgi Macerası
                </div>
              )}
              {visibility.showObjective && (
                <div className="mb-2 text-xs text-gray-600">Kazanım değerlendirme</div>
              )}
            </div>
          </div>

          {/* Grid Layout for Questions */}
          <div
            className={`grid ${getGridColsClass(grid.cols)}`}
            style={{
              gap: `${grid.gap * 0.25}rem`,
              padding: `${grid.padding * 0.25}rem`,
            }}
          >
            {questions.map((q, index) => (
              <div
                key={q.id}
                className={`p-4 ${borderClass} text-black break-inside-avoid rounded-md`}
              >
                <div className="font-semibold mb-2">
                  {index + 1}. {q.questionText}
                </div>

                {/* Render specific question types */}
                {q.type === 'multiple-choice' && (
                  <div className="flex flex-col gap-2 mt-4 pl-4">
                    {Object.entries(q.options).map(([key, value]) => (
                      <div key={key} className="flex items-start gap-2">
                        <span className="font-medium">{key})</span>
                        <span>{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === 'true-false' && (
                  <div className="flex gap-4 mt-4 justify-end">
                    <div className="flex items-center gap-1 border border-gray-400 px-3 py-1 rounded">
                      <div className="w-4 h-4 border border-gray-500 rounded-full"></div> D
                    </div>
                    <div className="flex items-center gap-1 border border-gray-400 px-3 py-1 rounded">
                      <div className="w-4 h-4 border border-gray-500 rounded-full"></div> Y
                    </div>
                  </div>
                )}

                {q.type === 'fill-in-blanks' && (
                  <div className="mt-4 text-gray-700 italic">
                    {q.blankedText.split('___').map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className="inline-block w-20 border-b border-gray-500 mx-1"></span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {q.type === 'open-ended' && (
                  <div className="mt-4 h-24 border-b border-dashed border-gray-300"></div>
                )}
              </div>
            ))}

            {questions.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                Henüz soru üretilmedi. Sol panelden "Sınav Oluştur" butonuna tıklayın.
              </div>
            )}
          </div>

          {/* Solution Key */}
          {questions.length > 0 && (
            <div className="break-before-page pt-12 text-black mt-12">
              <h3 className="text-xl font-bold border-b-2 border-gray-800 pb-2 mb-6">
                Çözüm Anahtarı
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {questions.map((q, index) => (
                  <div
                    key={q.id}
                    className="text-sm bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="font-bold mb-1">{index + 1}. Soru Çözümü:</div>
                    <p className="text-gray-700 mb-2">{q.solutionKey}</p>

                    <div className="font-medium text-indigo-700">
                      {q.type === 'multiple-choice' && `Doğru Cevap: ${q.correctOption}`}
                      {q.type === 'true-false' &&
                        `Doğru Cevap: ${q.isTrue ? 'Doğru (D)' : 'Yanlış (Y)'}`}
                      {q.type === 'fill-in-blanks' && `Kelimeler: ${q.correctWords.join(', ')}`}
                      {q.type === 'open-ended' &&
                        `Beklenen Anahtar Kelimeler: ${q.expectedKeywords.join(', ')}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
