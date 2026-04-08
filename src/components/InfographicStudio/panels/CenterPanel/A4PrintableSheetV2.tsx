import React from 'react';
import { CompositeWorksheet, WorksheetWidget } from '../../../../types/worksheet';
import { NativeInfographicRenderer } from '../../../NativeInfographicRenderer';
import { GraphicRenderer } from '../../../../../components/MatSinavStudyosu/components/GraphicRenderer';
import { CompactLayoutEngine } from '../../../../services/layout/CompactLayoutEngine';
import { GridWrapper } from '../../layout/GridWrapper';

interface A4PrintableSheetV2Props {
  worksheet: CompositeWorksheet;
  layoutEngine?: CompactLayoutEngine;
  hideWrapper?: boolean;
}

const WidgetRenderer = ({ widget }: { widget: WorksheetWidget }) => {
  return (
    <div className="widget-container">
      {widget.type === 'infographic' && widget.data?.syntax && (
        <div className="infographic-widget">
          <NativeInfographicRenderer syntax={widget.data.syntax} height="auto" className="w-full" />
        </div>
      )}

      {widget.type === 'math_graphic' && widget.data && (
        <div className="math-widget my-4">
          <GraphicRenderer grafik={widget.data as any} />
          {widget.question && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
              <p className="font-lexend text-slate-800">
                {widget.question.soru_metni || widget.question.soruMetni}
              </p>
              {widget.question.secenekler && (
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  {Object.entries(widget.question.secenekler).map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <span className="font-bold">{k})</span> {v as string}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {widget.type === 'reading_passage' && (widget as any).data && (
        <div className="reading-widget my-4">
          <h2 className="text-lg font-bold font-lexend mb-2">{widget.title || 'Okuma Parçası'}</h2>
          <p className="font-lexend text-slate-700 whitespace-pre-wrap leading-relaxed">
            {(widget as any).data.text || (widget as any).text}
          </p>
        </div>
      )}

      {widget.type === 'quiz_block' && (widget as any).data && (
        <div className="quiz-widget my-6">
          <h2 className="text-lg font-bold font-lexend mb-4">{widget.title || 'Sorular'}</h2>
          <div className="space-y-6">
            {((widget as any).data.questions || []).map((q: any, i: number) => (
              <div key={i} className="quiz-question">
                <p className="font-lexend text-slate-800 font-medium mb-3">
                  {i + 1}. {q.soru_metni || q.soruMetni}
                </p>
                {q.secenekler && (
                  <div className="grid grid-cols-2 gap-3 text-sm font-lexend">
                    {Object.entries(q.secenekler).map(([k, v]) => (
                      <div key={k} className="flex gap-2 p-2 border border-slate-200 rounded">
                        <span className="font-bold">{k})</span> <span>{v as string}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const A4PrintableSheetV2: React.FC<A4PrintableSheetV2Props> = ({
  worksheet,
  layoutEngine,
  hideWrapper = false,
}) => {
  let dynamicStyles = { padding: '20mm' };
  let dynamicClasses = '';

  if (layoutEngine) {
    const margins = layoutEngine.optimizeMargins();
    dynamicStyles = {
      padding: `${margins.top}mm ${margins.right}mm ${margins.bottom}mm ${margins.left}mm`,
    };

    const tClass = layoutEngine.exportTailwindClasses();
    dynamicClasses = tClass.container;
  }

  // Gelişmiş Sayfalama Mantığı
  const widgetsPerPage = 4;
  const pages: WorksheetWidget[][] = [];
  
  for (let i = 0; i < worksheet.widgets.length; i += widgetsPerPage) {
    pages.push(worksheet.widgets.slice(i, i + widgetsPerPage));
  }

  if (pages.length === 0) pages.push([]);

  const content = pages.map((pageWidgets, pageIndex) => (
    <div
      key={pageIndex}
      className={`infographic-page-container bg-white shadow-2xl relative flex flex-col ${dynamicClasses}`}
      style={{
        width: '210mm',
        minHeight: '297mm',
        ...dynamicStyles,
      }}
    >
      {/* Header */}
      {pageIndex === 0 && (
         <div className="mb-6 border-b-2 border-slate-800 pb-4">
          <h1 className="text-2xl font-bold font-lexend text-slate-800 text-center mb-2">
            {worksheet.title || worksheet.topic || 'Çalışma Kağıdı'}
          </h1>
          <div className="flex justify-between text-xs text-slate-500 font-lexend">
            <span>Konu: {worksheet.topic}</span>
            <span>
              Seviye: {worksheet.difficultyLevel} | Yaş: {worksheet.ageGroup}
            </span>
          </div>
        </div>
      )}

      {/* Widgets */}
      <div className="flex-1 space-y-8">
        {layoutEngine ? (
          <GridWrapper engine={layoutEngine}>
            {pageWidgets.map((widget: WorksheetWidget) => (
              <WidgetRenderer key={widget.id} widget={widget} />
            ))}
          </GridWrapper>
        ) : (
          pageWidgets.map((widget: WorksheetWidget) => (
            <WidgetRenderer key={widget.id} widget={widget} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between items-end text-[10px] text-slate-400 font-lexend">
         <div className="text-left">
            <p>Oogmatik Premium Worksheet Motoru</p>
            <p>Onay: {worksheet.status === 'approved' ? '✅' : '⏳'}</p>
         </div>
         <div className="text-right">
            <span>Sayfa {pageIndex + 1} / {pages.length}</span>
         </div>
      </div>
    </div>
  ));

  if (hideWrapper) {
    return <>{content}</>;
  }

  return (
    <div className="flex-1 overflow-y-auto w-full h-full p-6 flex flex-col items-center gap-8 bg-transparent custom-scrollbar">
      {content}
    </div>
  );
};
