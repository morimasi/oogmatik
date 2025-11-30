
import React, { useState, useRef, useEffect, useContext, createContext } from 'react';

interface EditableContextType {
    isEditMode: boolean;
    zoom: number;
}

export const EditableContext = createContext<EditableContextType>({ isEditMode: false, zoom: 1 });

export const useEditable = () => useContext(EditableContext);

interface EditableElementProps {
    children: React.ReactNode;
    className?: string;
    initialPos?: { x: number; y: number };
    id?: string;
    type?: 'block' | 'text' | 'image';
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent) => void;
}

export const EditableElement: React.FC<EditableElementProps> = ({ children, className = "", initialPos = { x: 0, y: 0 }, id, type = 'block', style: propStyle, onClick }) => {
    const { isEditMode, zoom } = useEditable();
    
    // Transform State
    const [position, setPosition] = useState(initialPos);
    const [rotation, setRotation] = useState(0);
    const [size, setSize] = useState<{w?: number, h?: number}>({});
    
    // Interaction State
    const [isSelected, setIsSelected] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isRotating, setIsRotating] = useState(false);

    const ref = useRef<HTMLDivElement>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const initialTransform = useRef({ x: 0, y: 0, w: 0, h: 0, r: 0 });

    // Reset selection when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (isEditMode && ref.current && !ref.current.contains(e.target as Node)) {
                // Ignore if clicking a handle
                if (!(e.target as HTMLElement).closest('.edit-handle')) {
                    setIsSelected(false);
                }
            }
        };
        if (isEditMode) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditMode]);

    // --- DRAG LOGIC ---
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isEditMode) {
            if (onClick) onClick(e);
            return;
        }
        // Don't drag if clicking handles or contentEditable
        if ((e.target as HTMLElement).closest('.edit-handle') || (e.target as HTMLElement).isContentEditable) return;

        e.stopPropagation(); // Stop pan of canvas
        setIsSelected(true);
        setIsDragging(true);

        startPos.current = { x: e.clientX, y: e.clientY };
        initialTransform.current = { ...position, w: 0, h: 0, r: 0 }; // Size not needed for drag
    };

    // --- RESIZE LOGIC ---
    const handleResizeStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        const rect = ref.current?.getBoundingClientRect();
        startPos.current = { x: e.clientX, y: e.clientY };
        initialTransform.current = { 
            x: position.x, y: position.y, 
            w: rect ? rect.width / zoom : 0, 
            h: rect ? rect.height / zoom : 0,
            r: rotation 
        };
    };

    // --- ROTATE LOGIC ---
    const handleRotateStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsRotating(true);
        const rect = ref.current?.getBoundingClientRect();
        // Calculate center relative to viewport
        if(rect) {
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            // Store angle offset
            const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
            initialTransform.current = { x: cx, y: cy, r: rotation - startAngle, w: 0, h: 0 };
        }
    };

    // --- GLOBAL MOVE HANDLER ---
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isEditMode) return;

            if (isDragging) {
                const dx = (e.clientX - startPos.current.x) / zoom;
                const dy = (e.clientY - startPos.current.y) / zoom;
                setPosition({
                    x: initialTransform.current.x + dx,
                    y: initialTransform.current.y + dy
                });
            } else if (isResizing) {
                const dx = (e.clientX - startPos.current.x) / zoom;
                const dy = (e.clientY - startPos.current.y) / zoom;
                // Simple bottom-right resize for now
                setSize({
                    w: Math.max(20, initialTransform.current.w + dx),
                    h: Math.max(20, initialTransform.current.h + dy)
                });
            } else if (isRotating) {
                const cx = initialTransform.current.x;
                const cy = initialTransform.current.y;
                const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
                setRotation(initialTransform.current.r + angle);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setIsRotating(false);
        };

        if (isDragging || isResizing || isRotating) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, isRotating, isEditMode, zoom]);

    if (isDeleted) return null;

    const style: React.CSSProperties = {
        ...propStyle,
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        width: size.w,
        height: size.h,
        position: 'relative', 
        zIndex: isSelected ? 50 : 1,
        cursor: isEditMode ? (isDragging ? 'grabbing' : 'grab') : undefined,
        outline: isEditMode && isSelected ? '2px solid #6366f1' : 'none',
        userSelect: isEditMode ? 'none' : 'auto'
    };

    return (
        <div ref={ref} className={`${className} editable-element group/edit`} style={style} onMouseDown={handleMouseDown}>
            {isEditMode && isSelected && (
                <>
                    {/* Rotate Handle (Top) */}
                    <div 
                        className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-indigo-500 rounded-full flex items-center justify-center cursor-ew-resize shadow-sm edit-handle z-50 hover:bg-indigo-50"
                        onMouseDown={handleRotateStart}
                        title="Döndür"
                    >
                        <i className="fa-solid fa-rotate text-[10px] text-indigo-500"></i>
                    </div>

                    {/* Delete Handle (Top Right) */}
                    <div 
                        className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center cursor-pointer shadow-sm edit-handle z-50 hover:bg-red-600 hover:scale-110 transition-transform"
                        onClick={(e) => { e.stopPropagation(); if(confirm('Silmek istediğinize emin misiniz?')) setIsDeleted(true); }}
                        title="Sil"
                    >
                        <i className="fa-solid fa-times text-[10px] text-white"></i>
                    </div>

                    {/* Resize Handle (Bottom Right) */}
                    <div 
                        className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full cursor-se-resize shadow-sm edit-handle z-50 hover:scale-125 transition-transform"
                        onMouseDown={handleResizeStart}
                    ></div>
                </>
            )}
            {children}
        </div>
    );
};

export const EditableText: React.FC<{ 
    value: string | number; 
    className?: string; 
    tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
    onChange?: (val: string) => void; 
}> = ({ value, className = "", tag = 'p', onChange }) => {
    const { isEditMode } = useEditable();
    const [text, setText] = useState(String(value));

    useEffect(() => { setText(String(value)); }, [value]);

    const Tag = tag as any;

    if (!isEditMode) {
        // Safe render
        return <Tag className={className} dangerouslySetInnerHTML={{__html: text}} />;
    }

    return (
        <Tag
            className={`${className} outline-none border-b border-transparent hover:border-indigo-300 focus:bg-indigo-50/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 rounded px-1 transition-all empty:before:content-['...'] cursor-text min-w-[20px] inline-block`}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e: React.FocusEvent<HTMLElement>) => {
                const newVal = e.currentTarget.textContent || "";
                setText(newVal);
                if(onChange) onChange(newVal);
            }}
            onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()} 
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
            onClick={(e: React.MouseEvent) => e.preventDefault()}
        >
            {text}
        </Tag>
    );
};
