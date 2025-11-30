
import React, { useRef, useEffect, useState } from 'react';
import { useEditor } from '../context/EditorContext';

// Use a unique ID generator if id is not provided
const generateId = () => `el-${Math.random().toString(36).substr(2, 9)}`;

interface EditableElementProps {
    children: React.ReactNode;
    className?: string;
    initialPos?: { x: number; y: number };
    id?: string;
    type?: 'block' | 'text' | 'image';
    style?: React.CSSProperties;
}

export const EditableElement: React.FC<EditableElementProps> = ({ children, className = "", initialPos = { x: 0, y: 0 }, id: propId, type = 'block', style: propStyle }) => {
    const { isEditMode, zoom, selectElement, selectedIds, updateElement, registerElement, elements } = useEditor();
    const [localId] = useState(propId || generateId());
    
    // Register element on mount
    useEffect(() => {
        registerElement(localId, { 
            x: initialPos.x, 
            y: initialPos.y, 
            type 
        });
    }, []);

    const elementState = elements[localId] || { x: initialPos.x, y: initialPos.y, width: 'auto', height: 'auto', rotation: 0, zIndex: 1, style: {} };
    const isSelected = selectedIds.includes(localId);

    // Refs for drag/resize
    const elementRef = useRef<HTMLDivElement>(null);
    const startPos = useRef({ x: 0, y: 0 });
    const originalState = useRef(elementState);

    // Sync local state if needed (for non-controlled behavior if context is slow/async, but here we rely on context)

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!isEditMode) return;
        if ((e.target as HTMLElement).closest('.edit-handle')) return;
        
        e.stopPropagation();
        selectElement(localId, e.shiftKey); // Shift for multi-select

        // Drag Setup
        startPos.current = { x: e.clientX, y: e.clientY };
        originalState.current = { ...elementState }; // Snapshot

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startPos.current.x) / zoom;
            const dy = (moveEvent.clientY - startPos.current.y) / zoom;
            
            updateElement(localId, {
                x: originalState.current.x + dx,
                y: originalState.current.y + dy
            });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleResize = (e: React.MouseEvent, handle: string) => {
        e.stopPropagation();
        e.preventDefault();
        
        startPos.current = { x: e.clientX, y: e.clientY };
        // We need actual DOM dimensions for 'auto' sized elements to start resizing correctly
        const rect = elementRef.current?.getBoundingClientRect();
        const startW = rect ? rect.width / zoom : (typeof elementState.width === 'number' ? elementState.width : 100);
        const startH = rect ? rect.height / zoom : (typeof elementState.height === 'number' ? elementState.height : 100);
        
        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = (moveEvent.clientX - startPos.current.x) / zoom;
            const dy = (moveEvent.clientY - startPos.current.y) / zoom;
            
            let newW = startW;
            let newH = startH;

            // Simplified resizing logic (Bottom-Right only for brevity, ideally check handle type)
            if (handle.includes('e')) newW = Math.max(20, startW + dx);
            if (handle.includes('s')) newH = Math.max(20, startH + dy);
            
            updateElement(localId, { width: newW, height: newH });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const handleRotate = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        const rect = elementRef.current?.getBoundingClientRect();
        if (!rect) return;
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const handleMouseMove = (moveEvent: MouseEvent) => {
            const dx = moveEvent.clientX - centerX;
            const dy = moveEvent.clientY - centerY;
            const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
            updateElement(localId, { rotation: angle });
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    // Render Logic
    const combinedStyle: React.CSSProperties = {
        transform: `translate(${elementState.x}px, ${elementState.y}px) rotate(${elementState.rotation}deg)`,
        width: elementState.width,
        height: elementState.height,
        position: 'relative', // Changed from absolute to allow flow in normal mode? 
        // NOTE: For a true freehand drag, 'absolute' is better, but existing layout uses flex/grid.
        // We use 'relative' + translate for visual movement without breaking layout flow initially, 
        // OR we switch to absolute if the user drags it.
        // For the requested feature "Freehand", usually absolute positioning is expected.
        // Let's stick to relative + transform for safety with existing grid, but visual movement works.
        zIndex: elementState.zIndex,
        ...propStyle,
        ...elementState.style,
        cursor: isEditMode ? 'move' : 'default',
        outline: isSelected && isEditMode ? '2px solid #007acc' : 'none',
        userSelect: isEditMode ? 'none' : 'auto'
    };

    return (
        <div 
            ref={elementRef}
            className={`${className} ${isEditMode ? 'hover:outline hover:outline-1 hover:outline-[#007acc]' : ''}`}
            style={combinedStyle}
            onMouseDown={handleMouseDown}
            onClick={(e) => { if(isEditMode) e.stopPropagation(); }}
        >
            {children}
            
            {isSelected && isEditMode && (
                <>
                    {/* Resize Handles */}
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-[#007acc] cursor-se-resize z-50" onMouseDown={(e) => handleRotate(e)}></div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-[#007acc] cursor-se-resize z-50" onMouseDown={(e) => handleResize(e, 'se')}></div>
                    {/* Rotate Handle */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border border-[#007acc] rounded-full cursor-grab z-50" onMouseDown={handleRotate}></div>
                </>
            )}
        </div>
    );
};

export const EditableText: React.FC<{ 
    value: string | number; 
    className?: string; 
    tag?: 'p' | 'span' | 'h1' | 'h2' | 'h3' | 'h4' | 'div';
    onChange?: (val: string) => void;
}> = ({ value, className = "", tag = 'p', onChange }) => {
    const { isEditMode } = useEditor();
    const Tag = tag as any;

    if (!isEditMode) {
        return <Tag className={className} dangerouslySetInnerHTML={{ __html: value }} />;
    }

    return (
        <Tag
            className={`${className} outline-none focus:bg-[#007acc]/10 focus:ring-1 focus:ring-[#007acc] px-1 min-w-[10px] cursor-text`}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e: React.FocusEvent<HTMLElement>) => onChange && onChange(e.currentTarget.innerText)}
            onKeyDown={(e: React.KeyboardEvent) => e.stopPropagation()} 
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
        >
            {value}
        </Tag>
    );
};

export const EditableContext = React.createContext<any>({}); // Legacy fallback
