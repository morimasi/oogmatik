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
    | '5w1h-grid'
    | 'math-steps'
    | 'venn-diagram'
    | 'fishbone-diagram'
    | 'cycle-process'
    | 'matrix-grid'
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
    // 5w1h
    q5w1h?: {
        who?: string;
        what?: string;
        where?: string;
        when?: string;
        why?: string;
        how?: string;
    };
    // math-steps
    mathSteps?: Array<{ expression: string; step: string; explanation: string }>;
    // venn
    venn?: {
        setA: { label: string; items: string[] };
        setB: { label: string; items: string[] };
        intersection: string[];
    };
    // fishbone
    fishbone?: {
        problem: string;
        categories: Array<{ label: string; causes: string[] }>;
    };
    // cycle
    cycle?: Array<{ label: string; desc: string }>;
    // matrix
    matrix?: {
        headers: string[];
        rows: Array<{ label: string; values: string[] }>;
    };
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
    q5w1h: '#0891b2',        // cyan-600
    venn: '#ea580c',         // orange-600
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
    if (lower.includes('compare-binary-horizontal')) return 'compare-binary-horizontal';
    if (lower.includes('compare-binary')) return 'compare-binary-horizontal';
    if (lower.includes('list-row')) return 'list-row-simple-horizontal-arrow';
    if (lower.includes('sequence-steps') || lower.includes('sequence_steps')) return 'sequence-steps';
    if (lower.includes('hierarchy')) return 'hierarchy-structure';
    if (lower.includes('timeline')) return 'sequence-timeline';
    if (lower.includes('5w1h')) return '5w1h-grid';
    if (lower.includes('math-steps') || lower.includes('math_steps')) return 'math-steps';
    if (lower.includes('venn')) return 'venn-diagram';
    if (lower.includes('fishbone')) return 'fishbone-diagram';
    if (lower.includes('cycle')) return 'cycle-process';
    if (lower.includes('matrix')) return 'matrix-grid';
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
    if (templateType === '5w1h-grid') {
        return parse5W1H(lines, i, data);
    }
    if (templateType === 'math-steps') {
        return parseMathSteps(lines, i, data);
    }
    if (templateType === 'venn-diagram') {
        return parseVenn(lines, i, data);
    }
    if (templateType === 'fishbone-diagram') {
        return parseFishbone(lines, i, data);
    }
    if (templateType === 'cycle-process') {
        return parseCycle(lines, i, data);
    }
    if (templateType === 'matrix-grid') {
        return parseMatrix(lines, i, data);
    }

    return i;
}

// ── Parser Detayları ──────────────────────────────────────────────────────────

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

function parse5W1H(lines: string[], startIdx: number, data: ParsedData): number {
    data.q5w1h = {};
    let i = startIdx;
    while (i < lines.length) {
        const line = lines[i].trim();
        if (line.startsWith('who ')) data.q5w1h.who = line.slice(4).trim();
        else if (line.startsWith('what ')) data.q5w1h.what = line.slice(5).trim();
        else if (line.startsWith('where ')) data.q5w1h.where = line.slice(6).trim();
        else if (line.startsWith('when ')) data.q5w1h.when = line.slice(5).trim();
        else if (line.startsWith('why ')) data.q5w1h.why = line.slice(4).trim();
        else if (line.startsWith('how ')) data.q5w1h.how = line.slice(4).trim();
        i++;
    }
    return i;
}

function parseMathSteps(lines: string[], startIdx: number, data: ParsedData): number {
    data.mathSteps = [];
    let i = startIdx;
    let current: any = null;
    while (i < lines.length) {
        const line = lines[i].trim();
        if (line.startsWith('- step ')) {
            if (current) data.mathSteps.push(current);
            current = { step: line.slice(7).trim(), expression: '', explanation: '' };
        } else if (line.startsWith('expression ') && current) {
            current.expression = line.slice(11).trim();
        } else if (line.startsWith('explanation ') && current) {
            current.explanation = line.slice(12).trim();
        }
        i++;
    }
    if (current) data.mathSteps.push(current);
    return i;
}

