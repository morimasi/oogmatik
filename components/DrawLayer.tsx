
import React, { useRef, useState, useEffect } from 'react';

interface DrawLayerProps {
    isActive: boolean;
    zoom: number;
}

export const DrawLayer: React.FC<DrawLayerProps> = ({ isActive, zoom }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);
    const [tool, setTool] = useState<'pen' | 'eraser'>('pen');

    // Initialize Canvas Context
    useEffect(() => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                setContext(ctx);
            }
        }
    }, []);

    // Resize Handling
    useEffect(() => {
        const resizeCanvas = () => {
            if (canvasRef.current && canvasRef.current.parentElement) {
                const parent = canvasRef.current.parentElement;
                canvasRef.current.width = parent.clientWidth;
                canvasRef.current.height = parent.clientHeight;
                
                // Re-apply context settings after resize reset
                if (context) {
                    context.lineCap = 'round';
                    context.lineJoin = 'round';
                    context.strokeStyle = color;
                    context.lineWidth = lineWidth;
                }
            }
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // Initial call
        
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [context, color, lineWidth]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!context || !isActive) return;
        
        const { offsetX, offsetY } = getCoordinates(e);
        context.beginPath();
        context.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !context || !isActive) return;
        
        const { offsetX, offsetY } = getCoordinates(e);
        
        context.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
        context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        context.lineWidth = tool === 'eraser' ? 20 : lineWidth;
        
        context.lineTo(offsetX, offsetY);
        context.stroke();
    };

    const stopDrawing = () => {
        if (context) context.closePath();
        setIsDrawing(false);
    };

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return { offsetX: 0, offsetY: 0 };
        
        const rect = canvasRef.current.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        // Adjust for zoom if necessary (coordinates are relative to canvas size, which is 100% of parent)
        // Since canvas scales with parent div which scales with zoom, raw offset should be correct relative to rect
        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };
    };

    const clearCanvas = () => {
        if (context && canvasRef.current) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 z-50 pointer-events-auto">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 p-2 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 pointer-events-auto animate-in slide-in-from-top-4">
                <button 
                    onClick={() => setTool('pen')}
                    className={`p-2 rounded-full transition-colors ${tool === 'pen' ? 'bg-indigo-100 text-indigo-600' : 'text-zinc-500 hover:bg-zinc-100'}`}
                    title="Kalem"
                >
                    <i className="fa-solid fa-pen"></i>
                </button>
                
                <input 
                    type="color" 
                    value={color} 
                    onChange={(e) => { setColor(e.target.value); setTool('pen'); }}
                    className="w-8 h-8 rounded-full border-0 p-0 cursor-pointer"
                    title="Renk Seç"
                />
                
                <input 
                    type="range" 
                    min="1" max="10" 
                    value={lineWidth} 
                    onChange={(e) => setLineWidth(Number(e.target.value))}
                    className="w-20 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                    title="Kalınlık"
                />
                
                <button 
                    onClick={() => setTool('eraser')}
                    className={`p-2 rounded-full transition-colors ${tool === 'eraser' ? 'bg-red-100 text-red-600' : 'text-zinc-500 hover:bg-zinc-100'}`}
                    title="Silgi"
                >
                    <i className="fa-solid fa-eraser"></i>
                </button>
                
                <div className="w-px h-6 bg-zinc-300 mx-1"></div>
                
                <button 
                    onClick={clearCanvas}
                    className="p-2 rounded-full text-zinc-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Temizle"
                >
                    <i className="fa-solid fa-trash-can"></i>
                </button>
            </div>

            <canvas
                ref={canvasRef}
                className="w-full h-full cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>
    );
};
