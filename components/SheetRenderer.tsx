
import React from 'react';
import { ActivityType, SingleWorksheetData } from '../types';
import { PedagogicalHeader, ImageDisplay, GridComponent, ConnectionDot } from './sheets/common';
import { EditableElement, EditableText } from './Editable';
import { StoryComprehensionSheet } from './sheets/ReadingComprehensionSheets';

interface SheetRendererProps {
    activityType: ActivityType;
    data: SingleWorksheetData;
}

// --- WIDGETS ---

const TableWidget = ({ item }: { item: any }) => {
    if (!item.rows || !Array.isArray(item.rows)) return null;
    return (
        <div className="w-full overflow-hidden rounded-xl border-2 border-zinc-300">
            <table className="w-full text-sm text-left">
                {item.headers && (
                    <thead className="bg-zinc-100 text-zinc-700 font-bold uppercase text-xs">
                        <tr>
                            {item.headers.map((h: string, i: number) => (
                                <th key={i} className="px-4 py-3 border-b border-zinc-300"><EditableText value={h} tag="span" /></th>
                            ))}
                        </tr>
                    </thead>
                )}
                <tbody className="divide-y divide-zinc-200">
                    {item.rows.map((row: string[], r: number) => (
                        <tr key={r} className="bg-white">
                            {row.map((cell: string, c: number) => (
                                <td key={c} className="px-4 py-3 border-r border-zinc-200 last:border-r-0"><EditableText value={cell} tag="span" /></td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ChartWidget = ({ item }: { item: any }) => {
    if (!item.dataPoints) return null;
    const maxVal = Math.max(...item.dataPoints.map((d: any) => d.value), 10);
    
    return (
        <div className="w-full h-40 flex items-end justify-around gap-2 p-4 bg-white border rounded-xl">
            {item.dataPoints.map((d: any, i: number) => (
                <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                    <div className="text-xs font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{d.value}</div>
                    <div 
                        className="w-full bg-indigo-500 rounded-t-md transition-all duration-500 hover:bg-indigo-600" 
                        style={{height: `${(d.value / maxVal) * 100}%`}}
                    ></div>
                    <div className="text-[10px] text-zinc-500 mt-2 font-bold uppercase truncate w-full text-center"><EditableText value={d.label} tag="span" /></div>
                </div>
            ))}
        </div>
    );
};

const ShapeGridWidget = ({ item }: { item: any }) => {
    const rows = item.gridConfig?.rows || 3;
    const cols = item.gridConfig?.cols || 3;
    const active = item.activeCells || [];
    
    return (
        <div className="flex justify-center p-2">
            <div className="grid gap-1 bg-zinc-200 p-1 rounded" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {Array.from({length: rows * cols}).map((_, i) => (
                    <div key={i} className={`w-8 h-8 rounded border border-white flex items-center justify-center ${active.includes(i) ? 'bg-indigo-500 text-white' : 'bg-white'}`}>
                        {active.includes(i) && <i className="fa-solid fa-check text-xs"></i>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const KeyValueWidget = ({ item }: { item: any }) => (
    <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-lg border border-zinc-200">
        <span className="font-bold text-zinc-600 text-sm"><EditableText value={item.label} tag="span" /></span>
        <span className="font-mono font-bold text-indigo-600 bg-white px-2 py-1 rounded border border-zinc-200"><EditableText value={item.value} tag="span" /></span>
    </div>
);

const CodeBlockWidget = ({ item }: { item: any }) => (
    <div className="w-full bg-zinc-900 text-green-400 p-4 rounded-xl font-mono text-sm overflow-x-auto shadow-inner border border-zinc-700">
        <div className="flex justify-between items-center mb-2 border-b border-zinc-700 pb-1">
             <span className="text-xs uppercase font-bold text-zinc-500">{item.label || 'KOD / ALGORİTMA'}</span>
             <div className="flex gap-1">
                 <div className="w-2 h-2 rounded-full bg-red-500"></div>
                 <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                 <div className="w-2 h-2 rounded-full bg-green-500"></div>
             </div>
        </div>
        <pre className="whitespace-pre-wrap"><EditableText value={item.value || item.text} tag="span" /></pre>
    </div>
);

// --- DYNAMIC RENDERER ---

const DynamicLayoutRenderer: React.FC<{ data: any }> = ({ data }) => {
    
    const getGridClass = (cols?: number, layout?: string) => {
        if (layout === 'list') return 'flex flex-col gap-4';
        if (layout === 'flex') return 'flex flex-wrap gap-4 justify-center';
        
        const c = cols || 1;
        if (c === 1) return 'grid grid-cols-1 gap-4';
        if (c === 2) return 'grid grid-cols-1 md:grid-cols-2 gap-6';
        if (c === 3) return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4';
        return 'grid grid-cols-2 md:grid-cols-4 gap-4';
    };

    const renderItem = (item: any, index: number) => {
        // Primitive check
        if (typeof item !== 'object' || item === null) {
            return (
                <EditableElement key={index} className="p-4 bg-white border border-zinc-200 rounded-xl shadow-sm text-center font-bold">
                    <EditableText value={item} tag="span" />
                </EditableElement>
            );
        }

        // --- WIDGET SWITCHER ---
        if (item.type === 'table') return <EditableElement key={index}><TableWidget item={item} /></EditableElement>;
        if (item.type === 'chart') return <EditableElement key={index}><ChartWidget item={item} /></EditableElement>; 
        if (item.type === 'shape_grid') return <EditableElement key={index}><ShapeGridWidget item={item} /></EditableElement>;
        if (item.type === 'key_value') return <EditableElement key={index}><KeyValueWidget item={item} /></EditableElement>;
        if (item.type === 'code_block') return <EditableElement key={index}><CodeBlockWidget item={item} /></EditableElement>;

        // Default Card Renderer
        return (
            <EditableElement key={index} className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm flex flex-col gap-3 min-h-[100px] break-inside-avoid">
                {(item.imagePrompt || item.imageBase64) && (
                    <div className="w-full aspect-video bg-zinc-50 rounded-lg overflow-hidden border border-zinc-100 flex items-center justify-center p-2">
                         <ImageDisplay 
                            base64={item.imageBase64}
                            prompt={item.imagePrompt} 
                            description={item.text || item.label} 
                            className="w-full h-full object-contain" 
                        />
                    </div>
                )}
                
                <div className="flex-1 text-center flex flex-col justify-center">
                    {item.text && <div className="font-bold text-lg"><EditableText value={item.text} tag="span" /></div>}
                    {item.label && <div className="text-sm text-zinc-500 font-medium uppercase tracking-wide mt-1"><EditableText value={item.label} tag="span" /></div>}
                    {item.value && !item.text && <div className="font-mono text-xl font-bold"><EditableText value={item.value} tag="span" /></div>}
                    
                    {item.options && (
                        <div className="mt-3 space-y-2">
                            {item.options.map((opt: string, i: number) => (
                                <div key={i} className="px-3 py-2 border rounded-lg text-sm text-left bg-zinc-50 flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-zinc-300 rounded-full"></div>
                                    <EditableText value={opt} tag="span" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </EditableElement>
        );
    };

    if (data.sections && Array.isArray(data.sections)) {
        return (
            <div className="w-full h-full flex flex-col gap-8">
                 {/* Only show header instruction if it's the first page or data says so */}
                 {!data.isContinuation && (
                    <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
                 )}
                 {data.isContinuation && (
                    <div className="border-b-2 border-zinc-200 pb-2 mb-2 text-center text-zinc-400 font-bold uppercase text-xs">
                        {data.title} (Devam)
                    </div>
                 )}
                 
                 {data.sections.map((section: any, i: number) => (
                    <div key={i} className="w-full">
                        {section.title && <h4 className="font-black text-lg mb-4 border-b-2 border-zinc-100 pb-2 text-zinc-700">{section.title}</h4>}
                        <div className={getGridClass(section.layoutConfig?.gridCols, section.layoutConfig?.containerType)}>
                            {(section.content || []).map((item: any, k: number) => renderItem(item, k))}
                        </div>
                    </div>
                 ))}
            </div>
        );
    }

    // Fallback for flat lists
    const items = data.items || data.questions || data.cards || [];
    const layout = data.layoutConfig || {};

    return (
        <div className="w-full h-full flex flex-col">
            <PedagogicalHeader title={data?.title} instruction={data?.instruction} note={data?.pedagogicalNote} data={data} />
            <div className={`flex-1 p-4 ${getGridClass(layout.gridCols, layout.containerType)}`}>
                 {items.map((item: any, idx: number) => renderItem(item, idx))}
            </div>
        </div>
    );
};

export const SheetRenderer = React.memo(({ activityType, data }: SheetRendererProps) => {
    if (!data) return null;
    
    // Explicit routing for Reading Studio content
    if (activityType === 'STORY_COMPREHENSION') {
        return <StoryComprehensionSheet data={data} />;
    }

    return <DynamicLayoutRenderer data={data} />;
});