function parseVenn(lines: string[], startIdx: number, data: ParsedData): number {
    data.venn = { setA: { label: '', items: [] }, setB: { label: '', items: [] }, intersection: [] };
    let i = startIdx;
    let target: 'A' | 'B' | 'I' | null = null;
    while (i < lines.length) {
        const line = lines[i].trim();
        if (line === 'setA') target = 'A';
        else if (line === 'setB') target = 'B';
        else if (line === 'intersection') target = 'I';
        else if (line.startsWith('label ')) {
            if (target === 'A') data.venn!.setA.label = line.slice(6).trim();
            if (target === 'B') data.venn!.setB.label = line.slice(6).trim();
        } else if (line.startsWith('- ')) {
            const val = line.slice(2).trim();
            if (target === 'A') data.venn!.setA.items.push(val);
            if (target === 'B') data.venn!.setB.items.push(val);
            if (target === 'I') data.venn!.intersection.push(val);
        }
        i++;
    }
    return i;
}

function parseFishbone(lines: string[], startIdx: number, data: ParsedData): number {
    data.fishbone = { problem: '', categories: [] };
    let i = startIdx;
    let currentCat: any = null;
    while (i < lines.length) {
        const line = lines[i].trim();
        if (line.startsWith('problem ')) data.fishbone.problem = line.slice(8).trim();
        else if (line.startsWith('- category ')) {
            if (currentCat) data.fishbone.categories.push(currentCat);
            currentCat = { label: line.slice(11).trim(), causes: [] };
        } else if (line.startsWith('  - ') && currentCat) {
            currentCat.causes.push(line.slice(4).trim());
        }
        i++;
    }
    if (currentCat) data.fishbone.categories.push(currentCat);
    return i;
}

function parseCycle(lines: string[], startIdx: number, data: ParsedData): number {
    data.cycle = [];
    let i = startIdx;
    let current: any = null;
    while (i < lines.length) {
        const line = lines[i].trim();
        if (line.startsWith('- step ')) {
            if (current) data.cycle.push(current);
            current = { label: line.slice(7).trim(), desc: '' };
        } else if (line.startsWith('desc ') && current) {
            current.desc = line.slice(5).trim();
        }
        i++;
    }
    if (current) data.cycle.push(current);
    return i;
}

function parseMatrix(lines: string[], startIdx: number, data: ParsedData): number {
    data.matrix = { headers: [], rows: [] };
    let i = startIdx;
    while (i < lines.length) {
        const line = lines[i].trim();
        if (line.startsWith('headers ')) {
            data.matrix.headers = line.slice(8).split(',').map(s => s.trim());
        } else if (line.startsWith('- row ')) {
            const parts = line.slice(6).split(':');
            data.matrix.rows.push({
                label: parts[0].trim(),
                values: parts[1].split(',').map(s => s.trim())
            });
        }
        i++;
    }
    return i;
}

// ── Render Bileşenleri ───────────────────────────────────────────────────────

const fontStyle: React.CSSProperties = {
    fontFamily: "'Lexend', 'Inter', sans-serif",
};

