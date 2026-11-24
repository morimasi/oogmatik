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
    pedagogicalNote?: string;
    studentName?: string;
}

export const A4CompactRenderer = forwardRef<HTMLDivElement, A4CompactRendererProps>(
    ({ children, typography, scale = 1, pedagogicalNote, studentName }, ref) => {
        return (
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.3s ease',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '2rem'
                }}
            >
                <div
                    ref={ref}
                    className="sk-a4-compact worksheet-page"
                    style={{
                        width: '210mm',
                        minHeight: '297mm', // Fixed A4 height for real preview
                        backgroundColor: '#ffffff',
                        boxShadow: '0 0 40px rgba(0,0,0,0.3)',
                        margin: '0 auto',
                        padding: '12mm 15mm',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        border: '1px solid #e2e8f0',
                        fontFamily: 'Lexend, sans-serif',
                        ...(typography && {
                            fontSize: `${typography.fontSize}pt`,
                            lineHeight: typography.lineHeight,
                            letterSpacing: `${typography.letterSpacing}em`,
                            wordSpacing: `${typography.wordSpacing}rem`,
                        })
                    }}
                >
                    {/* Subtle Page Background Texture */}
                    <div className="a4-page-background" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                        zIndex: 0,
                        opacity: 0.02,
                        background: 'repeating-linear-gradient(45deg, #000, #000 1px, transparent 1px, transparent 10px)'
                    }} />

                    {/* Compact Header with Student Name */}
                    {studentName && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            paddingBottom: '2mm',
                            marginBottom: '3mm',
                            borderBottom: '1px solid #cbd5e1',
                            fontSize: '9pt',
                            fontWeight: 700,
                            color: '#475569'
                        }}>
                            <span>Öğrenci: {studentName}</span>
                            <span>Tarih: {new Date().toLocaleDateString('tr-TR')}</span>
                        </div>
                    )}

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
                        {children}
                    </div>

                    {/* Pedagogical Note (Öğretmen / Veli Notu) */}
                    {pedagogicalNote && (
                        <div style={{
                            marginTop: 'auto',
                            marginBottom: '2mm',
                            padding: '6px 10px',
                            backgroundColor: 'rgba(147, 51, 234, 0.06)',
                            borderLeft: '3px solid #9333ea',
                            borderRadius: '0 6px 6px 0',
                            fontSize: '8pt',
                            lineHeight: 1.3,
                            color: '#581c87',
                            fontFamily: 'Inter, sans-serif'
                        }}>
                            <span style={{ fontWeight: 800 }}>📌 Pedagojik Not: </span>
                            {pedagogicalNote}
                        </div>
                    )}
                    
                    {/* Compact Footer */}
                    <div style={{ 
                        marginTop: pedagogicalNote ? '1mm' : 'auto', 
                        paddingTop: '2mm', 
                        borderTop: '1px solid #e5e7eb', 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '8.5pt',
                        color: '#64748b',
                        fontFamily: 'Inter, sans-serif'
                    }}>
                        <span>Bursa Disleksi - bdmind Özel Eğitim Platformu</span>
                        <span>www.bursadisleksi.com</span>
                    </div>
                </div>
            </div>
        );
    }
);

A4CompactRenderer.displayName = 'A4CompactRenderer';
