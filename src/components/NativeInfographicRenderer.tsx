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
import { getInfographicPalette } from '../utils/themeUtils';

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
    | 'short-answer-grid'
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
    // short-answer-grid
    shortAnswers?: Array<{ question: string; defaultAnswer?: string }>;
    config?: { 
        questionCount: number; 
        lineCount: number; 
        colorMode: string;
        showStudentInfo?: boolean;
        gridDensity?: string;
        pedagogicalFocus?: string;
    };
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
    /** A4/print modunda true — sabit renkler kullanılır (Dr. Ahmet Kaya standardı) */
    forPrint?: boolean;
}

// ── Renk Paleti ─────────────────────────────────────────────────────────────
// Disleksi dostu: yüksek kontrast, canlı ama rahatsız etmez
// Selin Arslan — Palette Reflection: Ekran modunda tema rengi kullanılır.
// NOT: Bu sabit değerler yalnızca print/A4 modu için fallback olarak kalır.
// Bileşen render sırasında `getInfographicPalette(forPrint)` çağrısıyla dinamikleştirilir.

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
    const trimmed = syntax.trim();

    // XML-benzeri bir etiketle mi başlıyor? (Örn: <five-w-one-h)
    if (trimmed.startsWith('<')) {
        return parseXmlInfographicSyntax(trimmed);
    }

    const lines = trimmed.split('\n').map((l) => l.replace(/\r/g, '').trimEnd());

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
        const currentTrimmed = line.trim();

        if (currentTrimmed.startsWith('title ')) {
            title = currentTrimmed.slice(6).trim();
            i++;
            continue;
        }

        if (currentTrimmed === 'data') {
            i++;
            // data bloğunu parse et
            i = parseDataBlock(lines, i, templateType, data);
            continue;
        }

        i++;
    }

    return { templateType, title, data };
}

/** 
 * XML-benzeri etiketleri parse eden yeni nesil parser.
 * RegEx kullanarak performansı ve esnekliği artırır.
 */
