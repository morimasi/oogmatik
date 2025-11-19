
import React from 'react';
import { 
    StoryData, StoryAnalysisData, StoryCreationPromptData, WordsInStoryData, StorySequencingData,
    ProverbFillData, ProverbSayingSortData, ProverbWordChainData, ProverbSentenceFinderData,
    MultipleChoiceStoryQuestion, OpenEndedStoryQuestion, ProverbSearchData
} from '../../types';
import { ImageDisplay, PedagogicalHeader, ReadingRuler } from './common';
import { WordSearchSheet } from './WordGameSheets';

export const StoryComprehensionSheet: React.FC<{ data: StoryData }> = ({ data }) => (
  <div className="relative">
    <ReadingRuler />
    <PedagogicalHeader title={data.title} instruction="Hikayeyi dikkatlice oku ve soruları yanıtla." note={data.pedagogicalNote} />
    
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        {data.imageBase64 && (
            <div className="md:col-span-2">
                <ImageDisplay base64={data.imageBase64} description="Hikaye görseli" className="w-full h-full min-h-[200px] object-cover rounded-lg shadow-md" />
            </div>
        )}
        <div className={`${data.imageBase64 ? 'md:col-span-3' : 'md:col-span-5'} bg-white dark:bg-zinc-700/30 p-8 rounded-xl shadow-inner border border-zinc-100 dark:border-zinc-700`}>
            <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg md:text-xl leading-loose tracking-wide text-zinc-800 dark:text-zinc-200 font-medium text-left" style={{ wordSpacing: '0.1em' }}>
                    {data.story}
                </p>
            </div>
        </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {data.mainIdea && (
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border-l-4 border-indigo-400 shadow-sm">
                <h4 className="font-bold text-sm uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-2"><i className="fa-solid fa-lightbulb mr-2"></i>Ana Fikir</h4>
                <p className="text-sm text-zinc-700 dark:text-zinc-200">{data.mainIdea}</p>
            </div>
        )}
        {data.characters && data.characters.length > 0 && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg border-l-4 border-emerald-400 shadow-sm">
                <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-700 dark:text-emerald-300 mb-2"><i className="fa-solid fa-users mr-2"></i>Karakterler</h4>
                <div className="flex flex-wrap gap-2">
                    {data.characters.map((char, i) => (
                        <span key={i} className="bg-white dark:bg-emerald-900/50 px-2 py-1 rounded text-xs font-semibold">{char}</span>
                    ))}
                </div>
            </div>
        )}
        {data.setting && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border-l-4 border-amber-400 shadow-sm">
                <h4 className="font-bold text-sm uppercase tracking-wider text-amber-700 dark:text-amber-300 mb-2"><i className="fa-solid fa-map-pin mr-2"></i>Mekan</h4>
                <p className="text-sm text-zinc-700 dark:text-zinc-200">{data.setting}</p>
            </div>
        )}
    </div>
    
    <h4 className="text-xl font-bold mb-6 text-center text-zinc-800 dark:text-zinc-200 border-b-2 border-zinc-200 dark:border-zinc-700 pb-2 inline-block px-8 mx-auto w-full">
        <i className="fa-solid fa-circle-question mr-2 text-indigo-500"></i>Sorular
    </h4>
    
    <div className="space-y-6">
        {(data.questions || []).map((q, index) => {
            switch (q.type) {
                case 'multiple-choice':
                    const mcq = q as MultipleChoiceStoryQuestion;
                    return (
                        <div key={index} className="p-5 bg-white dark:bg-zinc-700/50 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm break-inside-avoid">
                            <div className="flex items-start gap-3 mb-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                                <p className="font-semibold text-lg pt-1">{mcq.question}</p>
                            </div>
                            <div className="space-y-3 ml-11">
                                {(mcq.options || []).map((option, optIndex) => (
                                    <div key={optIndex} className="flex items-center group cursor-pointer">
                                        <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-500 rounded-full mr-3 group-hover:border-indigo-500 flex items-center justify-center transition-colors">
                                            <div className="w-3 h-3 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                        </div>
                                        <label className="text-lg cursor-pointer group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{option}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                case 'open-ended':
                    const oeq = q as OpenEndedStoryQuestion;
                    return (
                         <div key={index} className="p-5 bg-white dark:bg-zinc-700/50 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm break-inside-avoid">
                             <div className="flex items-start gap-3 mb-4">
                                <span className="flex-shrink-0 w-8 h-8 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 rounded-full flex items-center justify-center font-bold">{index + 1}</span>
                                <p className="font-semibold text-lg pt-1">{oeq.question}</p>
                            </div>
                            <div className="w-full h-24 mt-2 ml-11 border-2 border-dotted border-zinc-300 dark:border-zinc-600 rounded-lg bg-zinc-50 dark:bg-zinc-800/30"></div>
                        </div>
                    );
                default:
                    return null;
            }
        })}
    </div>
  </div>
);

export const StoryCreationPromptSheet: React.FC<{ data: StoryCreationPromptData }> = ({ data }) => (
    <div className="relative">
        <ReadingRuler />
        <PedagogicalHeader title={data.title} instruction="Kendi hikayeni oluştur!" note={data.pedagogicalNote} />
        
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl mb-8 text-center border border-indigo-100 dark:border-indigo-900/50">
            <p className="text-xl font-medium text-indigo-900 dark:text-indigo-200">{data.prompt}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
                <div className="bg-white dark:bg-zinc-700/30 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
                    <h4 className="font-bold text-center mb-4 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-2">
                        <i className="fa-solid fa-key text-yellow-500"></i> Anahtar Kelimeler
                    </h4>
                    <div className="flex justify-center flex-wrap gap-3">
                        {(data.keywords || []).map((word, index) => (
                            <span key={index} className="px-4 py-2 bg-white border-2 border-indigo-100 dark:border-zinc-600 rounded-full font-bold text-indigo-600 dark:text-indigo-400 shadow-sm hover:scale-105 transition-transform cursor-default">
                                {word}
                            </span>
                        ))}
                    </div>
                </div>
                
                {data.imageBase64 && (
                    <div className="rounded-xl overflow-hidden border-4 border-zinc-100 dark:border-zinc-700 shadow-md">
                        <ImageDisplay base64={data.imageBase64} description="Hikaye İlhamı" className="w-full h-auto object-cover" />
                        <p className="text-center text-xs text-zinc-400 py-2 bg-zinc-50 dark:bg-zinc-800">Bu resim sana ne anlatıyor?</p>
                    </div>
                )}
            </div>
            
            <div className="bg-white dark:bg-zinc-700/30 p-6 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 h-full min-h-[400px]">
                <h4 className="font-bold text-center mb-4 text-zinc-400 uppercase tracking-widest">Hikaye Yazım Alanı</h4>
                <div className="space-y-8">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="border-b-2 border-zinc-200 dark:border-zinc-600 h-8"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const WordsInStorySheet: React.FC<{ data: WordsInStoryData }> = ({ data }) => (
    <div className="relative">
        <ReadingRuler />
        <PedagogicalHeader title={data.title} instruction="Hikayeyi oku ve altı çizili kelimelere dikkat et." note={data.pedagogicalNote} />
        
        <div className="bg-white dark:bg-zinc-700/30 p-8 rounded-xl shadow-inner border border-zinc-100 dark:border-zinc-700 mb-8">
            <p className="text-lg md:text-xl leading-loose tracking-wide whitespace-pre-line font-medium">
                {data.story}
            </p>
        </div>
        
        <h4 className="text-xl font-bold mb-6 text-center text-zinc-800 dark:text-zinc-200 border-b-2 border-zinc-200 dark:border-zinc-700 pb-2">
            <i className="fa-solid fa-pen-nib mr-2 text-emerald-500"></i>Kelime Çalışması
        </h4>
        
        <div className="grid grid-cols-1 gap-6">
            {(data.questions || []).map((item, index) => (
                 <div key={index} className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl border-l-8 border-emerald-400 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                        <span className="px-4 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-full font-bold text-lg">{item.word}</span>
                        <p className="text-zinc-600 dark:text-zinc-300 font-medium">{item.question}</p>
                    </div>
                    <div className="w-full h-16 mt-2 border-b-2 border-dotted border-zinc-300 dark:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/20 rounded-t-lg"></div>
                </div>
            ))}
        </div>
    </div>
);

export const StoryAnalysisSheet: React.FC<{ data: StoryAnalysisData }> = ({ data }) => (
    <div className="relative">
        <ReadingRuler />
        <PedagogicalHeader title={data.title} instruction="Hikayenin derinliklerine inelim." note={data.pedagogicalNote} />
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
            {data.imageBase64 && (
                <div className="md:col-span-2">
                    <ImageDisplay base64={data.imageBase64} description="Hikaye Görseli" className="w-full h-full min-h-[200px] object-cover rounded-xl shadow-md" />
                </div>
            )}
            <div className={`${data.imageBase64 ? 'md:col-span-3' : 'md:col-span-5'} bg-white dark:bg-zinc-700/30 p-6 rounded-xl shadow-inner`}>
                <p className="text-lg leading-relaxed tracking-wide">{data.story}</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(data.analysisQuestions || []).map((q, index) => {
                const colors = {
                    'tema': 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300',
                    'karakter': 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
                    'sebep-sonuç': 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300',
                    'çıkarım': 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300'
                };
                const typeKey = q.type as keyof typeof colors;
                const colorClass = colors[typeKey] || colors['tema'];
                
                return (
                    <div key={index} className={`p-5 rounded-xl border-l-8 shadow-sm break-inside-avoid ${colorClass.split(' ')[0]} bg-white dark:bg-zinc-800`}>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold mb-2 uppercase tracking-wider ${colorClass}`}>{q.type}</span>
                        <p className="font-bold text-lg mb-3 text-zinc-800 dark:text-zinc-200">{q.question}</p>
                        <div className="w-full h-20 border-2 border-dotted border-zinc-300 dark:border-zinc-600 rounded-lg"></div>
                    </div>
                )
            })}
        </div>
    </div>
);

export const ProverbFillSheet: React.FC<{ data: ProverbFillData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction="Atasözlerindeki eksik kelimeleri tamamla." note={data.pedagogicalNote} />
        
        <div className="bg-white dark:bg-zinc-700/30 p-6 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 mb-8 max-w-3xl mx-auto">
            <div className="space-y-6">
                {(data.proverbs || []).map((proverb, index) => (
                    <div key={index} className="flex flex-wrap items-end text-xl font-medium leading-loose gap-2">
                        <span className="text-indigo-500 font-bold w-6">{index + 1}.</span>
                        <span>{proverb.start}</span>
                        <div className="min-w-[120px] border-b-2 border-indigo-500 border-dashed px-2 text-center text-indigo-600 dark:text-indigo-400"></div>
                        <span>{proverb.end}</span>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-blue-50 dark:bg-blue-900/30 rounded-xl border-l-4 border-blue-500">
                <h4 className="font-bold text-lg text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-info-circle"></i> Bilgi Notu
                </h4>
                <p className="text-zinc-700 dark:text-zinc-300 italic">{data.meaning}</p>
            </div>
            <div className="p-6 bg-white dark:bg-zinc-700/50 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                    <i className="fa-solid fa-pen-fancy text-zinc-400"></i> Yazma Zamanı
                </h4>
                <p className="text-sm mb-3 text-zinc-600 dark:text-zinc-400">{data.usagePrompt}</p>
                <div className="w-full h-24 border-2 border-dotted border-zinc-300 dark:border-zinc-600 rounded-lg"></div>
            </div>
        </div>
    </div>
);

export const StorySequencingSheet: React.FC<{ data: StorySequencingData }> = ({ data }) => (
    <div>
      <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {(data.panels || []).map((panel) => (
          <div key={panel.id} className="relative bg-black p-2 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300">
            {/* Film Strip Holes */}
            <div className="flex justify-between px-1 mb-1">
                {Array.from({length: 6}).map((_, i) => <div key={i} className="w-2 h-3 bg-white rounded-sm"></div>)}
            </div>
            
            <div className="bg-white dark:bg-zinc-800 p-2 rounded h-full flex flex-col">
                <div className="absolute top-0 left-0 bg-red-600 text-white font-bold w-8 h-8 flex items-center justify-center rounded-tl-lg rounded-br-lg shadow z-10">
                    {panel.id}
                </div>
                <div className="aspect-square w-full overflow-hidden rounded mb-3 bg-zinc-100 dark:bg-zinc-900">
                    <ImageDisplay base64={panel.imageBase64} description={panel.description} className="w-full h-full object-cover" />
                </div>
                <p className="text-sm text-center font-medium text-zinc-800 dark:text-zinc-200 mt-auto">{panel.description}</p>
            </div>

            <div className="flex justify-between px-1 mt-1">
                {Array.from({length: 6}).map((_, i) => <div key={i} className="w-2 h-3 bg-white rounded-sm"></div>)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-600 text-center">
        <h4 className="text-lg font-bold text-zinc-600 dark:text-zinc-400 mb-4">Doğru Sıralamayı Buraya Yaz</h4>
        <div className="flex justify-center items-center gap-4 flex-wrap">
          {Array.from({ length: (data.panels || []).length || 4 }).map((_, index) => (
            <React.Fragment key={index}>
                <div className="w-16 h-16 border-2 border-zinc-400 rounded-xl bg-white dark:bg-zinc-700 flex items-center justify-center text-2xl font-bold shadow-inner">
                    <span className="text-zinc-300 dark:text-zinc-600 text-sm absolute mb-8">{index + 1}.</span>
                </div>
                {index < ((data.panels || []).length - 1) && <i className="fa-solid fa-arrow-right text-zinc-400"></i>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
);

export const ProverbSayingSortSheet: React.FC<{ data: ProverbSayingSortData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} />
        
        <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800/50 rounded-2xl mb-8 text-center shadow-sm">
            <div className="flex flex-wrap justify-center gap-3">
            {(data.items || []).map((item, index) => (
                <div key={index} className="px-4 py-2 bg-white dark:bg-zinc-800 rounded-lg border border-amber-100 dark:border-zinc-700 shadow-sm text-zinc-800 dark:text-zinc-200">
                    <span className="font-bold text-amber-500 mr-2">{index+1}.</span>
                    {item.text}
                </div>
            ))}
            </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
            <div className="p-6 border-4 border-sky-200 dark:border-sky-900 rounded-2xl bg-sky-50 dark:bg-sky-900/10">
                <h4 className="font-bold text-center text-xl text-sky-700 dark:text-sky-300 mb-4 uppercase tracking-widest border-b-2 border-sky-200 pb-2">
                    <i className="fa-solid fa-quote-left mr-2"></i>Atasözleri
                </h4>
                <div className="space-y-3">
                    {Array.from({length: 5}).map((_, i) => (
                         <div key={i} className="h-10 border-b-2 border-sky-300/50 dark:border-sky-700/50"></div>
                    ))}
                </div>
            </div>
            <div className="p-6 border-4 border-rose-200 dark:border-rose-900 rounded-2xl bg-rose-50 dark:bg-rose-900/10">
                <h4 className="font-bold text-center text-xl text-rose-700 dark:text-rose-300 mb-4 uppercase tracking-widest border-b-2 border-rose-200 pb-2">
                    <i className="fa-solid fa-comment-dots mr-2"></i>Özdeyişler
                </h4>
                <div className="space-y-3">
                    {Array.from({length: 5}).map((_, i) => (
                         <div key={i} className="h-10 border-b-2 border-rose-300/50 dark:border-rose-700/50"></div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

export const ProverbWordChainSheet: React.FC<{ data: ProverbWordChainData | ProverbSentenceFinderData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction={data.prompt} note={data.pedagogicalNote} />
        
        <div className="p-8 mb-8 border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 text-center">
            <div className="flex justify-center flex-wrap gap-4">
                {(data.wordCloud || []).map((item, index) => (
                    <span 
                        key={index} 
                        className="px-4 py-2 rounded-full text-lg font-bold shadow-sm transform hover:scale-110 transition-transform cursor-grab active:cursor-grabbing" 
                        style={{backgroundColor: item.color, color: '#fff', textShadow: '1px 1px 2px rgba(0,0,0,0.3)'}}
                    >
                        {item.word}
                    </span>
                ))}
            </div>
        </div>

        <div className="space-y-6">
             <h4 className="font-bold text-center text-zinc-500 uppercase text-sm tracking-widest">Oluşturulacak Cümleler</h4>
             {(data.solutions || []).map((_, index) => (
                <div key={index} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-zinc-200 dark:bg-zinc-700 rounded-full flex items-center justify-center font-bold text-zinc-500">{index + 1}</div>
                    <div className="flex-1 h-12 bg-white dark:bg-zinc-800 border-b-2 border-zinc-300 dark:border-zinc-600 rounded-t-lg shadow-sm"></div>
                </div>
            ))}
        </div>
    </div>
);

export const ProverbSearchSheet: React.FC<{ data: ProverbSearchData }> = ({ data }) => (
    <div>
        <PedagogicalHeader title={data.title} instruction="Gizli atasözünü bul ve anlamını öğren." note={data.pedagogicalNote} />
        <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1 w-full">
                <WordSearchSheet data={{...data, words: [], title: '', prompt: ''} as any} />
            </div>
            <div className="w-full md:w-1/3 p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border-l-8 border-indigo-500 shadow-lg">
                <h4 className="font-bold text-lg uppercase tracking-wider text-indigo-800 dark:text-indigo-200 mb-4 border-b border-indigo-200 pb-2">
                    <i className="fa-solid fa-book-open mr-2"></i>Sözlük
                </h4>
                <div className="mb-4">
                    <span className="text-xs font-bold text-indigo-400 uppercase">Atasözü:</span>
                    <p className="text-lg font-bold text-indigo-900 dark:text-indigo-100">{data.proverb}</p>
                </div>
                <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase">Anlamı:</span>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300 italic leading-relaxed">{data.meaning}</p>
                </div>
            </div>
        </div>
    </div>
);
