
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
            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(url)}`} alt="QR Code" className="w-12 h-12" crossOrigin="anonymous" />
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
            // DİKKAT: Sabit yükseklik (height) kaldırıldı, min-height eklendi.
            // Bu sayede içerik ne kadar uzun olursa olsun sayfa aşağı doğru uzayacaktır.
            minHeight: isLandscape ? '210mm' : '297mm',
            height: 'auto', 
            padding: `0mm`, 
            position: 'relative' as const,
            backgroundColor: 'white',
            color: 'black',
            boxSizing: 'border-box' as const,
            overflow: 'visible', // Taşan içeriğin görünmesi için
            margin: '0 auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            ...getBorderCSS(settings.themeBorder || 'simple', settings.borderColor, settings.borderWidth)
        };
    }, [settings.orientation, settings.themeBorder, settings.borderColor, settings.borderWidth]);

    if (!data || !activityType || data.length === 0) return null;

    return (
        <div className={`flex flex-col items-center gap-[60px] py-[60px] bg-transparent w-full`} style={variableStyle}>
            <style>{`
                .dynamic-grid {
                    display: grid;
                    grid-template-columns: var(--grid-columns);
                    gap: var(--worksheet-gap);
                    width: 100%;
                    align-items: stretch;
                    align-content: start;
                }
                .worksheet-content {
                    font-family: var(--worksheet-font-family), sans-serif;
                    font-size: var(--worksheet-font-size);
                    line-height: var(--worksheet-line-height);
                    letter-spacing: var(--worksheet-letter-spacing);
                    text-align: var(--content-align);
                    font-weight: var(--font-weight);
                    font-style: var(--font-style);
                    flex: 1; /* İçeriğin sayfayı doldurmasını sağla */
                }
                @media print {
                    .flex-col.gap-\[60px\] { gap: 0 !important; padding: 0 !important; }
                    .worksheet-page { margin: 0 !important; box-shadow: none !important; break-after: page; page-break-after: always; border: none !important; }
                    .page-label-container { display: none !important; }
                }
            `}</style>

            {data.map((pageData, index) => (
                <div key={index} className="relative group/page flex flex-col items-center">
                    {/* Page Number Badge Outside Paper */}
                    <div className="page-label-container absolute -top-10 left-0 bg-zinc-800 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                        Sayfa {index + 1} / {data.length}
                    </div>

                    <div id={`page-${index}`} className="worksheet-page print-page" style={pageStyle}>
                        
                        {/* Header Area */}
                        <div className="w-full px-12 py-8 flex justify-between items-end border-b border-zinc-100" style={{ display: 'var(--display-student-info)' }}>
                            <div className="flex gap-8">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Ad Soyad</span>
                                    <div className="h-6 border-b border-zinc-800 min-w-[200px] font-bold text-lg leading-none truncate">
                                        <EditableText value={studentProfile?.name} tag="span" />
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Sınıf</span>
                                    <div className="h-6 border-b border-zinc-800 min-w-[80px] font-bold text-lg leading-none truncate text-center">
                                        <EditableText value={studentProfile?.grade} tag="span" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Tarih</span>
                                <div className="h-6 border-b border-zinc-800 min-w-[120px] font-bold text-lg leading-none text-right">
                                    <EditableText value={studentProfile?.date || new Date().toLocaleDateString('tr-TR')} tag="span" />
                                </div>
                            </div>
                        </div>

                        {showQR && <WorkbookQR url="https://bursadisleksi.com" />}

                        {/* Content Area - Fixed PT to accommodate header */}
                        <div className="w-full px-12 py-10 flex flex-col worksheet-content relative z-10">
                            <ErrorBoundary>
                                <SheetRenderer activityType={activityType} data={pageData} />
                            </ErrorBoundary>
                        </div>

                        {/* Footer Area - Padding added to prevent content overlap */}
                        <div className="w-full px-12 pb-6 flex justify-between items-end text-[10px] text-zinc-400 font-mono mt-auto" style={{ display: 'var(--display-footer)' }}>
                            <span>Bursa Disleksi AI © {new Date().getFullYear()}</span>
                            <span>{pageData.title || 'Çalışma Sayfası'}</span>
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
