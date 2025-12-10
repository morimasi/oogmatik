
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
        <div className="absolute top-4 right-4 z-20 flex flex-col items-center bg-white p-2 rounded-lg border-2 border-black shadow-md no-print-hide">
            <img src={qrUrl} alt="QR Code" className="w-16 h-16" crossOrigin="anonymous" />
            <span className="text-[8px] font-bold mt-1 text-black uppercase tracking-wider">Dijital Çözüm</span>
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
        const itemGap = userCols > 2 ? '0.5rem' : '1.5rem';
        const itemPadding = userCols > 2 ? '0.5rem' : '1.5rem';
        const visualComplexity = userCols > 3 ? 'low' : 'high';
        
        const gridTemplateColumns = `repeat(${effectiveCols}, minmax(0, 1fr))`;
        const verticalGap = userCols < 3 ? '2.5rem' : '1rem'; 

        return {
            '--worksheet-font-size': `${adjustedFontSize}px`,
            '--worksheet-border-color': settings.borderColor,
            '--worksheet-border-width': `${settings.borderWidth}px`,
            '--worksheet-margin': `${settings.margin}px`,
            '--worksheet-gap': `${Math.max(8, settings.gap)}px`, 
            '--worksheet-vertical-gap': verticalGap,
            '--worksheet-font-family': settings.fontFamily || 'OpenDyslexic',
            '--worksheet-line-height': settings.lineHeight || 1.4,
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
    const isSinglePage = data.length === 1;

    return (
        <div className={`flex flex-col items-center ${visualStyleClass} ${isSinglePage ? '' : 'gap-16 pb-16'}`} style={variableStyle}>
            <style>{`
                .dynamic-grid {
                    display: grid;
                    grid-template-columns: var(--grid-columns);
                    gap: var(--worksheet-gap);
                    row-gap: var(--worksheet-vertical-gap);
                    width: 100%;
                    align-items: start;
                    align-content: start;
                }
                
                .worksheet-content {
                    font-family: var(--worksheet-font-family), sans-serif;
                    font-size: var(--worksheet-font-size);
                    font-weight: var(--font-weight);
                    font-style: var(--font-style);
                    line-height: var(--worksheet-line-height);
                    letter-spacing: var(--worksheet-letter-spacing);
                    text-align: var(--content-align);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    height: 100%;
                }
                
                .worksheet-content > div.flex-1 {
                    display: flex;
                    flex-direction: column;
                    justify-content: ${settings.columns <= 1 ? 'center' : 'flex-start'};
                }
                
                .worksheet-content .editable-element,
                .worksheet-content .item-card {
                    flex-direction: var(--item-direction) !important;
                    gap: var(--item-gap) !important;
                    padding: var(--item-padding) !important;
                }

                .worksheet-content[data-complexity="low"] .item-card {
                    border: 2px solid #e5e7eb !important; 
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                    border-radius: 1rem;
                    background-color: #fafafa;
                }
                
                .worksheet-content[data-complexity="high"] .item-card {
                     border: 1px solid #e5e7eb !important; 
                     box-shadow: none !important;
                }

                .style-zebra .dynamic-grid > *:nth-child(odd) {
                    background-color: rgba(0,0,0,0.03);
                }
            `}</style>

            {(data || []).map((sheetData, index) => (
                <div 
                    key={index} 
                    className="worksheet-page-wrapper"
                >
                    <div 
                        className="worksheet-item worksheet-page transition-all duration-300 ease-in-out"
                        style={pageStyle}
                    >
                        {showQR && <WorkbookQR url="https://www.bursadisleksi.com" />}

                        <div className="w-full h-full p-[10mm] relative flex flex-col">
                            
                            {isEditMode && (
                                <>
                                    <div className="absolute inset-0 edit-grid-overlay z-0 pointer-events-none"></div>
                                    <div className="absolute inset-[10mm] edit-safety-guide z-0 pointer-events-none"></div>
                                    <div className="absolute top-2 right-2 bg-indigo-600 text-white text-[10px] px-2 py-1 rounded shadow-sm opacity-50 pointer-events-none edit-handle">
                                        Sayfa {index + 1}
                                    </div>
                                </>
                            )}

                            <div 
                                className="worksheet-scaler worksheet-content relative z-10 flex-1 flex flex-col justify-center"
                                style={{ width: '100%', height: 'auto' }}
                                data-complexity={settings.columns > 3 ? 'high' : 'low'}
                            >
                                <div className="mb-4 pb-1 border-b border-black flex justify-between items-end shrink-0 w-full" style={{ display: 'var(--display-student-info)' }}>
                                    <div className="flex gap-8 text-sm text-black">
                                        <div className="flex gap-2 items-baseline">
                                            <span className="text-[10px] uppercase font-bold text-zinc-500">Ad Soyad:</span>
                                            <EditableText value={studentProfile?.name || ''} tag="span" className="min-w-[150px] border-b border-dotted border-zinc-400" />
                                        </div>
                                        <div className="flex gap-2 items-baseline">
                                            <span className="text-[10px] uppercase font-bold text-zinc-500">Sınıf:</span>
                                            <EditableText value={studentProfile?.grade || ''} tag="span" className="min-w-[50px] border-b border-dotted border-zinc-400" />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-baseline text-sm text-black">
                                        <span className="text-[10px] uppercase font-bold text-zinc-500">Tarih:</span>
                                        <EditableText value={studentProfile?.date || ''} tag="span" className="min-w-[80px] border-b border-dotted border-zinc-400" />
                                    </div>
                                </div>

                                <EditableElement id="main-content" className="flex-1 w-full h-full flex flex-col">
                                    <div className="flex-1 flex flex-col">
                                        <ErrorBoundary>
                                            <SheetRenderer activityType={activityType} data={sheetData} />
                                        </ErrorBoundary>
                                    </div>
                                </EditableElement>
                                
                                <div 
                                    className="mt-auto w-full pt-8 px-4 flex justify-between items-center text-[10px] text-zinc-400 pointer-events-none"
                                    style={{ display: 'var(--display-footer)' }}
                                >
                                    <span className="uppercase tracking-widest font-bold">Bursa Disleksi AI</span>
                                    <span className="font-mono">{index + 1} / {data.length}</span>
                                </div>
                            </div>
                            
                            {(overlayItems || []).filter(item => item.pageIndex === index).map(item => (
                                <EditableElement 
                                    key={item.id} 
                                    initialPos={{x: item.x, y: item.y}} 
                                    className="absolute z-50 cursor-move"
                                    style={{left: 0, top: 0}}
                                >
                                    {item.type === 'text' ? (
                                        <div className="bg-white/80 border border-dashed border-zinc-400 p-2 rounded min-w-[100px]">
                                            <EditableText value={item.content} tag="div" className="text-lg font-bold" />
                                        </div>
                                    ) : (
                                        <div className="w-24 h-24">
                                            <img src={item.content} className="w-full h-full object-contain drop-shadow-md" alt="Sticker" />
                                        </div>
                                    )}
                                </EditableElement>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default React.memo(Worksheet);
