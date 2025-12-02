
import React from 'react';
import { 
    StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData,
    ProverbFillData, ProverbSayingSortData, ProverbWordChainData, MissingPartsData,
    MultipleChoiceStoryQuestion, OpenEndedStoryQuestion, TrueFalseQuestion, ProverbSearchData
} from '../../types';
import { ImageDisplay, PedagogicalHeader, ReadingRuler } from './common';
import { WordSearchSheet } from './WordGameSheets';
import { EditableElement, EditableText } from '../Editable';

// --- STYLING CONSTANTS (Compact & Professional) ---
const SECTION_HEADER_CLASS = "text-base font-bold text-black border-b-2 border-black pb-1 mb-3 flex items-center gap-2 uppercase tracking-wide";
const COMPACT_CARD_CLASS = "bg-white rounded-lg border-2 border-black p-3 break-inside-avoid shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-4";
const COMPACT_NUMBER_CLASS = "w-6 h-6 bg-black text-white rounded flex items-center justify-center font-bold text-xs shrink-0 mr-2";

export const StoryComprehensionSheet: React.FC<{ data: StoryData }> = ({ data }) => (
  <div className="relative space-y-4 text-black h-full">
    <ReadingRuler />
    
    {/* Header - Slightly more compact */}
    <div className="mb-4">
        <PedagogicalHeader title={data.title} instruction="Hikayeyi oku, unsurları bul ve soruları cevapla." note={data.pedagogicalNote} data={data} />
    </div>
    
    {/* READING SECTION */}
    <EditableElement className="bg-white p-5 rounded-2xl border-2 border-black relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 p-2 opacity-5 pointer-events-none"><i className="fa-solid fa-book-open text-8xl text-black"></i></div>
        <div className="prose max-w-none relative z-10">
            <EditableText 
                tag="p"
                value={data.story} 
                className="text-lg leading-normal text-black font-medium text-justify font-dyslexic" 
            />
        </div>
    </EditableElement>

    {/* ELEMENTS GRID (EMPTY FOR STUDENT TO FILL) */}
    <div className="grid grid-cols-3 gap-3">
        {[
            { icon: 'fa-users', title: 'Karakterler' },
            { icon: 'fa-map-pin', title: 'Yer / Zaman' },
            { icon: 'fa-lightbulb', title: 'Ana Fikir' }
        ].map((item, i) => (
            <EditableElement key={i} className="p-3 bg-white rounded-lg border-2 border-black h-32 flex flex-col">
                <h4 className="font-bold text-xs uppercase tracking-wider text-black mb-2 border-b border-black pb-1 flex items-center gap-2">
                    <i className={`fa-solid ${item.icon}`}></i> {item.title}
                </h4>
                {/* Empty Lines for Writing */}
                <div className="flex-1 flex flex-col justify-evenly">
                    <div className="border-b-2 border-dotted border-zinc-300 w-full"></div>
                    <div className="border-b-2 border-dotted border-zinc-300 w-full"></div>
                    <div className="border-b-2 border-dotted border-zinc-300 w-full"></div>
                </div>
            </EditableElement>
        ))}
    </div>
    
    {/* QUESTIONS SECTION - COMPACT LAYOUT */}
    <div>
        <h4 className={SECTION_HEADER_CLASS}><i className="fa-solid fa-clipboard-question"></i> Sorular</h4>
        
        {/* Use CSS Columns for flowing content naturally like a newspaper */}
        <div className="block md:columns-2 gap-4 space-y-4">
            {(data.questions || []).map((q, index) => {
                if (q.type === 'multiple-choice') {
                    const mcq = q as MultipleChoiceStoryQuestion;
                    return (
                        <EditableElement key={index} className={COMPACT_CARD_CLASS}>
                            <div className="flex items-start mb-2">
                                <span className={COMPACT_NUMBER_CLASS}>{index + 1}</span>
                                <p className="font-bold text-sm text-black leading-tight"><EditableText value={mcq.question} tag="span" /></p>
                            </div>
                            <div className="grid grid-cols-2 gap-2 pl-8">
                                {mcq.options.map((opt, i) => (
                                    <div key={i} className="flex items-center gap-2 cursor-pointer group">
                                        <div className="w-4 h-4 border-2 border-black rounded-full flex items-center justify-center shrink-0"></div>
                                        <span className="text-sm font-medium text-black leading-tight"><EditableText value={opt} tag="span" /></span>
                                    </div>
                                ))}
                            </div>
                        </EditableElement>
                    );
                } else if (q.type === 'true-false') {
                    const tf = q as TrueFalseQuestion;
                    return (
                        <EditableElement key={index} className={COMPACT_CARD_CLASS}>
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1">
                                    <span className={COMPACT_NUMBER_CLASS}>{index + 1}</span>
                                    <p className="font-bold text-sm text-black leading-tight"><EditableText value={tf.statement} tag="span" /></p>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                    <div className="w-8 h-8 border-2 border-black rounded flex items-center justify-center font-bold text-sm">D</div>
                                    <div className="w-8 h-8 border-2 border-black rounded flex items-center justify-center font-bold text-sm">Y</div>
                                </div>
                            </div>
                        </EditableElement>
                    );
                } else {
                    const oeq = q as OpenEndedStoryQuestion;
                    return (
                        <EditableElement key={index} className={COMPACT_CARD_CLASS}>
                            <div className="flex items-start mb-2">
                                <span className={COMPACT_NUMBER_CLASS}>{index + 1}</span>
                                <p className="font-bold text-sm text-black leading-tight"><EditableText value={oeq.question} tag="span" /></p>
                            </div>
                            <div className="pl-8 space-y-3 mt-1">
                                {Array.from({length: 2}).map((_, l) => (
                                    <div key={l} className="w-full border-b border-black border-dashed h-4"></div>
                                ))}
                            </div>
                        </EditableElement>
                    );
                }
            })}
        </div>
    </div>
  </div>
);

