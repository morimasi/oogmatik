
import React from 'react';
import { AlgorithmData, AlgorithmStep, AlgorithmLegendItem } from '../../../types';
import { PedagogicalHeader, FlowArrow, TeacherNoteCard } from '../common';
import { EditableElement, EditableText } from '../../Editable';

// ─── Tema Renk Haritası ─────────────────────────────────────────────────────

const THEME_COLORS: Record<
    string,
    { bg: string; accent: string; badge: string; checkpoint: string }
> = {
    varsayılan: {
        bg: 'bg-zinc-900',
        accent: 'text-indigo-400',
        badge: 'bg-indigo-600',
        checkpoint: 'bg-indigo-500',
    },
    okyanus: {
        bg: 'bg-sky-950',
        accent: 'text-sky-300',
        badge: 'bg-sky-600',
        checkpoint: 'bg-sky-500',
    },
    orman: {
        bg: 'bg-emerald-950',
        accent: 'text-emerald-300',
        badge: 'bg-emerald-600',
        checkpoint: 'bg-emerald-500',
    },
    şeker: {
        bg: 'bg-pink-950',
        accent: 'text-pink-300',
        badge: 'bg-pink-600',
        checkpoint: 'bg-pink-500',
    },
};

// ─── Step Tip Renk & Stil ───────────────────────────────────────────────────

function getStepStyle(type: AlgorithmStep['type']) {
    switch (type) {
        case 'start':
            return {
                shape: 'rounded-full px-10 print:px-3',
                color: 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-emerald-100',
                icon: 'fa-play',
                label: 'BAŞLANGIÇ',
                labelColor: 'text-emerald-600',
                ring: 'ring-4 ring-emerald-100/60',
            };
        case 'end':
            return {
                shape: 'rounded-full px-10 print:px-3',
                color: 'border-rose-500 bg-rose-50 text-rose-900 shadow-rose-100',
                icon: 'fa-stop',
                label: 'BİTİŞ',
                labelColor: 'text-rose-600',
                ring: 'ring-4 ring-rose-100/60',
            };
        case 'decision':
            return {
                shape: 'rounded-[3rem]',
                color: 'border-amber-500 bg-amber-50 text-amber-900 shadow-amber-100',
                icon: 'fa-code-branch',
                label: 'KARAR',
                labelColor: 'text-amber-600',
                ring: '',
            };
        case 'input':
            return {
                shape: 'rounded-xl skew-x-[-8deg]',
                color: 'border-sky-500 bg-sky-50 text-sky-900',
                icon: 'fa-right-to-bracket',
                label: 'GİRDİ',
                labelColor: 'text-sky-600',
                ring: '',
            };
        case 'output':
            return {
                shape: 'rounded-xl skew-x-[-8deg]',
                color: 'border-violet-500 bg-violet-50 text-violet-900',
                icon: 'fa-right-from-bracket',
                label: 'ÇIKTI',
                labelColor: 'text-violet-600',
                ring: '',
            };
        case 'loop':
            return {
                shape: 'rounded-2xl',
                color: 'border-blue-500 bg-blue-50 text-blue-900',
                icon: 'fa-rotate',
                label: 'DÖNGÜ',
                labelColor: 'text-blue-600',
                ring: '',
            };
        case 'parallel':
            return {
                shape: 'rounded-2xl',
                color: 'border-purple-500 bg-purple-50 text-purple-900',
                icon: 'fa-grip-lines-vertical',
                label: 'PARALEL',
                labelColor: 'text-purple-600',
                ring: '',
            };
        default:
            return {
                shape: 'rounded-3xl',
                color: 'border-zinc-700 bg-white text-zinc-900',
                icon: 'fa-gear',
                label: 'İŞLEM',
                labelColor: 'text-zinc-500',
                ring: '',
            };
    }
}

// ─── Bilişsel Yük Göstergesi ────────────────────────────────────────────────

