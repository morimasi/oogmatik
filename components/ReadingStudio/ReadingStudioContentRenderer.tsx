
import React from 'react';
import { ImageDisplay } from '../sheets/common';

interface ReadingStudioContentRendererProps {
    layout: any[];
    storyData: any;
}

export const ReadingStudioContentRenderer: React.FC<ReadingStudioContentRendererProps> = ({ layout, storyData }) => {
    if (!layout || !Array.isArray(layout)) return null;

    const renderItemContent = (item: any) => {
        const s = item.style;
        const boxStyle = {
            padding: `${s.padding}px`,
            backgroundColor: s.backgroundColor,
            borderColor: s.borderColor,
            borderWidth: `${s.borderWidth}px`,
            borderStyle: s.borderStyle || 'solid',
            borderRadius: `${s.borderRadius}px`,
            boxShadow: s.boxShadow !== 'none' ? `var(--shadow-${s.boxShadow})` : 'none',
            opacity: s.opacity,
            color: s.color,
            fontFamily: s.fontFamily,
            fontSize: `${s.fontSize}px`,
            lineHeight: s.lineHeight,
            textAlign: s.textAlign as any,
            letterSpacing: `${s.letterSpacing}px`,
            fontWeight: s.fontWeight || 'normal'
        };

        if (item.id === 'header') {
            const data = item.specificData || { title: "HİKAYE", subtitle: "" };
            return (
                <div className="h-full flex flex-col justify-end" style={boxStyle}>
                    <h1 className="font-black uppercase leading-none" style={{fontSize: '2em', color: 'inherit'}}>{data.title}</h1>
                    <span className="font-mono text-xs opacity-70 mt-1">{data.subtitle}</span>
                </div>
            );
        }
        
        if (item.id === 'story_block') {
            const data = item.specificData || { text: "" };
            return (
                <div className="relative" style={boxStyle}>
                     {item.style.imageSettings?.enabled && (
                        <div className={`float-${item.style.imageSettings.position === 'left' ? 'left' : 'right'} w-1/3 h-48 bg-transparent ml-4 mb-2 rounded-lg relative z-10`}>
                            <ImageDisplay 
                                prompt={data.imagePrompt} 
                                className="w-full h-full object-contain" 
                            />
                        </div>
                     )}
                     <div dangerouslySetInnerHTML={{__html: (data.text || '').replace(/\n/g, '<br/>')}}></div>
                </div>
            );
        }

        if (item.id.startsWith('questions') || item.id === 'vocabulary') {
            const data = item.specificData || { questions: [] };
            return (
                <div className="flex flex-col" style={boxStyle}>
                    <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50">{item.customTitle}</h4>
                    <div className="flex-1 space-y-2">
                        {(data.questions || []).map((q: any, i: number) => (
                            <div key={i} className="flex gap-2 items-start text-sm">
                                <span className="font-bold bg-current text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] shrink-0" style={{backgroundColor: s.color}}>{i+1}</span>
                                <p>{q.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        if (item.id === 'creative') {
             const data = item.specificData || { task: "" };
             return (
                 <div className="h-full flex flex-col" style={boxStyle}>
                     <h4 className="font-black text-xs uppercase mb-2 border-b pb-1 opacity-50">{item.customTitle}</h4>
                     <p className="text-sm font-bold mb-2">{data.task}</p>
                     <div className="flex-1 border-2 border-dashed border-current/30 rounded-xl min-h-[100px]"></div>
                 </div>
             );
        }

        return <div style={boxStyle}>{item.label}</div>;
    };

    return (
        <div className="relative w-full h-full min-h-[800px] bg-white text-black">
            {layout.filter(l => l.isVisible).map((item: any) => (
                <div 
                    key={item.instanceId} 
                    className="absolute" 
                    style={{ 
                        left: item.style.x, 
                        top: item.style.y, 
                        width: item.style.w, 
                        height: item.style.h, 
                        transform: `rotate(${item.style.rotation || 0}deg)`, 
                        zIndex: item.style.zIndex 
                    }}
                >
                    {renderItemContent(item)}
                </div>
            ))}
        </div>
    );
};
