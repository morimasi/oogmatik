
import React, { useState, useRef, useEffect, useCallback } from 'react';

interface EditableContextType {
    isEditMode: boolean;
}

export const EditableContext = React.createContext<EditableContextType>({ isEditMode: false });

export const useEditable = () => React.useContext(EditableContext);

interface EditableElementProps {
    children: React.ReactNode;
    className?: string;
    initialPos?: { x: number; y: number };
    id?: string;
    type?: 'block' | 'text' | 'image';
    style?: React.CSSProperties; // Allow overriding styles
}

export const EditableElement: React.FC<EditableElementProps> = ({ children, className = "", initialPos = { x: 0, y: 0 }, id, type = 'block', style: propStyle }) => {
    const { isEditMode } = useEditable();
    const [position, setPosition] = useState(initialPos);
    const [size, setSize] = useState<{ width: string | number; height: string | number }>({ width: 'auto', height: 'auto' });
    const [rotation, setRotation] = useState(0);
    const [isSelected, setIsSelected] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    
    // Drag Start Position
    const dragStart = useRef({ x: 0, y: 0 });
    // Resize Start Data
    const resizeStart = useRef({ w: 0, h: 0, x: 0, y: 0 });
    const elementRef = useRef<HTMLDivElement>(null);

    // Reset selection when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (elementRef.current && !elementRef.current.contains(e.target as Node)) {
                // Check if clicking a handle, if so don't deselect
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
        if (!isEditMode) return;
        // Don't drag if interacting with content (like input) or handles
        if ((e.target as HTMLElement).closest('.edit-handle') || (e.target as HTMLElement).isContentEditable) return;
        
        e.stopPropagation(); // Prevent selecting parent
        setIsSelected(true);
        setIsDragging(true);
        dragStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
    };

    // --- RESIZE LOGIC ---
    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation();
        setIsResizing(true);
        const rect = elementRef.current?.getBoundingClientRect();
        if (rect) {
            resizeStart.current = { 
                w: rect.width, 
                h: rect.height, 
                x: e.clientX, 
                y: e.clientY 
            };
        }
    };

    // --- GLOBAL MOUSE MOVE/UP ---
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isEditMode) return;

            if (isDragging) {
                e.preventDefault();
                setPosition({
                    x: e.clientX - dragStart.current.x,
                    y: e.clientY - dragStart.current.y
                });
            }

            if (isResizing && elementRef.current) {
                e.preventDefault();
                const deltaX = e.clientX - resizeStart.current.x;
                const deltaY = e.clientY - resizeStart.current.y;
                
                // Simple resize logic (bottom-right based)
                // For a full implementation we'd handle all directions, 
                // here we assume corner resize affects width/height
                const newWidth = Math.max(20, resizeStart.current.w + deltaX);
                const newHeight = Math.max(20, resizeStart.current.h + deltaY);
                
                setSize({ width: newWidth, height: newHeight });
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, isEditMode]);

    // --- ROTATION LOGIC ---
    const handleRotateStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        const startX = e.clientX;
        const startRotation = rotation;
        
        const onRotate = (moveEvent: MouseEvent) => {
            const delta = moveEvent.clientX - startX;
            setRotation(startRotation + delta);
        };
        
        const onRotateEnd = () => {
            window.removeEventListener('mousemove', onRotate);
            window.removeEventListener('mouseup', onRotateEnd);
        };
        
        window.addEventListener('mousemove', onRotate);
        window.addEventListener('mouseup', onRotateEnd);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if(confirm("Bu öğeyi silmek istediğinize emin misiniz?")) {
            setIsDeleted(true);
        }
    };

    if (isDeleted) return null;

    const computedStyle: React.CSSProperties = {
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        width: size.width,
        height: size.height,
        // When dragging, use absolute to break flow if needed, but 'transform' keeps it relative to original slot visually
        // For true free-form, 'absolute' is better, but 'transform' preserves document flow which is safer for this app structure.
        position: 'relative', 
        zIndex: isSelected ? 100 : 1,
        cursor: isEditMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: isEditMode ? 'none' : 'auto',
        ...propStyle
    };

    if (!isEditMode) {
        return <div className={className} style={propStyle}>{children}</div>;
    }

    return (
        <div 
            ref={elementRef}
            className={`${className} transition-shadow duration-200 group/edit ${isSelected ? 'ring-2 ring-indigo-500 shadow-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm z-[100]' : 'hover:ring-1 hover:ring-indigo-300 hover:bg-indigo-50/10'}`}
            style={computedStyle}
            onMouseDown={handleMouseDown}
        >
            {isSelected && (
                <>
                    {/* Rotate Handle */}
                    <div 
                        className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center cursor-ew-resize z-50 shadow-sm edit-handle hover:bg-indigo-50"
                        onMouseDown={handleRotateStart}
                        title="Döndür"
                    >
                        <i className="fa-solid fa-rotate text-[10px] text-indigo-500"></i>
                    </div>

                    {/* Delete Handle */}
                    <div 
                        className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center cursor-pointer z-50 shadow-sm edit-handle hover:bg-red-600 hover:scale-110 transition-transform"
                        onMouseDown={handleDelete}
                        title="Sil"
                    >
                        <i className="fa-solid fa-times text-[10px] text-white"></i>
                    </div>

                    {/* Resize Handles */}
                    {/* Bottom Right */}
                    <div 
                        className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full cursor-se-resize z-50 edit-handle shadow-sm hover:scale-125 transition-transform"
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                    ></div>
                    {/* Bottom Left */}
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-500 cursor-sw-resize edit-handle"></div>
                    {/* Top Right */}
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-indigo-500 cursor-ne-resize edit-handle"></div>
                    {/* Top Left */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-indigo-500 cursor-nw-resize edit-handle"></div>
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
    const Tag = tag as any;

    if (!isEditMode) {
        return <Tag className={className} dangerouslySetInnerHTML={{ __html: value }} />;
    }

    return (
        <Tag
            className={`${className} outline-none border-b border-transparent hover:border-indigo-300 focus:bg-indigo-50/50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200/50 rounded px-1 transition-all empty:before:content-['...'] cursor-text min-w-[20px] inline-block`}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e: React.FocusEvent<HTMLElement>) => onChange && onChange(e.currentTarget.innerText)}
            onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()} 
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
            onClick={(e: React.MouseEvent) => e.preventDefault()}
        >
            {value}
        </Tag>
    );
};