const CogLoadBadge = ({ level }: { level?: string }) => {
    if (!level) return null;
    const cfg = {
        low:    { label: 'Kolay', cls: 'bg-emerald-100 text-emerald-700', dots: 1 },
        medium: { label: 'Orta',  cls: 'bg-amber-100 text-amber-700',    dots: 2 },
        high:   { label: 'Zor',   cls: 'bg-rose-100 text-rose-700',      dots: 3 },
    }[level as 'low' | 'medium' | 'high'];
    if (!cfg) return null;
    return (
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase ${cfg.cls}`}>
            {Array.from({ length: cfg.dots }, (_, i) => (
                <span key={i} className="w-1 h-1 rounded-full bg-current" />
            ))}
            {cfg.label}
        </span>
    );
};

// ─── Zaman Rozeti ───────────────────────────────────────────────────────────

const TimeBadge = ({ minutes }: { minutes?: number }) => {
    if (!minutes) return null;
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-[7px] font-black">
            <i className="fa-solid fa-clock text-[6px]" />
            {minutes} dk
        </span>
    );
};

// ─── İpucu Balonu ───────────────────────────────────────────────────────────

const HintBubble = ({ hint }: { hint?: string }) => {
    if (!hint) return null;
    return (
        <div className="flex items-start gap-2 mt-2 px-3 py-2 bg-teal-50 border border-teal-200 rounded-2xl print:py-1 no-print md:flex">
            <i className="fa-solid fa-lightbulb text-teal-500 text-[10px] mt-0.5 flex-shrink-0" />
            <p className="text-[9px] font-bold text-teal-700 leading-snug italic">{hint}</p>
        </div>
    );
};

// ─── Alt Adımlar ────────────────────────────────────────────────────────────

const SubStepList = ({ subSteps }: { subSteps?: string[] }) => {
    if (!subSteps || subSteps.length === 0) return null;
    return (
        <ol className="mt-2 ml-4 space-y-0.5">
            {subSteps.map((s, i) => (
                <li key={i} className="flex items-start gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-[7px] font-black flex-shrink-0 mt-0.5">
                        {i + 1}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-600 leading-tight">{s}</span>
                </li>
            ))}
        </ol>
    );
};

// ─── EVET / HAYIR Dalları ───────────────────────────────────────────────────

const DecisionBranches = ({ step }: { step: AlgorithmStep }) => {
    if (step.type !== 'decision') return null;
    const yes = step.yesPath || 'EVET';
    const no  = step.noPath  || 'HAYIR';
    return (
        <div className="w-full flex justify-around mt-1 print:mt-0.5">
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 border-2 border-emerald-300 rounded-full text-[9px] font-black text-emerald-700 shadow-sm">
                <i className="fa-solid fa-check text-[7px]" />
                {yes}
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 border-2 border-rose-300 rounded-full text-[9px] font-black text-rose-700 shadow-sm">
                <i className="fa-solid fa-xmark text-[7px]" />
                {no}
            </span>
        </div>
    );
};

// ─── Adım Şekli ─────────────────────────────────────────────────────────────

const StepShape = ({
    step,
    index,
    isCheckpoint,
    themeColor,
}: {
    step: AlgorithmStep;
    index: number;
    isCheckpoint: boolean;
    themeColor: typeof THEME_COLORS[string];
}) => {
    const style = getStepStyle(step.type);

    return (
        <div className="flex flex-col items-center w-full max-w-lg group">
            <EditableElement
                className={`
                    relative border-[3px] p-5 print:p-2 shadow-md transition-all duration-500
                    hover:scale-[1.02] hover:shadow-lg
                    min-h-[72px] w-full
                    ${style.shape} ${style.color} ${style.ring}
                    flex flex-col gap-2
                `}
            >
                {/* Adım Numarası Badge */}
                <div className="absolute -top-4 -left-3 print:-top-2 print:-left-2">
                    <div className={`
                        w-8 h-8 print:w-5 print:h-5 rounded-full flex items-center justify-center
                        text-[10px] print:text-[7px] font-black text-white shadow-lg
                        ${isCheckpoint ? themeColor.checkpoint : 'bg-zinc-700'}
                        ${isCheckpoint ? 'ring-4 ring-white/60' : ''}
                    `}>
                        {step.id}
                    </div>
                </div>

                {/* Tip Etiketi + İkon + Zaman + Bilişsel Yük */}
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="w-9 h-9 print:w-6 print:h-6 rounded-xl bg-white/70 flex items-center justify-center shadow-inner border border-white/50 flex-shrink-0">
                        <i className={`fa-solid ${style.icon} text-base print:text-xs`} />
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${style.labelColor}`}>
                        {style.label}
                    </span>
                    <TimeBadge minutes={step.timeEstimate} />
                    <CogLoadBadge level={step.cognitiveLoad} />
                </div>

                {/* Adım Metni */}
                <p className="text-base print:text-xs font-black tracking-tight leading-tight pl-1">
                    <EditableText value={step.text} tag="span" />
                </p>

                {/* Alt Adımlar */}
                <SubStepList subSteps={step.subSteps} />

                {/* EVET/HAYIR Dalları */}
                <DecisionBranches step={step} />
            </EditableElement>

            {/* İpucu Balonu */}
            <div className="w-full max-w-lg px-2">
                <HintBubble hint={step.hint} />
            </div>
        </div>
    );
};

// ─── Efsane (Legend) Kutusu ─────────────────────────────────────────────────

