import React from 'react';
import { CompositeWorksheet, WorksheetWidget } from '../../../../types/worksheet';
import { NativeInfographicRenderer } from '../../../NativeInfographicRenderer';
import { GraphicRenderer } from '../../../../../components/MatSinavStudyosu/components/GraphicRenderer';

interface A4PrintableSheetV2Props {
    worksheet: CompositeWorksheet;
}

export const A4PrintableSheetV2: React.FC<A4PrintableSheetV2Props> = ({ worksheet }) => {
    return (
        <div className="flex-1 overflow-y-auto w-full h-full p-6 flex justify-center bg-transparent">
            <div
                id="a4-printable-sheet"
                className="bg-white w-full h-full overflow-hidden print:w-auto print:h-auto print:shadow-none print:border-none print:m-0"
                style={{ padding: '20mm' }}
            >
                {/* Header */}
                <div className="mb-6 border-b-2 border-slate-800 pb-4">
                    <h1 className="text-2xl font-bold font-lexend text-slate-800 text-center mb-2">
                        {worksheet.title || worksheet.topic || 'Çalışma Kağıdı'}
                    </h1>
                    <div className="flex justify-between text-xs text-slate-500 font-lexend">
                        <span>Konu: {worksheet.topic}</span>
                        <span>Seviye: {worksheet.difficultyLevel} | Yaş: {worksheet.ageGroup}</span>
                    </div>
                </div>

                {/* Widgets */}
                <div className="space-y-8">
                    {worksheet.widgets.map((widget: WorksheetWidget) => {
                        return (
                            <div key={widget.id} className="widget-container">
                                {widget.type === 'infographic' && widget.data?.syntax && (
                                    <div className="infographic-widget">
                                        <NativeInfographicRenderer
                                            syntax={widget.data.syntax}
                                            height="auto"
                                            className="w-full"
                                        />
                                    </div>
                                )}

                                {widget.type === 'math_graphic' && widget.data && (
                                    <div className="math-widget my-4">
                                        <GraphicRenderer grafik={widget.data as any} />
                                        {widget.question && (
                                            <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                                <p className="font-lexend text-slate-800">{widget.question.soru_metni || widget.question.soruMetni}</p>
                                                {/* Secenekler vs */}
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
                    })}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-4 border-t border-slate-200 text-center text-xs text-slate-400 font-lexend print:absolute print:bottom-4 print:w-full">
                    <p>Oogmatik Premium Worksheet Motoru ile Üretilmiştir</p>
                    <p>Onay Durumu: {worksheet.status === 'approved' ? '✅ Onaylandı' : '⏳ Bekliyor'}</p>
                </div>
            </div>
        </div>
    );
};