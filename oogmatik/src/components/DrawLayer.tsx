
import React, { useRef, useState, useEffect, useCallback } from 'react';

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
                
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvasRef.current.width;
                tempCanvas.height = canvasRef.current.height;
                const tempCtx = tempCanvas.getContext('2d');
                if (tempCtx) tempCtx.drawImage(canvasRef.current, 0, 0);

                canvasRef.current.width = parent.clientWidth;
                canvasRef.current.height = parent.clientHeight;
                
                // Restore content
                if (context) {
                    context.lineCap = 'round';
                    context.lineJoin = 'round';
                    context.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
                    context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
                    context.lineWidth = tool === 'eraser' ? 20 : lineWidth;
                    context.drawImage(tempCanvas, 0, 0);
                }
            }
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); // Initial call
        
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [context, color, lineWidth, tool]);

    // Update context when tools change
    useEffect(() => {
        if (context) {
            context.strokeStyle = tool === 'eraser' ? 'rgba(0,0,0,1)' : color;
            context.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
            context.lineWidth = tool === 'eraser' ? 20 : lineWidth;
        }
    }, [tool, color, lineWidth, context]);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!canvasRef.current) return { offsetX: 0, offsetY: 0 };
        
        const rect = canvasRef.current.getBoundingClientRect();
        let clientX, clientY;

        if ('touches' in e) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = (e as MouseEvent).clientX;
            clientY = (e as MouseEvent).clientY;
        }

        return {
            offsetX: clientX - rect.left,
            offsetY: clientY - rect.top
        };
    };

    // Use useCallback to keep functions stable for useEffect dependencies
    const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!context || !isActive) return;
        
        // Prevent scrolling on touch
        if(e.cancelable) e.preventDefault(); 
        
        const { offsetX, offsetY } = getCoordinates(e);
        context.beginPath();
        context.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    }, [context, isActive]);

    const draw = useCallback((e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
        if (!isDrawing || !context || !isActive) return;
        if(e.cancelable) e.preventDefault();

        const { offsetX, offsetY } = getCoordinates(e);
        context.lineTo(offsetX, offsetY);
        context.stroke();
    }, [isDrawing, context, isActive]);

    const stopDrawing = useCallback(() => {
        if (context) context.closePath();
        setIsDrawing(false);
    }, [context]);

    // Add Non-Passive Event Listeners for Touch
    // This fixes the [Violation] warning by explicitly telling the browser we intend to block scrolling
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const handleTouchStart = (e: TouchEvent) => startDrawing(e);
        const handleTouchMove = (e: TouchEvent) => draw(e);
        const handleTouchEnd = (e: TouchEvent) => stopDrawing();

        // Passive: false allows us to use preventDefault() to stop scrolling while drawing
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);

        return () => {
            canvas.removeEventListener('touchstart', handleTouchStart);
            canvas.removeEventListener('touchmove', handleTouchMove);
            canvas.removeEventListener('touchend', handleTouchEnd);
        };
    }, [startDrawing, draw, stopDrawing]);

    const clearCanvas = () => {
        if (context && canvasRef.current) {
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    };

    if (!isActive) return null;

    return (
        <div className="absolute inset-0 z-50 pointer-events-auto overflow-hidden">
            {/* Toolbar */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white dark:bg-zinc-800 p-2 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 flex items-center gap-2 pointer-events-auto animate-in slide-in-from-top-4">
                <button 
                    onClick={() => setTool('pen')}
                    className={`p-2 rounded-full transition-colors ${tool === 'pen' ? 'bg-indigo-100 text-indigo-600' : 'text-zinc-500 hover:bg-zinc-100'}`}
                    title="Kalem"
                >
                    <i className="fa-solid fa-pen"></i>
                </button>
                
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-300 cursor-pointer">
                    <input 
                        type="color" 
                        value={color} 
                        onChange={(e) => { setColor(e.target.value); setTool('pen'); }}
                        className="absolute -top-2 -left-2 w-12 h-12 p-0 border-0 cursor-pointer"
                        title="Renk Seç"
                    />
                </div>
                
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-700 rounded-full px-2">
                    <span className="text-[10px] text-zinc-500"><i className="fa-solid fa-circle text-[6px]"></i></span>
                    <input 
                        type="range" 
                        min="1" max="10" 
                        value={lineWidth} 
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="w-16 h-1 bg-zinc-300 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        title="Kalınlık"
                    />
                    <span className="text-[10px] text-zinc-500"><i className="fa-solid fa-circle"></i></span>
                </div>
                
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
                // Touch events are handled by manual listeners in useEffect
            />
        </div>
    );
};
