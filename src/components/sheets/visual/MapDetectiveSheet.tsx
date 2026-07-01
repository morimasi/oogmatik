// @ts-ignore
import React, { useRef, useLayoutEffect, useState, useCallback } from 'react';
// @ts-ignore
import * as _React from 'react';
import { MapInstructionData } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';
import { TurkeyMapSVG } from './TurkeyMapSVG';
import { WorldMapSVG } from './WorldMapSVG';
import { TreasureMapSVG } from './TreasureMapSVG';

const CompassRose = () => (
    <div className="flex flex-col items-center opacity-70 scale-110">
        <div className="w-16 h-16 border-[3px] border-zinc-900 rounded-full flex items-center justify-center relative bg-white shadow-xl">
            <span className="absolute -top-1.5 text-[12px] font-black bg-white px-1 leading-none">K</span>
            <span className="absolute -bottom-1.5 text-[12px] font-black bg-white px-1 leading-none">G</span>
            <span className="absolute -left-2 text-[12px] font-black bg-white px-1 leading-none">B</span>
            <span className="absolute -right-2 text-[12px] font-black bg-white px-1 leading-none">D</span>
            <div className="w-0.5 h-full  bg-zinc-900 absolute left-1/2 -translate-x-1/2"></div>
            <div className="h-0.5 w-full bg-zinc-900 absolute top-1/2 -translate-y-1/2"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full z-10 border-2 border-white"></div>
        </div>
    </div>
);

const MapMarker = ({ type }: { type: string }) => {
    switch (type) {
        case 'star':
            return <polygon points="0,-10 2.5,-3.5 10,-3.5 4,1.5 6,8.5 0,4.5 -6,8.5 -4,1.5 -10,-3.5 -2.5,-3.5" fill="#4f46e5" stroke="white" strokeWidth="1" />;
        case 'target':
            return (
                <g>
                    <circle r="7" fill="none" stroke="#4f46e5" strokeWidth="2" />
                    <circle r="2" fill="#4f46e5" />
                    <path d="M-11,0 L11,0 M0,-11 L0,11" stroke="#4f46e5" strokeWidth="1.5" />
                </g>
            );
        case 'dot':
            return <circle r="4" fill="#000" stroke="white" strokeWidth="1.5" />;
        case 'none':
            return null;
        default:
            return (
                <g>
                    <circle r="8" fill="#4f46e5" fillOpacity="0.2" className="animate-pulse" />
                    <circle r="4.5" fill="#4f46e5" stroke="white" strokeWidth="1.5" />
                </g>
            );
    }
};

