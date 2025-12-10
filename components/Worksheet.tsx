
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
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`;
    
    return (
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center bg-white p-1 rounded-lg border border-black shadow-md no-print-hide scale-75 origin-top-right">
            <img src={qrUrl} alt="QR Code" className="w-12 h-12" crossOrigin="anonymous" />
            <span className="text-[6px] font-bold mt-0.5 text-black uppercase tracking-wider">Dijital Çözüm</span>
        </div>
    );
});

const Worksheet: React.FC<WorksheetProps> = ({ activityType, data, settings, studentProfile, overlayItems, showQR }) => {
    const { isEditMode } = useEditable();

    const variableStyle = useMemo(() => {
        const userCols = Math.max(1, settings.columns || 1);
        const baseFontSize = settings.fontSize || 16;
        const effectiveCols = userCols;
        
        const densityFactor = Math.pow(userCols, 0.4); 
        const adjustedFontSize = Math.round(baseFontSize / densityFactor);
        
        const itemDirection = userCols > 2 ? 'column' : 'row';
        const itemGap = userCols > 2 ? '0.25rem' : '0.5rem';
        const itemPadding = userCols > 2 ? '0.25rem' : '0.5rem';
        const visualComplexity = userCols > 3 ? 'low' : 'high';
        
        const gridTemplateColumns = `repeat(${effectiveCols}, minmax(0, 1fr))`;
        // Reduce vertical gap to fit more, compact mode
        const verticalGap = userCols < 3 ? '0.5rem' : '0.25rem'; 

        return {
            '--worksheet-font-size': `${adjustedFontSize}px`,
            '--worksheet-border-color': settings.borderColor,
            '--worksheet-border-width': `${settings.borderWidth}px`,
            '--worksheet-margin': `${settings.margin}px`,
            '--worksheet-gap': `${Math.max(2, settings.gap)}px`, 
            '--worksheet-vertical-gap': verticalGap,
            '--worksheet-font-family': settings.fontFamily || 'OpenDyslexic',
            '--worksheet-line-height': settings.lineHeight || 1.3,
            '--worksheet-letter-spacing': `${settings.letterSpacing || 0}px`,
            '--content-align': settings.contentAlign || 'center',
            '--font-weight': settings.fontWeight || 'normal',
            '--font-style': settings.fontStyle || 'normal',
            '--grid-columns': gridTemplateColumns,
            '--item-direction': itemDirection,
            '--item-gap': itemGap,
            '--item-padding': itemPadding,
            '--visual-complexity': visualComplexity,
            '--display-pedagogical-note': settings.showPedagogicalNote ? 'flex' : 'none',
            '--display-mascot': settings.showMascot ? 'block' : 'none',
            '--display-student-info': settings.showStudentInfo ? 'flex' : 'none',
            '--display-footer': settings.showFooter ? 'flex' : 'none',
            '--display-title': settings.showTitle ? 'block' : 'none',
            '--display-instruction': settings.showInstruction ? 'block' : 'none',
            '--display-image': settings.showImage ? 'block' : 'none',
        } as React.CSSProperties;
    }, [settings]);

    const pageStyle = useMemo(() => {
        const isLandscape = settings.orientation === 'landscape';
        const pageWidth = isLandscape ? '297mm' : '210mm';
        const pageHeight = isLandscape ? '210mm' : '297mm';
        
        return {
            width: pageWidth,
            height: pageHeight,
            minHeight: pageHeight,
            padding: `0mm`, 
            position: 'relative' as const,
            backgroundColor: 'white',
            color: 'black',
            boxSizing: 'border-box' as const,
            overflow: 'hidden',
            margin: '0 auto',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1), 0 10px 15px rgba(0,0,0,0.05)',
            ...getBorderCSS(settings.themeBorder || 'simple', settings.borderColor, settings.borderWidth)
        };
    }, [settings.orientation, settings.themeBorder, settings.borderColor, settings.borderWidth]);

    if (!data || !activityType || data.length === 0) return null;

    const visualStyleClass = `style-${settings.visualStyle || 'card'}`;
    // const isSinglePage = data.length === 1;

    return (
        <div className={`flex flex-col items-center ${visualStyleClass} gap-8 pb-8`} style={variableStyle}>
            <style>{`
                .dynamic-grid {
                    display: grid;
                    grid-template-columns: var(--grid-columns);
                    gap: var(--worksheet-gap);
                    row-gap: var(--worksheet-vertical-gap);
                    width: 100%;
                    align-items: stretch; /* Items stretch to fill height in row */
                    align-content: start;
                    height: 100%;
                }
                
                .worksheet-content {
                    font-family: var(--worksheet-font-family), sans-serif;
                    font-size: var(--worksheet-font-size);
                    line-height: var(--worksheet-line-height);
                    letter-spacing: var(--worksheet-letter-spacing);
                    text-align: var(--content-align);
                    font-weight: var(--font-weight);
                    font-style: var(--font-style);
                }

                .item-card {
                    padding: var(--item-padding);
                }
            `}</style>

            {data.map((pageData, index) => (
                <div key={index} id={`page-${index}`} className="worksheet-page" style={pageStyle}>
                    
                    {/* Student Info Strip */}
                    <div className="absolute top-0 left-0 w-full px-12 py-6 flex justify-between items-end border-b border-zinc-200" style={{ display: 'var(--display-student-info)' }}>
                        <div className="flex gap-8">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Ad Soyad</span>
                                <div className="h-6 border-b border-zinc-800 min-w-[200px] font-bold text-lg leading-none">
                                    <EditableText value={studentProfile?.name} tag="span" />
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Sınıf / No</span>
                                <div className="h-6 border-b border-zinc-800 min-w-[100px] font-bold text-lg leading-none">
                                    <EditableText value={studentProfile?.grade} tag="span" />
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Tarih</span>
                            <div className="h-6 border-b border-zinc-800 min-w-[120px] font-bold text-lg leading-none text-right">
                                <EditableText value={studentProfile?.date} tag="span" />
                            </div>
                        </div>
                    </div>

                    {/* QR Code */}
                    {showQR && <WorkbookQR url="https://bursadisleksi.com" />}

                    {/* Main Content Container */}
                    <div className="w-full h-full pt-24 px-12 pb-16 flex flex-col worksheet-content relative z-10">
                        <ErrorBoundary>
                            <SheetRenderer activityType={activityType} data={pageData} />
                        </ErrorBoundary>
                    </div>

                    {/* Overlay Items */}
                    {overlayItems && overlayItems.filter(item => item.pageIndex === index).map(item => (
                        <div key={item.id} className="absolute z-50 pointer-events-auto" style={{ left: item.x, top: item.y }}>
                             <EditableElement id={item.id} type={item.type}>
                                 {item.type === 'text' ? (
                                     <EditableText value={item.content} tag="div" className="bg-transparent" />
                                 ) : (
                                     <img src={item.content} alt="sticker" className="w-24 h-24 object-contain" />
                                 )}
                             </EditableElement>
                        </div>
                    ))}

                    {/* Footer */}
                    <div className="absolute bottom-4 left-0 w-full px-12 flex justify-between items-end text-[10px] text-zinc-400 font-mono" style={{ display: 'var(--display-footer)' }}>
                        <span>Bursa Disleksi AI © {new Date().getFullYear()}</span>
                        <span>Sayfa {index + 1} / {data.length}</span>
                    </div>

                    {/* Edit Handles (Only in Edit Mode) */}
                    {isEditMode && (
                        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs px-2 py-1 rounded shadow-sm opacity-50 hover:opacity-100 transition-opacity cursor-default edit-handle no-print">
                            Sayfa {index + 1}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default Worksheet;
