import React from 'react';
import { useEditor } from '../../context/EditorContext';

const Panel = ({ title, children, className = "" }: { title: string, children?: React.ReactNode, className?: string }) => (
    <div className={`bg-[#2d2d30] border border-[#3e3e42] shadow-xl rounded-sm w-64 flex flex-col ${className}`}>
        <div className="bg-[#3e3e42] px-2 py-1 text-[10px] font-bold text-gray-300 uppercase tracking-wider flex justify-between cursor-move">
            <span>{title}</span>
            <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
            </div>
        </div>
        <div className="p-2 space-y-3">
            {children}
        </div>
    </div>
);

const IconButton = ({ icon, onClick, title, active = false }: any) => (
    <button 
        onClick={onClick} 
        title={title}
        className={`p-1.5 rounded-sm hover:bg-[#3e3e42] text-gray-300 transition-colors ${active ? 'bg-[#007acc] text-white' : ''}`}
    >
        <i className={`fa-solid ${icon} text-sm`}></i>
    </button>
);

const NumberInput = ({ label, value, onChange }: any) => (
    <div className="flex items-center gap-2">
        <label className="text-[10px] text-gray-400 w-4">{label}</label>
        <input 
            type="number" 
            value={value || 0} 
            onChange={(e) => onChange(Number(e.target.value))}
            className="w-full bg-[#1e1e1e] border border-[#3e3e42] text-gray-200 text-xs px-1 py-0.5 rounded-sm focus:border-[#007acc] outline-none"
        />
    </div>
);

