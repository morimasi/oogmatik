
import React from 'react';
import { 
    StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData,
    ProverbFillData, ProverbSayingSortData, ProverbWordChainData, MissingPartsData,
    MultipleChoiceStoryQuestion, OpenEndedStoryQuestion, TrueFalseQuestion, ProverbSearchData
} from '../../types';
import { ImageDisplay, PedagogicalHeader, ReadingRuler } from './common';
import { WordSearchSheet } from './WordGameSheets';
import { EditableElement, EditableText } from '../Editable';

// --- STYLING CONSTANTS ---
const SECTION_HEADER_CLASS = "text-xl font-bold text-zinc-800 dark:text-zinc-100 border-b-2 border-zinc-200 dark:border-zinc-700 pb-2 mb-4 flex items-center gap-2 uppercase tracking-wide";
const CARD_CLASS = "bg-white dark:bg-zinc-800 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 p-6 break-inside-avoid";

export const StoryComprehensionSheet: React.FC<{ data: StoryData }> = ({ data }) => (
  <div className="relative space-y-8">
    <ReadingRuler />
    <PedagogicalHeader title={data.title} instruction="Hikayeyi dikkatlice oku ve aşağıdaki etkinlikleri tamamla." note={data.pedagogicalNote} data={data} />
    
    {/* READING SECTION */}
    <EditableElement className="bg-gradient-to-r from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800 p-8 rounded-3xl shadow-inner border border-zinc-200 dark:border-zinc-700 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><i className="fa-solid fa-book-open text-9xl"></i></div>
        <div className="prose dark:prose-invert max-w-none relative z-10">
            <EditableText 
                tag="p"
                value={data.story} 
                className="text-xl md:text-2xl leading-loose tracking-wide text-zinc-800 dark:text-zinc-200 font-medium text-left font-dyslexic" 
                style={{ wordSpacing: '0.2em' }}
            />
        </div>
    </EditableElement>

    {/* ELEMENTS GRID */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
            { icon: 'fa-users', title: 'Karakterler', content: data.characters?.join(', ') || '...', color: 'emerald' },
            { icon: 'fa-map-pin', title: 'Mekan', content: data.setting || '...', color: 'amber' },
            { icon: 'fa-lightbulb', title: 'Ana Fikir', content: data.mainIdea || '...', color: 'indigo' }
        ].map((item, i) => (
            <EditableElement key={i} className={`p-4 bg-${item.color}-50 dark:bg-${item.color}-900/20 rounded-xl border-l-4 border-${item.color}-500 shadow-sm`}>
                <h4 className={`font-bold text-sm uppercase tracking-wider text-${item.color}-800 dark:text-${item.color}-300 mb-1`}>
                    <i className={`fa-solid ${item.icon} mr-2`}></i>{item.title}
                </h4>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300"><EditableText value={item.content} tag="span" /></p>
            </EditableElement>
        ))}
    </div>
    
    {/* QUESTIONS SECTION */}
    <div className="space-y-6">
        <h4 className={SECTION_HEADER_CLASS}><i className="fa-solid fa-clipboard-question text-indigo-500"></i> Sorular</h4>
        
        <div className="dynamic-grid gap-6">
            {(data.questions || []).map((q, index) => {
                if (q.type === 'multiple-choice') {
                    const mcq = q as MultipleChoiceStoryQuestion;
                    return (
                        <EditableElement key={index} className={CARD_CLASS}>
                            <div className="flex gap-3 mb-4">
                                <span className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold shadow-sm shrink-0">{index + 1}</span>
                                <p className="font-bold text-lg pt-0.5"><EditableText value={mcq.question} tag="span" /></p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ml-11">
                                {mcq.options.map((opt, i) => (
                                    <div key={i} className="flex items-center p-3 rounded-lg border-2 border-zinc-100 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-all group">
                                        <div className="w-6 h-6 border-2 border-zinc-300 rounded-full mr-3 group-hover:border-indigo-500 flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100"></div></div>
                                        <span className="font-medium group-hover:text-indigo-700"><EditableText value={opt} tag="span" /></span>
                                    </div>
                                ))}
                            </div>
                        </EditableElement>
                    );
                } else if (q.type === 'true-false') {
                    const tf = q as TrueFalseQuestion;
                    return (
                        <EditableElement key={index} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-zinc-700 break-inside-avoid">
                            <div className="flex gap-3 items-center flex-1">
                                <span className="w-8 h-8 bg-orange-500 text-white rounded-lg flex items-center justify-center font-bold shadow-sm shrink-0">{index + 1}</span>
                                <p className="font-medium text-lg"><EditableText value={tf.statement} tag="span" /></p>
                            </div>
                            <div className="flex gap-2 ml-4">
                                <div className="px-4 py-2 border-2 border-zinc-300 rounded-lg font-bold text-zinc-400 hover:border-green-500 hover:text-green-600 cursor-pointer">D</div>
                                <div className="px-4 py-2 border-2 border-zinc-300 rounded-lg font-bold text-zinc-400 hover:border-red-500 hover:text-red-600 cursor-pointer">Y</div>
                            </div>
                        </EditableElement>
                    );
                } else {
                    const oeq = q as OpenEndedStoryQuestion;
                    return (
                        <EditableElement key={index} className={CARD_CLASS}>
                            <div className="flex gap-3 mb-2">
                                <span className="w-8 h-8 bg-rose-500 text-white rounded-lg flex items-center justify-center font-bold shadow-sm shrink-0">{index + 1}</span>
                                <p className="font-bold text-lg pt-0.5"><EditableText value={oeq.question} tag="span" /></p>
                            </div>
                            <div className="ml-11 mt-4 space-y-3">
                                {Array.from({length: oeq.spaceLines || 3}).map((_, l) => (
                                    <div key={l} className="w-full border-b-2 border-dotted border-zinc-300 dark:border-zinc-600 h-6"></div>
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
    <div className="relative space-y-8">
        <ReadingRuler />
        <PedagogicalHeader title={data.title} instruction="Hayal gücünü kullan ve kendi hikayeni yaz!" note={data.pedagogicalNote} data={data} />
        
        {/* PROMPT BOX */}
        <EditableElement className="bg-indigo-600 p-6 rounded-2xl shadow-lg text-white text-center">
            <h3 className="text-xl font-bold mb-2 opacity-90 uppercase tracking-widest">Yazma Konusu</h3>
            <p className="text-2xl font-medium font-dyslexic"><EditableText value={data.prompt} tag="span" /></p>
        </EditableElement>

        {/* SCAFFOLDING GRID (5N 1K) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Kim?', val: data.structureHints?.who, icon: 'fa-user' },
                { label: 'Nerede?', val: data.structureHints?.where, icon: 'fa-map-location-dot' },
                { label: 'Ne Zaman?', val: data.structureHints?.when, icon: 'fa-clock' },
                { label: 'Sorun Ne?', val: data.structureHints?.problem, icon: 'fa-triangle-exclamation' }
            ].map((hint, i) => (
                <EditableElement key={i} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 hover:border-indigo-400 transition-colors group">
                    <div className="flex items-center gap-2 mb-2 text-zinc-400 group-hover:text-indigo-500 uppercase text-xs font-bold tracking-widest">
                        <i className={`fa-solid ${hint.icon}`}></i> {hint.label}
                    </div>
                    <div className="text-lg font-bold text-zinc-800 dark:text-zinc-100 min-h-[1.5rem]">
                        <EditableText value={hint.val || '...'} tag="span" />
                    </div>
                </EditableElement>
            ))}
        </div>

        {/* KEYWORDS */}
        <EditableElement className="flex flex-wrap justify-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-200">
            <span className="w-full text-center text-xs font-bold text-zinc-400 uppercase">Anahtar Kelimeler</span>
            {(data.keywords || []).map((word, index) => (
                <span key={index} className="px-4 py-1.5 bg-white border border-zinc-300 rounded-full font-bold text-zinc-600 shadow-sm text-sm">
                    <EditableText value={word} tag="span" />
                </span>
            ))}
        </EditableElement>
            
        {/* WRITING AREA */}
        <EditableElement className="bg-white dark:bg-zinc-800 p-8 rounded-2xl border-2 border-zinc-200 dark:border-zinc-700 shadow-sm min-h-[500px] relative">
            <div className="absolute top-0 left-8 h-full border-l-2 border-red-200 dark:border-red-900/30"></div>
            <h4 className="font-bold text-center text-zinc-400 uppercase tracking-widest mb-6 border-b pb-4">Hikaye Taslağı</h4>
            <div className="space-y-10 pl-10">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="border-b border-zinc-300 dark:border-zinc-600 h-8 w-full"></div>
                ))}
            </div>
        </EditableElement>
    </div>
);

export const WordsInStorySheet: React.FC<{ data: WordsInStoryData }> = ({ data }) => (
    <div className="relative space-y-8">
        <ReadingRuler />
        <PedagogicalHeader title={data.title} instruction="Metni oku ve kelimelerin anlamlarını keşfet." note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-700 leading-loose text-lg font-dyslexic text-zinc-800 dark:text-zinc-100">
            <EditableText value={data.story} tag="p" />
        </EditableElement>
        
        <div className="space-y-6">
            <h4 className={SECTION_HEADER_CLASS}><i className="fa-solid fa-magnifying-glass text-emerald-500"></i> Kelime Dedektifi</h4>
            
            <div className="dynamic-grid">
                {(data.vocabWork || []).map((item, index) => (
                     <EditableElement key={index} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800 shadow-sm break-inside-avoid">
                        <div className="flex items-center gap-3 mb-4 border-b border-emerald-200 dark:border-emerald-800 pb-3">
                            <span className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center justify-center text-xl font-black"><i className="fa-solid fa-quote-right"></i></span>
                            <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200 tracking-wide"><EditableText value={item.word} tag="span" /></span>
                        </div>
                        
                        <p className="text-zinc-700 dark:text-zinc-300 font-medium mb-4 italic"><EditableText value={item.contextQuestion} tag="span" /></p>
                        
                        <div className="bg-white dark:bg-zinc-800 p-3 rounded-xl border-2 border-dashed border-emerald-300 h-24"></div>
                        <div className="mt-2 text-right text-xs text-emerald-600 font-bold uppercase tracking-wider">{item.type === 'meaning' ? 'Tahmini Anlam' : item.type === 'synonym' ? 'Eş Anlamlısı' : 'Zıt Anlamlısı'}</div>
                    </EditableElement>
                ))}
            </div>
        </div>
    </div>
);

export const StoryAnalysisSheet: React.FC<{ data: StoryAnalysisData }> = ({ data }) => (
    <div className="relative space-y-8">
        <PedagogicalHeader title={data.title} instruction="Hikayenin unsurlarını analiz et." note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-zinc-200 text-sm leading-relaxed max-h-60 overflow-y-auto custom-scrollbar mb-8 italic text-zinc-600">
            <EditableText value={data.story} tag="p" />
        </EditableElement>
        
        {/* STORY MAP VISUALIZATION */}
        <div className="relative bg-white dark:bg-zinc-800 p-8 rounded-3xl border-2 border-zinc-200 dark:border-zinc-700 shadow-xl">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-2 rounded-full font-bold uppercase tracking-widest text-sm shadow-lg z-10">Hikaye Haritası</div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 relative z-0">
                {/* Connecting Lines (Visual Only) */}
                <div className="absolute inset-0 hidden md:block pointer-events-none">
                    <svg className="w-full h-full stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="2" fill="none">
                        <path d="M 25% 25% L 75% 25% L 75% 75% L 25% 75% Z" strokeDasharray="10,10" />
                        <circle cx="50%" cy="50%" r="40" fill="white" stroke="currentColor" />
                    </svg>
                </div>

                {/* Central Theme Bubble */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white dark:bg-zinc-800 rounded-full border-4 border-indigo-500 shadow-xl flex flex-col items-center justify-center text-center p-2 z-10 hidden md:flex">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase">ANA FİKİR</span>
                    <span className="font-bold text-sm leading-tight text-indigo-900 dark:text-indigo-200"><EditableText value={data.storyMap?.theme || '?'} tag="span" /></span>
                </div>

                <EditableElement className="p-5 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 relative">
                    <div className="absolute -top-3 -left-3 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg"><i className="fa-solid fa-users"></i></div>
                    <h4 className="text-center font-bold text-blue-800 mb-2 mt-2 uppercase text-sm">Karakterler</h4>
                    <p className="text-center font-medium"><EditableText value={data.storyMap?.characters} tag="span" /></p>
                </EditableElement>

                <EditableElement className="p-5 bg-green-50 dark:bg-green-900/20 rounded-2xl border-2 border-green-200 relative">
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg"><i className="fa-solid fa-map-location-dot"></i></div>
                    <h4 className="text-center font-bold text-green-800 mb-2 mt-2 uppercase text-sm">Yer / Zaman</h4>
                    <p className="text-center font-medium"><EditableText value={data.storyMap?.setting} tag="span" /></p>
                </EditableElement>

                <EditableElement className="p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 relative">
                    <div className="absolute -bottom-3 -left-3 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg"><i className="fa-solid fa-triangle-exclamation"></i></div>
                    <h4 className="text-center font-bold text-red-800 mb-2 mt-2 uppercase text-sm">Sorun (Çatışma)</h4>
                    <p className="text-center font-medium"><EditableText value={data.storyMap?.problem} tag="span" /></p>
                </EditableElement>

                <EditableElement className="p-5 bg-purple-50 dark:bg-purple-900/20 rounded-2xl border-2 border-purple-200 relative">
                    <div className="absolute -bottom-3 -right-3 w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center shadow-lg"><i className="fa-solid fa-wand-magic-sparkles"></i></div>
                    <h4 className="text-center font-bold text-purple-800 mb-2 mt-2 uppercase text-sm">Çözüm</h4>
                    <p className="text-center font-medium"><EditableText value={data.storyMap?.solution} tag="span" /></p>
                </EditableElement>
            </div>
        </div>
    </div>
);

export const MissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => (
    <div className="relative space-y-8">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        {/* WORD BANK */}
        <EditableElement className="bg-amber-50 dark:bg-amber-900/20 p-6 rounded-2xl border-2 border-dashed border-amber-300 text-center mb-8">
            <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-4 uppercase tracking-widest text-sm flex items-center justify-center gap-2"><i className="fa-solid fa-box-open"></i> Kelime Bankası</h4>
            <div className="flex flex-wrap justify-center gap-3">
                {(data.wordBank || []).map((word, i) => (
                    <span key={i} className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg border border-amber-200 shadow-sm font-bold text-zinc-700 dark:text-zinc-200 cursor-grab active:cursor-grabbing hover:scale-105 transition-transform">
                        <EditableText value={word} tag="span" />
                    </span>
                ))}
            </div>
        </EditableElement>

        {/* CLOZE TEXT */}
        <EditableElement className="bg-white dark:bg-zinc-800 p-8 rounded-3xl shadow-sm border border-zinc-200 dark:border-zinc-700">
            <div className="text-xl leading-loose font-dyslexic text-zinc-800 dark:text-zinc-100">
                {(data.storyWithBlanks || []).map((segment, i) => (
                    <React.Fragment key={i}>
                        <span><EditableText value={segment} tag="span" /></span>
                        {i < (data.storyWithBlanks.length - 1) && (
                            <span className="inline-block w-32 border-b-2 border-indigo-500 mx-2 bg-indigo-50 dark:bg-indigo-900/30 rounded px-2 text-center text-indigo-700 font-bold min-h-[1.5em] align-bottom">
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
    <div className="relative space-y-8">
      <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} data={data} />
      
      {/* TRANSITION WORDS HELPER */}
      <EditableElement className="flex justify-center gap-4 mb-6">
          {(data.transitionWords || []).map((word, i) => (
              <span key={i} className="text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-100 px-3 py-1 rounded-full"><i className="fa-solid fa-link mr-1"></i> {word}</span>
          ))}
      </EditableElement>

      {/* PANELS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data.panels || []).map((panel, idx) => (
          <EditableElement key={panel.id} className="relative bg-white dark:bg-zinc-800 p-4 rounded-2xl shadow-md border-2 border-zinc-200 hover:border-indigo-400 transition-all group break-inside-avoid">
            <div className="absolute -top-3 -left-3 w-10 h-10 bg-zinc-800 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg border-4 border-white dark:border-zinc-900 z-10 group-hover:bg-indigo-600 transition-colors">
                ?
            </div>
            
            <div className="aspect-video w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl mb-4 overflow-hidden border border-zinc-100 relative">
                {panel.imageBase64 ? (
                    <ImageDisplay base64={panel.imageBase64} description={panel.description} className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-300 text-4xl"><i className="fa-regular fa-image"></i></div>
                )}
            </div>
            
            <div className="min-h-[4rem] flex items-center justify-center text-center">
                <p className="text-base font-medium text-zinc-700 dark:text-zinc-200"><EditableText value={panel.description} tag="span" /></p>
            </div>
          </EditableElement>
        ))}
      </div>
      
      {/* ORDERING STRIP */}
      <EditableElement className="mt-8 p-6 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-600">
        <h4 className="text-center font-bold text-zinc-500 mb-4 uppercase tracking-widest text-sm">Doğru Sıralama</h4>
        <div className="flex justify-center items-center gap-2 md:gap-4 overflow-x-auto pb-2">
          {Array.from({ length: (data.panels || []).length }).map((_, index) => (
            <React.Fragment key={index}>
                <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-zinc-300 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <span className="text-4xl font-black text-zinc-200">{index + 1}</span>
                </div>
                {index < ((data.panels || []).length - 1) && <i className="fa-solid fa-arrow-right text-zinc-300 text-xl"></i>}
            </React.Fragment>
          ))}
        </div>
      </EditableElement>
    </div>
);

// Fallbacks for compatibility
export const ProverbFillSheet = MissingPartsSheet as any;
export const ProverbSayingSortSheet = StoryComprehensionSheet as any; // Temporary fallback
export const ProverbWordChainSheet = StorySequencingSheet as any; // Temporary fallback
export const ProverbSentenceFinderSheet = StorySequencingSheet as any;
export const ProverbSearchSheet = WordSearchSheet as any;
