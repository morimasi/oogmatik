import React from 'react';
import { StorySequencingData } from '../../../types';
import { PedagogicalHeader, ReadingRuler, ImageDisplay } from '../common';

interface StorySequencingPanelLike {
    id?: unknown;
    text?: unknown;
    imagePrompt?: unknown;
    correctOrder?: unknown;
}

const asRecord = (value: unknown): Record<string, unknown> | null =>
    value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : null;

const asPanelList = (value: unknown): StorySequencingPanelLike[] =>
    Array.isArray(value) ? value.filter((p): p is StorySequencingPanelLike => Boolean(p) && typeof p === 'object') : [];

export const StorySequencingSheet: React.FC<{ data: StorySequencingData }> = ({ data }) => {
    // Veri iki şekilde gelebilir: { content: { panels... } } (offline) veya düz { items / panels... } (AI).
    // İkisini de kabul et; hiçbir alan eksikse sayfa çökmesin.
    const raw = asRecord(data) ?? {};
    const content = asRecord(raw.content) ?? raw;

    const title =
        (typeof content.title === 'string' && content.title) ||
        (typeof raw.title === 'string' && raw.title) ||
        'Olay Sıralama';

    const instruction =
        (typeof raw.instruction === 'string' && raw.instruction) ||
        (typeof content.instruction === 'string' && content.instruction) ||
        'Olayları oluş sırasına göre numaralandırın.';

    const panels = asPanelList(content.panels ?? raw.panels ?? content.items ?? raw.items ?? content.steps ?? raw.steps);

    const transitionWords = (content.transitionWords ?? raw.transitionWords) as unknown;
    const words = Array.isArray(transitionWords)
        ? transitionWords.filter((w): w is string => typeof w === 'string' && w.trim().length > 0)
        : [];

    return (
        <div className="flex flex-col h-full bg-white relative font-lexend p-4">
            <ReadingRuler />
            <PedagogicalHeader
                title={title}
                instruction={instruction}
            />

            {words.length > 0 && (
                <div className="flex gap-4 items-center justify-center p-3 bg-amber-50 rounded-2xl border border-amber-100 mb-6 flex-wrap">
                    {words.map((word, i) => (
                        <div key={i} className="flex items-center gap-1">
                            {i > 0 && <i className="fa-solid fa-chevron-right text-[10px] text-zinc-300"></i>}
                            <span className="px-3 py-1 bg-white border border-amber-200 rounded-lg text-xs font-black text-amber-600 shadow-sm uppercase">
                                {word}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-2 gap-x-12 gap-y-10 mb-8 mt-4">
                {panels.map((panel, i) => {
                    const panelText = typeof panel.text === 'string' ? panel.text : '';
                    const imagePrompt = typeof panel.imagePrompt === 'string' ? panel.imagePrompt : '';
                    return (
                        <div key={typeof panel.id === 'string' ? panel.id : `panel-${i}`} className="relative group animate-in zoom-in duration-300">
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-zinc-900 border-4 border-white rounded-2xl flex items-center justify-center shadow-xl z-20">
                                <span className="text-white font-black text-lg">?</span>
                            </div>

                            <div className="p-6 bg-white rounded-[2.5rem] border-2 border-zinc-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.05)] relative z-10 hover:border-amber-400 transition-all">
                                {imagePrompt && (
                                    <div className="aspect-video bg-zinc-50 rounded-2xl mb-4 overflow-hidden border border-zinc-100">
                                        <ImageDisplay prompt={imagePrompt} description={panelText || 'olay görseli'} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <p className="text-zinc-800 font-bold leading-tight text-justify">
                                    {panelText}
                                </p>
                            </div>

                            {/* Çizgi bağı / Oklar UI için görsel ipucu (sayfada karıştırıldığı için çocuk kendisi birleştirmeli) */}
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                <div className="w-10 h-10 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-300 group-hover:text-amber-500 transition-colors">
                                    <i className="fa-solid fa-arrow-down-long"></i>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="mt-auto p-6 bg-zinc-900 rounded-[3rem] text-white overflow-hidden relative border-4 border-zinc-400 shadow-2xl animate-in slide-in-from-bottom duration-500">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <i className="fa-solid fa-pen-nib text-[120px]"></i>
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-file-signature"></i> Sırasıyla Bütün Hikaye
                </h4>
                <div className="space-y-4">
                    <div className="h-6 border-b border-white/20"></div>
                    <div className="h-6 border-b border-white/20"></div>
                    <div className="h-6 border-b border-white/20"></div>
                </div>
                <p className="mt-6 text-[10px] italic text-zinc-500 text-center font-medium">
                    Doğru sıralamayı bulduktan sonra hikayeyi bir bütün olarak anlatın veya yazın.
                </p>
            </div>
        </div>
    );
};