export const EditorUI: React.FC = () => {
    const { isEditMode, selectedIds, elements, updateElement, alignSelected, bringToFront, sendToBack, deleteSelected } = useEditor();

    if (!isEditMode) return null;

    const selectedElement = selectedIds.length === 1 ? elements[selectedIds[0]] : null;

    const handleUpdate = (key: string, value: any) => {
        if (selectedElement) {
            updateElement(selectedElement.id, { [key]: value });
        }
    };

    const handleStyleUpdate = (key: string, value: any) => {
        if (selectedElement) {
            updateElement(selectedElement.id, { 
                style: { ...selectedElement.style, [key]: value } 
            });
        }
    }

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] flex justify-between p-4 font-sans antialiased">
            {/* Left Toolbar */}
            <div className="pointer-events-auto flex flex-col gap-2">
                <div className="bg-[#2d2d30] border border-[#3e3e42] shadow-xl rounded-sm flex flex-col p-1 gap-1">
                    <IconButton icon="fa-arrow-pointer" active title="Seçim Aracı (V)" />
                    <IconButton icon="fa-font" title="Metin Aracı (T)" />
                    <IconButton icon="fa-shapes" title="Şekil Aracı (U)" />
                    <div className="h-px bg-[#3e3e42] my-1"></div>
                    <IconButton icon="fa-hand" title="Kaydırma (H)" />
                    <IconButton icon="fa-magnifying-glass" title="Yakınlaştır (Z)" />
                </div>
            </div>

            {/* Right Properties Panel */}
            <div className="pointer-events-auto flex flex-col gap-2">
                {/* Transform Panel */}
                <Panel title="Transform">
                    <div className="grid grid-cols-2 gap-2">
                        <NumberInput label="X" value={Math.round(selectedElement?.x || 0)} onChange={(v:number) => handleUpdate('x', v)} />
                        <NumberInput label="Y" value={Math.round(selectedElement?.y || 0)} onChange={(v:number) => handleUpdate('y', v)} />
                        <NumberInput label="W" value={parseInt(String(selectedElement?.width)) || 0} onChange={(v:number) => handleUpdate('width', v)} />
                        <NumberInput label="H" value={parseInt(String(selectedElement?.height)) || 0} onChange={(v:number) => handleUpdate('height', v)} />
                        <div className="col-span-2">
                             <NumberInput label="R" value={Math.round(selectedElement?.rotation || 0)} onChange={(v:number) => handleUpdate('rotation', v)} />
                        </div>
                    </div>
                </Panel>

                {/* Align Panel */}
                <Panel title="Align & Arrange">
                    <div className="flex justify-between mb-2">
                        <IconButton icon="fa-align-left" onClick={() => alignSelected('left')} title="Sola Hizala" />
                        <IconButton icon="fa-align-center" onClick={() => alignSelected('center')} title="Ortala" />
                        <IconButton icon="fa-align-right" onClick={() => alignSelected('right')} title="Sağa Hizala" />
                        <IconButton icon="fa-align-justify" onClick={() => alignSelected('top')} title="Üste Hizala" /> {/* Using icon as placeholder */}
                    </div>
                    <div className="flex justify-between border-t border-[#3e3e42] pt-2">
                        <IconButton icon="fa-arrow-up-from-bracket" onClick={bringToFront} title="En Öne Getir" />
                        <IconButton icon="fa-arrow-down" onClick={sendToBack} title="En Arkaya Gönder" />
                        <IconButton icon="fa-trash" onClick={deleteSelected} title="Sil" className="text-red-400" />
                    </div>
                </Panel>

                {/* Appearance Panel */}
                <Panel title="Appearance">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Opaklık</span>
                            <input 
                                type="range" min="0" max="1" step="0.1" 
                                value={selectedElement?.style?.opacity || 1} 
                                onChange={(e) => handleStyleUpdate('opacity', e.target.value)}
                                className="w-20 accent-[#007acc]"
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Arkaplan</span>
                            <div className="flex gap-1">
                                <input type="color" className="w-6 h-6 p-0 border-0 rounded-sm cursor-pointer" onChange={(e) => handleStyleUpdate('backgroundColor', e.target.value)} />
                                <button onClick={() => handleStyleUpdate('backgroundColor', 'transparent')} className="text-[10px] text-gray-400 hover:text-white px-1 border border-gray-600 rounded">Yok</button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Kenarlık</span>
                            <input type="color" className="w-6 h-6 p-0 border-0 rounded-sm cursor-pointer" onChange={(e) => handleStyleUpdate('borderColor', e.target.value)} />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Kalınlık</span>
                            <input 
                                type="number" 
                                className="w-12 bg-[#1e1e1e] border border-[#3e3e42] text-gray-200 text-xs px-1" 
                                onChange={(e) => handleStyleUpdate('borderWidth', `${e.target.value}px`)}
                            />
                        </div>
                         <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-400">Yarıçap</span>
                            <input 
                                type="number" 
                                className="w-12 bg-[#1e1e1e] border border-[#3e3e42] text-gray-200 text-xs px-1" 
                                onChange={(e) => handleStyleUpdate('borderRadius', `${e.target.value}px`)}
                            />
                        </div>
                    </div>
                </Panel>
                
                {/* Text Panel (Conditional) */}
                <Panel title="Typography">
                     <div className="grid grid-cols-2 gap-2">
                        <input type="color" className="w-full h-6 p-0 border-0 rounded-sm" onChange={(e) => handleStyleUpdate('color', e.target.value)} />
                        <select className="bg-[#1e1e1e] text-gray-200 text-xs border border-[#3e3e42]" onChange={(e) => handleStyleUpdate('fontSize', `${e.target.value}px`)}>
                            {[12,14,16,18,24,32,48,64,72].map(s => <option key={s} value={s}>{s}px</option>)}
                        </select>
                        <button onClick={() => handleStyleUpdate('fontWeight', 'bold')} className="bg-[#3e3e42] text-gray-200 text-xs py-1 rounded hover:bg-[#505050]">B</button>
                        <button onClick={() => handleStyleUpdate('fontStyle', 'italic')} className="bg-[#3e3e42] text-gray-200 text-xs py-1 rounded hover:bg-[#505050]">I</button>
                     </div>
                </Panel>
            </div>
        </div>
    );
};