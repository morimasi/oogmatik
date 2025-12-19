
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { MathStudioConfig, MathStudioComponent, MathComponentType, ActivityType } from '../../types';
import { generateMathOperationsFast } from '../../services/offlineGenerators/mathStudio';
import { generateMathProblemsAI } from '../../services/generators/mathStudio';
import { useAuth } from '../../context/AuthContext';
import { printService } from '../../utils/printService';
import { worksheetService } from '../../services/worksheetService';
import { EditableText } from '../Editable';
import { ShareModal } from '../ShareModal';

const A4_WIDTH = 794;
const A4_HEIGHT = 1123;

export const MathStudio: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [mode, setMode] = useState<'fast' | 'ai'>('fast');
    
    const [config, setConfig] = useState<MathStudioConfig>({
        gradeLevel: '3. Sınıf',
        studentName: '',
        operations: ['add', 'sub'],
        digitCount1: 2,
        digitCount2: 2,
        constraints: {
            allowCarry: true,
            allowBorrow: true,
            allowRemainder: false,
            findUnknown: false
        },
        problemConfig: {
            enabled: false,
            count: 3,
            steps: 1,
            topic: 'Market Alışverişi'
        },
        layout: 'grid'
    });

    const [components, setComponents] = useState<MathStudioComponent[]>([]);

    // --- GENERATION LOGIC ---

    const handleGenerate = async () => {
        setIsLoading(true);
        try {
            let newComponents: MathStudioComponent[] = [];
            
            // 1. Header
            newComponents.push(createComponent('header', 'Başlık', { 
                title: 'MATEMATİK ÇALIŞMA SAYFASI',
                subtitle: `${config.gradeLevel} - ${config.studentName}`
            }, { y: 20, h: 100 }));

            // 2. Operations (Drill)
            const ops = generateMathOperationsFast(config, config.problemConfig.enabled ? 12 : 24);
            newComponents.push(createComponent('operation_grid', 'İşlem Seti', { ops }, { y: 140, h: 400 }));

            // 3. AI Problems
            if (config.problemConfig.enabled) {
                const aiData = await generateMathProblemsAI(config);
                newComponents.push(createComponent('problem_set', 'Sözel Problemler', { problems: aiData.problems }, { y: 560, h: 500 }));
            }

            // 4. Footer
            newComponents.push(createComponent('footer', 'Alt Bilgi', {}, { y: 1060, h: 40 }));

            setComponents(newComponents);
            setIsSaved(false);
        } catch (e) {
            alert("Üretim hatası!");
        } finally {
            setIsLoading(false);
        }
    };

    const createComponent = (type: MathComponentType, label: string, data: any, styleOverrides: any = {}): MathStudioComponent => ({
        instanceId: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        type,
        label,
        isVisible: true,
        data,
        style: {
            x: 20, y: 0, w: A4_WIDTH - 40, h: 100,
            rotation: 0, zIndex: 1, fontSize: 16, fontFamily: 'OpenDyslexic',
            color: '#000000', backgroundColor: 'transparent', borderColor: '#e5e7eb',
            borderWidth: 0, borderRadius: 0, padding: 10, textAlign: 'left',
            ...styleOverrides
        }
    });

    // --- CANVAS INTERACTIONS ---

    const handleMouseDown = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedId(id);
        // Dragging logic would go here
    };

    const updateComponent = (id: string, updates: any) => {
        setComponents(prev => prev.map(c => c.instanceId === id ? { ...c, ...updates } : c));
        setIsSaved(false);
    };

    // --- RENDERERS ---

    const renderComponentContent = (comp: MathStudioComponent) => {
        const { type, data, style } = comp;

        if (type === 'header') {
            return (
                <div className="flex flex-col border-b-2 border-black pb-2">
                    <h1 className="text-2xl font-black uppercase text-center">{data.title}</h1>
                    <div className="flex justify-between mt-2 text-sm">
                        <span>Ad Soyad: ........................</span>
                        <span>Tarih: {new Date().toLocaleDateString('tr-TR')}</span>
                    </div>
                </div>
            );
        }

        if (type === 'operation_grid') {
            return (
                <div className="grid grid-cols-4 gap-y-12 gap-x-4">
                    {data.ops.map((op: any, i: number) => (
                        <div key={i} className="flex flex-col items-end text-2xl font-mono relative pr-4 border-b-2 border-black pb-1">
                            <span className="text-xs absolute top-0 left-0 text-zinc-300">#{i+1}</span>
                            <div className={op.unknownPos === 'n1' ? 'border-2 border-dashed border-zinc-300 w-12 h-8 text-transparent' : ''}>{op.n1}</div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">{op.op}</span>
                                <div className={op.unknownPos === 'n2' ? 'border-2 border-dashed border-zinc-300 w-12 h-8 text-transparent' : ''}>{op.n2}</div>
                            </div>
                            <div className="absolute top-full right-0 text-zinc-200 font-bold text-xs mt-1">
                                {op.unknownPos === 'ans' ? '........' : op.ans}
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (type === 'problem_set') {
            return (
                <div className="space-y-8">
                    <h3 className="font-black border-l-4 border-indigo-600 pl-2 uppercase text-sm">Problem Çözme Atölyesi</h3>
                    {data.problems.map((p: any, i: number) => (
                        <div key={i} className="space-y-4">
                            <p className="text-base font-medium leading-relaxed">{i+1}. {p.text}</p>
                            <div className="h-24 w-full border-2 border-dashed border-zinc-200 rounded-xl relative flex items-center justify-center">
                                <span className="text-[10px] text-zinc-300 uppercase font-bold absolute top-2 left-2">Çözüm Alanı</span>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return <div className="p-4 border border-dashed text-zinc-400 text-center">{comp.label}</div>;
    };

    const handleSave = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await worksheetService.saveWorksheet(
                user.id,
                config.studentName || 'Matematik Çalışması',
                ActivityType.MATH_STUDIO,
                [{ config, components }],
                'fa-solid fa-calculator',
                { id: 'math', title: 'Matematik' }
            );
            setIsSaved(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#1a1a1d] text-zinc-100 overflow-hidden font-sans">
            {/* Top Bar */}
            <div className="h-14 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center px-4 shrink-0 z-50 shadow-lg">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="w-8 h-8 rounded hover:bg-zinc-800 flex items-center justify-center text-zinc-400"><i className="fa-solid fa-arrow-left"></i></button>
                    <span className="font-black text-sm uppercase tracking-widest text-blue-500">MATH Studio <span className="bg-blue-500/20 text-blue-500 px-1 rounded text-[9px] border border-blue-500/50">PRO</span></span>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => printService.generatePdf('#math-canvas-root', 'Matematik', { action: 'download' })} className="p-2 hover:bg-zinc-800 rounded text-zinc-400" title="PDF İndir"><i className="fa-solid fa-file-pdf"></i></button>
                    <button onClick={() => setIsShareModalOpen(true)} className="p-2 hover:bg-zinc-800 rounded text-zinc-400" title="Paylaş"><i className="fa-solid fa-share-nodes"></i></button>
                    <button onClick={handleSave} disabled={isLoading || isSaved} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${isSaved ? 'bg-green-600' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20'}`}>
                        {isLoading ? <i className="fa-solid fa-spinner fa-spin"></i> : isSaved ? 'Arşivlendi' : 'Arşive Kaydet'}
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar: Settings */}
                <div className="w-80 bg-zinc-900 border-r border-zinc-800 flex flex-col shrink-0 overflow-y-auto custom-scrollbar">
                    <div className="p-6 space-y-8">
                        <section>
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4 block">İşlem Filtreleri</label>
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    {id:'add', label:'Toplama', icon:'+'},
                                    {id:'sub', label:'Çıkarma', icon:'-'},
                                    {id:'mult', label:'Çarpma', icon:'x'},
                                    {id:'div', label:'Bölme', icon:'÷'}
                                ].map(op => (
                                    <button 
                                        key={op.id}
                                        onClick={() => setConfig(prev => ({
                                            ...prev, 
                                            operations: prev.operations.includes(op.id as any) 
                                                ? prev.operations.filter(x => x !== op.id) 
                                                : [...prev.operations, op.id as any]
                                        }))}
                                        className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${config.operations.includes(op.id as any) ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-zinc-800 border-zinc-700 text-zinc-500'}`}
                                    >
                                        <span className="text-xl font-black">{op.icon}</span>
                                        <span className="text-[10px] font-bold uppercase">{op.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-4">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block">Zorluk & Basamak</label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <span className="text-[10px] text-zinc-600 block mb-1">1. Sayı</span>
                                    <select value={config.digitCount1} onChange={e => setConfig({...config, digitCount1: Number(e.target.value)})} className="w-full bg-black p-2 rounded-lg text-xs border border-zinc-800">
                                        <option value={1}>1 Basamak</option><option value={2}>2 Basamak</option><option value={3}>3 Basamak</option>
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] text-zinc-600 block mb-1">2. Sayı</span>
                                    <select value={config.digitCount2} onChange={e => setConfig({...config, digitCount2: Number(e.target.value)})} className="w-full bg-black p-2 rounded-lg text-xs border border-zinc-800">
                                        <option value={1}>1 Basamak</option><option value={2}>2 Basamak</option><option value={3}>3 Basamak</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="flex items-center justify-between text-xs cursor-pointer group">
                                    <span className="text-zinc-400 group-hover:text-zinc-200">Eldeli / Onluk Bozmalı</span>
                                    <input type="checkbox" checked={config.constraints.allowCarry} onChange={e => setConfig({...config, constraints: {...config.constraints, allowCarry: e.target.checked, allowBorrow: e.target.checked}})} className="accent-blue-500" />
                                </label>
                                <label className="flex items-center justify-between text-xs cursor-pointer group">
                                    <span className="text-zinc-400 group-hover:text-zinc-200">Bilinmeyen Sayı (? + 5 = 10)</span>
                                    <input type="checkbox" checked={config.constraints.findUnknown} onChange={e => setConfig({...config, constraints: {...config.constraints, findUnknown: e.target.checked}})} className="accent-blue-500" />
                                </label>
                            </div>
                        </section>

                        <section className="pt-6 border-t border-zinc-800 space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sözel Problemler</label>
                                <input type="checkbox" checked={config.problemConfig.enabled} onChange={e => setConfig({...config, problemConfig: {...config.problemConfig, enabled: e.target.checked}})} className="accent-indigo-500" />
                            </div>
                            
                            {config.problemConfig.enabled && (
                                <div className="space-y-3 animate-in slide-in-from-top-2">
                                    <input type="text" placeholder="Problem Teması" value={config.problemConfig.topic} onChange={e => setConfig({...config, problemConfig: {...config.problemConfig, topic: e.target.value}})} className="w-full bg-black border border-zinc-800 p-2 rounded text-xs" />
                                    <select value={config.problemConfig.steps} onChange={e => setConfig({...config, problemConfig: {...config.problemConfig, steps: Number(e.target.value) as any}})} className="w-full bg-black p-2 rounded text-xs border border-zinc-800">
                                        <option value={1}>1 İşlemli</option><option value={2}>2 İşlemli</option><option value={3}>3 İşlemli</option>
                                    </select>
                                </div>
                            )}
                        </section>

                        <button 
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3"
                        >
                            {isLoading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
                            TASARIMI OLUŞTUR
                        </button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 bg-zinc-950 overflow-auto p-12 flex justify-center custom-scrollbar">
                    <div 
                        id="math-canvas-root"
                        className="bg-white text-black shadow-2xl relative transition-all duration-300"
                        style={{ width: `${A4_WIDTH}px`, minHeight: `${A4_HEIGHT}px`, height: 'auto', paddingBottom: '40px' }}
                    >
                        {components.length === 0 ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none">
                                <i className="fa-solid fa-calculator text-[200px]"></i>
                                <p className="text-3xl font-black uppercase mt-8 tracking-widest">Matematik Stüdyosu</p>
                            </div>
                        ) : (
                            components.filter(c => c.isVisible).map(comp => (
                                <div 
                                    key={comp.instanceId}
                                    onMouseDown={(e) => handleMouseDown(e, comp.instanceId)}
                                    className={`relative p-4 mb-4 transition-all ${selectedId === comp.instanceId ? 'ring-2 ring-blue-500 bg-blue-50/10' : ''}`}
                                    style={{ 
                                        minHeight: comp.style.h,
                                        zIndex: comp.style.zIndex,
                                        marginTop: comp.instanceId.includes('header') ? '0' : '20px'
                                    }}
                                >
                                    {renderComponentContent(comp)}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} onShare={() => {}} />
        </div>
    );
};
