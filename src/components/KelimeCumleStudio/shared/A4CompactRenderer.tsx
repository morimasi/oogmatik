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
                        height: '297mm', // Fixed A4 height for real preview
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 40px rgba(0,0,0,0.3)', // Stronger shadow for paper feel
                        margin: '0 auto',
                        padding: '15mm 15mm', // Standard borders
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden', // Contain content within page
                        border: '1px solid #e2e8f0',
                        ...(typography && {
                            fontSize: `${typography.fontSize}pt`,
                            lineHeight: typography.lineHeight,
                            letterSpacing: `${typography.letterSpacing}em`,
                            wordSpacing: `${typography.wordSpacing}rem`,
                        })
                    }}
                >
                    {/* Page Background Texture or Subtle Detail */}
                    <div className="a4-page-background" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        zIndex: 0,
                        opacity: 0.03,
                        background: 'repeating-linear-gradient(45deg, #000, #000 1px, transparent 1px, transparent 10px)'
                    }} />

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                        {children}
                    </div>
                    
                    {/* Compact Footer */}
                    <div style={{ 
                        marginTop: 'auto', 
                        paddingTop: '3mm', 
                        borderTop: '1px solid #e5e7eb', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '9pt',
                        color: '#64748b',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        <span>Bursa Disleksi - Oogmatik</span>
                        <span>www.bursadisleksi.com</span>
                    </div>
                </div>
            </div>
        );
    }
);

A4CompactRenderer.displayName = 'A4CompactRenderer';