export const StoryCreationPromptSheet: React.FC<{ data: StoryCreationPromptData }> = ({ data }) => (
    <div className="relative space-y-8 text-black">
        <ReadingRuler />
        <PedagogicalHeader title={data.title} instruction="Hayal gücünü kullan ve kendi hikayeni yaz!" note={data.pedagogicalNote} data={data} />
        
        {/* PROMPT BOX */}
        <EditableElement className="bg-white p-6 rounded-2xl border-4 border-black text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="text-xl font-bold mb-2 uppercase tracking-widest border-b-2 border-black inline-block pb-1">Yazma Konusu</h3>
            <p className="text-2xl font-bold font-dyslexic mt-4"><EditableText value={data.prompt} tag="span" /></p>
        </EditableElement>

        {/* SCAFFOLDING GRID (5N 1K) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Kim?', val: data.structureHints?.who, icon: 'fa-user' },
                { label: 'Nerede?', val: data.structureHints?.where, icon: 'fa-map-location-dot' },
                { label: 'Ne Zaman?', val: data.structureHints?.when, icon: 'fa-clock' },
                { label: 'Sorun Ne?', val: data.structureHints?.problem, icon: 'fa-triangle-exclamation' }
            ].map((hint, i) => (
                <EditableElement key={i} className="bg-white p-4 rounded-xl border-2 border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group">
                    <div className="flex items-center gap-2 mb-2 text-black border-b-2 border-black pb-1 uppercase text-xs font-black tracking-widest">
                        <i className={`fa-solid ${hint.icon}`}></i> {hint.label}
                    </div>
                    <div className="text-lg font-bold text-black min-h-[1.5rem]">
                        <EditableText value={hint.val || '...'} tag="span" />
                    </div>
                </EditableElement>
            ))}
        </div>

        {/* KEYWORDS */}
        <EditableElement className="flex flex-wrap justify-center gap-3 p-4 bg-white rounded-xl border-2 border-dashed border-black">
            <span className="w-full text-center text-xs font-bold text-black uppercase mb-2">Anahtar Kelimeler</span>
            {(data.keywords || []).map((word, index) => (
                <span key={index} className="px-4 py-1.5 bg-white border-2 border-black rounded-full font-bold text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm">
                    <EditableText value={word} tag="span" />
                </span>
            ))}
        </EditableElement>
            
        {/* WRITING AREA */}
        <EditableElement className="bg-white p-8 rounded-2xl border-2 border-black shadow-sm min-h-[500px] relative">
            <div className="absolute top-0 left-10 h-full border-l-2 border-red-500 opacity-50"></div>
            <h4 className="font-bold text-center text-black uppercase tracking-widest mb-6 border-b-2 border-black pb-4">Hikaye Taslağı</h4>
            <div className="space-y-10 pl-12">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="border-b border-black h-8 w-full"></div>
                ))}
            </div>
        </EditableElement>
    </div>
);