function parseXmlInfographicSyntax(xml: string): ParsedInfographic {
    const data: ParsedData = {};
    let templateType: TemplateType = 'unknown';

    // 1. Ana Etiketi ve Başlığı Bul
    const mainTagMatch = xml.match(/<([\w-]+)[^>]*title=['"]([^'"]+)['"]/);
    const title = mainTagMatch ? mainTagMatch[2] : 'İnfografik';
    const mainTagName = mainTagMatch ? mainTagMatch[1] : '';

    // 2. Template Tipini Belirle
    templateType = resolveXmlTagToTemplate(mainTagName);

    // 3. Verileri Ayrıştır (Kategoriye Özel)
    if (templateType === '5w1h-grid') {
        const get5W1H = (key: string) => {
            let val = _extractTagContent(xml, key);
            if (val) return val;

            val = _extractAttr(xml, key, 'question') || _extractAttr(xml, 'item', key);
            if (val) return val;

            const trKeys: Record<string, string> = { 'who': 'kim', 'what': 'ne', 'where': 'nerede', 'when': 'ne zaman', 'why': 'neden', 'how': 'nasıl' };
            const trKey = trKeys[key];
            val = _extractTagContent(xml, trKey);
            if (val) return val;

            const itemRegex = new RegExp(`<item[^>]*key=['"]?${trKey}['"]?[^>]*value=['"]([^'"]+)['"]`, 'i');
            const itemMatch = xml.match(itemRegex);
            if (itemMatch) return itemMatch[1].trim();

            return '';
        };

        data.q5w1h = {
            who: get5W1H('who'),
            what: get5W1H('what'),
            where: get5W1H('where'),
            when: get5W1H('when'),
            why: get5W1H('why'),
            how: get5W1H('how')
        };
    } else if (templateType === 'short-answer-grid') {
        data.config = {
            questionCount: parseInt(_extractAttr(xml, mainTagName, 'count') || '15', 10),
            lineCount: parseInt(_extractAttr(xml, mainTagName, 'lines') || '2', 10),
            colorMode: _extractAttr(xml, mainTagName, 'mode') || 'Karma Renkli',
            showStudentInfo: _extractAttr(xml, mainTagName, 'student-info') === 'true',
            gridDensity: _extractAttr(xml, mainTagName, 'density') || 'Kompakt',
            pedagogicalFocus: _extractAttr(xml, mainTagName, 'focus') || 'Genel Kavrama'
        };
        const blocks = _extractRepeatedBlocks(xml, 'item') || [];
        data.shortAnswers = blocks.map(block => ({
            question: _extractAttr(block, 'item', 'question') || _extractTagContent(block, 'question') || block.replace(/<[^>]+>/g, '').trim(),
            defaultAnswer: _extractAttr(block, 'item', 'answer') || _extractTagContent(block, 'answer')
        }));
    } else if (templateType === 'venn-diagram') {
        data.venn = {
            setA: { label: _extractAttr(xml, 'set-a', 'label') || 'Grup A', items: _extractItems(xml, 'set-a') },
            setB: { label: _extractAttr(xml, 'set-b', 'label') || 'Grup B', items: _extractItems(xml, 'set-b') },
            intersection: _extractItems(xml, 'intersection')
        };
    } else if (templateType === 'compare-binary-horizontal') {
        const leftBlock = _extractRepeatedBlocks(xml, 'left')[0] || '';
        const rightBlock = _extractRepeatedBlocks(xml, 'right')[0] || '';
        data.left = { title: _extractAttr(leftBlock, 'left', 'title') || 'Sol', items: _extractItems(leftBlock, 'items') };
        data.right = { title: _extractAttr(rightBlock, 'right', 'title') || 'Sağ', items: _extractItems(rightBlock, 'items') };
    } else if (templateType === 'list-row-simple-horizontal-arrow') {
        data.lists = _extractRepeatedBlocks(xml, 'item').map(block => ({
            label: _extractTagContent(block, 'label') || block.replace(/<[^>]+>/g, '').trim(),
            desc: _extractTagContent(block, 'desc')
        }));
    } else if (templateType === 'sequence-steps') {
        data.steps = _extractRepeatedBlocks(xml, 'step').map(block => ({
            label: _extractTagContent(block, 'label') || 'Adım',
            desc: _extractTagContent(block, 'desc')
        }));
    } else if (templateType === 'fishbone-diagram') {
        const problem = _extractTagContent(xml, 'problem');
        const categories = _extractRepeatedBlocks(xml, 'category').map(block => ({
            label: _extractAttr(block, 'category', 'label') || 'Kategori',
            causes: _extractRepeatedBlocks(block, 'cause').map(c => c.replace(/<[^>]+>/g, '').trim())
        }));
        data.fishbone = { problem, categories };
    } else if (templateType === 'hierarchy-structure') {
        const rootLabel = _extractAttr(xml, 'root', 'label') || 'Kök';
        data.root = {
            label: rootLabel,
            children: _extractRepeatedBlocks(xml, 'node').map(nodeBlock => ({
                label: _extractAttr(nodeBlock, 'node', 'label') || 'Düğüm',
                children: _extractRepeatedBlocks(nodeBlock, 'branch').map(b => ({
                    label: _extractAttr(b, 'branch', 'label') || 'Dal'
                }))
            }))
        };
    } else if (templateType === 'math-steps') {
        data.mathSteps = _extractRepeatedBlocks(xml, 'step').map((block, idx) => ({
            step: `ADIM ${idx + 1}`,
            expression: _extractTagContent(block, 'expression'),
            explanation: _extractTagContent(block, 'explanation')
        }));
    } else if (templateType === 'cycle-process') {
        data.cycle = _extractRepeatedBlocks(xml, 'phase').map(block => ({
            label: _extractAttr(block, 'phase', 'label') || 'Aşama',
            desc: _extractTagContent(block, 'desc')
        }));
    } else if (templateType === 'matrix-grid') {
        const headerText = _extractTagContent(xml, 'header');
        data.matrix = {
            headers: headerText ? headerText.split(',').map(s => s.trim()) : [],
            rows: _extractRepeatedBlocks(xml, 'row').map(rowBlock => ({
                label: _extractAttr(rowBlock, 'row', 'label') || 'Satır',
                values: _extractRepeatedBlocks(rowBlock, 'cell').map(c => c.replace(/<[^>]+>/g, '').trim())
            }))
        };
    } else if (templateType === 'sequence-timeline') {
        data.events = _extractRepeatedBlocks(xml, 'event').map(block => ({
            date: _extractAttr(block, 'event', 'date') || 'Tarih',
            title: _extractTagContent(block, 'title'),
            desc: _extractTagContent(block, 'desc')
        }));
    }

    return { templateType, title, data };
}

// ── XML Yardımcı Fonksiyonları ──────────────────────────────────────────────