const LegendBox = ({ items }: { items?: AlgorithmLegendItem[] }) => {
    if (!items || items.length === 0) return null;
    const defaultItems: AlgorithmLegendItem[] = [
        { type: 'start',    label: 'Başlangıç / Bitiş', color: 'emerald', shape: 'oval'           },
        { type: 'process',  label: 'İşlem Adımı',        color: 'indigo',  shape: 'rect'           },
        { type: 'decision', label: 'Karar Noktası',      color: 'amber',   shape: 'diamond'        },
        { type: 'input',    label: 'Girdi / Çıktı',      color: 'sky',     shape: 'parallelogram'  },
    ];
    const displayItems = items.length > 0 ? items : defaultItems;
    const colorMap: Record<string, string> = {
        emerald: 'bg-emerald-500', indigo: 'bg-indigo-500', amber: 'bg-amber-500',
        sky: 'bg-sky-500', violet: 'bg-violet-500', rose: 'bg-rose-500',
        teal: 'bg-teal-500', blue: 'bg-blue-500', purple: 'bg-purple-500',
        green: 'bg-green-500', pink: 'bg-pink-500',
    };
    return (
        <div className="absolute top-4 right-4 print:static print:mt-2 print:mb-1 z-10 bg-white/95 backdrop-blur rounded-2xl border-2 border-zinc-200 shadow-xl p-3 print:p-1.5 min-w-[120px] no-print md:block hidden">
            <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-2 print:mb-1">
                <i className="fa-solid fa-circle-info mr-1" />Efsane
            </p>
            <div className="flex flex-col gap-1.5 print:gap-0.5">
                {displayItems.map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${colorMap[item.color] || 'bg-zinc-500'}`} />
                        <span className="text-[8px] font-bold text-zinc-600">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ─── İlerleme Çubuğu ────────────────────────────────────────────────────────

const ProgressBar = ({
    total,
    checkpoints,
    themeColor,
}: {
    total: number;
    checkpoints?: string[];
    themeColor: typeof THEME_COLORS[string];
}) => {
    if (!checkpoints || checkpoints.length === 0) return null;
    const checkSet = new Set(checkpoints.map(c => parseInt(c, 10)));
    return (
        <div className="flex items-center gap-1 mt-1 mb-4 print:mb-1 px-4 print:hidden">
            {Array.from({ length: total }, (_, i) => {
                const stepId = i + 1;
                const isCheck = checkSet.has(stepId);
                return (
                    <div key={i} className="flex items-center gap-1 flex-1">
                        <div
                            className={`
                                h-2 flex-1 rounded-full transition-all
                                ${isCheck ? themeColor.checkpoint : 'bg-zinc-200'}
                            `}
                            title={isCheck ? `Kontrol Noktası ${stepId}` : ''}
                        />
                        {isCheck && (
                            <i className="fa-solid fa-flag text-[7px] text-current" style={{ color: 'inherit' }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ─── Ana AlgorithmSheet Bileşeni ─────────────────────────────────────────────

export const AlgorithmSheet = ({ data, settings }: { data: AlgorithmData; settings?: Record<string, unknown> }) => {
    const steps = data.steps || [];
    const theme = THEME_COLORS[data.colorTheme ?? 'varsayılan'] ?? THEME_COLORS['varsayılan'];
    const checkpoints: string[] = data.progressCheckpoints ?? [];
    const checkSet = new Set(checkpoints.map(c => parseInt(c, 10)));

    // Algoritma tipi etiketi
    const algoTypeLabel: Record<string, string> = {
        lineer: 'Lineer Akış',
        'dallanmalı': 'Dallanmalı Akış',
        döngüsel: 'Döngüsel Akış',
        paralel: 'Paralel Akış',
    };

    const totalMin = data.totalEstimatedTime ?? 0;

    return (
        <div className="h-full flex flex-col text-black font-lexend p-3 overflow-visible relative">

            {/* Efsane Kutusu */}
            <LegendBox items={data.legendItems} />

            {/* Pedagojik Başlık */}
            <PedagogicalHeader title={data.title} instruction={data.instruction} data={data} />

            {/* Algoritma Tipi + Toplam Süre Rozetleri */}
            <div className="flex flex-wrap items-center gap-2 mt-2 mb-4 print:mb-1 print:mt-1">
                {data.algorithmType && (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white ${theme.badge}`}>
                        <i className="fa-solid fa-diagram-project text-[8px]" />
                        {algoTypeLabel[data.algorithmType] ?? data.algorithmType}
                    </span>
                )}
                {data.category && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-200 text-zinc-700">
                        <i className="fa-solid fa-tag text-[8px]" />
                        {data.category.replace('_', ' ')}
                    </span>
                )}
                {totalMin > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-100 text-teal-800">
                        <i className="fa-solid fa-stopwatch text-[8px]" />
                        ~{totalMin} dakika
                    </span>
                )}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-zinc-100 text-zinc-600">
                    <i className="fa-solid fa-list-ol text-[8px]" />
                    {steps.length} adım
                </span>
            </div>

            {/* Problem Senaryosu Kartı */}
            <div className={`mb-6 print:mb-2 p-8 print:p-3 ${theme.bg} text-white rounded-[3rem] print:rounded-2xl shadow-2xl relative overflow-hidden border-4 border-white ring-2 ring-zinc-100`}>
                <div className="absolute top-0 right-0 p-8 print:p-2 opacity-10 rotate-12 -translate-y-4 translate-x-4">
                    <i className="fa-solid fa-microchip text-[10rem] print:text-[4rem]" />
                </div>
                <div className="relative z-10">
                    <h4 className={`text-[10px] font-black uppercase ${theme.accent} mb-3 print:mb-1 tracking-[0.4em] flex items-center gap-2`}>
                        <i className="fa-solid fa-brain-circuit animate-pulse" />
                        PROBLEM SENARYOSU
                    </h4>
                    <p className="text-xl print:text-sm font-black leading-tight tracking-tight">
                        <EditableText value={data.challenge} tag="span" />
                    </p>
                </div>
            </div>

            {/* İlerleme Çubuğu */}
            <ProgressBar total={steps.length} checkpoints={checkpoints} themeColor={theme} />

            {/* Algoritma Adımları */}
            <div className="flex-1 flex flex-col items-center gap-0 relative py-4 print:py-1 w-full max-w-3xl mx-auto">
                {steps.length > 0 ? (
                    steps.map((step: AlgorithmStep, idx: number) => (
                        <React.Fragment key={step.id}>
                            <div
                                className="w-full flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-700"
                                style={{ animationDelay: `${idx * 100}ms` }}
                            >
                                <StepShape
                                    step={step}
                                    index={idx}
                                    isCheckpoint={checkSet.has(step.id)}
                                    themeColor={theme}
                                />
                            </div>
                            {idx < steps.length - 1 && (
                                <div className="py-1 print:py-0.5 opacity-40">
                                    <FlowArrow />
                                </div>
                            )}
                        </React.Fragment>
                    ))
                ) : (
                    <div className="p-16 print:p-4 text-center border-4 border-dashed border-zinc-100 rounded-[3rem] w-full">
                        <i className="fa-solid fa-triangle-exclamation text-amber-500 text-4xl mb-4" />
                        <h3 className="text-lg font-black text-zinc-400 uppercase tracking-widest">Adımlar Üretilemedi</h3>
                        <p className="text-zinc-400 mt-2 font-bold text-sm">
                            Lütfen AI motoruyla tekrar denemeyi deneyin.
                        </p>
                    </div>
                )}
            </div>

            {/* Akıllı Çözüm Alanı */}
            <div className="mt-8 print:mt-3 p-8 print:p-3 bg-zinc-50 border-[3px] border-zinc-200 border-dashed rounded-[3rem] print:rounded-2xl relative overflow-hidden break-inside-avoid">
                <h4 className="text-[10px] font-black text-zinc-400 uppercase mb-6 print:mb-2 tracking-[0.3em] flex items-center justify-center gap-3 print:gap-1">
                    <div className="h-0.5 w-10 bg-zinc-200" />
                    AKILLI ÇÖZÜM VE ANALİZ ALANI
                    <div className="h-0.5 w-10 bg-zinc-200" />
                </h4>
                <div className="grid grid-cols-2 gap-8 print:gap-3 min-h-[160px] print:min-h-[80px]">
                    <div className="border-b-2 border-zinc-300 relative pb-2">
                        <span className="absolute -top-5 left-0 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                            📝 Öğrenci Notları
                        </span>
                    </div>
                    <div className="border-b-2 border-zinc-300 relative pb-2">
                        <span className="absolute -top-5 left-0 text-[9px] font-black text-zinc-400 uppercase tracking-widest">
                            🧠 Mantıksal Sonuç
                        </span>
                    </div>
                </div>
            </div>

            {/* Pedagojik Not (Öğretmene) */}
            {data.pedagogicalNote && (
                <div className="mt-4 print:mt-2">
                    <TeacherNoteCard note={data.pedagogicalNote} />
                </div>
            )}

            {/* Footer */}
            <div className="mt-6 print:mt-2 pt-4 print:pt-1 flex justify-between items-center px-4 opacity-30 border-t border-zinc-100">
                <p className="text-[7px] text-zinc-500 font-bold uppercase tracking-[0.5em]">
                    bdmind • Mantıksal Akış Laboratuvarı v5.0
                </p>
                <div className="flex gap-3">
                    <i className="fa-solid fa-diagram-project text-xs" />
                    <i className="fa-solid fa-code-merge text-xs" />
                    <i className="fa-solid fa-brain text-xs" />
                </div>
            </div>
        </div>
    );
};
