/**
 * NativeInfographicRenderer.tsx
 * @antv/infographic yüklenemediğinde devreye giren native React/SVG renderer.
 * Pedagojik nota dayalı 5 template türünü destekler.
 *
 * Bora Demir standardı: TypeScript strict, any yasak.
 * Elif Yıldız onaylı: Lexend font, disleksi uyumlu renk paleti.
 * 
 * Desteklenen formatlar:
 *   compare-binary-horizontal  → İki kolonlu karşılaştırma
 *   list-row-simple-*          → Ok işaretli yatay liste
 *   sequence-steps             → Numaralı adım sırası
 *   hierarchy-structure        → Hiyerarşik ağaç yapı
 *   sequence-timeline          → Kronolojik zaman çizelgesi
 */

import React, { useMemo } from 'react';

// ── Tip tanımları ────────────────────────────────────────────────────────────

type TemplateType =
    | 'compare-binary-horizontal'
    | 'compare-binary-vertical'
    | 'list-row-simple-horizontal-arrow'
    | 'list-row-simple-vertical'
    | 'sequence-steps'
    | 'hierarchy-structure'
    | 'sequence-timeline'
    | 'unknown';

interface ParsedInfographic {
    templateType: TemplateType;
    title: string;
    data: ParsedData;
}

interface ParsedData {
    // compare-binary
    left?: { title: string; items: string[] };
    right?: { title: string; items: string[] };
    // list-row / sequence-steps
    lists?: Array<{ label: string; desc: string }>;
    steps?: Array<{ label: string; desc: string }>;
    // hierarchy
    root?: HierarchyNode;
    // timeline
    events?: Array<{ date: string; title: string; desc: string }>;
}

interface HierarchyNode {
    label: string;
    children?: HierarchyNode[];
}

export interface NativeInfographicRendererProps {
    syntax: string;
    height?: string;
    className?: string;
    onError?: (error: Error) => void;
}

// ── Renk Paleti ─────────────────────────────────────────────────────────────
// Disleksi dostu: yüksek kontrast, canlı ama rahatsız etmez

const PALETTE = {
    primary: '#7c3aed',      // violet-700
    secondary: '#6d28d9',    // violet-800
    accent: '#a78bfa',       // violet-400
    leftCol: '#1d4ed8',      // blue-700
    rightCol: '#b45309',     // amber-700
    leftLight: '#dbeafe',    // blue-100
    rightLight: '#fef3c7',   // amber-100
    step: '#059669',         // emerald-700
    stepLight: '#d1fae5',    // emerald-100
    timeline: '#db2777',     // pink-700
    timelineLight: '#fce7f3',// pink-100
    bg: '#f8fafc',           // slate-50
    card: '#ffffff',
    text: '#1e293b',         // slate-800
    textMuted: '#64748b',    // slate-500
    border: '#e2e8f0',       // slate-200
};

// ── Syntax Parser ────────────────────────────────────────────────────────────

/**
 * @antv/infographic declarative syntax'ı parse eder.
 * Format:
 *   infographic <template-type>
 *   title <başlık>
 *   data
 *     <template'e özgü anahtar-değer>
 */
export function parseInfographicSyntax(syntax: string): ParsedInfographic {
    const lines = syntax
        .split('\n')
        .map((l) => l.replace(/\r/g, '').trimEnd());

    let templateType: TemplateType = 'unknown';
    let title = '';
    const data: ParsedData = {};

    // İlk satır: "infographic <template>"
    const firstLine = lines[0]?.trim() ?? '';
    const templateMatch = firstLine.match(/^infographic\s+(\S+)/i);
    if (templateMatch) {
        templateType = resolveTemplate(templateMatch[1]);
    }

    // Satırları iterasyonla parse et
    let i = 1;
    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (trimmed.startsWith('title ')) {
            title = trimmed.slice(6).trim();
            i++;
            continue;
        }

        if (trimmed === 'data') {
            i++;
            // data bloğunu parse et
            i = parseDataBlock(lines, i, templateType, data);
            continue;
        }

        i++;
    }

    return { templateType, title, data };
}

