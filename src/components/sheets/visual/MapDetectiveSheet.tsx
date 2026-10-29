// @ts-ignore
import React, { useRef, useLayoutEffect, useState, useCallback } from 'react';
// @ts-ignore
import { MapInstructionData, StyleSettings } from '../../../types';
import { PedagogicalHeader } from '../common';
import { EditableText } from '../../Editable';
import { TurkeyMapSVG } from './TurkeyMapSVG';
import { WorldMapSVG } from './WorldMapSVG';
import { TreasureMapSVG } from './TreasureMapSVG';

const CompassRose = () => (
    <div className="flex flex-col items-center opacity-80 scale-105">
        <div className="w-14 h-14 border-[2.5px] border-zinc-900 rounded-full flex items-center justify-center relative bg-white shadow-xl">
            <span className="absolute -top-1.5 text-[11px] font-black bg-white px-1 leading-none text-zinc-900">K</span>
            <span className="absolute -bottom-1.5 text-[11px] font-black bg-white px-1 leading-none text-zinc-900">G</span>
            <span className="absolute -left-2 text-[11px] font-black bg-white px-1 leading-none text-zinc-900">B</span>
            <span className="absolute -right-2 text-[11px] font-black bg-white px-1 leading-none text-zinc-900">D</span>
            <div className="w-0.5 h-full bg-zinc-900 absolute left-1/2 -translate-x-1/2"></div>
            <div className="h-0.5 w-full bg-zinc-900 absolute top-1/2 -translate-y-1/2"></div>
            <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full z-10 border-2 border-white"></div>
        </div>
    </div>
);

const MapMarker = ({ type }: { type: string }) => {
    switch (type) {
        case 'star':
            return <polygon points="0,-8 2.2,-2.8 8,-2.8 3.2,1.2 5,6.8 0,3.6 -5,6.8 -3.2,1.2 -8,-2.8 -2.2,-2.8" fill="#4f46e5" stroke="white" strokeWidth="1.2" />;
        case 'target':
            return (
                <g>
                    <circle r="6" fill="none" stroke="#4f46e5" strokeWidth="1.8" />
                    <circle r="2" fill="#4f46e5" />
                    <path d="M-9,0 L9,0 M0,-9 L0,9" stroke="#4f46e5" strokeWidth="1.2" />
                </g>
            );
        case 'dot':
            return <circle r="3.5" fill="#18181b" stroke="white" strokeWidth="1.5" />;
        case 'none':
            return null;
        default:
            return (
                <g>
                    <circle r="6.5" fill="#4f46e5" fillOpacity="0.25" />
                    <circle r="3.5" fill="#4f46e5" stroke="white" strokeWidth="1.5" />
                </g>
            );
    }
};

