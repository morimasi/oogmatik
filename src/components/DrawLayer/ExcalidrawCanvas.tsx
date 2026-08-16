import React, { Suspense } from 'react';
import type { ExcalidrawCanvasProps } from '@/types/excalidraw';

// Excalidraw bundle boyutunu optimize etmek için React.lazy ile dinamik import
const ExcalidrawComponent = React.lazy(() =>
    import('@excalidraw/excalidraw').then((module) => ({
        default: module.Excalidraw,
    }))
);

export const ExcalidrawCanvas: React.FC<ExcalidrawCanvasProps> = ({
    initialElements = [],
    onChange,
    isReadOnly = false,
    theme = 'light',
    height = '100%',
    width = '100%',
    className = '',
}) => {
    return (
        <div
            className={`relative w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-transparent ${className}`}
            style={{ height, width }}
        >
            <Suspense
                fallback={
                    <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-secondary)]/50 backdrop-blur-md">
                        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-xs font-bold text-[var(--text-muted)]">
                            Vektörel Çizim Kanvası Yükleniyor...
                        </p>
                    </div>
                }
            >
                <ExcalidrawComponent
                    initialData={{
                        elements: initialElements as any,
                        appState: {
                            viewBackgroundColor: 'transparent',
                            theme,
                        },
                    }}
                    onChange={(elements) => {
                        if (onChange) {
                            onChange(elements);
                        }
                    }}
                    viewModeEnabled={isReadOnly}
                    UIOptions={{
                        canvasActions: {
                            changeViewBackgroundColor: true,
                            clearCanvas: true,
                        },
                    }}
                />
            </Suspense>
        </div>
    );
};

export default ExcalidrawCanvas;