function resolveTemplate(raw: string): TemplateType {
    const lower = raw.toLowerCase();
    if (lower.includes('compare-binary-horizontal') || lower === 'compare-binary-horizontal') return 'compare-binary-horizontal';
    if (lower.includes('compare-binary')) return 'compare-binary-horizontal';
    if (lower.includes('list-row')) return 'list-row-simple-horizontal-arrow';
    if (lower.includes('sequence-steps') || lower.includes('sequence_steps')) return 'sequence-steps';
    if (lower.includes('hierarchy')) return 'hierarchy-structure';
    if (lower.includes('timeline')) return 'sequence-timeline';
    return 'unknown';
}

function getIndent(line: string): number {
    let count = 0;
    for (const ch of line) {
        if (ch === ' ') count++;
        else if (ch === '\t') count += 2;
        else break;
    }
    return count;
}

function parseDataBlock(
    lines: string[],
    startIdx: number,
    templateType: TemplateType,
    data: ParsedData
): number {
    let i = startIdx;

    if (templateType === 'compare-binary-horizontal' || templateType === 'compare-binary-vertical') {
        return parseCompareBinary(lines, i, data);
    }
    if (templateType === 'list-row-simple-horizontal-arrow' || templateType === 'list-row-simple-vertical') {
        return parseListRow(lines, i, data, 'lists');
    }
    if (templateType === 'sequence-steps') {
        return parseListRow(lines, i, data, 'steps');
    }
    if (templateType === 'hierarchy-structure') {
        return parseHierarchy(lines, i, data);
    }
    if (templateType === 'sequence-timeline') {
        return parseTimeline(lines, i, data);
    }

    return i;
}

// compare-binary: left/right blokları
function parseCompareBinary(lines: string[], startIdx: number, data: ParsedData): number {
    let i = startIdx;
    let currentSide: 'left' | 'right' | null = null;
    let inItems = false;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();
        if (!trimmed) { i++; continue; }

        if (trimmed === 'left') {
            currentSide = 'left';
            data.left = { title: '', items: [] };
            inItems = false;
            i++; continue;
        }
        if (trimmed === 'right') {
            currentSide = 'right';
            data.right = { title: '', items: [] };
            inItems = false;
            i++; continue;
        }
        if (trimmed.startsWith('title ') && currentSide) {
            const val = trimmed.slice(6).trim();
            if (currentSide === 'left' && data.left) data.left.title = val;
            if (currentSide === 'right' && data.right) data.right.title = val;
            i++; continue;
        }
        if (trimmed === 'items') {
            inItems = true;
            i++; continue;
        }
        if (inItems && trimmed.startsWith('- ')) {
            const item = trimmed.slice(2).trim();
            if (currentSide === 'left' && data.left) data.left.items.push(item);
            if (currentSide === 'right' && data.right) data.right.items.push(item);
            i++; continue;
        }

        i++;
    }
    return i;
}

// list-row / sequence-steps: items listesi
function parseListRow(
    lines: string[],
    startIdx: number,
    data: ParsedData,
    key: 'lists' | 'steps'
): number {
    const items: Array<{ label: string; desc: string }> = [];
    let i = startIdx;
    let currentItem: { label: string; desc: string } | null = null;
    let inBlock = false;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();

        if (!trimmed) { i++; continue; }

        if (trimmed === 'lists' || trimmed === 'steps') {
            inBlock = true;
            i++; continue;
        }

        if (inBlock && trimmed.startsWith('- label ')) {
            if (currentItem) items.push(currentItem);
            currentItem = { label: trimmed.slice(8).trim(), desc: '' };
            i++; continue;
        }
        if (inBlock && trimmed.startsWith('- ') && !trimmed.startsWith('- label') && !trimmed.startsWith('- desc')) {
            // kısa format: "- Madde"
            if (currentItem) items.push(currentItem);
            currentItem = { label: trimmed.slice(2).trim(), desc: '' };
            i++; continue;
        }
        if (inBlock && trimmed.startsWith('desc ') && currentItem) {
            currentItem.desc = trimmed.slice(5).trim();
            i++; continue;
        }

        i++;
    }

    if (currentItem) items.push(currentItem);
    data[key] = items;
    return i;
}

// hierarchy: root ağacı
function parseHierarchy(lines: string[], startIdx: number, data: ParsedData): number {
    let i = startIdx;

    while (i < lines.length) {
        const trimmed = lines[i].trim();
        if (trimmed === 'root') {
            i++;
            const [node, newIdx] = parseHierarchyNode(lines, i, 0);
            data.root = node;
            return newIdx;
        }
        i++;
    }
    return i;
}