export const WordsInStorySheet: React.FC<{ data: WordsInStoryData }> = ({ data }) => (
    <div className="relative space-y-8 text-black">
        <ReadingRuler />
        <PedagogicalHeader title={data.title} instruction="Metni oku ve kelimelerin anlamlarını keşfet." note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="bg-white p-8 rounded-3xl border-2 border-black leading-loose text-lg font-dyslexic text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <EditableText value={data.story} tag="p" />
        </EditableElement>
        
        <div className="space-y-6">
            <h4 className={SECTION_HEADER_CLASS}><i className="fa-solid fa-magnifying-glass"></i> Kelime Dedektifi</h4>
            
            <div className="dynamic-grid">
                {(data.vocabWork || []).map((item, index) => (
                     <EditableElement key={index} className="bg-white rounded-2xl p-6 border-2 border-black shadow-sm break-inside-avoid">
                        <div className="flex items-center gap-3 mb-4 border-b-2 border-black pb-3">
                            <span className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center text-xl font-black"><i className="fa-solid fa-quote-right"></i></span>
                            <span className="text-2xl font-black text-black tracking-wide"><EditableText value={item.word} tag="span" /></span>
                        </div>
                        
                        <p className="text-black font-medium mb-4 italic"><EditableText value={item.contextQuestion} tag="span" /></p>
                        
                        <div className="bg-white p-3 rounded-xl border-2 border-dashed border-black h-24"></div>
                        <div className="mt-2 text-right text-xs text-black font-bold uppercase tracking-wider bg-zinc-200 inline-block px-2 py-1 rounded ml-auto float-right">
                            {item.type === 'meaning' ? 'Tahmini Anlam' : item.type === 'synonym' ? 'Eş Anlamlısı' : 'Zıt Anlamlısı'}
                        </div>
                    </EditableElement>
                ))}
            </div>
        </div>
    </div>
);

