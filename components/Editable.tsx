
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
}

export const EditableElement: React.FC<EditableElementProps> = ({ children, className = "", initialPos = { x: 0, y: 0 }, id, type = 'block' }) => {
    const { isEditMode } = useEditable();
    const [position, setPosition] = useState(initialPos);
    const [size, setSize] = useState({ width: 'auto', height: 'auto' });
    const [rotation, setRotation] = useState(0);
    const [isSelected, setIsSelected] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    const elementRef = useRef<HTMLDivElement>(null);

    // Reset selection when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (elementRef.current && !elementRef.current.contains(e.target as Node)) {
                setIsSelected(false);
            }
        };
        if (isEditMode) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isEditMode]);

    // Drag Logic
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isEditMode) return;
        // Don't drag if clicking a handle or editing text
        if ((e.target as HTMLElement).closest('.resize-handle') || (e.target as HTMLElement).isContentEditable) return;
        
        e.stopPropagation();
        setIsSelected(true);
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (isDragging && isEditMode) {
            e.preventDefault();
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    }, [isDragging, dragStart, isEditMode]);

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove]);

    // Rotation Logic
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

    const style: React.CSSProperties = {
        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg)`,
        width: size.width === 'auto' ? undefined : size.width,
        height: size.height === 'auto' ? undefined : size.height,
        position: position.x === 0 && position.y === 0 ? 'relative' : 'relative', // Keep relative flow initially, transform moves it visually
        zIndex: isSelected ? 50 : 1,
        cursor: isEditMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
        userSelect: isEditMode ? 'none' : 'auto',
    };

    if (!isEditMode) {
        return <div className={className}>{children}</div>;
    }

    return (
        <div 
            ref={elementRef}
            className={`${className} transition-shadow duration-200 ${isSelected ? 'ring-2 ring-indigo-500 shadow-xl bg-white/50 dark:bg-zinc-800/50 backdrop-blur-sm' : 'hover:ring-1 hover:ring-indigo-300 hover:bg-indigo-50/10'}`}
            style={style}
            onMouseDown={handleMouseDown}
        >
            {/* Rotation Handle */}
            {isSelected && (
                <div 
                    className="absolute -top-8 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border-2 border-indigo-500 rounded-full flex items-center justify-center cursor-ew-resize z-50 shadow-sm"
                    onMouseDown={handleRotateStart}
                    title="Döndür"
                >
                    <i className="fa-solid fa-rotate text-xs text-indigo-500"></i>
                </div>
            )}

            {/* Resize Handles (Visual Only for MVP) */}
            {isSelected && (
                <>
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border border-indigo-500 resize-handle"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border border-indigo-500 resize-handle"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border border-indigo-500 resize-handle"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border border-indigo-500 resize-handle cursor-se-resize"></div>
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
            className={`${className} outline-none focus:bg-indigo-50/50 focus:border-b-2 focus:border-indigo-400 empty:before:content-['...'] cursor-text`}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e: React.FocusEvent<HTMLElement>) => onChange && onChange(e.currentTarget.innerText)}
            onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()} // Prevent triggering global shortcuts
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()} // Prevent dragging the container
        >
            {value}
        </Tag>
    );
};