function parseHierarchyNode(
    lines: string[],
    startIdx: number,
    baseIndent: number
): [HierarchyNode, number] {
    const node: HierarchyNode = { label: '', children: [] };
    let i = startIdx;

    while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();
        const indent = getIndent(line);

        if (!trimmed) { i++; continue; }
        if (indent < baseIndent && trimmed !== 'root') break;

        if (trimmed.startsWith('label ')) {
            node.label = trimmed.slice(6).trim();
            i++; continue;
        }
        if (trimmed === 'children') {
            i++;
            while (i < lines.length) {
                const childLine = lines[i];
                const childTrimmed = childLine.trim();
                const childIndent = getIndent(childLine);

                if (!childTrimmed) { i++; continue; }
                if (childIndent <= indent) break;

                if (childTrimmed.startsWith('- label ') || (childTrimmed.startsWith('- ') && !childTrimmed.startsWith('- label') && !childTrimmed.startsWith('- desc'))) {
                    const label = childTrimmed.startsWith('- label ')
                        ? childTrimmed.slice(8).trim()
                        : childTrimmed.slice(2).trim();
                    node.children?.push({ label });
                    i++; continue;
                }
                i++;
            }
            continue;
        }
        i++;
    }

    return [node, i];
}

// timeline: events listesi
function parseTimeline(lines: string[], startIdx: number, data: ParsedData): number {
    const events: Array<{ date: string; title: string; desc: string }> = [];
    let i = startIdx;
    let inEvents = false;
    let current: { date: string; title: string; desc: string } | null = null;

    while (i < lines.length) {
        const trimmed = lines[i].trim();
        if (!trimmed) { i++; continue; }

        if (trimmed === 'events') { inEvents = true; i++; continue; }

        if (inEvents) {
            if (trimmed.startsWith('- date ')) {
                if (current) events.push(current);
                current = { date: trimmed.slice(7).trim(), title: '', desc: '' };
                i++; continue;
            }
            if (trimmed.startsWith('title ') && current) {
                current.title = trimmed.slice(6).trim();
                i++; continue;
            }
            if (trimmed.startsWith('desc ') && current) {
                current.desc = trimmed.slice(5).trim();
                i++; continue;
            }
        }
        i++;
    }

    if (current) events.push(current);
    data.events = events;
    return i;
}

// ── Render Bileşenleri ───────────────────────────────────────────────────────

const fontStyle: React.CSSProperties = {
    fontFamily: "'Lexend', 'Inter', sans-serif",
};