export const StoryAnalysisSheet: React.FC<{ data: StoryAnalysisData }> = ({ data }) => (
    <div className="relative space-y-8 text-black">
        <PedagogicalHeader title={data.title} instruction="Hikayenin unsurlarını analiz et." note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="bg-white p-6 rounded-2xl border-2 border-black text-sm leading-relaxed max-h-60 overflow-y-auto custom-scrollbar mb-8 italic text-black shadow-inner">
            <EditableText value={data.story} tag="p" />
        </EditableElement>
        
        {/* STORY MAP VISUALIZATION */}
        <div className="relative bg-white p-8 rounded-3xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm border-4 border-white z-10">Hikaye Haritası</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 relative z-0">
                {/* Connecting Lines (Visual Only) */}
                <div className="absolute inset-0 hidden md:block pointer-events-none">
                    <svg className="w-full h-full stroke-black" strokeWidth="2" fill="none">
                        <path d="M 25% 25% L 75% 25% L 75% 75% L 25% 75% Z" strokeDasharray="5,5" />
                    </svg>
                </div>

                {/* Central Theme Bubble - Empty for student */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full border-4 border-black flex flex-col items-center justify-center text-center p-2 z-10 hidden md:flex shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-[10px] font-bold text-black uppercase border-b-2 border-black mb-1">ANA FİKİR</span>
                    {/* Empty lines */}
                    <div className="w-20 border-b-2 border-dotted border-black mt-2"></div>
                    <div className="w-16 border-b-2 border-dotted border-black mt-2"></div>
                </div>

                {[
                    { title: 'Karakterler', icon: 'fa-users' },
                    { title: 'Yer / Zaman', icon: 'fa-map-location-dot' },
                    { title: 'Sorun (Çatışma)', icon: 'fa-triangle-exclamation' },
                    { title: 'Çözüm', icon: 'fa-wand-magic-sparkles' },
                ].map((item, i) => (
                    <EditableElement key={i} className="p-5 bg-white rounded-2xl border-2 border-black relative z-10 shadow-[4px_4px_0px_0px_rgba(200,200,200,1)] min-h-[120px]">
                        <div className="absolute -top-3 -left-3 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center border-2 border-white"><i className={`fa-solid ${item.icon}`}></i></div>
                        <h4 className="text-center font-black text-black mb-2 mt-1 uppercase text-sm border-b-2 border-zinc-200 pb-1">{item.title}</h4>
                        {/* Empty lines for student to fill */}
                        <div className="flex flex-col gap-2 mt-2">
                            <div className="border-b-2 border-black border-dotted h-6"></div>
                            <div className="border-b-2 border-black border-dotted h-6"></div>
                        </div>
                    </EditableElement>
                ))}
            </div>
        </div>
    </div>
);

export const MissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => (
    <div className="relative space-y-8 text-black">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        {/* WORD BANK */}
        <EditableElement className="bg-white p-6 rounded-2xl border-2 border-black border-dashed text-center mb-8">
            <h4 className="font-bold text-black mb-4 uppercase tracking-widest text-sm flex items-center justify-center gap-2"><i className="fa-solid fa-box-open"></i> Kelime Bankası</h4>
            <div className="flex flex-wrap justify-center gap-3">
                {(data.wordBank || []).map((word, i) => (
                    <span key={i} className="px-4 py-2 bg-white rounded-lg border-2 border-black font-bold text-black cursor-grab active:cursor-grabbing hover:bg-black hover:text-white transition-colors">
                        <EditableText value={word} tag="span" />
                    </span>
                ))}
            </div>
        </EditableElement>

        {/* CLOZE TEXT */}
        <EditableElement className="bg-white p-8 rounded-3xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-xl leading-loose font-dyslexic text-black">
                {(data.storyWithBlanks || []).map((segment, i) => (
                    <React.Fragment key={i}>
                        <span><EditableText value={segment} tag="span" /></span>
                        {i < (data.storyWithBlanks.length - 1) && (
                            <span className="inline-block w-32 border-b-2 border-black mx-2 bg-zinc-100 rounded px-2 text-center text-black font-bold min-h-[1.5em] align-bottom">
                                {/* Blank Space */}
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </EditableElement>
    </div>
);

export const StorySequencingSheet: React.FC<{ data: StorySequencingData }> = ({ data }) => (
    <div className="relative space-y-8 text-black">
      <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} data={data} />
      
      {/* TRANSITION WORDS HELPER */}
      <EditableElement className="flex justify-center gap-4 mb-6 flex-wrap">
          {(data.transitionWords || []).map((word, i) => (
              <span key={i} className="text-xs font-bold text-black uppercase tracking-wider bg-white border border-black px-3 py-1 rounded-full"><i className="fa-solid fa-link mr-1"></i> {word}</span>
          ))}
      </EditableElement>

      {/* PANELS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data.panels || []).map((panel, idx) => (
          <EditableElement key={panel.id} className="relative bg-white p-4 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] break-inside-avoid">
            <div className="absolute -top-3 -left-3 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-bold text-xl border-4 border-white z-10">
                ?
            </div>
            
            <div className="aspect-video w-full bg-white rounded-xl mb-4 overflow-hidden border-2 border-black relative">
                {panel.imageBase64 ? (
                    <ImageDisplay base64={panel.imageBase64} description={panel.description} className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-4xl"><i className="fa-regular fa-image"></i></div>
                )}
            </div>
            
            <div className="min-h-[4rem] flex items-center justify-center text-center">
                <p className="text-base font-bold text-black"><EditableText value={panel.description} tag="span" /></p>
            </div>
          </EditableElement>
        ))}
      </div>
      
      {/* ORDERING STRIP */}
      <EditableElement className="mt-8 p-6 bg-white rounded-2xl border-2 border-dashed border-black">
        <h4 className="text-center font-bold text-black mb-4 uppercase tracking-widest text-sm">Doğru Sıralama</h4>
        <div className="flex justify-center items-center gap-2 md:gap-4 overflow-x-auto pb-2">
          {Array.from({ length: (data.panels || []).length }).map((_, index) => (
            <React.Fragment key={index}>
                <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-black bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-4xl font-black text-zinc-200 select-none">{index + 1}</span>
                </div>
                {index < ((data.panels || []).length - 1) && <i className="fa-solid fa-arrow-right text-black text-xl"></i>}
            </React.Fragment>
          ))}
        </div>
      </EditableElement>
    </div>
);

// Fallbacks for compatibility
export const ProverbFillSheet = MissingPartsSheet as any;
export const ProverbSayingSortSheet = StoryComprehensionSheet as any; 
export const ProverbWordChainSheet = StorySequencingSheet as any; 
export const ProverbSentenceFinderSheet = StorySequencingSheet as any;
export const ProverbSearchSheet = WordSearchSheet as any;
