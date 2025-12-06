
import React from 'react';
import { 
    StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData,
    ProverbFillData, ProverbSayingSortData, ProverbWordChainData, MissingPartsData,
    MultipleChoiceStoryQuestion, OpenEndedStoryQuestion, TrueFalseQuestion, ProverbSearchData
} from '../../types';
import { ImageDisplay, PedagogicalHeader, ReadingRuler } from './common';
import { WordSearchSheet } from './WordGameSheets';
import { EditableElement, EditableText } from '../Editable';

// --- STYLING CONSTANTS (Professional Layout) ---
const SECTION_HEADER_CLASS = "text-lg font-black text-zinc-800 border-b-4 border-zinc-200 pb-2 mb-6 flex items-center gap-3 uppercase tracking-wider";
const QUESTION_CARD_CLASS = "bg-white p-5 rounded-2xl border-2 border-zinc-100 shadow-sm break-inside-avoid relative overflow-hidden";
const NUMBER_BADGE_CLASS = "absolute top-0 left-0 bg-zinc-100 text-zinc-500 font-bold px-3 py-1 rounded-br-xl text-xs border-r border-b border-zinc-200";

export const StoryComprehensionSheet: React.FC<{ data: StoryData }> = ({ data }) => (
  <div className="relative space-y-8 text-zinc-900 h-full">
    <ReadingRuler />
    
    {/* Header */}
    <PedagogicalHeader title={data.title} instruction="Hikayeyi dikkatlice oku, önemli yerlerin altını çiz ve soruları cevapla." note={data.pedagogicalNote} data={data} />
    
    <div className="flex flex-col gap-8">
        {/* READING SECTION - NEWSPAPER STYLE */}
        <EditableElement className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-lg relative overflow-hidden group">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-bl-full -z-0"></div>
            
            <div className="flex gap-6 relative z-10">
                {/* Line Numbers */}
                <div className="hidden md:flex flex-col text-right text-xs text-zinc-300 font-mono select-none pt-1 gap-1 leading-loose">
                    {Array.from({length: 15}).map((_, i) => <span key={i}>{(i+1) * 5}</span>)}
                </div>
                
                {/* Text Content */}
                <div className="prose max-w-none text-lg leading-loose font-dyslexic text-zinc-800 text-justify">
                    <EditableText value={data.story} tag="p" />
                </div>
            </div>
        </EditableElement>

        {/* STORY MAP (ANALYSIS GRID) - NEW FEATURE */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 break-inside-avoid">
            {[
                { icon: 'fa-user-astronaut', title: 'Kahramanlar', hint: 'Kimler var?' },
                { icon: 'fa-location-dot', title: 'Yer ve Zaman', hint: 'Nerede, Ne zaman?' },
                { icon: 'fa-puzzle-piece', title: 'Olay / Sorun', hint: 'Ne oldu?' }
            ].map((box, i) => (
                <EditableElement key={i} className="bg-zinc-50 border-2 border-dashed border-zinc-300 rounded-xl p-4 min-h-[140px] flex flex-col items-center text-center">
                    <div className="text-zinc-400 mb-2 text-xl"><i className={`fa-solid ${box.icon}`}></i></div>
                    <h4 className="font-bold text-sm uppercase text-zinc-600 mb-1"><EditableText value={box.title} tag="span" /></h4>
                    <p className="text-[10px] text-zinc-400 mb-4"><EditableText value={`(${box.hint})`} tag="span" /></p>
                    {/* Writing Lines */}
                    <div className="w-full space-y-3 mt-auto">
                        <div className="border-b border-zinc-300 w-full h-1"></div>
                        <div className="border-b border-zinc-300 w-full h-1"></div>
                    </div>
                </EditableElement>
            ))}
        </div>
    
        {/* QUESTIONS SECTION */}
        <div>
            <h4 className={SECTION_HEADER_CLASS}><i className="fa-solid fa-circle-question text-indigo-500"></i> Sorular ve Cevaplar</h4>
            
            <div className="space-y-6">
                {(data.questions || []).map((q, index) => {
                    if (q.type === 'multiple-choice') {
                        const mcq = q as MultipleChoiceStoryQuestion;
                        return (
                            <EditableElement key={index} className={QUESTION_CARD_CLASS}>
                                <span className={NUMBER_BADGE_CLASS}>{index + 1}</span>
                                <div className="ml-4 mt-2">
                                    <p className="font-bold text-lg mb-4 text-zinc-800"><EditableText value={mcq.question} tag="span" /></p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {mcq.options.map((opt, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border-2 border-transparent hover:border-indigo-100 hover:bg-indigo-50 cursor-pointer transition-all group">
                                                <div className="w-6 h-6 rounded-full border-2 border-zinc-300 flex items-center justify-center text-xs font-bold text-zinc-400 group-hover:border-indigo-500 group-hover:text-indigo-600 bg-white">
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <span className="text-base font-medium text-zinc-700 group-hover:text-indigo-900"><EditableText value={opt} tag="span" /></span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </EditableElement>
                        );
                    } else if (q.type === 'true-false') {
                        const tf = q as TrueFalseQuestion;
                        return (
                            <EditableElement key={index} className={QUESTION_CARD_CLASS}>
                                <span className={NUMBER_BADGE_CLASS}>{index + 1}</span>
                                <div className="ml-4 mt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <p className="font-bold text-lg text-zinc-800"><EditableText value={tf.statement} tag="span" /></p>
                                    <div className="flex gap-2 shrink-0">
                                        <div className="px-6 py-2 border-2 border-green-200 bg-green-50 rounded-lg text-green-700 font-bold cursor-pointer hover:bg-green-100">DOĞRU</div>
                                        <div className="px-6 py-2 border-2 border-red-200 bg-red-50 rounded-lg text-red-700 font-bold cursor-pointer hover:bg-red-100">YANLIŞ</div>
                                    </div>
                                </div>
                            </EditableElement>
                        );
                    } else {
                        const oeq = q as OpenEndedStoryQuestion;
                        return (
                            <EditableElement key={index} className={QUESTION_CARD_CLASS}>
                                <span className={NUMBER_BADGE_CLASS}>{index + 1}</span>
                                <div className="ml-4 mt-2">
                                    <p className="font-bold text-lg mb-4 text-zinc-800"><EditableText value={oeq.question} tag="span" /></p>
                                    <div className="space-y-4 pl-2 border-l-4 border-zinc-100">
                                        {Array.from({length: 3}).map((_, l) => (
                                            <div key={l} className="w-full border-b border-zinc-300 border-dashed h-6"></div>
                                        ))}
                                    </div>
                                </div>
                            </EditableElement>
                        );
                    }
                })}
            </div>
        </div>
    </div>
  </div>
);

export const StoryCreationPromptSheet: React.FC<{ data: StoryCreationPromptData }> = ({ data }) => (
    <div className="relative space-y-8 text-zinc-900">
        <ReadingRuler />
        <PedagogicalHeader title={data.title} instruction="Hayal gücünü kullan ve kendi hikayeni yaz!" note={data.pedagogicalNote} data={data} />
        
        {/* PROMPT BOX - CREATIVE CARD */}
        <EditableElement className="bg-gradient-to-r from-indigo-50 to-purple-50 p-8 rounded-3xl border border-indigo-100 text-center shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-50 rounded-full blur-xl"></div>
            <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-indigo-400">Yazma Konusu</h3>
            <p className="text-3xl font-black font-dyslexic text-indigo-900"><EditableText value={data.prompt} tag="span" /></p>
        </EditableElement>

        {/* SCAFFOLDING GRID (5N 1K) - Sticky Notes Style */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Kim?', val: data.structureHints?.who, icon: 'fa-user', color: 'bg-yellow-50 border-yellow-200 text-yellow-800' },
                { label: 'Nerede?', val: data.structureHints?.where, icon: 'fa-map-location-dot', color: 'bg-green-50 border-green-200 text-green-800' },
                { label: 'Ne Zaman?', val: data.structureHints?.when, icon: 'fa-clock', color: 'bg-blue-50 border-blue-200 text-blue-800' },
                { label: 'Sorun Ne?', val: data.structureHints?.problem, icon: 'fa-triangle-exclamation', color: 'bg-red-50 border-red-200 text-red-800' }
            ].map((hint, i) => (
                <EditableElement key={i} className={`${hint.color} p-4 rounded-xl border-2 shadow-sm transform hover:-translate-y-1 transition-transform`}>
                    <div className="flex items-center gap-2 mb-2 text-xs font-black tracking-widest opacity-70">
                        <i className={`fa-solid ${hint.icon}`}></i> {hint.label}
                    </div>
                    <div className="text-lg font-bold min-h-[1.5rem] leading-tight">
                        <EditableText value={hint.val || '...'} tag="span" />
                    </div>
                </EditableElement>
            ))}
        </div>

        {/* KEYWORDS */}
        <EditableElement className="flex flex-wrap justify-center gap-3 p-6 bg-white rounded-2xl border-2 border-dashed border-zinc-300">
            <span className="w-full text-center text-xs font-bold text-zinc-400 uppercase mb-2">Bu Kelimeleri Kullan</span>
            {(data.keywords || []).map((word, index) => (
                <span key={index} className="px-4 py-2 bg-zinc-100 rounded-lg font-bold text-zinc-700 shadow-sm border border-zinc-200 text-sm">
                    <EditableText value={word} tag="span" />
                </span>
            ))}
        </EditableElement>
            
        {/* WRITING AREA - NOTEBOOK STYLE */}
        <EditableElement className="bg-white p-8 rounded-2xl shadow-lg min-h-[600px] relative border border-zinc-200 notebook-paper">
            {/* Red Margin Line */}
            <div className="absolute top-0 left-12 h-full border-l-2 border-red-200/50"></div>
            
            <h4 className="font-bold text-center text-zinc-400 uppercase tracking-widest mb-8">Hikaye Taslağı</h4>
            <div className="space-y-10 pl-14">
                {Array.from({ length: 14 }).map((_, i) => (
                    <div key={i} className="border-b border-zinc-200 h-8 w-full relative group">
                        <div className="absolute bottom-0 left-0 w-2 h-2 rounded-full bg-zinc-100 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                ))}
            </div>
        </EditableElement>
    </div>
);

export const WordsInStorySheet: React.FC<{ data: WordsInStoryData }> = ({ data }) => (
    <div className="relative space-y-8 text-zinc-900">
        <ReadingRuler />
        <PedagogicalHeader title={data.title} instruction="Metni oku, koyu yazılan kelimelerin anlamına dedektif gibi karar ver." note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="bg-white p-10 rounded-3xl border-2 border-zinc-100 shadow-xl leading-loose text-xl font-dyslexic text-zinc-800 relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-400 to-purple-400"></div>
            <EditableText value={data.story} tag="p" />
        </EditableElement>
        
        <div className="space-y-6">
            <h4 className={SECTION_HEADER_CLASS}><i className="fa-solid fa-magnifying-glass"></i> Kelime Dedektifi</h4>
            
            <div className="dynamic-grid">
                {(data.vocabWork || []).map((item, index) => (
                     <EditableElement key={index} className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm break-inside-avoid hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4 mb-4 border-b border-zinc-100 pb-4">
                            <div className="w-12 h-12 bg-zinc-900 text-white rounded-xl flex items-center justify-center text-xl font-black shadow-lg transform rotate-3">
                                {index + 1}
                            </div>
                            <span className="text-2xl font-black text-zinc-800 tracking-wide capitalize"><EditableText value={item.word} tag="span" /></span>
                        </div>
                        
                        <p className="text-zinc-600 font-medium mb-6 italic bg-zinc-50 p-3 rounded-lg"><EditableText value={item.contextQuestion} tag="span" /></p>
                        
                        <div className="bg-white p-4 rounded-xl border-2 border-dashed border-zinc-300 h-28 relative">
                            <span className="absolute top-2 left-2 text-[10px] text-zinc-400 font-bold uppercase">Senin Tahminin</span>
                            <EditableText value="" tag="div" className="w-full h-full mt-4" placeholder="Buraya yaz..." />
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                            <div className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full border border-indigo-100">
                                {item.type === 'meaning' ? 'Anlam Tahmini' : item.type === 'synonym' ? 'Eş Anlamlısı' : 'Zıt Anlamlısı'}
                            </div>
                        </div>
                    </EditableElement>
                ))}
            </div>
        </div>
    </div>
);

export const StoryAnalysisSheet: React.FC<{ data: StoryAnalysisData }> = ({ data }) => (
    <div className="relative space-y-8 text-zinc-900">
        <PedagogicalHeader title={data.title} instruction="Hikayenin unsurlarını analiz et ve haritayı doldur." note={data.pedagogicalNote} data={data} />
        
        <EditableElement className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100 text-base leading-relaxed max-h-60 overflow-y-auto custom-scrollbar mb-8 italic text-zinc-700">
            <EditableText value={data.story} tag="p" />
        </EditableElement>
        
        {/* STORY MAP VISUALIZATION - MIND MAP STYLE */}
        <div className="relative bg-white p-8 rounded-3xl border border-zinc-200 shadow-xl min-h-[500px]">
            {/* Central Theme Bubble */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-zinc-900 text-white rounded-full flex flex-col items-center justify-center text-center p-4 z-20 shadow-2xl ring-8 ring-zinc-100">
                <span className="text-xs font-bold text-zinc-400 uppercase mb-1">HİKAYENİN</span>
                <span className="text-xl font-black">ANA FİKRİ</span>
                <div className="w-20 border-b border-zinc-500 mt-2 mb-2"></div>
                <EditableText value="(Buraya Yaz)" tag="span" className="text-[10px] text-zinc-400" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-12 relative z-10 h-full">
                {/* Connecting Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none -z-10 hidden md:block">
                    <line x1="50%" y1="50%" x2="20%" y2="20%" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="50%" y1="50%" x2="80%" y2="20%" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="50%" y1="50%" x2="20%" y2="80%" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="5,5" />
                    <line x1="50%" y1="50%" x2="80%" y2="80%" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="5,5" />
                </svg>

                {[
                    { title: 'Karakterler', icon: 'fa-users', color: 'text-blue-500', bg: 'bg-blue-50 border-blue-100' },
                    { title: 'Yer / Zaman', icon: 'fa-map-location-dot', color: 'text-emerald-500', bg: 'bg-emerald-50 border-emerald-100' },
                    { title: 'Sorun (Çatışma)', icon: 'fa-triangle-exclamation', color: 'text-rose-500', bg: 'bg-rose-50 border-rose-100' },
                    { title: 'Çözüm', icon: 'fa-wand-magic-sparkles', color: 'text-purple-500', bg: 'bg-purple-50 border-purple-100' },
                ].map((item, i) => (
                    <EditableElement key={i} className={`p-6 rounded-2xl border-2 ${item.bg} relative shadow-sm min-h-[140px] flex flex-col`}>
                        <div className={`absolute -top-4 -left-4 w-10 h-10 bg-white rounded-full flex items-center justify-center border-2 border-zinc-100 shadow-sm ${item.color} text-xl`}>
                            <i className={`fa-solid ${item.icon}`}></i>
                        </div>
                        <h4 className="text-center font-bold text-zinc-800 mb-3 mt-1 uppercase text-xs tracking-widest">{item.title}</h4>
                        <div className="flex-1 border-b border-zinc-400/20 border-dashed mt-2"><EditableText value="" tag="div" className="w-full h-full" placeholder="..." /></div>
                        <div className="flex-1 border-b border-zinc-400/20 border-dashed mt-4"></div>
                    </EditableElement>
                ))}
            </div>
        </div>
    </div>
);

export const MissingPartsSheet: React.FC<{ data: MissingPartsData }> = ({ data }) => (
    <div className="relative space-y-8 text-zinc-900">
        <PedagogicalHeader title={data.title} instruction={data.instruction} note={data.pedagogicalNote} data={data} />
        
        {/* WORD BANK - TAG STYLE */}
        <EditableElement className="bg-zinc-100 p-6 rounded-2xl border border-zinc-200 text-center mb-8">
            <h4 className="font-bold text-zinc-500 mb-4 uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                <i className="fa-solid fa-box-open"></i> Kullanılacak Kelimeler
            </h4>
            <div className="flex flex-wrap justify-center gap-3">
                {(data.wordBank || []).map((word, i) => (
                    <span key={i} className="px-4 py-2 bg-white rounded-lg border border-zinc-300 font-bold text-zinc-700 shadow-sm hover:-translate-y-0.5 transition-transform cursor-grab active:cursor-grabbing">
                        <EditableText value={word} tag="span" />
                    </span>
                ))}
            </div>
        </EditableElement>

        {/* CLOZE TEXT - CLEAN LAYOUT */}
        <EditableElement className="bg-white p-10 rounded-3xl border border-zinc-200 shadow-lg">
            <div className="text-xl leading-[3rem] font-dyslexic text-zinc-800 text-justify">
                {(data.storyWithBlanks || []).map((segment, i) => (
                    <React.Fragment key={i}>
                        <span><EditableText value={segment} tag="span" /></span>
                        {i < (data.storyWithBlanks.length - 1) && (
                            <span className="inline-block w-32 border-b-2 border-indigo-300 mx-2 bg-indigo-50/50 rounded px-2 text-center text-indigo-700 font-bold min-h-[1.5em] align-baseline transition-colors hover:bg-indigo-100">
                                {/* Blank Space */}
                                <EditableText value="" tag="span" />
                            </span>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </EditableElement>
    </div>
);

export const StorySequencingSheet: React.FC<{ data: StorySequencingData }> = ({ data }) => (
    <div className="relative space-y-8 text-zinc-900">
      <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} data={data} />
      
      {/* TRANSITION WORDS HELPER */}
      <EditableElement className="flex justify-center gap-4 mb-6 flex-wrap">
          {(data.transitionWords || []).map((word, i) => (
              <span key={i} className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-full"><i className="fa-solid fa-link mr-1"></i> <EditableText value={word} tag="span" /></span>
          ))}
      </EditableElement>

      {/* PANELS GRID - FILM STRIP STYLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {(data.panels || []).map((panel, idx) => (
          <EditableElement key={panel.id} className="relative bg-white p-3 pb-6 rounded-sm border-x-4 border-black shadow-md break-inside-avoid film-strip-frame">
            {/* Film Holes Effect (CSS) */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-black flex justify-between px-2 items-center opacity-80">
                 {Array.from({length:6}).map((_,k) => <div key={k} className="w-2 h-3 bg-white rounded-sm"></div>)}
            </div>
            
            <div className="mt-6 aspect-video w-full bg-zinc-100 mb-4 overflow-hidden border border-zinc-300 relative group">
                <ImageDisplay 
                    base64={panel.imageBase64} 
                    prompt={panel.imagePrompt}
                    description={panel.description} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                />
                
                {/* Number Circle Placeholder */}
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center border border-zinc-200 shadow-sm text-zinc-400 font-bold"><EditableText value="?" tag="span" /></div>
            </div>
            
            <div className="min-h-[4rem] flex items-center justify-center text-center px-2">
                <p className="text-sm font-medium text-zinc-700 leading-snug"><EditableText value={panel.description} tag="span" /></p>
            </div>

            <div className="absolute bottom-0 left-0 right-0 h-4 bg-black flex justify-between px-2 items-center opacity-80">
                 {Array.from({length:6}).map((_,k) => <div key={k} className="w-2 h-3 bg-white rounded-sm"></div>)}
            </div>
          </EditableElement>
        ))}
      </div>
      
      {/* ORDERING STRIP - TIMELINE */}
      <EditableElement className="mt-8 p-8 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-300">
        <h4 className="text-center font-bold text-zinc-400 mb-6 uppercase tracking-widest text-xs">Doğru Sıralama</h4>
        <div className="flex justify-center items-center gap-2 md:gap-4 overflow-x-auto pb-4">
          {Array.from({ length: (data.panels || []).length }).map((_, index) => (
            <React.Fragment key={index}>
                <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-zinc-300 bg-white rounded-xl flex items-center justify-center shadow-inner relative">
                    <span className="text-4xl font-black text-zinc-100 select-none absolute inset-0 flex items-center justify-center">{index + 1}</span>
                    {/* Add editable space for answer */}
                    <div className="absolute inset-0 flex items-center justify-center z-10 text-2xl font-bold"><EditableText value="" tag="span" /></div>
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
export const ProverbSayingSortSheet = StoryComprehensionSheet as any; 
export const ProverbWordChainSheet = StorySequencingSheet as any; 
export const ProverbSentenceFinderSheet = StorySequencingSheet as any;
export const ProverbSearchSheet = WordSearchSheet as any;