function resolveXmlTagToTemplate(tag: string): TemplateType {
    const t = (tag || '').toLowerCase();
    if (t === 'five-w-one-h' || t === 'activity-5w1h' || t.includes('5w1h')) return '5w1h-grid';
    if (t === 'venn-diagram' || t === 'activity-venn' || t.includes('venn')) return 'venn-diagram';
    if (t === 'sequence-steps' || t === 'activity-sequence') return 'sequence-steps';
    if (t === 'fishbone-diagram' || t === 'activity-fishbone' || t.includes('fishbone')) return 'fishbone-diagram';
    if (t === 'concept-map' || t === 'hierarchy-structure') return 'hierarchy-structure';
    if (t === 'math-steps-visual') return 'math-steps';
    if (t === 'cycle-process') return 'cycle-process';
    if (t === 'matrix-grid') return 'matrix-grid';
    if (t === 'short-answer-grid') return 'short-answer-grid';
    if (t === 'timeline-chart') return 'sequence-timeline';
    if (t === 'compare-binary') return 'compare-binary-horizontal';
    if (t === 'list-row') return 'list-row-simple-horizontal-arrow';
    return 'unknown';
}

function _extractTagContent(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    if (match) return match[1].trim().replace(/<[^>]+>/g, '');

    // Ayrıca <* id="tag">...<content>...</content></*> şeklinde HTML benzeri blokları kontrol et
    const sectionRegex = new RegExp(`<\\w+[^>]*(?:id|class|key)=['"]${tag}['"][^>]*>([\\s\\S]*?)<\\/\\w+>`, 'i');
    const sectionMatch = xml.match(sectionRegex);
    if (sectionMatch) {
        const inner = sectionMatch[1];
        const contentMatch = inner.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
        if (contentMatch) return contentMatch[1].trim().replace(/<[^>]+>/g, '');
        const descMatch = inner.match(/<desc[^>]*>([\s\S]*?)<\/desc>/i);
        if (descMatch) return descMatch[1].trim().replace(/<[^>]+>/g, '');
        const instructionMatch = inner.match(/<instruction[^>]*>([\s\S]*?)<\/instruction>/i);
        if (instructionMatch) return instructionMatch[1].trim().replace(/<[^>]+>/g, '');
        const promptMatch = inner.match(/<prompt[^>]*>([\s\S]*?)<\/prompt>/i);
        if (promptMatch) return promptMatch[1].trim().replace(/<[^>]+>/g, '');
        
        // Sadece düz metni al, başlık etiketlerini uçur
        let rawText = inner;
        rawText = rawText.replace(/<title>[\s\S]*?<\/title>/gi, '');
        rawText = rawText.replace(/<label>[\s\S]*?<\/label>/gi, '');
        return rawText.trim().replace(/<[^>]+>/g, '');
    }

    return '';
}

function _extractAttr(xml: string, tag: string, attr: string): string {
    const exactRegex = new RegExp(`<${tag}[^>]*${attr}=['"]([^'"]+)['"]`, 'i');
    const match = xml.match(exactRegex);
    if (match) return match[1];

    const anyRegex = new RegExp(`<\\w+[^>]*(?:id|class|key)=['"]${tag}['"][^>]*${attr}=['"]([^'"]+)['"]`, 'i');
    const matchAny = xml.match(anyRegex);
    if (matchAny) return matchAny[1];

    // Yapay zeka bazen attribute yerine XML etiketi kullanır: Örn: <title>...</title>
    if (attr === 'title' || attr === 'label' || attr === 'date') {
        const fallbackRegex = new RegExp(`<${attr}[^>]*>([\\s\\S]*?)<\\/${attr}>`, 'i');
        const fMatch = xml.match(fallbackRegex);
        if (fMatch) return fMatch[1].trim().replace(/<[^>]+>/g, '');
    }

    return '';
}

function _extractRepeatedBlocks(xml: string, tag: string): string[] {
    const exactRegex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    const exactMatches = xml.match(exactRegex);
    if (exactMatches && exactMatches.length > 0) return exactMatches;

    const sectionRegex = new RegExp(`<(\\w+)[^>]*(?:id|class|key)=['"]${tag}['"][^>]*>[\\s\\S]*?<\\/\\1>`, 'gi');
    const sectionMatches = xml.match(sectionRegex);
    return sectionMatches || [];
}

