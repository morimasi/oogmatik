
import React, { useMemo } from 'react';
import { ActivityType, WorksheetData, StyleSettings, StudentProfile, OverlayItem } from '../types';
import { getBorderCSS } from './VisualAssets';
import { EditableElement, EditableText, useEditable } from './Editable';
import { ErrorBoundary } from './ErrorBoundary';
import { SheetRenderer } from './SheetRenderer';

interface WorksheetProps {
    activityType: ActivityType | null;
    data: WorksheetData;
    settings: StyleSettings;
    studentProfile?: StudentProfile | null;
    overlayItems?: OverlayItem[];
    showQR?: boolean;
}

const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, settings, studentProfile, showQR }) => {
    const { isEditMode } = useEditable();

    const variableStyle = useMemo(() => {
        const userCols = Math.max(1, settings.columns || 1);
        const baseFontSize = settings.fontSize || 16;
        
        return {
            '--worksheet-font-size': `${baseFontSize}px`,
            '--worksheet-border-color': settings.borderColor,
            '--worksheet-border-width': `${settings.borderWidth}px`,
            '--worksheet-margin': `${settings.margin}px`,
            '--worksheet-gap': `${Math.max(2, settings.gap)}px`, 
            '--worksheet-font-family': settings.fontFamily || 'OpenDyslexic',
            '--worksheet-line-height': settings.lineHeight || 1.3,
            '--worksheet-letter-spacing': `${settings.letterSpacing || 0}px`,
            '--content-align': settings.contentAlign || 'center',
            '--font-weight': settings.fontWeight || 'normal',
            '--font-style': settings.fontStyle || 'normal',
            '--grid-columns': `repeat(${userCols}, minmax(0, 1fr))`,
        } as React.CSSProperties;
    }, [settings]);

    const pageStyle = useMemo(() => {
        const isLandscape = settings.orientation === 'landscape';
        return {
            width: isLandscape ? '297mm' : '210mm',
            minHeight: isLandscape ? '210mm' : '297mm',
            backgroundColor: 'white',
            color: 'black',
            position: 'relative' as const,
            boxSizing: 'border-box' as const,
            marginBottom: '40px', // Sayfalar arası dikey boşluk
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.2)',
            ...getBorderCSS(settings.themeBorder || 'simple', settings.borderColor, settings.borderWidth)
        };
    }, [settings.orientation, settings.themeBorder, settings.borderColor, settings.borderWidth]);

    if (!data || !activityType || data.length === 0) return null;

    return (
        <div className="flex flex-col items-center w-full" style={variableStyle}>
            {data.map((pageData, index) => (
                <div key={index} id={`page-${index}`} className="worksheet-page print-page" style={pageStyle}>
                    
                    {/* Header Strip */}
                    <div className="w-full px-10 py-6 flex justify-between items-end border-b-2 border-zinc-900 mb-8" style={{ display: settings.showStudentInfo ? 'flex' : 'none' }}>
                        <div className="flex gap-10">
                            <div className="flex flex-col">
                                <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Öğrenci</span>
                                <div className="h-6 border-b border-zinc-200 min-w-[200px] font-bold text-sm">
                                    <EditableText value={studentProfile?.name} tag="span" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Sınıf</span>
                                <div className="h-6 border-b border-zinc-200 min-w-[50px] font-bold text-sm text-center">
                                    <EditableText value={studentProfile?.grade} tag="span" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Tarih</span>
                            <div className="h-6 border-b border-zinc-200 min-w-[80px] font-bold text-sm text-right">
                                <EditableText value={studentProfile?.date || new Date().toLocaleDateString('tr-TR')} tag="span" />
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="w-full px-10 py-2 flex flex-col flex-1 relative z-10">
                        <style>{`
                            .worksheet-content {
                                font-family: var(--worksheet-font-family), sans-serif;
                                font-size: var(--worksheet-font-size);
                                line-height: var(--worksheet-line-height);
                                letter-spacing: var(--worksheet-letter-spacing);
                                text-align: var(--content-align);
                                font-weight: var(--font-weight);
                                font-style: var(--font-style);
                                height: 100%;
                            }
                            .dynamic-grid {
                                display: grid;
                                grid-template-columns: var(--grid-columns);
                                gap: var(--worksheet-gap);
                                width: 100%;
                            }
                        `}</style>
                        <div className="worksheet-content">
                            <ErrorBoundary>
                                <SheetRenderer activityType={activityType} data={pageData} />
                            </ErrorBoundary>
                        </div>
                    </div>

                    {/* Footer Area */}
                    <div className="w-full px-10 pb-4 flex justify-between items-end text-[7px] text-zinc-300 font-mono mt-auto" style={{ display: settings.showFooter ? 'flex' : 'none' }}>
                        <span>Bursa Disleksi AI • {new Date().getFullYear()}</span>
                        <span className="uppercase tracking-[0.3em] font-black">{pageData.title || 'Çalışma Sayfası'}</span>
                    </div>

                    {isEditMode && (
                        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[9px] px-2 py-1 rounded shadow-lg font-bold uppercase tracking-widest opacity-50 no-print">
                            Düzenleme Modu
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Worksheet;
