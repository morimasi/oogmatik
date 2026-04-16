import React, { forwardRef } from 'react';

interface A4CompactRendererProps {
    children: React.ReactNode;
    typography?: {
        fontSize: number;
        lineHeight: number;
        letterSpacing: number;
        wordSpacing: number;
    };
    scale?: number;
}

export const A4CompactRenderer = forwardRef<HTMLDivElement, A4CompactRendererProps>(
    ({ children, typography, scale = 1 }, ref) => {
        return (
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.3s ease',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center'
                }}
            >
                <div
                    ref={ref}
                    className="sk-a4-compact"
                    style={{
                        width: '210mm',
                        minHeight: '297mm',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        padding: '12mm 15mm', // Minimal borders for maximum content
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        ...(typography && {
                            fontSize: `${typography.fontSize}pt`,
                            lineHeight: typography.lineHeight,
                            letterSpacing: `${typography.letterSpacing}em`,
                            wordSpacing: `${typography.wordSpacing}em`,
                        })
                    }}
                >
                    {/* Watermark or header could go here */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {children}
                    </div>
                    
                    {/* Compact Footer */}
                    <div style={{ 
                        marginTop: 'auto', 
                        paddingTop: '3mm', 
                        borderTop: '1px solid #e5e7eb', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '0.75rem',
                        color: '#94a3b8'
                    }}>
                        <span>Oogmatik - Uzman Öğrenme Platformu</span>
                        <span>www.bursadisleksi.com</span>
                    </div>
                </div>
            </div>
        );
    }
);

A4CompactRenderer.displayName = 'A4CompactRenderer';