function _extractItems(xml: string, parentTag: string): string[] {
    let inner = '';
    const parentRegex = new RegExp(`<${parentTag}[^>]*>([\\s\\S]*?)<\\/${parentTag}>`, 'i');
    const parentMatch = xml.match(parentRegex);
    
    if (parentMatch) {
        inner = parentMatch[1];
    } else {
        const sectionRegex = new RegExp(`<\\w+[^>]*(?:id|class|key)=['"]${parentTag}['"][^>]*>([\\s\\S]*?)<\\/\\w+>`, 'i');
        const sectionMatch = xml.match(sectionRegex);
        if (sectionMatch) inner = sectionMatch[1];
    }

    if (!inner) return [];

    const items: string[] = [];
    
    // <item>...</item> veya <item value="..." />
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>|<item[^>]*value=['"]([^'"]+)['"][^>]*>/gi;
    let match;
    let found = false;
    while ((match = itemRegex.exec(inner)) !== null) {
        const valMatch = match[0].match(/value=['"]([^'"]+)['"]/i);
        if (valMatch) items.push(valMatch[1].trim());
        else if (match[1]) items.push(match[1].trim().replace(/<[^>]+>/g, ''));
        found = true;
    }
    if (found) return items;

    // <content>...</content>
    const contentRegex = /<content[^>]*>([\s\S]*?)<\/content>/gi;
    while ((match = contentRegex.exec(inner)) !== null) {
        items.push(match[1].trim().replace(/<[^>]+>/g, ''));
        found = true;
    }
    if (found) return items;

    // <li>...</li>
    const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
    while ((match = liRegex.exec(inner)) !== null) {
        items.push(match[1].trim().replace(/<[^>]+>/g, ''));
        found = true;
    }
    if (found) return items;

    return inner.split('\n').map(s => s.replace(/<[^>]+>/g, '').trim()).filter(Boolean);
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

const KARMA_COLORS = [
    '#ef4444', // Red
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Orange
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
];

/** Kısa Cevaplı Sorular (Premium Grid) Renderer */
const ShortAnswerGridRenderer: React.FC<{ data: ParsedData; title: string; primaryColor: string }> = ({ data, title, primaryColor }) => {
    const questions = data?.shortAnswers || [];
    const config = data?.config || { 
        questionCount: 15, 
        lineCount: 2, 
        colorMode: 'Karma Renkli',
        showStudentInfo: true,
        gridDensity: 'Kompakt'
    };
    
    // A4 kompakt görünüm için sütun sayısını belirle
    let gridColumns = 'repeat(3, 1fr)';
    if (config.questionCount <= 4) gridColumns = 'repeat(1, 1fr)';
    else if (config.questionCount <= 8) gridColumns = 'repeat(2, 1fr)';
    else gridColumns = 'repeat(3, 1fr)';

    const gap = config.gridDensity === 'Kompakt' ? '8px' : config.gridDensity === 'Normal' ? '16px' : '24px';
    const padding = config.gridDensity === 'Kompakt' ? '12px' : '20px';

    return (
        <div style={{ ...fontStyle, padding: '12px', background: '#fff', borderRadius: '8px' }}>
            {/* Öğrenci Bilgi Alanı */}
            {config.showStudentInfo && (
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    marginBottom: '12px', 
                    padding: '8px', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: PALETTE.text
                }}>
                    <div style={{ flex: 1 }}><b>Adı Soyadı:</b> ............................................................</div>
                    <div style={{ width: '150px' }}><b>Tarih:</b> ...... / ...... / 202...</div>
                </div>
            )}

            {title && (
                <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                    <div style={{ 
                        display: 'inline-block', 
                        border: `2px solid ${primaryColor}`, 
                        borderRadius: '12px', 
                        padding: '4px 20px', 
                        background: '#fff',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: primaryColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            {title}
                        </h2>
                    </div>
                    <div style={{ 
                        marginTop: '4px', 
                        fontSize: '10px', 
                        color: PALETTE.textMuted, 
                        background: '#f8fafc',
                        padding: '2px 8px', 
                        borderRadius: '6px',
                        display: 'inline-block',
                        border: '1px solid #e2e8f0'
                    }}>
                        🎯 {config.pedagogicalFocus || 'Genel Kavrama'} • 📝 Cevaplayalım • 🟢 Değerlendirelim
                    </div>
                </div>
            )}

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: gridColumns, 
                gap: gap,
                width: '100%' 
            }}>
                {questions.map((q, idx) => {
                    let borderColor = primaryColor;
                    if (config.colorMode === 'Karma Renkli') {
                        borderColor = KARMA_COLORS[idx % KARMA_COLORS.length];
                    } else if (config.colorMode === 'Siyah-Beyaz (Print Dostu)') {
                        borderColor = '#334155';
                    }

                    return (
                        <div key={idx} style={{ 
                            position: 'relative',
                            border: `1.5px solid ${borderColor}`,
                            borderRadius: '10px',
                            padding: padding,
                            minHeight: config.gridDensity === 'Kompakt' ? '80px' : '110px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            background: '#fff',
                            pageBreakInside: 'avoid'
                        }}>
                            {/* Değerlendirme Halkası */}
                            <div style={{ 
                                position: 'absolute',
                                top: '-8px',
                                right: '10px',
                                width: '16px',
                                height: '16px',
                                borderRadius: '50%',
                                border: `1.5px solid ${borderColor}`,
                                background: '#fff',
                                zIndex: 2,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '8px',
                                color: borderColor,
                                fontWeight: 700
                            }}>
                                {idx + 1}
                            </div>

                            {/* Soru Metni */}
                            <div style={{ 
                                textAlign: 'left', 
                                fontSize: '12px', 
                                fontWeight: 600, 
                                color: PALETTE.text,
                                marginBottom: '6px',
                                lineHeight: 1.2
                            }}>
                                {q.question}
                            </div>

                            {/* Cevap Satırları */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '6px' }}>
                                {Array.from({ length: config.lineCount }).map((_, lIdx) => (
                                    <div key={lIdx} style={{ 
                                        width: '100%', 
                                        height: '1px', 
                                        borderBottom: `1px dashed ${borderColor}33`,
                                        marginTop: '10px'
                                    }} />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
            
            {/* Alt Bilgi / Değerlendirme Anahtarı */}
            <div style={{ 
                marginTop: '12px', 
                padding: '6px', 
                borderTop: '1px solid #e2e8f0', 
                display: 'flex', 
                justifyContent: 'center', 
                gap: '20px',
                fontSize: '9px',
                color: PALETTE.textMuted
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', border: '1px solid #e2e8f0' }} /> Henüz Bakılmadı
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} /> Doğru
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} /> Tekrar Bakılmalı
                </div>
            </div>
        </div>
    );
};

/** 5W1H Grid Renderer */
const Q5W1HRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const q = data?.q5w1h || {};
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
                        <div style={{ color: box.color, fontWeight: 800, fontSize: '12px', marginBottom: '4px' }}>{box.label}</div>
                        <div style={{ color: PALETTE.text, fontSize: '14px', lineHeight: 1.4 }}>{box.value || '...'}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/** Math Steps Renderer */
const MathStepsRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const steps = data?.mathSteps || [];
    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px' }}>
            {title && <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>{title}</h2>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Array.isArray(steps) && steps.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', background: '#fff', borderRadius: '10px', overflow: 'hidden', border: `1px solid ${PALETTE.primary}20` }}>
                        <div style={{ background: PALETTE.primary, color: '#fff', padding: '12px', minWidth: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{s?.step || (idx + 1)}</div>
                        <div style={{ padding: '12px', flex: 1 }}>
                            <div style={{ fontSize: '18px', fontWeight: 700, color: PALETTE.primary, marginBottom: '4px' }}>{s?.expression}</div>
                            <div style={{ fontSize: '13px', color: PALETTE.textMuted }}>{s?.explanation}</div>
                        </div>
                    </div>
                ))}
                {steps.length === 0 && <p style={{ textAlign: 'center', color: PALETTE.textMuted }}>Grafik verisi ayrıştırılamadı.</p>}
            </div>
        </div>
    );
};

/** Venn Diagram Renderer */
const VennRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const venn = data?.venn;
    if (!venn) return <div style={{ padding: '20px', textAlign: 'center', color: PALETTE.textMuted }}>Venn şeması verisi eksik.</div>;

    const setA = venn.setA || { label: 'Grup A', items: [] };
    const setB = venn.setB || { label: 'Grup B', items: [] };
    const intersection = Array.isArray(venn.intersection) ? venn.intersection : [];

    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px', overflow: 'hidden' }}>
            {title && <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>{title}</h2>}
            <div style={{ position: 'relative', height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ position: 'absolute', left: '20%', width: '220px', height: '220px', borderRadius: '50%', background: '#3b82f644', border: '2px solid #3b82f6', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                    <div style={{ fontWeight: 800, color: '#1d4ed8' }}>{setA.label}</div>
                    <div style={{ fontSize: '11px', marginTop: '10px' }}>{Array.isArray(setA.items) ? setA.items.slice(0, 3).join(', ') : ''}</div>
                </div>
                <div style={{ position: 'absolute', right: '20%', width: '220px', height: '220px', borderRadius: '50%', background: '#ef444444', border: '2px solid #ef4444', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
                    <div style={{ fontWeight: 800, color: '#b91c1c' }}>{setB.label}</div>
                    <div style={{ fontSize: '11px', marginTop: '10px' }}>{Array.isArray(setB.items) ? setB.items.slice(0, 3).join(', ') : ''}</div>
                </div>
                <div style={{ zIndex: 10, background: '#fff9', padding: '10px', borderRadius: '8px', maxWidth: '120px', textAlign: 'center', border: '1px dashed #666' }}>
                    <div style={{ fontWeight: 800, fontSize: '10px' }}>KESİŞİM</div>
                    <div style={{ fontSize: '11px' }}>{intersection.join(', ')}</div>
                </div>
            </div>
        </div>
    );
};

/** Fishbone Diagram Renderer */
const FishboneRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const fb = data?.fishbone;
    if (!fb) return <div style={{ padding: '20px', textAlign: 'center', color: PALETTE.textMuted }}>Kılçık diyagramı verisi eksik.</div>;

    const categories = Array.isArray(fb.categories) ? fb.categories : [];

    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px' }}>
            {title && <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>{title}</h2>}
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {categories.map((cat, idx) => (
                        <div key={idx} style={{ borderBottom: `2px solid ${PALETTE.primary}44`, paddingBottom: '8px' }}>
                            <div style={{ fontWeight: 800, color: PALETTE.primary, fontSize: '12px' }}>{cat?.label || 'Neden'}</div>
                            <div style={{ fontSize: '11px' }}>{Array.isArray(cat?.causes) ? cat.causes.map(c => `• ${c}`).join(' ') : ''}</div>
                        </div>
                    ))}
                </div>
                <div style={{ width: '0', height: '100px', borderLeft: `4px solid ${PALETTE.secondary}`, margin: '0 20px', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '0', width: '20px', height: '4px', background: PALETTE.secondary }} />
                </div>
                <div style={{ background: PALETTE.secondary, color: '#fff', padding: '10px 20px', borderRadius: '8px', fontWeight: 800 }}>{fb.problem || 'Problem'}</div>
            </div>
        </div>
    );
};

/** Cycle Process Renderer */
const CycleRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const steps = Array.isArray(data?.cycle) ? data.cycle : [];
    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px', textAlign: 'center' }}>
            {title && <h2 style={{ marginBottom: '24px' }}>{title}</h2>}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {steps.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '120px', height: '120px', background: '#fff', border: `3px solid ${PALETTE.primary}`, borderRadius: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
                            <div style={{ fontWeight: 800, fontSize: '12px' }}>{s?.label || ''}</div>
                            <div style={{ fontSize: '10px', color: PALETTE.textMuted }}>{s?.desc || ''}</div>
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
    const m = data?.matrix;
    if (!m) return <div style={{ padding: '20px', textAlign: 'center', color: PALETTE.textMuted }}>Matris verisi eksik.</div>;

    const headers = Array.isArray(m.headers) ? m.headers : [];
    const rows = Array.isArray(m.rows) ? m.rows : [];

    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px' }}>
            {title && <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>{title}</h2>}
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
                    <thead>
                        <tr style={{ background: PALETTE.primary, color: '#fff' }}>
                            <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                            {headers.map((h, i) => <th key={i} style={{ padding: '12px', textAlign: 'left' }}>{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((r, i) => (
                            <tr key={i} style={{ borderBottom: `1px solid ${PALETTE.border}` }}>
                                <td style={{ padding: '12px', fontWeight: 800 }}>{r?.label || ''}</td>
                                {Array.isArray(r?.values) ? r.values.map((v, j) => (
                                    <td key={j} style={{ padding: '12px', fontSize: '14px' }}>{v}</td>
                                )) : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/** compare-binary-horizontal */
const CompareBinaryRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const left = data?.left ?? { title: 'Sol', items: [] };
    const right = data?.right ?? { title: 'Sağ', items: [] };
    const leftItems = Array.isArray(left.items) ? left.items : [];
    const rightItems = Array.isArray(right.items) ? right.items : [];

    const maxItems = Math.max(leftItems.length, rightItems.length);

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
                        {left.title || 'Sol'}
                    </div>
                    <div style={{ padding: '12px' }}>
                        {leftItems.map((item, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', padding: '10px', background: '#fff', borderRadius: '8px', border: `1px solid ${PALETTE.leftCol}30` }}>
                                <span style={{ background: PALETTE.leftCol, color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 }}>
                                    {idx + 1}
                                </span>
                                <span style={{ color: PALETTE.text, fontSize: '14px', lineHeight: 1.5 }}>{item}</span>
                            </div>
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
                        {right.title || 'Sağ'}
                    </div>
                    <div style={{ padding: '12px' }}>
                        {rightItems.map((item, idx) => (
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
    const rawItems = data?.lists ?? data?.steps ?? [];
    const items = Array.isArray(rawItems) ? rawItems : [];

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
                                <span style={{ color: PALETTE.primary, fontWeight: 700, fontSize: '14px', lineHeight: 1.3 }}>{item?.label || ''}</span>
                            </div>
                            {item?.desc && (
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
    const rawSteps = data?.steps ?? data?.lists ?? [];
    const steps = Array.isArray(rawSteps) ? rawSteps : [];

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
                            <p style={{ color: PALETTE.step, fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>{step?.label || ''}</p>
                            {step?.desc && <p style={{ color: PALETTE.textMuted, fontSize: '13px', lineHeight: 1.5, margin: 0 }}>{step.desc}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/** hierarchy-structure */
const HierarchyRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const root = data?.root;

    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px', minHeight: '100%' }}>
            {title && (
                <h2 style={{ textAlign: 'center', color: PALETTE.text, fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
                    {title}
                </h2>
            )}
            {root ? (
                <div style={{ textAlign: 'center' }}>
                    {/* Kök */}
                    <div style={{ display: 'inline-block', background: PALETTE.primary, color: '#fff', borderRadius: '12px', padding: '12px 24px', fontWeight: 700, fontSize: '16px', marginBottom: '24px' }}>
                        {root.label || 'Kök'}
                    </div>
                    {Array.isArray(root.children) && root.children.length > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                            {root.children.map((child, idx) => (
                                <div key={idx} style={{ background: PALETTE.card, border: `2px solid ${PALETTE.accent}`, borderRadius: '10px', padding: '12px 20px', minWidth: '120px', fontWeight: 600, color: PALETTE.primary, fontSize: '14px', position: 'relative' }}>
                                    <div style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', width: '2px', height: '20px', background: PALETTE.accent }} />
                                    {child?.label || ''}
                                    {Array.isArray(child?.children) && child.children.length > 0 && (
                                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            {child.children.map((grandchild, gIdx) => (
                                                <div key={gIdx} style={{ background: PALETTE.bg, border: `1px solid ${PALETTE.border}`, borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: PALETTE.textMuted, fontWeight: 400 }}>
                                                    {grandchild?.label || ''}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : <div style={{ padding: '20px', textAlign: 'center', color: PALETTE.textMuted }}>Hiyerarşi verisi eksik.</div>}
        </div>
    );
};

/** sequence-timeline */
const TimelineRenderer: React.FC<{ data: ParsedData; title: string }> = ({ data, title }) => {
    const rawEvents = data?.events ?? [];
    const events = Array.isArray(rawEvents) ? rawEvents : [];

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
                                {event?.date || ''}
                            </span>
                            <p style={{ color: PALETTE.text, fontWeight: 700, fontSize: '14px', margin: '0 0 4px' }}>{event?.title || ''}</p>
                            {event?.desc && <p style={{ color: PALETTE.textMuted, fontSize: '12px', lineHeight: 1.5, margin: 0 }}>{event.desc}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

/** Bilinmeyen format: Herhangi bir XML yapısını jenerik ve şık kartlara dönüştürür (Evrensel Fallback Motoru) */
const UnknownRenderer: React.FC<{ syntax: string }> = ({ syntax }) => {
    // Tüm olası başlıkları, içerikleri, etiketleri ve elementleri ayıklayan süper jenerik parser
    const sections: Array<{ title: string; content: string }> = [];
    
    // 1. <section> ... </section> veya <panel> ... </panel> veya <item> ... </item>
    const blockRegex = /<(section|panel|item|div|article|step|phase|row)[^>]*>([\s\S]*?)<\/\1>/gi;
    let match;
    while ((match = blockRegex.exec(syntax)) !== null) {
        const inner = match[2];
        const titleMatch = inner.match(/<(title|label|header)[^>]*>([\s\S]*?)<\/\1>/i) || match[0].match(/(title|label|name)=['"]([^'"]+)['"]/i) || match[0].match(/id=['"]([^'"]+)['"]/i);
        const title = titleMatch ? titleMatch[2] || titleMatch[1] : 'Bölüm';
        
        let content = '';
        // instruction, prompt, desc, content vb. içerik etiketlerini dene
        const contentRegex = /<(content|desc|description|instruction|prompt|p|text|value)[^>]*>([\s\S]*?)<\/\1>/gi;
        let contentMatch;
        let foundContent = false;
        
        while ((contentMatch = contentRegex.exec(inner)) !== null) {
             content += contentMatch[2].trim().replace(/<[^>]+>/g, '') + ' ';
             foundContent = true;
        }

        if (!foundContent) {
            content = inner.replace(/<(title|label|header)[^>]*>[\s\S]*?<\/\1>/gi, '').replace(/<[^>]+>/g, '').trim();
        }
        
        if (content.trim()) sections.push({ title: title.trim(), content: content.trim() });
    }

    // 2. Eğer hiç blok bulamadıysa, sadece bağımsız <item> veya attribute'ları ara
    if (sections.length === 0) {
        const itemRegex = /<item[^>]*value=['"]([^'"]+)['"]/gi;
        while ((match = itemRegex.exec(syntax)) !== null) {
            const keyMatch = match[0].match(/key=['"]([^'"]+)['"]/i) || match[0].match(/id=['"]([^'"]+)['"]/i);
            sections.push({ title: keyMatch ? keyMatch[1] : 'Detay', content: match[1] });
        }
    }

    // 3. Hala boşsa, tüm XML içindeki başlık ve paragrafları kabaca eşleştir
    if (sections.length === 0) {
        const titleMatch = syntax.match(/<(title|header)[^>]*>([\s\S]*?)<\/\1>/i) || syntax.match(/title=['"]([^'"]+)['"]/i);
        const mainTitle = titleMatch ? (titleMatch[2] || titleMatch[1]).trim() : 'Açıklama';
        
        const rawText = syntax.replace(/<(title|header)[^>]*>[\s\S]*?<\/\1>/gi, '')
                              .replace(/<[^>]+>/g, ' ')
                              .replace(/\s+/g, ' ')
                              .trim();
                              
        if (rawText) {
            sections.push({ title: mainTitle, content: rawText });
        }
    }

    return (
        <div style={{ ...fontStyle, padding: '24px', background: PALETTE.bg, borderRadius: '16px' }}>
            <h2 style={{ textAlign: 'center', color: PALETTE.text, fontSize: '20px', fontWeight: 700, marginBottom: '24px' }}>
                Etkinlik Panosu
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
                {sections.map((sec, idx) => (
                    <div key={idx} style={{ background: PALETTE.card, border: `2px solid ${PALETTE.primary}`, borderRadius: '12px', padding: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', borderBottom: `1px solid ${PALETTE.primary}40`, paddingBottom: '8px' }}>
                             <span style={{ background: PALETTE.primary, color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0 }}>
                                 {idx + 1}
                             </span>
                             <span style={{ color: PALETTE.primary, fontWeight: 800, fontSize: '14px', textTransform: 'uppercase' }}>
                                 {sec.title}
                             </span>
                        </div>
                        <div style={{ color: PALETTE.text, fontSize: '14px', lineHeight: 1.6, flex: 1 }}>
                            {sec.content || 'İçerik bulunamadı.'}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Eğer gerçekten hiçbir şey parse edilemediyse ham syntax'ı gizli bir şekilde göster (sadece geliştirici için) */}
            {sections.length === 0 && (
                <div style={{ marginTop: '20px', fontSize: '10px', color: '#ccc', textAlign: 'center' }}>
                    (İçerik ayrıştırılamadı. Ham veri işleniyor.)
                </div>
            )}
        </div>
    );
};

// ── Ana Bileşen ──────────────────────────────────────────────────────────────

export const NativeInfographicRenderer: React.FC<NativeInfographicRendererProps> = ({
    syntax,
    height = '400px',
    className = '',
    onError,
    forPrint = false,
}) => {
    // Selin Arslan — Palette Reflection: Ekran modunda tema rengini oku
    const themePalette = useMemo(() => getInfographicPalette(forPrint), [forPrint]);
    // Mevcut PALETTE'yi tema renkleriyle zenginleştir (primary/secondary/accent)
    const activePalette = useMemo(() => ({
        ...PALETTE,
        primary: themePalette.primary,
        secondary: themePalette.secondary,
    }), [themePalette]);

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
                <p style={{ color: activePalette.textMuted, fontSize: '14px' }}>Syntax parse edilemedi.</p>
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
            case 'short-answer-grid':
                return <ShortAnswerGridRenderer data={parsed.data} title={parsed.title} primaryColor={activePalette.primary} />;
            default:
                return <UnknownRenderer syntax={syntax} />;
        }
    };

    return (
        <div
            className={className}
            style={Object.assign({
                height,
                overflowY: 'auto',
                overflowX: 'hidden',
                fontFamily: "'Lexend', 'Inter', sans-serif",
            } as React.CSSProperties, {
                // Selin Arslan — Palette Reflection: tema accent rengi CSS değişkeni olarak enjekte edilir
                '--infographic-primary': activePalette.primary,
                '--infographic-secondary': activePalette.secondary,
            })}
        >
            {renderContent()}
        </div>
    );
};

export default NativeInfographicRenderer;