/** compare-binary-horizontal */
const CompareBinaryRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const left = data.left ?? { title: 'Sol', items: [] };
    const right = data.right ?? { title: 'Sağ', items: [] };
    const maxItems = Math.max(left.items.length, right.items.length);

    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px', minHeight: '100%' }}>
            {title && (
                <h2 style={{ textAlign: 'center', color: PALETTE.text, fontSize: '20px', fontWeight: 700, marginBottom: '24px', lineHeight: 1.3 }}>
                    {title}
                </h2>
            )}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: '0', alignItems: 'stretch' }}>
                {/* Sol kolon */}
                <div style={{ background: PALETTE.leftLight, borderRadius: '12px 0 0 12px', border: `2px solid ${PALETTE.leftCol}`, overflow: 'hidden' }}>
                    <div style={{ background: PALETTE.leftCol, padding: '12px 16px', color: '#fff', fontWeight: 700, fontSize: '16px', textAlign: 'center' }}>
                        {left.title}
                    </div>
                    <div style={{ padding: '12px' }}>
                        {left.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', padding: '10px', background: '#fff', borderRadius: '8px', border: `1px solid ${PALETTE.leftCol}30` }}>
                                <span style={{ background: PALETTE.leftCol, color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                                    {idx + 1}
                                </span>
                                <span style={{ color: PALETTE.text, fontSize: '14px', lineHeight: 1.5 }}>{item}</span>
                            </div>
                        ))}
                        {left.items.length < maxItems && Array.from({ length: maxItems - left.items.length }).map((_, idx) => (
                            <div key={`pad-${idx}`} style={{ height: '52px', marginBottom: '10px' }} />
                        ))}
                    </div>
                </div>

                {/* Orta çizgi */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0' }}>
                    <div style={{ width: '2px', height: '100%', background: `linear-gradient(to bottom, ${PALETTE.leftCol}, ${PALETTE.rightCol})` }} />
                </div>

                {/* Sağ kolon */}
                <div style={{ background: PALETTE.rightLight, borderRadius: '0 12px 12px 0', border: `2px solid ${PALETTE.rightCol}`, overflow: 'hidden' }}>
                    <div style={{ background: PALETTE.rightCol, padding: '12px 16px', color: '#fff', fontWeight: 700, fontSize: '16px', textAlign: 'center' }}>
                        {right.title}
                    </div>
                    <div style={{ padding: '12px' }}>
                        {right.items.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', padding: '10px', background: '#fff', borderRadius: '8px', border: `1px solid ${PALETTE.rightCol}30` }}>
                                <span style={{ background: PALETTE.rightCol, color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                                    {idx + 1}
                                </span>
                                <span style={{ color: PALETTE.text, fontSize: '14px', lineHeight: 1.5 }}>{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

/** list-row-simple-horizontal-arrow */
const ListRowRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const items = data.lists ?? data.steps ?? [];

    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px', minHeight: '100%' }}>
            {title && (
                <h2 style={{ textAlign: 'center', color: PALETTE.text, fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
                    {title}
                </h2>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'flex-start' }}>
                {items.map((item, idx) => (
                    <React.Fragment key={idx}>
                        <div style={{ background: PALETTE.card, border: `2px solid ${PALETTE.primary}`, borderRadius: '12px', padding: '14px 16px', flex: '1', minWidth: '150px', maxWidth: '250px', boxShadow: '0 2px 8px rgba(124,58,237,0.1)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                <span style={{ background: PALETTE.primary, color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                                    {idx + 1}
                                </span>
                                <span style={{ color: PALETTE.primary, fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }}>{item.label}</span>
                            </div>
                            {item.desc && (
                                <p style={{ color: PALETTE.textMuted, fontSize: '12px', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
                            )}
                        </div>
                        {idx < items.length - 1 && (
                            <div style={{ display: 'flex', alignItems: 'center', color: PALETTE.accent, fontSize: '20px', padding: '8px 0', alignSelf: 'center' }}>
                                →
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

/** sequence-steps */
const SequenceStepsRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const steps = data.steps ?? data.lists ?? [];

    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px', minHeight: '100%' }}>
            {title && (
                <h2 style={{ textAlign: 'center', color: PALETTE.text, fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
                    {title}
                </h2>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {steps.map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'stretch', gap: '0' }}>
                        {/* Sol: numara + connector */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '16px' }}>
                            <div style={{ width: '36px', height: '36px', background: PALETTE.step, color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', flexShrink: 0, zIndex: 1 }}>
                                {idx + 1}
                            </div>
                            {idx < steps.length - 1 && (
                                <div style={{ width: '2px', flex: 1, background: `${PALETTE.step}40`, minHeight: '24px' }} />
                            )}
                        </div>
                        {/* Sağ: içerik */}
                        <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.step}30`, borderRadius: '10px', padding: '12px 16px', marginBottom: idx < steps.length - 1 ? '8px' : '0', flex: 1 }}>
                            <p style={{ color: PALETTE.step, fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>{step.label}</p>
                            {step.desc && <p style={{ color: PALETTE.textMuted, fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/** hierarchy-structure */
const HierarchyRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const root = data.root;

    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px', minHeight: '100%' }}>
            {title && (
                <h2 style={{ textAlign: 'center', color: PALETTE.text, fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
                    {title}
                </h2>
            )}
            {root && (
                <div style={{ textAlign: 'center' }}>
                    {/* Kök */}
                    <div style={{ display: 'inline-block', background: PALETTE.primary, color: '#fff', borderRadius: '12px', padding: '12px 24px', fontWeight: 700, fontSize: '16px', marginBottom: '24px' }}>
                        {root.label}
                    </div>
                    {root.children && root.children.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            {root.children.map((child, idx) => (
                                <div key={idx} style={{ background: PALETTE.card, border: `2px solid ${PALETTE.accent}`, borderRadius: '10px', padding: '12px 20px', minWidth: '120px', fontWeight: 600, color: PALETTE.primary, fontSize: '14px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', width: '2px', height: '20px', background: PALETTE.accent }} />
                                    {child.label}
                                    {child.children && child.children.length > 0 && (
                                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {child.children.map((grandchild, gIdx) => (
                                                <div key={gIdx} style={{ background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: PALETTE.textMuted, fontWeight: 400 }}>
                                                    {grandchild.label}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

/** sequence-timeline */
const TimelineRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const events = data.events ?? [];

    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px', minHeight: '100%' }}>
            {title && (
                <h2 style={{ textAlign: 'center', color: PALETTE.text, fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
                    {title}
                </h2>
            )}
            <div style={{ position: 'relative', paddingLeft: '40px' }}>
                {/* Dikey çizgi */}
                <div style={{ position: 'absolute', left: '16px', top: '0', bottom: '0', width: '3px', background: `linear-gradient(to bottom, ${PALETTE.timeline}, ${PALETTE.accent})`, borderRadius: '2px' }} />
                {events.map((event, idx) => (
                    <div key={idx} style={{ position: 'relative', marginBottom: '24px', paddingLeft: '24px' }}>
                        {/* Nokta */}
                        <div style={{ position: 'absolute', left: '-32px', top: '4px', width: '14px', height: '14px', background: PALETTE.timeline, borderRadius: '50%', border: '3px solid #fff', boxShadow: `0 0 0 2px ${PALETTE.timeline}` }} />
                        <div style={{ background: PALETTE.card, border: `1px solid ${PALETTE.timeline}30`, borderRadius: '10px', padding: '12px 16px' }}>
                            <span style={{ display: 'inline-block', background: PALETTE.timelineLight, color: PALETTE.timeline, borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700, marginBottom: '6px' }}>
                                {event.date}
                            </span>
                            <p style={{ color: PALETTE.text, fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>{event.title}</p>
                            {event.desc && <p style={{ color: PALETTE.textMuted, fontSize: '12px', lineHeight: 1.5, margin: 0 }}>{event.desc}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/** Bilinmeyen format: ham syntax'ı göster */
const UnknownRenderer: React.FC<{ syntax: string }> = ({ syntax }) => (
    <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px' }}>
        <div style={{ background: '#fef9c3', border: '1px solid #fde68a', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ color: '#92400e', fontSize: '13px', fontWeight: 600, margin: 0 }}>
                ⚠️ Format tanınamadı — syntax önizlemesi:
            </p>
        </div>
        <pre style={{ background: '#f1f5f9', borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#475569', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {syntax}
        </pre>
    </div>
);

// ── Ana Bileşen ──────────────────────────────────────────────────────────────

export const NativeInfographicRenderer: React.FC<NativeInfographicRendererProps> = ({
    syntax,
    height = '400px',
    className = '',
    onError,
}) => {
    const parsed = useMemo(() => {
        try {
            return parseInfographicSyntax(syntax);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            onError?.(error);
            return null;
        }
    }, [syntax, onError]);

    if (!parsed) {
        return (
            <div className={className} style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ color: PALETTE.textMuted, fontSize: '14px' }}>Syntax parse edilemedi.</p>
            </div>
        );
    }

    const renderContent = () => {
        switch (parsed.templateType) {
            case 'compare-binary-horizontal':
            case 'compare-binary-vertical':
                return <CompareBinaryRenderer data={parsed.data} title={parsed.title} />;
            case 'list-row-simple-horizontal-arrow':
            case 'list-row-simple-vertical':
                return <ListRowRenderer data={parsed.data} title={parsed.title} />;
            case 'sequence-steps':
                return <SequenceStepsRenderer data={parsed.data} title={parsed.title} />;
            case 'hierarchy-structure':
                return <HierarchyRenderer data={parsed.data} title={parsed.title} />;
            case 'sequence-timeline':
                return <TimelineRenderer data={parsed.data} title={parsed.title} />;
            default:
                return <UnknownRenderer syntax={syntax} />;
        }
    };

    return (
        <div
            className={className}
            style={{
                height,
                overflowY: 'auto',
                overflowX: 'hidden',
                fontFamily: "'Lexend', 'Inter', sans-serif",
            }}
        >
            {renderContent()}
        </div>
    );
};

export default NativeInfographicRenderer;
