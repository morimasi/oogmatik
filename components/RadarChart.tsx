
import React from 'react';

export const RadarChart = ({ data }: { data: { label: string; value: number }[] }) => {
    if (!data || data.length === 0) return <p className="text-center text-zinc-400">Veri yok</p>;
    
    const size = 300;
    const center = size / 2;
    const radius = 100;
    const angleStep = (Math.PI * 2) / data.length;

    const getCoords = (value: number, index: number) => {
        const angle = index * angleStep - Math.PI / 2;
        const r = (value / 100) * radius;
        return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) };
    };

    const points = data.map((d, i) => {
        const c = getCoords(d.value, i);
        return `${c.x},${c.y}`;
    }).join(' ');

    return (
        <svg width={size} height={size} className="mx-auto drop-shadow-xl">
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#e5e7eb" strokeWidth="1" />
            {[25, 50, 75, 100].map((level, idx) => {
                const pts = data.map((_, i) => {
                    const c = getCoords(level, i);
                    return `${c.x},${c.y}`;
                }).join(' ');
                return <polygon key={idx} points={pts} fill="none" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="4 4" />;
            })}
            {data.map((_, i) => {
                const p = getCoords(100, i);
                return <line key={i} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#d1d5db" strokeWidth="1" />;
            })}
            <polygon points={points} fill="rgba(99, 102, 241, 0.4)" stroke="#4f46e5" strokeWidth="3" />
            {data.map((d, i) => {
                const p = getCoords(d.value, i);
                const labelP = getCoords(125, i); 
                return (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="5" fill="#4f46e5" stroke="white" strokeWidth="2" />
                        <text x={labelP.x} y={labelP.y} textAnchor="middle" dominantBaseline="middle" className="text-xs font-bold fill-zinc-600 dark:fill-zinc-300 uppercase tracking-wider">
                            {d.label}
                        </text>
                        <text x={labelP.x} y={labelP.y + 15} textAnchor="middle" className="text-[10px] fill-indigo-500 font-bold">%{d.value}</text>
                    </g>
                );
            })}
        </svg>
    );
};
