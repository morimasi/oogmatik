
import React, { useMemo, useState, useEffect } from 'react';
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

const ReadingRuler = ({ settings }: { settings: StyleSettings }) => {
    const [y, setY] = useState(200);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!settings.focusMode) return;
            const worksheet = document.querySelector('.worksheet-page');
            if (worksheet) {
                const rect = worksheet.getBoundingClientRect();
                const relativeY = e.clientY - rect.top;

                // Lerp benzeri yumuşak geçiş için doğrudan set edebiliriz veya CSS transition kullanabiliriz
                setY(relativeY);
                setIsHovering(true);
            }
        };
        const handleMouseLeave = () => setIsHovering(false);

        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [settings.focusMode]);

    if (!settings.focusMode) return null;

    const rulerHeight = settings.rulerHeight || 80;

    return (
        <div className={`absolute inset-0 pointer-events-none z-[100] no-print transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
            {/* Top Mask */}
            <div
                className="absolute top-0 left-0 w-full bg-black transition-all duration-150 ease-out"
                style={{ height: `${y - (rulerHeight / 2)}px`, opacity: settings.maskOpacity || 0.4 }}
            />
            {/* The Ruler - Spotlight Effect */}
            <div
                className="absolute left-0 w-full border-y-2 transition-all duration-150 ease-out flex items-center justify-center"
                style={{
                    top: `${y - (rulerHeight / 2)}px`,
                    height: `${rulerHeight}px`,
                    borderColor: settings.rulerColor || '#6366f1',
                    backgroundColor: `${settings.rulerColor || '#6366f1'}10`,
                    boxShadow: `0 0 40px ${settings.rulerColor || '#6366f1'}20`
                }}
            >
                <div
                    className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-lg"
                    style={{ backgroundColor: settings.rulerColor || '#6366f1' }}
                >
                    Odak Alanı
                </div>
            </div>
            {/* Bottom Mask */}
            <div
                className="absolute bottom-0 left-0 w-full bg-black transition-all duration-150 ease-out"
                style={{ top: `${y + (rulerHeight / 2)}px`, opacity: settings.maskOpacity || 0.4 }}
            />
        </div>
    );
};

const Worksheet = ({ activityType, data, settings, studentProfile, showQR }: WorksheetProps) => {
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
            '--worksheet-font-family': settings.fontFamily || 'Lexend',
            '--worksheet-line-height': settings.lineHeight || 1.4,
            '--worksheet-letter-spacing': `${settings.letterSpacing || 0}px`,
            '--worksheet-word-spacing': `${settings.wordSpacing || 0}px`,
            '--worksheet-paragraph-spacing': `${settings.paragraphSpacing || 20}px`,
            '--content-align': settings.contentAlign || 'center',
            '--font-weight': settings.fontWeight || 'normal',
            '--font-style': settings.fontStyle || 'normal',
            '--grid-columns': `repeat(${userCols}, minmax(0, 1fr))`,
            '--display-title': settings.showTitle ? 'block' : 'none',
            '--display-instruction': settings.showInstruction ? 'block' : 'none',
            '--display-pedagogical-note': settings.showPedagogicalNote ? 'block' : 'none',
            '--display-image': settings.showImage ? 'block' : 'none',
        } as React.CSSProperties;
    }, [settings]);

    const pageStyle = useMemo(() => {
        const isLandscape = settings.orientation === 'landscape';
        return {
            width: isLandscape ? '297mm' : '210mm',
            minHeight: isLandscape ? '210mm' : '297mm',
            backgroundColor: 'white',
            color: 'black',
            colorScheme: 'light' as any,
            position: 'relative' as const,
            boxSizing: 'border-box' as const,
            marginBottom: '40px',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.2)',
            ...getBorderCSS(settings.themeBorder || 'simple', settings.borderColor, settings.borderWidth)
        };
    }, [settings.orientation, settings.themeBorder, settings.borderColor, settings.borderWidth]);

    if (!data || !activityType) return null;

    // Birden fazla çalışma sayfası varsa (worksheetCount > 1), hepsini render et
    const worksheets = Array.isArray(data) ? data : [data];

    if (worksheets.length === 0) return null;

    return (
        <div className="flex flex-col items-center w-full" style={variableStyle}>
            {worksheets.map((ws, idx) => (
                <ErrorBoundary key={ws.id || idx}>
                    <SheetRenderer
                        activityType={activityType}
                        data={ws}
                        studentProfile={studentProfile}
                        settings={settings}
                    />
                </ErrorBoundary>
            ))}
        </div>
    );
};

export default Worksheet;