export const MapDetectiveSheet = ({ data }: { data: MapInstructionData }) => {
    const contentRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const measureAndScale = useCallback(() => {
        const el = contentRef.current;
        if (!el) return;

        const parent = el.parentElement;
        if (!parent) return;

        const availableHeight = parent.clientHeight;
        const contentHeight = el.scrollHeight;

        if (contentHeight > availableHeight && availableHeight > 50) {
            const s = Math.max(0.35, availableHeight / contentHeight - 0.01);
            setScale(s);
        } else {
            setScale(1);
        }
    }, []);

    useLayoutEffect(() => {
        measureAndScale();
        document.fonts?.ready?.then(measureAndScale);
        const timer = setTimeout(measureAndScale, 400);

        const ro = new ResizeObserver(measureAndScale);
        const el = contentRef.current?.parentElement;
        if (el) ro.observe(el);

        return () => {
            clearTimeout(timer);
            ro.disconnect();
        };
    }, [data.instructions, data.title, measureAndScale]);

    const isCustomMap = !!data.imageBase64;
    const mapType = data.settings?.mapType || 'turkey';
    const isTurkey = mapType === 'turkey' && !isCustomMap;

    return (
        <div className="flex flex-col bg-white font-sans text-black print:p-0"
            style={{
                overflow: 'hidden',
                height: 'var(--page-h, 297mm)',
                padding: '6px',
            }}>
            <div
                ref={contentRef}
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: 'top left',
                    width: scale < 1 ? `${100 / scale}%` : '100%',
                }}
            >
                <PedagogicalHeader title={data.title} instruction={data.instruction} />

                {/* HARİTA KANVASI */}
                <div className="relative w-full aspect-[1000/500] bg-white border-[4px] border-zinc-900 rounded-[2rem] overflow-hidden shadow-lg mb-4 print:mb-2 group print:border-[3px] print:rounded-xl" style={{ minHeight: '180px' }}>

                    {/* Zemin Harita Katmanı */}
                    <div className="absolute inset-0 w-full h-full bg-slate-50 z-10 flex items-center justify-center">
                        {isCustomMap ? (
                            <img
                                src={data.imageBase64}
                                alt="Özel Harita"
                                className="w-full h-full object-cover absolute inset-0"
                            />
                        ) : mapType === 'world' ? (
                            <WorldMapSVG
                                showRegionLabels={true}
                                width="100%"
                                height="100%"
                                className="w-full h-full absolute inset-0"
                            />
                        ) : mapType === 'treasure' ? (
                            <TreasureMapSVG
                                width="100%"
                                height="100%"
                                className="w-full h-full absolute inset-0"
                            />
                        ) : (
                            <TurkeyMapSVG
                                emphasizedRegion={data.emphasizedRegion || 'all'}
                                showRegionLabels={true}
                                width="100%"
                                height="100%"
                                className="w-full h-full absolute inset-0"
                            />
                        )}

                        <svg
                            viewBox="0 0 1000 500"
                            preserveAspectRatio="xMidYMid meet"
                            className="w-full h-full absolute inset-0 z-20 pointer-events-none"
                            style={{ top: 0, left: 0, position: 'absolute' }}
                        >
                            <style dangerouslySetInnerHTML={{
                                __html: `
                            @media print {
                                .print-grid-line { stroke: rgba(0,0,0,0.4) !important; stroke-width: 2.5px !important; }
                                .print-grid-text { fill: rgba(0,0,0,0.8) !important; font-weight: 900 !important; }
                            }
                        ` }} />

                            {(data.settings?.useGridSystem) && (() => {
                                const cols = data.gridConfig?.cols || 10;
                                const rows = data.gridConfig?.rows || 5;
                                const colWidth = 1000 / cols;
                                const rowHeight = 500 / rows;
                                const gridLines = [];

                                for (let i = 0; i <= cols; i++) {
                                    gridLines.push(<line key={`v${i}`} x1={i * colWidth} y1={0} x2={i * colWidth} y2={500} stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeDasharray="5,5" className="print-grid-line" />);
                                    if (i < cols) {
                                        gridLines.push(<text key={`c${i}`} x={i * colWidth + colWidth / 2} y={20} fontSize="14" fontWeight="bold" fill="rgba(0,0,0,0.4)" textAnchor="middle" className="print-grid-text">{String.fromCharCode(65 + i)}</text>);
                                        gridLines.push(<text key={`c${i}_b`} x={i * colWidth + colWidth / 2} y={490} fontSize="14" fontWeight="bold" fill="rgba(0,0,0,0.4)" textAnchor="middle" className="print-grid-text">{String.fromCharCode(65 + i)}</text>);
                                    }
                                }

                                for (let i = 0; i <= rows; i++) {
                                    gridLines.push(<line key={`h${i}`} x1={0} y1={i * rowHeight} x2={1000} y2={i * rowHeight} stroke="rgba(0,0,0,0.15)" strokeWidth="2" strokeDasharray="5,5" className="print-grid-line" />);
                                    if (i < rows) {
                                        gridLines.push(<text key={`r${i}`} x={20} y={i * rowHeight + rowHeight / 2 + 5} fontSize="14" fontWeight="bold" fill="rgba(0,0,0,0.4)" textAnchor="middle" className="print-grid-text">{i + 1}</text>);
                                        gridLines.push(<text key={`r${i}_r`} x={980} y={i * rowHeight + rowHeight / 2 + 5} fontSize="14" fontWeight="bold" fill="rgba(0,0,0,0.4)" textAnchor="middle" className="print-grid-text">{i + 1}</text>);
                                    }
                                }
                                return gridLines;
                            })()}

                            {(data.cities || []).map((city) => (
                                <g key={city.id} transform={`translate(${city.x}, ${city.y})`}>
                                    <MapMarker type={data.settings?.markerStyle || 'circle'} />
                                    {data.settings?.showCityNames !== false && (
                                        <text
                                            y="-14"
                                            textAnchor="middle"
                                            fontSize="11"
                                            fontWeight="900"
                                            className="fill-zinc-900 font-sans tracking-tight"
                                            style={{
                                                paintOrder: 'stroke',
                                                stroke: 'white',
                                                strokeWidth: '4px',
                                                strokeLinejoin: 'round'
                                            }}
                                        >
                                            {city.name}
                                        </text>
                                    )}
                                </g>
                            ))}
                        </svg>
                    </div>

                    {/* Pusula & Araçlar Overlay */}
                    {data.settings?.includeCompass !== false && (
                        <div className="absolute bottom-3 right-4 flex items-end gap-4 z-30 no-print">
                            <CompassRose />
                        </div>
                    )}

                    {/* Harita Tipi Rozeti */}
                    {!isCustomMap && (
                        <div className="absolute top-3 right-4 bg-zinc-900/80 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg border border-white/20 z-40">
                            <i className={`fa-solid mr-1 ${mapType === 'world' ? 'fa-globe' : mapType === 'treasure' ? 'fa-gem' : 'fa-map'}`}></i>
                            {mapType === 'world' ? 'Dünya' : mapType === 'treasure' ? 'Hazine' : 'Türkiye'}
                        </div>
                    )}
                </div>

                {/* YÖNERGE LİSTESİ — kompakt */}
                <div className="grid grid-cols-1 print:grid-cols-2 md:grid-cols-2 gap-x-6 gap-y-2 p-4 print:p-3 bg-zinc-50 rounded-[2rem] print:rounded-xl border border-zinc-100">
                    {(data.instructions || []).map((inst, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 print:p-2 bg-white rounded-xl print:rounded-lg border border-zinc-200 shadow-sm">
                            <div className="w-7 h-7 print:w-6 print:h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs print:text-[10px] font-black shrink-0 shadow">
                                {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] print:text-[11px] font-bold text-zinc-800 leading-snug">
                                    <EditableText value={inst} tag="span" />
                                </p>
                            </div>
                            <div className="w-6 h-6 rounded-lg border-2 border-zinc-200 shrink-0 mt-0.5 cursor-pointer hover:bg-emerald-500 hover:border-emerald-600 transition-all flex items-center justify-center group/check no-print">
                                <i className="fa-solid fa-check text-white opacity-0 group-hover/check:opacity-100 text-[10px]"></i>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer — kompakt */}
                <div className="mt-4 pt-3 flex justify-between items-center px-4 border-t border-zinc-100 opacity-40 print:opacity-50">
                    <div className="flex gap-6 print:gap-3">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Sistem</span>
                            <span className="text-[10px] font-bold text-zinc-800 uppercase">Manuel Görsel Entegrasyonu</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Motor</span>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase">Multimodal AI Vizyon</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.5em] text-right">Bursa Disleksi EduMind • Uzman Serisi</p>
                        <div className="flex gap-3 print:gap-1">
                            <i className="fa-solid fa-map-location-dot"></i>
                            <i className="fa-solid fa-brain"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};




