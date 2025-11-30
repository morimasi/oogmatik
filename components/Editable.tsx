
import React, { useState, useRef, useEffect } from 'react';

interface EditableContextType {
    isEditMode: boolean;
    zoom: number;
}

export const EditableContext = React.createContext<EditableContextType>({ isEditMode: false, zoom: 1 });

export const useEditable = () => React.useContext(EditableContext);

interface EditableElementProps {
    children: React.ReactNode;
    className?: string;
    initialPos?: { x: number; y: number };
    id?: string;
    type?: 'block' | 'text' | 'image';
    style?: React.CSSProperties; 
}

export const EditableElement: React.FC<EditableElementProps> = ({ children, className = "", initialPos = { x: 0, y: 0 }, id, type = 'block', style: propStyle }) => {
    const { isEditMode, zoom } = useEditable();
    const [position, setPosition] = useState(initialPos);
    const [size, setSize] = useState<{ width: string | number; height: string | number }>({ width: 'auto', height: 'auto' });
    const [rotation, setRotation] = useState(0);
    const [isSelected, setIsSelected] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    
    // Refs for drag logic
    const startPos = useRef({ x: 0, y: 0 });
    const originalPos = useRef({ x: 0, y: 0 });
    
    // Refs for resize logic
    const startResizeMouse = useRef({ x: 0, y: 0 });
    const startResizeSize = useRef({ w: 0, h: 0 });
    
    // Refs for rotation logic
    const startRotateMouse = useRef({ x: 0 });
    const startRotateAngle = useRef(0);

    const elementRef = useRef<HTMLDivElement>(null);

    // Reset selection when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (elementRef.current && !elementRef.current.contains(e.target as Node)) {
                // Check if clicking a handle
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
        // Don't drag if interacting with handles or content editable
        if ((e.target as HTMLElement).closest('.edit-handle') || (e.target as HTMLElement).isContentEditable) return;
        
        e.stopPropagation(); 
        setIsSelected(true);
        setIsDragging(true);
        
        startPos.current = { x: e.clientX, y: e.clientY };
        originalPos.current = { ...position };
    };

    // --- RESIZE LOGIC ---
    const handleResizeStart = (e: React.MouseEvent, direction: string) => {
        e.stopPropagation();
        e.preventDefault();
        setIsResizing(true);
        const rect = elementRef.current?.getBoundingClientRect();
        if (rect) {
            startResizeMouse.current = { x: e.clientX, y: e.clientY };
            startResizeSize.current = { w: rect.width / zoom, h: rect.height / zoom }; // Normalize by zoom
        }
    };

    // --- ROTATION LOGIC ---
    const handleRotateStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        // Use a flag or state to track rotation mode if needed, 
        // but adding listener directly is simpler for this structure
        startRotateMouse.current = { x: e.clientX };
        startRotateAngle.current = rotation;
        
        const onRotate = (moveEvent: MouseEvent) => {
            const delta = (moveEvent.clientX - startRotateMouse.current.x);
            // Sensitivity adjustment
            setRotation(startRotateAngle.current + delta * 0.5); 
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

    // --- GLOBAL MOUSE MOVE/UP FOR DRAG & RESIZE ---
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isEditMode) return;

            if (isDragging) {
                e.preventDefault();
                const deltaX = (e.clientX - startPos.current.x) / zoom;
                const deltaY = (e.clientY - startPos.current.y) / zoom;
                setPosition({
                    x: originalPos.current.x + deltaX,
                    y: originalPos.current.y + deltaY
                });
            }

            if (isResizing) {
                e.preventDefault();
                const deltaX = (e.clientX - startResizeMouse.current.x) / zoom;
                const deltaY = (e.clientY - startResizeMouse.current.y) / zoom;
                
                // Simple resize logic (width/height)
                const newWidth = Math.max(20, startResizeSize.current.w + deltaX);
                const newHeight = Math.max(20, startResizeSize.current.h + deltaY);
                
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
    }, [isDragging, isResizing, isEditMode, zoom]);

    if (isDeleted) return null;

    const computedStyle: React.CSSProperties = {
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        width: size.width,
        height: size.height,
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
            className={`${className} transition-shadow duration-200 group/edit ${isSelected ? 'ring-2 ring-indigo-500 shadow-2xl bg-white/50 backdrop-blur-[1px] z-[100]' : 'hover:ring-1 hover:ring-indigo-300 hover:bg-indigo-50/10'}`}
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

                    {/* Resize Handle (Bottom Right) */}
                    <div 
                        className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-indigo-500 border-2 border-white rounded-full cursor-se-resize z-50 edit-handle shadow-sm hover:scale-125 transition-transform"
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
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
            onClick={(e: React.MouseEvent) => e.preventDefault()} // Prevent clicking through to parent drag
        >
            {value}
        </Tag>
    );
};