/** 5W1H Grid Renderer */
const Q5W1HRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const q = data.q5w1h || {};
    const boxes = [
        { label: 'KİM?', color: '#ef4444', value: q.who },
        { label: 'NE?', color: '#3b82f6', value: q.what },
        { label: 'NEREDE?', color: '#10b981', value: q.where },
        { label: 'NE ZAMAN?', color: '#f59e0b', value: q.when },
        { label: 'NİÇİN?', color: '#8b5cf6', value: q.why },
        { label: 'NASIL?', color: '#ec4899', value: q.how },
    ];

    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px' }}>
            {title && <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>{title}</h2>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                {boxes.map((box, idx) => (
                    <div key={idx} style={{ background: '#fff', border: `2px solid ${box.color}`, borderRadius: '12px', padding: '16px', textAlign: 'center' }}>
                        <div style={{ color: box.color, fontWeight: 800, fontSize: '12px', marginBottom: '8px' }}>{box.label}</div>
                        <div style={{ color: PALETTE.text, fontSize: '14px' }}>{box.value || '...'}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/** Math Steps Renderer */
const MathStepsRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const steps = data.mathSteps || [];
    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px' }}>
            {title && <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>{title}</h2>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {steps.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', background: '#fff', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${PALETTE.primary}20` }}>
                        <div style={{ background: PALETTE.primary, color: '#fff', padding: '12px', minWidth: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{s.step}</div>
                        <div style={{ padding: '12px', flex: 1 }}>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: PALETTE.primary, marginBottom: '4px' }}>{s.expression}</div>
                            <div style={{ fontSize: '13px', color: PALETTE.textMuted }}>{s.explanation}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/** Venn Diagram Renderer */
const VennRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const venn = data.venn;
    if (!venn) return null;
    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px', overflow: 'hidden' }}>
            {title && <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>{title}</h2>}
            <div style={{ position: 'relative', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '20%', width: '220px', height: '220px', borderRadius: '50%', background: '#3b82f644', border: '2px solid #3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                    <div style={{ fontWeight: 800, color: '#1d4ed8' }}>{venn.setA.label}</div>
                    <div style={{ fontSize: '11px', marginTop: '10px' }}>{venn.setA.items.slice(0, 3).join(', ')}</div>
                </div>
                <div style={{ position: 'absolute', right: '20%', width: '220px', height: '220px', borderRadius: '50%', background: '#ef444444', border: '2px solid #ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                    <div style={{ fontWeight: 800, color: '#b91c1c' }}>{venn.setB.label}</div>
                    <div style={{ fontSize: '11px', marginTop: '10px' }}>{venn.setB.items.slice(0, 3).join(', ')}</div>
                </div>
                <div style={{ zIndex: 10, background: '#fff9', padding: '10px', borderRadius: '8px', maxWidth: '120px', textAlign: 'center', border: '1px dashed #666' }}>
                    <div style={{ fontWeight: 800, fontSize: '10px' }}>KESİŞİM</div>
                    <div style={{ fontSize: '11px' }}>{venn.intersection.join(', ')}</div>
                </div>
            </div>
        </div>
    );
};

/** Fishbone Diagram Renderer */
const FishboneRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const fb = data.fishbone;
    if (!fb) return null;
    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px' }}>
            {title && <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>{title}</h2>}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {fb.categories.map((cat, idx) => (
                        <div key={idx} style={{ borderBottom: `2px solid ${PALETTE.primary}44`, paddingBottom: '8px' }}>
                            <div style={{ fontWeight: 800, color: PALETTE.primary, fontSize: '12px' }}>{cat.label}</div>
                            <div style={{ fontSize: '11px' }}>{cat.causes.map(c => `• ${c}`).join(' ')}</div>
                        </div>
                    ))}
                </div>
                <div style={{ width: '0', height: '100px', borderLeft: `4px solid ${PALETTE.secondary}`, margin: '0 20px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '0', width: '20px', height: '4px', background: PALETTE.secondary }} />
                </div>
                <div style={{ background: PALETTE.secondary, color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 800 }}>{fb.problem}</div>
            </div>
        </div>
    );
};

/** Cycle Process Renderer */
const CycleRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const steps = data.cycle || [];
    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px', textAlign: 'center' }}>
            {title && <h2 style={{ marginBottom: '24px' }}>{title}</h2>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {steps.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '120px', height: '120px', background: '#fff', border: `3px solid ${PALETTE.primary}`, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                            <div style={{ fontWeight: 800, fontSize: '12px' }}>{s.label}</div>
                            <div style={{ fontSize: '10px', color: PALETTE.textMuted }}>{s.desc}</div>
                        </div>
                        {idx < steps.length - 1 && <div style={{ fontSize: '24px', marginLeft: '20px' }}>↻</div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

/** Matrix Grid Renderer */
const MatrixRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const m = data.matrix;
    if (!m) return null;
    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px' }}>
            {title && <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>{title}</h2>}
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                <thead>
                    <tr style={{ background: PALETTE.primary, color: '#fff' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                        {m.headers.map((h, i) => <th key={i} style={{ padding: '12px', textAlign: 'left' }}>{h}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {m.rows.map((r, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${PALETTE.border}` }}>
                            <td style={{ padding: '12px', fontWeight: 800 }}>{r.label}</td>
                            {r.values.map((v, j) => <td key={j} style={{ padding: '12px', fontSize: '14px' }}>{v}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
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
            case '5w1h-grid':
                return <Q5W1HRenderer data={parsed.data} title={parsed.title} />;
            case 'math-steps':
                return <MathStepsRenderer data={parsed.data} title={parsed.title} />;
            case 'venn-diagram':
                return <VennRenderer data={parsed.data} title={parsed.title} />;
            case 'fishbone-diagram':
                return <FishboneRenderer data={parsed.data} title={parsed.title} />;
            case 'cycle-process':
                return <CycleRenderer data={parsed.data} title={parsed.title} />;
            case 'matrix-grid':
                return <MatrixRenderer data={parsed.data} title={parsed.title} />;
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