export const MapDetectiveSheet = ({
    data,
    settings
}: {
    data: MapInstructionData;
    settings?: StyleSettings;
}) => {
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
    const mapType = (settings?.mapType as string) || data.settings?.mapType || 'turkey';
    const showCityNames = settings?.showCityNames !== undefined
        ? settings.showCityNames !== false
        : data.settings?.showCityNames !== false;
    const markerStyle = (settings?.markerStyle as string) || data.settings?.markerStyle || 'circle';
    const includeCompass = settings?.includeCompass !== undefined
        ? settings.includeCompass !== false
        : data.settings?.includeCompass !== false;
    const useGridSystem = settings?.useGridSystem !== undefined
        ? !!settings.useGridSystem
        : !!data.settings?.useGridSystem;

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
                <div className="relative w-full aspect-[1000/500] bg-white border-[3px] border-zinc-900 rounded-[2rem] overflow-hidden shadow-lg mb-3 print:mb-2 group print:border-[2.5px] print:rounded-xl" style={{ minHeight: '180px' }}>

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

                            {useGridSystem && (() => {
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

                            {/* Şehir İşaretçileri ve İsimleri — Kristal Netliğinde, Beyaz Konturlu */}
                            {(data.cities || []).map((city) => (
                                <g key={city.id} transform={`translate(${city.x}, ${city.y})`}>
                                    <MapMarker type={markerStyle} />
                                    {showCityNames && (
                                        <text
                                            y="-11"
                                            textAnchor="middle"
                                            fontSize="10"
                                            fontWeight="900"
                                            className="fill-zinc-900 font-sans tracking-tight"
                                            style={{
                                                paintOrder: 'stroke',
                                                stroke: '#ffffff',
                                                strokeWidth: '3.5px',
                                                strokeLinejoin: 'round',
                                                fontFamily: 'Lexend, sans-serif'
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
                    {includeCompass && (
                        <div className="absolute bottom-2.5 right-3 flex items-end gap-4 z-30 no-print">
                            <CompassRose />
                        </div>
                    )}

                    {/* Harita Tipi Rozeti */}
                    {!isCustomMap && (
                        <div className="absolute top-3 right-4 bg-zinc-900/85 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-md border border-white/20 z-40">
                            <i className={`fa-solid mr-1.5 ${mapType === 'world' ? 'fa-globe' : mapType === 'treasure' ? 'fa-gem' : 'fa-map'}`}></i>
                            {mapType === 'world' ? 'Dünya' : mapType === 'treasure' ? 'Hazine' : 'Türkiye'}
                        </div>
                    )}
                </div>

                {/* YÖNERGE LİSTESİ */}
                <div className="grid grid-cols-1 print:grid-cols-2 md:grid-cols-2 gap-x-5 gap-y-2 p-3.5 print:p-2.5 bg-zinc-50 rounded-[1.8rem] print:rounded-xl border border-zinc-200">
                    {(data.instructions || []).map((inst, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-2.5 print:p-2 bg-white rounded-xl print:rounded-lg border border-zinc-200 shadow-sm">
                            <div className="w-6 h-6 print:w-5 print:h-5 rounded-lg bg-zinc-900 text-white flex items-center justify-center text-xs print:text-[10px] font-black shrink-0 shadow">
                                {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[12.5px] print:text-[11px] font-bold text-zinc-800 leading-snug">
                                    <EditableText value={inst} tag="span" />
                                </p>
                            </div>
                            <div className="w-5 h-5 rounded-lg border-2 border-zinc-200 shrink-0 mt-0.5 cursor-pointer hover:bg-emerald-500 hover:border-emerald-600 transition-all flex items-center justify-center group/check no-print">
                                <i className="fa-solid fa-check text-white opacity-0 group-hover/check:opacity-100 text-[9px]"></i>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Öğretmen Pedagojik Notu (ZPD & Bilişsel Haritalama) */}
                {data.pedagogicalNote && (
                    <div className="mt-2.5 p-2.5 bg-blue-50/80 border border-blue-200/70 rounded-xl text-[10px] text-blue-900 flex items-start gap-2 print:hidden">
                        <i className="fa-solid fa-graduation-cap text-blue-600 mt-0.5 text-xs shrink-0"></i>
                        <div className="leading-snug">
                            <strong className="font-black text-blue-950">Öğretmen / Terapist Notu (ZPD): </strong>
                            <span>{data.pedagogicalNote}</span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="mt-3 pt-2 flex justify-between items-center px-4 border-t border-zinc-100 opacity-50 print:opacity-60">
                    <div className="flex gap-6 print:gap-3">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Sistem</span>
                            <span className="text-[9px] font-bold text-zinc-800 uppercase">Harita Dedektifi Motoru</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em]">Mod</span>
                            <span className="text-[9px] font-bold text-indigo-600 uppercase">Uzamsal & Dilsel Algı</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end">
                        <p className="text-[7px] text-zinc-400 font-bold uppercase tracking-[0.4em] text-right">bdmind EdTech • Bilişsel Gelişim</p>
                        <div className="flex gap-2.5 text-zinc-400 text-xs">
                            <i className="fa-solid fa-compass"></i>
                            <i className="fa-solid fa-map-location-dot"></i>
                            <i className="fa-solid fa-brain"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
