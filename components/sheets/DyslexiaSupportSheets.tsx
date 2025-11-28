
import React from 'react';
import { ReadingFlowData, LetterDiscriminationData, RapidNamingData, PhonologicalAwarenessData, MirrorLettersData, SyllableTrainData, VisualTrackingLineData, BackwardSpellingData, CodeReadingData, AttentionToQuestionData, AttentionDevelopmentData, AttentionFocusData, ImageInterpretationTFData, HeartOfSkyData } from '../../types';
import { ImageDisplay, PedagogicalHeader } from './common';

// Basic implementation wrapper for simple sheets
const SimpleSheet = ({ title, instruction, note, data }: { title: string, instruction?: string, note?: string, data: any }) => (
    <div>
        <PedagogicalHeader title={title} instruction={instruction || ""} note={note} data={data} />
        <div className="p-4 text-center text-zinc-500 italic border-2 border-dashed border-zinc-200 rounded-lg">
            İçerik görselleştirme bileşeni.
        </div>
    </div>
);

export const ReadingFlowSheet: React.FC<{ data: ReadingFlowData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;
export const LetterDiscriminationSheet: React.FC<{ data: LetterDiscriminationData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;
export const RapidNamingSheet: React.FC<{ data: RapidNamingData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;
export const PhonologicalAwarenessSheet: React.FC<{ data: PhonologicalAwarenessData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;
export const MirrorLettersSheet: React.FC<{ data: MirrorLettersData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;
export const SyllableTrainSheet: React.FC<{ data: SyllableTrainData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;
export const VisualTrackingLinesSheet: React.FC<{ data: VisualTrackingLineData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;
export const BackwardSpellingSheet: React.FC<{ data: BackwardSpellingData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;
export const CodeReadingSheet: React.FC<{ data: CodeReadingData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;
export const AttentionToQuestionSheet: React.FC<{ data: AttentionToQuestionData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;
export const AttentionDevelopmentSheet: React.FC<{ data: AttentionDevelopmentData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;
export const AttentionFocusSheet: React.FC<{ data: AttentionFocusData }> = (props) => <SimpleSheet title={props.data.title} instruction={props.data.instruction} note={props.data.pedagogicalNote} data={props.data} />;

export const ImageInterpretationTFSheet: React.FC<{ data: ImageInterpretationTFData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
            <div className="mb-8 flex justify-center">
                <div className="w-full max-w-2xl bg-white dark:bg-zinc-800 p-2 rounded-2xl shadow-lg border-4 border-white dark:border-zinc-700 overflow-hidden relative group">
                    <ImageDisplay base64={data.imageBase64} description={data.sceneDescription || data.imagePrompt} className="w-full h-auto max-h-[400px] object-contain rounded-xl bg-zinc-50 dark:bg-zinc-900" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <p className="text-white text-center font-medium text-lg leading-relaxed">{data.sceneDescription}</p>
                    </div>
                </div>
            </div>
            <div className="max-w-2xl mx-auto space-y-4 font-dyslexic text-lg">
                <div className="text-center text-rose-500 font-bold mb-4 print:block hidden">
                    Aşağıdaki cümleleri resme göre okuyup cevapla. Cümle Doğruysa (D) yanlışsa (Y) harfi koy.
                </div>
                {data.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded transition-colors break-inside-avoid">
                        <div className="w-16 flex-shrink-0 flex items-center justify-center font-bold text-zinc-400">
                            ( &nbsp;&nbsp;&nbsp; )
                        </div>
                        <div className="flex-1 pt-0.5 text-zinc-800 dark:text-zinc-100 leading-normal">
                            {item.text}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// HEART OF SKY SHEET (New Activity)
export const HeartOfSkySheet: React.FC<{ data: HeartOfSkyData }> = ({ data }) => {
    return (
        <div>
            <PedagogicalHeader 
                title={data.title} 
                instruction={data.instruction || "Masalı oku, sahneleri hayal et ve soruları cevapla."} 
                note={data.pedagogicalNote} 
                data={data}
            />
            
            <div className="space-y-16">
                {data.scenes.map((scene, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-8 items-center md:items-start break-inside-avoid">
                        {/* Visual Side */}
                        <div className="w-full md:w-1/3 flex flex-col items-center">
                            <div className="w-full aspect-square bg-white dark:bg-zinc-800 rounded-full border-8 border-indigo-100 dark:border-zinc-700 shadow-xl overflow-hidden relative group">
                                <ImageDisplay 
                                    base64={scene.imageBase64 || data.imageBase64} // Use scene image if avail, else fallback to cover
                                    description={scene.visualDescription} 
                                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-700" 
                                />
                                {/* Overlay Description for Accessibility/Context */}
                                <div className="absolute inset-0 bg-indigo-900/80 flex items-center justify-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                                    <p className="text-white text-center text-sm font-medium italic">"{scene.visualDescription}"</p>
                                </div>
                            </div>
                            <div className="mt-4 px-4 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 rounded-full text-xs font-bold uppercase tracking-wider">
                                Sahne {idx + 1}
                            </div>
                        </div>

                        {/* Text Side */}
                        <div className="w-full md:w-2/3 space-y-6">
                            <h3 className="text-2xl font-bold text-indigo-900 dark:text-indigo-200 font-dyslexic border-b-2 border-indigo-100 dark:border-indigo-900 pb-2 inline-block">
                                {scene.title}
                            </h3>
                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-lg leading-loose text-zinc-700 dark:text-zinc-300 font-medium whitespace-pre-line">
                                    {scene.text}
                                </p>
                            </div>
                            
                            {scene.question && (
                                <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border-l-4 border-amber-400">
                                    <p className="font-bold text-amber-800 dark:text-amber-200 text-sm mb-1 flex items-center gap-2">
                                        <i className="fa-solid fa-circle-question"></i> Düşünelim:
                                    </p>
                                    <p className="text-zinc-700 dark:text-zinc-300">{scene.question}</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer / Conclusion Activity */}
            <div className="mt-16 p-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl text-white text-center shadow-2xl relative overflow-hidden break-inside-avoid">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-black mb-4">Senin Gökyüzün Nasıl?</h3>
                    <p className="text-lg text-indigo-100 mb-8 max-w-2xl mx-auto">
                        Bu hikayedeki gibi, senin de içinde parlayan bir ışık var. Gözlerini kapat ve kendi "gökyüzünün kalbini" hayal et. Neler görüyorsun?
                    </p>
                    <div className="h-48 w-full bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20 border-dashed flex items-center justify-center text-indigo-200">
                        <span className="text-sm font-bold uppercase tracking-widest">Resim Çizme veya Yazı Alanı</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
