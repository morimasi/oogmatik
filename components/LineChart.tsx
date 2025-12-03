
import React from 'react';

interface DataPoint {
    date: string;
    [key: string]: number | string;
}

interface LineChartProps {
    data: DataPoint[];
    lines: { key: string; color: string; label: string }[];
    height?: number;
}

export const LineChart: React.FC<LineChartProps> = ({ data, lines, height = 250 }) => {
    if (!data || data.length < 2) {
        return (
            <div className="flex items-center justify-center text-zinc-400 text-sm italic" style={{ height }}>
                Yeterli veri yok (En az 2 değerlendirme gerekli)
            </div>
        );
    }

    const width = 600; // Internal viewBox width
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const xStep = chartWidth / (data.length - 1);
    
    // Y-Axis is always 0-100 for scores
    const getY = (val: number) => height - padding - (val / 100) * chartHeight;
    const getX = (idx: number) => padding + idx * xStep;

    return (
        <div className="w-full h-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                {/* Grid Lines */}
                {[0, 25, 50, 75, 100].map((tick) => (
                    <g key={tick}>
                        <line 
                            x1={padding} 
                            y1={getY(tick)} 
                            x2={width - padding} 
                            y2={getY(tick)} 
                            stroke="#e5e7eb" 
                            strokeWidth="1" 
                            strokeDasharray="4 4" 
                        />
                        <text x={padding - 10} y={getY(tick)} dy="4" textAnchor="end" className="text-[10px] fill-zinc-400">{tick}</text>
                    </g>
                ))}

                {/* X-Axis Labels */}
                {data.map((d, i) => (
                    <text key={i} x={getX(i)} y={height - 10} textAnchor="middle" className="text-[10px] fill-zinc-500 font-medium">
                        {new Date(d.date as string).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' })}
                    </text>
                ))}

                {/* Lines */}
                {lines.map((line) => {
                    const pathD = data.map((d, i) => {
                        const val = d[line.key] as number || 0;
                        const x = getX(i);
                        const y = getY(val);
                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ');

                    return (
                        <g key={line.key}>
                            {/* The Line */}
                            <path d={pathD} fill="none" stroke={line.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            
                            {/* The Dots */}
                            {data.map((d, i) => {
                                const val = d[line.key] as number || 0;
                                return (
                                    <circle 
                                        key={i} 
                                        cx={getX(i)} 
                                        cy={getY(val)} 
                                        r="4" 
                                        fill="white" 
                                        stroke={line.color} 
                                        strokeWidth="2" 
                                    />
                                );
                            })}
                        </g>
                    );
                })}
            </svg>
            
            {/* Legend */}
            <div className="flex justify-center gap-4 mt-2">
                {lines.map(line => (
                    <div key={line.key} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: line.color }}></div>
                        <span className="text-xs font-bold text-zinc-600 dark:text-zinc-300">{line.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};
