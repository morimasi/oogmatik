
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

const WorkbookQR = React.memo(({ url }: { url: string }) => {
    return (
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center bg-white p-1 rounded-lg border border-black shadow-md no-print-hide scale-75 origin-top-right">
            <img src={`https://api.qrserver.com/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`} alt="QR Code" className="w-12 h-12" crossOrigin="anonymous" />
            <span className="text-[6px] font-bold mt-0.5 text-black uppercase tracking-wider">Dijital</span>
        </div>
    );
});

const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, settings, studentProfile, overlayItems, showQR }) => {
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
            '--display-pedagogical-note': settings.showPedagogicalNote ? 'flex' : 'none',
            '--display-student-info': settings.showStudentInfo ? 'flex' : 'none',
            '--display-footer': settings.showFooter ? 'flex' : 'none',
            '--display-title': settings.showTitle ? 'block' : 'none',
            '--display-instruction': settings.showInstruction ? 'block' : 'none',
            '--display-image': settings.showImage ? 'block' : 'none',
        } as React.CSSProperties;
    }, [settings]);

    const pageStyle = useMemo(() => {
        const isLandscape = settings.orientation === 'landscape';
        return {
            width: isLandscape ? '297mm' : '210mm',
            minHeight: isLandscape ? '210mm' : '297mm',
            height: 'auto', 
            position: 'relative' as const,
            backgroundColor: 'white',
            color: 'black',
            boxSizing: 'border-box' as const,
            overflow: 'visible',
            margin: '0 auto 20px auto', 
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            ...getBorderCSS(settings.themeBorder || 'simple', settings.borderColor, settings.borderWidth)
        };
    }, [settings.orientation, settings.themeBorder, settings.borderColor, settings.borderWidth]);

    if (!data || !activityType || data.length === 0) return null;

    return (
        <div className={`worksheet-container flex flex-col items-center w-full`} style={variableStyle}>
            {data.map((pageData, index) => (
                <div key={index} className="relative group/page flex flex-col items-center w-full break-after-page">
                    <div className="page-label-container absolute -top-8 left-0 bg-zinc-800 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg no-print">
                        SAYFA {index + 1} / {data.length}
                    </div>

                    <div id={`page-${index}`} className="worksheet-page print-page" style={pageStyle}>
                        
                        {/* Compact Header Area */}
                        <div className="w-full px-4 py-2 flex justify-between items-end border-b-2 border-zinc-900 mb-2" style={{ display: 'var(--display-student-info)' }}>
                            <div className="flex gap-6">
                                <div className="flex flex-col text-left">
                                    <span className="text-[7px] text-zinc-400 uppercase font-black">Öğrenci Adı</span>
                                    <div className="h-5 border-b border-zinc-300 min-w-[150px] font-bold text-xs leading-none truncate">
                                        <EditableText value={studentProfile?.name} tag="span" />
                                    </div>
                                </div>
                                <div className="flex flex-col text-center">
                                    <span className="text-[7px] text-zinc-400 uppercase font-black">Sınıf</span>
                                    <div className="h-5 border-b border-zinc-300 min-w-[40px] font-bold text-xs leading-none truncate text-center">
                                        <EditableText value={studentProfile?.grade} tag="span" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end text-right">
                                <span className="text-[7px] text-zinc-400 uppercase font-black">Tarih</span>
                                <div className="h-5 border-b border-zinc-300 min-w-[70px] font-bold text-xs leading-none text-right">
                                    <EditableText value={studentProfile?.date || new Date().toLocaleDateString('tr-TR')} tag="span" />
                                </div>
                            </div>
                        </div>

                        {showQR && <WorkbookQR url="https://bursadisleksi.com" />}

                        {/* Content Area - Filling available space */}
                        <div className="w-full px-4 py-2 flex flex-col relative z-10 flex-1">
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
                                    display: flex;
                                    flex-direction: column;
                                }
                                .dynamic-grid {
                                    display: grid;
                                    grid-template-columns: var(--grid-columns);
                                    gap: var(--worksheet-gap);
                                    width: 100%;
                                    flex: 1;
                                }
                            `}</style>
                            <div className="worksheet-content flex-1">
                                <ErrorBoundary>
                                    <SheetRenderer activityType={activityType} data={pageData} />
                                </ErrorBoundary>
                            </div>
                        </div>

                        {/* Footer Area */}
                        <div className="w-full px-4 pb-1 flex justify-between items-end text-[6px] text-zinc-400 font-mono mt-auto" style={{ display: 'var(--display-footer)' }}>
                            <span>Bursa Disleksi AI © {new Date().getFullYear()}</span>
                            <span className="uppercase tracking-widest">{pageData.title || 'Çalışma Sayfası'}</span>
                        </div>

                        {isEditMode && (
                            <div className="absolute top-2 left-2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded shadow-sm opacity-50 hover:opacity-100 transition-opacity cursor-default edit-handle no-print">
                                Düzenle
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Worksheet;
