import React, { forwardRef } from 'react';

interface A4PreviewShellProps {
    children: React.ReactNode;
    scale?: number;
    showGrid?: boolean;
    typography?: {
        fontSize: number;
        lineHeight: number;
        letterSpacing: number;
        wordSpacing: number;
    };
}

export const A4PreviewShell = forwardRef<HTMLDivElement, A4PreviewShellProps>(
    ({ children, scale = 1, showGrid = false, typography }, ref) => {
        return (
            <div
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.3s ease',
                }}
            >
                <div
                    ref={ref}
                    className="sk-a4-shell"
                    style={{
                        ...(typography && {
                            fontSize: `${typography.fontSize}pt`,
                            lineHeight: typography.lineHeight,
                            letterSpacing: `${typography.letterSpacing}em`,
                            wordSpacing: `${typography.wordSpacing}em`,
                        }),
                        ...(showGrid && {
                            backgroundImage:
                                'linear-gradient(rgba(234,179,8,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(234,179,8,0.05) 1px, transparent 1px)',
                            backgroundSize: '10mm 10mm',
                        }),
                    }}
                >
                    {children}
                </div>
            </div>
        );
    }
);

A4PreviewShell.displayName = 'A4PreviewShell';
